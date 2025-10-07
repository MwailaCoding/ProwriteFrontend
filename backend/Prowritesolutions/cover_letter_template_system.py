"""
Cover Letter Template System
Phase 3: Multiple professional templates with customization options
"""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime
import json

@dataclass
class TemplateStyle:
    name: str
    description: str
    category: str
    characteristics: List[str]
    best_for: List[str]
    preview_image: str

@dataclass
class TemplateLayout:
    header_style: str
    body_style: str
    spacing: str
    font_family: str
    font_size: str
    margins: Dict[str, float]

class CoverLetterTemplateSystem:
    def __init__(self):
        self.templates = self._load_templates()
        self.styles = self._load_styles()
        
    def _load_templates(self) -> Dict[str, Dict[str, Any]]:
        """Load professional cover letter templates"""
        return {
            "modern": {
                "name": "Modern Professional",
                "description": "Clean, contemporary design with bold headers and structured layout",
                "category": "professional",
                "characteristics": ["clean", "modern", "structured", "bold"],
                "best_for": ["technology", "marketing", "creative", "startups"],
                "layout": {
                    "header_style": "bold_centered",
                    "body_style": "justified_paragraphs",
                    "spacing": "generous",
                    "font_family": "Helvetica",
                    "font_size": "12pt",
                    "margins": {"top": 0.75, "bottom": 0.75, "left": 0.75, "right": 0.75}
                },
                "content_structure": {
                    "header": "name_contact_info",
                    "date": "current_date",
                    "employer_info": "full_address",
                    "greeting": "personalized",
                    "body": "3_paragraphs",
                    "closing": "professional_signature"
                }
            },
            "classic": {
                "name": "Classic Traditional",
                "description": "Timeless, conservative design perfect for corporate environments",
                "category": "traditional",
                "characteristics": ["conservative", "timeless", "formal", "trustworthy"],
                "best_for": ["finance", "legal", "healthcare", "government"],
                "layout": {
                    "header_style": "left_aligned",
                    "body_style": "justified_paragraphs",
                    "spacing": "standard",
                    "font_family": "Times New Roman",
                    "font_size": "12pt",
                    "margins": {"top": 1.0, "bottom": 1.0, "left": 1.0, "right": 1.0}
                },
                "content_structure": {
                    "header": "name_contact_info",
                    "date": "current_date",
                    "employer_info": "full_address",
                    "greeting": "formal",
                    "body": "3_paragraphs",
                    "closing": "formal_signature"
                }
            },
            "creative": {
                "name": "Creative Modern",
                "description": "Innovative design with visual elements and creative formatting",
                "category": "creative",
                "characteristics": ["creative", "innovative", "visual", "dynamic"],
                "best_for": ["design", "advertising", "media", "creative_agencies"],
                "layout": {
                    "header_style": "creative_header",
                    "body_style": "varied_paragraphs",
                    "spacing": "dynamic",
                    "font_family": "Arial",
                    "font_size": "11pt",
                    "margins": {"top": 0.5, "bottom": 0.5, "left": 0.5, "right": 0.5}
                },
                "content_structure": {
                    "header": "creative_header",
                    "date": "styled_date",
                    "employer_info": "minimal_address",
                    "greeting": "engaging",
                    "body": "varied_structure",
                    "closing": "creative_signature"
                }
            },
            "minimalist": {
                "name": "Minimalist Clean",
                "description": "Simple, elegant design focusing on content over decoration",
                "category": "minimalist",
                "characteristics": ["simple", "elegant", "clean", "focused"],
                "best_for": ["consulting", "education", "nonprofit", "minimalist_companies"],
                "layout": {
                    "header_style": "minimal_header",
                    "body_style": "clean_paragraphs",
                    "spacing": "comfortable",
                    "font_family": "Calibri",
                    "font_size": "11pt",
                    "margins": {"top": 0.8, "bottom": 0.8, "left": 0.8, "right": 0.8}
                },
                "content_structure": {
                    "header": "minimal_contact",
                    "date": "simple_date",
                    "employer_info": "essential_info",
                    "greeting": "direct",
                    "body": "concise_paragraphs",
                    "closing": "simple_signature"
                }
            },
            "executive": {
                "name": "Executive Premium",
                "description": "Sophisticated design for senior-level positions and executive roles",
                "category": "executive",
                "characteristics": ["sophisticated", "premium", "authoritative", "confident"],
                "best_for": ["executive", "senior_management", "board_positions", "leadership"],
                "layout": {
                    "header_style": "executive_header",
                    "body_style": "authoritative_paragraphs",
                    "spacing": "premium",
                    "font_family": "Georgia",
                    "font_size": "12pt",
                    "margins": {"top": 1.0, "bottom": 1.0, "left": 1.0, "right": 1.0}
                },
                "content_structure": {
                    "header": "executive_contact",
                    "date": "formal_date",
                    "employer_info": "detailed_address",
                    "greeting": "authoritative",
                    "body": "strategic_paragraphs",
                    "closing": "executive_signature"
                }
            }
        }
    
    def _load_styles(self) -> Dict[str, TemplateStyle]:
        """Load template style definitions"""
        return {
            "modern": TemplateStyle(
                name="Modern Professional",
                description="Clean, contemporary design with bold headers and structured layout",
                category="professional",
                characteristics=["clean", "modern", "structured", "bold"],
                best_for=["technology", "marketing", "creative", "startups"],
                preview_image="/templates/modern-preview.png"
            ),
            "classic": TemplateStyle(
                name="Classic Traditional",
                description="Timeless, conservative design perfect for corporate environments",
                category="traditional",
                characteristics=["conservative", "timeless", "formal", "trustworthy"],
                best_for=["finance", "legal", "healthcare", "government"],
                preview_image="/templates/classic-preview.png"
            ),
            "creative": TemplateStyle(
                name="Creative Modern",
                description="Innovative design with visual elements and creative formatting",
                category="creative",
                characteristics=["creative", "innovative", "visual", "dynamic"],
                best_for=["design", "advertising", "media", "creative_agencies"],
                preview_image="/templates/creative-preview.png"
            ),
            "minimalist": TemplateStyle(
                name="Minimalist Clean",
                description="Simple, elegant design focusing on content over decoration",
                category="minimalist",
                characteristics=["simple", "elegant", "clean", "focused"],
                best_for=["consulting", "education", "nonprofit", "minimalist_companies"],
                preview_image="/templates/minimalist-preview.png"
            ),
            "executive": TemplateStyle(
                name="Executive Premium",
                description="Sophisticated design for senior-level positions and executive roles",
                category="executive",
                characteristics=["sophisticated", "premium", "authoritative", "confident"],
                best_for=["executive", "senior_management", "board_positions", "leadership"],
                preview_image="/templates/executive-preview.png"
            )
        }
    
    def get_available_templates(self) -> Dict[str, Dict[str, Any]]:
        """Get all available templates"""
        return self.templates
    
    def get_template_by_id(self, template_id: str) -> Optional[Dict[str, Any]]:
        """Get specific template by ID"""
        return self.templates.get(template_id)
    
    def get_templates_by_category(self, category: str) -> Dict[str, Dict[str, Any]]:
        """Get templates filtered by category"""
        return {
            template_id: template 
            for template_id, template in self.templates.items() 
            if template.get('category') == category
        }
    
    def get_templates_by_industry(self, industry: str) -> Dict[str, Dict[str, Any]]:
        """Get templates recommended for specific industry"""
        recommended_templates = {}
        for template_id, template in self.templates.items():
            if industry in template.get('best_for', []):
                recommended_templates[template_id] = template
        return recommended_templates
    
    def format_content_for_template(self, content: str, template_id: str, user_info: Dict[str, Any], employer_info: Dict[str, Any]) -> str:
        """Format content according to template specifications"""
        template = self.get_template_by_id(template_id)
        if not template:
            return content
        
        layout = template.get('layout', {})
        content_structure = template.get('content_structure', {})
        
        # Format header
        header = self._format_header(user_info, layout.get('header_style', 'standard'))
        
        # Format date
        date_section = self._format_date(layout.get('date', 'current_date'))
        
        # Format employer info
        employer_section = self._format_employer_info(employer_info, layout.get('employer_info', 'full_address'))
        
        # Format greeting
        greeting = self._format_greeting(employer_info, layout.get('greeting', 'standard'))
        
        # Format body content
        body = self._format_body_content(content, layout.get('body_style', 'standard'))
        
        # Format closing
        closing = self._format_closing(user_info, layout.get('closing', 'standard'))
        
        # Combine all sections
        formatted_content = f"{header}\n\n{date_section}\n\n{employer_section}\n\n{greeting}\n\n{body}\n\n{closing}"
        
        return formatted_content
    
    def _format_header(self, user_info: Dict[str, Any], style: str) -> str:
        """Format header based on style"""
        name = user_info.get('name', 'Your Name')
        email = user_info.get('email', 'your.email@example.com')
        phone = user_info.get('phone', '(555) 123-4567')
        address = user_info.get('address', '')
        city = user_info.get('city', '')
        state = user_info.get('state', '')
        zip_code = user_info.get('zip', '')
        
        if style == 'bold_centered':
            return f"{name.upper()}\n{email} • {phone}\n{address}, {city}, {state} {zip_code}"
        elif style == 'left_aligned':
            return f"{name}\n{email}\n{phone}\n{address}\n{city}, {state} {zip_code}"
        elif style == 'creative_header':
            return f"✨ {name} ✨\n📧 {email} | 📱 {phone}\n📍 {city}, {state}"
        elif style == 'minimal_header':
            return f"{name}\n{email} | {phone}"
        elif style == 'executive_header':
            return f"{name.upper()}\n{email} • {phone}\n{address}\n{city}, {state} {zip_code}"
        else:
            return f"{name}\n{email}\n{phone}\n{address}, {city}, {state} {zip_code}"
    
    def _format_date(self, style: str) -> str:
        """Format date based on style"""
        current_date = datetime.now().strftime("%B %d, %Y")
        
        if style == 'current_date':
            return current_date
        elif style == 'styled_date':
            return f"📅 {current_date}"
        elif style == 'simple_date':
            return current_date
        elif style == 'formal_date':
            return current_date
        else:
            return current_date
    
    def _format_employer_info(self, employer_info: Dict[str, Any], style: str) -> str:
        """Format employer information based on style"""
        hiring_manager = employer_info.get('hiring_manager_name', 'Hiring Manager')
        company = employer_info.get('company_name', 'Company Name')
        address = employer_info.get('company_address', '')
        city = employer_info.get('city', '')
        state = employer_info.get('state', '')
        zip_code = employer_info.get('zip', '')
        
        if style == 'full_address':
            return f"{hiring_manager}\n{company}\n{address}\n{city}, {state} {zip_code}"
        elif style == 'minimal_address':
            return f"{hiring_manager}\n{company}"
        elif style == 'essential_info':
            return f"{hiring_manager}\n{company}\n{city}, {state}"
        elif style == 'detailed_address':
            return f"{hiring_manager}\n{company}\n{address}\n{city}, {state} {zip_code}"
        else:
            return f"{hiring_manager}\n{company}\n{address}, {city}, {state} {zip_code}"
    
    def _format_greeting(self, employer_info: Dict[str, Any], style: str) -> str:
        """Format greeting based on style"""
        hiring_manager = employer_info.get('hiring_manager_name', 'Hiring Manager')
        
        if style == 'personalized':
            return f"Dear {hiring_manager},"
        elif style == 'formal':
            return f"Dear {hiring_manager}:"
        elif style == 'engaging':
            return f"Hello {hiring_manager}!"
        elif style == 'direct':
            return f"Dear {hiring_manager},"
        elif style == 'authoritative':
            return f"Dear {hiring_manager}:"
        else:
            return f"Dear {hiring_manager},"
    
    def _format_body_content(self, content: str, style: str) -> str:
        """Format body content based on style"""
        paragraphs = content.split('\n\n')
        
        if style == 'justified_paragraphs':
            return '\n\n'.join(paragraphs)
        elif style == 'varied_paragraphs':
            # Add some visual variety
            formatted_paragraphs = []
            for i, paragraph in enumerate(paragraphs):
                if i == 0:
                    formatted_paragraphs.append(f"🎯 {paragraph}")
                elif i == len(paragraphs) - 1:
                    formatted_paragraphs.append(f"💼 {paragraph}")
                else:
                    formatted_paragraphs.append(paragraph)
            return '\n\n'.join(formatted_paragraphs)
        elif style == 'clean_paragraphs':
            return '\n\n'.join(paragraphs)
        elif style == 'authoritative_paragraphs':
            return '\n\n'.join(paragraphs)
        else:
            return '\n\n'.join(paragraphs)
    
    def _format_closing(self, user_info: Dict[str, Any], style: str) -> str:
        """Format closing based on style"""
        name = user_info.get('name', 'Your Name')
        
        if style == 'professional_signature':
            return f"Sincerely,\n\n{name}"
        elif style == 'formal_signature':
            return f"Respectfully,\n\n{name}"
        elif style == 'creative_signature':
            return f"Best regards,\n\n✨ {name} ✨"
        elif style == 'simple_signature':
            return f"Sincerely,\n{name}"
        elif style == 'executive_signature':
            return f"Respectfully,\n\n{name.upper()}"
        else:
            return f"Sincerely,\n\n{name}"
    
    def get_template_recommendations(self, industry: str, role_level: str = "entry") -> List[str]:
        """Get template recommendations based on industry and role level"""
        recommendations = []
        
        # Industry-based recommendations
        industry_templates = self.get_templates_by_industry(industry)
        recommendations.extend(list(industry_templates.keys()))
        
        # Role level adjustments
        if role_level == "executive" or role_level == "senior":
            if "executive" not in recommendations:
                recommendations.append("executive")
        elif role_level == "entry" or role_level == "junior":
            if "modern" not in recommendations:
                recommendations.append("modern")
        
        # Ensure we have at least 3 recommendations
        all_templates = list(self.templates.keys())
        while len(recommendations) < 3:
            for template in all_templates:
                if template not in recommendations:
                    recommendations.append(template)
                    break
        
        return recommendations[:3]
    
    def get_template_preview_data(self, template_id: str) -> Dict[str, Any]:
        """Get preview data for template"""
        template = self.get_template_by_id(template_id)
        if not template:
            return {}
        
        # Sample data for preview
        sample_user_info = {
            "name": "John Smith",
            "email": "john.smith@email.com",
            "phone": "(555) 123-4567",
            "address": "123 Main Street",
            "city": "New York",
            "state": "NY",
            "zip": "10001"
        }
        
        sample_employer_info = {
            "hiring_manager_name": "Sarah Johnson",
            "company_name": "Tech Innovations Inc.",
            "company_address": "456 Business Ave",
            "city": "San Francisco",
            "state": "CA",
            "zip": "94105"
        }
        
        sample_content = """I am writing to express my interest in the Software Engineer position at Tech Innovations Inc. With my background in full-stack development and passion for creating innovative solutions, I believe I would be a valuable addition to your team.

During my time at Previous Company, I successfully led the development of multiple web applications using React, Node.js, and Python. I have experience with cloud platforms, database design, and agile methodologies that align perfectly with your technical requirements.

I am excited about the opportunity to contribute to Tech Innovations Inc. and would welcome the chance to discuss how my skills and experience can benefit your team."""
        
        formatted_content = self.format_content_for_template(
            sample_content, 
            template_id, 
            sample_user_info, 
            sample_employer_info
        )
        
        return {
            "template": template,
            "preview_content": formatted_content,
            "sample_data": {
                "user_info": sample_user_info,
                "employer_info": sample_employer_info
            }
        }



















