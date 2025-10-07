#!/usr/bin/env python3
"""
Script to process the Pro Template and extract content areas
"""

import requests
import json

def admin_login():
    """Login as admin and get token"""
    try:
        login_data = {
            "email": "admin@prowrite.com",
            "password": "Admin@123"
        }
        
        response = requests.post(
            'http://localhost:5000/api/admin/login',
            json=login_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('access_token')
            print(f"✅ Admin login successful!")
            return token
        else:
            print(f"❌ Login failed: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def process_template(template_id, token):
    """Process the template to extract content areas"""
    try:
        print(f"🔄 Processing template {template_id}...")
        
        response = requests.post(
            f'http://localhost:5000/api/admin/pdf-templates/{template_id}/process-new',
            headers={
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            }
        )
        
        print(f"📡 Response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Template processing successful!")
            print(f"📊 Content areas extracted: {len(result.get('contentAreas', []))}")
            return True
        else:
            print(f"❌ Processing failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Processing error: {e}")
        return False

def verify_content_areas(template_id, token):
    """Verify that content areas were extracted"""
    try:
        print(f"🔍 Verifying content areas for template {template_id}...")
        
        response = requests.get(
            f'http://localhost:5000/api/admin/pdf-templates/{template_id}',
            headers={'Authorization': f'Bearer {token}'}
        )
        
        if response.status_code == 200:
            template = response.json()
            content_areas = template.get('contentAreas', [])
            print(f"✅ Template has {len(content_areas)} content areas")
            
            if content_areas:
                print("\n📝 Content Areas found:")
                for i, area in enumerate(content_areas[:5]):  # Show first 5
                    print(f"  {i+1}. {area.get('name', 'N/A')} - {area.get('type', 'N/A')}")
                
                if len(content_areas) > 5:
                    print(f"  ... and {len(content_areas) - 5} more")
                
                return True
            else:
                print("❌ No content areas found")
                return False
        else:
            print(f"❌ Failed to get template: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Verification error: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Processing Pro Template Content Areas")
    print("=" * 60)
    
    # Step 1: Login as admin
    print("\n1. Logging in as admin...")
    token = admin_login()
    
    if not token:
        print("❌ Cannot proceed without admin token")
        exit(1)
    
    # Step 2: Process the template
    template_id = "2eeafed1-2dbc-48ae-95c5-47a4ff383c48"  # Pro Template ID
    print(f"\n2. Processing template {template_id}...")
    success = process_template(template_id, token)
    
    if success:
        # Step 3: Verify the content areas
        print(f"\n3. Verifying content areas...")
        verify_content_areas(template_id, token)
    
    print("\n" + "=" * 60)
    print("✅ Processing completed!")
    print("\n💡 Now the template should be able to replace content with user form data!")


























