import requests
import sys
from datetime import datetime, timezone, timedelta
from pymongo import MongoClient
import uuid

class TarjetaDigitalAPITester:
    def __init__(self, base_url="https://digital-profile-14.preview.emergentagent.com"):
        self.base_url = base_url
        self.api = f"{base_url}/api"
        self.session_token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # MongoDB connection
        self.mongo_client = MongoClient("mongodb://localhost:27017")
        self.db = self.mongo_client["test_database"]

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

    def setup_test_user(self):
        """Create test user and session in MongoDB"""
        print("\n🔧 Setting up test user and session...")
        
        try:
            # Create test user
            self.user_id = f"test-user-{int(datetime.now().timestamp())}"
            user_doc = {
                "id": self.user_id,
                "email": f"test.user.{int(datetime.now().timestamp())}@example.com",
                "name": "Test User",
                "picture": "https://via.placeholder.com/150",
                "plan": "free",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            self.db.users.insert_one(user_doc)
            print(f"✅ Created test user: {self.user_id}")
            
            # Create session
            self.session_token = f"test_session_{int(datetime.now().timestamp())}"
            session_doc = {
                "user_id": self.user_id,
                "session_token": self.session_token,
                "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            self.db.user_sessions.insert_one(session_doc)
            print(f"✅ Created session: {self.session_token}")
            
            return True
        except Exception as e:
            print(f"❌ Error setting up test user: {e}")
            return False

    def cleanup_test_data(self):
        """Clean up test data from MongoDB"""
        print("\n🧹 Cleaning up test data...")
        try:
            if self.user_id:
                self.db.users.delete_many({"id": self.user_id})
                self.db.user_sessions.delete_many({"user_id": self.user_id})
                self.db.tarjetas.delete_many({"usuario_id": self.user_id})
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

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("=" * 60)
        print("🚀 Starting TarjetaDigital API Tests")
        print("=" * 60)
        
        # Setup
        if not self.setup_test_user():
            print("\n❌ Failed to setup test user. Aborting tests.")
            return 1
        
        # Run tests in order
        self.test_auth_me()
        self.test_get_tarjetas()
        self.test_create_tarjeta()
        self.test_get_tarjeta_by_id()
        self.test_update_tarjeta()
        self.test_get_tarjeta_by_slug_public()
        self.test_generate_qr()
        self.test_create_enlace()
        self.test_get_enlaces()
        self.test_update_enlace()
        self.test_delete_enlace()
        self.test_delete_tarjeta()
        self.test_logout()
        
        # Cleanup
        self.cleanup_test_data()
        
        # Summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        print("=" * 60)
        
        if self.tests_passed == self.tests_run:
            print("✅ All tests passed!")
            return 0
        else:
            print(f"❌ {self.tests_run - self.tests_passed} test(s) failed")
            return 1

def main():
    tester = TarjetaDigitalAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())
