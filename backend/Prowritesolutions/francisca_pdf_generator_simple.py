#!/usr/bin/env python3
"""
Francisca PDF Generator (Clean Professional CV)
Generates PDF resumes with clean, professional styling
"""

import json
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, HRFlowable, Frame, PageTemplate
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.lib.colors import black, blue, HexColor, Color
from reportlab.lib import colors
from typing import Dict, List, Any
import os
from datetime import datetime
import re

class FranciscaPDFGeneratorSimple:
    """Generate PDF resumes with clean, professional styling"""
    
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.setup_clean_styles()
    
    def setup_clean_styles(self):
        """Setup clean, professional styles for CV"""
        
        # Header name style (32pt, Bold, Centered) - Very prominent
        self.styles.add(ParagraphStyle(
            name='FranciscaHeaderName',
            parent=self.styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=32,
            alignment=TA_CENTER,
            spaceAfter=8,
            textColor=black,
            leading=36
        ))
        
        # Contact info style (14pt, Centered, Clean)
        self.styles.add(ParagraphStyle(
            name='FranciscaContact',
            parent=self.styles['Normal'],
            fontName='Helvetica',
            fontSize=14,
            alignment=TA_CENTER,
            spaceAfter=25,
            textColor=black,
            leading=16
        ))
        
        # Section header style (18pt, Bold, Uppercase, Left)
        self.styles.add(ParagraphStyle(
            name='FranciscaSectionHeader',
            parent=self.styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=18,
            alignment=TA_LEFT,
            spaceAfter=15,
            spaceBefore=25,
            textColor=black,
            leading=20
        ))
        
        # Content style (12pt, Regular, Left)
        self.styles.add(ParagraphStyle(
            name='FranciscaContent',
            parent=self.styles['Normal'],
            fontName='Helvetica',
            fontSize=12,
            alignment=TA_LEFT,
            spaceAfter=6,
            textColor=black,
            leading=14
        ))
        
        # Date style (12pt, Regular, Right)
        self.styles.add(ParagraphStyle(
            name='FranciscaDate',
            parent=self.styles['Normal'],
            fontName='Helvetica',
            fontSize=12,
            alignment=TA_RIGHT,
            spaceAfter=6,
            textColor=black,
            leading=14
        ))
        
        # Bullet point style (12pt, Regular, Left, Indented)
        self.styles.add(ParagraphStyle(
            name='FranciscaBullet',
            parent=self.styles['Normal'],
            fontName='Helvetica',
            fontSize=12,
            alignment=TA_LEFT,
            leftIndent=20,
            spaceAfter=4,
            textColor=black,
            leading=14,
            bulletText='•'
        ))
        
        # Skills label style (13pt, Bold, Left)
        self.styles.add(ParagraphStyle(
            name='FranciscaSkillsLabel',
            parent=self.styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=13,
            alignment=TA_LEFT,
            spaceAfter=3,
            textColor=black,
            leading=15
        ))
        
        # Skills content style (12pt, Regular, Left)
        self.styles.add(ParagraphStyle(
            name='FranciscaSkillsContent',
            parent=self.styles['Normal'],
            fontName='Helvetica',
            fontSize=12,
            alignment=TA_LEFT,
            spaceAfter=8,
            textColor=black,
            leading=14
        ))
        
        # Referee name style (13pt, Bold, Left)
        self.styles.add(ParagraphStyle(
            name='FranciscaRefereeName',
            parent=self.styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=13,
            alignment=TA_LEFT,
            spaceAfter=3,
            textColor=black,
            leading=15
        ))
        
        # Referee details style (12pt, Regular, Left)
        self.styles.add(ParagraphStyle(
            name='FranciscaRefereeDetails',
            parent=self.styles['Normal'],
            fontName='Helvetica',
            fontSize=12,
            alignment=TA_LEFT,
            spaceAfter=10,
            textColor=black,
            leading=14
        ))
    
    def format_text_with_links(self, text, style):
        """Format text with blue highlighted email links"""
        if not text:
            return text
        
        # Regular expression to find email addresses
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        
        # Split text by email addresses
        parts = re.split(email_pattern, text)
        emails = re.findall(email_pattern, text)
        
        if not emails:
            return Paragraph(text, style)
        
        # Create formatted text with blue email links
        formatted_parts = []
        for i, part in enumerate(parts):
            if part:
                formatted_parts.append(f'<para>{part}</para>')
            if i < len(emails):
                formatted_parts.append(f'<para><font color="#0066CC">{emails[i]}</font></para>')
        
        formatted_text = ''.join(formatted_parts)
        return Paragraph(formatted_text, style)
    
    def generate_pdf(self, form_data: Dict, output_path: str = None) -> str:
        """Generate PDF with clean, professional styling"""
        
        if output_path is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_path = f"static/templates/generated_resumes/francisca_resume_{timestamp}.pdf"
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Create PDF document
        doc = SimpleDocTemplate(output_path, pagesize=letter)
        story = []
        
        # Add header section
        story.extend(self.generate_header(form_data))
        
        # Add education section
        if form_data.get('education'):
            story.extend(self.generate_education_section(form_data['education']))
        
        # Add experience section
        if form_data.get('experience'):
            story.extend(self.generate_experience_section(form_data['experience']))
        
        # Add leadership section
        if form_data.get('leadership'):
            story.extend(self.generate_leadership_section(form_data['leadership']))
        
        # Add volunteer section
        if form_data.get('volunteer'):
            story.extend(self.generate_volunteer_section(form_data['volunteer']))
        
        # Add skills section
        if form_data.get('skills'):
            story.extend(self.generate_skills_section(form_data['skills']))
        
        # Add referees section
        if form_data.get('referees'):
            story.extend(self.generate_referees_section(form_data['referees']))
        
        # Build PDF
        doc.build(story)
        
        return output_path
    
    def generate_header(self, form_data: Dict) -> List:
        """Generate header section with name and contact info"""
        story = []
        
        # Full name - prominent and centered
        if form_data.get('fullName'):
            story.append(Paragraph(form_data['fullName'], self.styles['FranciscaHeaderName']))
        
        # Contact info - clean and centered with blue email links
        contact_parts = []
        if form_data.get('email'):
            contact_parts.append(form_data['email'])
        if form_data.get('phone'):
            contact_parts.append(form_data['phone'])
        
        if contact_parts:
            contact_text = ' | '.join(contact_parts)
            # Format contact info with blue email links
            story.append(self.format_text_with_links(contact_text, self.styles['FranciscaContact']))
        
        story.append(Spacer(1, 15))
        return story
    
    def generate_education_section(self, education_data: List) -> List:
        """Generate education section"""
        story = []
        
        # Section header
        story.append(Paragraph("EDUCATION", self.styles['FranciscaSectionHeader']))
        
        for edu in education_data:
            # Create table for proper alignment
            institution = edu.get('institution', '')
            degree = edu.get('degree', '')
            location = edu.get('location', '')
            graduation_date = edu.get('graduationDate', '')
            
            # Build the main line text
            main_line_parts = []
            if institution:
                main_line_parts.append(institution)
            if degree:
                main_line_parts.append(degree)
            if location:
                main_line_parts.append(location)
            
            if main_line_parts:
                main_line = ', '.join(main_line_parts)
                
                # Create table for left-right alignment
                table_data = [[
                    Paragraph(main_line, self.styles['FranciscaContent']),
                    Paragraph(graduation_date, self.styles['FranciscaDate'])
                ]]
                table = Table(table_data, colWidths=[4.5*inch, 1.2*inch])
                table.setStyle(TableStyle([
                    ('ALIGN', (0, 0), (0, 0), 'LEFT'),
                    ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 0),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                    ('TOPPADDING', (0, 0), (-1, -1), 0),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
                    ('GRID', (0, 0), (-1, -1), 0, colors.white),
                ]))
                story.append(table)
            
            # Coursework
            if edu.get('coursework'):
                story.append(Paragraph(f"• {edu['coursework']}", self.styles['FranciscaBullet']))
            
            # Activities
            if edu.get('activities'):
                story.append(Paragraph(f"• {edu['activities']}", self.styles['FranciscaBullet']))
            
            story.append(Spacer(1, 8))
        
        return story
    
    def generate_experience_section(self, experience_data: List) -> List:
        """Generate professional experience section"""
        story = []
        
        # Section header
        story.append(Paragraph("PROFESSIONAL EXPERIENCE", self.styles['FranciscaSectionHeader']))
        
        for exp in experience_data:
            # Create table for proper alignment
            company = exp.get('company', '')
            position = exp.get('position', '')
            location = exp.get('location', '')
            start_date = exp.get('startDate', '')
            end_date = exp.get('endDate', '')
            current = exp.get('current', False)
            
            # Build the main line text
            main_line_parts = []
            if company:
                main_line_parts.append(company)
            if position:
                main_line_parts.append(position)
            if location:
                main_line_parts.append(location)
            
            if main_line_parts:
                main_line = ', '.join(main_line_parts)
                
                # Add dates
                date_text = start_date
                if end_date and not current:
                    date_text += f" - {end_date}"
                elif current:
                    date_text += " - Present"
                
                # Create table for left-right alignment
                table_data = [[
                    Paragraph(main_line, self.styles['FranciscaContent']),
                    Paragraph(date_text, self.styles['FranciscaDate'])
                ]]
                table = Table(table_data, colWidths=[4.5*inch, 1.2*inch])
                table.setStyle(TableStyle([
                    ('ALIGN', (0, 0), (0, 0), 'LEFT'),
                    ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 0),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                    ('TOPPADDING', (0, 0), (-1, -1), 0),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
                    ('GRID', (0, 0), (-1, -1), 0, colors.white),
                ]))
                story.append(table)
            
            # Responsibilities
            if exp.get('responsibilities'):
                responsibilities = exp['responsibilities'].split('\n')
                for resp in responsibilities:
                    if resp.strip():
                        story.append(Paragraph(f"• {resp.strip()}", self.styles['FranciscaBullet']))
            
            story.append(Spacer(1, 8))
        
        return story
    
    def generate_leadership_section(self, leadership_data: List) -> List:
        """Generate leadership/organizations section"""
        story = []
        
        # Section header
        story.append(Paragraph("LEADERSHIP/ORGANIZATIONS", self.styles['FranciscaSectionHeader']))
        
        for lead in leadership_data:
            # Create table for proper alignment
            organization = lead.get('organization', '')
            role = lead.get('role', '')
            location = lead.get('location', '')
            start_date = lead.get('startDate', '')
            end_date = lead.get('endDate', '')
            
            # Build the main line text
            main_line_parts = []
            if organization:
                main_line_parts.append(organization)
            if role:
                main_line_parts.append(role)
            if location:
                main_line_parts.append(location)
            
            if main_line_parts:
                main_line = ', '.join(main_line_parts)
                
                # Add dates
                date_text = start_date
                if end_date:
                    date_text += f" - {end_date}"
                
                # Create table for left-right alignment
                table_data = [[
                    Paragraph(main_line, self.styles['FranciscaContent']),
                    Paragraph(date_text, self.styles['FranciscaDate'])
                ]]
                table = Table(table_data, colWidths=[4*inch, 1.5*inch])
                table.setStyle(TableStyle([
                    ('ALIGN', (0, 0), (0, 0), 'LEFT'),
                    ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 0),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                    ('TOPPADDING', (0, 0), (-1, -1), 0),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
                    ('GRID', (0, 0), (-1, -1), 0, colors.white),
                ]))
                story.append(table)
            
            # Achievements
            if lead.get('achievements'):
                achievements = lead['achievements'].split('\n')
                for achievement in achievements:
                    if achievement.strip():
                        story.append(Paragraph(f"• {achievement.strip()}", self.styles['FranciscaBullet']))
            
            story.append(Spacer(1, 8))
        
        return story
    
    def generate_volunteer_section(self, volunteer_data: List) -> List:
        """Generate volunteer work section"""
        story = []
        
        # Section header
        story.append(Paragraph("VOLUNTEER WORK", self.styles['FranciscaSectionHeader']))
        
        for vol in volunteer_data:
            # Create table for proper alignment
            organization = vol.get('organization', '')
            role = vol.get('role', '')
            location = vol.get('location', '')
            start_date = vol.get('startDate', '')
            end_date = vol.get('endDate', '')
            
            # Build the main line text
            main_line_parts = []
            if organization:
                main_line_parts.append(organization)
            if role:
                main_line_parts.append(role)
            if location:
                main_line_parts.append(location)
            
            if main_line_parts:
                main_line = ', '.join(main_line_parts)
                
                # Add dates
                date_text = start_date
                if end_date:
                    date_text += f" - {end_date}"
                
                # Create table for left-right alignment
                table_data = [[
                    Paragraph(main_line, self.styles['FranciscaContent']),
                    Paragraph(date_text, self.styles['FranciscaDate'])
                ]]
                table = Table(table_data, colWidths=[4.5*inch, 1.2*inch])
                table.setStyle(TableStyle([
                    ('ALIGN', (0, 0), (0, 0), 'LEFT'),
                    ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 0),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                    ('TOPPADDING', (0, 0), (-1, -1), 0),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
                    ('GRID', (0, 0), (-1, -1), 0, colors.white),
                ]))
                story.append(table)
            
            # Responsibilities
            if vol.get('responsibilities'):
                responsibilities = vol['responsibilities'].split('\n')
                for resp in responsibilities:
                    if resp.strip():
                        story.append(Paragraph(f"• {resp.strip()}", self.styles['FranciscaBullet']))
            
            story.append(Spacer(1, 8))
        
        return story
    
    def generate_skills_section(self, skills_data: List) -> List:
        """Generate skills & interests section"""
        story = []
        
        # Section header
        story.append(Paragraph("SKILLS & INTERESTS", self.styles['FranciscaSectionHeader']))
        
        # Process skills data to match the template structure
        for skill in skills_data:
            category = skill.get('category', '')
            skills_list = skill.get('skills', '')
            
            if category and skills_list:
                # Add category label in bold
                story.append(Paragraph(f"{category}:", self.styles['FranciscaSkillsLabel']))
                # Add skills content
                story.append(Paragraph(skills_list, self.styles['FranciscaSkillsContent']))
        
        return story
    
    def generate_referees_section(self, referees_data: List) -> List:
        """Generate referees section"""
        story = []
        
        # Section header
        story.append(Paragraph("REFEREES", self.styles['FranciscaSectionHeader']))
        
        for ref in referees_data:
            # Referee name
            name = ref.get('name', '')
            if name:
                story.append(Paragraph(name, self.styles['FranciscaRefereeName']))
            
            # Position and organization
            position = ref.get('position', '')
            organization = ref.get('organization', '')
            if position and organization:
                story.append(Paragraph(f"{position}, {organization}", self.styles['FranciscaRefereeDetails']))
            
            # Contact info with blue email links
            phone = ref.get('phone', '')
            email = ref.get('email', '')
            if phone and email:
                contact_text = f"{phone}, {email}"
                story.append(self.format_text_with_links(contact_text, self.styles['FranciscaRefereeDetails']))
            
            story.append(Spacer(1, 8))
        
        return story

# Create global instance
francisca_pdf_generator_simple = FranciscaPDFGeneratorSimple()

