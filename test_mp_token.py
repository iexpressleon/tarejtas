#!/usr/bin/env python3
"""
Test Mercado Pago access token directly
"""
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/backend/.env')

access_token = os.environ.get('MERCADO_PAGO_ACCESS_TOKEN')
print(f"Access Token: {access_token}")

# Test 1: Check if token is valid by getting account info
print("\n=== Test 1: Account Info ===")
try:
    response = requests.get(
        f"https://api.mercadopago.com/users/me?access_token={access_token}",
        timeout=10
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")

# Test 2: Try creating a simple preference via direct API call
print("\n=== Test 2: Create Preference via API ===")
try:
    preference_data = {
        "items": [
            {
                "title": "Test Item",
                "quantity": 1,
                "unit_price": 300.0,
                "currency_id": "MXN"
            }
        ],
        "payer": {
            "name": "Test User",
            "email": "test@example.com"
        },
        "back_urls": {
            "success": "https://tarjetaqr.app/payment/success",
            "failure": "https://tarjetaqr.app/payment/failure",
            "pending": "https://tarjetaqr.app/payment/pending"
        },
        "auto_return": "approved"
    }
    
    response = requests.post(
        f"https://api.mercadopago.com/checkout/preferences?access_token={access_token}",
        json=preference_data,
        timeout=10
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")

# Test 3: Test with SDK
print("\n=== Test 3: SDK Test ===")
try:
    import mercadopago
    
    sdk = mercadopago.SDK(access_token)
    
    preference_data = {
        "items": [
            {
                "title": "Test Item SDK",
                "quantity": 1,
                "unit_price": 300.0,
                "currency_id": "MXN"
            }
        ],
        "payer": {
            "name": "Test User SDK",
            "email": "testsdk@example.com"
        }
    }
    
    preference_response = sdk.preference().create(preference_data)
    print(f"SDK Response: {preference_response}")
    
except Exception as e:
    print(f"SDK Error: {e}")