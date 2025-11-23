#!/usr/bin/env python3
"""
Mercado Pago PRODUCTION Token Validation Test
Test the new PRODUCTION access token: APP_USR-1733766829848492-111222-1d20820f90a24b4b0fc94fbee12b5189-1060383245
"""

import requests
import sys

def test_mercado_pago_production_token():
    """Test the specific PRODUCTION access token by calling Mercado Pago API"""
    
    # The PRODUCTION token to test
    production_token = "APP_USR-1733766829848492-111222-1d20820f90a24b4b0fc94fbee12b5189-1060383245"
    
    print("=" * 80)
    print("🔑 Mercado Pago PRODUCTION Token Validation Test")
    print(f"   Testing token: {production_token}")
    print("=" * 80)
    
    try:
        # Call Mercado Pago API to validate token
        print("\n📝 Calling GET https://api.mercadopago.com/users/me...")
        
        response = requests.get(
            "https://api.mercadopago.com/users/me",
            headers={"Authorization": f"Bearer {production_token}"},
            timeout=15
        )
        
        print(f"Response Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ SUCCESS: Token is VALID")
            
            try:
                data = response.json()
                print("\n📋 User Information:")
                print(f"   User ID: {data.get('id', 'N/A')}")
                print(f"   Email: {data.get('email', 'N/A')}")
                print(f"   First Name: {data.get('first_name', 'N/A')}")
                print(f"   Last Name: {data.get('last_name', 'N/A')}")
                print(f"   Country ID: {data.get('country_id', 'N/A')}")
                print(f"   Site ID: {data.get('site_id', 'N/A')}")
                print(f"   Test User: {data.get('test_user', 'N/A')}")
                
                # Check if this is production or test
                if data.get('test_user') == True:
                    print("⚠️  NOTE: This appears to be a TEST user, not PRODUCTION")
                else:
                    print("✅ CONFIRMED: This is a PRODUCTION token")
                    
                return True
                
            except Exception as json_error:
                print(f"⚠️  Warning: Could not parse JSON response: {json_error}")
                print(f"Raw response: {response.text}")
                return True  # Token is still valid even if we can't parse JSON
                
        elif response.status_code == 401:
            print("❌ FAILED: Token is INVALID")
            print(f"   Error: 401 Unauthorized")
            print(f"   Response: {response.text}")
            return False
            
        elif response.status_code == 403:
            print("❌ FAILED: Token access forbidden")
            print(f"   Error: 403 Forbidden")
            print(f"   Response: {response.text}")
            return False
            
        else:
            print(f"❌ UNEXPECTED: Status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ FAILED: Request timeout")
        return False
        
    except requests.exceptions.ConnectionError:
        print("❌ FAILED: Connection error")
        return False
        
    except Exception as e:
        print(f"❌ FAILED: Unexpected error: {str(e)}")
        return False

def main():
    """Main function"""
    success = test_mercado_pago_production_token()
    
    print("\n" + "=" * 80)
    if success:
        print("✅ PRODUCTION TOKEN VALIDATION: PASSED")
        print("   The token is valid and can be used for Mercado Pago integration")
        return 0
    else:
        print("❌ PRODUCTION TOKEN VALIDATION: FAILED")
        print("   The token is invalid and needs to be regenerated")
        return 1

if __name__ == "__main__":
    sys.exit(main())