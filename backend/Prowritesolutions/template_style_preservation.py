#!/usr/bin/env python3
"""
Template Style Preservation System
Preserves exact styling and layout while making content dynamic
"""

import os
import json
import fitz  # PyMuPDF
from typing import List, Dict, Optional, Any, Tuple
from datetime import datetime
import re

class TemplateStylePreservation:
    """Preserve template styling while making content dynamic"""
    
    def __init__(self):
        self.style_mappings = {}
        self.content_areas = []
        self.layout_info = {}
    
    def analyze_template_styling(self, pdf_path: str) -> Dict:
        """Analyze template to extract styling and layout information"""
        try:
            doc = fitz.open(pdf_path)
            styling_info = {
                'fonts': {},
                'colors': {},
                'layouts': {},
                'content_areas': [],
                'sections': {},
                'spacing': {}
            }
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                blocks = page.get_text("dict")
                
                # Analyze text blocks for styling
                for block in blocks.get("blocks", []):
                    if "lines" in block:
                        for line in block["lines"]:
                            for span in line["spans"]:
                                self._analyze_text_span(span, styling_info, page_num)
                
                # Analyze layout structure
                self._analyze_layout_structure(page, styling_info, page_num)
            
            doc.close()
            return styling_info
            
        except Exception as e:
            print(f"Error analyzing template styling: {e}")
            return {}
    
    def _analyze_text_span(self, span: Dict, styling_info: Dict, page_num: int):
        """Analyze individual text span for styling information"""
        text = span["text"].strip()
        if not text:
            return
        
        # Extract font information
        font_name = span["font"]
        font_size = span["size"]
        font_color = span["color"]
        font_flags = span.get("flags", 0)
        
        # Store font information
        if font_name not in styling_info['fonts']:
            styling_info['fonts'][font_name] = {
                'sizes': set(),
                'colors': set(),
                'usage': []
            }
        
        styling_info['fonts'][font_name]['sizes'].add(font_size)
        styling_info['fonts'][font_name]['colors'].add(font_color)
        styling_info['fonts'][font_name]['usage'].append({
            'text': text,
            'size': font_size,
            'color': font_color,
            'flags': font_flags,
            'bbox': span["bbox"],
            'page': page_num
        })
        
        # Analyze content areas based on text patterns
        content_area = self._identify_content_area(text, span, styling_info)
        if content_area:
            styling_info['content_areas'].append(content_area)
    
    def _identify_content_area(self, text: str, span: Dict, styling_info: Dict) -> Optional[Dict]:
        """Identify content areas that should be dynamic"""
        
        # Header/Name patterns
        if self._is_header_text(text, span):
            return {
                'type': 'header',
                'subtype': 'name',
                'text': text,
                'bbox': span["bbox"],
                'font': span["font"],
                'size': span["size"],
                'color': span["color"],
                'form_field': 'personalInfo.firstName personalInfo.lastName',
                'styling': {
                    'font': span["font"],
                    'size': span["size"],
                    'color': span["color"],
                    'alignment': 'center',
                    'bold': bool(span.get("flags", 0) & 2**4)
                }
            }
        
        # Contact information patterns
        if self._is_contact_info(text, span):
            field_type = 'email' if '@' in text else 'phone'
            return {
                'type': 'contact',
                'subtype': field_type,
                'text': text,
                'bbox': span["bbox"],
                'font': span["font"],
                'size': span["size"],
                'color': span["color"],
                'form_field': f'personalInfo.{field_type}',
                'styling': {
                    'font': span["font"],
                    'size': span["size"],
                    'color': span["color"],
                    'alignment': 'center'
                }
            }
        
        # Section headers
        if self._is_section_header(text, span):
            section_type = self._identify_section_type(text)
            return {
                'type': 'section_header',
                'subtype': section_type,
                'text': text,
                'bbox': span["bbox"],
                'font': span["font"],
                'size': span["size"],
                'color': span["color"],
                'form_field': section_type,
                'styling': {
                    'font': span["font"],
                    'size': span["size"],
                    'color': span["color"],
                    'alignment': 'left',
                    'bold': bool(span.get("flags", 0) & 2**4),
                    'uppercase': text.isupper()
                }
            }
        
        # Education entries
        if self._is_education_entry(text, span):
            return {
                'type': 'education',
                'subtype': 'institution',
                'text': text,
                'bbox': span["bbox"],
                'font': span["font"],
                'size': span["size"],
                'color': span["color"],
                'form_field': 'education',
                'styling': {
                    'font': span["font"],
                    'size': span["size"],
                    'color': span["color"],
                    'alignment': 'left',
                    'bold': bool(span.get("flags", 0) & 2**4)
                }
            }
        
        # Experience entries
        if self._is_experience_entry(text, span):
            return {
                'type': 'experience',
                'subtype': 'company',
                'text': text,
                'bbox': span["bbox"],
                'font': span["font"],
                'size': span["size"],
                'color': span["color"],
                'form_field': 'experience',
                'styling': {
                    'font': span["font"],
                    'size': span["size"],
                    'color': span["color"],
                    'alignment': 'left',
                    'bold': bool(span.get("flags", 0) & 2**4)
                }
            }
        
        # Skills and interests
        if self._is_skills_section(text, span):
            return {
                'type': 'skills',
                'subtype': 'skill_item',
                'text': text,
                'bbox': span["bbox"],
                'font': span["font"],
                'size': span["size"],
                'color': span["color"],
                'form_field': 'skills',
                'styling': {
                    'font': span["font"],
                    'size': span["size"],
                    'color': span["color"],
                    'alignment': 'left'
                }
            }
        
        # Referees
        if self._is_referee_entry(text, span):
            return {
                'type': 'referee',
                'subtype': 'referee_info',
                'text': text,
                'bbox': span["bbox"],
                'font': span["font"],
                'size': span["size"],
                'color': span["color"],
                'form_field': 'referees',
                'styling': {
                    'font': span["font"],
                    'size': span["size"],
                    'color': span["color"],
                    'alignment': 'left'
                }
            }
        
        return None
    
    def _is_header_text(self, text: str, span: Dict) -> bool:
        """Check if text is a header/name"""
        # Large font size and centered alignment often indicate header
        return (span["size"] > 14 and 
                len(text.split()) <= 4 and 
                not text.isupper() and
                not any(word in text.lower() for word in ['education', 'experience', 'skills', 'referees']))
    
    def _is_contact_info(self, text: str, span: Dict) -> bool:
        """Check if text is contact information"""
        return ('@' in text or 
                re.match(r'^[\+]?[1-9][\d]{0,15}$', text.replace('-', '').replace(' ', '')))
    
    def _is_section_header(self, text: str, span: Dict) -> bool:
        """Check if text is a section header"""
        section_keywords = [
            'EDUCATION', 'PROFESSIONAL EXPERIENCE', 'LEADERSHIP', 'ORGANIZATIONS',
            'VOLUNTEER WORK', 'SKILLS', 'INTERESTS', 'REFEREES'
        ]
        return (text.isupper() and 
                any(keyword in text for keyword in section_keywords) and
                span["size"] > 10)
    
    def _identify_section_type(self, text: str) -> str:
        """Identify the type of section"""
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
        """Check if text is an education entry"""
        education_keywords = ['university', 'college', 'institute', 'school', 'bachelor', 'master', 'phd']
        return any(keyword in text.lower() for keyword in education_keywords)
    
    def _is_experience_entry(self, text: str, span: Dict) -> bool:
        """Check if text is an experience entry"""
        # Look for company names (often followed by position)
        return (len(text.split()) <= 3 and 
                not text.isupper() and
                span["size"] > 10)
    
    def _is_skills_section(self, text: str, span: Dict) -> bool:
        """Check if text is in skills section"""
        skills_keywords = ['fluent', 'advocacy', 'communication', 'management', 'office', 'climate', 'environmental']
        return any(keyword in text.lower() for keyword in skills_keywords)
    
    def _is_referee_entry(self, text: str, span: Dict) -> bool:
        """Check if text is a referee entry"""
        referee_keywords = ['chief', 'executive', 'dean', 'founder', 'director', 'manager']
        return any(keyword in text.lower() for keyword in referee_keywords)
    
    def _analyze_layout_structure(self, page, styling_info: Dict, page_num: int):
        """Analyze page layout structure"""
        # Get page dimensions
        page_width = page.rect.width
        page_height = page.rect.height
        
        # Analyze text positioning and alignment
        text_blocks = page.get_text("dict")
        
        for block in text_blocks.get("blocks", []):
            if "lines" in block:
                for line in block["lines"]:
                    for span in line["spans"]:
                        bbox = span["bbox"]
                        x_center = (bbox[0] + bbox[2]) / 2
                        page_center = page_width / 2
                        
                        # Determine alignment
                        if abs(x_center - page_center) < 50:
                            alignment = 'center'
                        elif bbox[0] < page_width * 0.3:
                            alignment = 'left'
                        else:
                            alignment = 'right'
                        
                        # Store layout information
                        styling_info['layouts'][f"{page_num}_{len(styling_info['layouts'])}"] = {
                            'bbox': bbox,
                            'alignment': alignment,
                            'font_size': span["size"],
                            'text': span["text"]
                        }
    
    def generate_style_preserved_schema(self, styling_info: Dict) -> Dict:
        """Generate form schema that preserves styling"""
        form_schema = {
            'version': '1.0',
            'template_styling': {
                'fonts': styling_info['fonts'],
                'layouts': styling_info['layouts'],
                'content_areas': styling_info['content_areas']
            },
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
        for area in styling_info['content_areas']:
            area_type = area['type']
            if area_type not in content_groups:
                content_groups[area_type] = []
            content_groups[area_type].append(area)
        
        # Generate form fields with styling information
        field_id = 1
        for area_type, areas in content_groups.items():
            if area_type == 'header':
                # Name field
                form_schema['fields'].append({
                    'id': f'field_{field_id}',
                    'name': 'fullName',
                    'label': 'Full Name',
                    'type': 'text',
                    'required': True,
                    'section': 'header',
                    'styling': areas[0]['styling'],
                    'bbox': areas[0]['bbox'],
                    'validation': {
                        'minLength': 1,
                        'maxLength': 100
                    }
                })
                field_id += 1
                
            elif area_type == 'contact':
                for area in areas:
                    field_type = area['subtype']
                    form_schema['fields'].append({
                        'id': f'field_{field_id}',
                        'name': field_type,
                        'label': field_type.title(),
                        'type': field_type,
                        'required': True,
                        'section': 'header',
                        'styling': area['styling'],
                        'bbox': area['bbox'],
                        'validation': {
                            'pattern': r'^[^\s@]+@[^\s@]+\.[^\s@]+$' if field_type == 'email' else r'^[\+]?[1-9][\d]{0,15}$'
                        }
                    })
                    field_id += 1
                    
            elif area_type == 'section_header':
                # Section headers are not form fields, but define sections
                for area in areas:
                    section_type = area['subtype']
                    form_schema['sections'].append({
                        'id': section_type,
                        'title': area['text'],
                        'styling': area['styling'],
                        'bbox': area['bbox'],
                        'order': self._get_section_order(section_type)
                    })
                    
            elif area_type in ['education', 'experience', 'leadership', 'volunteer']:
                # These are array fields with complex structure
                form_schema['fields'].append({
                    'id': f'field_{field_id}',
                    'name': area_type,
                    'label': area_type.title(),
                    'type': 'array',
                    'required': True,
                    'section': area_type,
                    'styling': areas[0]['styling'],
                    'itemSchema': self._get_item_schema_for_type(area_type),
                    'template_styling': {
                        'font': areas[0]['styling']['font'],
                        'size': areas[0]['styling']['size'],
                        'color': areas[0]['styling']['color']
                    }
                })
                field_id += 1
                
            elif area_type == 'skills':
                form_schema['fields'].append({
                    'id': f'field_{field_id}',
                    'name': 'skills',
                    'label': 'Skills & Interests',
                    'type': 'array',
                    'required': False,
                    'section': 'skills',
                    'styling': areas[0]['styling'],
                    'itemSchema': {
                        'name': {'type': 'text', 'required': True},
                        'category': {'type': 'select', 'options': ['Language', 'Skill', 'Interest', 'Program']}
                    }
                })
                field_id += 1
                
            elif area_type == 'referee':
                form_schema['fields'].append({
                    'id': f'field_{field_id}',
                    'name': 'referees',
                    'label': 'Referees',
                    'type': 'array',
                    'required': False,
                    'section': 'referees',
                    'styling': areas[0]['styling'],
                    'itemSchema': {
                        'name': {'type': 'text', 'required': True},
                        'position': {'type': 'text', 'required': True},
                        'organization': {'type': 'text', 'required': True},
                        'phone': {'type': 'tel', 'required': True},
                        'email': {'type': 'email', 'required': True}
                    }
                })
                field_id += 1
        
        # Sort sections by order
        form_schema['sections'].sort(key=lambda x: x['order'])
        
        # Update metadata
        form_schema['metadata']['total_fields'] = len(form_schema['fields'])
        form_schema['metadata']['required_fields'] = len([f for f in form_schema['fields'] if f.get('required', False)])
        
        return form_schema
    
    def _get_item_schema_for_type(self, area_type: str) -> Dict:
        """Get item schema for array fields"""
        schemas = {
            'education': {
                'institution': {'type': 'text', 'required': True},
                'degree': {'type': 'text', 'required': True},
                'location': {'type': 'text', 'required': False},
                'graduationDate': {'type': 'text', 'required': True},
                'coursework': {'type': 'textarea', 'required': False},
                'activities': {'type': 'textarea', 'required': False}
            },
            'experience': {
                'company': {'type': 'text', 'required': True},
                'position': {'type': 'text', 'required': True},
                'location': {'type': 'text', 'required': False},
                'dates': {'type': 'text', 'required': True},
                'responsibilities': {'type': 'textarea', 'required': True}
            },
            'leadership': {
                'organization': {'type': 'text', 'required': True},
                'role': {'type': 'text', 'required': True},
                'location': {'type': 'text', 'required': False},
                'dates': {'type': 'text', 'required': True},
                'achievements': {'type': 'textarea', 'required': True}
            },
            'volunteer': {
                'organization': {'type': 'text', 'required': True},
                'role': {'type': 'text', 'required': True},
                'location': {'type': 'text', 'required': False},
                'dates': {'type': 'text', 'required': True},
                'responsibilities': {'type': 'textarea', 'required': True}
            }
        }
        return schemas.get(area_type, {})
    
    def _get_section_order(self, section_type: str) -> int:
        """Get section display order"""
        order = {
            'header': 1,
            'education': 2,
            'experience': 3,
            'leadership': 4,
            'volunteer': 5,
            'skills': 6,
            'referees': 7
        }
        return order.get(section_type, 999)

# Create global instance
style_preservation = TemplateStylePreservation()

























