from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER
import re
import os
from datetime import datetime

class RobustFranciscaPDFGenerator:
    """Robust PDF generator that handles any data format"""
    
    def __init__(self):
        self.page_size = letter
        self.margin = 0.75 * inch
        
    def safe_string(self, value):
        """Convert any value to a safe string for PDF generation"""
        if value is None:
            return ""
        if isinstance(value, (int, float)):
            return str(value)
        if isinstance(value, str):
            return value.strip()
        if isinstance(value, dict):
            # Try to extract meaningful text from dictionary
            for key in ['name', 'title', 'value', 'text', 'description']:
                if key in value and value[key]:
                    return str(value[key]).strip()
            # If no meaningful key found, convert to string
            return str(value)
        if isinstance(value, list):
            # Convert list to comma-separated string
            return ", ".join([self.safe_string(item) for item in value if item])
        return str(value)
    
    def safe_list(self, value):
        """Convert any value to a safe list of strings"""
        if not value:
            return []
        if isinstance(value, str):
            return [value.strip()] if value.strip() else []
        if isinstance(value, list):
            result = []
            for item in value:
                if item:  # Skip empty items
                    safe_item = self.safe_string(item)
                    if safe_item:
                        result.append(safe_item)
            return result
        return [self.safe_string(value)]
    
    def safe_dict_list(self, value):
        """Convert any value to a safe list of dictionaries with name field"""
        if not value:
            return []
        if isinstance(value, list):
            result = []
            for item in value:
                if item:  # Skip empty items
                    if isinstance(item, dict):
                        # Ensure it has a 'name' field
                        name = self.safe_string(item.get('name', '') or item.get('title', '') or item.get('value', ''))
                        if name:
                            result.append({'name': name, 'proficiency': self.safe_string(item.get('proficiency', ''))})
                    else:
                        # Convert string to dict
                        name = self.safe_string(item)
                        if name:
                            result.append({'name': name, 'proficiency': ''})
            return result
        return [{'name': self.safe_string(value), 'proficiency': ''}]
    
    def create_styles(self):
        """Create consistent styles for the PDF"""
        styles = getSampleStyleSheet()
        
        # Custom styles matching the Francisca template
        custom_styles = {
            'title': ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=28,
                spaceAfter=8,
                alignment=TA_CENTER,
                fontName='Helvetica-Bold',
                textColor=colors.black
            ),
            'subtitle': ParagraphStyle(
                'CustomSubtitle',
                parent=styles['Normal'],
                fontSize=11,
                spaceAfter=6,
                alignment=TA_CENTER,
                fontName='Helvetica',
                textColor=colors.black
            ),
            'section_header': ParagraphStyle(
                'CustomSectionHeader',
                parent=styles['Heading2'],
                fontSize=14,
                spaceBefore=12,
                spaceAfter=6,
                fontName='Helvetica-Bold',
                textColor=colors.black
            ),
            'institution': ParagraphStyle(
                'CustomInstitution',
                parent=styles['Normal'],
                fontSize=12,
                spaceAfter=3,
                fontName='Helvetica-Bold',
                textColor=colors.black
            ),
            'date': ParagraphStyle(
                'CustomDate',
                parent=styles['Normal'],
                fontSize=10,
                spaceAfter=3,
                alignment=TA_RIGHT,
                fontName='Helvetica',
                textColor=colors.black
            ),
            'subtopic': ParagraphStyle(
                'CustomSubtopic',
                parent=styles['Normal'],
                fontSize=11,
                spaceBefore=6,
                spaceAfter=3,
                fontName='Helvetica-Bold',
                textColor=colors.black
            ),
            'description': ParagraphStyle(
                'CustomDescription',
                parent=styles['Normal'],
                fontSize=10,
                spaceAfter=3,
                fontName='Helvetica',
                textColor=colors.black
            ),
            'bullet': ParagraphStyle(
                'CustomBullet',
                parent=styles['Normal'],
                fontSize=10,
                spaceAfter=3,
                leftIndent=15,
                rightIndent=0,
                fontName='Helvetica',
                textColor=colors.black,
                leading=12
            )
        }
        
        return custom_styles
    
    def create_line(self, doc):
        """Create a horizontal line"""
        from reportlab.platypus import HRFlowable
        return HRFlowable(width="100%", thickness=1, color=colors.black, spaceBefore=2, spaceAfter=6)
    
    def format_date_range(self, start_date, end_date, current=False):
        """Format date range for display"""
        if not start_date:
            return ""
        
        start_str = self.safe_string(start_date)
        if current or not end_date:
            return f"{start_str} - Present"
        
        end_str = self.safe_string(end_date)
        return f"{start_str} - {end_str}"
    
    def build_header(self, data):
        """Build header section with professional styling matching the template"""
        story = []
        styles = self.create_styles()
        
        # Personal information
        personal_info = data.get('personalInfo', {})
        if not personal_info:
            personal_info = data  # Fallback to root data
        
        # Name - centered and large
        first_name = self.safe_string(personal_info.get('firstName', ''))
        last_name = self.safe_string(personal_info.get('lastName', ''))
        full_name = f"{first_name} {last_name}".strip()
        
        if full_name:
            story.append(Paragraph(full_name, styles['title']))
        
        # Contact information - centered with proper spacing and blue email
        email = self.safe_string(personal_info.get('email', ''))
        phone = self.safe_string(personal_info.get('phone', ''))
        
        if email and phone:
            contact_text = f'<font color="blue">{email}</font> {phone}'
            story.append(Paragraph(contact_text, styles['subtitle']))
        elif email:
            contact_text = f'<font color="blue">{email}</font>'
            story.append(Paragraph(contact_text, styles['subtitle']))
        elif phone:
            story.append(Paragraph(phone, styles['subtitle']))
        
        # Location information - centered below contact info
        city = self.safe_string(personal_info.get('city', ''))
        country = self.safe_string(personal_info.get('country', ''))
        
        if city and country:
            location_text = f"{city}, {country}"
            story.append(Paragraph(location_text, styles['subtitle']))
        elif city:
            story.append(Paragraph(city, styles['subtitle']))
        elif country:
            story.append(Paragraph(country, styles['subtitle']))
        
        story.append(Spacer(1, 12))
        return story
    
    def build_summary(self, data):
        """Build summary section"""
        story = []
        styles = self.create_styles()
        
        # Check multiple possible locations for summary data
        summary = self.safe_string(data.get('summary', ''))
        if not summary:
            # Check in personalInfo section
            personal_info = data.get('personalInfo', {})
            summary = self.safe_string(personal_info.get('summary', ''))
        if not summary:
            # Check for professionalSummary field
            summary = self.safe_string(data.get('professionalSummary', ''))
        if not summary:
            # Check for resumeObjective field
            summary = self.safe_string(data.get('resumeObjective', ''))
        
        if summary:
            story.append(Paragraph("PROFESSIONAL SUMMARY", styles['section_header']))
            story.append(self.create_line(data))
            story.append(Paragraph(summary, styles['description']))
            story.append(Spacer(1, 12))
        
        return story
    
    def build_education(self, education_list, doc):
        """Build education section with professional styling matching the template"""
        story = []
        styles = self.create_styles()
        
        if not education_list:
            return story
        
        story.append(Paragraph("EDUCATION", styles['section_header']))
        story.append(self.create_line(doc))
        
        for edu in education_list:
            # Institution name and location
            institution = self.safe_string(edu.get('institution', ''))
            city = self.safe_string(edu.get('city', ''))
            country = self.safe_string(edu.get('country', ''))
            
            # Build location string
            location_parts = []
            if city:
                location_parts.append(city)
            if country:
                location_parts.append(country)
            location_str = ', '.join(location_parts)
            
            # Dates
            start_date = self.safe_string(edu.get('startDate', ''))
            end_date = self.safe_string(edu.get('endDate', ''))
            current = edu.get('current', False)
            if isinstance(current, str):
                current = current.lower() in ['true', 'yes', 'present', 'current']
            
            # Format dates based on current status
            if current:
                if end_date:
                    dates = f"Expected Graduation: {end_date}"
                else:
                    dates = "Expected Graduation: Present"
            else:
                if end_date:
                    dates = f"Graduated: {end_date}"
                else:
                    dates = end_date if end_date else ''
            
            # Create table for institution/location and dates
            if location_str:
                institution_line = f"{institution}, {location_str}"
            else:
                institution_line = institution
                
            table_data = [[
                Paragraph(institution_line, styles['institution']),
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
            
            # Add small space before details
            story.append(Spacer(1, 3))
            
            # Major/Degree - with bold label
            degree = self.safe_string(edu.get('degree', ''))
            field_of_study = self.safe_string(edu.get('fieldOfStudy', ''))
            if degree and field_of_study:
                degree_str = f"{degree}, {field_of_study}"
                story.append(Paragraph(f"• <b>Major:</b> {degree_str}", styles['bullet']))
            elif degree:
                story.append(Paragraph(f"• <b>Major:</b> {degree}", styles['bullet']))
            
            # Coursework - with bold label
            coursework = self.safe_list(edu.get('relevantCoursework', []) or edu.get('coursework', []))
            if coursework:
                coursework_text = ", ".join(coursework)
                story.append(Paragraph(f"• <b>Relevant Coursework:</b> {coursework_text}", styles['bullet']))
            
            # Activities - with bold label
            activities = self.safe_list(edu.get('activities', []))
            if activities:
                activities_text = ", ".join(activities)
                story.append(Paragraph(f"• <b>Activities:</b> {activities_text}", styles['bullet']))
            
            # Add space between entries
            story.append(Spacer(1, 8))
        
        return story
    
    def build_experience(self, experience_list, doc):
        """Build experience section with professional styling"""
        story = []
        styles = self.create_styles()
        
        if not experience_list:
            return story
        
        story.append(Paragraph("WORK EXPERIENCE", styles['section_header']))
        story.append(self.create_line(doc))
        
        for exp in experience_list:
            # Company name and location
            company = self.safe_string(exp.get('employer', '') or exp.get('company', ''))
            city = self.safe_string(exp.get('city', ''))
            country = self.safe_string(exp.get('country', ''))
            
            # Build location string
            location_parts = []
            if city:
                location_parts.append(city)
            if country:
                location_parts.append(country)
            location_str = ', '.join(location_parts)
            
            # Dates
            start_date = self.safe_string(exp.get('startDate', ''))
            end_date = self.safe_string(exp.get('endDate', ''))
            current = exp.get('current', False)
            if isinstance(current, str):
                current = current.lower() in ['true', 'yes', 'present', 'current']
            
            dates = self.format_date_range(start_date, end_date, current) if start_date else (end_date if end_date else '')
            
            # Create table for company/location and dates
            if location_str:
                company_line = f"{company}, {location_str}"
            else:
                company_line = company
                
            table_data = [[
                Paragraph(company_line, styles['institution']),
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
            
            # Job title - on separate line
            job_title = self.safe_string(exp.get('jobTitle', '') or exp.get('position', '') or exp.get('role', ''))
            if job_title:
                story.append(Paragraph(job_title, styles['description']))
            
            # Add small space before responsibilities
            story.append(Spacer(1, 3))
            
            # Description/Responsibilities
            description = self.safe_string(exp.get('description', '') or exp.get('responsibilities', ''))
            if description:
                if '•' in description or '-' in description:
                    lines = re.split(r'[•\-]', description)
                    for line in lines:
                        if line.strip():
                            story.append(Paragraph(f"• {line.strip()}", styles['bullet']))
                else:
                    story.append(Paragraph(f"• {description}", styles['bullet']))
            
            # Achievements
            achievements = self.safe_list(exp.get('achievements', []))
            if achievements:
                for achievement in achievements:
                    story.append(Paragraph(f"• {achievement}", styles['bullet']))
            
            # Add space between entries
            story.append(Spacer(1, 8))
        
        return story
    
    def build_leadership(self, leadership_list, doc):
        """Build leadership section with professional styling"""
        story = []
        styles = self.create_styles()
        
        if not leadership_list:
            return story
        
        story.append(Paragraph("LEADERSHIP/ORGANIZATIONS", styles['section_header']))
        story.append(self.create_line(doc))
        
        for role in leadership_list:
            # Organization name and location
            organization = self.safe_string(role.get('organization', ''))
            city = self.safe_string(role.get('city', ''))
            country = self.safe_string(role.get('country', ''))
            
            # Build location string
            location_parts = []
            if city:
                location_parts.append(city)
            if country:
                location_parts.append(country)
            location_str = ', '.join(location_parts)
            
            # Dates
            start_date = self.safe_string(role.get('startDate', ''))
            end_date = self.safe_string(role.get('endDate', ''))
            current = role.get('current', False)
            if isinstance(current, str):
                current = current.lower() in ['true', 'yes', 'present', 'current']
            
            dates = self.format_date_range(start_date, end_date, current) if start_date else (end_date if end_date else '')
            
            # Create table for organization/location and dates
            if location_str:
                organization_line = f"{organization}, {location_str}"
            else:
                organization_line = organization
                
            table_data = [[
                Paragraph(organization_line, styles['institution']),
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
            
            # Title - on separate line
            title = self.safe_string(role.get('title', '') or role.get('role', ''))
            if title:
                story.append(Paragraph(title, styles['description']))
            
            # Add small space before responsibilities
            story.append(Spacer(1, 3))
            
            # Responsibilities
            responsibilities = self.safe_string(role.get('responsibilities', '') or role.get('description', ''))
            if responsibilities:
                if '•' in responsibilities or '-' in responsibilities:
                    lines = re.split(r'[•\-]', responsibilities)
                    for line in lines:
                        if line.strip():
                            story.append(Paragraph(f"• {line.strip()}", styles['bullet']))
                else:
                    story.append(Paragraph(f"• {responsibilities}", styles['bullet']))
            
            # Achievements
            achievements = self.safe_list(role.get('achievements', []))
            if achievements:
                for achievement in achievements:
                    story.append(Paragraph(f"• {achievement}", styles['bullet']))
            
            # Add space between entries
            story.append(Spacer(1, 8))
        
        return story
    
    def build_volunteer(self, volunteer_list, doc):
        """Build volunteer section with professional styling matching the template"""
        story = []
        styles = self.create_styles()
        
        if not volunteer_list:
            return story
        
        story.append(Paragraph("VOLUNTEER WORK", styles['section_header']))
        story.append(self.create_line(doc))
        
        for volunteer in volunteer_list:
            # Organization name, title, and location
            organization = self.safe_string(volunteer.get('organization', ''))
            title = self.safe_string(volunteer.get('title', '') or volunteer.get('role', ''))
            city = self.safe_string(volunteer.get('city', ''))
            country = self.safe_string(volunteer.get('country', ''))
            location = self.safe_string(volunteer.get('location', ''))
            
            # Build location string - prioritize location field, then city/country
            if location:
                location_str = location
            else:
                location_parts = []
                if city:
                    location_parts.append(city)
                if country:
                    location_parts.append(country)
                location_str = ', '.join(location_parts)
            
            # Dates
            start_date = self.safe_string(volunteer.get('startDate', ''))
            end_date = self.safe_string(volunteer.get('endDate', ''))
            current = volunteer.get('current', False)
            if isinstance(current, str):
                current = current.lower() in ['true', 'yes', 'present', 'current']
            
            # Format dates
            if current:
                dates = f"{start_date} - Present" if start_date else "Present"
            else:
                dates = self.format_date_range(start_date, end_date, current) if start_date else (end_date if end_date else '')
            
            # Create table for organization/title/location and dates
            if title and location_str:
                organization_line = f"{organization}, {title}, {location_str}"
            elif title:
                organization_line = f"{organization}, {title}"
            elif location_str:
                organization_line = f"{organization}, {location_str}"
            else:
                organization_line = organization
                
            table_data = [[
                Paragraph(organization_line, styles['institution']),
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
            
            # Add small space before responsibilities
            story.append(Spacer(1, 3))
            
            # Responsibilities - handle both description and responsibilities fields
            responsibilities = self.safe_string(volunteer.get('responsibilities', ''))
            description = self.safe_string(volunteer.get('description', ''))
            
            # Use responsibilities if available, otherwise description
            content = responsibilities if responsibilities else description
            
            if content:
                # Split by line breaks or bullet points
                if '\n' in content:
                    lines = content.split('\n')
                    for line in lines:
                        if line.strip():
                            story.append(Paragraph(f"• {line.strip()}", styles['bullet']))
                elif '•' in content or '-' in content:
                    lines = re.split(r'[•\-]', content)
                    for line in lines:
                        if line.strip():
                            story.append(Paragraph(f"• {line.strip()}", styles['bullet']))
                else:
                    story.append(Paragraph(f"• {content}", styles['bullet']))
            
            # Add space between entries
            story.append(Spacer(1, 8))
        
        return story
    
    def build_skills(self, data, doc):
        """Build skills section with professional styling matching the template"""
        story = []
        styles = self.create_styles()
        
        story.append(Paragraph("SKILLS & INTERESTS", styles['section_header']))
        story.append(self.create_line(doc))
        
        # Languages
        languages = self.safe_dict_list(data.get('languages', []))
        if languages:
            languages_text = ", ".join([
                f"{lang['name']} ({lang['proficiency']})" if lang['proficiency'] else lang['name']
                for lang in languages
            ])
            story.append(Paragraph(f"<b>Language:</b> {languages_text}", styles['description']))
        
        # Skills
        skills = self.safe_dict_list(data.get('skills', []))
        if skills:
            skills_text = ", ".join([skill['name'] for skill in skills])
            story.append(Paragraph(f"<b>Skills:</b> {skills_text}", styles['description']))
        
        # Interests
        interests = data.get('interests', [])
        if interests:
            interests_list = []
            
            if isinstance(interests, str):
                # Handle text input (comma-separated)
                interests_list = [interest.strip() for interest in interests.split(',') if interest.strip()]
            elif isinstance(interests, list):
                # Handle list format - could be list of strings or list of dicts
                for interest in interests:
                    if isinstance(interest, dict):
                        # Extract meaningful text from dictionary
                        if 'placeholder' in interest:
                            interests_list.append(str(interest['placeholder']).strip().title())
                        elif 'type' in interest:
                            interests_list.append(str(interest['type']).strip().title())
                        elif 'name' in interest:
                            interests_list.append(str(interest['name']).strip())
                        else:
                            # Try to get any string value
                            for key, value in interest.items():
                                if isinstance(value, str) and value.strip():
                                    interests_list.append(value.strip())
                                    break
                    else:
                        # Handle string items
                        interest_str = str(interest).strip()
                        if interest_str and interest_str != '{}':
                            interests_list.append(interest_str)
            
            if interests_list:
                interests_text = ", ".join(interests_list)
                story.append(Paragraph(f"<b>Interests:</b> {interests_text}", styles['description']))
        
        # Programs
        programs = data.get('programs', []) or data.get('certifications', [])
        if programs:
            programs_list = []
            
            # Handle text input (comma-separated)
            if isinstance(programs, str):
                programs_list = [program.strip() for program in programs.split(',') if program.strip()]
            else:
                # Handle list/dictionary format
                for program in programs:
                    if isinstance(program, dict):
                        # Extract meaningful text from dictionary with proper formatting
                        if 'type' in program and 'placeholder' in program:
                            # Format as "Certificate of X from Y" for better readability
                            program_type = str(program['type']).strip()
                            program_name = str(program['placeholder']).strip()
                            
                            # Capitalize first letter of each word
                            program_type = ' '.join(word.capitalize() for word in program_type.split())
                            program_name = ' '.join(word.capitalize() for word in program_name.split())
                            
                            # Format based on common patterns
                            if 'certificate' in program_type.lower():
                                programs_list.append(f"{program_type} of {program_name}")
                            elif 'diploma' in program_type.lower():
                                programs_list.append(f"{program_type} in {program_name}")
                            else:
                                programs_list.append(f"{program_type} from {program_name}")
                        elif 'name' in program:
                            programs_list.append(str(program['name']).strip())
                        elif 'title' in program:
                            programs_list.append(str(program['title']).strip())
                        else:
                            # Fallback: try to extract any meaningful text
                            meaningful_text = None
                            for key in ['description', 'value', 'text']:
                                if key in program and program[key]:
                                    meaningful_text = str(program[key]).strip()
                                    break
                            if meaningful_text:
                                programs_list.append(meaningful_text)
                    else:
                        # Handle string inputs
                        program_str = str(program).strip()
                        if program_str and program_str != '{}':
                            programs_list.append(program_str)
            
            if programs_list:
                programs_text = ", ".join(programs_list)
                story.append(Paragraph(f"<b>Programs:</b> {programs_text}", styles['description']))
        
        story.append(Spacer(1, 6))
        return story
    
    def build_references(self, data, doc):
        """Build references section with professional styling matching the template"""
        story = []
        styles = self.create_styles()
        
        referees = data.get('referees', [])
        if not referees:
            return story
        
        story.append(Paragraph("REFEREES", styles['section_header']))
        story.append(self.create_line(doc))
        
        for referee in referees:
            # Name
            name = self.safe_string(referee.get('name', ''))
            if name:
                story.append(Paragraph(f"<b>Name:</b> {name}", styles['description']))
            
            # Title/Position
            title = self.safe_string(referee.get('title', '') or referee.get('position', ''))
            if title:
                story.append(Paragraph(f"<b>Position:</b> {title}", styles['description']))
            
            # Organization
            organization = self.safe_string(referee.get('organization', ''))
            if organization:
                story.append(Paragraph(f"<b>Organization:</b> {organization}", styles['description']))
            
            # Contact information
            contact_parts = []
            
            phone = self.safe_string(referee.get('phone', ''))
            if phone:
                contact_parts.append(phone)
            
            email = self.safe_string(referee.get('email', ''))
            if email:
                contact_parts.append(email)
            
            if contact_parts:
                contact_text = ", ".join(contact_parts)
                story.append(Paragraph(f"<b>Contact information:</b> {contact_text}", styles['description']))
            
            # Add space between referee entries
            story.append(Spacer(1, 8))
        
        return story
    
    def generate_resume_pdf(self, resume_data, output_path):
        """Generate the PDF with robust error handling"""
        try:
            print("=== ROBUST PDF GENERATOR STARTING ===")
            print("Input data type:", type(resume_data))
            print("Input data keys:", list(resume_data.keys()) if isinstance(resume_data, dict) else "Not a dict")
            
            # Create document
            doc = SimpleDocTemplate(
                output_path,
                pagesize=self.page_size,
                rightMargin=self.margin,
                leftMargin=self.margin,
                topMargin=self.margin,
                bottomMargin=self.margin
            )
            
            # Build story
            story = []
            
            # Header
            print("Building header...")
            story.extend(self.build_header(resume_data))
            
            # Summary
            print("Building summary...")
            story.extend(self.build_summary(resume_data))
            
            # Education
            education_data = resume_data.get('education', [])
            if education_data:
                print("Building education...")
                story.extend(self.build_education(education_data, doc))
            
            # Experience
            experience_data = resume_data.get('workExperience', []) or resume_data.get('experience', [])
            if experience_data:
                print("Building experience...")
                story.extend(self.build_experience(experience_data, doc))
            
            # Leadership
            leadership_data = resume_data.get('leadership', []) or resume_data.get('organizations', [])
            if leadership_data:
                print("Building leadership...")
                story.extend(self.build_leadership(leadership_data, doc))
            
            # Volunteer
            volunteer_data = resume_data.get('volunteerWork', []) or resume_data.get('volunteer', [])
            if volunteer_data:
                print("Building volunteer...")
                story.extend(self.build_volunteer(volunteer_data, doc))
            
            # Skills
            print("Building skills...")
            story.extend(self.build_skills(resume_data, doc))
            
            # References
            print("Building references...")
            story.extend(self.build_references(resume_data, doc))
            
            # Build PDF
            print("Building PDF...")
            doc.build(story)
            print("=== PDF GENERATION SUCCESSFUL ===")
            return True
            
        except Exception as e:
            print(f"=== PDF GENERATION FAILED ===")
            print(f"Error: {e}")
            print(f"Error type: {type(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            return False
