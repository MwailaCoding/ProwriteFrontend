#!/usr/bin/env python3
"""
Template Style Analyzer for Francisca Template
Preserves exact styling while making content dynamic
"""

import os
import json
import fitz  # PyMuPDF
from typing import List, Dict, Optional, Any
from datetime import datetime

class FranciscaTemplateAnalyzer:
    """Analyze Francisca template to preserve styling and make content dynamic"""
    
    def __init__(self):
        self.template_styling = {}
        self.content_areas = []
    
    def analyze_francisca_template(self, pdf_path: str) -> Dict:
        """Analyze the Francisca template specifically"""
        try:
            doc = fitz.open(pdf_path)
            analysis = {
                'template_name': 'Francisca Professional Resume',
                'styling': {},
                'content_areas': [],
                'sections': {},
                'form_schema': {}
            }
            
            # Analyze each page
            for page_num in range(len(doc)):
                page = doc[page_num]
                page_analysis = self._analyze_page(page, page_num)
                analysis['content_areas'].extend(page_analysis['content_areas'])
                analysis['styling'].update(page_analysis['styling'])
            
            doc.close()
            
            # Generate form schema based on Francisca template structure
            analysis['form_schema'] = self._generate_francisca_schema(analysis['content_areas'])
            
            return analysis
            
        except Exception as e:
            print(f"Error analyzing Francisca template: {e}")
            return {}
    
    def _analyze_page(self, page, page_num: int) -> Dict:
        """Analyze a single page of the template"""
        page_analysis = {
            'content_areas': [],
            'styling': {}
        }
        
        # Get text blocks with styling information
        blocks = page.get_text("dict")
        
        for block in blocks.get("blocks", []):
            if "lines" in block:
                for line in block["lines"]:
                    for span in line["spans"]:
                        content_area = self._analyze_text_span(span, page_num)
                        if content_area:
                            page_analysis['content_areas'].append(content_area)
                        
                        # Store styling information
                        self._store_styling_info(span, page_analysis['styling'])
        
        return page_analysis
    
    def _analyze_text_span(self, span: Dict, page_num: int) -> Optional[Dict]:
        """Analyze individual text span for content areas"""
        text = span["text"].strip()
        if not text:
            return None
        
        # Header/Name detection (large, centered text)
        if self._is_header_text(text, span):
            return {
                'type': 'header',
                'subtype': 'name',
                'text': text,
                'bbox': span["bbox"],
                'styling': self._extract_styling(span),
                'form_field': 'personalInfo.fullName',
                'page': page_num
            }
        
        # Contact information detection
        if self._is_contact_info(text, span):
            field_type = 'email' if '@' in text else 'phone'
            return {
                'type': 'contact',
                'subtype': field_type,
                'text': text,
                'bbox': span["bbox"],
                'styling': self._extract_styling(span),
                'form_field': f'personalInfo.{field_type}',
                'page': page_num
            }
        
        # Section headers detection
        if self._is_section_header(text, span):
            section_type = self._identify_section_type(text)
            return {
                'type': 'section_header',
                'subtype': section_type,
                'text': text,
                'bbox': span["bbox"],
                'styling': self._extract_styling(span),
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
                'styling': self._extract_styling(span),
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
                'styling': self._extract_styling(span),
                'form_field': 'experience',
                'page': page_num
            }
        
        # Skills and interests
        if self._is_skills_content(text, span):
            return {
                'type': 'skills',
                'subtype': 'skill_item',
                'text': text,
                'bbox': span["bbox"],
                'styling': self._extract_styling(span),
                'form_field': 'skills',
                'page': page_num
            }
        
        # Referees
        if self._is_referee_content(text, span):
            return {
                'type': 'referee',
                'subtype': 'referee_info',
                'text': text,
                'bbox': span["bbox"],
                'styling': self._extract_styling(span),
                'form_field': 'referees',
                'page': page_num
            }
        
        return None
    
    def _is_header_text(self, text: str, span: Dict) -> bool:
        """Check if text is the main header/name"""
        return (span["size"] > 16 and 
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
        education_keywords = ['university', 'college', 'institute', 'school', 'bachelor', 'master', 'phd', 'kenyatta', 'nairobi']
        return any(keyword in text.lower() for keyword in education_keywords)
    
    def _is_experience_entry(self, text: str, span: Dict) -> bool:
        """Check if text is an experience entry"""
        experience_keywords = ['ovac', 'international', 'foundation', 'institute', 'director', 'delegate', 'coordinator']
        return any(keyword in text.lower() for keyword in experience_keywords)
    
    def _is_skills_content(self, text: str, span: Dict) -> bool:
        """Check if text is skills content"""
        skills_keywords = ['fluent', 'swahili', 'english', 'advocacy', 'communication', 'management', 'office', 'climate', 'environmental', 'sustainability']
        return any(keyword in text.lower() for keyword in skills_keywords)
    
    def _is_referee_content(self, text: str, span: Dict) -> bool:
        """Check if text is referee content"""
        referee_keywords = ['chief', 'executive', 'dean', 'founder', 'director', 'manager', 'collins', 'mary', 'stephen']
        return any(keyword in text.lower() for keyword in referee_keywords)
    
    def _extract_styling(self, span: Dict) -> Dict:
        """Extract styling information from span"""
        return {
            'font': span["font"],
            'size': span["size"],
            'color': span["color"],
            'flags': span.get("flags", 0),
            'bbox': span["bbox"]
        }
    
    def _store_styling_info(self, span: Dict, styling: Dict):
        """Store styling information"""
        font_name = span["font"]
        if font_name not in styling:
            styling[font_name] = {
                'sizes': set(),
                'colors': set(),
                'usage_count': 0
            }
        
        styling[font_name]['sizes'].add(span["size"])
        styling[font_name]['colors'].add(span["color"])
        styling[font_name]['usage_count'] += 1
    
    def _generate_francisca_schema(self, content_areas: List[Dict]) -> Dict:
        """Generate form schema specifically for Francisca template"""
        form_schema = {
            'version': '1.0',
            'template_name': 'Francisca Professional Resume',
            'style_preserved': True,
            'fields': [],
            'sections': [],
            'metadata': {
                'total_fields': 0,
                'required_fields': 0,
                'template_type': 'professional_resume'
            }
        }
        
        # Group content areas by type
        content_groups = {}
        for area in content_areas:
            area_type = area['type']
            if area_type not in content_groups:
                content_groups[area_type] = []
            content_groups[area_type].append(area)
        
        field_id = 1
        
        # Header section (Name and Contact)
        if 'header' in content_groups:
            form_schema['fields'].append({
                'id': f'field_{field_id}',
                'name': 'fullName',
                'label': 'Full Name',
                'type': 'text',
                'required': True,
                'section': 'header',
                'styling': content_groups['header'][0]['styling'],
                'validation': {
                    'minLength': 1,
                    'maxLength': 100
                }
            })
            field_id += 1
        
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
        
        # Define sections based on Francisca template structure
        form_schema['sections'] = [
            {
                'id': 'header',
                'title': 'Personal Information',
                'order': 1,
                'description': 'Your name and contact information'
            },
            {
                'id': 'education',
                'title': 'Education',
                'order': 2,
                'description': 'Your academic background and qualifications'
            },
            {
                'id': 'experience',
                'title': 'Professional Experience',
                'order': 3,
                'description': 'Your work history and achievements'
            },
            {
                'id': 'leadership',
                'title': 'Leadership/Organizations',
                'order': 4,
                'description': 'Your leadership roles and organizational involvement'
            },
            {
                'id': 'volunteer',
                'title': 'Volunteer Work',
                'order': 5,
                'description': 'Your volunteer experience and community service'
            },
            {
                'id': 'skills',
                'title': 'Skills & Interests',
                'order': 6,
                'description': 'Your skills, languages, and interests'
            },
            {
                'id': 'referees',
                'title': 'Referees',
                'order': 7,
                'description': 'Professional references'
            }
        ]
        
        # Update metadata
        form_schema['metadata']['total_fields'] = len(form_schema['fields'])
        form_schema['metadata']['required_fields'] = len([f for f in form_schema['fields'] if f.get('required', False)])
        
        return form_schema

# Create global instance
francisca_analyzer = FranciscaTemplateAnalyzer()

























