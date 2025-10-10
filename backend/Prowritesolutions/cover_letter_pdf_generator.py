"""
Professional Cover Letter PDF Generator
ATS-friendly cover letter formatting with professional styling
"""

import os
from datetime import datetime
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import inch, mm
from reportlab.lib.colors import black, white, HexColor
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.fonts import addMapping
import re

class ProfessionalCoverLetterPDFGenerator:
    def __init__(self, theme_name="professional"):
        self.styles = getSampleStyleSheet()
        self.page_size = letter  # Standard letter size for cover letters
        self.margins = (0.75*inch, 0.75*inch, 0.75*inch, 0.75*inch)  # Standard margins
        
        # Apply theme
        self.apply_theme(theme_name)
        
        # Register professional fonts
        self.register_pro_fonts()

    def apply_theme(self, theme_name="professional"):
        """Apply different visual themes"""
        self.primary_color = HexColor('#000000')  # Pure black for main text
        self.accent_color = HexColor('#2196F3')  # Bright blue for accents
        self.background_color = HexColor('#FFFFFF')  # Pure white background
        self.text_color = HexColor('#000000')  # Pure black for text
        self.light_gray = HexColor('#757575')  # Medium gray for subtle text
        self.dark_gray = HexColor('#424242')  # Darker gray for emphasis

    def register_pro_fonts(self):
        """Register professional fonts with fallbacks"""
        try:
            # Use built-in fonts that are guaranteed to work
            pro_fonts = {
                'Helvetica': ['Helvetica.ttf', 'Arial.ttf'],
                'Helvetica-Bold': ['Helvetica-Bold.ttf', 'Arial-Bold.ttf'],
                'Helvetica-Oblique': ['Helvetica-Oblique.ttf', 'Arial-Italic.ttf'],
                'Helvetica-BoldOblique': ['Helvetica-BoldOblique.ttf', 'Arial-BoldItalic.ttf'],
            }
            
            for font_name, font_files in pro_fonts.items():
                for font_file in font_files:
                    try:
                        pdfmetrics.registerFont(TTFont(font_name, font_file))
                        break
                    except:
                        continue
        except:
            # Fallback to built-in fonts
            pass

    def create_styles(self):
        """Create professional styles for cover letters"""
        available_fonts = pdfmetrics.getRegisteredFontNames()
        
        bold_font = 'Helvetica-Bold' if 'Helvetica-Bold' in available_fonts else 'Times-Bold'
        italic_font = 'Helvetica-Oblique' if 'Helvetica-Oblique' in available_fonts else 'Times-Italic'
        regular_font = 'Helvetica' if 'Helvetica' in available_fonts else 'Times-Roman'
        
        return {
            'header': ParagraphStyle(
                'header',
                parent=self.styles['Normal'],
                fontName=regular_font,
                fontSize=12,
                alignment=TA_LEFT,
                spaceAfter=12,
                textColor=self.text_color,
                leading=14
            ),
            'company_address': ParagraphStyle(
                'company_address',
                parent=self.styles['Normal'],
                fontName=regular_font,
                fontSize=12,
                alignment=TA_LEFT,
                spaceAfter=20,
                textColor=self.text_color,
                leading=14
            ),
            'greeting': ParagraphStyle(
                'greeting',
                parent=self.styles['Normal'],
                fontName=regular_font,
                fontSize=12,
                alignment=TA_LEFT,
                spaceAfter=12,
                textColor=self.text_color,
                leading=14
            ),
            'body': ParagraphStyle(
                'body',
                parent=self.styles['Normal'],
                fontName=regular_font,
                fontSize=12,
                alignment=TA_JUSTIFY,
                spaceAfter=12,
                textColor=self.text_color,
                leading=16,
                firstLineIndent=0
            ),
            'closing': ParagraphStyle(
                'closing',
                parent=self.styles['Normal'],
                fontName=regular_font,
                fontSize=12,
                alignment=TA_LEFT,
                spaceAfter=20,
                textColor=self.text_color,
                leading=14
            ),
            'signature': ParagraphStyle(
                'signature',
                parent=self.styles['Normal'],
                fontName=regular_font,
                fontSize=12,
                alignment=TA_LEFT,
                spaceAfter=12,
                textColor=self.text_color,
                leading=14
            )
        }

    def generate_cover_letter_pdf(self, cover_letter_data, output_path):
        """Generate a professional cover letter PDF"""
        try:
            # Create the PDF document
            doc = SimpleDocTemplate(
                output_path,
                pagesize=self.page_size,
                leftMargin=self.margins[0],
                rightMargin=self.margins[1],
                topMargin=self.margins[2],
                bottomMargin=self.margins[3]
            )
            
            # Get styles
            styles = self.create_styles()
            
            # Build the story (content)
            story = []
            
            # Add user's contact information (header)
            if cover_letter_data.get('user_info'):
                user_info = cover_letter_data['user_info']
                header_text = f"{user_info.get('name', 'Your Name')}<br/>"
                if user_info.get('address'):
                    header_text += f"{user_info['address']}<br/>"
                if user_info.get('city') and user_info.get('state') and user_info.get('zip'):
                    header_text += f"{user_info['city']}, {user_info['state']} {user_info['zip']}<br/>"
                if user_info.get('phone'):
                    header_text += f"{user_info['phone']}<br/>"
                if user_info.get('email'):
                    header_text += f"{user_info['email']}<br/>"
                
                story.append(Paragraph(header_text, styles['header']))
            
            # Add date
            current_date = datetime.now().strftime("%B %d, %Y")
            story.append(Paragraph(current_date, styles['header']))
            story.append(Spacer(1, 12))
            
            # Add company address
            if cover_letter_data.get('employer_info'):
                employer_info = cover_letter_data['employer_info']
                company_address = ""
                
                if employer_info.get('hiring_manager_name'):
                    company_address += f"{employer_info['hiring_manager_name']}<br/>"
                
                if employer_info.get('company_name'):
                    company_address += f"{employer_info['company_name']}<br/>"
                
                if employer_info.get('company_address'):
                    company_address += f"{employer_info['company_address']}<br/>"
                
                if employer_info.get('city') and employer_info.get('state') and employer_info.get('zip'):
                    company_address += f"{employer_info['city']}, {employer_info['state']} {employer_info['zip']}"
                
                if company_address:
                    story.append(Paragraph(company_address, styles['company_address']))
            
            # Add greeting
            greeting = "Dear "
            if cover_letter_data.get('employer_info', {}).get('hiring_manager_name'):
                greeting += f"{cover_letter_data['employer_info']['hiring_manager_name']},"
            else:
                greeting += "Hiring Manager,"
            
            story.append(Paragraph(greeting, styles['greeting']))
            
            # Add cover letter content
            if cover_letter_data.get('content'):
                # Split content into paragraphs
                paragraphs = cover_letter_data['content'].split('\n\n')
                for paragraph in paragraphs:
                    if paragraph.strip():
                        # Clean up the paragraph text
                        clean_paragraph = paragraph.strip().replace('\n', ' ')
                        story.append(Paragraph(clean_paragraph, styles['body']))
            
            # Add closing
            story.append(Spacer(1, 12))
            story.append(Paragraph("Sincerely,", styles['closing']))
            
            # Add signature
            if cover_letter_data.get('user_info', {}).get('name'):
                story.append(Paragraph(cover_letter_data['user_info']['name'], styles['signature']))
            
            # Build the PDF
            doc.build(story)
            
            print(f"Cover letter PDF successfully generated at: {output_path}")
            return True
            
        except Exception as e:
            print(f"Error generating cover letter PDF: {str(e)}")
            return False

    def generate_simple_cover_letter_pdf(self, cover_letter_content, output_path, title="Cover Letter"):
        """Generate a simple cover letter PDF with basic formatting"""
        try:
            # Check if output_path is a BytesIO object or file path
            if hasattr(output_path, 'write'):
                # It's a BytesIO object
                doc = SimpleDocTemplate(
                    output_path,
                    pagesize=self.page_size,
                    leftMargin=self.margins[0],
                    rightMargin=self.margins[1],
                    topMargin=self.margins[2],
                    bottomMargin=self.margins[3]
                )
            else:
                # It's a file path
                doc = SimpleDocTemplate(
                    output_path,
                    pagesize=self.page_size,
                    leftMargin=self.margins[0],
                    rightMargin=self.margins[1],
                    topMargin=self.margins[2],
                    bottomMargin=self.margins[3]
                )
            
            # Get styles
            styles = self.create_styles()
            
            # Build the story (content)
            story = []
            
            # Add title
            story.append(Paragraph(f"<b>{title}</b>", styles['header']))
            story.append(Spacer(1, 20))
            
            # Add date
            current_date = datetime.now().strftime("%B %d, %Y")
            story.append(Paragraph(f"Date: {current_date}", styles['header']))
            story.append(Spacer(1, 20))
            
            # Add cover letter content
            if cover_letter_content:
                # Split content into paragraphs
                paragraphs = cover_letter_content.split('\n\n')
                for paragraph in paragraphs:
                    if paragraph.strip():
                        # Clean up the paragraph text
                        clean_paragraph = paragraph.strip().replace('\n', ' ')
                        story.append(Paragraph(clean_paragraph, styles['body']))
            
            # Build the PDF
            doc.build(story)
            
            print(f"Simple cover letter PDF successfully generated at: {output_path}")
            return True
            
        except Exception as e:
            print(f"Error generating simple cover letter PDF: {str(e)}")
            return False
