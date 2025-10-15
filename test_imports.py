#!/usr/bin/env python3
"""
Test if Pesapal imports work correctly
"""
import sys
import os

# Add the backend directory to the path
sys.path.append('backend/Prowritesolutions')

def test_imports():
    """Test importing Pesapal modules"""
    print("🧪 Testing Pesapal Imports")
    print("=" * 50)
    
    try:
        print("1. Testing pesapal_service import...")
        from pesapal_service import PesapalService
        print("✅ pesapal_service imported successfully")
        
        print("2. Testing pesapal_payment_routes import...")
        from pesapal_payment_routes import pesapal_payment_bp
        print("✅ pesapal_payment_routes imported successfully")
        
        print("3. Testing pesapal_callback_routes import...")
        from pesapal_callback_routes import pesapal_callback_bp
        print("✅ pesapal_callback_routes imported successfully")
        
        print("4. Testing PesapalService initialization...")
        service = PesapalService()
        print("✅ PesapalService initialized successfully")
        
        print("\n🎉 All imports working correctly!")
        return True
        
    except ImportError as e:
        print(f"❌ Import Error: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_app_imports():
    """Test if app.py can import the modules"""
    print("\n🔍 Testing app.py imports...")
    print("=" * 50)
    
    try:
        # Change to the backend directory
        os.chdir('backend/Prowritesolutions')
        
        # Try to import the modules that app.py imports
        from pesapal_callback_routes import pesapal_callback_bp
        from pesapal_payment_routes import pesapal_payment_bp
        
        print("✅ app.py imports would work correctly")
        return True
        
    except ImportError as e:
        print(f"❌ app.py import would fail: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        # Change back to original directory
        os.chdir('../..')

if __name__ == "__main__":
    print("🔧 PESAPAL IMPORT TEST")
    print("=" * 60)
    
    # Test 1: Direct imports
    imports_ok = test_imports()
    
    # Test 2: App.py style imports
    app_imports_ok = test_app_imports()
    
    print("\n" + "=" * 60)
    if imports_ok and app_imports_ok:
        print("🎉 All tests passed! Your imports are working correctly.")
        print("\nNext steps:")
        print("1. Upload the files to PythonAnywhere")
        print("2. Add environment variables to .env")
        print("3. Restart your web app")
    else:
        print("❌ Some tests failed. Check the errors above.")
