#!/usr/bin/env python3
"""
Test script to verify .env file loading
"""

import os
from dotenv import load_dotenv

def test_env_loading():
    """Test if .env file is being loaded correctly"""
    
    print("🔧 Testing .env File Loading")
    print("=" * 50)
    
    # Load .env file
    load_dotenv()
    
    # Check environment variables
    required_vars = [
        'AFRICAS_TALKING_API_KEY',
        'AFRICAS_TALKING_USERNAME', 
        'AFRICAS_TALKING_ENV',
        'FLASK_ENV'
    ]
    
    print("Environment Variables:")
    for var in required_vars:
        value = os.getenv(var)
        if value:
            # Mask sensitive values
            if 'KEY' in var or 'SECRET' in var:
                masked_value = value[:8] + "..." + value[-4:] if len(value) > 12 else "***"
                print(f"✅ {var}: {masked_value}")
            else:
                print(f"✅ {var}: {value}")
        else:
            print(f"❌ {var}: NOT SET")
    
    print()
    
    # Test validator initialization
    try:
        from africas_talking_validator import transaction_validator
        print("✅ Africa's Talking validator imported successfully")
        print(f"Validator type: {type(transaction_validator).__name__}")
        
        # Check if it's using the right validator
        if hasattr(transaction_validator, 'api_key'):
            print("✅ Using AfricasTalkingValidator (Real API)")
        else:
            print("⚠️  Using DevelopmentValidator (Test codes only)")
            
    except Exception as e:
        print(f"❌ Error importing validator: {e}")

if __name__ == "__main__":
    test_env_loading()
