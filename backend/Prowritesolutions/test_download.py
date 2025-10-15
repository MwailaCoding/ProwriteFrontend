#!/usr/bin/env python3
"""
Simple test script to verify PDF download functionality
Run this directly on PythonAnywhere to test the backend
"""

import requests
import json

def test_backend_health():
    """Test if backend is healthy"""
    try:
        response = requests.get('https://prowrite.pythonanywhere.com/api/health')
        print(f"Health Check Status: {response.status_code}")
        print(f"Health Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_pdf_download(reference):
    """Test PDF download endpoint"""
    try:
        url = f'https://prowrite.pythonanywhere.com/api/downloads/resume_{reference}.pdf'
        print(f"Testing PDF download: {url}")
        
        response = requests.head(url)
        print(f"PDF Download Status: {response.status_code}")
        print(f"Content-Type: {response.headers.get('Content-Type', 'Not set')}")
        
        if response.status_code == 200:
            print("✅ PDF download endpoint is working!")
            return True
        else:
            print(f"❌ PDF download failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"PDF download test failed: {e}")
        return False

def test_shared_document(reference):
    """Test shared document endpoint"""
    try:
        url = f'https://prowrite.pythonanywhere.com/api/documents/shared/{reference}'
        print(f"Testing shared document: {url}")
        
        response = requests.get(url)
        print(f"Shared Document Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Shared document endpoint working: {data}")
            return True
        else:
            print(f"❌ Shared document failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"Shared document test failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Testing Prowrite Backend Endpoints")
    print("=" * 50)
    
    # Test health
    health_ok = test_backend_health()
    print()
    
    # Test with a sample reference
    test_reference = "PAY-6B8F1069"  # Replace with actual reference
    print(f"Testing with reference: {test_reference}")
    print()
    
    # Test PDF download
    pdf_ok = test_pdf_download(test_reference)
    print()
    
    # Test shared document
    shared_ok = test_shared_document(test_reference)
    print()
    
    # Summary
    print("=" * 50)
    print("📊 TEST SUMMARY:")
    print(f"Health Check: {'✅ PASS' if health_ok else '❌ FAIL'}")
    print(f"PDF Download: {'✅ PASS' if pdf_ok else '❌ FAIL'}")
    print(f"Shared Document: {'✅ PASS' if shared_ok else '❌ FAIL'}")
    
    if health_ok and pdf_ok and shared_ok:
        print("\n🎉 ALL TESTS PASSED! Backend is working correctly.")
    else:
        print("\n⚠️ Some tests failed. Check the backend configuration.")



