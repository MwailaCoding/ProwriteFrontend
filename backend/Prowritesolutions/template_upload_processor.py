#!/usr/bin/env python3
"""
Template Upload Processor
Handles direct template uploads, AI analysis, and dynamic form schema generation
"""

import os
import json
import uuid
import fitz  # PyMuPDF
from typing import List, Dict, Optional, Any
from datetime import datetime
import mysql.connector
from mysql.connector import Error
from ai_content_processor import RealAIContentProcessor

class TemplateUploadProcessor:
    """Process uploaded templates and generate dynamic form schemas"""
    
    def __init__(self):
        self.ai_processor = RealAIContentProcessor()
        self.upload_folder = "uploads/templates"
        self.thumbnail_folder = "static/thumbnails/templates"
        
        # Create necessary directories
        os.makedirs(self.upload_folder, exist_ok=True)
        os.makedirs(self.thumbnail_folder, exist_ok=True)
    
    def process_uploaded_template(self, file_data: bytes, filename: str, template_info: Dict) -> Dict:
        """Process an uploaded template file and generate form schema"""
        try:
            # Save template file first
            file_path = self._save_template_file(file_data, filename)
            
            # Save template to database and get the ID
            db_result = self._save_template_to_db(
                template_info=template_info,
                file_path=file_path
            )
            
            if not db_result['success']:
                return {
                    'success': False,
                    'error': db_result['error'],
                    'template_id': None
                }
            
            template_id = db_result['template_id']
            
            # Analyze template with AI
            analysis_result = self.ai_processor.process_template_with_real_ai(
                file_path, 
                template_info.get('name', 'Uploaded Template')
            )
            
            if not analysis_result['success']:
                return {
                    'success': False,
                    'error': analysis_result.get('error', 'Template analysis failed'),
                    'template_id': None
                }
            
            # Generate form schema from analysis
            form_schema = self._generate_form_schema(analysis_result['content_areas'])
            
            # Create thumbnail
            thumbnail_path = self._create_thumbnail(file_path, template_id)
            
            # Update database with analysis results
            update_result = self._update_template_with_analysis(
                template_id=template_id,
                thumbnail_path=thumbnail_path,
                form_schema=form_schema,
                content_areas=analysis_result['content_areas'],
                metadata=analysis_result['metadata']
            )
            
            if not update_result['success']:
                return {
                    'success': False,
                    'error': update_result['error'],
                    'template_id': None
                }
            
            return {
                'success': True,
                'template_id': template_id,
                'form_schema': form_schema,
                'content_areas': analysis_result['content_areas'],
                'metadata': analysis_result['metadata'],
                'file_path': file_path,
                'thumbnail_path': thumbnail_path
            }
            
        except Exception as e:
            print(f"Error processing template upload: {e}")
            return {
                'success': False,
                'error': str(e),
                'template_id': None
            }
    
    def _save_template_file(self, file_data: bytes, filename: str) -> str:
        """Save uploaded template file"""
        # Generate safe filename
        safe_filename = f"template_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}.pdf"
        file_path = os.path.join(self.upload_folder, safe_filename)
        
        # Save file
        with open(file_path, 'wb') as f:
            f.write(file_data)
        
        return file_path
    
    def _save_template_to_db(self, template_info: Dict, file_path: str) -> Dict:
        """Save template to database and return the template ID"""
        try:
            connection = self._get_db_connection()
            cursor = connection.cursor()
            
            # Insert into templates table
            cursor.execute("""
                INSERT INTO templates (
                    name, description, file_path, is_premium, price, created_at, difficulty_level
                ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                template_info.get('name', 'Uploaded Template'),
                template_info.get('description', ''),
                file_path,
                template_info.get('is_premium', False),
                template_info.get('price', 0),
                datetime.now(),
                template_info.get('difficulty_level', 'intermediate')
            ))
            
            template_id = cursor.lastrowid
            connection.commit()
            cursor.close()
            connection.close()
            
            return {'success': True, 'template_id': template_id}
            
        except Error as e:
            print(f"Database error: {e}")
            return {'success': False, 'error': str(e)}
        except Exception as e:
            print(f"Error saving template: {e}")
            return {'success': False, 'error': str(e)}
    
    def _update_template_with_analysis(self, template_id: int, thumbnail_path: str, 
                                     form_schema: Dict, content_areas: List[Dict], 
                                     metadata: Dict) -> Dict:
        """Update template with analysis results"""
        try:
            connection = self._get_db_connection()
            cursor = connection.cursor()
            
            # Update template with thumbnail
            cursor.execute("""
                UPDATE templates 
                SET thumbnail_url = %s 
                WHERE template_id = %s
            """, (thumbnail_path, template_id))
            
            # Insert form schema
            cursor.execute("""
                INSERT INTO template_form_schemas (
                    template_id, form_schema, field_mappings, created_at
                ) VALUES (%s, %s, %s, %s)
            """, (
                template_id,
                json.dumps(form_schema),
                json.dumps(content_areas),
                datetime.now()
            ))
            
            connection.commit()
            cursor.close()
            connection.close()
            
            return {'success': True}
            
        except Error as e:
            print(f"Database error: {e}")
            return {'success': False, 'error': str(e)}
        except Exception as e:
            print(f"Error updating template: {e}")
            return {'success': False, 'error': str(e)}
    
    def _generate_form_schema(self, content_areas: List[Dict]) -> Dict:
        """Generate dynamic form schema from content areas"""
        form_schema = {
            'version': '1.0',
            'fields': [],
            'sections': [],
            'validation': {},
            'metadata': {
                'total_fields': 0,
                'required_fields': 0,
                'field_types': {}
            }
        }
        
        # Group fields by type
        field_groups = {}
        
        for area in content_areas:
            field_type = area.get('type', 'text')
            form_field = area.get('formField', 'custom')
            
            if form_field not in field_groups:
                field_groups[form_field] = []
            
            field_groups[form_field].append(area)
        
        # Generate form fields
        field_id = 1
        for form_field, areas in field_groups.items():
            if form_field == 'personalInfo.firstName personalInfo.lastName':
                # Split into separate fields
                form_schema['fields'].extend([
                    {
                        'id': f'field_{field_id}',
                        'name': 'firstName',
                        'label': 'First Name',
                        'type': 'text',
                        'required': True,
                        'validation': {
                            'minLength': 1,
                            'maxLength': 50
                        },
                        'placeholder': 'Enter your first name',
                        'section': 'personalInfo'
                    },
                    {
                        'id': f'field_{field_id + 1}',
                        'name': 'lastName',
                        'label': 'Last Name',
                        'type': 'text',
                        'required': True,
                        'validation': {
                            'minLength': 1,
                            'maxLength': 50
                        },
                        'placeholder': 'Enter your last name',
                        'section': 'personalInfo'
                    }
                ])
                field_id += 2
                
            elif form_field == 'personalInfo.email':
                form_schema['fields'].append({
                    'id': f'field_{field_id}',
                    'name': 'email',
                    'label': 'Email Address',
                    'type': 'email',
                    'required': True,
                    'validation': {
                        'pattern': r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
                    },
                    'placeholder': 'Enter your email address',
                    'section': 'personalInfo'
                })
                field_id += 1
                
            elif form_field == 'personalInfo.phone':
                form_schema['fields'].append({
                    'id': f'field_{field_id}',
                    'name': 'phone',
                    'label': 'Phone Number',
                    'type': 'tel',
                    'required': True,
                    'validation': {
                        'pattern': r'^[\+]?[1-9][\d]{0,15}$'
                    },
                    'placeholder': 'Enter your phone number',
                    'section': 'personalInfo'
                })
                field_id += 1
                
            elif form_field == 'personalInfo.location':
                form_schema['fields'].append({
                    'id': f'field_{field_id}',
                    'name': 'location',
                    'label': 'Location',
                    'type': 'text',
                    'required': False,
                    'validation': {
                        'maxLength': 100
                    },
                    'placeholder': 'City, State/Province',
                    'section': 'personalInfo'
                })
                field_id += 1
                
            elif form_field == 'experience':
                form_schema['fields'].append({
                    'id': f'field_{field_id}',
                    'name': 'experience',
                    'label': 'Work Experience',
                    'type': 'array',
                    'required': True,
                    'itemSchema': {
                        'company': {'type': 'text', 'required': True},
                        'position': {'type': 'text', 'required': True},
                        'startDate': {'type': 'date', 'required': True},
                        'endDate': {'type': 'date', 'required': False},
                        'current': {'type': 'boolean', 'default': False},
                        'description': {'type': 'textarea', 'required': True}
                    },
                    'section': 'experience'
                })
                field_id += 1
                
            elif form_field == 'education':
                form_schema['fields'].append({
                    'id': f'field_{field_id}',
                    'name': 'education',
                    'label': 'Education',
                    'type': 'array',
                    'required': True,
                    'itemSchema': {
                        'institution': {'type': 'text', 'required': True},
                        'degree': {'type': 'text', 'required': True},
                        'fieldOfStudy': {'type': 'text', 'required': True},
                        'startDate': {'type': 'date', 'required': True},
                        'endDate': {'type': 'date', 'required': False},
                        'current': {'type': 'boolean', 'default': False},
                        'gpa': {'type': 'text', 'required': False}
                    },
                    'section': 'education'
                })
                field_id += 1
                
            elif form_field == 'skills':
                form_schema['fields'].append({
                    'id': f'field_{field_id}',
                    'name': 'skills',
                    'label': 'Skills',
                    'type': 'array',
                    'required': False,
                    'itemSchema': {
                        'name': {'type': 'text', 'required': True},
                        'level': {'type': 'select', 'options': ['Beginner', 'Intermediate', 'Advanced', 'Expert']}
                    },
                    'section': 'skills'
                })
                field_id += 1
                
            elif form_field == 'summary':
                form_schema['fields'].append({
                    'id': f'field_{field_id}',
                    'name': 'summary',
                    'label': 'Professional Summary',
                    'type': 'textarea',
                    'required': False,
                    'validation': {
                        'maxLength': 500
                    },
                    'placeholder': 'Write a brief professional summary...',
                    'section': 'summary'
                })
                field_id += 1
                
            else:
                # Custom field
                area = areas[0]
                form_schema['fields'].append({
                    'id': f'field_{field_id}',
                    'name': f'custom_{field_id}',
                    'label': area.get('name', 'Custom Field'),
                    'type': area.get('type', 'text'),
                    'required': area.get('isRequired', False),
                    'placeholder': f'Enter {area.get("name", "information")}',
                    'section': 'custom'
                })
                field_id += 1
        
        # Generate sections
        sections = set(field['section'] for field in form_schema['fields'])
        form_schema['sections'] = [
            {
                'id': section,
                'title': self._get_section_title(section),
                'description': self._get_section_description(section),
                'order': self._get_section_order(section)
            }
            for section in sections
        ]
        
        # Sort sections by order
        form_schema['sections'].sort(key=lambda x: x['order'])
        
        # Update metadata
        form_schema['metadata']['total_fields'] = len(form_schema['fields'])
        form_schema['metadata']['required_fields'] = len([f for f in form_schema['fields'] if f.get('required', False)])
        
        return form_schema
    
    def _get_section_title(self, section: str) -> str:
        """Get human-readable section title"""
        titles = {
            'personalInfo': 'Personal Information',
            'experience': 'Work Experience',
            'education': 'Education',
            'skills': 'Skills & Competencies',
            'summary': 'Professional Summary',
            'custom': 'Additional Information'
        }
        return titles.get(section, section.title())
    
    def _get_section_description(self, section: str) -> str:
        """Get section description"""
        descriptions = {
            'personalInfo': 'Your basic contact and personal information',
            'experience': 'Your professional work history and achievements',
            'education': 'Your academic background and qualifications',
            'skills': 'Your technical and soft skills',
            'summary': 'A brief overview of your professional background',
            'custom': 'Additional information specific to this template'
        }
        return descriptions.get(section, 'Additional information')
    
    def _get_section_order(self, section: str) -> int:
        """Get section display order"""
        order = {
            'personalInfo': 1,
            'summary': 2,
            'experience': 3,
            'education': 4,
            'skills': 5,
            'custom': 6
        }
        return order.get(section, 999)
    
    def _create_thumbnail(self, file_path: str, template_id: int) -> str:
        """Create thumbnail for template"""
        try:
            # For now, return a placeholder path
            # In production, you'd generate actual thumbnails
            thumbnail_path = f"static/thumbnails/templates/template_{template_id}.jpg"
            return thumbnail_path
        except Exception as e:
            print(f"Error creating thumbnail: {e}")
            return ""
    
    def _get_db_connection(self):
        """Get database connection"""
        return mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', ''),
            database=os.getenv('DB_NAME', 'prowrite2')
        )

# Create global instance
template_processor = TemplateUploadProcessor()
