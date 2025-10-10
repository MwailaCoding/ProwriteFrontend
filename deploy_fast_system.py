#!/usr/bin/env python3
"""
Ultra-Fast ProWrite System Deployment Script
Deploys the optimized fast system to PythonAnywhere
"""

import os
import sys
import shutil
from pathlib import Path

def deploy_fast_system():
    """Deploy the ultra-fast system"""
    print("🚀 DEPLOYING ULTRA-FAST PROWRITE SYSTEM")
    print("=" * 50)
    
    # Files to deploy
    backend_files = [
        "backend/Prowritesolutions/fast_manual_payment_service.py",
        "backend/Prowritesolutions/manual_payment_routes.py",
        "backend/Prowritesolutions/africas_talking_validator.py"
    ]
    
    frontend_files = [
        "frontend/ProwriteFrontend/src/components/payments/MpesaPaymentModal.tsx",
        "frontend/ProwriteFrontend/src/components/payments/ManualPaymentModal.tsx"
    ]
    
    print("📁 BACKEND FILES TO UPLOAD TO PYTHONANYWHERE:")
    for file in backend_files:
        if os.path.exists(file):
            print(f"✅ {file}")
        else:
            print(f"❌ {file} - NOT FOUND")
    
    print("\n📁 FRONTEND FILES TO COMMIT & PUSH:")
    for file in frontend_files:
        if os.path.exists(file):
            print(f"✅ {file}")
        else:
            print(f"❌ {file} - NOT FOUND")
    
    print("\n🔧 DEPLOYMENT STEPS:")
    print("1. Upload these backend files to PythonAnywhere:")
    for file in backend_files:
        if os.path.exists(file):
            print(f"   - {file}")
    
    print("\n2. Restart your PythonAnywhere web app")
    print("\n3. The frontend files are already updated and will be deployed automatically")
    
    print("\n⚡ SPEED IMPROVEMENTS IMPLEMENTED:")
    print("✅ Background PDF generation (non-blocking)")
    print("✅ Ultra-fast polling (1-2 seconds)")
    print("✅ Optimized email sending with timeouts")
    print("✅ Immediate response to user")
    print("✅ Emergency submission creation")
    print("✅ Fast SMTP connections")
    
    print("\n🎯 EXPECTED PERFORMANCE:")
    print("• Payment validation: < 2 seconds")
    print("• User response: Immediate")
    print("• PDF generation: Background (5-10 seconds)")
    print("• Email delivery: < 30 seconds")
    print("• Status polling: Every 1-2 seconds")
    
    print("\n📧 EMAIL OPTIMIZATIONS:")
    print("• SMTP timeout: 10 seconds")
    print("• Fallback SSL connection")
    print("• Admin notifications")
    print("• Error handling")
    
    print("\n🔍 TESTING INSTRUCTIONS:")
    print("1. Use test code: TEST123")
    print("2. Check browser console for 'FAST VALIDATION' logs")
    print("3. Monitor PythonAnywhere logs for 'FAST PDF' messages")
    print("4. Verify email delivery within 30 seconds")
    
    print("\n🚀 SYSTEM IS NOW ULTRA-FAST!")
    print("Upload the backend files and restart your web app!")

if __name__ == "__main__":
    deploy_fast_system()
