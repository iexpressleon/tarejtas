import requests
import sys
import os
from datetime import datetime, timezone, timedelta
from pymongo import MongoClient
import uuid
import bcrypt

class TarjetaDigitalAPITester:
    def __init__(self, base_url=None):
        # Use REACT_APP_BACKEND_URL from frontend/.env
        if not base_url:
            try:
                with open('/app/frontend/.env', 'r') as f:
                    for line in f:
                        if line.startswith('REACT_APP_BACKEND_URL='):
                            base_url = line.split('=', 1)[1].strip()
                            break
            except:
                pass
        
        self.base_url = base_url or 'https://bizcard-digital-1.preview.emergentagent.com'
        self.api = f"{self.base_url}/api"
        self.session_token = None
        self.admin_session_token = None
        self.user_id = None
        self.admin_user_id = None
        self.regular_user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # MongoDB connection - use environment variable
        mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
        db_name = os.environ.get('DB_NAME', 'test_database')
        self.mongo_client = MongoClient(mongo_url)
        self.db = self.mongo_client[db_name]
        
        # Password context for verification
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    def log_result(self, test_name, passed, message=""):
        """Log test result"""
        self.tests_run += 1
        if passed:
            self.tests_passed += 1
            status = "✅ PASSED"
        else:
            status = "❌ FAILED"
        
        result = f"{status} - {test_name}"
        if message:
            result += f": {message}"
        
        print(result)
        self.test_results.append({
            "test": test_name,
            "passed": passed,
            "message": message
        })
        return passed

    def setup_test_users(self):
        """Create test admin and regular users with sessions in MongoDB"""
        print("\n🔧 Setting up test users and sessions...")
        
        try:
            timestamp = int(datetime.now().timestamp())
            
            # Create admin user
            self.admin_user_id = f"test-admin-{timestamp}"
            admin_doc = {
                "id": self.admin_user_id,
                "email": f"admin.{timestamp}@example.com",
                "name": "Test Admin",
                "password_hash": self.pwd_context.hash("admin123"),
                "picture": "https://via.placeholder.com/150",
                "plan": "paid",
                "role": "admin",
                "license_key": str(uuid.uuid4()),
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            self.db.users.insert_one(admin_doc)
            print(f"✅ Created admin user: {self.admin_user_id}")
            
            # Create admin session
            self.admin_session_token = f"admin_session_{timestamp}"
            admin_session_doc = {
                "user_id": self.admin_user_id,
                "session_token": self.admin_session_token,
                "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            self.db.user_sessions.insert_one(admin_session_doc)
            print(f"✅ Created admin session: {self.admin_session_token}")
            
            # Create regular user
            self.regular_user_id = f"test-user-{timestamp}"
            user_doc = {
                "id": self.regular_user_id,
                "email": f"user.{timestamp}@example.com",
                "name": "Test User",
                "password_hash": self.pwd_context.hash("user123"),
                "picture": "https://via.placeholder.com/150",
                "plan": "trial",
                "role": "user",
                "license_key": str(uuid.uuid4()),
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            self.db.users.insert_one(user_doc)
            print(f"✅ Created regular user: {self.regular_user_id}")
            
            # Create regular user session
            self.session_token = f"user_session_{timestamp}"
            session_doc = {
                "user_id": self.regular_user_id,
                "session_token": self.session_token,
                "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            self.db.user_sessions.insert_one(session_doc)
            print(f"✅ Created user session: {self.session_token}")
            
            # Set user_id for backward compatibility
            self.user_id = self.regular_user_id
            
            return True
        except Exception as e:
            print(f"❌ Error setting up test users: {e}")
            return False

    def cleanup_test_data(self):
        """Clean up test data from MongoDB"""
        print("\n🧹 Cleaning up test data...")
        try:
            # Clean up admin user data
            if self.admin_user_id:
                self.db.users.delete_many({"id": self.admin_user_id})
                self.db.user_sessions.delete_many({"user_id": self.admin_user_id})
                
            # Clean up regular user data
            if self.regular_user_id:
                self.db.users.delete_many({"id": self.regular_user_id})
                self.db.user_sessions.delete_many({"user_id": self.regular_user_id})
                self.db.tarjetas.delete_many({"usuario_id": self.regular_user_id})
                
            print("✅ Test data cleaned up")
        except Exception as e:
            print(f"⚠️ Error cleaning up: {e}")

    def test_auth_me(self):
        """Test GET /api/auth/me"""
        print("\n📝 Testing authentication...")
        
        try:
            response = requests.get(
                f"{self.api}/auth/me",
                headers={"Authorization": f"Bearer {self.session_token}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("id") == self.user_id and data.get("email"):
                    return self.log_result("GET /api/auth/me", True, f"User authenticated: {data.get('name')}")
                else:
                    return self.log_result("GET /api/auth/me", False, "Invalid user data returned")
            else:
                return self.log_result("GET /api/auth/me", False, f"Status {response.status_code}")
        except Exception as e:
            return self.log_result("GET /api/auth/me", False, str(e))

    def test_get_tarjetas(self):
        """Test GET /api/tarjetas"""
        print("\n📝 Testing get tarjetas...")
        
        try:
            response = requests.get(
                f"{self.api}/tarjetas",
                headers={"Authorization": f"Bearer {self.session_token}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    return self.log_result("GET /api/tarjetas", True, f"Found {len(data)} tarjetas")
                else:
                    return self.log_result("GET /api/tarjetas", False, "Response is not a list")
            else:
                return self.log_result("GET /api/tarjetas", False, f"Status {response.status_code}")
        except Exception as e:
            return self.log_result("GET /api/tarjetas", False, str(e))

    def test_create_tarjeta(self):
        """Test POST /api/tarjetas"""
        print("\n📝 Testing create tarjeta...")
        
        try:
            payload = {
                "nombre": "Test Card",
                "descripcion": "This is a test card",
                "color_tema": "#ff5733",
                "whatsapp": "+1234567890",
                "email": "test@example.com",
                "foto_url": "https://via.placeholder.com/150"
            }
            
            response = requests.post(
                f"{self.api}/tarjetas",
                json=payload,
                headers={"Authorization": f"Bearer {self.session_token}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("id") and data.get("slug"):
                    self.test_tarjeta_id = data["id"]
                    self.test_tarjeta_slug = data["slug"]
                    return self.log_result("POST /api/tarjetas", True, f"Created tarjeta: {data['slug']}")
                else:
                    return self.log_result("POST /api/tarjetas", False, "Missing id or slug in response")
            else:
                return self.log_result("POST /api/tarjetas", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            return self.log_result("POST /api/tarjetas", False, str(e))

    def test_get_tarjeta_by_id(self):
        """Test GET /api/tarjetas/{id}"""
        print("\n📝 Testing get tarjeta by ID...")
        
        if not hasattr(self, 'test_tarjeta_id'):
            return self.log_result("GET /api/tarjetas/{id}", False, "No test tarjeta created")
        
        try:
            response = requests.get(
                f"{self.api}/tarjetas/{self.test_tarjeta_id}",
                headers={"Authorization": f"Bearer {self.session_token}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("id") == self.test_tarjeta_id:
                    return self.log_result("GET /api/tarjetas/{id}", True, f"Retrieved tarjeta: {data['nombre']}")
                else:
                    return self.log_result("GET /api/tarjetas/{id}", False, "Wrong tarjeta returned")
            else:
                return self.log_result("GET /api/tarjetas/{id}", False, f"Status {response.status_code}")
        except Exception as e:
            return self.log_result("GET /api/tarjetas/{id}", False, str(e))

    def test_update_tarjeta(self):
        """Test PUT /api/tarjetas/{id}"""
        print("\n📝 Testing update tarjeta...")
        
        if not hasattr(self, 'test_tarjeta_id'):
            return self.log_result("PUT /api/tarjetas/{id}", False, "No test tarjeta created")
        
        try:
            payload = {
                "nombre": "Updated Test Card",
                "descripcion": "Updated description"
            }
            
            response = requests.put(
                f"{self.api}/tarjetas/{self.test_tarjeta_id}",
                json=payload,
                headers={"Authorization": f"Bearer {self.session_token}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("nombre") == "Updated Test Card":
                    return self.log_result("PUT /api/tarjetas/{id}", True, "Tarjeta updated successfully")
                else:
                    return self.log_result("PUT /api/tarjetas/{id}", False, "Update not reflected")
            else:
                return self.log_result("PUT /api/tarjetas/{id}", False, f"Status {response.status_code}")
        except Exception as e:
            return self.log_result("PUT /api/tarjetas/{id}", False, str(e))

    def test_get_tarjeta_by_slug_public(self):
        """Test GET /api/tarjetas/slug/{slug} (public, no auth)"""
        print("\n📝 Testing get tarjeta by slug (public)...")
        
        if not hasattr(self, 'test_tarjeta_slug'):
            return self.log_result("GET /api/tarjetas/slug/{slug}", False, "No test tarjeta created")
        
        try:
            response = requests.get(f"{self.api}/tarjetas/slug/{self.test_tarjeta_slug}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("slug") == self.test_tarjeta_slug:
                    return self.log_result("GET /api/tarjetas/slug/{slug}", True, "Public access works")
                else:
                    return self.log_result("GET /api/tarjetas/slug/{slug}", False, "Wrong tarjeta returned")
            else:
                return self.log_result("GET /api/tarjetas/slug/{slug}", False, f"Status {response.status_code}")
        except Exception as e:
            return self.log_result("GET /api/tarjetas/slug/{slug}", False, str(e))

    def test_generate_qr(self):
        """Test POST /api/tarjetas/{id}/generate-qr"""
        print("\n📝 Testing QR code generation...")
        
        if not hasattr(self, 'test_tarjeta_id'):
            return self.log_result("POST /api/tarjetas/{id}/generate-qr", False, "No test tarjeta created")
        
        try:
            response = requests.post(
                f"{self.api}/tarjetas/{self.test_tarjeta_id}/generate-qr",
                headers={"Authorization": f"Bearer {self.session_token}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("qr_url") and "qrserver.com" in data["qr_url"]:
                    return self.log_result("POST /api/tarjetas/{id}/generate-qr", True, f"QR generated: {data['qr_url'][:50]}...")
                else:
                    return self.log_result("POST /api/tarjetas/{id}/generate-qr", False, "Invalid QR URL")
            else:
                return self.log_result("POST /api/tarjetas/{id}/generate-qr", False, f"Status {response.status_code}")
        except Exception as e:
            return self.log_result("POST /api/tarjetas/{id}/generate-qr", False, str(e))

    def test_create_enlace(self):
        """Test POST /api/enlaces/{tarjeta_id}"""
        print("\n📝 Testing create enlace...")
        
        if not hasattr(self, 'test_tarjeta_id'):
            return self.log_result("POST /api/enlaces/{tarjeta_id}", False, "No test tarjeta created")
        
        try:
            payload = {
                "titulo": "LinkedIn",
                "url": "https://linkedin.com/in/testuser",
                "orden": 0
            }
            
            response = requests.post(
                f"{self.api}/enlaces/{self.test_tarjeta_id}",
                json=payload,
                headers={"Authorization": f"Bearer {self.session_token}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("id") and data.get("titulo") == "LinkedIn":
                    self.test_enlace_id = data["id"]
                    return self.log_result("POST /api/enlaces/{tarjeta_id}", True, f"Created enlace: {data['titulo']}")
                else:
                    return self.log_result("POST /api/enlaces/{tarjeta_id}", False, "Invalid enlace data")
            else:
                return self.log_result("POST /api/enlaces/{tarjeta_id}", False, f"Status {response.status_code}")
        except Exception as e:
            return self.log_result("POST /api/enlaces/{tarjeta_id}", False, str(e))

    def test_get_enlaces(self):
        """Test GET /api/enlaces/{tarjeta_id}"""
        print("\n📝 Testing get enlaces...")
        
        if not hasattr(self, 'test_tarjeta_id'):
            return self.log_result("GET /api/enlaces/{tarjeta_id}", False, "No test tarjeta created")
        
        try:
            response = requests.get(f"{self.api}/enlaces/{self.test_tarjeta_id}")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    return self.log_result("GET /api/enlaces/{tarjeta_id}", True, f"Found {len(data)} enlaces")
                else:
                    return self.log_result("GET /api/enlaces/{tarjeta_id}", False, "No enlaces found")
            else:
                return self.log_result("GET /api/enlaces/{tarjeta_id}", False, f"Status {response.status_code}")
        except Exception as e:
            return self.log_result("GET /api/enlaces/{tarjeta_id}", False, str(e))

    def test_update_enlace(self):
        """Test PUT /api/enlaces/{enlace_id}"""
        print("\n📝 Testing update enlace...")
        
        if not hasattr(self, 'test_enlace_id'):
            return self.log_result("PUT /api/enlaces/{enlace_id}", False, "No test enlace created")
        
        try:
            payload = {
                "titulo": "Updated LinkedIn",
                "url": "https://linkedin.com/in/updated"
            }
            
            response = requests.put(
                f"{self.api}/enlaces/{self.test_enlace_id}",
                json=payload,
                headers={"Authorization": f"Bearer {self.session_token}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("titulo") == "Updated LinkedIn":
                    return self.log_result("PUT /api/enlaces/{enlace_id}", True, "Enlace updated successfully")
                else:
                    return self.log_result("PUT /api/enlaces/{enlace_id}", False, "Update not reflected")
            else:
                return self.log_result("PUT /api/enlaces/{enlace_id}", False, f"Status {response.status_code}")
        except Exception as e:
            return self.log_result("PUT /api/enlaces/{enlace_id}", False, str(e))

    def test_delete_enlace(self):
        """Test DELETE /api/enlaces/{enlace_id}"""
        print("\n📝 Testing delete enlace...")
        
        if not hasattr(self, 'test_enlace_id'):
            return self.log_result("DELETE /api/enlaces/{enlace_id}", False, "No test enlace created")
        
        try:
            response = requests.delete(
                f"{self.api}/enlaces/{self.test_enlace_id}",
                headers={"Authorization": f"Bearer {self.session_token}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    return self.log_result("DELETE /api/enlaces/{enlace_id}", True, "Enlace deleted successfully")
                else:
                    return self.log_result("DELETE /api/enlaces/{enlace_id}", False, "Delete not confirmed")
            else:
                return self.log_result("DELETE /api/enlaces/{enlace_id}", False, f"Status {response.status_code}")
        except Exception as e:
            return self.log_result("DELETE /api/enlaces/{enlace_id}", False, str(e))

    def test_delete_tarjeta(self):
        """Test DELETE /api/tarjetas/{id}"""
        print("\n📝 Testing delete tarjeta...")
        
        if not hasattr(self, 'test_tarjeta_id'):
            return self.log_result("DELETE /api/tarjetas/{id}", False, "No test tarjeta created")
        
        try:
            response = requests.delete(
                f"{self.api}/tarjetas/{self.test_tarjeta_id}",
                headers={"Authorization": f"Bearer {self.session_token}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    return self.log_result("DELETE /api/tarjetas/{id}", True, "Tarjeta deleted successfully")
                else:
                    return self.log_result("DELETE /api/tarjetas/{id}", False, "Delete not confirmed")
            else:
                return self.log_result("DELETE /api/tarjetas/{id}", False, f"Status {response.status_code}")
        except Exception as e:
            return self.log_result("DELETE /api/tarjetas/{id}", False, str(e))

    def test_password_reset_admin_auth_required(self):
        """Test that password reset requires admin authentication"""
        print("\n📝 Testing password reset requires admin auth...")
        
        try:
            payload = {"new_password": "newpass123"}
            
            # Test with no auth
            response = requests.put(
                f"{self.api}/admin/users/{self.regular_user_id}/reset-password",
                json=payload
            )
            
            if response.status_code == 401:
                # Test with regular user auth (should fail)
                response = requests.put(
                    f"{self.api}/admin/users/{self.regular_user_id}/reset-password",
                    json=payload,
                    headers={"Authorization": f"Bearer {self.session_token}"}
                )
                
                if response.status_code == 403:
                    return self.log_result("Password Reset Admin Auth", True, "Correctly requires admin role")
                else:
                    return self.log_result("Password Reset Admin Auth", False, f"Regular user got status {response.status_code}")
            else:
                return self.log_result("Password Reset Admin Auth", False, f"No auth got status {response.status_code}")
        except Exception as e:
            return self.log_result("Password Reset Admin Auth", False, str(e))

    def test_password_reset_validation(self):
        """Test password validation (minimum 6 characters)"""
        print("\n📝 Testing password validation...")
        
        try:
            # Test with short password
            payload = {"new_password": "123"}
            response = requests.put(
                f"{self.api}/admin/users/{self.regular_user_id}/reset-password",
                json=payload,
                headers={"Authorization": f"Bearer {self.admin_session_token}"}
            )
            
            if response.status_code == 400:
                return self.log_result("Password Validation", True, "Correctly rejects short passwords")
            else:
                return self.log_result("Password Validation", False, f"Short password got status {response.status_code}")
        except Exception as e:
            return self.log_result("Password Validation", False, str(e))

    def test_password_reset_success(self):
        """Test successful password reset and verify hashing"""
        print("\n📝 Testing successful password reset...")
        
        try:
            new_password = "newpass123"
            payload = {"new_password": new_password}
            
            # Reset password
            response = requests.put(
                f"{self.api}/admin/users/{self.regular_user_id}/reset-password",
                json=payload,
                headers={"Authorization": f"Bearer {self.admin_session_token}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    # Verify password is hashed in database
                    user = self.db.users.find_one({"id": self.regular_user_id})
                    if user and user.get("password_hash"):
                        # Verify it's not stored in plaintext
                        if user["password_hash"] != new_password:
                            # Verify the hash is valid
                            if self.pwd_context.verify(new_password, user["password_hash"]):
                                return self.log_result("Password Reset Success", True, "Password reset and properly hashed")
                            else:
                                return self.log_result("Password Reset Success", False, "Password hash verification failed")
                        else:
                            return self.log_result("Password Reset Success", False, "Password stored in plaintext")
                    else:
                        return self.log_result("Password Reset Success", False, "No password hash found in database")
                else:
                    return self.log_result("Password Reset Success", False, "Success not confirmed")
            else:
                return self.log_result("Password Reset Success", False, f"Status {response.status_code}: {response.text}")
        except Exception as e:
            return self.log_result("Password Reset Success", False, str(e))

    def test_password_reset_session_invalidation(self):
        """Test that user sessions are invalidated after password reset"""
        print("\n📝 Testing session invalidation after password reset...")
        
        try:
            # Count sessions before reset
            sessions_before = self.db.user_sessions.count_documents({"user_id": self.regular_user_id})
            
            # Reset password
            payload = {"new_password": "anotherpass123"}
            response = requests.put(
                f"{self.api}/admin/users/{self.regular_user_id}/reset-password",
                json=payload,
                headers={"Authorization": f"Bearer {self.admin_session_token}"}
            )
            
            if response.status_code == 200:
                # Check sessions after reset
                sessions_after = self.db.user_sessions.count_documents({"user_id": self.regular_user_id})
                
                if sessions_after == 0 and sessions_before > 0:
                    return self.log_result("Session Invalidation", True, f"All {sessions_before} sessions invalidated")
                else:
                    return self.log_result("Session Invalidation", False, f"Sessions before: {sessions_before}, after: {sessions_after}")
            else:
                return self.log_result("Session Invalidation", False, f"Password reset failed: {response.status_code}")
        except Exception as e:
            return self.log_result("Session Invalidation", False, str(e))

    def test_qr_code_url_verification(self):
        """Test QR code URL generation and verification"""
        print("\n📝 Testing QR code URL verification...")
        
        if not hasattr(self, 'test_tarjeta_id') or not hasattr(self, 'test_tarjeta_slug'):
            return self.log_result("QR Code URL Verification", False, "No test tarjeta created")
        
        try:
            # Generate QR code
            response = requests.post(
                f"{self.api}/tarjetas/{self.test_tarjeta_id}/generate-qr",
                headers={"Authorization": f"Bearer {self.session_token}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                qr_url = data.get("qr_url")
                
                if qr_url and "qrserver.com" in qr_url:
                    # Extract the data parameter from QR URL
                    if "data=" in qr_url:
                        encoded_url = qr_url.split("data=")[1]
                        # URL decode
                        import urllib.parse
                        decoded_url = urllib.parse.unquote(encoded_url)
                        
                        # Check if it points to correct frontend route
                        expected_path = f"/t/{self.test_tarjeta_slug}"
                        if expected_path in decoded_url and self.base_url in decoded_url:
                            return self.log_result("QR Code URL Verification", True, f"QR points to correct URL: {decoded_url}")
                        else:
                            return self.log_result("QR Code URL Verification", False, f"QR URL incorrect: {decoded_url}")
                    else:
                        return self.log_result("QR Code URL Verification", False, "No data parameter in QR URL")
                else:
                    return self.log_result("QR Code URL Verification", False, "Invalid QR URL format")
            else:
                return self.log_result("QR Code URL Verification", False, f"QR generation failed: {response.status_code}")
        except Exception as e:
            return self.log_result("QR Code URL Verification", False, str(e))

    def test_logout(self):
        """Test POST /api/auth/logout"""
        print("\n📝 Testing logout...")
        
        try:
            response = requests.post(
                f"{self.api}/auth/logout",
                headers={"Authorization": f"Bearer {self.session_token}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    return self.log_result("POST /api/auth/logout", True, "Logout successful")
                else:
                    return self.log_result("POST /api/auth/logout", False, "Logout not confirmed")
            else:
                return self.log_result("POST /api/auth/logout", False, f"Status {response.status_code}")
        except Exception as e:
            return self.log_result("POST /api/auth/logout", False, str(e))

    def run_priority_tests(self):
        """Run priority tests for password reset and QR code functionality"""
        print("=" * 60)
        print("🚀 Starting TarjetaDigital Priority API Tests")
        print("=" * 60)
        
        # Setup
        if not self.setup_test_users():
            print("\n❌ Failed to setup test users. Aborting tests.")
            return 1
        
        # Priority 1: Password Reset Tests
        print("\n" + "=" * 40)
        print("🔐 PRIORITY 1: PASSWORD RESET TESTS")
        print("=" * 40)
        self.test_password_reset_admin_auth_required()
        self.test_password_reset_validation()
        self.test_password_reset_success()
        self.test_password_reset_session_invalidation()
        
        # Priority 2: QR Code and Public Card Tests
        print("\n" + "=" * 40)
        print("📱 PRIORITY 2: QR CODE & PUBLIC CARD TESTS")
        print("=" * 40)
        
        # Need to create a card first for QR testing
        self.test_create_tarjeta()
        self.test_get_tarjeta_by_slug_public()
        self.test_generate_qr()
        self.test_qr_code_url_verification()
        
        # Cleanup
        self.cleanup_test_data()
        
        # Summary
        print("\n" + "=" * 60)
        print(f"📊 Priority Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        print("=" * 60)
        
        if self.tests_passed == self.tests_run:
            print("✅ All priority tests passed!")
            return 0
        else:
            print(f"❌ {self.tests_run - self.tests_passed} priority test(s) failed")
            return 1

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("=" * 60)
        print("🚀 Starting TarjetaDigital Complete API Tests")
        print("=" * 60)
        
        # Setup
        if not self.setup_test_users():
            print("\n❌ Failed to setup test users. Aborting tests.")
            return 1
        
        # Priority tests first
        print("\n" + "=" * 40)
        print("🔐 PRIORITY 1: PASSWORD RESET TESTS")
        print("=" * 40)
        self.test_password_reset_admin_auth_required()
        self.test_password_reset_validation()
        self.test_password_reset_success()
        self.test_password_reset_session_invalidation()
        
        # Basic API tests
        print("\n" + "=" * 40)
        print("📋 BASIC API TESTS")
        print("=" * 40)
        self.test_auth_me()
        self.test_get_tarjetas()
        self.test_create_tarjeta()
        self.test_get_tarjeta_by_id()
        self.test_update_tarjeta()
        
        # QR and public card tests
        print("\n" + "=" * 40)
        print("📱 PRIORITY 2: QR CODE & PUBLIC CARD TESTS")
        print("=" * 40)
        self.test_get_tarjeta_by_slug_public()
        self.test_generate_qr()
        self.test_qr_code_url_verification()
        
        # Enlaces tests
        print("\n" + "=" * 40)
        print("🔗 ENLACES TESTS")
        print("=" * 40)
        self.test_create_enlace()
        self.test_get_enlaces()
        self.test_update_enlace()
        self.test_delete_enlace()
        
        # Cleanup tests
        self.test_delete_tarjeta()
        self.test_logout()
        
        # Cleanup
        self.cleanup_test_data()
        
        # Summary
        print("\n" + "=" * 60)
        print(f"📊 Complete Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        print("=" * 60)
        
        if self.tests_passed == self.tests_run:
            print("✅ All tests passed!")
            return 0
        else:
            print(f"❌ {self.tests_run - self.tests_passed} test(s) failed")
            return 1

def main():
    import sys
    tester = TarjetaDigitalAPITester()
    
    # Check if priority flag is passed
    if len(sys.argv) > 1 and sys.argv[1] == "--priority":
        return tester.run_priority_tests()
    else:
        return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())
