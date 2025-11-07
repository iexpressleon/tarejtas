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
    picture: Optional[str] = None
    plan: str = "free"
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

class Tarjeta(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    usuario_id: str
    slug: str
    nombre: str
    descripcion: Optional[str] = ""
    color_tema: str = "#6366f1"
    whatsapp: Optional[str] = ""
    email: Optional[str] = ""
    foto_url: Optional[str] = ""
    qr_url: Optional[str] = ""
    plantilla_id: int = 1
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TarjetaCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = ""
    color_tema: Optional[str] = "#6366f1"
    whatsapp: Optional[str] = ""
    email: Optional[str] = ""
    foto_url: Optional[str] = ""
    plantilla_id: Optional[int] = 1

class TarjetaUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    color_tema: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    foto_url: Optional[str] = None
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
    return user

def generate_slug(nombre: str) -> str:
    """Generate URL-safe slug from name"""
    slug = nombre.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return slug

# ============ AUTH ENDPOINTS ============

@api_router.post("/auth/session")
async def process_session(request: Request, response: Response):
    """Process session_id from Emergent Auth"""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Call Emergent Auth API
    async with httpx.AsyncClient() as client:
        try:
            auth_response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id},
                timeout=10.0
            )
            auth_response.raise_for_status()
            session_data = auth_response.json()
        except Exception as e:
            logger.error(f"Auth API error: {e}")
            raise HTTPException(status_code=400, detail="Invalid session_id")
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": session_data["email"]}, {"_id": 0})
    
    if not existing_user:
        # Create new user
        user_data = {
            "id": session_data["id"],
            "email": session_data["email"],
            "name": session_data["name"],
            "picture": session_data.get("picture"),
            "plan": "free",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_data)
        
        # Create default tarjeta for new user
        slug = generate_slug(session_data["name"])
        # Check if slug exists, add number if needed
        existing_slug = await db.tarjetas.find_one({"slug": slug})
        if existing_slug:
            slug = f"{slug}-{str(uuid.uuid4())[:8]}"
        
        tarjeta_data = {
            "id": str(uuid.uuid4()),
            "usuario_id": session_data["id"],
            "slug": slug,
            "nombre": session_data["name"],
            "descripcion": "",
            "color_tema": "#6366f1",
            "whatsapp": "",
            "email": session_data["email"],
            "foto_url": session_data.get("picture", ""),
            "qr_url": "",
            "plantilla_id": 1,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.tarjetas.insert_one(tarjeta_data)
        user_id = session_data["id"]
    else:
        user_id = existing_user["id"]
    
    # Store session
    session_doc = {
        "user_id": user_id,
        "session_token": session_data["session_token"],
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    
    # Set httpOnly cookie
    response.set_cookie(
        key="session_token",
        value=session_data["session_token"],
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    
    return {"success": True, "user_id": user_id}

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
    frontend_url = os.environ.get('REACT_APP_BACKEND_URL', '').replace('/api', '')
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