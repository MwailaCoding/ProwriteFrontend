#!/usr/bin/env python3
"""
PDF Generation Module for Resume Builder
Handles injecting form data into PDF templates
"""

import os
import json
import time
from typing import Dict, List, Optional
import fitz  # PyMuPDF
from PIL import Image, ImageDraw, ImageFont
from pdf2image import convert_from_path

def generate_pdf_with_form_data(template: dict, form_data: dict, output_format: str = 'pdf', quality: str = 'medium') -> dict:
    """Generate PDF with form data injected into template"""
    try:
        # Load template PDF
        pdf_path = template.get('pdf_file', '').replace('/static/uploads/', '')
        if not pdf_path:
            raise FileNotFoundError('Template PDF path not found')
        
        # Open template PDF
        doc = fitz.open(pdf_path)
        
        # Create new PDF for output
        output_doc = fitz.open()
        
        # Process each page
        for page_num in range(len(doc)):
            template_page = doc.load_page(page_num)
            
            # Create new page with same dimensions
            output_page = output_doc.new_page(
                width=template_page.rect.width,
                height=template_page.rect.height
            )
            
            # Copy template content
            output_page.show_pdf_page(template_page.rect, doc, page_num)
            
            # Get content areas for this page
            content_areas = json.loads(template.get('content_areas', '[]'))
            page_areas = [area for area in content_areas if area.get('coordinates', {}).get('page') == page_num + 1]
            
            # Inject form data
            for area in page_areas:
                value = get_form_field_value(form_data, area['formField'])
                if value:
                    # Create text annotation
                    rect = fitz.Rect(
                        area['coordinates']['x'],
                        area['coordinates']['y'],
                        area['coordinates']['x'] + area['coordinates']['width'],
                        area['coordinates']['y'] + area['coordinates']['height']
                    )
                    
                    # Add text with styling
                    output_page.insert_text(
                        rect.tl,  # top-left point
                        value,
                        fontsize=area['styling'].get('fontSize', 12),
                        fontname=area['styling'].get('fontFamily', 'helv'),
                        color=area['styling'].get('color', 0),
                        align=area['styling'].get('alignment', 0)
                    )
        
        # Save output
        output_filename = f"resume_{template['id']}_{int(time.time())}.pdf"
        output_path = os.path.join('static', 'uploads', 'generated', output_filename)
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        output_doc.save(output_path)
        output_doc.close()
        doc.close()
        
        # Generate download URL
        download_url = f"/static/uploads/generated/{output_filename}"
        
        # Get file size
        file_size = os.path.getsize(output_path)
        
        return {
            'downloadUrl': download_url,
            'fileSize': file_size,
            'pageCount': len(doc),
            'generationTime': time.time()
        }
        
    except Exception as e:
        print(f"Error in PDF generation: {e}")
        raise e

def generate_preview_with_form_data(template: dict, form_data: dict, output_format: str = 'png') -> dict:
    """Generate preview image with form data"""
    try:
        # Load template PDF
        pdf_path = template.get('pdf_file', '').replace('/static/uploads/', '')
        if not pdf_path:
            raise FileNotFoundError('Template PDF path not found')
        
        # Convert first page to image
        images = convert_from_path(pdf_path, first_page=1, last_page=1)
        if not images:
            raise Exception('Failed to convert PDF to image')
        
        # Get first page image
        page_image = images[0]
        
        # Create PIL Image for editing
        pil_image = page_image.convert('RGBA')
        draw = ImageDraw.Draw(pil_image)
        
        # Get content areas for first page
        content_areas = json.loads(template.get('content_areas', '[]'))
        page_areas = [area for area in content_areas if area.get('coordinates', {}).get('page') == 1]
        
        # Try to load font
        try:
            font_size = 12
            font = ImageFont.truetype("arial.ttf", font_size)
        except:
            font = ImageFont.load_default()
        
        # Inject form data
        for area in page_areas:
            value = get_form_field_value(form_data, area['formField'])
            if value:
                # Calculate position
                x = area['coordinates']['x']
                y = area['coordinates']['y']
                
                # Draw text
                draw.text(
                    (x, y),
                    value,
                    font=font,
                    fill=area['styling'].get('color', '#000000')
                )
        
        # Save preview
        preview_filename = f"preview_{template['id']}_{int(time.time())}.{output_format}"
        preview_path = os.path.join('static', 'thumbnails', 'generated', preview_filename)
        os.makedirs(os.path.dirname(preview_path), exist_ok=True)
        
        pil_image.save(preview_path, output_format.upper())
        
        # Generate preview URL
        preview_url = f"/static/thumbnails/generated/{preview_filename}"
        
        return {'previewUrl': preview_url}
        
    except Exception as e:
        print(f"Error in preview generation: {e}")
        raise e

def test_template_compatibility_with_form_data(template: dict, form_data: dict) -> dict:
    """Test template compatibility with form data"""
    try:
        content_areas = json.loads(template.get('content_areas', '[]'))
        required_fields = [area['formField'] for area in content_areas if area.get('isRequired', False)]
        
        missing_fields = []
        warnings = []
        
        # Check required fields
        for field in required_fields:
            if not get_form_field_value(form_data, field):
                missing_fields.append(field)
        
        # Check field compatibility
        for area in content_areas:
            field = area['formField']
            value = get_form_field_value(form_data, field)
            
            if value:
                # Check if value fits in area
                if len(value) > 100:  # Arbitrary length limit
                    warnings.append(f"Field '{field}' value may be too long for area '{area['name']}'")
        
        is_compatible = len(missing_fields) == 0
        
        return {
            'isCompatible': is_compatible,
            'missingFields': missing_fields,
            'warnings': warnings
        }
        
    except Exception as e:
        print(f"Error in compatibility test: {e}")
        return {
            'isCompatible': False,
            'missingFields': [],
            'warnings': ['Error testing compatibility']
        }

def get_form_field_value(form_data: dict, field_path: str) -> str:
    """Get form field value from nested structure"""
    try:
        field_parts = field_path.split('.')
        current = form_data
        
        for part in field_parts:
            if isinstance(current, dict) and part in current:
                current = current[part]
            elif isinstance(current, list) and part.isdigit():
                current = current[int(part)]
            else:
                return ''
        
        if isinstance(current, list):
            return ', '.join(str(item) for item in current)
        
        return str(current) if current else ''
        
    except Exception as e:
        print(f"Error getting field value for {field_path}: {e}")
        return ''

def create_sample_resume_pdf():
    """Create a sample resume PDF for testing"""
    try:
        # Create a simple PDF with some text
        doc = fitz.open()
        page = doc.new_page(width=595, height=842)  # A4 size
        
        # Add some sample content
        page.insert_text((50, 50), "Sample Resume", fontsize=24, fontname="helv-b")
        page.insert_text((50, 100), "John Doe", fontsize=18, fontname="helv")
        page.insert_text((50, 130), "Software Engineer", fontsize=14, fontname="helv")
        
        # Save sample PDF
        sample_path = "static/uploads/pdf_templates/sample_resume.pdf"
        os.makedirs(os.path.dirname(sample_path), exist_ok=True)
        doc.save(sample_path)
        doc.close()
        
        print(f"✅ Sample resume PDF created: {sample_path}")
        return True
        
    except Exception as e:
        print(f"❌ Error creating sample PDF: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing PDF Generation Module")
    print("=" * 40)
    
    # Create sample PDF
    if create_sample_resume_pdf():
        print("✅ Sample PDF created successfully")
    else:
        print("❌ Failed to create sample PDF")
    
    print("\n📋 Module ready for import!")





































