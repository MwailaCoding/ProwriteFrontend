"""
Resume Parser Service
Extracts structured data from uploaded resume files and maps to Francisca form fields
"""

import os
import re
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import PyPDF2
import docx
from docx import Document
import openai

logger = logging.getLogger(__name__)

class ResumeParserService:
    def __init__(self):
        """Initialize the resume parser service"""
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        if self.openai_api_key:
            openai.api_key = self.openai_api_key
        
        # Common patterns for extracting information
        self.patterns = {
            'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            'phone': r'(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})',
            'linkedin': r'linkedin\.com/in/[\w-]+',
            'github': r'github\.com/[\w-]+',
            'website': r'https?://[\w.-]+\.[a-zA-Z]{2,}',
            'years_experience': r'(\d+)\+?\s*years?\s*(?:of\s*)?experience',
            'degree': r'(Bachelor|Master|PhD|Associate|Certificate|Diploma)\s*(?:of\s*)?(?:Science|Arts|Engineering|Business|Computer Science|Information Technology)',
            'gpa': r'GPA[:\s]*(\d+\.?\d*)',
            'graduation_year': r'(?:graduated|graduation)[:\s]*(\d{4})',
            'company': r'(?:at|@)\s*([A-Z][a-zA-Z\s&.,]+?)(?:\s|$|,|\n)',
            'job_title': r'(Senior|Junior|Lead|Principal|Staff|Manager|Director|Engineer|Developer|Analyst|Consultant|Specialist|Coordinator|Assistant|Executive|Officer|Representative|Agent|Technician|Designer|Architect|Scientist|Researcher|Professor|Instructor|Teacher|Trainer|Advisor|Consultant|Freelancer|Contractor|Intern|Volunteer|Student|Graduate|Entry|Level|Mid|Senior|Principal|Staff|Lead|Manager|Director|VP|C-Level|CEO|CTO|CFO|COO|President|Founder|Owner|Partner|Associate|Senior|Junior|Lead|Principal|Staff|Manager|Director|VP|C-Level|CEO|CTO|CFO|COO|President|Founder|Owner|Partner|Associate)\s+([A-Za-z\s&.,]+)',
            'skills': r'(?:Skills|Technical Skills|Core Competencies|Expertise|Proficiencies)[:\s]*(.*?)(?:\n\n|\n[A-Z]|$)',
            'certifications': r'(?:Certifications|Certificates|Licenses)[:\s]*(.*?)(?:\n\n|\n[A-Z]|$)',
            'languages': r'(?:Languages|Language Skills)[:\s]*(.*?)(?:\n\n|\n[A-Z]|$)',
            'projects': r'(?:Projects|Portfolio|Key Projects)[:\s]*(.*?)(?:\n\n|\n[A-Z]|$)',
            'achievements': r'(?:Achievements|Awards|Honors|Recognition)[:\s]*(.*?)(?:\n\n|\n[A-Z]|$)'
        }

    def parse_resume_file(self, file_path: str, file_type: str) -> Dict[str, Any]:
        """Parse resume file and extract structured data"""
        try:
            # Extract text from file
            if file_type.lower() == 'pdf':
                text = self._extract_text_from_pdf(file_path)
            elif file_type.lower() in ['doc', 'docx']:
                text = self._extract_text_from_docx(file_path)
            else:
                raise ValueError(f"Unsupported file type: {file_type}")
            
            if not text.strip():
                raise ValueError("No text content found in the file")
            
            # Parse the extracted text
            parsed_data = self._parse_resume_text(text)
            
            # Enhance with AI if available
            if self.openai_api_key:
                parsed_data = self._enhance_with_ai(parsed_data, text)
            
            return {
                'success': True,
                'parsed_data': parsed_data,
                'raw_text': text,
                'file_type': file_type,
                'parsed_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error parsing resume file: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'parsed_data': None
            }

    def _extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF file"""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
                return text
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            raise

    def _extract_text_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX file"""
        try:
            doc = Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text
        except Exception as e:
            logger.error(f"Error extracting text from DOCX: {str(e)}")
            raise

    def _parse_resume_text(self, text: str) -> Dict[str, Any]:
        """Parse resume text using SIMPLE and RELIABLE pattern-based extraction"""
        try:
            # Use simple, reliable extraction
            return self._simple_reliable_extraction(text)
        except Exception as e:
            logger.error(f"Error in simple extraction: {str(e)}")
            return {}

    def _simple_reliable_extraction(self, text: str) -> Dict[str, Any]:
        """SIMPLE and RELIABLE resume extraction that actually works"""
        try:
            lines = text.split('\n')
            
            # 1. Extract Personal Information
            personal_info = self._extract_basic_personal_info(text, lines)
            
            # 2. Extract Summary (first substantial paragraph)
            summary = self._extract_basic_summary(text, lines)
            
            # 3. Extract Work Experience
            work_experience = self._extract_basic_work_experience(text)
            
            # 4. Extract Education
            education = self._extract_basic_education(text)
            
            # 5. Extract Skills (scan entire text)
            skills = self._extract_basic_skills(text)
            
            # 6. Extract Projects
            projects = self._extract_basic_projects(text)
            
            # 7. Extract Certifications
            certifications = self._extract_basic_certifications(text)
            
            # 8. Extract Achievements/Awards
            achievements = self._extract_basic_achievements(text)
            
            # 9. Extract Languages
            languages = self._extract_basic_languages(text)
            
            # 10. Extract Leadership Experience
            leadership = self._extract_basic_leadership(text)
            
            # 11. Extract Volunteer Work
            volunteer_work = self._extract_basic_volunteer_work(text)
            
            # 12. Extract References
            referees = self._extract_basic_references(text)
            
            return {
                'personalInfo': personal_info,
                'summary': summary,
                'workExperience': work_experience,
                'education': education,
                'skills': skills,
                'projects': projects,
                'certifications': certifications,
                'achievements': achievements,
                'languages': languages,
                'leadership': leadership,
                'volunteerWork': volunteer_work,
                'referees': referees
            }
            
        except Exception as e:
            logger.error(f"Error in simple reliable extraction: {str(e)}")
            return {}

    def _extract_basic_personal_info(self, text: str, lines: list) -> Dict[str, str]:
        """Extract basic personal information reliably"""
        personal_info = {}
        
        # Extract email (most reliable)
        email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
        if email_match:
            personal_info['email'] = email_match.group(0)
        
        # Extract phone (multiple patterns)
        phone_patterns = [
            r'(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})',
            r'(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',
            r'\d{3}[-.\s]?\d{3}[-.\s]?\d{4}'
        ]
        
        for pattern in phone_patterns:
            phone_match = re.search(pattern, text)
            if phone_match:
                personal_info['phone'] = phone_match.group(0)
                break
        
        # Extract name (first line that looks like a name)
        for line in lines[:5]:
            line = line.strip()
            if (len(line) > 2 and len(line) < 50 and 
                not any(keyword in line.lower() for keyword in 
                ['email', 'phone', 'address', 'linkedin', 'github', 'summary', 'objective', 'experience', 'education', 'skills', 'resume', 'cv'])):
                # Split name
                name_parts = line.split()
                if len(name_parts) >= 2:
                    personal_info['firstName'] = name_parts[0]
                    personal_info['lastName'] = ' '.join(name_parts[1:])
                    break
                elif len(name_parts) == 1:
                    personal_info['firstName'] = name_parts[0]
                    break
        
        # Extract location (look for city, state patterns)
        location_patterns = [
            r'([A-Z][a-z]+(?:[,\s]+[A-Z]{2})?)',  # City, State
            r'([A-Z][a-z]+(?:[,\s]+[A-Z][a-z]+))',  # City, Country
        ]
        
        for pattern in location_patterns:
            location_match = re.search(pattern, text)
            if location_match and not personal_info.get('city'):
                location = location_match.group(1).strip()
                if ',' in location:
                    parts = location.split(',')
                    personal_info['city'] = parts[0].strip()
                    personal_info['country'] = parts[1].strip()
                else:
                    personal_info['city'] = location
                break
        
        # Extract LinkedIn
        linkedin_match = re.search(r'linkedin\.com/in/[\w-]+', text, re.IGNORECASE)
        if linkedin_match:
            personal_info['linkedin'] = linkedin_match.group(0)
        
        # Extract website
        website_match = re.search(r'https?://[\w.-]+\.[a-zA-Z]{2,}', text)
        if website_match:
            personal_info['website'] = website_match.group(0)
        
        return personal_info

    def _extract_basic_summary(self, text: str, lines: list) -> str:
        """Extract summary from first substantial paragraph"""
        # Look for summary section first
        summary_patterns = [
            r'summary[:\s]*(.*?)(?:\n\n|\n[A-Z]|$)',
            r'profile[:\s]*(.*?)(?:\n\n|\n[A-Z]|$)',
            r'objective[:\s]*(.*?)(?:\n\n|\n[A-Z]|$)',
            r'about[:\s]*(.*?)(?:\n\n|\n[A-Z]|$)'
        ]
        
        for pattern in summary_patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
            if match:
                summary = match.group(1).strip()
                if len(summary) > 20:
                    return summary[:300]
        
        # If no summary section, use first substantial paragraph
        for line in lines:
            line = line.strip()
            if (len(line) > 50 and 
                not any(keyword in line.lower() for keyword in 
                ['experience', 'education', 'skills', 'projects', 'certifications', 'achievements', 'awards'])):
                return line[:300]
        
        return ""

    def _extract_basic_work_experience(self, text: str) -> List[Dict[str, str]]:
        """Extract work experience using simple patterns"""
        experience = []
        
        # Look for experience section
        experience_section = self._find_section(text, ['experience', 'work history', 'employment', 'professional experience'])
        
        if experience_section:
            # Split by common separators
            jobs = re.split(r'\n(?=\d{4}|\w+\s+\d{4}|[A-Z][a-z]+\s+\d{4})', experience_section)
            
            for job in jobs:
                if len(job.strip()) > 20:
                    job_data = self._parse_simple_job(job)
                    if job_data:
                        experience.append(job_data)
        
        return experience

    def _extract_basic_education(self, text: str) -> List[Dict[str, str]]:
        """Extract education using simple patterns"""
        education = []
        
        # Look for education section
        education_section = self._find_section(text, ['education', 'academic', 'qualifications'])
        
        if education_section:
            # Split by common separators
            degrees = re.split(r'\n(?=\d{4}|[A-Z][a-z]+\s+\d{4})', education_section)
            
            for degree in degrees:
                if len(degree.strip()) > 10:
                    degree_data = self._parse_simple_education(degree)
                    if degree_data:
                        education.append(degree_data)
        
        return education

    def _extract_basic_skills(self, text: str) -> List[str]:
        """Extract skills by scanning entire text"""
        skills = []
        
        # Common technical skills
        tech_skills = [
            'python', 'java', 'javascript', 'react', 'angular', 'vue', 'node.js', 'php', 'ruby', 'go', 'rust', 'c++', 'c#', 'swift', 'kotlin', 'dart', 'typescript',
            'html', 'css', 'sql', 'mongodb', 'mysql', 'postgresql', 'redis', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'github', 'gitlab',
            'jenkins', 'ci/cd', 'agile', 'scrum', 'devops', 'machine learning', 'ai', 'data science', 'analytics', 'blockchain', 'web3', 'express.js',
            'django', 'flask', 'spring', 'laravel', 'rails', 'asp.net', 'jquery', 'bootstrap', 'tailwind', 'sass', 'less', 'webpack', 'babel',
            'jest', 'mocha', 'cypress', 'selenium', 'junit', 'pytest', 'unittest', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy'
        ]
        
        # Common soft skills
        soft_skills = [
            'leadership', 'communication', 'teamwork', 'problem solving', 'critical thinking', 'time management', 'adaptability', 'creativity',
            'analytical', 'organizational', 'project management', 'mentoring', 'coaching', 'negotiation', 'presentation', 'public speaking',
            'collaboration', 'interpersonal', 'customer service', 'sales', 'marketing', 'strategy', 'planning', 'decision making'
        ]
        
        text_lower = text.lower()
        
        # Extract technical skills
        for skill in tech_skills:
            if skill in text_lower:
                skills.append(skill.title())
        
        # Extract soft skills
        for skill in soft_skills:
            if skill in text_lower:
                skills.append(skill.title())
        
        # Remove duplicates and limit
        return list(set(skills))[:15]

    def _find_section(self, text: str, section_names: list) -> str:
        """Find a section in the text"""
        text_lower = text.lower()
        
        for section_name in section_names:
            pattern = rf'{section_name}[:\s]*(.*?)(?:\n\n|\n[A-Z]|$)'
            match = re.search(pattern, text_lower, re.DOTALL)
            if match:
                return match.group(1).strip()
        
        return ""

    def _parse_simple_job(self, job_text: str) -> Dict[str, str]:
        """Parse a job entry simply"""
        job_data = {}
        
        # Extract job title and company
        title_company_match = re.search(r'([A-Z][a-zA-Z\s&.,-]+?)\s*(?:at|@)\s*([A-Z][a-zA-Z\s&.,-]+)', job_text)
        if title_company_match:
            job_data['jobTitle'] = title_company_match.group(1).strip()
            job_data['company'] = title_company_match.group(2).strip()
        
        # Extract dates
        date_match = re.search(r'(\d{4})\s*[-–]\s*(\d{4}|present|current)', job_text, re.IGNORECASE)
        if date_match:
            job_data['startDate'] = date_match.group(1)
            job_data['endDate'] = date_match.group(2)
            job_data['current'] = date_match.group(2).lower() in ['present', 'current']
        
        # Extract description
        lines = job_text.split('\n')
        description_lines = []
        for line in lines:
            line = line.strip()
            if line and not any(keyword in line.lower() for keyword in ['title', 'company', 'duration', 'at', '@']):
                description_lines.append(line)
        
        if description_lines:
            job_data['responsibilities'] = ' '.join(description_lines)
        
        return job_data if job_data else None

    def _parse_simple_education(self, education_text: str) -> Dict[str, str]:
        """Parse an education entry simply"""
        education_data = {}
        
        # Extract degree
        degree_match = re.search(r'(Bachelor|Master|PhD|Associate|Certificate|Diploma)\s*(?:of\s*)?(?:Science|Arts|Engineering|Business|Computer Science|Information Technology)', education_text, re.IGNORECASE)
        if degree_match:
            education_data['degree'] = degree_match.group(0)
        
        # Extract institution
        institution_match = re.search(r'([A-Z][a-zA-Z\s&.,-]+?)(?:\s+\d{4}|\s*$)', education_text)
        if institution_match:
            education_data['institution'] = institution_match.group(1).strip()
        
        # Extract graduation year
        year_match = re.search(r'(\d{4})', education_text)
        if year_match:
            education_data['graduationYear'] = year_match.group(1)
        
        # Extract GPA
        gpa_match = re.search(r'GPA[:\s]*(\d+\.?\d*)', education_text, re.IGNORECASE)
        if gpa_match:
            education_data['gpa'] = gpa_match.group(1)
        
        return education_data if education_data else None

    def _extract_basic_projects(self, text: str) -> List[Dict[str, str]]:
        """Extract projects from resume"""
        projects = []
        
        # Look for projects section
        projects_section = self._find_section(text, ['projects', 'portfolio', 'key projects', 'notable projects', 'personal projects'])
        
        if projects_section:
            # Split by common separators
            project_entries = re.split(r'\n(?=\d{4}|[A-Z][a-z]+\s+\d{4}|\w+\s+\d{4})', projects_section)
            
            for project in project_entries:
                if len(project.strip()) > 15:
                    project_data = self._parse_simple_project(project)
                    if project_data:
                        projects.append(project_data)
        
        return projects

    def _extract_basic_certifications(self, text: str) -> List[Dict[str, str]]:
        """Extract certifications from resume"""
        certifications = []
        
        # Look for certifications section
        cert_section = self._find_section(text, ['certifications', 'certificates', 'licenses', 'credentials', 'professional certifications'])
        
        if cert_section:
            # Split by common separators
            cert_entries = re.split(r'\n(?=\d{4}|[A-Z][a-z]+\s+\d{4}|\w+\s+\d{4})', cert_section)
            
            for cert in cert_entries:
                cert = cert.strip()
                if len(cert) > 5 and len(cert) < 100:
                    certifications.append({
                        'name': cert,
                        'issuer': '',
                        'date': '',
                        'expiry': '',
                        'credentialId': '',
                        'url': ''
                    })
        
        return certifications

    def _extract_basic_achievements(self, text: str) -> List[str]:
        """Extract achievements and awards from resume"""
        achievements = []
        
        # Look for achievements section
        ach_section = self._find_section(text, ['achievements', 'awards', 'honors', 'recognition', 'accomplishments', 'awards and recognition'])
        
        if ach_section:
            # Split by common separators
            ach_entries = re.split(r'\n(?=\d{4}|[A-Z][a-z]+\s+\d{4}|\w+\s+\d{4})', ach_section)
            
            for ach in ach_entries:
                ach = ach.strip()
                if len(ach) > 10 and len(ach) < 200:
                    achievements.append(ach)
        
        return achievements

    def _extract_basic_languages(self, text: str) -> List[str]:
        """Extract languages from resume"""
        languages = []
        
        # Look for languages section
        lang_section = self._find_section(text, ['languages', 'language skills', 'spoken languages', 'foreign languages'])
        
        if lang_section:
            # Extract language entries
            lang_entries = re.split(r'\n(?=\d{4}|[A-Z][a-z]+\s+\d{4}|\w+\s+\d{4})', lang_section)
            
            for lang in lang_entries:
                lang = lang.strip()
                if len(lang) > 2 and len(lang) < 50:
                    languages.append(lang)
        
        # Also scan entire text for common languages
        common_languages = [
            'english', 'spanish', 'french', 'german', 'italian', 'portuguese', 'chinese', 'japanese', 'korean', 
            'arabic', 'hindi', 'russian', 'dutch', 'swedish', 'norwegian', 'danish', 'finnish', 'polish', 
            'czech', 'hungarian', 'romanian', 'bulgarian'
        ]
        
        text_lower = text.lower()
        for lang in common_languages:
            if lang in text_lower and lang.title() not in languages:
                languages.append(lang.title())
        
        return languages

    def _extract_basic_leadership(self, text: str) -> List[Dict[str, str]]:
        """Extract leadership experience from resume"""
        leadership = []
        
        # Look for leadership section
        leadership_section = self._find_section(text, ['leadership', 'leadership experience', 'leadership roles', 'management experience'])
        
        if leadership_section:
            # Split by common separators
            leadership_entries = re.split(r'\n(?=\d{4}|[A-Z][a-z]+\s+\d{4}|\w+\s+\d{4})', leadership_section)
            
            for entry in leadership_entries:
                if len(entry.strip()) > 15:
                    leadership_data = self._parse_simple_leadership(entry)
                    if leadership_data:
                        leadership.append(leadership_data)
        
        return leadership

    def _extract_basic_volunteer_work(self, text: str) -> List[Dict[str, str]]:
        """Extract volunteer work from resume"""
        volunteer_work = []
        
        # Look for volunteer section
        volunteer_section = self._find_section(text, ['volunteer', 'volunteer work', 'volunteer experience', 'community service', 'volunteering'])
        
        if volunteer_section:
            # Split by common separators
            volunteer_entries = re.split(r'\n(?=\d{4}|[A-Z][a-z]+\s+\d{4}|\w+\s+\d{4})', volunteer_section)
            
            for entry in volunteer_entries:
                if len(entry.strip()) > 15:
                    volunteer_data = self._parse_simple_volunteer(entry)
                    if volunteer_data:
                        volunteer_work.append(volunteer_data)
        
        return volunteer_work

    def _extract_basic_references(self, text: str) -> List[Dict[str, str]]:
        """Extract references from resume"""
        referees = []
        
        # Look for references section
        ref_section = self._find_section(text, ['references', 'referees', 'professional references', 'character references'])
        
        if ref_section:
            # Split by common separators
            ref_entries = re.split(r'\n(?=\d{4}|[A-Z][a-z]+\s+\d{4}|\w+\s+\d{4})', ref_section)
            
            for entry in ref_entries:
                if len(entry.strip()) > 10:
                    ref_data = self._parse_simple_reference(entry)
                    if ref_data:
                        referees.append(ref_data)
        
        return referees

    def _parse_simple_project(self, project_text: str) -> Dict[str, str]:
        """Parse a project entry simply"""
        project_data = {}
        
        # Extract project name (usually first line)
        lines = project_text.split('\n')
        if lines:
            project_data['name'] = lines[0].strip()
        
        # Extract description (rest of the text)
        if len(lines) > 1:
            project_data['description'] = ' '.join(lines[1:]).strip()
        
        # Extract technologies mentioned
        tech_skills = [
            'python', 'java', 'javascript', 'react', 'angular', 'vue', 'node.js', 'php', 'ruby', 'go', 'rust', 'c++', 'c#', 'swift', 'kotlin', 'dart', 'typescript',
            'html', 'css', 'sql', 'mongodb', 'mysql', 'postgresql', 'redis', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'github', 'gitlab'
        ]
        
        technologies = []
        project_lower = project_text.lower()
        for tech in tech_skills:
            if tech in project_lower:
                technologies.append(tech.title())
        
        if technologies:
            project_data['technologies'] = technologies
        
        return project_data if project_data else None

    def _parse_simple_leadership(self, leadership_text: str) -> Dict[str, str]:
        """Parse a leadership entry simply"""
        leadership_data = {}
        
        # Extract title and organization
        title_org_match = re.search(r'([A-Z][a-zA-Z\s&.,-]+?)\s*(?:at|@)\s*([A-Z][a-zA-Z\s&.,-]+)', leadership_text)
        if title_org_match:
            leadership_data['title'] = title_org_match.group(1).strip()
            leadership_data['organization'] = title_org_match.group(2).strip()
        
        # Extract duration
        duration_match = re.search(r'(\d{4})\s*[-–]\s*(\d{4}|present|current)', leadership_text, re.IGNORECASE)
        if duration_match:
            leadership_data['duration'] = f"{duration_match.group(1)} - {duration_match.group(2)}"
        
        # Extract description
        lines = leadership_text.split('\n')
        description_lines = []
        for line in lines:
            line = line.strip()
            if line and not any(keyword in line.lower() for keyword in ['title', 'organization', 'duration', 'at', '@']):
                description_lines.append(line)
        
        if description_lines:
            leadership_data['description'] = ' '.join(description_lines)
        
        return leadership_data if leadership_data else None

    def _parse_simple_volunteer(self, volunteer_text: str) -> Dict[str, str]:
        """Parse a volunteer entry simply"""
        volunteer_data = {}
        
        # Extract role and organization
        role_org_match = re.search(r'([A-Z][a-zA-Z\s&.,-]+?)\s*(?:at|@)\s*([A-Z][a-zA-Z\s&.,-]+)', volunteer_text)
        if role_org_match:
            volunteer_data['role'] = role_org_match.group(1).strip()
            volunteer_data['organization'] = role_org_match.group(2).strip()
        
        # Extract duration
        duration_match = re.search(r'(\d{4})\s*[-–]\s*(\d{4}|present|current)', volunteer_text, re.IGNORECASE)
        if duration_match:
            volunteer_data['duration'] = f"{duration_match.group(1)} - {duration_match.group(2)}"
        
        # Extract description
        lines = volunteer_text.split('\n')
        description_lines = []
        for line in lines:
            line = line.strip()
            if line and not any(keyword in line.lower() for keyword in ['role', 'organization', 'duration', 'at', '@']):
                description_lines.append(line)
        
        if description_lines:
            volunteer_data['description'] = ' '.join(description_lines)
        
        return volunteer_data if volunteer_data else None

    def _parse_simple_reference(self, reference_text: str) -> Dict[str, str]:
        """Parse a reference entry simply"""
        reference_data = {}
        
        # Extract name (usually first part)
        lines = reference_text.split('\n')
        if lines:
            reference_data['name'] = lines[0].strip()
        
        # Extract email
        email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', reference_text)
        if email_match:
            reference_data['email'] = email_match.group(0)
        
        # Extract phone
        phone_match = re.search(r'(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})', reference_text)
        if phone_match:
            reference_data['phone'] = phone_match.group(0)
        
        # Extract title and company (look for common patterns)
        title_company_match = re.search(r'([A-Z][a-zA-Z\s&.,-]+?)\s*(?:at|@)\s*([A-Z][a-zA-Z\s&.,-]+)', reference_text)
        if title_company_match:
            reference_data['title'] = title_company_match.group(1).strip()
            reference_data['company'] = title_company_match.group(2).strip()
        
        return reference_data if reference_data else None

    def _ai_parse_resume(self, text: str) -> Dict[str, Any]:
        """Advanced AI-powered resume parsing using OpenAI - COMPREHENSIVE FORM MAPPING"""
        try:
            prompt = f"""
            Parse this resume text and extract ALL information for the Francisca resume form.
            
            Resume Text:
            {text}
            
            Extract the following information and return as valid JSON:
            
            {{
                "personalInfo": {{
                    "firstName": "string",
                    "lastName": "string", 
                    "email": "string",
                    "phone": "string",
                    "city": "string",
                    "country": "string",
                    "linkedin": "string",
                    "website": "string"
                }},
                "summary": "string",
                "workExperience": [
                    {{
                        "company": "string",
                        "jobTitle": "string",
                        "startDate": "string",
                        "endDate": "string",
                        "current": boolean,
                        "responsibilities": "string",
                        "achievements": "string",
                        "location": "string"
                    }}
                ],
                "education": [
                    {{
                        "institution": "string",
                        "degree": "string",
                        "field": "string",
                        "graduationYear": "string",
                        "gpa": "string",
                        "activities": "string",
                        "honors": "string"
                    }}
                ],
                "skills": ["string"],
                "leadership": [
                    {{
                        "title": "string",
                        "organization": "string",
                        "duration": "string",
                        "description": "string"
                    }}
                ],
                "volunteerWork": [
                    {{
                        "organization": "string",
                        "role": "string",
                        "duration": "string",
                        "description": "string"
                    }}
                ],
                "referees": [
                    {{
                        "name": "string",
                        "title": "string",
                        "company": "string",
                        "phone": "string",
                        "email": "string"
                    }}
                ]
            }}
            
            CRITICAL INSTRUCTIONS:
            1. Extract EVERYTHING from the resume text
            2. Fill ALL personal information fields (firstName, lastName, email, phone, city, country)
            3. Extract ALL work experience entries with company, jobTitle, dates, responsibilities
            4. Extract ALL education entries with institution, degree, field, graduationYear
            5. Extract ALL skills and put them in a single array
            6. Extract leadership roles, volunteer work, and referees if mentioned
            7. For dates, use format "YYYY-MM" or "YYYY" 
            8. For current jobs, set "current": true and "endDate": ""
            9. If information is not available, use empty string or empty array
            10. Be extremely thorough - extract every detail possible
            11. Return valid JSON only, no additional text
            12. This is for a complete resume form - extract EVERYTHING
            """

            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert resume parser with 10+ years of experience. You MUST extract ALL information from resumes accurately and return valid JSON only. Be thorough and comprehensive."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=4000,
                temperature=0.1
            )

            # Parse the JSON response
            result = json.loads(response.choices[0].message.content.strip())
            
            # Clean and validate the result
            return self._clean_ai_result(result)
            
        except Exception as e:
            logger.error(f"Error in AI parsing: {str(e)}")
            raise

    def _clean_ai_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Clean and validate AI parsing result"""
        cleaned = {
            'personal_info': result.get('personal_info', {}),
            'summary': result.get('summary', ''),
            'experience': result.get('experience', []),
            'education': result.get('education', []),
            'skills': result.get('skills', {}),
            'projects': result.get('projects', []),
            'certifications': result.get('certifications', []),
            'achievements': result.get('achievements', [])
        }
        
        # Ensure skills is properly structured
        if isinstance(cleaned['skills'], list):
            cleaned['skills'] = {
                'technical': cleaned['skills'][:10],  # Limit technical skills
                'soft': [],
                'languages': []
            }
        elif isinstance(cleaned['skills'], dict):
            # Ensure all skill categories exist
            if 'technical' not in cleaned['skills']:
                cleaned['skills']['technical'] = []
            if 'soft' not in cleaned['skills']:
                cleaned['skills']['soft'] = []
            if 'languages' not in cleaned['skills']:
                cleaned['skills']['languages'] = []
        
        # Limit arrays to reasonable sizes
        cleaned['experience'] = cleaned['experience'][:10]
        cleaned['education'] = cleaned['education'][:5]
        cleaned['projects'] = cleaned['projects'][:8]
        cleaned['certifications'] = cleaned['certifications'][:10]
        cleaned['achievements'] = cleaned['achievements'][:10]
        
        return cleaned

    def _advanced_regex_parse(self, text: str) -> Dict[str, Any]:
        """Advanced regex-based parsing that extracts comprehensive information"""
        try:
            # Extract all information using multiple strategies
            personal_info = self._extract_personal_info_advanced(text)
            experience = self._extract_experience_advanced(text)
            education = self._extract_education_advanced(text)
            skills = self._extract_skills_advanced(text)
            summary = self._extract_summary_advanced(text)
            projects = self._extract_projects_advanced(text)
            certifications = self._extract_certifications_advanced(text)
            languages = self._extract_languages_advanced(text)
            achievements = self._extract_achievements_advanced(text)
            
            return {
                'personalInfo': personal_info,
                'summary': summary,
                'workExperience': experience,
                'education': education,
                'skills': self._flatten_skills_for_francisca(skills),
                'leadership': [],
                'volunteerWork': [],
                'referees': []
            }
            
        except Exception as e:
            logger.error(f"Error in advanced regex parsing: {str(e)}")
            return {}

    def _extract_personal_info_advanced(self, text: str) -> Dict[str, str]:
        """Advanced personal information extraction"""
        personal_info = {}
        
        # Extract email with multiple patterns
        email_patterns = [
            r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            r'email[:\s]*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})',
            r'e-mail[:\s]*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})'
        ]
        
        for pattern in email_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                personal_info['email'] = match.group(1) if match.groups() else match.group(0)
                break
        
        # Extract phone with multiple patterns
        phone_patterns = [
            r'(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})',
            r'phone[:\s]*([+\d\s\-\(\)]+)',
            r'tel[:\s]*([+\d\s\-\(\)]+)',
            r'mobile[:\s]*([+\d\s\-\(\)]+)'
        ]
        
        for pattern in phone_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                personal_info['phone'] = match.group(1) if match.groups() else match.group(0)
                break
        
        # Extract name (first line that looks like a name)
        lines = text.split('\n')
        for line in lines[:10]:  # Check first 10 lines
            line = line.strip()
            if (len(line) > 2 and len(line) < 50 and 
                not any(keyword in line.lower() for keyword in 
                ['email', 'phone', 'address', 'linkedin', 'github', 'summary', 'objective', 'experience', 'education', 'skills'])):
                # Split name into first and last
                name_parts = line.split()
                if len(name_parts) >= 2:
                    personal_info['firstName'] = name_parts[0]
                    personal_info['lastName'] = ' '.join(name_parts[1:])
                    break
                elif len(name_parts) == 1:
                    personal_info['firstName'] = name_parts[0]
                    break
        
        # Extract location
        location_patterns = [
            r'([A-Z][a-z]+(?:[,\s]+[A-Z]{2})?)',
            r'([A-Z][a-z]+(?:[,\s]+[A-Z][a-z]+))',
            r'location[:\s]*([A-Za-z\s,]+)',
            r'address[:\s]*([A-Za-z0-9\s,.-]+)'
        ]
        
        for pattern in location_patterns:
            match = re.search(pattern, text)
            if match and not personal_info.get('location'):
                personal_info['location'] = match.group(1).strip()
                break
        
        # Extract LinkedIn
        linkedin_patterns = [
            r'linkedin\.com/in/[\w-]+',
            r'linkedin[:\s]*(https?://linkedin\.com/in/[\w-]+)',
            r'linkedin[:\s]*(linkedin\.com/in/[\w-]+)'
        ]
        
        for pattern in linkedin_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                personal_info['linkedin'] = match.group(1) if match.groups() else match.group(0)
                break
        
        # Extract GitHub
        github_patterns = [
            r'github\.com/[\w-]+',
            r'github[:\s]*(https?://github\.com/[\w-]+)',
            r'github[:\s]*(github\.com/[\w-]+)'
        ]
        
        for pattern in github_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                personal_info['github'] = match.group(1) if match.groups() else match.group(0)
                break
        
        # Extract website
        website_patterns = [
            r'https?://[\w.-]+\.[a-zA-Z]{2,}',
            r'website[:\s]*(https?://[\w.-]+\.[a-zA-Z]{2,})',
            r'portfolio[:\s]*(https?://[\w.-]+\.[a-zA-Z]{2,})'
        ]
        
        for pattern in website_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                personal_info['website'] = match.group(1) if match.groups() else match.group(0)
                break
        
        return personal_info

    def _extract_experience_advanced(self, text: str) -> List[Dict[str, str]]:
        """Advanced experience extraction"""
        experience = []
        
        # Look for experience section
        experience_section = self._extract_section_advanced(text, ['experience', 'work history', 'employment', 'professional experience', 'career'])
        
        if experience_section:
            # Split by common job separators
            jobs = re.split(r'\n(?=\d{4}|\w+\s+\d{4}|[A-Z][a-z]+\s+\d{4}|[A-Z][a-z]+\s+[A-Z][a-z]+)', experience_section)
            
            for job in jobs:
                if len(job.strip()) > 20:
                    job_data = self._parse_job_entry_advanced(job)
                    if job_data:
                        experience.append(job_data)
        
        return experience

    def _extract_education_advanced(self, text: str) -> List[Dict[str, str]]:
        """Advanced education extraction"""
        education = []
        
        # Look for education section
        education_section = self._extract_section_advanced(text, ['education', 'academic', 'qualifications', 'degrees'])
        
        if education_section:
            # Split by common education separators
            degrees = re.split(r'\n(?=\d{4}|[A-Z][a-z]+\s+\d{4}|\w+\s+\d{4})', education_section)
            
            for degree in degrees:
                if len(degree.strip()) > 10:
                    degree_data = self._parse_education_entry_advanced(degree)
                    if degree_data:
                        education.append(degree_data)
        
        return education

    def _extract_skills_advanced(self, text: str) -> Dict[str, List[str]]:
        """Advanced skills extraction with better categorization"""
        skills = {
            'technical': [],
            'soft': [],
            'languages': []
        }
        
        # Technical skills patterns
        tech_skills = [
            'python', 'java', 'javascript', 'react', 'angular', 'vue', 'node.js', 'php', 'ruby', 'go', 'rust', 'c++', 'c#', 'swift', 'kotlin', 'dart', 'typescript',
            'html', 'css', 'sql', 'mongodb', 'mysql', 'postgresql', 'redis', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'github', 'gitlab',
            'jenkins', 'ci/cd', 'agile', 'scrum', 'devops', 'machine learning', 'ai', 'data science', 'analytics', 'blockchain', 'web3', 'express.js',
            'django', 'flask', 'spring', 'laravel', 'rails', 'asp.net', 'jquery', 'bootstrap', 'tailwind', 'sass', 'less', 'webpack', 'babel',
            'jest', 'mocha', 'cypress', 'selenium', 'junit', 'pytest', 'unittest', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy'
        ]
        
        # Soft skills patterns
        soft_skills = [
            'leadership', 'communication', 'teamwork', 'problem solving', 'critical thinking', 'time management', 'adaptability', 'creativity',
            'analytical', 'organizational', 'project management', 'mentoring', 'coaching', 'negotiation', 'presentation', 'public speaking',
            'collaboration', 'interpersonal', 'customer service', 'sales', 'marketing', 'strategy', 'planning', 'decision making'
        ]
        
        # Language patterns
        languages = [
            'english', 'spanish', 'french', 'german', 'italian', 'portuguese', 'chinese', 'japanese', 'korean', 'arabic', 'hindi', 'russian',
            'dutch', 'swedish', 'norwegian', 'danish', 'finnish', 'polish', 'czech', 'hungarian', 'romanian', 'bulgarian'
        ]
        
        text_lower = text.lower()
        
        # Extract technical skills
        for skill in tech_skills:
            if skill in text_lower:
                skills['technical'].append(skill.title())
        
        # Extract soft skills
        for skill in soft_skills:
            if skill in text_lower:
                skills['soft'].append(skill.title())
        
        # Extract languages
        for lang in languages:
            if lang in text_lower:
                skills['languages'].append(lang.title())
        
        # Remove duplicates
        for category in skills:
            skills[category] = list(set(skills[category]))
        
        return skills

    def _flatten_skills_for_francisca(self, skills: Dict[str, List[str]]) -> List[str]:
        """Flatten structured skills into a single array for Francisca form"""
        all_skills = []
        if 'technical' in skills:
            all_skills.extend(skills['technical'])
        if 'soft' in skills:
            all_skills.extend(skills['soft'])
        if 'languages' in skills:
            all_skills.extend(skills['languages'])
        return all_skills[:20]  # Limit to 20 skills

    def _extract_summary_advanced(self, text: str) -> str:
        """Advanced summary extraction"""
        summary_patterns = [
            r'summary[:\s]*(.*?)(?:\n\n|\n[A-Z]|$)',
            r'profile[:\s]*(.*?)(?:\n\n|\n[A-Z]|$)',
            r'objective[:\s]*(.*?)(?:\n\n|\n[A-Z]|$)',
            r'about[:\s]*(.*?)(?:\n\n|\n[A-Z]|$)',
            r'professional summary[:\s]*(.*?)(?:\n\n|\n[A-Z]|$)'
        ]
        
        for pattern in summary_patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
            if match:
                summary = match.group(1).strip()
                if len(summary) > 20:
                    return summary[:500]  # Limit length
        
        return ""

    def _extract_projects_advanced(self, text: str) -> List[Dict[str, str]]:
        """Advanced projects extraction"""
        projects = []
        
        # Look for projects section
        projects_section = self._extract_section_advanced(text, ['projects', 'portfolio', 'key projects', 'personal projects'])
        
        if projects_section:
            # Split by common project separators
            project_entries = re.split(r'\n(?=\d{4}|[A-Z][a-z]+\s+\d{4}|\w+\s+\d{4})', projects_section)
            
            for project in project_entries:
                if len(project.strip()) > 20:
                    project_data = self._parse_project_entry_advanced(project)
                    if project_data:
                        projects.append(project_data)
        
        return projects

    def _extract_certifications_advanced(self, text: str) -> List[Dict[str, str]]:
        """Advanced certifications extraction"""
        certifications = []
        
        # Look for certifications section
        cert_section = self._extract_section_advanced(text, ['certifications', 'certificates', 'licenses', 'credentials'])
        
        if cert_section:
            # Split by common certification separators
            cert_entries = re.split(r'\n(?=\d{4}|[A-Z][a-z]+\s+\d{4}|\w+\s+\d{4})', cert_section)
            
            for cert in cert_entries:
                cert = cert.strip()
                if len(cert) > 5 and len(cert) < 100:
                    certifications.append({
                        'name': cert,
                        'issuer': '',
                        'date': '',
                        'expiry': '',
                        'credentialId': '',
                        'url': ''
                    })
        
        return certifications

    def _extract_languages_advanced(self, text: str) -> List[str]:
        """Advanced languages extraction"""
        languages = []
        
        # Look for languages section
        lang_section = self._extract_section_advanced(text, ['languages', 'language skills', 'spoken languages'])
        
        if lang_section:
            # Extract language entries
            lang_entries = re.split(r'\n(?=\d{4}|[A-Z][a-z]+\s+\d{4}|\w+\s+\d{4})', lang_section)
            
            for lang in lang_entries:
                lang = lang.strip()
                if len(lang) > 2 and len(lang) < 50:
                    languages.append(lang)
        
        return languages

    def _extract_achievements_advanced(self, text: str) -> List[str]:
        """Advanced achievements extraction"""
        achievements = []
        
        # Look for achievements section
        ach_section = self._extract_section_advanced(text, ['achievements', 'awards', 'honors', 'recognition', 'accomplishments'])
        
        if ach_section:
            # Extract achievement entries
            ach_entries = re.split(r'\n(?=\d{4}|[A-Z][a-z]+\s+\d{4}|\w+\s+\d{4})', ach_section)
            
            for ach in ach_entries:
                ach = ach.strip()
                if len(ach) > 10 and len(ach) < 200:
                    achievements.append(ach)
        
        return achievements

    def _extract_section_advanced(self, text: str, section_names: List[str]) -> str:
        """Advanced section extraction"""
        text_lower = text.lower()
        
        for section_name in section_names:
            # Look for section header
            pattern = rf'{section_name}[:\s]*(.*?)(?:\n\n|\n[A-Z]|$)'
            match = re.search(pattern, text_lower, re.DOTALL)
            if match:
                return match.group(1).strip()
        
        return ""

    def _parse_job_entry_advanced(self, job_text: str) -> Dict[str, str]:
        """Advanced job entry parsing"""
        job_data = {}
        
        # Extract job title and company
        title_company_match = re.search(r'([A-Z][a-zA-Z\s&.,-]+?)\s*(?:at|@)\s*([A-Z][a-zA-Z\s&.,-]+)', job_text)
        if title_company_match:
            job_data['jobTitle'] = title_company_match.group(1).strip()
            job_data['company'] = title_company_match.group(2).strip()
        
        # Extract duration
        duration_match = re.search(r'(\d{4})\s*[-–]\s*(\d{4}|present|current)', job_text, re.IGNORECASE)
        if duration_match:
            job_data['startDate'] = duration_match.group(1)
            job_data['endDate'] = duration_match.group(2)
            job_data['current'] = duration_match.group(2).lower() in ['present', 'current']
        
        # Extract description (rest of the text)
        lines = job_text.split('\n')
        description_lines = []
        for line in lines:
            line = line.strip()
            if line and not any(keyword in line.lower() for keyword in ['title', 'company', 'duration', 'at', '@']):
                description_lines.append(line)
        
        if description_lines:
            job_data['responsibilities'] = ' '.join(description_lines)
        
        return job_data if job_data else None

    def _parse_education_entry_advanced(self, education_text: str) -> Dict[str, str]:
        """Advanced education entry parsing"""
        education_data = {}
        
        # Extract degree
        degree_match = re.search(r'(Bachelor|Master|PhD|Associate|Certificate|Diploma)\s*(?:of\s*)?(?:Science|Arts|Engineering|Business|Computer Science|Information Technology)', education_text, re.IGNORECASE)
        if degree_match:
            education_data['degree'] = degree_match.group(0)
        
        # Extract institution
        institution_match = re.search(r'([A-Z][a-zA-Z\s&.,-]+?)(?:\s+\d{4}|\s*$)', education_text)
        if institution_match:
            education_data['institution'] = institution_match.group(1).strip()
        
        # Extract graduation year
        year_match = re.search(r'(\d{4})', education_text)
        if year_match:
            education_data['graduationYear'] = year_match.group(1)
        
        # Extract GPA
        gpa_match = re.search(r'GPA[:\s]*(\d+\.?\d*)', education_text, re.IGNORECASE)
        if gpa_match:
            education_data['gpa'] = gpa_match.group(1)
        
        return education_data if education_data else None

    def _parse_project_entry_advanced(self, project_text: str) -> Dict[str, str]:
        """Advanced project entry parsing"""
        project_data = {}
        
        # Extract project name (usually first line)
        lines = project_text.split('\n')
        if lines:
            project_data['name'] = lines[0].strip()
        
        # Extract description (rest of the text)
        if len(lines) > 1:
            project_data['description'] = ' '.join(lines[1:]).strip()
        
        return project_data if project_data else None

    def _simple_text_analysis(self, text: str) -> Dict[str, Any]:
        """Simple text analysis that extracts information from any resume format"""
        try:
            lines = text.split('\n')
            personal_info = {}
            experience = []
            education = []
            skills = {'technical': [], 'soft': [], 'languages': []}
            summary = ""
            projects = []
            certifications = []
            achievements = []
            
            # Extract email
            email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
            if email_match:
                personal_info['email'] = email_match.group(0)
            
            # Extract phone
            phone_match = re.search(r'(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})', text)
            if phone_match:
                personal_info['phone'] = phone_match.group(0)
            
            # Extract name from first line
            if lines:
                first_line = lines[0].strip()
                if len(first_line) > 2 and len(first_line) < 50:
                    name_parts = first_line.split()
                    if len(name_parts) >= 2:
                        personal_info['firstName'] = name_parts[0]
                        personal_info['lastName'] = ' '.join(name_parts[1:])
                    elif len(name_parts) == 1:
                        personal_info['firstName'] = name_parts[0]
            
            # Extract location
            location_match = re.search(r'([A-Z][a-z]+(?:[,\s]+[A-Z]{2})?)', text)
            if location_match:
                personal_info['location'] = location_match.group(1)
            
            # Extract summary from first paragraph
            for i, line in enumerate(lines):
                line = line.strip()
                if len(line) > 50 and not any(keyword in line.lower() for keyword in ['experience', 'education', 'skills', 'projects']):
                    summary = line
                    break
            
            # Extract technical skills from text
            tech_skills = ['python', 'java', 'javascript', 'react', 'angular', 'vue', 'node.js', 'php', 'ruby', 'go', 'rust', 'c++', 'c#', 'swift', 'kotlin', 'dart', 'typescript', 'html', 'css', 'sql', 'mongodb', 'mysql', 'postgresql', 'redis', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'github', 'gitlab', 'jenkins', 'ci/cd', 'agile', 'scrum', 'devops', 'machine learning', 'ai', 'data science', 'analytics', 'blockchain', 'web3', 'express.js', 'django', 'flask', 'spring', 'laravel', 'rails', 'asp.net', 'jquery', 'bootstrap', 'tailwind', 'sass', 'less', 'webpack', 'babel', 'jest', 'mocha', 'cypress', 'selenium', 'junit', 'pytest', 'unittest', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy']
            
            text_lower = text.lower()
            for skill in tech_skills:
                if skill in text_lower:
                    skills['technical'].append(skill.title())
            
            # Extract soft skills
            soft_skills = ['leadership', 'communication', 'teamwork', 'problem solving', 'critical thinking', 'time management', 'adaptability', 'creativity', 'analytical', 'organizational', 'project management', 'mentoring', 'coaching', 'negotiation', 'presentation', 'public speaking', 'collaboration', 'interpersonal', 'customer service', 'sales', 'marketing', 'strategy', 'planning', 'decision making']
            
            for skill in soft_skills:
                if skill in text_lower:
                    skills['soft'].append(skill.title())
            
            # Extract languages
            languages = ['english', 'spanish', 'french', 'german', 'italian', 'portuguese', 'chinese', 'japanese', 'korean', 'arabic', 'hindi', 'russian', 'dutch', 'swedish', 'norwegian', 'danish', 'finnish', 'polish', 'czech', 'hungarian', 'romanian', 'bulgarian']
            
            for lang in languages:
                if lang in text_lower:
                    skills['languages'].append(lang.title())
            
            # Extract education
            degree_match = re.search(r'(Bachelor|Master|PhD|Associate|Certificate|Diploma)\s*(?:of\s*)?(?:Science|Arts|Engineering|Business|Computer Science|Information Technology)', text, re.IGNORECASE)
            if degree_match:
                education.append({
                    'degree': degree_match.group(0),
                    'institution': '',
                    'field': '',
                    'graduationYear': '',
                    'gpa': '',
                    'location': '',
                    'startDate': '',
                    'endDate': '',
                    'honors': ''
                })
            
            # Extract experience from text patterns
            experience_patterns = [
                r'([A-Z][a-zA-Z\s&.,-]+?)\s*(?:at|@)\s*([A-Z][a-zA-Z\s&.,-]+)',
                r'([A-Z][a-zA-Z\s&.,-]+?)\s*(?:at|@)\s*([A-Z][a-zA-Z\s&.,-]+)'
            ]
            
            for pattern in experience_patterns:
                matches = re.findall(pattern, text)
                for match in matches:
                    if len(match[0]) > 3 and len(match[1]) > 3:
                        experience.append({
                            'jobTitle': match[0].strip(),
                            'company': match[1].strip(),
                            'startDate': '',
                            'endDate': '',
                            'current': False,
                            'responsibilities': '',
                            'achievements': '',
                            'location': ''
                        })
            
            # Remove duplicates
            for category in skills:
                skills[category] = list(set(skills[category]))
            
            return {
                'personalInfo': personal_info,
                'summary': summary,
                'workExperience': experience,
                'education': education,
                'skills': self._flatten_skills_for_francisca(skills),
                'leadership': [],
                'volunteerWork': [],
                'referees': []
            }
            
        except Exception as e:
            logger.error(f"Error in simple text analysis: {str(e)}")
            return {}

    def _extract_personal_info(self, text: str) -> Dict[str, str]:
        """Extract personal information from resume text"""
        personal_info = {}
        
        # Extract email
        email_match = re.search(self.patterns['email'], text)
        if email_match:
            personal_info['email'] = email_match.group(0)
        
        # Extract phone
        phone_match = re.search(self.patterns['phone'], text)
        if phone_match:
            personal_info['phone'] = phone_match.group(0)
        
        # Extract LinkedIn
        linkedin_match = re.search(self.patterns['linkedin'], text)
        if linkedin_match:
            personal_info['linkedin'] = linkedin_match.group(0)
        
        # Extract GitHub
        github_match = re.search(self.patterns['github'], text)
        if github_match:
            personal_info['github'] = github_match.group(0)
        
        # Extract website
        website_match = re.search(self.patterns['website'], text)
        if website_match:
            personal_info['website'] = website_match.group(0)
        
        # Extract name (usually first line or after "Name:")
        lines = text.split('\n')
        for line in lines[:5]:  # Check first 5 lines
            line = line.strip()
            if len(line) > 2 and len(line) < 50 and not any(keyword in line.lower() for keyword in ['email', 'phone', 'address', 'linkedin', 'github']):
                if not personal_info.get('name'):
                    personal_info['name'] = line
                    break
        
        # Extract location (look for city, state patterns)
        location_patterns = [
            r'([A-Z][a-z]+(?:[,\s]+[A-Z]{2})?)',  # City, State
            r'([A-Z][a-z]+(?:[,\s]+[A-Z][a-z]+))',  # City, Country
        ]
        
        for pattern in location_patterns:
            location_match = re.search(pattern, text)
            if location_match and not personal_info.get('location'):
                personal_info['location'] = location_match.group(1)
                break
        
        return personal_info

    def _extract_experience(self, text: str) -> List[Dict[str, str]]:
        """Extract work experience from resume text"""
        experience = []
        
        # Look for experience section
        experience_section = self._extract_section(text, ['experience', 'work history', 'employment', 'professional experience'])
        
        if experience_section:
            # Split by common job separators
            jobs = re.split(r'\n(?=\d{4}|\w+\s+\d{4}|[A-Z][a-z]+\s+\d{4})', experience_section)
            
            for job in jobs:
                if len(job.strip()) > 20:  # Minimum length for a job entry
                    job_data = self._parse_job_entry(job)
                    if job_data:
                        experience.append(job_data)
        
        return experience

    def _extract_education(self, text: str) -> List[Dict[str, str]]:
        """Extract education information from resume text"""
        education = []
        
        # Look for education section
        education_section = self._extract_section(text, ['education', 'academic', 'qualifications'])
        
        if education_section:
            # Split by common education separators
            degrees = re.split(r'\n(?=\d{4}|[A-Z][a-z]+\s+\d{4})', education_section)
            
            for degree in degrees:
                if len(degree.strip()) > 10:  # Minimum length for a degree entry
                    degree_data = self._parse_education_entry(degree)
                    if degree_data:
                        education.append(degree_data)
        
        return education

    def _extract_skills(self, text: str) -> Dict[str, List[str]]:
        """Extract skills from resume text with better categorization"""
        skills = {
            'technical': [],
            'soft': [],
            'languages': []
        }
        
        # Look for skills section
        skills_section = self._extract_section(text, ['skills', 'technical skills', 'core competencies', 'expertise', 'proficiencies'])
        
        if skills_section:
            # Technical skills patterns
            tech_patterns = [
                r'(?:python|java|javascript|react|angular|vue|node\.?js|php|ruby|go|rust|c\+\+|c#|swift|kotlin|dart|typescript|html|css|sql|mongodb|mysql|postgresql|redis|docker|kubernetes|aws|azure|gcp|git|github|gitlab|jenkins|ci/cd|agile|scrum|devops|machine learning|ai|data science|analytics|blockchain|web3)',
                r'([A-Za-z][A-Za-z0-9\s&.,-]+?)(?:\s*,\s*|\s*•\s*|\s*\|\s*|\n)',
            ]
            
            for pattern in tech_patterns:
                matches = re.findall(pattern, skills_section, re.IGNORECASE)
                for match in matches:
                    skill = match.strip()
                    if len(skill) > 1 and len(skill) < 50:
                        skills['technical'].append(skill)
        
        # Look for soft skills
        soft_skills_section = self._extract_section(text, ['soft skills', 'interpersonal skills', 'leadership', 'communication'])
        if soft_skills_section:
            soft_patterns = [
                r'(?:leadership|communication|teamwork|problem solving|critical thinking|time management|adaptability|creativity|analytical|organizational|project management|mentoring|coaching|negotiation|presentation|public speaking)',
            ]
            
            for pattern in soft_patterns:
                matches = re.findall(pattern, soft_skills_section, re.IGNORECASE)
                for match in matches:
                    skill = match.strip()
                    if len(skill) > 1 and len(skill) < 50:
                        skills['soft'].append(skill)
        
        # Look for languages
        lang_section = self._extract_section(text, ['languages', 'language skills', 'spoken languages'])
        if lang_section:
            lang_patterns = [
                r'(?:english|spanish|french|german|italian|portuguese|chinese|japanese|korean|arabic|hindi|russian|dutch|swedish|norwegian|danish|finnish|polish|czech|hungarian|romanian|bulgarian|croatian|serbian|slovak|slovenian|estonian|latvian|lithuanian|greek|turkish|hebrew|persian|urdu|bengali|tamil|telugu|malayalam|kannada|gujarati|marathi|punjabi|odia|assamese|bhojpuri|rajasthani|haryanvi|chhattisgarhi|magahi|maithili|santali|kashmiri|konkani|manipuri|nepali|sindhi|dogri|kashmiri|konkani|manipuri|nepali|sindhi|dogri)',
            ]
            
            for pattern in lang_patterns:
                matches = re.findall(pattern, lang_section, re.IGNORECASE)
                for match in matches:
                    skill = match.strip()
                    if len(skill) > 1 and len(skill) < 50:
                        skills['languages'].append(skill)
        
        # Clean up and remove duplicates
        for category in skills:
            skills[category] = list(set(skills[category]))
            skills[category] = [skill.strip() for skill in skills[category] if skill.strip()]
        
        return skills

    def _extract_summary(self, text: str) -> str:
        """Extract professional summary from resume text"""
        # Look for summary section
        summary_section = self._extract_section(text, ['summary', 'profile', 'objective', 'about', 'professional summary'])
        
        if summary_section:
            # Clean up the summary
            summary = summary_section.strip()
            # Remove common prefixes
            prefixes = ['summary:', 'profile:', 'objective:', 'about:', 'professional summary:']
            for prefix in prefixes:
                if summary.lower().startswith(prefix):
                    summary = summary[len(prefix):].strip()
            
            return summary[:500]  # Limit length
        
        return ""

    def _extract_projects(self, text: str) -> List[Dict[str, str]]:
        """Extract projects from resume text"""
        projects = []
        
        # Look for projects section
        projects_section = self._extract_section(text, ['projects', 'portfolio', 'key projects', 'notable projects'])
        
        if projects_section:
            # Split by common project separators
            project_entries = re.split(r'\n(?=\d{4}|[A-Z][a-z]+\s+\d{4}|\w+\s+\d{4})', projects_section)
            
            for project in project_entries:
                if len(project.strip()) > 15:  # Minimum length for a project entry
                    project_data = self._parse_project_entry(project)
                    if project_data:
                        projects.append(project_data)
        
        return projects

    def _extract_certifications(self, text: str) -> List[str]:
        """Extract certifications from resume text"""
        certifications = []
        
        # Look for certifications section
        cert_section = self._extract_section(text, ['certifications', 'certificates', 'licenses', 'credentials'])
        
        if cert_section:
            # Extract certification entries
            cert_entries = re.split(r'\n(?=\d{4}|[A-Z][a-z]+\s+\d{4}|\w+\s+\d{4})', cert_section)
            
            for cert in cert_entries:
                cert = cert.strip()
                if len(cert) > 5 and len(cert) < 100:  # Reasonable certification length
                    certifications.append(cert)
        
        return certifications

    def _extract_languages(self, text: str) -> List[str]:
        """Extract languages from resume text"""
        languages = []
        
        # Look for languages section
        lang_section = self._extract_section(text, ['languages', 'language skills', 'spoken languages'])
        
        if lang_section:
            # Extract language entries
            lang_entries = re.split(r'\n(?=\d{4}|[A-Z][a-z]+\s+\d{4}|\w+\s+\d{4})', lang_section)
            
            for lang in lang_entries:
                lang = lang.strip()
                if len(lang) > 2 and len(lang) < 50:  # Reasonable language length
                    languages.append(lang)
        
        return languages

    def _extract_achievements(self, text: str) -> List[str]:
        """Extract achievements from resume text"""
        achievements = []
        
        # Look for achievements section
        ach_section = self._extract_section(text, ['achievements', 'awards', 'honors', 'recognition', 'accomplishments'])
        
        if ach_section:
            # Extract achievement entries
            ach_entries = re.split(r'\n(?=\d{4}|[A-Z][a-z]+\s+\d{4}|\w+\s+\d{4})', ach_section)
            
            for ach in ach_entries:
                ach = ach.strip()
                if len(ach) > 10 and len(ach) < 200:  # Reasonable achievement length
                    achievements.append(ach)
        
        return achievements

    def _extract_section(self, text: str, section_names: List[str]) -> str:
        """Extract a specific section from resume text"""
        text_lower = text.lower()
        
        for section_name in section_names:
            # Look for section header
            pattern = rf'{section_name}[:\s]*(.*?)(?:\n\n|\n[A-Z]|$)'
            match = re.search(pattern, text_lower, re.DOTALL)
            if match:
                return match.group(1).strip()
        
        return ""

    def _parse_job_entry(self, job_text: str) -> Dict[str, str]:
        """Parse individual job entry"""
        job_data = {}
        
        # Extract job title and company
        title_company_match = re.search(r'([A-Z][a-zA-Z\s&.,-]+?)\s*(?:at|@)\s*([A-Z][a-zA-Z\s&.,-]+)', job_text)
        if title_company_match:
            job_data['title'] = title_company_match.group(1).strip()
            job_data['company'] = title_company_match.group(2).strip()
        
        # Extract duration
        duration_match = re.search(r'(\d{4})\s*[-–]\s*(\d{4}|present|current)', job_text, re.IGNORECASE)
        if duration_match:
            job_data['duration'] = f"{duration_match.group(1)} - {duration_match.group(2)}"
        
        # Extract description (rest of the text)
        lines = job_text.split('\n')
        description_lines = []
        for line in lines:
            line = line.strip()
            if line and not any(keyword in line.lower() for keyword in ['title', 'company', 'duration', 'at', '@']):
                description_lines.append(line)
        
        if description_lines:
            job_data['description'] = ' '.join(description_lines)
        
        return job_data if job_data else None

    def _parse_education_entry(self, education_text: str) -> Dict[str, str]:
        """Parse individual education entry"""
        education_data = {}
        
        # Extract degree
        degree_match = re.search(self.patterns['degree'], education_text, re.IGNORECASE)
        if degree_match:
            education_data['degree'] = degree_match.group(0)
        
        # Extract institution
        institution_match = re.search(r'([A-Z][a-zA-Z\s&.,-]+?)(?:\s+\d{4}|\s*$)', education_text)
        if institution_match:
            education_data['institution'] = institution_match.group(1).strip()
        
        # Extract graduation year
        year_match = re.search(r'(\d{4})', education_text)
        if year_match:
            education_data['graduation_year'] = year_match.group(1)
        
        # Extract GPA
        gpa_match = re.search(self.patterns['gpa'], education_text, re.IGNORECASE)
        if gpa_match:
            education_data['gpa'] = gpa_match.group(1)
        
        return education_data if education_data else None

    def _parse_project_entry(self, project_text: str) -> Dict[str, str]:
        """Parse individual project entry"""
        project_data = {}
        
        # Extract project name (usually first line)
        lines = project_text.split('\n')
        if lines:
            project_data['name'] = lines[0].strip()
        
        # Extract description (rest of the text)
        if len(lines) > 1:
            project_data['description'] = ' '.join(lines[1:]).strip()
        
        return project_data if project_data else None

    def _enhance_with_ai(self, parsed_data: Dict[str, Any], raw_text: str) -> Dict[str, Any]:
        """Enhance parsed data using AI"""
        try:
            if not self.openai_api_key:
                return parsed_data
            
            # Create a prompt for AI enhancement
            prompt = f"""
            Please enhance and structure this parsed resume data. The raw resume text is provided for context.
            
            Raw Resume Text:
            {raw_text[:2000]}...
            
            Current Parsed Data:
            {json.dumps(parsed_data, indent=2)}
            
            Please provide enhanced data in the following JSON format:
            {{
                "personal_info": {{
                    "firstName": "string",
                    "lastName": "string",
                    "email": "string",
                    "phone": "string",
                    "location": "string",
                    "linkedin": "string",
                    "github": "string",
                    "website": "string"
                }},
                "summary": "string",
                "experience": [
                    {{
                        "position": "string",
                        "company": "string",
                        "duration": "string",
                        "responsibilities": "string",
                        "achievements": "string"
                    }}
                ],
                "education": [
                    {{
                        "degree": "string",
                        "institution": "string",
                        "field": "string",
                        "graduationYear": "string",
                        "gpa": "string"
                    }}
                ],
                "skills": ["string"],
                "projects": [
                    {{
                        "name": "string",
                        "description": "string",
                        "technologies": ["string"]
                    }}
                ],
                "certifications": ["string"],
                "languages": ["string"],
                "achievements": ["string"]
            }}
            
            Focus on:
            1. Correcting any parsing errors
            2. Structuring data properly
            3. Extracting missing information
            4. Improving descriptions and summaries
            5. Ensuring consistent formatting
            """
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert resume parser. Extract and structure resume information accurately."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=2000,
                temperature=0.1
            )
            
            # Parse AI response
            ai_response = response.choices[0].message.content
            enhanced_data = json.loads(ai_response)
            
            return enhanced_data
            
        except Exception as e:
            logger.error(f"Error enhancing with AI: {str(e)}")
            return parsed_data

    def map_to_francisca_format(self, parsed_data: Dict[str, Any]) -> Dict[str, Any]:
        """Map parsed resume data to Francisca form format - COMPREHENSIVE MAPPING"""
        try:
            # Handle both old and new data formats
            personal_info = parsed_data.get('personalInfo', parsed_data.get('personal_info', {}))
            
            # Extract name properly
            if 'firstName' in personal_info and 'lastName' in personal_info:
                first_name = personal_info.get('firstName', '')
                last_name = personal_info.get('lastName', '')
            else:
                # Fallback for old format
                name = personal_info.get('name', '')
                name_parts = name.split(' ', 1) if name else ['', '']
                first_name = name_parts[0] if name_parts else ''
                last_name = name_parts[1] if len(name_parts) > 1 else ''
            
            francisca_data = {
                'personalInfo': {
                    'firstName': first_name,
                    'lastName': last_name,
                    'email': personal_info.get('email', ''),
                    'phone': personal_info.get('phone', ''),
                    'city': personal_info.get('city', ''),
                    'country': personal_info.get('country', ''),
                    'linkedin': personal_info.get('linkedin', ''),
                    'website': personal_info.get('website', '')
                },
                'summary': parsed_data.get('summary', ''),
                'workExperience': self._map_work_experience(parsed_data),
                'education': self._map_education(parsed_data),
                'skills': self._extract_skills_for_francisca(parsed_data.get('skills', [])),
                'leadership': parsed_data.get('leadership', []),
                'volunteerWork': parsed_data.get('volunteerWork', []),
                'referees': parsed_data.get('referees', [])
            }
            
            return francisca_data
            
        except Exception as e:
            logger.error(f"Error mapping to Francisca format: {str(e)}")
            return {}

    def _map_work_experience(self, parsed_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Map work experience data to Francisca format"""
        experience = []
        exp_data = parsed_data.get('workExperience', parsed_data.get('professionalExperience', parsed_data.get('experience', [])))
        
        for exp in exp_data:
            experience.append({
                'company': exp.get('company', ''),
                'jobTitle': exp.get('jobTitle', exp.get('position', exp.get('title', ''))),
                'startDate': exp.get('startDate', ''),
                'endDate': exp.get('endDate', ''),
                'current': exp.get('current', False),
                'responsibilities': exp.get('responsibilities', exp.get('description', '')),
                'achievements': exp.get('achievements', ''),
                'location': exp.get('location', '')
            })
        
        return experience

    def _map_experience(self, parsed_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Map work experience data"""
        experience = []
        exp_data = parsed_data.get('professionalExperience', parsed_data.get('experience', []))
        
        for exp in exp_data:
            experience.append({
                'position': exp.get('position', exp.get('title', '')),
                'company': exp.get('company', ''),
                'duration': exp.get('duration', ''),
                'responsibilities': exp.get('responsibilities', exp.get('description', '')),
                'achievements': exp.get('achievements', ''),
                'location': exp.get('location', ''),
                'startDate': exp.get('startDate', ''),
                'endDate': exp.get('endDate', ''),
                'current': exp.get('current', False)
            })
        
        return experience

    def _map_education(self, parsed_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Map education data"""
        education = []
        edu_data = parsed_data.get('education', [])
        
        for edu in edu_data:
            education.append({
                'degree': edu.get('degree', ''),
                'institution': edu.get('institution', ''),
                'field': edu.get('field', ''),
                'graduationYear': edu.get('graduationYear', edu.get('graduation_year', '')),
                'gpa': edu.get('gpa', ''),
                'location': edu.get('location', ''),
                'startDate': edu.get('startDate', ''),
                'endDate': edu.get('endDate', ''),
                'honors': edu.get('honors', '')
            })
        
        return education

    def _map_projects(self, parsed_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Map projects data"""
        projects = []
        proj_data = parsed_data.get('projects', [])
        
        for project in proj_data:
            projects.append({
                'name': project.get('name', ''),
                'description': project.get('description', ''),
                'technologies': project.get('technologies', []),
                'duration': project.get('duration', ''),
                'role': project.get('role', ''),
                'url': project.get('url', ''),
                'startDate': project.get('startDate', ''),
                'endDate': project.get('endDate', '')
            })
        
        return projects

    def _map_certifications(self, parsed_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Map certifications data"""
        certifications = []
        cert_data = parsed_data.get('certifications', [])
        
        for cert in cert_data:
            if isinstance(cert, dict):
                certifications.append({
                    'name': cert.get('name', ''),
                    'issuer': cert.get('issuer', ''),
                    'date': cert.get('date', ''),
                    'expiry': cert.get('expiry', ''),
                    'credentialId': cert.get('credentialId', ''),
                    'url': cert.get('url', '')
                })
            else:
                # Handle string format
                certifications.append({
                    'name': str(cert),
                    'issuer': '',
                    'date': '',
                    'expiry': '',
                    'credentialId': '',
                    'url': ''
                })
        
        return certifications

    def _map_languages(self, parsed_data: Dict[str, Any]) -> List[str]:
        """Map languages data"""
        languages = []
        
        # Check skills.languages first
        skills = parsed_data.get('skills', {})
        if isinstance(skills, dict) and 'languages' in skills:
            languages.extend(skills['languages'])
        
        # Check additionalInfo.languages
        additional_info = parsed_data.get('additionalInfo', {})
        if 'languages' in additional_info:
            languages.extend(additional_info['languages'])
        
        # Check direct languages field
        if 'languages' in parsed_data:
            languages.extend(parsed_data['languages'])
        
        return list(set(languages))  # Remove duplicates

    def _map_references(self, parsed_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Map references data"""
        references = []
        ref_data = parsed_data.get('references', [])
        
        for ref in ref_data:
            references.append({
                'name': ref.get('name', ''),
                'position': ref.get('position', ''),
                'company': ref.get('company', ''),
                'email': ref.get('email', ''),
                'phone': ref.get('phone', '')
            })
        
        return references

    def _extract_skills_for_francisca(self, skills_data: Any) -> List[str]:
        """Extract and format skills for Francisca form"""
        if isinstance(skills_data, dict):
            # New structured format
            all_skills = []
            if 'technical' in skills_data:
                all_skills.extend(skills_data['technical'])
            if 'soft' in skills_data:
                all_skills.extend(skills_data['soft'])
            if 'languages' in skills_data:
                all_skills.extend(skills_data['languages'])
            return all_skills[:20]  # Limit to 20 skills
        elif isinstance(skills_data, list):
            # Simple array format (new AI format)
            return skills_data[:20]
        else:
            return []

    def validate_parsed_data(self, parsed_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and clean parsed data"""
        try:
            # Clean and validate personal info
            if 'personal_info' in parsed_data:
                personal_info = parsed_data['personal_info']
                # Remove empty values
                personal_info = {k: v for k, v in personal_info.items() if v and v.strip()}
                parsed_data['personal_info'] = personal_info
            
            # Clean and validate experience
            if 'experience' in parsed_data:
                experience = parsed_data['experience']
                # Remove empty entries
                experience = [exp for exp in experience if any(exp.values())]
                parsed_data['experience'] = experience
            
            # Clean and validate education
            if 'education' in parsed_data:
                education = parsed_data['education']
                # Remove empty entries
                education = [edu for edu in education if any(edu.values())]
                parsed_data['education'] = education
            
            # Clean and validate skills
            if 'skills' in parsed_data:
                skills = parsed_data['skills']
                # Remove empty and duplicate skills
                skills = list(set([skill.strip() for skill in skills if skill and skill.strip()]))
                parsed_data['skills'] = skills
            
            return parsed_data
            
        except Exception as e:
            logger.error(f"Error validating parsed data: {str(e)}")
            return parsed_data
