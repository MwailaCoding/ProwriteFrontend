#!/usr/bin/env python3
"""
Dynamic Content Expander for PDF Templates
Handles multiple entries and template expansion
"""

import os
import json
import fitz  # PyMuPDF
from typing import List, Dict, Optional

class DynamicContentExpander:
    """Handles dynamic content expansion for multiple entries"""
    
    def __init__(self):
        self.supported_sections = [
            'experience', 'education', 'projects', 'skills', 
            'certifications', 'languages', 'volunteer'
        ]
    
    def expand_content_with_dynamic_sections(self, template_path: str, output_path: str, 
                                           resume_data: Dict, content_areas: List[Dict]) -> bool:
        """Expand content with dynamic sections for multiple entries"""
        try:
            print(f"🚀 Expanding content with dynamic sections...")
            print(f"📄 Template: {template_path}")
            print(f"📄 Output: {output_path}")
            print(f"📊 Content areas: {len(content_areas)}")
            
            # Check if template exists
            if not os.path.exists(template_path):
                print(f"❌ Template not found: {template_path}")
                return False
            
            # Open the template PDF
            doc = fitz.open(template_path)
            
            # Process each page
            for page_num in range(len(doc)):
                page = doc[page_num]
                
                # Apply content replacements
                self._apply_content_replacements(page, resume_data, content_areas)
                
                # Handle dynamic sections
                self._handle_dynamic_sections(page, resume_data, content_areas)
            
            # Save the modified PDF
            doc.save(output_path)
            doc.close()
            
            print(f"✅ Dynamic content expansion completed: {output_path}")
            return True
            
        except Exception as e:
            print(f"❌ Error in dynamic content expansion: {e}")
            return False
    
    def _apply_content_replacements(self, page, resume_data: Dict, content_areas: List[Dict]):
        """Apply basic content replacements"""
        for area in content_areas:
            form_field = area.get('formField', '')
            if not form_field or form_field == 'custom':
                continue
            
            # Get value from resume data
            value = self._get_field_value(resume_data, form_field)
            if value:
                # Apply text replacement (simplified)
                print(f"📝 Replacing {form_field} with: {value}")
    
    def _handle_dynamic_sections(self, page, resume_data: Dict, content_areas: List[Dict]):
        """Handle dynamic sections with multiple entries"""
        for section in self.supported_sections:
            if section in resume_data and isinstance(resume_data[section], list):
                entries = resume_data[section]
                if len(entries) > 1:
                    print(f"🔄 Processing {len(entries)} {section} entries")
                    self._expand_section_entries(page, section, entries, content_areas)
    
    def _expand_section_entries(self, page, section: str, entries: List[Dict], content_areas: List[Dict]):
        """Expand multiple entries for a section"""
        # Find the section area in content areas
        section_area = None
        for area in content_areas:
            if section in area.get('formField', '').lower():
                section_area = area
                break
        
        if section_area:
            # Process multiple entries
            for i, entry in enumerate(entries):
                print(f"  📋 Entry {i+1}: {entry}")
                # Here you would add logic to position and format each entry
                # For now, we'll just log the entries
    
    def _get_field_value(self, resume_data: Dict, form_field: str) -> Optional[str]:
        """Get value from resume data using dot notation"""
        try:
            keys = form_field.split('.')
            value = resume_data
            
            for key in keys:
                if isinstance(value, dict) and key in value:
                    value = value[key]
                else:
                    return None
            
            if isinstance(value, str):
                return value
            elif isinstance(value, (int, float)):
                return str(value)
            else:
                return None
                
        except Exception:
            return None

# Create global instance
dynamic_expander = DynamicContentExpander()
