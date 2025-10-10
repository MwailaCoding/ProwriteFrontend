#!/usr/bin/env python3
"""
Enhanced Template Processor
Analyzes uploaded templates and preserves exact styling while making content dynamic
"""

import os
import json
import fitz  # PyMuPDF
from typing import List, Dict, Optional, Any
from datetime import datetime
import mysql.connector
from mysql.connector import Error
from ai_content_processor import RealAIContentProcessor

class EnhancedTemplateProcessor:
    """Enhanced template processor with style preservation"""
    
    def __init__(self):
        self.ai_processor = RealAIContentProcessor()
        self.upload_folder = "uploads/templates"
        self.thumbnail_folder = "static/thumbnails/templates"
        
        # Create necessary directories
        os.makedirs(self.upload_folder, exist_ok=True)
        os.makedirs(self.thumbnail_folder, exist_ok=True)
    
    def process_template_with_style_preservation(self, file_data: bytes, filename: str, template_info: Dict) -> Dict:
        """Process template with style preservation"""
        try:
            # Save template file
            file_path = self._save_template_file(file_data, filename)
            
            # Save template to database
            db_result = self._save_template_to_db(template_info, file_path)
            if not db_result['success']:
                return {'success': False, 'error': db_result['error'], 'template_id': None}
            
            template_id = db_result['template_id']
            
            # Analyze template styling and content
            style_analysis = self._analyze_template_styling(file_path)
            ai_analysis = self.ai_processor.process_template_with_real_ai(file_path, template_info.get('name', 'Uploaded Template'))
            
            # Generate enhanced form schema with styling
            form_schema = self._generate_style_preserved_schema(style_analysis, ai_analysis)
            
            # Create thumbnail
            thumbnail_path = self._create_thumbnail(file_path, template_id)
            
            # Update database with analysis results
            update_result = self._update_template_with_analysis(
                template_id=template_id,
                thumbnail_path=thumbnail_path,
                form_schema=form_schema,
                content_areas=ai_analysis.get('content_areas', []),
                metadata=ai_analysis.get('metadata', {}),
                style_analysis=style_analysis
            )
            
            if not update_result['success']:
                return {'success': False, 'error': update_result['error'], 'template_id': None}
            
            return {
                'success': True,
                'template_id': template_id,
                'form_schema': form_schema,
                'style_analysis': style_analysis,
                'content_areas': ai_analysis.get('content_areas', []),
                'metadata': ai_analysis.get('metadata', {}),
                'file_path': file_path,
                'thumbnail_path': thumbnail_path
            }
            
        except Exception as e:
            print(f"Error processing template: {e}")
            return {'success': False, 'error': str(e), 'template_id': None}
    
    def _analyze_template_styling(self, file_path: str) -> Dict:
        """Analyze template to extract styling information"""
        try:
            doc = fitz.open(file_path)
            styling_info = {
                'fonts': {},
                'colors': {},
                'layouts': {},
                'content_areas': [],
                'sections': {},
                'page_info': {}
            }
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                page_info = self._analyze_page_styling(page, page_num)
                styling_info['page_info'][page_num] = page_info
                styling_info['fonts'].update(page_info['fonts'])
                styling_info['colors'].update(page_info['colors'])
                styling_info['content_areas'].extend(page_info['content_areas'])
            
            doc.close()
            return styling_info
            
        except Exception as e:
            print(f"Error analyzing template styling: {e}")
            return {}
    
    def _analyze_page_styling(self, page, page_num: int) -> Dict:
        """Analyze styling of a single page"""
        page_info = {
            'fonts': {},
            'colors': {},
            'content_areas': [],
            'dimensions': {'width': page.rect.width, 'height': page.rect.height}
        }
        
        blocks = page.get_text("dict")
        
        for block in blocks.get("blocks", []):
            if "lines" in block:
                for line in block["lines"]:
                    for span in line["spans"]:
                        # Extract styling information
                        self._extract_styling_info(span, page_info)
                        
                        # Identify content areas
                        content_area = self._identify_content_area(span, page_num)
                        if content_area:
                            page_info['content_areas'].append(content_area)
        
        return page_info
    
    def _extract_styling_info(self, span: Dict, page_info: Dict):
        """Extract styling information from text span"""
        font_name = span["font"]
        font_size = span["size"]
        font_color = span["color"]
        
        # Store font information
        if font_name not in page_info['fonts']:
            page_info['fonts'][font_name] = {
                'sizes': set(),
                'colors': set(),
                'usage_count': 0
            }
        
        page_info['fonts'][font_name]['sizes'].add(font_size)
        page_info['fonts'][font_name]['colors'].add(font_color)
        page_info['fonts'][font_name]['usage_count'] += 1
        
        # Store color information
        if font_color not in page_info['colors']:
            page_info['colors'][font_color] = {
                'fonts': set(),
                'sizes': set(),
                'usage_count': 0
            }
        
        page_info['colors'][font_color]['fonts'].add(font_name)
        page_info['colors'][font_color]['sizes'].add(font_size)
        page_info['colors'][font_color]['usage_count'] += 1
    
    def _identify_content_area(self, span: Dict, page_num: int) -> Optional[Dict]:
        """Identify content areas that should be dynamic"""
        text = span["text"].strip()
        if not text:
            return None
        
        # Header/Name detection
        if self._is_header_text(text, span):
            return {
                'type': 'header',
                'subtype': 'name',
                'text': text,
                'bbox': span["bbox"],
                'styling': self._extract_span_styling(span),
                'form_field': 'personalInfo.fullName',
                'page': page_num
            }
        
        # Contact information
        if self._is_contact_info(text, span):
            field_type = 'email' if '@' in text else 'phone'
            return {
                'type': 'contact',
                'subtype': field_type,
                'text': text,
                'bbox': span["bbox"],
                'styling': self._extract_span_styling(span),
                'form_field': f'personalInfo.{field_type}',
                'page': page_num
            }
        
        # Section headers
        if self._is_section_header(text, span):
            section_type = self._identify_section_type(text)
            return {
                'type': 'section_header',
                'subtype': section_type,
                'text': text,
                'bbox': span["bbox"],
                'styling': self._extract_span_styling(span),
                'form_field': section_type,
                'page': page_num
            }
        
        # Education entries
        if self._is_education_entry(text, span):
            return {
                'type': 'education',
                'subtype': 'institution',
                'text': text,
                'bbox': span["bbox"],
                'styling': self._extract_span_styling(span),
                'form_field': 'education',
                'page': page_num
            }
        
        # Experience entries
        if self._is_experience_entry(text, span):
            return {
                'type': 'experience',
                'subtype': 'company',
                'text': text,
                'bbox': span["bbox"],
                'styling': self._extract_span_styling(span),
                'form_field': 'experience',
                'page': page_num
            }
        
        # Skills content
        if self._is_skills_content(text, span):
            return {
                'type': 'skills',
                'subtype': 'skill_item',
                'text': text,
                'bbox': span["bbox"],
                'styling': self._extract_span_styling(span),
                'form_field': 'skills',
                'page': page_num
            }
        
        # Referee content
        if self._is_referee_content(text, span):
            return {
                'type': 'referee',
                'subtype': 'referee_info',
                'text': text,
                'bbox': span["bbox"],
                'styling': self._extract_span_styling(span),
                'form_field': 'referees',
                'page': page_num
            }
        
        return None
    
    def _is_header_text(self, text: str, span: Dict) -> bool:
        """Check if text is a header/name"""
        return (span["size"] > 14 and 
                len(text.split()) <= 4 and 
                not text.isupper() and
                not any(word in text.lower() for word in ['education', 'experience', 'skills', 'referees', 'volunteer']))
    
    def _is_contact_info(self, text: str, span: Dict) -> bool:
        """Check if text is contact information"""
        return ('@' in text or 
                any(char.isdigit() for char in text) and len(text) > 8)
    
    def _is_section_header(self, text: str, span: Dict) -> bool:
        """Check if text is a section header"""
        section_keywords = [
            'EDUCATION', 'PROFESSIONAL EXPERIENCE', 'LEADERSHIP', 'ORGANIZATIONS',
            'VOLUNTEER WORK', 'SKILLS', 'INTERESTS', 'REFEREES'
        ]
        return (text.isupper() and 
                any(keyword in text for keyword in section_keywords))
    
    def _identify_section_type(self, text: str) -> str:
        """Identify section type"""
        text_lower = text.lower()
        if 'education' in text_lower:
            return 'education'
        elif 'experience' in text_lower:
            return 'experience'
        elif 'leadership' in text_lower or 'organizations' in text_lower:
            return 'leadership'
        elif 'volunteer' in text_lower:
            return 'volunteer'
        elif 'skills' in text_lower or 'interests' in text_lower:
            return 'skills'
        elif 'referees' in text_lower:
            return 'referees'
        else:
            return 'custom'
    
    def _is_education_entry(self, text: str, span: Dict) -> bool:
        """Check if text is education entry"""
        education_keywords = ['university', 'college', 'institute', 'school', 'bachelor', 'master', 'phd']
        return any(keyword in text.lower() for keyword in education_keywords)
    
    def _is_experience_entry(self, text: str, span: Dict) -> bool:
        """Check if text is experience entry"""
        experience_keywords = ['director', 'manager', 'coordinator', 'delegate', 'founder', 'chief']
        return any(keyword in text.lower() for keyword in experience_keywords)
    
    def _is_skills_content(self, text: str, span: Dict) -> bool:
        """Check if text is skills content"""
        skills_keywords = ['fluent', 'advocacy', 'communication', 'management', 'office', 'climate', 'environmental']
        return any(keyword in text.lower() for keyword in skills_keywords)
    
    def _is_referee_content(self, text: str, span: Dict) -> bool:
        """Check if text is referee content"""
        referee_keywords = ['chief', 'executive', 'dean', 'founder', 'director', 'manager']
        return any(keyword in text.lower() for keyword in referee_keywords)
    
    def _extract_span_styling(self, span: Dict) -> Dict:
        """Extract styling information from span"""
        return {
            'font': span["font"],
            'size': span["size"],
            'color': span["color"],
            'flags': span.get("flags", 0),
            'bbox': span["bbox"]
        }
    
    def _generate_style_preserved_schema(self, style_analysis: Dict, ai_analysis: Dict) -> Dict:
        """Generate form schema that preserves styling"""
        form_schema = {
            'version': '1.0',
            'style_preserved': True,
            'template_styling': style_analysis,
            'fields': [],
            'sections': [],
            'metadata': {
                'total_fields': 0,
                'required_fields': 0,
                'style_preserved': True
            }
        }
        
        # Group content areas by type
        content_groups = {}
        for area in style_analysis.get('content_areas', []):
            area_type = area['type']
            if area_type not in content_groups:
                content_groups[area_type] = []
            content_groups[area_type].append(area)
        
        # Generate form fields with styling information
        field_id = 1
        
        # Header section
        if 'header' in content_groups:
            form_schema['fields'].append({
                'id': f'field_{field_id}',
                'name': 'fullName',
                'label': 'Full Name',
                'type': 'text',
                'required': True,
                'section': 'header',
                'styling': content_groups['header'][0]['styling'],
                'validation': {'minLength': 1, 'maxLength': 100}
            })
            field_id += 1
        
        # Contact information
        if 'contact' in content_groups:
            for contact in content_groups['contact']:
                field_type = contact['subtype']
                form_schema['fields'].append({
                    'id': f'field_{field_id}',
                    'name': field_type,
                    'label': field_type.title(),
                    'type': field_type,
                    'required': True,
                    'section': 'header',
                    'styling': contact['styling'],
                    'validation': {
                        'pattern': r'^[^\s@]+@[^\s@]+\.[^\s@]+$' if field_type == 'email' else r'^[\+]?[1-9][\d]{0,15}$'
                    }
                })
                field_id += 1
        
        # Education section
        if 'education' in content_groups:
            form_schema['fields'].append({
                'id': f'field_{field_id}',
                'name': 'education',
                'label': 'Education',
                'type': 'array',
                'required': True,
                'section': 'education',
                'styling': content_groups['education'][0]['styling'],
                'itemSchema': {
                    'institution': {'type': 'text', 'required': True},
                    'degree': {'type': 'text', 'required': True},
                    'location': {'type': 'text', 'required': False},
                    'graduationDate': {'type': 'text', 'required': True},
                    'coursework': {'type': 'textarea', 'required': False},
                    'activities': {'type': 'textarea', 'required': False}
                }
            })
            field_id += 1
        
        # Experience section
        if 'experience' in content_groups:
            form_schema['fields'].append({
                'id': f'field_{field_id}',
                'name': 'experience',
                'label': 'Professional Experience',
                'type': 'array',
                'required': True,
                'section': 'experience',
                'styling': content_groups['experience'][0]['styling'],
                'itemSchema': {
                    'company': {'type': 'text', 'required': True},
                    'position': {'type': 'text', 'required': True},
                    'location': {'type': 'text', 'required': False},
                    'dates': {'type': 'text', 'required': True},
                    'responsibilities': {'type': 'textarea', 'required': True}
                }
            })
            field_id += 1
        
        # Leadership section
        if 'section_header' in content_groups:
            leadership_headers = [h for h in content_groups['section_header'] if h['subtype'] == 'leadership']
            if leadership_headers:
                form_schema['fields'].append({
                    'id': f'field_{field_id}',
                    'name': 'leadership',
                    'label': 'Leadership/Organizations',
                    'type': 'array',
                    'required': False,
                    'section': 'leadership',
                    'styling': leadership_headers[0]['styling'],
                    'itemSchema': {
                        'organization': {'type': 'text', 'required': True},
                        'role': {'type': 'text', 'required': True},
                        'location': {'type': 'text', 'required': False},
                        'dates': {'type': 'text', 'required': True},
                        'achievements': {'type': 'textarea', 'required': True}
                    }
                })
                field_id += 1
        
        # Volunteer section
        volunteer_headers = [h for h in content_groups.get('section_header', []) if h['subtype'] == 'volunteer']
        if volunteer_headers:
            form_schema['fields'].append({
                'id': f'field_{field_id}',
                'name': 'volunteer',
                'label': 'Volunteer Work',
                'type': 'array',
                'required': False,
                'section': 'volunteer',
                'styling': volunteer_headers[0]['styling'],
                'itemSchema': {
                    'organization': {'type': 'text', 'required': True},
                    'role': {'type': 'text', 'required': True},
                    'location': {'type': 'text', 'required': False},
                    'dates': {'type': 'text', 'required': True},
                    'responsibilities': {'type': 'textarea', 'required': True}
                }
            })
            field_id += 1
        
        # Skills section
        if 'skills' in content_groups:
            form_schema['fields'].append({
                'id': f'field_{field_id}',
                'name': 'skills',
                'label': 'Skills & Interests',
                'type': 'array',
                'required': False,
                'section': 'skills',
                'styling': content_groups['skills'][0]['styling'],
                'itemSchema': {
                    'name': {'type': 'text', 'required': True},
                    'category': {'type': 'select', 'options': ['Language', 'Skill', 'Interest', 'Program']}
                }
            })
            field_id += 1
        
        # Referees section
        if 'referee' in content_groups:
            form_schema['fields'].append({
                'id': f'field_{field_id}',
                'name': 'referees',
                'label': 'Referees',
                'type': 'array',
                'required': False,
                'section': 'referees',
                'styling': content_groups['referee'][0]['styling'],
                'itemSchema': {
                    'name': {'type': 'text', 'required': True},
                    'position': {'type': 'text', 'required': True},
                    'organization': {'type': 'text', 'required': True},
                    'phone': {'type': 'tel', 'required': True},
                    'email': {'type': 'email', 'required': True}
                }
            })
            field_id += 1
        
        # Define sections
        form_schema['sections'] = [
            {'id': 'header', 'title': 'Personal Information', 'order': 1},
            {'id': 'education', 'title': 'Education', 'order': 2},
            {'id': 'experience', 'title': 'Professional Experience', 'order': 3},
            {'id': 'leadership', 'title': 'Leadership/Organizations', 'order': 4},
            {'id': 'volunteer', 'title': 'Volunteer Work', 'order': 5},
            {'id': 'skills', 'title': 'Skills & Interests', 'order': 6},
            {'id': 'referees', 'title': 'Referees', 'order': 7}
        ]
        
        # Update metadata
        form_schema['metadata']['total_fields'] = len(form_schema['fields'])
        form_schema['metadata']['required_fields'] = len([f for f in form_schema['fields'] if f.get('required', False)])
        
        return form_schema
    
    def _save_template_file(self, file_data: bytes, filename: str) -> str:
        """Save uploaded template file"""
        safe_filename = f"template_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
        file_path = os.path.join(self.upload_folder, safe_filename)
        
        with open(file_path, 'wb') as f:
            f.write(file_data)
        
        return file_path
    
    def _save_template_to_db(self, template_info: Dict, file_path: str) -> Dict:
        """Save template to database"""
        try:
            connection = self._get_db_connection()
            cursor = connection.cursor()
            
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
                                     metadata: Dict, style_analysis: Dict) -> Dict:
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
            
            # Insert form schema with style analysis
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
    
    def _create_thumbnail(self, file_path: str, template_id: int) -> str:
        """Create thumbnail for template"""
        try:
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
enhanced_processor = EnhancedTemplateProcessor()

























