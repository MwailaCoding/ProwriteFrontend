"""
Professional Francisca Style PDF Generator
ATS-friendly resume formatting with exact styling from the template
"""

import os
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, mm
from reportlab.lib.colors import black, white, HexColor
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.fonts import addMapping
import re

class ProfessionalFranciscaPDFGenerator:
    def __init__(self, theme_name="professional"):
        self.styles = getSampleStyleSheet()
        self.page_size = A4
        self.margins = (0.6*inch, 0.6*inch, 0.6*inch, 0.6*inch)  # Match preview margins
        
        # Apply theme
        self.apply_theme(theme_name)
        
        # Register professional fonts
        self.register_pro_fonts()

    def apply_theme(self, theme_name="professional"):
        """Apply different visual themes"""
        # Use brighter colors for better visibility
        self.primary_color = HexColor('#000000')  # Pure black for main text
        self.accent_color = HexColor('#2196F3')  # Bright blue for accents
        self.background_color = HexColor('#FFFFFF')  # Pure white background
        self.text_color = HexColor('#000000')  # Pure black for text
        self.light_gray = HexColor('#757575')  # Medium gray for subtle text
        self.dark_gray = HexColor('#424242')  # Darker gray for emphasis

    def register_pro_fonts(self):
        """Register professional fonts with fallbacks"""
        # Use built-in fonts that are guaranteed to work
        try:
            # Try to register custom fonts if available
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
        """Create professional styles matching the template exactly"""
        # Use built-in fonts that are guaranteed to work
        available_fonts = pdfmetrics.getRegisteredFontNames()
        
        # Use built-in fonts that are guaranteed to work
        bold_font = 'Helvetica-Bold' if 'Helvetica-Bold' in available_fonts else 'Times-Bold'
        italic_font = 'Helvetica-Oblique' if 'Helvetica-Oblique' in available_fonts else 'Times-Italic'
        regular_font = 'Helvetica' if 'Helvetica' in available_fonts else 'Times-Roman'
        
        return {
            'name': ParagraphStyle(
                'name',
                parent=self.styles['Normal'],
                fontName=bold_font,
                fontSize=18,  # Match preview size
                alignment=TA_CENTER,
                spaceAfter=2,  # Tighter spacing
                textColor=self.text_color,
                leading=20  # Match preview leading
            ),
            'contact': ParagraphStyle(
                'contact',
                parent=self.styles['Normal'],
                fontName=regular_font,
                fontSize=10,
                alignment=TA_CENTER,
                textColor=self.accent_color,  # Blue color for email
                spaceAfter=16,
                leading=12
            ),
            'section_header': ParagraphStyle(
                'section_header',
                parent=self.styles['Normal'],
                fontName=bold_font,
                fontSize=11,  # Match original size
                spaceAfter=0,  # NO space after header - line comes immediately
                spaceBefore=8,  # Less space before headers
                textColor=self.text_color,
                leading=13,  # Match original leading
                alignment=TA_LEFT  # Left align section headers
            ),
            'institution': ParagraphStyle(
                'institution',
                parent=self.styles['Normal'],
                fontName=bold_font,
                fontSize=10,  # Match original size
                spaceAfter=1,
                textColor=self.text_color,
                leading=12,
                alignment=TA_LEFT  # Ensure left alignment
            ),
            'date': ParagraphStyle(
                'date',
                parent=self.styles['Normal'],
                fontName=regular_font,
                fontSize=9,
                alignment=TA_RIGHT,
                spaceAfter=1,
                textColor=self.text_color,
                leading=11
            ),
            'title': ParagraphStyle(
                'title',
                parent=self.styles['Normal'],
                fontName=italic_font,  # Italic for titles
                fontSize=10,
                spaceAfter=1,
                textColor=self.text_color,
                leading=12
            ),
            'description': ParagraphStyle(
                'description',
                parent=self.styles['Normal'],
                fontName=regular_font,
                fontSize=9,
                leftIndent=0,
                spaceAfter=1,
                textColor=self.text_color,
                leading=11,
                alignment=TA_JUSTIFY
            ),
            'subtopic': ParagraphStyle(
                'subtopic',
                parent=self.styles['Normal'],
                fontName=bold_font,  # BOLD for subtopics like "Relevant Coursework:", "Activities:", etc.
                fontSize=9,
                leftIndent=0,
                spaceAfter=1,
                textColor=self.text_color,
                leading=11
            ),
            'bullet': ParagraphStyle(
                'bullet',
                parent=self.styles['Normal'],
                fontName=regular_font,
                fontSize=9,  # Match original size
                leftIndent=15,  # Indentation for bullet points
                firstLineIndent=-15,
                spaceAfter=1,  # Tighter spacing between bullets
                textColor=self.text_color,
                leading=11,  # Match original leading
                bulletIndent=0,
                bulletFontName=regular_font,
                bulletFontSize=9,  # Match text size
                alignment=TA_LEFT,  # Left align for better readability
                bulletText='•'  # Explicit bullet character
            )
        }

    def format_date(self, date_str):
        """Simple date formatting"""
        if not date_str:
            return ''
        try:
            date_obj = datetime.strptime(date_str, '%Y-%m-%d')
            return date_obj.strftime('%b %Y')
        except:
            return date_str

    def format_date_range(self, start_date, end_date, current):
        """Format date range"""
        start = self.format_date(start_date)
        end = 'Present' if current else self.format_date(end_date)
        return f"{start} - {end}"

    def create_line(self, doc):
        """Create a professional horizontal line matching the template"""
        line_data = [['']]
        line_table = Table(line_data, colWidths=[doc.width])
        line_table.setStyle(TableStyle([
            ('LINEBELOW', (0, 0), (0, 0), 0.5, self.text_color),  # Thin line to match original
            ('TOPPADDING', (0, 0), (0, 0), -4),  # More negative padding to pull line up closer to text
            ('BOTTOMPADDING', (0, 0), (0, 0), 0),  # NO padding below line
        ]))
        return line_table

    def build_header(self, data):
        """Build header section matching the template"""
        story = []
        styles = self.create_styles()
        
        # Handle different data formats
        if 'personalInfo' in data:
            # New format with personalInfo object
            personal_info = data.get('personalInfo', {})
            first_name = personal_info.get('firstName', '')
            last_name = personal_info.get('lastName', '')
            email = personal_info.get('email', '')
            phone = personal_info.get('phone', '')
            city = personal_info.get('city', '')
            country = personal_info.get('country', '')
            full_name = f"{first_name} {last_name}".strip()
        else:
            # Old format with direct fields
            full_name = data.get('fullName', '')
            email = data.get('email', '')
            phone = data.get('phone', '')
            city = data.get('city', '')
            country = data.get('country', '')
        
        # Name - exactly as in template
        if full_name:
            story.append(Paragraph(full_name.upper(), styles['name']))
        
        # Contact - exactly as in template
        # Email and phone on same line
        if email:
            contact_line = email
            if phone:
                contact_line += f" +{phone.lstrip('+')}"  # Ensure plus sign format
            story.append(Paragraph(contact_line, styles['contact']))
        
        # Location on next line if present
        if city and country:
            location = f"{city}, {country}"
            story.append(Paragraph(location, styles['description']))
        
        return story

    def build_education(self, education_list, doc):
        """Build education section matching the template exactly"""
        story = []
        styles = self.create_styles()
        
        if not education_list:
            return story
        
        # Section header - exactly as in template
        story.append(Paragraph("EDUCATION", styles['section_header']))
        story.append(self.create_line(doc))
        
        for edu in education_list:
            # Handle different field names
            institution = edu.get('institution', '')
            location = edu.get('location', '')
            city = edu.get('city', '')
            country = edu.get('country', '')
            
            # Build institution string - match original format exactly
            institution_parts = [institution]
            if city:
                institution_parts.append(city)
            if country:
                institution_parts.append(country)
            institution_str = ', '.join([part for part in institution_parts if part])
            
            # Handle dates - try different field names
            start_date = edu.get('startDate', '') or edu.get('start', '')
            end_date = edu.get('endDate', '') or edu.get('end', '') or edu.get('graduationDate', '')
            current = edu.get('current', False)
            
            # Convert current to boolean if it's a string
            if isinstance(current, str):
                current = current.lower() in ['true', 'yes', 'present', 'current']
            
            dates = self.format_date_range(start_date, end_date, current) if start_date else (end_date if end_date else '')
            
            # Create table for institution and dates
            table_data = [[
                Paragraph(institution_str, styles['institution']),
                Paragraph(dates, styles['date'])
            ]]
            table = Table(table_data, colWidths=[doc.width*0.7, doc.width*0.3])
            table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (0, 0), 'LEFT'),
                ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('TOPPADDING', (0, 0), (-1, -1), 0),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
            ]))
            story.append(table)
            
            # Degree - handle different field names (match original template exactly)
            degree = edu.get('degree', '')
            field_of_study = edu.get('fieldOfStudy', '') or edu.get('field', '')
            degree_str = f"{degree} in {field_of_study}".strip(' in ')
            if degree_str:
                story.append(Paragraph("Major:", styles['subtopic']))  # BOLD subtopic label
                story.append(Paragraph(degree_str, styles['description']))  # Regular text for degree
            
            # Coursework - handle different field names (exactly as in template)
            coursework = edu.get('relevantCoursework', '') or edu.get('coursework', '')
            if coursework:
                if isinstance(coursework, list):
                    # Handle both string and object arrays
                    coursework_list = []
                    for item in coursework:
                        if isinstance(item, dict):
                            coursework_list.append(item.get('name', '') or item.get('value', '') or str(item))
                        else:
                            coursework_list.append(str(item))
                    coursework = ', '.join(coursework_list)
                story.append(Paragraph("Relevant Coursework:", styles['subtopic']))  # BOLD subtopic
                story.append(Paragraph(coursework, styles['description']))
            
            # Activities (exactly as in template)
            activities = edu.get('activities', '')
            if activities:
                if isinstance(activities, list):
                    # Handle both string and object arrays
                    activities_list = []
                    for item in activities:
                        if isinstance(item, dict):
                            activities_list.append(item.get('name', '') or item.get('value', '') or str(item))
                        else:
                            activities_list.append(str(item))
                    activities = ', '.join(activities_list)
                story.append(Paragraph("Activities:", styles['subtopic']))  # BOLD subtopic
                story.append(Paragraph(activities, styles['description']))
            
            story.append(Spacer(1, 6))  # Match preview spacing
        
        return story

    def build_experience(self, experience_list, doc):
        """Build experience section matching the template exactly"""
        story = []
        styles = self.create_styles()
        
        if not experience_list:
            return story
        
        # Section header - exactly as in template
        story.append(Paragraph("PROFESSIONAL EXPERIENCE", styles['section_header']))
        story.append(self.create_line(doc))
        
        for exp in experience_list:
            # Handle different field names
            company = exp.get('employer', '') or exp.get('company', '')
            location = exp.get('location', '')
            city = exp.get('city', '')
            country = exp.get('country', '')
            
            # Build company string - match original format exactly
            company_parts = [company]
            if city:
                company_parts.append(city)
            if country:
                company_parts.append(country)
            company_str = ', '.join([part for part in company_parts if part])
            
            # Handle dates - try different field names
            start_date = exp.get('startDate', '') or exp.get('start', '')
            end_date = exp.get('endDate', '') or exp.get('end', '')
            current = exp.get('current', False)
            
            # Convert current to boolean if it's a string
            if isinstance(current, str):
                current = current.lower() in ['true', 'yes', 'present', 'current']
            
            dates = self.format_date_range(start_date, end_date, current) if start_date else (end_date if end_date else '')
            
            # Create table for company and dates
            table_data = [[
                Paragraph(company_str, styles['institution']),
                Paragraph(dates, styles['date'])
            ]]
            table = Table(table_data, colWidths=[doc.width*0.7, doc.width*0.3])
            table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (0, 0), 'LEFT'),
                ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('TOPPADDING', (0, 0), (-1, -1), 0),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
            ]))
            story.append(table)
            
            # Job title - handle different field names (match original template exactly)
            job_title = exp.get('jobTitle', '') or exp.get('position', '') or exp.get('role', '')
            if job_title:
                story.append(Paragraph("Role:", styles['subtopic']))  # BOLD subtopic label
                story.append(Paragraph(job_title, styles['description']))  # Regular text for job title
            
            # Description - handle different field names with bullet points
            description = exp.get('description', '') or exp.get('responsibilities', '')
            if description:
                story.append(Paragraph("Responsibilities:", styles['subtopic']))  # BOLD subtopic
                if isinstance(description, list):
                    for item in description:
                        # Clean up bullet points for consistent formatting
                        clean_item = re.sub(r'^[-•*]\s*', '', str(item))
                        story.append(Paragraph(f"• {clean_item}", styles['bullet']))
                else:
                    # Handle string description - split into bullet points if needed
                    if '•' in description or '-' in description:
                        # Split existing bullet points
                        lines = re.split(r'[•\-]', description)
                        for line in lines:
                            if line.strip():
                                story.append(Paragraph(f"• {line.strip()}", styles['bullet']))
                    else:
                        # Single description as bullet point
                        story.append(Paragraph(f"• {description}", styles['bullet']))
            
            # Achievements
            achievements = exp.get('achievements', [])
            if achievements:
                story.append(Paragraph("Achievements:", styles['subtopic']))  # BOLD subtopic
                if isinstance(achievements, list):
                    for achievement in achievements:
                        # Handle both string and object formats
                        if isinstance(achievement, dict):
                            achievement_text = achievement.get('name', '') or achievement.get('title', '') or str(achievement)
                        else:
                            achievement_text = str(achievement)
                        story.append(Paragraph(f"• {achievement_text}", styles['bullet']))
                else:
                    # Single achievement as bullet point
                    story.append(Paragraph(f"• {achievements}", styles['bullet']))
            
            story.append(Spacer(1, 6))  # Match preview spacing
        
        return story

    def build_leadership(self, leadership_list, doc):
        """Build leadership section matching the template exactly"""
        story = []
        styles = self.create_styles()
        
        if not leadership_list:
            return story
            
        # Section header - exactly as in template
        story.append(Paragraph("LEADERSHIP/ORGANIZATIONS", styles['section_header']))
        story.append(self.create_line(doc))
        
        for role in leadership_list:
            # Handle different field names
            organization = role.get('organization', '')
            location = role.get('location', '')
            city = role.get('city', '')
            country = role.get('country', '')
            
            # Build organization string - match original format exactly
            organization_parts = [organization]
            if city:
                organization_parts.append(city)
            if country:
                organization_parts.append(country)
            organization_str = ', '.join([part for part in organization_parts if part])
            
            # Handle dates - try different field names
            start_date = role.get('startDate', '') or role.get('start', '')
            end_date = role.get('endDate', '') or role.get('end', '')
            current = role.get('current', False)
            
            # Convert current to boolean if it's a string
            if isinstance(current, str):
                current = current.lower() in ['true', 'yes', 'present', 'current']
            
            dates = self.format_date_range(start_date, end_date, current) if start_date else (end_date if end_date else '')
            
            # Create table for organization and dates
            table_data = [[
                Paragraph(organization_str, styles['institution']),
                Paragraph(dates, styles['date'])
            ]]
            table = Table(table_data, colWidths=[doc.width*0.7, doc.width*0.3])
            table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (0, 0), 'LEFT'),
                ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('TOPPADDING', (0, 0), (-1, -1), 0),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
            ]))
            story.append(table)
            
            # Title - handle different field names (match original template exactly)
            title = role.get('title', '') or role.get('role', '')
            if title:
                story.append(Paragraph("Role:", styles['subtopic']))  # BOLD subtopic label
                story.append(Paragraph(title, styles['description']))  # Regular text for title
            
            # Responsibilities
            responsibilities = role.get('responsibilities', '') or role.get('description', '')
            if responsibilities:
                story.append(Paragraph("Responsibilities:", styles['subtopic']))  # BOLD subtopic
                if isinstance(responsibilities, list):
                    for resp in responsibilities:
                        story.append(Paragraph(f"• {resp}", styles['bullet']))
                else:
                    # Handle string description - split into bullet points if needed
                    if '•' in responsibilities or '-' in responsibilities:
                        # Split existing bullet points
                        lines = re.split(r'[•\-]', responsibilities)
                        for line in lines:
                            if line.strip():
                                story.append(Paragraph(f"• {line.strip()}", styles['bullet']))
                    else:
                        # Single responsibility as bullet point
                        story.append(Paragraph(f"• {responsibilities}", styles['bullet']))
            
            # Achievements
            achievements = role.get('achievements', [])
            if achievements:
                story.append(Paragraph("Achievements:", styles['subtopic']))  # BOLD subtopic
                if isinstance(achievements, list):
                    for achievement in achievements:
                        # Handle both string and object formats
                        if isinstance(achievement, dict):
                            achievement_text = achievement.get('name', '') or achievement.get('title', '') or str(achievement)
                        else:
                            achievement_text = str(achievement)
                        story.append(Paragraph(f"• {achievement_text}", styles['bullet']))
                else:
                    # Single achievement as bullet point
                    story.append(Paragraph(f"• {achievements}", styles['bullet']))
            
            story.append(Spacer(1, 6))  # Match preview spacing
        
        return story

    def build_volunteer(self, volunteer_list, doc):
        """Build volunteer section matching the template exactly"""
        story = []
        styles = self.create_styles()
        
        if not volunteer_list:
            return story
            
        # Section header - exactly as in template
        story.append(Paragraph("VOLUNTEER WORK", styles['section_header']))
        story.append(self.create_line(doc))
        
        for volunteer in volunteer_list:
            # Handle different field names
            organization = volunteer.get('organization', '')
            location = volunteer.get('location', '')
            city = volunteer.get('city', '')
            country = volunteer.get('country', '')
            
            # Build organization string - match original format exactly
            organization_parts = [organization]
            if city:
                organization_parts.append(city)
            if country:
                organization_parts.append(country)
            organization_str = ', '.join([part for part in organization_parts if part])
            
            # Handle dates - try different field names
            start_date = volunteer.get('startDate', '') or volunteer.get('start', '')
            end_date = volunteer.get('endDate', '') or volunteer.get('end', '')
            current = volunteer.get('current', False)
            
            # Convert current to boolean if it's a string
            if isinstance(current, str):
                current = current.lower() in ['true', 'yes', 'present', 'current']
            
            dates = self.format_date_range(start_date, end_date, current) if start_date else (end_date if end_date else '')
            
            # Create table for organization and dates
            table_data = [[
                Paragraph(organization_str, styles['institution']),
                Paragraph(dates, styles['date'])
            ]]
            table = Table(table_data, colWidths=[doc.width*0.7, doc.width*0.3])
            table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (0, 0), 'LEFT'),
                ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('TOPPADDING', (0, 0), (-1, -1), 0),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
            ]))
            story.append(table)
            
            # Title - handle different field names (match original template exactly)
            title = volunteer.get('title', '') or volunteer.get('role', '')
            if title:
                story.append(Paragraph("Role:", styles['subtopic']))  # BOLD subtopic label
                story.append(Paragraph(title, styles['description']))  # Regular text for title
            
            # Description - handle different field names
            description = volunteer.get('description', '') or volunteer.get('responsibilities', '')
            if description:
                story.append(Paragraph("Responsibilities:", styles['subtopic']))  # BOLD subtopic
                if isinstance(description, list):
                    for item in description:
                        story.append(Paragraph(f"• {item}", styles['bullet']))
                else:
                    # Handle string description - split into bullet points if needed
                    if '•' in description or '-' in description:
                        # Split existing bullet points
                        lines = re.split(r'[•\-]', description)
                        for line in lines:
                            if line.strip():
                                story.append(Paragraph(f"• {line.strip()}", styles['bullet']))
                    else:
                        # Single description as bullet point
                        story.append(Paragraph(f"• {description}", styles['bullet']))
            
            story.append(Spacer(1, 6))  # Match preview spacing
        
        return story

    def build_skills(self, data, doc):
        """Build skills section matching the template exactly"""
        story = []
        styles = self.create_styles()
        
        # Section header - exactly as in template
        story.append(Paragraph("SKILLS & INTERESTS", styles['section_header']))
        story.append(self.create_line(doc))
        
        # Languages
        if data.get('languages'):
            story.append(Paragraph("Languages:", styles['subtopic']))  # BOLD subtopic
            languages = data['languages']
            if isinstance(languages, list):
                languages_list = []
                for lang in languages:
                    if isinstance(lang, dict):
                        name = lang.get('name', '') or lang.get('language', '')
                        proficiency = lang.get('proficiency', '')
                        languages_list.append(f"{name} ({proficiency})" if proficiency else name)
                    else:
                        languages_list.append(str(lang))
                languages_text = ", ".join(languages_list)
            else:
                languages_text = str(languages)
            story.append(Paragraph(languages_text, styles['description']))
        
        # Skills
        if data.get('skills'):
            story.append(Paragraph("Skills:", styles['subtopic']))  # BOLD subtopic
            skills = data['skills']
            if isinstance(skills, list):
                skills_list = []
                for skill in skills:
                    if isinstance(skill, dict):
                        skills_list.append(skill.get('name', '') or str(skill))
                    else:
                        skills_list.append(str(skill))
                skills_text = ", ".join(skills_list)
            else:
                skills_text = str(skills)
            story.append(Paragraph(skills_text, styles['description']))
        
        # Interests
        if data.get('interests'):
            story.append(Paragraph("Interests:", styles['subtopic']))  # BOLD subtopic
            interests = data['interests']
            if isinstance(interests, list):
                # Handle both string arrays and object arrays
                interests_list = []
                for interest in interests:
                    if isinstance(interest, dict):
                        interests_list.append(interest.get('name', '') or str(interest))
                    else:
                        interests_list.append(str(interest))
                interests_text = ", ".join(interests_list)
            else:
                interests_text = str(interests)
            story.append(Paragraph(interests_text, styles['description']))
        
        # Programs/Certifications
        if data.get('programs') or data.get('certifications'):
            story.append(Paragraph("Programs:", styles['subtopic']))  # BOLD subtopic
            programs = data.get('programs', []) or data.get('certifications', [])
            if isinstance(programs, list):
                # Handle both string arrays and object arrays
                programs_list = []
                for program in programs:
                    if isinstance(program, dict):
                        programs_list.append(program.get('name', '') or str(program))
                    else:
                        programs_list.append(str(program))
                programs_text = ", ".join(programs_list)
            else:
                programs_text = str(programs)
            story.append(Paragraph(programs_text, styles['description']))
        
        story.append(Spacer(1, 6))  # Match preview spacing
        return story

    def build_references(self, data, doc):
        """Build references section matching the template exactly"""
        story = []
        styles = self.create_styles()
        
        # Section header - exactly as in template
        story.append(Paragraph("REFEREES", styles['section_header']))
        story.append(self.create_line(doc))
        
        if data.get('referees'):
            for referee in data['referees']:
                # Name
                name = referee.get('name', '')
                if name:
                    story.append(Paragraph("Name:", styles['subtopic']))  # BOLD subtopic label
                    story.append(Paragraph(name, styles['description']))  # Regular text
                
                # Position
                position = referee.get('position', '')
                if position:
                    story.append(Paragraph("Position:", styles['subtopic']))  # BOLD subtopic label
                    story.append(Paragraph(position, styles['description']))  # Regular text
                
                # Organization
                organization = referee.get('organization', '')
                if organization:
                    story.append(Paragraph("Organization:", styles['subtopic']))  # BOLD subtopic label
                    story.append(Paragraph(organization, styles['description']))  # Regular text
                
                # Contact information
                contact = referee.get('contact', '')
                phone = referee.get('phone', '')
                email = referee.get('email', '')
                
                if contact or phone or email:
                    story.append(Paragraph("Contact information:", styles['subtopic']))  # BOLD subtopic label
                    
                    # Build contact string
                    contact_parts = []
                    if contact:
                        contact_parts.append(contact)
                    elif phone or email:
                        if phone:
                            contact_parts.append(phone)
                        if email:
                            contact_parts.append(email)
                    
                    contact_text = ", ".join(contact_parts)
                    story.append(Paragraph(contact_text, styles['description']))  # Regular text
                
                story.append(Spacer(1, 6))  # Match preview spacing
        else:
            story.append(Paragraph("Available upon request", styles['description']))
        
        return story

    def transform_data_format(self, data):
        """Transform data to ensure correct format for PDF generation"""
        transformed_data = data.copy()
        
        # Transform simple array fields to ensure they contain strings, not objects
        simple_array_fields = ['interests', 'programs']
        for field in simple_array_fields:
            if field in transformed_data and isinstance(transformed_data[field], list):
                transformed_array = []
                for item in transformed_data[field]:
                    if isinstance(item, dict):
                        # Extract the text value from the object
                        text_value = item.get('name', '') or item.get('value', '') or item.get('text', '') or str(item)
                        if text_value:
                            transformed_array.append(text_value)
                    else:
                        transformed_array.append(str(item))
                transformed_data[field] = transformed_array
        
        # Transform skills array
        if 'skills' in transformed_data and isinstance(transformed_data['skills'], list):
            transformed_skills = []
            for skill in transformed_data['skills']:
                if isinstance(skill, dict):
                    skill_name = skill.get('name', '') or skill.get('skill', '') or str(skill)
                    if skill_name:
                        transformed_skills.append({'name': skill_name})
                else:
                    transformed_skills.append({'name': str(skill)})
            transformed_data['skills'] = transformed_skills
        
        # Transform languages array
        if 'languages' in transformed_data and isinstance(transformed_data['languages'], list):
            transformed_languages = []
            for lang in transformed_data['languages']:
                if isinstance(lang, dict):
                    transformed_languages.append(lang)
                else:
                    transformed_languages.append({'name': str(lang), 'proficiency': ''})
            transformed_data['languages'] = transformed_languages
        
        return transformed_data

    def generate_resume_pdf(self, resume_data, output_path):
        """Generate the PDF with professional formatting"""
        try:
            # Debug: Print the actual data structure being received
            print("=== PDF GENERATOR DEBUG ===")
            print("Full resume_data:", resume_data)
            print("Interests:", resume_data.get('interests', []))
            print("Programs:", resume_data.get('programs', []))
            print("Skills:", resume_data.get('skills', []))
            print("Languages:", resume_data.get('languages', []))
            print("Education:", resume_data.get('education', []))
            print("Work Experience:", resume_data.get('workExperience', []))
            print("==========================")

            # Transform data to ensure correct format
            resume_data = self.transform_data_format(resume_data)
            
            print("=== AFTER TRANSFORMATION ===")
            print("Interests after transform:", resume_data.get('interests', []))
            print("Programs after transform:", resume_data.get('programs', []))
            print("Skills after transform:", resume_data.get('skills', []))
            print("Languages after transform:", resume_data.get('languages', []))
            print("=============================")
            
            # Create document
            doc = SimpleDocTemplate(
                output_path,
                pagesize=self.page_size,
                topMargin=self.margins[0],
                bottomMargin=self.margins[1],
                leftMargin=self.margins[2],
                rightMargin=self.margins[3]
            )
            
            # Build story
            story = []
            
            # Header
            try:
                print("Building header...")
                story.extend(self.build_header(resume_data))
            except Exception as e:
                print(f"Error in header: {e}")
                raise
            
            # Education
            education_data = resume_data.get('education', [])
            if education_data:
                try:
                    print("Building education...")
                    story.extend(self.build_education(education_data, doc))
                except Exception as e:
                    print(f"Error in education: {e}")
                    raise
            
            # Experience - handle different field names
            experience_data = resume_data.get('workExperience', []) or resume_data.get('experience', [])
            if experience_data:
                try:
                    print("Building experience...")
                    story.extend(self.build_experience(experience_data, doc))
                except Exception as e:
                    print(f"Error in experience: {e}")
                    raise
            
            # Leadership
            leadership_data = resume_data.get('leadership', []) or resume_data.get('organizations', [])
            if leadership_data:
                try:
                    print("Building leadership...")
                    story.extend(self.build_leadership(leadership_data, doc))
                except Exception as e:
                    print(f"Error in leadership: {e}")
                    raise
            
            # Volunteer - handle different field names
            volunteer_data = resume_data.get('volunteerWork', []) or resume_data.get('volunteer', [])
            if volunteer_data:
                try:
                    print("Building volunteer...")
                    story.extend(self.build_volunteer(volunteer_data, doc))
                except Exception as e:
                    print(f"Error in volunteer: {e}")
                    raise
            
            # Skills
            try:
                print("Building skills...")
                story.extend(self.build_skills(resume_data, doc))
            except Exception as e:
                print(f"Error in skills: {e}")
                raise
            
            # References
            try:
                print("Building references...")
                story.extend(self.build_references(resume_data, doc))
            except Exception as e:
                print(f"Error in references: {e}")
                raise
            
            # Build PDF
            doc.build(story)
            return True
            
        except Exception as e:
            # Log error for production monitoring
            import logging
            logging.error(f"PDF generation failed: {e}")
            print(f"Error generating PDF: {e}")
            print(f"Error type: {type(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            return False    