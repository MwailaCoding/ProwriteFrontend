#!/usr/bin/env python3
"""
Advanced Template Processing Module
Provides AI-powered content area detection and intelligent field mapping
"""

import json
import re
from typing import Dict, List, Any, Optional
import os

class AdvancedTemplateProcessor:
    """Advanced PDF template processing with intelligent content detection"""
    
    def __init__(self):
        self.field_patterns = self._initialize_field_patterns()
        self.section_patterns = self._initialize_section_patterns()
    
    def _initialize_field_patterns(self) -> Dict[str, List[str]]:
        """Initialize patterns for detecting different field types"""
        return {
            'personal_info': [
                r'\b(name|first|last|full)\b',
                r'\b(contact|info|details)\b',
                r'\b(about|profile)\b'
            ],
            'email': [
                r'\b(email|e-mail|mail)\b',
                r'@\w+\.\w+',
                r'\b(contact|address)\b'
            ],
            'phone': [
                r'\b(phone|tel|mobile|cell|telephone)\b',
                r'\b(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})\b',
                r'\b(\+\d{1,3}[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,4})\b'
            ],
            'location': [
                r'\b(address|location|city|state|country|zip|postal)\b',
                r'\b(area|region|province)\b'
            ],
            'summary': [
                r'\b(summary|objective|profile|overview)\b',
                r'\b(professional\s+summary|career\s+objective)\b'
            ],
            'experience': [
                r'\b(experience|work|employment|career)\b',
                r'\b(professional\s+background|work\s+history)\b',
                r'\b(jobs|positions|roles)\b'
            ],
            'education': [
                r'\b(education|academic|qualifications|degrees)\b',
                r'\b(university|college|school|institution)\b',
                r'\b(graduation|diploma|certificate)\b'
            ],
            'skills': [
                r'\b(skills|technologies|competencies|expertise)\b',
                r'\b(programming|languages|frameworks|tools)\b',
                r'\b(technical\s+skills|soft\s+skills)\b'
            ],
            'projects': [
                r'\b(projects|portfolio|achievements|accomplishments)\b',
                r'\b(work\s+samples|case\s+studies)\b'
            ],
            'certifications': [
                r'\b(certifications|certificates|licenses|credentials)\b',
                r'\b(training|courses|workshops)\b'
            ]
        }
    
    def _initialize_section_patterns(self) -> Dict[str, List[str]]:
        """Initialize patterns for detecting resume sections"""
        return {
            'header': [
                r'\b(header|top|title)\b',
                r'\b(resume|cv|curriculum\s+vitae)\b'
            ],
            'contact': [
                r'\b(contact|info|details|reach)\b',
                r'\b(phone|email|address|location)\b'
            ],
            'summary': [
                r'\b(summary|objective|profile|overview)\b',
                r'\b(professional\s+summary|career\s+objective)\b'
            ],
            'experience': [
                r'\b(experience|work|employment|career)\b',
                r'\b(professional\s+background|work\s+history)\b'
            ],
            'education': [
                r'\b(education|academic|qualifications|degrees)\b',
                r'\b(university|college|school|institution)\b'
            ],
            'skills': [
                r'\b(skills|technologies|competencies|expertise)\b',
                r'\b(technical\s+skills|soft\s+skills)\b'
            ],
            'projects': [
                r'\b(projects|portfolio|achievements|accomplishments)\b',
                r'\b(work\s+samples|case\s+studies)\b'
            ],
            'certifications': [
                r'\b(certifications|certificates|licenses|credentials)\b',
                r'\b(training|courses|workshops)\b'
            ]
        }
    
    def analyze_template_content(self, pdf_path: str) -> Dict[str, Any]:
        """Analyze PDF template and extract content areas using advanced techniques"""
        try:
            # Try to use PyMuPDF for advanced analysis
            return self._advanced_analysis(pdf_path)
        except ImportError:
            # Fallback to basic analysis
            return self._basic_analysis(pdf_path)
        except Exception as e:
            print(f"Error in template analysis: {str(e)}")
            return self._basic_analysis(pdf_path)
    
    def _advanced_analysis(self, pdf_path: str) -> Dict[str, Any]:
        """Advanced PDF analysis using PyMuPDF"""
        try:
            import fitz  # PyMuPDF
            
            doc = fitz.open(pdf_path)
            content_areas = []
            metadata = {
                'page_count': len(doc),
                'text_blocks': 0,
                'images': 0,
                'forms': 0,
                'suggested_fields': [],
                'analysis_method': 'advanced'
            }
            
            # Analyze each page
            for page_num in range(len(doc)):
                page = doc[page_num]
                
                # Extract text blocks with positioning
                text_blocks = page.get_text("dict")["blocks"]
                
                for block in text_blocks:
                    if "lines" in block:
                        metadata['text_blocks'] += 1
                        
                        # Get text content
                        text_content = self._extract_block_text(block)
                        
                        # Analyze for field types
                        field_analysis = self._analyze_text_block(text_content, block["bbox"])
                        if field_analysis:
                            content_areas.append(field_analysis)
                
                # Detect sections on this page
                page_sections = self._detect_page_sections(page, page_num + 1)
                content_areas.extend(page_sections)
            
            doc.close()
            
            # Post-process and optimize content areas
            content_areas = self._optimize_content_areas(content_areas)
            
            return {
                'content_areas': content_areas,
                'metadata': metadata
            }
            
        except Exception as e:
            print(f"Advanced analysis failed: {str(e)}")
            raise
    
    def _basic_analysis(self, pdf_path: str) -> Dict[str, Any]:
        """Basic PDF analysis fallback"""
        content_areas = [
            {
                'id': 'header_section',
                'type': 'section',
                'page': 1,
                'bbox': [0, 0, 612, 100],
                'text': 'Resume Header',
                'confidence': 0.8,
                'suggested_mapping': {'section': 'header'},
                'priority': 'high'
            },
            {
                'id': 'contact_info',
                'type': 'field',
                'page': 1,
                'bbox': [0, 100, 612, 150],
                'text': 'Contact Information',
                'confidence': 0.9,
                'suggested_mapping': {'field': 'contact'},
                'priority': 'high'
            },
            {
                'id': 'summary_section',
                'type': 'section',
                'page': 1,
                'bbox': [0, 150, 612, 250],
                'text': 'Professional Summary',
                'confidence': 0.8,
                'suggested_mapping': {'section': 'summary'},
                'priority': 'medium'
            },
            {
                'id': 'experience_section',
                'type': 'section',
                'page': 1,
                'bbox': [0, 250, 612, 450],
                'text': 'Work Experience',
                'confidence': 0.9,
                'suggested_mapping': {'section': 'experience'},
                'priority': 'high'
            },
            {
                'id': 'education_section',
                'type': 'section',
                'page': 1,
                'bbox': [0, 450, 612, 550],
                'text': 'Education',
                'confidence': 0.8,
                'suggested_mapping': {'section': 'education'},
                'priority': 'medium'
            },
            {
                'id': 'skills_section',
                'type': 'section',
                'page': 1,
                'bbox': [0, 550, 612, 650],
                'text': 'Skills & Technologies',
                'confidence': 0.8,
                'suggested_mapping': {'section': 'skills'},
                'priority': 'medium'
            }
        ]
        
        metadata = {
            'page_count': 1,
            'text_blocks': len(content_areas),
            'images': 0,
            'forms': 0,
            'suggested_fields': ['personal_info', 'experience', 'education', 'skills'],
            'analysis_method': 'basic'
        }
        
        return {
            'content_areas': content_areas,
            'metadata': metadata
        }
    
    def _extract_block_text(self, block: Dict) -> str:
        """Extract text content from a text block"""
        text_content = ""
        if "lines" in block:
            for line in block["lines"]:
                if "spans" in line:
                    for span in line["spans"]:
                        text_content += span["text"] + " "
        return text_content.strip()
    
    def _analyze_text_block(self, text: str, bbox: List[float]) -> Optional[Dict]:
        """Analyze a text block for field types"""
        if not text or len(text) < 2:
            return None
        
        # Detect field type
        field_type = self._detect_field_type(text)
        if not field_type:
            return None
        
        # Calculate confidence
        confidence = self._calculate_confidence(text, field_type)
        
        # Generate suggested mapping
        suggested_mapping = self._generate_field_mapping(text, field_type)
        
        return {
            'id': f"field_{field_type}_{len(text)}",
            'type': 'field',
            'page': 1,  # Will be updated based on actual page
            'bbox': bbox,
            'text': text,
            'confidence': confidence,
            'suggested_mapping': suggested_mapping,
            'priority': self._get_field_priority(field_type),
            'field_type': field_type
        }
    
    def _detect_field_type(self, text: str) -> Optional[str]:
        """Detect the type of form field based on text content"""
        text_lower = text.lower()
        
        for field_type, patterns in self.field_patterns.items():
            for pattern in patterns:
                if re.search(pattern, text_lower, re.IGNORECASE):
                    return field_type
        
        return None
    
    def _detect_page_sections(self, page, page_num: int) -> List[Dict]:
        """Detect resume sections on a specific page"""
        sections = []
        text = page.get_text().lower()
        
        for section_type, patterns in self.section_patterns.items():
            for pattern in patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    sections.append({
                        'id': f"section_{section_type}_{page_num}",
                        'type': 'section',
                        'page': page_num,
                        'bbox': [0, 0, page.rect.width, page.rect.height],
                        'text': section_type.replace('_', ' ').title(),
                        'confidence': 0.9,
                        'suggested_mapping': {'section': section_type},
                        'priority': 'high'
                    })
                    break  # Only add each section once per page
        
        return sections
    
    def _calculate_confidence(self, text: str, field_type: str) -> float:
        """Calculate confidence score for field detection"""
        base_confidence = 0.7
        
        # Text length adjustment
        if len(text) > 50:
            base_confidence += 0.2
        elif len(text) > 20:
            base_confidence += 0.1
        
        # Field type specific adjustments
        if field_type in ['email', 'phone']:
            base_confidence += 0.1  # These are usually more reliable
        elif field_type in ['summary', 'experience']:
            base_confidence += 0.05  # These are common but can be ambiguous
        
        return min(base_confidence, 1.0)
    
    def _generate_field_mapping(self, text: str, field_type: str) -> Dict[str, str]:
        """Generate suggested field mapping for detected fields"""
        mapping_suggestions = {
            'personal_info': {
                'firstName': 'First Name',
                'lastName': 'Last Name',
                'fullName': 'Full Name'
            },
            'email': {
                'email': 'Email Address'
            },
            'phone': {
                'phone': 'Phone Number'
            },
            'location': {
                'location': 'Location',
                'city': 'City',
                'state': 'State',
                'country': 'Country'
            },
            'summary': {
                'summary': 'Professional Summary'
            },
            'experience': {
                'experience': 'Work Experience'
            },
            'education': {
                'education': 'Education'
            },
            'skills': {
                'skills': 'Skills & Technologies'
            },
            'projects': {
                'projects': 'Projects & Achievements'
            },
            'certifications': {
                'certifications': 'Certifications & Training'
            }
        }
        
        return mapping_suggestions.get(field_type, {})
    
    def _get_field_priority(self, field_type: str) -> str:
        """Get priority level for a field type"""
        high_priority = ['personal_info', 'email', 'phone', 'experience']
        medium_priority = ['summary', 'education', 'skills']
        low_priority = ['projects', 'certifications', 'location']
        
        if field_type in high_priority:
            return 'high'
        elif field_type in medium_priority:
            return 'medium'
        else:
            return 'low'
    
    def _optimize_content_areas(self, content_areas: List[Dict]) -> List[Dict]:
        """Optimize and deduplicate content areas"""
        # Remove duplicates based on text content
        seen_texts = set()
        optimized_areas = []
        
        for area in content_areas:
            text_key = area['text'].lower().strip()
            if text_key not in seen_texts:
                seen_texts.add(text_key)
                optimized_areas.append(area)
        
        # Sort by priority and confidence
        optimized_areas.sort(key=lambda x: (
            self._priority_score(x['priority']),
            x['confidence']
        ), reverse=True)
        
        return optimized_areas
    
    def _priority_score(self, priority: str) -> int:
        """Convert priority string to numeric score"""
        priority_scores = {'high': 3, 'medium': 2, 'low': 1}
        return priority_scores.get(priority, 1)

# Global instance
template_processor = AdvancedTemplateProcessor()









