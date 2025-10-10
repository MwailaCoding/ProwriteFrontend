#!/usr/bin/env python3
"""
Template Form Generator - Creates dynamic forms based on template content areas
"""

import json
import requests
from typing import List, Dict, Any

class TemplateFormGenerator:
    """Generates dynamic forms based on template content areas"""
    
    def __init__(self):
        self.base_url = "http://localhost:5000"
        self.admin_token = None
    
    def login_as_admin(self):
        """Login as admin to access template data"""
        try:
            login_data = {
                'email': 'admin@prowrite.com',
                'password': 'Admin@123'
            }
            
            response = requests.post(
                f'{self.base_url}/api/admin/login',
                json=login_data,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                self.admin_token = response.json().get('access_token')
                print("✅ Admin login successful")
                return True
            else:
                print(f"❌ Admin login failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Login error: {e}")
            return False
    
    def get_template_content_areas(self, template_id: str) -> List[Dict]:
        """Get content areas for a specific template"""
        try:
            if not self.admin_token:
                print("❌ Not logged in")
                return []
            
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {self.admin_token}'
            }
            
            response = requests.get(
                f'{self.base_url}/api/admin/pdf-templates/{template_id}',
                headers=headers
            )
            
            if response.status_code == 200:
                template = response.json()
                content_areas = template.get('content_areas', [])
                
                if isinstance(content_areas, str):
                    try:
                        content_areas = json.loads(content_areas)
                    except:
                        content_areas = []
                
                print(f"✅ Found {len(content_areas)} content areas for template")
                return content_areas
            else:
                print(f"❌ Failed to get template: {response.status_code}")
                return []
                
        except Exception as e:
            print(f"❌ Error getting content areas: {e}")
            return []
    
    def generate_form_structure(self, content_areas: List[Dict]) -> Dict:
        """Generate form structure based on content areas"""
        form_structure = {
            'sections': [],
            'fields': []
        }
        
        # Group content areas by type
        field_groups = {}
        
        for area in content_areas:
            form_field = area.get('formField', '')
            field_type = area.get('type', 'text')
            field_name = area.get('name', 'Unknown')
            
            if not form_field or form_field == 'custom':
                continue
            
            # Parse form field to determine section and field
            if '.' in form_field:
                section, field = form_field.split('.', 1)
            else:
                section = 'general'
                field = form_field
            
            if section not in field_groups:
                field_groups[section] = []
            
            field_groups[section].append({
                'name': field_name,
                'formField': form_field,
                'type': field_type,
                'content': area.get('content', ''),
                'placeholder': area.get('placeholder', ''),
                'required': area.get('isRequired', False)
            })
        
        # Create form sections
        for section, fields in field_groups.items():
            section_data = {
                'section': section,
                'title': self._get_section_title(section),
                'fields': []
            }
            
            for field in fields:
                field_data = {
                    'name': field['name'],
                    'formField': field['formField'],
                    'type': self._get_field_type(field['type']),
                    'placeholder': field['placeholder'],
                    'required': field['required'],
                    'value': field['content']
                }
                section_data['fields'].append(field_data)
            
            form_structure['sections'].append(section_data)
            form_structure['fields'].extend(section_data['fields'])
        
        return form_structure
    
    def _get_section_title(self, section: str) -> str:
        """Get human-readable section title"""
        titles = {
            'personalInfo': 'Personal Information',
            'experience': 'Work Experience',
            'education': 'Education',
            'skills': 'Skills',
            'summary': 'Summary',
            'general': 'General Information'
        }
        return titles.get(section, section.title())
    
    def _get_field_type(self, field_type: str) -> str:
        """Get appropriate form field type"""
        type_mapping = {
            'email': 'email',
            'phone': 'tel',
            'date': 'date',
            'text': 'text',
            'textarea': 'textarea'
        }
        return type_mapping.get(field_type, 'text')
    
    def generate_form_data(self, form_structure: Dict) -> Dict:
        """Generate sample form data based on form structure"""
        form_data = {}
        
        for section in form_structure['sections']:
            section_name = section['section']
            
            if section_name == 'personalInfo':
                form_data[section_name] = {
                    'firstName': 'John',
                    'lastName': 'Doe',
                    'email': 'john.doe@example.com',
                    'phone': '123-456-7890',
                    'location': 'New York, NY'
                }
            elif section_name == 'experience':
                form_data[section_name] = [
                    {
                        'company': 'Tech Corp',
                        'position': 'Senior Developer',
                        'startDate': '2020-01',
                        'endDate': '2023-12',
                        'description': 'Led development of web applications'
                    }
                ]
            elif section_name == 'education':
                form_data[section_name] = [
                    {
                        'institution': 'University of Technology',
                        'degree': 'Bachelor of Computer Science',
                        'graduationYear': '2020'
                    }
                ]
            elif section_name == 'skills':
                form_data[section_name] = ['JavaScript', 'React', 'Node.js', 'Python']
            elif section_name == 'summary':
                form_data[section_name] = 'Experienced software engineer with expertise in web development.'
        
        return form_data
    
    def test_template_form_generation(self, template_id: str):
        """Test the complete template form generation process"""
        try:
            print(f"🧪 Testing template form generation for template: {template_id}")
            
            # Step 1: Get content areas
            print("\n1. Getting content areas...")
            content_areas = self.get_template_content_areas(template_id)
            
            if not content_areas:
                print("❌ No content areas found")
                return
            
            print(f"   Found {len(content_areas)} content areas")
            
            # Step 2: Generate form structure
            print("\n2. Generating form structure...")
            form_structure = self.generate_form_structure(content_areas)
            
            print(f"   Generated {len(form_structure['sections'])} sections")
            print(f"   Total fields: {len(form_structure['fields'])}")
            
            # Step 3: Generate sample form data
            print("\n3. Generating sample form data...")
            form_data = self.generate_form_data(form_structure)
            
            # Step 4: Test content replacement
            print("\n4. Testing content replacement...")
            test_data = {
                "template_id": template_id,
                "resume_data": form_data
            }
            
            response = requests.post(
                f'{self.base_url}/api/resumes/generate',
                json=test_data,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"   ✅ Content replacement successful!")
                print(f"   📄 Generated PDF: {result.get('pdf_path', 'Unknown')}")
                print(f"   🆔 Resume ID: {result.get('resume_id', 'Unknown')}")
            else:
                print(f"   ❌ Content replacement failed: {response.status_code}")
                print(f"   Response: {response.text}")
            
            # Step 5: Show form structure
            print(f"\n📋 Generated Form Structure:")
            print(json.dumps(form_structure, indent=2))
            
            return form_structure
            
        except Exception as e:
            print(f"❌ Error in template form generation: {e}")
            return None

def main():
    """Main function to test template form generation"""
    generator = TemplateFormGenerator()
    
    if not generator.login_as_admin():
        return
    
    # Test with the first template that has content areas
    print("\n📡 Getting templates...")
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {generator.admin_token}'
    }
    
    response = requests.get(
        f'{generator.base_url}/api/admin/pdf-templates',
        headers=headers
    )
    
    if response.status_code == 200:
        templates = response.json()
        
        # Find first template with content areas
        for template in templates:
            content_areas = template.get('content_areas', [])
            if isinstance(content_areas, str):
                try:
                    content_areas = json.loads(content_areas)
                except:
                    content_areas = []
            
            if len(content_areas) > 0:
                template_id = template.get('id')
                template_name = template.get('name', 'Unknown')
                
                print(f"\n🎯 Testing with template: {template_name}")
                print(f"   ID: {template_id}")
                print(f"   Content Areas: {len(content_areas)}")
                
                generator.test_template_form_generation(template_id)
                break
    else:
        print(f"❌ Failed to get templates: {response.status_code}")

if __name__ == "__main__":
    main()
