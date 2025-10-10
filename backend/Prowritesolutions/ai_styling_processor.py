#!/usr/bin/env python3
"""
AI Styling Processor - Professional Template Analysis and Styling
"""

import os
import json
import fitz  # PyMuPDF
from typing import List, Dict, Optional
import re

class AIStylingProcessor:
    """AI-powered styling processor with comprehensive template analysis"""
    
    def __init__(self):
        # Professional styling presets
        self.style_presets = {
            'name': {'font_size': 28, 'font_name': 'helvetica-bold', 'color': (0, 0, 0)},
            'email': {'font_size': 11, 'font_name': 'helvetica', 'color': (0.3, 0.3, 0.3)},
            'phone': {'font_size': 11, 'font_name': 'helvetica', 'color': (0.3, 0.3, 0.3)},
            'location': {'font_size': 11, 'font_name': 'helvetica', 'color': (0.3, 0.3, 0.3)},
            'section_header': {'font_size': 18, 'font_name': 'helvetica-bold', 'color': (0, 0, 0)},
            'company': {'font_size': 16, 'font_name': 'helvetica-bold', 'color': (0, 0, 0)},
            'position': {'font_size': 14, 'font_name': 'helvetica-bold', 'color': (0.1, 0.1, 0.1)},
            'institution': {'font_size': 16, 'font_name': 'helvetica-bold', 'color': (0, 0, 0)},
            'degree': {'font_size': 14, 'font_name': 'helvetica-bold', 'color': (0.1, 0.1, 0.1)},
            'dates': {'font_size': 12, 'font_name': 'helvetica', 'color': (0.4, 0.4, 0.4)},
            'description': {'font_size': 11, 'font_name': 'helvetica', 'color': (0.3, 0.3, 0.3)},
            'skills': {'font_size': 11, 'font_name': 'helvetica', 'color': (0.3, 0.3, 0.3)},
            'summary': {'font_size': 12, 'font_name': 'helvetica', 'color': (0.2, 0.2, 0.2)}
        }
    
    def analyze_template_comprehensive(self, pdf_path: str) -> Dict:
        """Comprehensive template analysis with AI-powered detection"""
        print(f"🔍 Comprehensive AI Template Analysis: {pdf_path}")
        
        try:
            doc = fitz.open(pdf_path)
            content_areas = []
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                text_blocks = self._extract_text_blocks_with_styling(page)
                page_areas = self._detect_content_areas_ai(text_blocks, page_num)
                content_areas.extend(page_areas)
            
            doc.close()
            
            # Optimize to prevent overlapping
            optimized_areas = self._optimize_content_areas(content_areas)
            
            return {
                'success': True,
                'content_areas': optimized_areas,
                'template_info': {
                    'pages': len(doc),
                    'total_areas': len(optimized_areas)
                }
            }
            
        except Exception as e:
            print(f"❌ Template analysis failed: {e}")
            return {'success': False, 'error': str(e)}
    
    def _extract_text_blocks_with_styling(self, page) -> List[Dict]:
        """Extract text blocks with comprehensive styling information"""
        text_blocks = []
        
        try:
            text_dict = page.get_text("dict")
            
            for block in text_dict.get("blocks", []):
                if "lines" in block:
                    for line in block["lines"]:
                        for span in line["spans"]:
                            text = span["text"].strip()
                            if text and len(text) > 1:
                                styling_info = {
                                    'font_name': span.get("font", "helvetica"),
                                    'font_size': span.get("size", 12),
                                    'color': span.get("color", (0, 0, 0)),
                                    'flags': span.get("flags", 0),
                                    'is_bold': bool(span.get("flags", 0) & 2**4),
                                    'is_italic': bool(span.get("flags", 0) & 2**1),
                                    'bbox': span["bbox"],
                                    'text': text
                                }
                                text_blocks.append(styling_info)
            
            return text_blocks
            
        except Exception as e:
            print(f"Error extracting text blocks: {e}")
            return []
    
    def _detect_content_areas_ai(self, text_blocks: List[Dict], page_num: int) -> List[Dict]:
        """AI-powered content area detection"""
        content_areas = []
        area_id = 1
        
        for block in text_blocks:
            text = block['text'].lower()
            bbox = block['bbox']
            
            content_type = self._classify_content_type(text, block)
            
            if content_type:
                content_area = {
                    'id': f"area_{page_num}_{area_id}",
                    'name': self._generate_area_name(text, content_type),
                    'type': content_type,
                    'form_field': self._map_to_form_field(text, content_type),
                    'content': block['text'],
                    'coordinates': {
                        'x': bbox[0],
                        'y': bbox[1],
                        'width': bbox[2] - bbox[0],
                        'height': bbox[3] - bbox[1]
                    },
                    'original_style': {
                        'font_name': block['font_name'],
                        'font_size': block['font_size'],
                        'color': block['color'],
                        'is_bold': block['is_bold'],
                        'is_italic': block['is_italic']
                    },
                    'confidence': self._calculate_confidence(text, content_type),
                    'is_required': self._is_required_field(content_type),
                    'priority': self._calculate_priority(content_type, block['font_size'])
                }
                
                content_areas.append(content_area)
                area_id += 1
        
        return content_areas
    
    def _classify_content_type(self, text: str, block: Dict) -> Optional[str]:
        """Classify content type using AI patterns"""
        text_lower = text.lower()
        
        # Personal information
        if '@' in text or 'email' in text_lower:
            return 'email'
        elif any(word in text_lower for word in ['phone', 'mobile', 'tel']):
            return 'phone'
        elif any(word in text_lower for word in ['address', 'location', 'city']):
            return 'location'
        elif any(word in text_lower for word in ['name', 'full name']):
            return 'name'
        
        # Experience
        elif any(word in text_lower for word in ['experience', 'work history']):
            return 'section_header'
        elif any(word in text_lower for word in ['company', 'employer']):
            return 'company'
        elif any(word in text_lower for word in ['position', 'job', 'title']):
            return 'position'
        
        # Education
        elif any(word in text_lower for word in ['education', 'academic']):
            return 'section_header'
        elif any(word in text_lower for word in ['university', 'college', 'institution']):
            return 'institution'
        elif any(word in text_lower for word in ['degree', 'bachelor', 'master']):
            return 'degree'
        
        # Skills
        elif any(word in text_lower for word in ['skills', 'competencies', 'technologies']):
            return 'skills'
        
        # Summary
        elif any(word in text_lower for word in ['summary', 'objective', 'profile']):
            return 'summary'
        
        # Dates
        elif re.match(r'\d{4}', text) or any(word in text_lower for word in ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']):
            return 'dates'
        
        return None
    
    def _generate_area_name(self, text: str, content_type: str) -> str:
        """Generate descriptive name for content area"""
        name_map = {
            'name': 'Personal Name',
            'email': 'Email Address',
            'phone': 'Phone Number',
            'location': 'Location/Address',
            'company': 'Company Name',
            'position': 'Job Position',
            'institution': 'Educational Institution',
            'degree': 'Degree/Qualification',
            'dates': 'Date Information',
            'skills': 'Skills Section',
            'summary': 'Summary/Objective'
        }
        return name_map.get(content_type, text[:30] + '...' if len(text) > 30 else text)
    
    def _map_to_form_field(self, text: str, content_type: str) -> str:
        """Map content type to form field"""
        mapping = {
            'name': 'personalInfo.firstName personalInfo.lastName',
            'email': 'personalInfo.email',
            'phone': 'personalInfo.phone',
            'location': 'personalInfo.location',
            'company': 'experience.company',
            'position': 'experience.position',
            'institution': 'education.institution',
            'degree': 'education.degree',
            'dates': 'experience.startDate experience.endDate',
            'skills': 'skills',
            'summary': 'summary'
        }
        return mapping.get(content_type, 'custom')
    
    def _calculate_confidence(self, text: str, content_type: str) -> float:
        """Calculate confidence score for content detection"""
        if content_type == 'email' and '@' in text:
            return 0.95
        elif content_type == 'phone' and re.search(r'\d{3}[-.]?\d{3}[-.]?\d{4}', text):
            return 0.9
        elif content_type == 'dates' and re.match(r'\d{4}', text):
            return 0.85
        elif content_type == 'name' and len(text.split()) >= 2:
            return 0.8
        return 0.7
    
    def _is_required_field(self, content_type: str) -> bool:
        """Determine if field is typically required"""
        required_fields = ['name', 'email', 'phone', 'company', 'position', 'institution', 'degree']
        return content_type in required_fields
    
    def _calculate_priority(self, content_type: str, font_size: float) -> int:
        """Calculate positioning priority"""
        priority_map = {
            'name': 1, 'email': 2, 'phone': 3, 'location': 4, 'summary': 5,
            'section_header': 6, 'company': 7, 'position': 8, 'institution': 9,
            'degree': 10, 'dates': 11, 'skills': 12
        }
        return priority_map.get(content_type, 99)
    
    def _optimize_content_areas(self, content_areas: List[Dict]) -> List[Dict]:
        """Optimize content areas to prevent overlapping"""
        sorted_areas = sorted(content_areas, key=lambda x: (x['priority'], x['coordinates']['y']))
        optimized_areas = []
        used_positions = []
        
        for area in sorted_areas:
            if not self._check_overlap(area, used_positions):
                optimized_areas.append(area)
                used_positions.append(area['coordinates'])
            else:
                adjusted_coords = self._adjust_position(area['coordinates'], used_positions)
                area['coordinates'] = adjusted_coords
                optimized_areas.append(area)
                used_positions.append(adjusted_coords)
        
        return optimized_areas
    
    def _check_overlap(self, area: Dict, used_positions: List[Dict]) -> bool:
        """Check if area overlaps with existing positions"""
        coords = area.get('coordinates', {})
        area_rect = (
            coords.get('x', 0),
            coords.get('y', 0),
            coords.get('x', 0) + coords.get('width', 0),
            coords.get('y', 0) + coords.get('height', 0)
        )
        
        for pos in used_positions:
            pos_rect = (
                pos.get('x', 0), pos.get('y', 0),
                pos.get('x', 0) + pos.get('width', 0),
                pos.get('y', 0) + pos.get('height', 0)
            )
            
            if not (area_rect[2] < pos_rect[0] or area_rect[0] > pos_rect[2] or
                   area_rect[3] < pos_rect[1] or area_rect[1] > pos_rect[3]):
                return True
        return False
    
    def _adjust_position(self, coords: Dict, used_positions: List[Dict]) -> Dict:
        """Adjust position to prevent overlap"""
        adjusted_coords = coords.copy()
        adjusted_coords['y'] += 30
        
        # Create temporary area for overlap check
        temp_area = {'coordinates': adjusted_coords}
        if self._check_overlap(temp_area, used_positions):
            adjusted_coords['x'] += 50
        
        return adjusted_coords

# Create global instance
ai_styling_processor = AIStylingProcessor()
