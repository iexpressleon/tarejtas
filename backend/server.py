from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Cookie
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import httpx
import re
from passlib.context import CryptContext

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============ MODELS ============

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    password_hash: Optional[str] = None  # For password-based auth
    picture: Optional[str] = None
    plan: str = "trial"  # trial, paid, expired
    role: str = "user"  # user, admin
    license_key: str = Field(default_factory=lambda: str(uuid.uuid4()))
    trial_ends_at: Optional[str] = None  # ISO datetime
    subscription_ends_at: Optional[str] = None  # ISO datetime
    is_active: bool = True
    payment_notified: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SessionData(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str] = None
    session_token: str

class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Tarjeta(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    usuario_id: str
    slug: str
    nombre: str
    descripcion: Optional[str] = ""
    color_tema: str = "#6366f1"
    telefono: Optional[str] = ""  # Phone number for calling
    whatsapp: Optional[str] = ""
    email: Optional[str] = ""
    foto_url: Optional[str] = ""
    foto_forma: Optional[str] = "circular"  # 'circular' or 'rectangular'
    qr_url: Optional[str] = ""
    archivo_negocio: Optional[str] = ""  # PDF or JPG in base64
    archivo_negocio_tipo: Optional[str] = ""  # 'pdf' or 'jpg'
    archivo_negocio_nombre: Optional[str] = ""
    archivo_negocio_titulo: Optional[str] = ""  # Custom button title
    plantilla_id: int = 1
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TarjetaCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = ""
    color_tema: Optional[str] = "#6366f1"
    telefono: Optional[str] = ""
    whatsapp: Optional[str] = ""
    email: Optional[str] = ""
    foto_url: Optional[str] = ""
    archivo_negocio: Optional[str] = ""
    archivo_negocio_tipo: Optional[str] = ""
    archivo_negocio_nombre: Optional[str] = ""
    archivo_negocio_titulo: Optional[str] = ""
    plantilla_id: Optional[int] = 1

class TarjetaUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    color_tema: Optional[str] = None
    telefono: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    foto_url: Optional[str] = None
    archivo_negocio: Optional[str] = None
    archivo_negocio_tipo: Optional[str] = None
    archivo_negocio_nombre: Optional[str] = None
    archivo_negocio_titulo: Optional[str] = None
    plantilla_id: Optional[int] = None

class Enlace(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tarjeta_id: str
    titulo: str
    url: str
    orden: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EnlaceCreate(BaseModel):
    titulo: str
    url: str
    orden: Optional[int] = 0

class EnlaceUpdate(BaseModel):
    titulo: Optional[str] = None
    url: Optional[str] = None
    orden: Optional[int] = None

# ============ AUTH HELPERS ============

async def get_current_user(request: Request) -> Optional[User]:
    """Get user from session_token (cookie or Authorization header)"""
    session_token = request.cookies.get("session_token")
    
    if not session_token:
        auth_header = request.headers.get("authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.replace("Bearer ", "")
    
    if not session_token:
        return None
    
    # Find valid session
    session = await db.user_sessions.find_one({
        "session_token": session_token,
        "expires_at": {"$gt": datetime.now(timezone.utc).isoformat()}
    })
    
    if not session:
        return None
    
    # Find user
    user_doc = await db.users.find_one({"id": session["user_id"]}, {"_id": 0})
    if not user_doc:
        return None
    
    # Convert ISO string back to datetime if needed
    if isinstance(user_doc.get('created_at'), str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc)

async def require_auth(request: Request) -> User:
    """Require authentication, raise 401 if not authenticated"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account disabled. Please contact support.")
    
    # Check license expiration
    now = datetime.now(timezone.utc)
    
    if user.plan == "trial" and user.trial_ends_at:
        trial_end = datetime.fromisoformat(user.trial_ends_at)
        if now > trial_end:
            # Trial expired - disable user and notify
            await db.users.update_one(
                {"id": user.id},
                {"$set": {"is_active": False, "plan": "expired"}}
            )
            raise HTTPException(status_code=403, detail="Trial period expired. Please subscribe to continue.")
    
    elif user.plan == "paid" and user.subscription_ends_at:
        sub_end = datetime.fromisoformat(user.subscription_ends_at)
        if now > sub_end:
            # Subscription expired
            await db.users.update_one(
                {"id": user.id},
                {"$set": {"is_active": False, "plan": "expired"}}
            )
            raise HTTPException(status_code=403, detail="Subscription expired. Please renew to continue.")
    
    return user

async def require_admin(request: Request) -> User:
    """Require admin role"""
    user = await require_auth(request)
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

def generate_slug(nombre: str) -> str:
    """Generate URL-safe slug from name"""
    slug = nombre.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return slug

# ============ AUTH ENDPOINTS ============

@api_router.post("/auth/register")
async def register(user_input: UserRegister, response: Response):
    """Register new user with email and password"""
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_input.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Validate password length
    if len(user_input.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    # Create new user with trial period (1 month)
    user_id = str(uuid.uuid4())
    password_hash = pwd_context.hash(user_input.password)
    trial_ends = datetime.now(timezone.utc) + timedelta(days=30)
    
    user_data = {
        "id": user_id,
        "email": user_input.email,
        "name": user_input.name,
        "password_hash": password_hash,
        "picture": "",
        "plan": "trial",
        "role": "user",
        "license_key": str(uuid.uuid4()),
        "trial_ends_at": trial_ends.isoformat(),
        "subscription_ends_at": None,
        "is_active": True,
        "payment_notified": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_data)
    
    # Create default tarjeta for new user
    slug = generate_slug(user_input.name)
    existing_slug = await db.tarjetas.find_one({"slug": slug})
    if existing_slug:
        slug = f"{slug}-{str(uuid.uuid4())[:8]}"
    
    tarjeta_data = {
        "id": str(uuid.uuid4()),
        "usuario_id": user_id,
        "slug": slug,
        "nombre": user_input.name,
        "descripcion": "",
        "color_tema": "#6366f1",
        "whatsapp": "",
        "email": user_input.email,
        "foto_url": "",
        "qr_url": "",
        "archivo_negocio": "",
        "archivo_negocio_tipo": "",
        "archivo_negocio_nombre": "",
        "archivo_negocio_titulo": "",
        "plantilla_id": 1,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.tarjetas.insert_one(tarjeta_data)
    
    # Create session
    session_token = str(uuid.uuid4())
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    
    # Set httpOnly cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    
    return {"success": True, "user_id": user_id, "message": "Registration successful"}

@api_router.post("/auth/login")
async def login(user_input: UserLogin, response: Response):
    """Login user with email and password"""
    # Find user
    user = await db.users.find_one({"email": user_input.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Check if user has password (not OAuth user)
    if not user.get("password_hash"):
        raise HTTPException(status_code=400, detail="This account uses Google login")
    
    # Verify password
    if not pwd_context.verify(user_input.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create session
    session_token = str(uuid.uuid4())
    session_doc = {
        "user_id": user["id"],
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    
    # Set httpOnly cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    
    return {"success": True, "user_id": user["id"], "message": "Login successful"}

@api_router.get("/auth/me")
async def get_me(request: Request):
    """Get current user info"""
    user = await require_auth(request)
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout user"""
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"success": True}

# ============ ADMIN ENDPOINTS ============

@api_router.get("/admin/users")
async def get_all_users(request: Request):
    """Get all users (admin only)"""
    await require_admin(request)
    
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    
    # Convert dates
    for user in users:
        if isinstance(user.get('created_at'), str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
    
    return users

@api_router.put("/admin/users/{user_id}/toggle-active")
async def toggle_user_active(user_id: str, request: Request):
    """Enable/disable user account"""
    await require_admin(request)
    
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_status = not user.get("is_active", True)
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"is_active": new_status}}
    )
    
    return {"success": True, "is_active": new_status}

