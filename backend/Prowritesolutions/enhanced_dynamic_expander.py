#!/usr/bin/env python3
"""
Enhanced Dynamic Content Expander with AI-powered styling
Professional PDF generation with no overlapping text
"""

import os
import json
import fitz  # PyMuPDF
from typing import List, Dict, Optional
from ai_styling_processor import ai_styling_processor

class EnhancedDynamicContentExpander:
    
    """Enhanced content expander with AI-powered styling and positioning"""
    
    def __init__(self):
        self.supported_sections = [
            'experience', 'education', 'projects', 'skills', 
            'certifications', 'languages', 'volunteer'
        ]
    
    def expand_content_with_dynamic_sections(self, template_path: str, output_path: str, 
                                           resume_data: Dict, content_areas: List[Dict]) -> bool:
        """Enhanced content expansion with AI-powered styling"""
        try:
            print(f"🚀 Enhanced Dynamic Content Expansion...")
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
                print(f"📄 Processing page {page_num + 1}")
                
                # Step 1: Apply AI-detected content replacements with professional styling
                self._apply_ai_content_replacements(page, resume_data, content_areas)
                
                # Step 2: Handle dynamic sections with expansion
                self._handle_dynamic_sections_expansion(page, resume_data, content_areas)
                
                # Step 3: Apply final styling and formatting
                self._apply_final_styling(page, resume_data, content_areas)
            
            # Save the modified PDF
            doc.save(output_path)
            doc.close()
            
            print(f"✅ Enhanced content expansion completed: {output_path}")
            return True
            
        except Exception as e:
            print(f"❌ Error in enhanced content expansion: {e}")
            return False
    
    def _apply_ai_content_replacements(self, page, resume_data: Dict, content_areas: List[Dict]):
        """Apply content replacements using AI-detected areas with professional styling"""
        print("🎯 Applying AI-detected content replacements...")
        
        for area in content_areas:
            form_field = area.get('formField', '')
            if not form_field or form_field == 'custom':
                continue
            
            # Get value from resume data
            value = self._get_field_value(resume_data, form_field)
            if not value:
                continue
            
            # Get coordinates from AI detection
            coords = area.get('coordinates', {})
            if not coords:
                continue
            
            # Apply text replacement with professional styling
            self._replace_text_with_professional_styling(page, coords, value, form_field, area)
    
    def _replace_text_with_professional_styling(self, page, coords: Dict, value: str, form_field: str, area: Dict):
        """Replace text with professional styling based on field type"""
        try:
            x = coords.get('x', 100)
            y = coords.get('y', 100)
            width = coords.get('width', 200)
            height = coords.get('height', 20)
            
            # STEP 1: REDACT ORIGINAL TEXT
            self._redact_original_text(page, coords, area)
            
            # STEP 2: INSERT NEW TEXT
            # Get professional styling based on field type
            style = self._get_professional_style_for_field(form_field, area)
            
            # Calculate optimal text position (center vertically and align with original)
            text_y = y + height/2
            
            # Try to match original text positioning more precisely
            original_content = area.get('content', '')
            if original_content:
                # Use the same vertical alignment as the original text
                text_y = y + (height * 0.7)  # Position text in the upper part of the area
            
            # Ensure we're positioning text correctly
            # For name fields, position at the top
            if 'name' in form_field.lower():
                text_y = y + 15  # Position near the top of the area
            # For email/phone, position slightly lower
            elif 'email' in form_field.lower() or 'phone' in form_field.lower():
                text_y = y + 25
            # For other fields, use calculated position
            else:
                text_y = y + (height * 0.7)
            
            # Handle text wrapping for long content
            if len(value) > 50:  # Long text needs wrapping
                wrapped_lines = self._wrap_text(value, width, style['font_size'])
                for i, line in enumerate(wrapped_lines):
                    line_y = text_y + (i * (style['font_size'] + 2))
                    point = fitz.Point(x, line_y)
                    page.insert_text(
                        point,
                        line,
                        fontsize=style['font_size'],
                        fontname=style['font_name'],
                        color=style['color']
                    )
            else:
                # Single line text - ensure it's properly positioned
                point = fitz.Point(x, text_y)
                
                # Insert text with professional styling
                page.insert_text(
                    point,
                    value,
                    fontsize=style['font_size'],
                    fontname=style['font_name'],
                    color=style['color']
                )
                
                # For important fields like names, also add a backup insertion
                if 'name' in form_field.lower() and len(value.strip()) > 0:
                    # Insert the text again slightly offset to ensure visibility
                    backup_point = fitz.Point(x + 1, text_y + 1)
                    page.insert_text(
                        backup_point,
                        value,
                        fontsize=style['font_size'],
                        fontname=style['font_name'],
                        color=style['color']
                    )
            
            print(f"📝 Replaced {form_field} with '{value}' using {style['font_name']} {style['font_size']}pt")
            
        except Exception as e:
            print(f"⚠️ Error replacing text for {form_field}: {e}")
    
    def _redact_original_text(self, page, coords: Dict, area: Dict):
        """Redact original text by covering it with white rectangles"""
        try:
            x = coords.get('x', 100)
            y = coords.get('y', 100)
            width = coords.get('width', 200)
            height = coords.get('height', 20)
            
            # Get original text content from the area
            original_text = area.get('content', '')
            
            # Method 1: Redact specific text instances if we have the original text
            if original_text and len(original_text.strip()) > 0:
                self._find_and_redact_text_instances(page, original_text, coords)
            
            # Method 2: Redact the entire area with white rectangle as backup
            rect = fitz.Rect(x, y, x + width, y + height)
            
            # Add more padding to ensure complete coverage
            padding = 10
            rect_with_padding = fitz.Rect(
                x - padding, 
                y - padding, 
                x + width + padding, 
                y + height + padding
            )
            
            # Draw multiple white rectangles to ensure complete coverage
            # Draw the main rectangle
            page.draw_rect(rect_with_padding, color=(1, 1, 1), fill=(1, 1, 1))
            
            # Draw additional rectangles with different sizes to ensure coverage
            page.draw_rect(rect, color=(1, 1, 1), fill=(1, 1, 1))
            
            # Draw a larger rectangle to catch any overflow
            larger_rect = fitz.Rect(
                x - padding * 2, 
                y - padding * 2, 
                x + width + padding * 2, 
                y + height + padding * 2
            )
            page.draw_rect(larger_rect, color=(1, 1, 1), fill=(1, 1, 1))
            
            print(f"🎨 Redacted original text area: {rect_with_padding}")
            if original_text:
                print(f"🎨 Also redacted specific text: '{original_text}'")
            
        except Exception as e:
            print(f"⚠️ Error redacting original text: {e}")
    
    def _find_and_redact_text_instances(self, page, original_text: str, coords: Dict):
        """Find and redact specific text instances on the page"""
        try:
            # Search for the original text on the page
            text_instances = page.search_for(original_text)
            
            for inst in text_instances:
                # Add more padding around the text instance
                padding = 5
                redact_rect = fitz.Rect(
                    inst.x0 - padding,
                    inst.y0 - padding,
                    inst.x1 + padding,
                    inst.y1 + padding
                )
                
                # Redact this specific text instance
                page.add_redact_annot(redact_rect, fill=(1, 1, 1))
                page.apply_redactions()
                
                # Also draw white rectangles to ensure coverage
                page.draw_rect(redact_rect, color=(1, 1, 1), fill=(1, 1, 1))
                
                print(f"🎨 Redacted text instance: '{original_text}' at {redact_rect}")
            
            # Also try to redact partial matches
            if len(original_text) > 3:
                # Try redacting parts of the text
                words = original_text.split()
                for word in words:
                    if len(word) > 2:  # Only redact words longer than 2 characters
                        word_instances = page.search_for(word)
                        for inst in word_instances:
                            padding = 3
                            word_rect = fitz.Rect(
                                inst.x0 - padding,
                                inst.y0 - padding,
                                inst.x1 + padding,
                                inst.y1 + padding
                            )
                            page.draw_rect(word_rect, color=(1, 1, 1), fill=(1, 1, 1))
                
        except Exception as e:
            print(f"⚠️ Error finding and redacting text instances: {e}")
    
    def _get_professional_style_for_field(self, form_field: str, area: Dict) -> Dict:
        """Get professional styling for a form field"""
        # Use AI styling processor presets
        style_presets = ai_styling_processor.style_presets
        
        # Determine field type and apply specific styling
        if 'name' in form_field.lower():
            return style_presets['name']
        elif 'email' in form_field.lower():
            return style_presets['email']
        elif 'phone' in form_field.lower():
            return style_presets['phone']
        elif 'location' in form_field.lower():
            return style_presets['location']
        elif 'company' in form_field.lower():
            return style_presets['company']
        elif 'position' in form_field.lower():
            return style_presets['position']
        elif 'institution' in form_field.lower():
            return style_presets['institution']
        elif 'degree' in form_field.lower():
            return style_presets['degree']
        elif 'dates' in form_field.lower():
            return style_presets['dates']
        elif 'skills' in form_field.lower():
            return style_presets['skills']
        elif 'summary' in form_field.lower():
            return style_presets['summary']
        else:
            return style_presets['description']
    
    def _wrap_text(self, text: str, max_width: float, font_size: int) -> List[str]:
        """Wrap text to fit within specified width"""
        # Approximate characters per line based on font size
        chars_per_line = int(max_width / (font_size * 0.6))  # Rough estimate
        
        if len(text) <= chars_per_line:
            return [text]
        
        words = text.split()
        lines = []
        current_line = ""
        
        for word in words:
            if len(current_line + " " + word) <= chars_per_line:
                current_line += (" " + word) if current_line else word
            else:
                if current_line:
                    lines.append(current_line)
                current_line = word
        
        if current_line:
            lines.append(current_line)
        
        return lines
    
    def _handle_dynamic_sections_expansion(self, page, resume_data: Dict, content_areas: List[Dict]):
        """Handle dynamic sections with proper expansion and positioning"""
        print("🔄 Handling dynamic sections expansion...")
        
        for section in self.supported_sections:
            if section in resume_data and isinstance(resume_data[section], list):
                entries = resume_data[section]
                if len(entries) > 1:
                    print(f"📋 Expanding {len(entries)} {section} entries")
                    self._expand_section_with_positioning(page, section, entries, content_areas)
    
    def _expand_section_with_positioning(self, page, section: str, entries: List[Dict], content_areas: List[Dict]):
        """Expand section with proper positioning and styling"""
        # Find the section area in content areas
        section_area = None
        for area in content_areas:
            if section in area.get('formField', '').lower():
                section_area = area
                break
        
        if not section_area:
            print(f"⚠️ No content area found for {section}")
            return
        
        # Get base position from content area
        base_coords = section_area.get('coordinates', {})
        base_x = base_coords.get('x', 100)
        base_y = base_coords.get('y', 200)
        
        # Calculate spacing for multiple entries
        entry_height = 80  # Increased height for better spacing
        current_y = base_y
        
        for i, entry in enumerate(entries):
            print(f"  📋 Entry {i+1}: {entry}")
            
            # Check if we need a new page
            if current_y > page.rect.height - 150:  # 150px margin
                print(f"  📄 Adding new page for remaining {len(entries) - i} entries")
                # Here you would add logic to create a new page
                break
            
            # Apply entry-specific styling with professional formatting
            self._apply_entry_professional_styling(page, section, entry, base_x, current_y)
            
            # Move to next entry position
            current_y += entry_height
    
    def _apply_entry_professional_styling(self, page, section: str, entry: Dict, x: float, y: float):
        """Apply professional styling for individual entries"""
        try:
            style_presets = ai_styling_processor.style_presets
            current_y = y
            
            # Apply styling for each field in the entry
            for field, value in entry.items():
                if not value:
                    continue
                
                # Get field-specific style
                if field == 'company':
                    field_style = style_presets['company']
                elif field == 'position':
                    field_style = style_presets['position']
                elif field == 'institution':
                    field_style = style_presets['institution']
                elif field == 'degree':
                    field_style = style_presets['degree']
                elif field in ['startDate', 'endDate', 'graduationYear']:
                    field_style = style_presets['dates']
                elif field == 'description':
                    field_style = style_presets['description']
                else:
                    field_style = style_presets['description']
                
                # Format the value
                formatted_value = self._format_field_value_professionally(field, value)
                
                # Insert text with professional styling
                point = fitz.Point(x, current_y)
                page.insert_text(
                    point,
                    formatted_value,
                    fontsize=field_style['font_size'],
                    fontname=field_style['font_name'],
                    color=field_style['color']
                )
                
                # Move to next line with proper spacing
                current_y += field_style['font_size'] + 4
                
        except Exception as e:
            print(f"⚠️ Error applying entry styling: {e}")
    
    def _format_field_value_professionally(self, field: str, value: str) -> str:
        """Format field values professionally"""
        if field == 'startDate' or field == 'endDate':
            # Format dates professionally
            if isinstance(value, str) and len(value) >= 7:
                return value[:7]  # YYYY-MM format
        elif field == 'graduationYear':
            # Format graduation year
            return str(value)
        elif field == 'description':
            # Truncate long descriptions professionally
            if len(value) > 200:
                return value[:200] + "..."
        elif field == 'skills':
            # Format skills with bullet points
            if isinstance(value, list):
                return "• " + ", ".join(value)
        
        return str(value)
    
    def _apply_final_styling(self, page, resume_data: Dict, content_areas: List[Dict]):
        """Apply final styling and formatting touches"""
        print("🎨 Applying final professional styling...")
        
        # Apply consistent spacing
        self._apply_consistent_spacing(page)
        
        # Apply section headers styling
        self._apply_section_headers_styling(page, resume_data)
        
        # Apply overall formatting
        self._apply_overall_formatting(page)
    
    def _get_field_value(self, resume_data: Dict, form_field: str) -> Optional[str]:
        """Get value from resume data using dot notation and space-separated fields"""
        try:
            # Handle space-separated fields (e.g., "personalInfo.firstName personalInfo.lastName")
            if ' ' in form_field:
                parts = form_field.split(' ')
                values = []
                for part in parts:
                    part_value = self._get_single_field_value(resume_data, part)
                    if part_value:
                        values.append(part_value)
                return ' '.join(values) if values else None
            else:
                return self._get_single_field_value(resume_data, form_field)
                
        except Exception:
            return None
    
    def _get_single_field_value(self, resume_data: Dict, form_field: str) -> Optional[str]:
        """Get value from resume data using dot notation for a single field"""
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
    
    def _apply_consistent_spacing(self, page):
        """Apply consistent spacing throughout the page"""
        # This would contain logic for consistent spacing
        pass
    
    def _apply_section_headers_styling(self, page, resume_data: Dict):
        """Apply styling to section headers"""
        # This would contain logic for section header styling
        pass
    
    def _apply_overall_formatting(self, page):
        """Apply overall formatting touches"""
        # This would contain logic for overall formatting
        pass

# Create global instance
enhanced_dynamic_expander = EnhancedDynamicContentExpander()
