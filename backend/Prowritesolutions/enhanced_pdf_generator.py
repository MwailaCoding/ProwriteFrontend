#!/usr/bin/env python3
"""
Enhanced PDF Generator Module
Provides advanced PDF generation with template overlays and content injection
"""

import json
import os
from typing import Dict, List, Any, Optional
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import inch
from reportlab.lib.colors import black, white, blue
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT

class EnhancedPDFGenerator:
    """Enhanced PDF generator with template overlays and advanced formatting"""
    
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.custom_styles = self._create_custom_styles()
    
    def _create_custom_styles(self) -> Dict[str, ParagraphStyle]:
        """Create custom paragraph styles for different content types"""
        return {
            'header': ParagraphStyle(
                'CustomHeader',
                parent=self.styles['Heading1'],
                fontSize=24,
                spaceAfter=20,
                alignment=TA_CENTER,
                textColor=blue
            ),
            'section_header': ParagraphStyle(
                'CustomSectionHeader',
                parent=self.styles['Heading2'],
                fontSize=16,
                spaceAfter=12,
                spaceBefore=20,
                textColor=black
            ),
            'body_text': ParagraphStyle(
                'CustomBodyText',
                parent=self.styles['Normal'],
                fontSize=11,
                spaceAfter=6,
                leading=14
            ),
            'contact_info': ParagraphStyle(
                'CustomContactInfo',
                parent=self.styles['Normal'],
                fontSize=10,
                spaceAfter=3,
                alignment=TA_CENTER
            ),
            'experience_title': ParagraphStyle(
                'CustomExperienceTitle',
                parent=self.styles['Heading3'],
                fontSize=14,
                spaceAfter=6,
                textColor=blue
            ),
            'company_info': ParagraphStyle(
                'CustomCompanyInfo',
                parent=self.styles['Normal'],
                fontSize=12,
                spaceAfter=3,
                textColor=black
            ),
            'skills_item': ParagraphStyle(
                'CustomSkillsItem',
                parent=self.styles['Normal'],
                fontSize=10,
                spaceAfter=2,
                leftIndent=20
            )
        }
    
    def generate_enhanced_pdf(self, template_path: str, output_path: str, 
                            mapped_content: Dict[str, Any], 
                            template_metadata: Optional[Dict] = None) -> bool:
        """Generate enhanced PDF with template-based content injection"""
        try:
            # Try to use PyPDF2 for template overlays
            if self._can_use_pypdf2():
                return self._generate_with_template_overlay(
                    template_path, output_path, mapped_content, template_metadata
                )
            else:
                # Fallback to ReportLab generation
                return self._generate_with_reportlab(
                    output_path, mapped_content, template_metadata
                )
        except Exception as e:
            print(f"Error in enhanced PDF generation: {str(e)}")
            return self._generate_with_reportlab(output_path, mapped_content, template_metadata)
    
    def _can_use_pypdf2(self) -> bool:
        """Check if PyPDF2 is available for template overlays"""
        try:
            import PyPDF2
            return True
        except ImportError:
            return False
    
    def _generate_with_template_overlay(self, template_path: str, output_path: str,
                                      mapped_content: Dict[str, Any],
                                      template_metadata: Optional[Dict]) -> bool:
        """Generate PDF by overlaying content on existing template"""
        try:
            import PyPDF2
            from reportlab.pdfgen import canvas
            from reportlab.lib.pagesizes import letter
            
            # Read the template PDF
            with open(template_path, 'rb') as template_file:
                template_reader = PyPDF2.PdfReader(template_file)
                template_writer = PyPDF2.PdfWriter()
                
                # Process each page
                for page_num in range(len(template_reader.pages)):
                    page = template_reader.pages[page_num]
                    
                    # Create a temporary PDF with content overlay
                    temp_overlay = f"temp_overlay_{page_num}.pdf"
                    self._create_content_overlay(
                        temp_overlay, mapped_content, page_num + 1, template_metadata
                    )
                    
                    # Merge overlay with template page
                    with open(temp_overlay, 'rb') as overlay_file:
                        overlay_reader = PyPDF2.PdfReader(overlay_file)
                        if len(overlay_reader.pages) > 0:
                            overlay_page = overlay_reader.pages[0]
                            page.merge_page(overlay_page)
                    
                    # Clean up temp file
                    if os.path.exists(temp_overlay):
                        os.remove(temp_overlay)
                    
                    template_writer.add_page(page)
                
                # Write the final PDF
                with open(output_path, 'wb') as output_file:
                    template_writer.write(output_file)
                
                return True
                
        except Exception as e:
            print(f"Template overlay generation failed: {str(e)}")
            return False
    
    def _create_content_overlay(self, overlay_path: str, mapped_content: Dict[str, Any],
                               page_num: int, template_metadata: Optional[Dict]) -> None:
        """Create content overlay for a specific page"""
        c = canvas.Canvas(overlay_path, pagesize=letter)
        width, height = letter
        
        # Get content areas for this page
        page_content = self._get_page_content(mapped_content, page_num)
        
        # Render content based on type
        for content_id, content_data in page_content.items():
            content_type = content_data.get('type', 'text')
            
            if content_type == 'personal_info':
                self._render_personal_info(c, content_data, width, height)
            elif content_type == 'summary':
                self._render_summary(c, content_data, width, height)
            elif content_type == 'experience':
                self._render_experience(c, content_data, width, height)
            elif content_type == 'education':
                self._render_education(c, content_data, width, height)
            elif content_type == 'skills':
                self._render_skills(c, content_data, width, height)
            elif content_type == 'contact':
                self._render_contact_info(c, content_data, width, height)
        
        c.save()
    
    def _get_page_content(self, mapped_content: Dict[str, Any], page_num: int) -> Dict[str, Any]:
        """Get content for a specific page"""
        page_content = {}
        
        for content_id, content_data in mapped_content.items():
            if content_data.get('page', 1) == page_num:
                page_content[content_id] = content_data
        
        return page_content
    
    def _render_personal_info(self, canvas_obj, content_data: Dict[str, Any], 
                            width: float, height: float) -> None:
        """Render personal information section"""
        x, y = 1 * inch, height - 1.5 * inch
        
        # Name
        if 'fullName' in content_data:
            canvas_obj.setFont("Helvetica-Bold", 24)
            canvas_obj.drawString(x, y, content_data['fullName'])
            y -= 0.4 * inch
        
        # Contact info
        canvas_obj.setFont("Helvetica", 12)
        if 'email' in content_data:
            canvas_obj.drawString(x, y, f"Email: {content_data['email']}")
            y -= 0.3 * inch
        
        if 'phone' in content_data:
            canvas_obj.drawString(x, y, f"Phone: {content_data['phone']}")
            y -= 0.3 * inch
        
        if 'location' in content_data:
            canvas_obj.drawString(x, y, f"Location: {content_data['location']}")
    
    def _render_summary(self, canvas_obj, content_data: Dict[str, Any], 
                       width: float, height: float) -> None:
        """Render professional summary section"""
        x, y = 1 * inch, height - 3 * inch
        
        # Section header
        canvas_obj.setFont("Helvetica-Bold", 16)
        canvas_obj.drawString(x, y, "Professional Summary")
        y -= 0.3 * inch
        
        # Summary text
        if 'summary' in content_data:
            canvas_obj.setFont("Helvetica", 11)
            summary_text = content_data['summary']
            
            # Wrap text to fit page width
            words = summary_text.split()
            lines = []
            current_line = ""
            
            for word in words:
                test_line = current_line + " " + word if current_line else word
                if canvas_obj.stringWidth(test_line, "Helvetica", 11) < width - 2 * inch:
                    current_line = test_line
                else:
                    if current_line:
                        lines.append(current_line)
                    current_line = word
            
            if current_line:
                lines.append(current_line)
            
            for line in lines:
                canvas_obj.drawString(x, y, line)
                y -= 0.25 * inch
    
    def _render_experience(self, canvas_obj, content_data: Dict[str, Any], 
                          width: float, height: float) -> None:
        """Render work experience section"""
        x, y = 1 * inch, height - 4.5 * inch
        
        # Section header
        canvas_obj.setFont("Helvetica-Bold", 16)
        canvas_obj.drawString(x, y, "Work Experience")
        y -= 0.3 * inch
        
        if 'experience' in content_data and isinstance(content_data['experience'], list):
            for exp in content_data['experience']:
                # Company and position
                canvas_obj.setFont("Helvetica-Bold", 14)
                company = exp.get('company', '')
                position = exp.get('position', '')
                canvas_obj.drawString(x, y, f"{position} at {company}")
                y -= 0.25 * inch
                
                # Dates
                canvas_obj.setFont("Helvetica", 10)
                start_date = exp.get('startDate', '')
                end_date = exp.get('endDate', '')
                if start_date and end_date:
                    canvas_obj.drawString(x, y, f"{start_date} - {end_date}")
                    y -= 0.2 * inch
                
                # Description
                if 'description' in exp:
                    canvas_obj.setFont("Helvetica", 11)
                    desc = exp['description']
                    
                    # Wrap description text
                    words = desc.split()
                    current_line = ""
                    
                    for word in words:
                        test_line = current_line + " " + word if current_line else word
                        if canvas_obj.stringWidth(test_line, "Helvetica", 11) < width - 2 * inch:
                            current_line = test_line
                        else:
                            if current_line:
                                canvas_obj.drawString(x, y, current_line)
                                y -= 0.25 * inch
                            current_line = word
                    
                    if current_line:
                        canvas_obj.drawString(x, y, current_line)
                        y -= 0.25 * inch
                
                y -= 0.2 * inch  # Space between experiences
    
    def _render_education(self, canvas_obj, content_data: Dict[str, Any], 
                         width: float, height: float) -> None:
        """Render education section"""
        x, y = 1 * inch, height - 6.5 * inch
        
        # Section header
        canvas_obj.setFont("Helvetica-Bold", 16)
        canvas_obj.drawString(x, y, "Education")
        y -= 0.3 * inch
        
        if 'education' in content_data and isinstance(content_data['education'], list):
            for edu in content_data['education']:
                # Institution and degree
                canvas_obj.setFont("Helvetica-Bold", 14)
                institution = edu.get('institution', '')
                degree = edu.get('degree', '')
                canvas_obj.drawString(x, y, f"{degree} from {institution}")
                y -= 0.25 * inch
                
                # Graduation year
                canvas_obj.setFont("Helvetica", 10)
                grad_year = edu.get('graduationYear', '')
                if grad_year:
                    canvas_obj.drawString(x, y, f"Graduated: {grad_year}")
                    y -= 0.2 * inch
                
                y -= 0.2 * inch  # Space between education items
    
    def _render_skills(self, canvas_obj, content_data: Dict[str, Any], 
                      width: float, height: float) -> None:
        """Render skills section"""
        x, y = 1 * inch, height - 7.5 * inch
        
        # Section header
        canvas_obj.setFont("Helvetica-Bold", 16)
        canvas_obj.drawString(x, y, "Skills & Technologies")
        y -= 0.3 * inch
        
        if 'skills' in content_data and isinstance(content_data['skills'], list):
            canvas_obj.setFont("Helvetica", 11)
            
            # Group skills by category if possible
            skills_text = ", ".join(content_data['skills'])
            
            # Wrap skills text
            words = skills_text.split()
            current_line = ""
            
            for word in words:
                test_line = current_line + " " + word if current_line else word
                if canvas_obj.stringWidth(test_line, "Helvetica", 11) < width - 2 * inch:
                    current_line = test_line
                else:
                    if current_line:
                        canvas_obj.drawString(x, y, current_line)
                        y -= 0.25 * inch
                    current_line = word
            
            if current_line:
                canvas_obj.drawString(x, y, current_line)
    
    def _render_contact_info(self, canvas_obj, content_data: Dict[str, Any], 
                            width: float, height: float) -> None:
        """Render contact information"""
        x, y = 1 * inch, height - 8.5 * inch
        
        # Section header
        canvas_obj.setFont("Helvetica-Bold", 16)
        canvas_obj.drawString(x, y, "Contact Information")
        y -= 0.3 * inch
        
        canvas_obj.setFont("Helvetica", 11)
        
        contact_fields = ['email', 'phone', 'location']
        for field in contact_fields:
            if field in content_data:
                label = field.title()
                value = content_data[field]
                canvas_obj.drawString(x, y, f"{label}: {value}")
                y -= 0.25 * inch
    
    def _generate_with_reportlab(self, output_path: str, mapped_content: Dict[str, Any],
                                template_metadata: Optional[Dict]) -> bool:
        """Generate PDF using ReportLab (fallback method)"""
        try:
            doc = SimpleDocTemplate(output_path, pagesize=letter)
            story = []
            
            # Add header
            if 'personalInfo' in mapped_content:
                personal_info = mapped_content['personalInfo']
                if 'firstName' in personal_info and 'lastName' in personal_info:
                    full_name = f"{personal_info['firstName']} {personal_info['lastName']}"
                    story.append(Paragraph(full_name, self.custom_styles['header']))
                    story.append(Spacer(1, 20))
            
            # Add contact information
            contact_info = []
            if 'personalInfo' in mapped_content:
                pi = mapped_content['personalInfo']
                if 'email' in pi:
                    contact_info.append(f"Email: {pi['email']}")
                if 'phone' in pi:
                    contact_info.append(f"Phone: {pi['phone']}")
                if 'location' in pi:
                    contact_info.append(f"Location: {pi['location']}")
            
            if contact_info:
                for info in contact_info:
                    story.append(Paragraph(info, self.custom_styles['contact_info']))
                story.append(Spacer(1, 20))
            
            # Add summary
            if 'summary' in mapped_content:
                story.append(Paragraph("Professional Summary", self.custom_styles['section_header']))
                story.append(Paragraph(mapped_content['summary'], self.custom_styles['body_text']))
                story.append(Spacer(1, 20))
            
            # Add experience
            if 'experience' in mapped_content and isinstance(mapped_content['experience'], list):
                story.append(Paragraph("Work Experience", self.custom_styles['section_header']))
                
                for exp in mapped_content['experience']:
                    # Company and position
                    company = exp.get('company', '')
                    position = exp.get('position', '')
                    if company and position:
                        story.append(Paragraph(f"{position} at {company}", self.custom_styles['experience_title']))
                    
                    # Dates
                    start_date = exp.get('startDate', '')
                    end_date = exp.get('endDate', '')
                    if start_date and end_date:
                        story.append(Paragraph(f"{start_date} - {end_date}", self.custom_styles['company_info']))
                    
                    # Description
                    if 'description' in exp:
                        story.append(Paragraph(exp['description'], self.custom_styles['body_text']))
                    
                    story.append(Spacer(1, 12))
            
            # Add education
            if 'education' in mapped_content and isinstance(mapped_content['education'], list):
                story.append(Paragraph("Education", self.custom_styles['section_header']))
                
                for edu in mapped_content['education']:
                    institution = edu.get('institution', '')
                    degree = edu.get('degree', '')
                    if institution and degree:
                        story.append(Paragraph(f"{degree} from {institution}", self.custom_styles['experience_title']))
                    
                    grad_year = edu.get('graduationYear', '')
                    if grad_year:
                        story.append(Paragraph(f"Graduated: {grad_year}", self.custom_styles['company_info']))
                    
                    story.append(Spacer(1, 12))
            
            # Add skills
            if 'skills' in mapped_content and isinstance(mapped_content['skills'], list):
                story.append(Paragraph("Skills & Technologies", self.custom_styles['section_header']))
                
                skills_text = ", ".join(mapped_content['skills'])
                story.append(Paragraph(skills_text, self.custom_styles['body_text']))
            
            # Build PDF
            doc.build(story)
            return True
            
        except Exception as e:
            print(f"ReportLab generation failed: {str(e)}")
            return False

# Global instance
pdf_generator = EnhancedPDFGenerator()