@api_router.put("/admin/users/{user_id}/extend-subscription")
async def extend_subscription(user_id: str, request: Request):
    """Extend user subscription by 1 year"""
    await require_admin(request)
    
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Calculate new expiration date (1 year from now)
    new_expiration = datetime.now(timezone.utc) + timedelta(days=365)
    
    await db.users.update_one(
        {"id": user_id},
        {"$set": {
            "plan": "paid",
            "subscription_ends_at": new_expiration.isoformat(),
            "is_active": True,
            "payment_notified": False
        }}
    )
    
    return {"success": True, "subscription_ends_at": new_expiration.isoformat()}

@api_router.post("/admin/users/{user_id}/regenerate-license")
async def regenerate_license(user_id: str, request: Request):
    """Generate new license key for user"""
    await require_admin(request)
    
    new_license = str(uuid.uuid4())
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"license_key": new_license}}
    )
    
    return {"success": True, "license_key": new_license}

@api_router.get("/admin/stats")
async def get_admin_stats(request: Request):
    """Get admin dashboard statistics"""
    await require_admin(request)
    
    total_users = await db.users.count_documents({})
    active_users = await db.users.count_documents({"is_active": True})
    trial_users = await db.users.count_documents({"plan": "trial"})
    paid_users = await db.users.count_documents({"plan": "paid"})
    expired_users = await db.users.count_documents({"plan": "expired"})
    
    # Users expiring soon (within 7 days)
    soon_date = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
    expiring_soon = await db.users.count_documents({
        "is_active": True,
        "$or": [
            {"trial_ends_at": {"$lte": soon_date}},
            {"subscription_ends_at": {"$lte": soon_date}}
        ]
    })
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "trial_users": trial_users,
        "paid_users": paid_users,
        "expired_users": expired_users,
        "expiring_soon": expiring_soon
    }

