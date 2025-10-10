import fitz  # PyMuPDF
import json
import os
from typing import Dict, List, Any
import re

class PDFTemplateProcessor:
    def __init__(self):
        self.placeholder_patterns = {
            'name': r'\{\{name\}\}|\{NAME\}|\{name\}|\{Name\}',
            'email': r'\{\{email\}\}|\{EMAIL\}|\{email\}|\{Email\}',
            'phone': r'\{\{phone\}\}|\{PHONE\}|\{phone\}|\{Phone\}',
            'location': r'\{\{location\}\}|\{LOCATION\}|\{location\}|\{Location\}',
            'title': r'\{\{title\}\}|\{TITLE\}|\{title\}|\{Title\}',
            'summary': r'\{\{summary\}\}|\{SUMMARY\}|\{summary\}|\{Summary\}',
            'experience': r'\{\{experience\}\}|\{EXPERIENCE\}|\{experience\}|\{Experience\}',
            'education': r'\{\{education\}\}|\{EDUCATION\}|\{education\}|\{Education\}',
            'skills': r'\{\{skills\}\}|\{SKILLS\}|\{skills\}|\{Skills\}',
            'address': r'\{\{address\}\}|\{ADDRESS\}|\{address\}|\{Address\}',
            'linkedin': r'\{\{linkedin\}\}|\{LINKEDIN\}|\{linkedin\}|\{LinkedIn\}',
            'website': r'\{\{website\}\}|\{WEBSITE\}|\{website\}|\{Website\}'
        }
    
    def extract_template_structure(self, pdf_path: str) -> Dict[str, Any]:
        """Extract the structure and content areas from a PDF template"""
        try:
            doc = fitz.open(pdf_path)
            template_structure = {
                'pages': [],
                'content_areas': [],
                'placeholders': []
            }
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                page_structure = {
                    'page_number': page_num,
                    'text_blocks': [],
                    'images': [],
                    'placeholders': []
                }
                
                # Extract text blocks
                text_dict = page.get_text("dict")
                for block in text_dict["blocks"]:
                    if "lines" in block:
                        for line in block["lines"]:
                            for span in line["spans"]:
                                text = span["text"].strip()
                                if text:
                                    # Check for placeholders
                                    placeholders = self.find_placeholders(text)
                                    if placeholders:
                                        page_structure['placeholders'].extend(placeholders)
                                        template_structure['placeholders'].extend(placeholders)
                                    
                                    page_structure['text_blocks'].append({
                                        'text': text,
                                        'bbox': span["bbox"],
                                        'font': span["font"],
                                        'size': span["size"],
                                        'color': span["color"],
                                        'flags': span["flags"]
                                    })
                
                template_structure['pages'].append(page_structure)
            
            doc.close()
            return template_structure
            
        except Exception as e:
            print(f"Error extracting template structure: {e}")
            return {}
    
    def find_placeholders(self, text: str) -> List[Dict[str, Any]]:
        """Find placeholders in text and return their details"""
        placeholders = []
        
        for placeholder_type, pattern in self.placeholder_patterns.items():
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                placeholders.append({
                    'type': placeholder_type,
                    'original_text': match.group(),
                    'start': match.start(),
                    'end': match.end(),
                    'pattern': pattern
                })
        
        return placeholders
    
    def map_form_data_to_template(self, resume_data: Dict[str, Any]) -> Dict[str, str]:
        """Map form data to template placeholders"""
        mapping = {}
        
        # Personal information
        if 'personalInfo' in resume_data:
            pi = resume_data['personalInfo']
            mapping['name'] = f"{pi.get('firstName', '')} {pi.get('lastName', '')}".strip()
            mapping['email'] = pi.get('email', '')
            mapping['phone'] = pi.get('phone', '')
            mapping['location'] = f"{pi.get('city', '')}, {pi.get('country', '')}".strip(', ')
            mapping['title'] = pi.get('title', '')
            mapping['address'] = pi.get('address', '')
            mapping['linkedin'] = pi.get('linkedin', '')
            mapping['website'] = pi.get('website', '')
        
        # Summary/Objective
        mapping['summary'] = resume_data.get('resumeObjective', '')
        
        # Work Experience
        if 'workExperience' in resume_data and resume_data['workExperience']:
            experience_text = self.format_experience(resume_data['workExperience'])
            mapping['experience'] = experience_text
        
        # Education
        if 'education' in resume_data and resume_data['education']:
            education_text = self.format_education(resume_data['education'])
            mapping['education'] = education_text
        
        # Skills
        if 'skills' in resume_data and resume_data['skills']:
            skills_text = self.format_skills(resume_data['skills'])
            mapping['skills'] = skills_text
        
        return mapping
    
    def format_experience(self, experiences: List[Dict[str, Any]]) -> str:
        """Format work experience for template"""
        formatted_experiences = []
        
        for exp in experiences:
            experience_text = f"{exp.get('jobTitle', '')}\n"
            experience_text += f"{exp.get('employer', '')}"
            
            if exp.get('city') and exp.get('country'):
                experience_text += f", {exp.get('city')}, {exp.get('country')}"
            
            experience_text += f"\n{exp.get('startDate', '')} - "
            experience_text += "Present" if exp.get('current') else exp.get('endDate', '')
            
            if exp.get('description'):
                experience_text += f"\n{exp.get('description')}"
            
            formatted_experiences.append(experience_text)
        
        return "\n\n".join(formatted_experiences)
    
    def format_education(self, education_list: List[Dict[str, Any]]) -> str:
        """Format education for template"""
        formatted_education = []
        
        for edu in education_list:
            education_text = f"{edu.get('degree', '')} in {edu.get('fieldOfStudy', '')}\n"
            education_text += f"{edu.get('institution', '')}"
            
            if edu.get('city') and edu.get('country'):
                education_text += f", {edu.get('city')}, {edu.get('country')}"
            
            education_text += f"\n{edu.get('startDate', '')} - "
            education_text += "Present" if edu.get('current') else edu.get('endDate', '')
            
            if edu.get('gpa'):
                education_text += f"\nGPA: {edu.get('gpa')}"
            
            if edu.get('description'):
                education_text += f"\n{edu.get('description')}"
            
            formatted_education.append(education_text)
        
        return "\n\n".join(formatted_education)
    
    def format_skills(self, skills: List[Dict[str, Any]]) -> str:
        """Format skills for template"""
        skill_texts = []
        
        for skill in skills:
            skill_text = f"{skill.get('name', '')}"
            if skill.get('level'):
                skill_text += f" ({skill.get('level')})"
            skill_texts.append(skill_text)
        
        return ", ".join(skill_texts)
    
    def generate_personalized_pdf(self, template_path: str, output_path: str, resume_data: Dict[str, Any]) -> bool:
        """Generate a personalized PDF by replacing placeholders in the template"""
        try:
            # Open the template PDF
            doc = fitz.open(template_path)
            
            # Map form data to placeholders
            data_mapping = self.map_form_data_to_template(resume_data)
            
            # Process each page
            for page_num in range(len(doc)):
                page = doc[page_num]
                
                # Get text blocks
                text_dict = page.get_text("dict")
                
                # Create a list of text replacements
                replacements = []
                
                for block in text_dict["blocks"]:
                    if "lines" in block:
                        for line in block["lines"]:
                            for span in line["spans"]:
                                text = span["text"]
                                original_text = text
                                
                                # Replace placeholders
                                for placeholder_type, replacement in data_mapping.items():
                                    if replacement:  # Only replace if we have data
                                        pattern = self.placeholder_patterns[placeholder_type]
                                        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
                                
                                # If text changed, add to replacements
                                if text != original_text:
                                    replacements.append({
                                        'bbox': span["bbox"],
                                        'text': text,
                                        'font': span["font"],
                                        'size': span["size"],
                                        'color': span["color"]
                                    })
                
                # Apply replacements
                for replacement in replacements:
                    # Remove original text
                    page.add_redact_annot(replacement['bbox'])
                    page.apply_redactions()
                    
                    # Add new text
                    page.insert_text(
                        replacement['bbox'][:2],  # Use top-left point
                        replacement['text'],
                        fontname=replacement['font'],
                        fontsize=replacement['size'],
                        color=replacement['color']
                    )
            
            # Save the personalized PDF
            doc.save(output_path)
            doc.close()
            
            return True
            
        except Exception as e:
            print(f"Error generating personalized PDF: {e}")
            return False
    
    def create_template_preview(self, template_path: str, resume_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a preview of how the template will look with user data"""
        try:
            # Extract template structure
            template_structure = self.extract_template_structure(template_path)
            
            # Map form data
            data_mapping = self.map_form_data_to_template(resume_data)
            
            # Create preview data
            preview_data = {
                'template_structure': template_structure,
                'mapped_data': data_mapping,
                'preview_text': {}
            }
            
            # Generate preview text for each section
            for placeholder_type, replacement in data_mapping.items():
                if replacement:
                    preview_data['preview_text'][placeholder_type] = replacement
            
            return preview_data
            
        except Exception as e:
            print(f"Error creating template preview: {e}")
            return {}

# Create a global instance
pdf_processor = PDFTemplateProcessor()






