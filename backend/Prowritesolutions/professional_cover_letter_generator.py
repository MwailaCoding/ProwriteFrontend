"""
Professional Cover Letter PDF Generator
Creates cover letters matching the professional template structure
"""

import os
from datetime import datetime
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import inch
from reportlab.lib.colors import black, white, HexColor
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

class ProfessionalCoverLetterGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.page_size = letter
        self.margins = (0.75*inch, 0.75*inch, 0.75*inch, 0.75*inch)
        self.primary_color = HexColor('#000000')
        self.secondary_color = HexColor('#666666')
        
    def create_styles(self):
        """Create professional styles for cover letters"""
        styles = {}
        
        # Header styles
        styles['applicant_name'] = ParagraphStyle(
            'ApplicantName',
            parent=self.styles['Normal'],
            fontSize=14,
            textColor=self.primary_color,
            spaceAfter=6,
            fontName='Helvetica-Bold',
            alignment=TA_LEFT
        )
        
        styles['contact_info'] = ParagraphStyle(
            'ContactInfo',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=self.primary_color,
            spaceAfter=2,
            fontName='Helvetica',
            alignment=TA_LEFT
        )
        
        styles['date'] = ParagraphStyle(
            'Date',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=self.primary_color,
            spaceAfter=12,
            fontName='Helvetica',
            alignment=TA_RIGHT
        )
        
        # Recipient styles
        styles['recipient_name'] = ParagraphStyle(
            'RecipientName',
            parent=self.styles['Normal'],
            fontSize=11,
            textColor=self.primary_color,
            spaceAfter=2,
            fontName='Helvetica-Bold',
            alignment=TA_LEFT
        )
        
        styles['company_info'] = ParagraphStyle(
            'CompanyInfo',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=self.primary_color,
            spaceAfter=2,
            fontName='Helvetica',
            alignment=TA_LEFT
        )
        
        # Body styles
        styles['salutation'] = ParagraphStyle(
            'Salutation',
            parent=self.styles['Normal'],
            fontSize=11,
            textColor=self.primary_color,
            spaceAfter=12,
            fontName='Helvetica',
            alignment=TA_LEFT
        )
        
        styles['body'] = ParagraphStyle(
            'Body',
            parent=self.styles['Normal'],
            fontSize=11,
            textColor=self.primary_color,
            spaceAfter=12,
            fontName='Helvetica',
            alignment=TA_LEFT,
            leading=14
        )
        
        styles['closing'] = ParagraphStyle(
            'Closing',
            parent=self.styles['Normal'],
            fontSize=11,
            textColor=self.primary_color,
            spaceAfter=6,
            fontName='Helvetica',
            alignment=TA_LEFT
        )
        
        styles['signature'] = ParagraphStyle(
            'Signature',
            parent=self.styles['Normal'],
            fontSize=11,
            textColor=self.primary_color,
            spaceAfter=0,
            fontName='Helvetica',
            alignment=TA_LEFT
        )
        
        return styles
    
    def generate_cover_letter_pdf(self, cover_letter_data, output_path):
        """Generate a professional cover letter PDF matching the template structure"""
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
            
            # Applicant's contact information (top left)
            applicant_name = cover_letter_data.get('personal_name', '[Your Name]')
            story.append(Paragraph(applicant_name, styles['applicant_name']))
            
            # Contact details
            contact_details = []
            if cover_letter_data.get('personal_address'):
                contact_details.append(cover_letter_data['personal_address'])
            if cover_letter_data.get('personal_phone'):
                contact_details.append(cover_letter_data['personal_phone'])
            if cover_letter_data.get('personal_email'):
                contact_details.append(cover_letter_data['personal_email'])
            
            if contact_details:
                story.append(Paragraph('<br/>'.join(contact_details), styles['contact_info']))
            
            # Date (top right)
            current_date = cover_letter_data.get('date', datetime.now().strftime("%B %d, %Y"))
            story.append(Spacer(1, 12))
            story.append(Paragraph(current_date, styles['date']))
            
            # Add some space before recipient info
            story.append(Spacer(1, 12))
            
            # Recipient's contact information
            recipient_name = cover_letter_data.get('employer_name', '[Hiring Manager\'s Name]')
            story.append(Paragraph(recipient_name, styles['recipient_name']))
            
            # Company information
            company_info = []
            if cover_letter_data.get('company_name'):
                company_info.append(cover_letter_data['company_name'])
            if cover_letter_data.get('employer_address'):
                company_info.append(cover_letter_data['employer_address'])
            
            if company_info:
                story.append(Paragraph('<br/>'.join(company_info), styles['company_info']))
            
            # Add space before salutation
            story.append(Spacer(1, 12))
            
            # Salutation
            salutation = f"Dear {recipient_name},"
            story.append(Paragraph(salutation, styles['salutation']))
            
            # Body paragraphs
            content = cover_letter_data.get('content', '')
            if content:
                # Split content into paragraphs
                paragraphs = content.split('\n\n')
                for paragraph in paragraphs:
                    if paragraph.strip():
                        # Clean up the paragraph text
                        clean_paragraph = paragraph.strip().replace('\n', ' ')
                        story.append(Paragraph(clean_paragraph, styles['body']))
            else:
                # Generate default content if none provided
                job_title = cover_letter_data.get('job_title', '[Job Title]')
                company_name = cover_letter_data.get('company_name', '[Company Name]')
                
                # Paragraph 1: Introduction and interest
                para1 = f"I am writing to express my interest in the {job_title} position at {company_name}, as advertised on [Job Board/Company Website]. With my background in [your field/skills] and a passion for [relevant interest connected to the role], I am confident that I can make a strong contribution to your team."
                story.append(Paragraph(para1, styles['body']))
                
                # Paragraph 2: Experience and skills
                para2 = f"In my previous role as [Your Most Recent Role/Experience] at [Company/Organization Name], I [describe a key achievement, responsibility, or project that shows your skills and impact - use numbers if possible]. This experience strengthened my ability to [specific skill required in the new role] and taught me the importance of [value or principle relevant to the company's mission]."
                story.append(Paragraph(para2, styles['body']))
                
                # Paragraph 3: Company fit and future contribution
                para3 = f"What excites me most about {company_name} is [something specific about the company — culture, innovation, mission, impact, etc.]. I believe my skills in [list 2-3 key skills] align closely with your needs, and I am eager to contribute to [specific project/goal of the company]."
                story.append(Paragraph(para3, styles['body']))
                
                # Paragraph 4: Call to action and closing remarks
                para4 = f"I would welcome the opportunity to discuss how my background, skills, and enthusiasm can add value to your team. Thank you for considering my application. I look forward to the possibility of contributing to {company_name}'s continued success."
                story.append(Paragraph(para4, styles['body']))
            
            # Add space before closing
            story.append(Spacer(1, 12))
            
            # Closing
            story.append(Paragraph("Sincerely,", styles['closing']))
            
            # Add some space for signature
            story.append(Spacer(1, 24))
            
            # Signature
            story.append(Paragraph(applicant_name, styles['signature']))
            
            # Build the PDF
            doc.build(story)
            
            print(f"Professional cover letter PDF successfully generated at: {output_path}")
            return True
            
        except Exception as e:
            print(f"Error generating cover letter PDF: {str(e)}")
            return False