class PasswordReset(BaseModel):
    new_password: str

@api_router.put("/admin/users/{user_id}/reset-password")
async def reset_user_password(user_id: str, password_data: PasswordReset, request: Request):
    """Reset user password (admin only)"""
    await require_admin(request)
    
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Validate password length
    if len(password_data.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    # Hash new password
    new_password_hash = pwd_context.hash(password_data.new_password)
    
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"password_hash": new_password_hash}}
    )
    
    # Invalidate all user sessions to force re-login
    await db.user_sessions.delete_many({"user_id": user_id})
    
    return {"success": True, "message": "Password reset successfully"}

@api_router.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, request: Request):
    """Delete user and all associated data (admin only)"""
    await require_admin(request)
    
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent admin from deleting themselves
    current_user = await require_auth(request)
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    # Delete user's tarjetas and enlaces
    tarjetas = await db.tarjetas.find({"usuario_id": user_id}).to_list(length=None)
    for tarjeta in tarjetas:
        await db.enlaces.delete_many({"tarjeta_id": tarjeta["id"]})
    
    await db.tarjetas.delete_many({"usuario_id": user_id})
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.users.delete_one({"id": user_id})
    
    return {"success": True, "message": "User deleted successfully"}

# ============ MERCADO PAGO ENDPOINTS ============

class PaymentPreferenceRequest(BaseModel):
    user_id: str

