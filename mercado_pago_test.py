#!/usr/bin/env python3
"""
Mercado Pago Integration Test Script
Tests the specific requirements from the review request
"""

import requests
import json
import os
import sys
from datetime import datetime, timezone, timedelta
from pymongo import MongoClient
import uuid
import bcrypt

class MercadoPagoTester:
    def __init__(self):
        self.backend_url = "https://tarjetaqr.app/api"
        self.access_token = "TEST-8178565988387443-111222-496c2904120a7557a8b9d3f4a81b2cc1-2986635613"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # MongoDB connection
        mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
        db_name = os.environ.get('DB_NAME', 'test_database')
        self.mongo_client = MongoClient(mongo_url)
        self.db = self.mongo_client[db_name]
        
        # Test user data
        self.test_user_id = None
        self.test_session_token = None

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
        """Create a test user with trial plan"""
        print("\n🔧 Setting up test user...")
        
        try:
            timestamp = int(datetime.now().timestamp())
            self.test_user_id = f"test-trial-user-{timestamp}"
            
            # Create trial user in database
            user_doc = {
                "id": self.test_user_id,
                "email": f"trial.{timestamp}@example.com",
                "name": "Trial User",
                "password_hash": bcrypt.hashpw("trial123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
                "plan": "trial",
                "role": "user",
                "license_key": str(uuid.uuid4()),
                "is_active": True,
                "trial_ends_at": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            self.db.users.insert_one(user_doc)
            
            # Create session for trial user
            self.test_session_token = f"trial_session_{timestamp}"
            session_doc = {
                "user_id": self.test_user_id,
                "session_token": self.test_session_token,
                "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            self.db.user_sessions.insert_one(session_doc)
            
            print(f"✅ Created test user: {self.test_user_id}")
            print(f"✅ Created session: {self.test_session_token}")
            return True
            
        except Exception as e:
            print(f"❌ Error setting up test user: {e}")
            return False

    def cleanup_test_data(self):
        """Clean up test data"""
        print("\n🧹 Cleaning up test data...")
        try:
            if self.test_user_id:
                self.db.users.delete_many({"id": self.test_user_id})
                self.db.user_sessions.delete_many({"user_id": self.test_user_id})
            print("✅ Test data cleaned up")
        except Exception as e:
            print(f"⚠️ Error cleaning up: {e}")

    def test_access_token_validation(self):
        """Test the Mercado Pago access token directly"""
        print("\n📝 Testing Mercado Pago access token validation...")
        
        try:
            # Test token validity with direct Mercado Pago API call
            response = requests.get(
                f"https://api.mercadopago.com/users/me?access_token={self.access_token}",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                return self.log_result("Access Token Validation", True, 
                    f"Token is VALID - User ID: {data.get('id', 'N/A')}")
            elif response.status_code == 401:
                return self.log_result("Access Token Validation", False, 
                    f"❌ CRITICAL: Access token is INVALID - {response.text}")
            else:
                return self.log_result("Access Token Validation", False, 
                    f"Unexpected response: {response.status_code} - {response.text}")
                    
        except Exception as e:
            return self.log_result("Access Token Validation", False, str(e))

    def test_payment_preference_creation(self):
        """Test POST /api/payments/create-preference with trial user"""
        print("\n📝 Testing payment preference creation...")
        
        try:
            payload = {"user_id": self.test_user_id}
            
            response = requests.post(
                f"{self.backend_url}/payments/create-preference",
                json=payload,
                headers={"Authorization": f"Bearer {self.test_session_token}"},
                timeout=15
            )
            
            print(f"Response status: {response.status_code}")
            print(f"Response body: {response.text}")
            
            if response.status_code == 200:
                data = response.json()
                
                # Check required fields
                required_fields = ["preference_id", "init_point", "sandbox_init_point"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    return self.log_result("Payment Preference Creation", False, 
                        f"Missing required fields: {missing_fields}")
                
                # Validate preference_id is not null
                if not data.get("preference_id"):
                    return self.log_result("Payment Preference Creation", False, 
                        "preference_id is null or empty")
                
                # Validate init_point is valid Mercado Pago URL
                init_point = data.get("init_point")
                if not init_point or ("mercadopago.com" not in init_point and "mercadolibre.com" not in init_point):
                    return self.log_result("Payment Preference Creation", False, 
                        f"Invalid init_point URL: {init_point}")
                
                # Validate sandbox_init_point
                sandbox_init_point = data.get("sandbox_init_point")
                if not sandbox_init_point:
                    return self.log_result("Payment Preference Creation", False, 
                        "sandbox_init_point is null or empty")
                
                return self.log_result("Payment Preference Creation", True, 
                    f"✅ Valid preference created - ID: {data['preference_id']}")
                    
            elif response.status_code == 500:
                error_text = response.text
                if "invalid access token" in error_text.lower():
                    return self.log_result("Payment Preference Creation", False, 
                        "❌ CRITICAL: Invalid Mercado Pago access token")
                else:
                    return self.log_result("Payment Preference Creation", False, 
                        f"Server error: {error_text}")
            else:
                return self.log_result("Payment Preference Creation", False, 
                    f"Unexpected status {response.status_code}: {response.text}")
                    
        except Exception as e:
            return self.log_result("Payment Preference Creation", False, str(e))

    def test_payment_amount_verification(self):
        """Verify the payment amount is $300 MXN by checking backend code"""
        print("\n📝 Verifying payment amount is $300 MXN...")
        
        try:
            # Read backend code to verify configuration
            with open('/app/backend/server.py', 'r') as f:
                backend_code = f.read()
            
            # Check for $300 MXN configuration
            if '"unit_price": 300.0' in backend_code and '"currency_id": "MXN"' in backend_code:
                return self.log_result("Payment Amount $300 MXN", True, 
                    "✅ Backend correctly configured for $300 MXN")
            else:
                return self.log_result("Payment Amount $300 MXN", False, 
                    "❌ Backend not configured for $300 MXN")
                    
        except Exception as e:
            return self.log_result("Payment Amount $300 MXN", False, str(e))

    def test_error_handling_invalid_user(self):
        """Test error handling with invalid user_id"""
        print("\n📝 Testing error handling with invalid user_id...")
        
        try:
            payload = {"user_id": "non-existent-user-id"}
            
            response = requests.post(
                f"{self.backend_url}/payments/create-preference",
                json=payload,
                headers={"Authorization": f"Bearer {self.test_session_token}"},
                timeout=10
            )
            
            if response.status_code == 404:
                return self.log_result("Error Handling - Invalid User", True, 
                    "✅ Correctly returns 404 for non-existent user")
            else:
                return self.log_result("Error Handling - Invalid User", False, 
                    f"Expected 404, got {response.status_code}")
                    
        except Exception as e:
            return self.log_result("Error Handling - Invalid User", False, str(e))

    def test_error_handling_no_auth(self):
        """Test error handling without authentication"""
        print("\n📝 Testing error handling without authentication...")
        
        try:
            payload = {"user_id": self.test_user_id}
            
            response = requests.post(
                f"{self.backend_url}/payments/create-preference",
                json=payload,
                timeout=10
            )
            
            if response.status_code == 401:
                return self.log_result("Error Handling - No Auth", True, 
                    "✅ Correctly requires authentication")
            else:
                return self.log_result("Error Handling - No Auth", False, 
                    f"Expected 401, got {response.status_code}")
                    
        except Exception as e:
            return self.log_result("Error Handling - No Auth", False, str(e))

    def test_webhook_endpoint(self):
        """Test POST /api/payments/webhook endpoint"""
        print("\n📝 Testing webhook endpoint...")
        
        try:
            payload = {
                "topic": "payment",
                "resource": "12345",
                "type": "payment"
            }
            
            response = requests.post(
                f"{self.backend_url}/payments/webhook",
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "ok":
                    return self.log_result("Webhook Endpoint", True, 
                        "✅ Webhook returns 200 OK with status: ok")
                else:
                    return self.log_result("Webhook Endpoint", True, 
                        f"✅ Webhook returns 200 OK with response: {data}")
            else:
                return self.log_result("Webhook Endpoint", False, 
                    f"Expected 200, got {response.status_code}")
                    
        except Exception as e:
            return self.log_result("Webhook Endpoint", False, str(e))

    def run_tests(self):
        """Run all Mercado Pago integration tests"""
        print("=" * 70)
        print("🚀 Mercado Pago Integration Test with TEST Access Token")
        print("   Backend URL: https://tarjetaqr.app/api")
        print("   Access Token: TEST-8178565988387443-111222-496c2904120a7557a8b9d3f4a81b2cc1-2986635613")
        print("=" * 70)
        
        # Setup
        if not self.setup_test_user():
            print("\n❌ Failed to setup test user. Aborting tests.")
            return 1
        
        # Test Priority 1: Payment Preference Creation
        print("\n" + "=" * 50)
        print("💳 PRIORITY 1: PAYMENT PREFERENCE CREATION")
        print("=" * 50)
        
        self.test_access_token_validation()
        self.test_payment_preference_creation()
        self.test_payment_amount_verification()
        
        # Test Priority 2: Error Handling
        print("\n" + "=" * 50)
        print("⚠️ PRIORITY 2: ERROR HANDLING")
        print("=" * 50)
        
        self.test_error_handling_invalid_user()
        self.test_error_handling_no_auth()
        
        # Test Priority 3: Webhook Endpoint
        print("\n" + "=" * 50)
        print("🔗 PRIORITY 3: WEBHOOK ENDPOINT")
        print("=" * 50)
        
        self.test_webhook_endpoint()
        
        # Cleanup
        self.cleanup_test_data()
        
        # Summary
        print("\n" + "=" * 70)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        print("=" * 70)
        
        # Detailed results
        print("\n📋 Detailed Results:")
        for result in self.test_results:
            status = "✅" if result["passed"] else "❌"
            print(f"{status} {result['test']}: {result['message']}")
        
        if self.tests_passed == self.tests_run:
            print("\n✅ All Mercado Pago integration tests passed!")
            return 0
        else:
            failed_count = self.tests_run - self.tests_passed
            print(f"\n❌ {failed_count} test(s) failed")
            
            # Show critical issues
            critical_failures = [r for r in self.test_results if not r["passed"] and "CRITICAL" in r["message"]]
            if critical_failures:
                print("\n🚨 CRITICAL ISSUES FOUND:")
                for failure in critical_failures:
                    print(f"   • {failure['test']}: {failure['message']}")
            
            return 1

def main():
    tester = MercadoPagoTester()
    return tester.run_tests()

if __name__ == "__main__":
    sys.exit(main())