@api_router.post("/payments/create-preference")
async def create_payment_preference(payment_data: PaymentPreferenceRequest, request: Request):
    """Create Mercado Pago payment preference for annual subscription"""
    user = await require_auth(request)
    
    # Verify user exists
    user_doc = await db.users.find_one({"id": payment_data.user_id})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Allow payment even if user has paid plan (for renewals/extensions)
    
    try:
        import mercadopago
        
        # Initialize Mercado Pago SDK
        mp_access_token = os.environ.get('MERCADO_PAGO_ACCESS_TOKEN')
        if not mp_access_token:
            raise HTTPException(status_code=500, detail="Mercado Pago not configured")
        
        sdk = mercadopago.SDK(mp_access_token)
        
        # Get frontend URL for redirects
        frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
        
        # Create preference data
        preference_data = {
            "items": [
                {
                    "title": "Suscripción Anual - TarjetaQR",
                    "quantity": 1,
                    "unit_price": 300.0,
                    "currency_id": "MXN"
                }
            ],
            "payer": {
                "name": user_doc.get("name"),
                "email": user_doc.get("email")
            },
            "back_urls": {
                "success": f"{frontend_url}/payment/success",
                "failure": f"{frontend_url}/payment/failure",
                "pending": f"{frontend_url}/payment/pending"
            },
            "auto_return": "approved",
            "external_reference": user_doc["id"],
            "statement_descriptor": "TARJETAQR SUSCRIPCION",
            "notification_url": f"{frontend_url}/api/payments/webhook"
        }
        
        # Create preference
        preference_response = sdk.preference().create(preference_data)
        
        logger.info(f"Mercado Pago response: {preference_response}")
        
        if preference_response.get("status") != 201:
            error_message = preference_response.get("response", {}).get("message", "Unknown error")
            logger.error(f"MP Error: {error_message}")
            raise HTTPException(status_code=500, detail=f"Mercado Pago error: {error_message}")
        
        preference = preference_response.get("response")
        
        if not preference:
            raise HTTPException(status_code=500, detail="Empty response from Mercado Pago")
        
        logger.info(f"Payment preference created for user {user_doc['id']}: {preference.get('id')}")
        
        return {
            "preference_id": preference.get("id"),
            "init_point": preference.get("init_point"),
            "sandbox_init_point": preference.get("sandbox_init_point")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating payment preference: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating payment: {str(e)}")

@api_router.post("/payments/webhook")
async def mercado_pago_webhook(request: Request):
    """Handle Mercado Pago payment notifications"""
    try:
        body = await request.json()
        logger.info(f"Received Mercado Pago webhook: {body}")
        
        topic = body.get("topic") or body.get("type")
        resource_id = body.get("resource")
        
        if topic == "payment":
            import mercadopago
            
            mp_access_token = os.environ.get('MERCADO_PAGO_ACCESS_TOKEN')
            sdk = mercadopago.SDK(mp_access_token)
            
            # Get payment details
            payment_info = sdk.payment().get(resource_id)
            payment = payment_info["response"]
            
            status = payment.get("status")
            external_reference = payment.get("external_reference")
            
            logger.info(f"Payment status: {status}, User: {external_reference}")
            
            if status == "approved" and external_reference:
                # Get current user to check existing subscription
                user = await db.users.find_one({"id": external_reference})
                
                if user:
                    # Calculate new subscription end date
                    # If user has active subscription, extend from that date
                    # Otherwise, extend from now
                    current_end = user.get("subscription_ends_at")
                    
                    if current_end and user.get("plan") == "paid":
                        # Parse existing end date and extend from there
                        try:
                            if isinstance(current_end, str):
                                current_end_dt = datetime.fromisoformat(current_end)
                            else:
                                current_end_dt = current_end
                            
                            # Only extend if subscription hasn't expired yet
                            if current_end_dt > datetime.now(timezone.utc):
                                subscription_end = current_end_dt + timedelta(days=365)
                            else:
                                subscription_end = datetime.now(timezone.utc) + timedelta(days=365)
                        except:
                            subscription_end = datetime.now(timezone.utc) + timedelta(days=365)
                    else:
                        # New subscription or trial user
                        subscription_end = datetime.now(timezone.utc) + timedelta(days=365)
                    
                    await db.users.update_one(
                        {"id": external_reference},
                        {
                            "$set": {
                                "plan": "paid",
                                "subscription_ends_at": subscription_end.isoformat(),
                                "payment_notified": True
                            }
                        }
                    )
                    
                    logger.info(f"User {external_reference} subscription updated until {subscription_end.isoformat()}")
        
        return {"status": "ok"}
        
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        return {"status": "error", "message": str(e)}

# ============ TARJETAS ENDPOINTS ============

@api_router.get("/tarjetas", response_model=List[Tarjeta])
async def get_tarjetas(request: Request):
    """Get all user's tarjetas"""
    user = await require_auth(request)
    tarjetas = await db.tarjetas.find({"usuario_id": user.id}, {"_id": 0}).to_list(100)
    
    for tarjeta in tarjetas:
        if isinstance(tarjeta.get('created_at'), str):
            tarjeta['created_at'] = datetime.fromisoformat(tarjeta['created_at'])
    
    return tarjetas

@api_router.get("/tarjetas/{tarjeta_id}", response_model=Tarjeta)
async def get_tarjeta(tarjeta_id: str, request: Request):
    """Get specific tarjeta"""
    user = await require_auth(request)
    tarjeta = await db.tarjetas.find_one({"id": tarjeta_id, "usuario_id": user.id}, {"_id": 0})
    
    if not tarjeta:
        raise HTTPException(status_code=404, detail="Tarjeta not found")
    
    if isinstance(tarjeta.get('created_at'), str):
        tarjeta['created_at'] = datetime.fromisoformat(tarjeta['created_at'])
    
    return tarjeta

@api_router.get("/tarjetas/slug/{slug}", response_model=Tarjeta)
async def get_tarjeta_by_slug(slug: str):
    """Get tarjeta by slug (public)"""
    tarjeta = await db.tarjetas.find_one({"slug": slug}, {"_id": 0})
    
    if not tarjeta:
        raise HTTPException(status_code=404, detail="Tarjeta not found")
    
    if isinstance(tarjeta.get('created_at'), str):
        tarjeta['created_at'] = datetime.fromisoformat(tarjeta['created_at'])
    
    return tarjeta

@api_router.post("/tarjetas", response_model=Tarjeta)
async def create_tarjeta(tarjeta_input: TarjetaCreate, request: Request):
    """Create new tarjeta"""
    user = await require_auth(request)
    
    # Generate slug
    slug = generate_slug(tarjeta_input.nombre)
    existing_slug = await db.tarjetas.find_one({"slug": slug})
    if existing_slug:
        slug = f"{slug}-{str(uuid.uuid4())[:8]}"
    
    tarjeta_data = {
        "id": str(uuid.uuid4()),
        "usuario_id": user.id,
        "slug": slug,
        **tarjeta_input.model_dump(),
        "qr_url": "",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.tarjetas.insert_one(tarjeta_data)
    tarjeta_data['created_at'] = datetime.fromisoformat(tarjeta_data['created_at'])
    return Tarjeta(**tarjeta_data)

@api_router.put("/tarjetas/{tarjeta_id}", response_model=Tarjeta)
async def update_tarjeta(tarjeta_id: str, tarjeta_update: TarjetaUpdate, request: Request):
    """Update tarjeta"""
    user = await require_auth(request)
    
    # Check ownership
    existing = await db.tarjetas.find_one({"id": tarjeta_id, "usuario_id": user.id})
    if not existing:
        raise HTTPException(status_code=404, detail="Tarjeta not found")
    
    # Update fields
    update_data = {k: v for k, v in tarjeta_update.model_dump().items() if v is not None}
    
    if update_data:
        await db.tarjetas.update_one({"id": tarjeta_id}, {"$set": update_data})
    
    # Get updated tarjeta
    updated = await db.tarjetas.find_one({"id": tarjeta_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    
    return Tarjeta(**updated)

@api_router.delete("/tarjetas/{tarjeta_id}")
async def delete_tarjeta(tarjeta_id: str, request: Request):
    """Delete tarjeta"""
    user = await require_auth(request)
    
    result = await db.tarjetas.delete_one({"id": tarjeta_id, "usuario_id": user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Tarjeta not found")
    
    # Also delete associated enlaces
    await db.enlaces.delete_many({"tarjeta_id": tarjeta_id})
    
    return {"success": True}

@api_router.post("/tarjetas/{tarjeta_id}/generate-qr")
async def generate_qr(tarjeta_id: str, request: Request):
    """Generate QR code for tarjeta"""
    user = await require_auth(request)
    
    tarjeta = await db.tarjetas.find_one({"id": tarjeta_id, "usuario_id": user.id})
    if not tarjeta:
        raise HTTPException(status_code=404, detail="Tarjeta not found")
    
    # Generate QR URL using external API
    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
    tarjeta_url = f"{frontend_url}/t/{tarjeta['slug']}"
    qr_url = f"https://api.qrserver.com/v1/create-qr-code/?size=300x300&data={tarjeta_url}"
    
    # Update tarjeta with QR URL
    await db.tarjetas.update_one({"id": tarjeta_id}, {"$set": {"qr_url": qr_url}})
    
    return {"qr_url": qr_url}

# ============ ENLACES ENDPOINTS ============

@api_router.get("/enlaces/{tarjeta_id}", response_model=List[Enlace])
async def get_enlaces(tarjeta_id: str):
    """Get all enlaces for a tarjeta (public)"""
    enlaces = await db.enlaces.find({"tarjeta_id": tarjeta_id}, {"_id": 0}).sort("orden", 1).to_list(100)
    
    for enlace in enlaces:
        if isinstance(enlace.get('created_at'), str):
            enlace['created_at'] = datetime.fromisoformat(enlace['created_at'])
    
    return enlaces

@api_router.post("/enlaces/{tarjeta_id}", response_model=Enlace)
async def create_enlace(tarjeta_id: str, enlace_input: EnlaceCreate, request: Request):
    """Create new enlace"""
    user = await require_auth(request)
    
    # Check tarjeta ownership
    tarjeta = await db.tarjetas.find_one({"id": tarjeta_id, "usuario_id": user.id})
    if not tarjeta:
        raise HTTPException(status_code=404, detail="Tarjeta not found")
    
    enlace_data = {
        "id": str(uuid.uuid4()),
        "tarjeta_id": tarjeta_id,
        **enlace_input.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.enlaces.insert_one(enlace_data)
    enlace_data['created_at'] = datetime.fromisoformat(enlace_data['created_at'])
    return Enlace(**enlace_data)

@api_router.put("/enlaces/{enlace_id}", response_model=Enlace)
async def update_enlace(enlace_id: str, enlace_update: EnlaceUpdate, request: Request):
    """Update enlace"""
    user = await require_auth(request)
    
    # Check ownership via tarjeta
    enlace = await db.enlaces.find_one({"id": enlace_id})
    if not enlace:
        raise HTTPException(status_code=404, detail="Enlace not found")
    
    tarjeta = await db.tarjetas.find_one({"id": enlace["tarjeta_id"], "usuario_id": user.id})
    if not tarjeta:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Update fields
    update_data = {k: v for k, v in enlace_update.model_dump().items() if v is not None}
    
    if update_data:
        await db.enlaces.update_one({"id": enlace_id}, {"$set": update_data})
    
    # Get updated enlace
    updated = await db.enlaces.find_one({"id": enlace_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    
    return Enlace(**updated)

@api_router.delete("/enlaces/{enlace_id}")
async def delete_enlace(enlace_id: str, request: Request):
    """Delete enlace"""
    user = await require_auth(request)
    
    # Check ownership via tarjeta
    enlace = await db.enlaces.find_one({"id": enlace_id})
    if not enlace:
        raise HTTPException(status_code=404, detail="Enlace not found")
    
    tarjeta = await db.tarjetas.find_one({"id": enlace["tarjeta_id"], "usuario_id": user.id})
    if not tarjeta:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.enlaces.delete_one({"id": enlace_id})
    return {"success": True}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()