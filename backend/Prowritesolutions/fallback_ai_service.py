"""
Fallback AI Service - Local enhancement without external API calls
Provides intelligent content improvements when external AI services are unavailable
"""

import re
import random
from typing import List, Dict

class FallbackAIService:
    def __init__(self):
        """Initialize the fallback AI service"""
        print("✅ Fallback AI service initialized")
    
    def enhance_achievements(self, bullet_points: List[str], job_title: str) -> List[str]:
        """Enhance achievement bullet points with local processing"""
        if not bullet_points:
            return []
        
        enhanced_points = []
        for point in bullet_points:
            enhanced = self._enhance_bullet_point(point, job_title)
            enhanced_points.append(enhanced)
        
        return enhanced_points
    
    def generate_francisca_content(self, prompt: str, field_type: str, profession: str = None) -> str:
        """Generate enhanced content for specific field types"""
        profession = profession or 'Professional'
        
        if field_type == 'jobTitle':
            return self._enhance_job_title(prompt, profession)
        elif field_type == 'summary':
            return self._enhance_summary(prompt, profession)
        elif field_type == 'experience':
            return self._enhance_experience(prompt, profession)
        elif field_type == 'skills':
            return self._enhance_skills(prompt, profession)
        elif field_type == 'education':
            return self._enhance_education(prompt, profession)
        elif field_type == 'projects':
            return self._enhance_projects(prompt, profession)
        elif field_type == 'achievements':
            return self._enhance_achievements([prompt], profession)[0]
        else:
            return self._enhance_generic(prompt, field_type, profession)
    
    def _enhance_job_title(self, title: str, profession: str) -> str:
        """Enhance job title with professional formatting"""
        title = title.strip()
        
        # Add professional prefixes/suffixes based on profession
        if 'engineer' in title.lower():
            if not any(word in title.lower() for word in ['senior', 'lead', 'principal', 'staff']):
                return f"Senior {title}"
            return title
        elif 'manager' in title.lower():
            if not any(word in title.lower() for word in ['senior', 'lead', 'principal', 'director']):
                return f"Senior {title}"
            return title
        elif 'developer' in title.lower():
            if not any(word in title.lower() for word in ['senior', 'lead', 'principal', 'staff']):
                return f"Senior {title}"
            return title
        elif 'analyst' in title.lower():
            if not any(word in title.lower() for word in ['senior', 'lead', 'principal', 'staff']):
                return f"Senior {title}"
            return title
        
        return title
    
    def _enhance_summary(self, summary: str, profession: str) -> str:
        """Enhance professional summary"""
        if not summary.strip():
            return f"Results-driven {profession} with proven expertise in delivering innovative solutions and driving business growth through strategic thinking and technical excellence."
        
        summary = summary.strip()
        
        # Add professional language if missing
        if not any(word in summary.lower() for word in ['experienced', 'skilled', 'proven', 'results-driven', 'passionate']):
            summary = f"Results-driven {summary}"
        
        # Ensure it ends with impact
        if not summary.endswith(('.', '!', '?')):
            summary += "."
        
        return summary
    
    def _enhance_experience(self, experience: str, profession: str) -> str:
        """Enhance work experience description"""
        if not experience.strip():
            return f"Delivered exceptional results in {profession} role, demonstrating strong technical skills and collaborative approach."
        
        experience = experience.strip()
        
        # Add action verbs if missing
        action_verbs = ['developed', 'implemented', 'managed', 'led', 'delivered', 'created', 'designed', 'optimized']
        if not any(verb in experience.lower() for verb in action_verbs):
            experience = f"Successfully {experience.lower()}"
        
        # Add quantifiable results if possible
        if not any(char.isdigit() for char in experience):
            experience += " with measurable impact and positive outcomes."
        
        return experience
    
    def _enhance_skills(self, skills: str, profession: str) -> str:
        """Enhance skills section"""
        if not skills.strip():
            return f"Technical Skills, Problem Solving, Team Collaboration, {profession} Expertise"
        
        skills = skills.strip()
        
        # Add professional skills if missing
        professional_skills = ['Problem Solving', 'Team Collaboration', 'Communication', 'Leadership']
        for skill in professional_skills:
            if skill.lower() not in skills.lower():
                skills += f", {skill}"
        
        return skills
    
    def _enhance_education(self, education: str, profession: str) -> str:
        """Enhance education section"""
        if not education.strip():
            return f"Relevant degree in {profession} or related field with strong academic foundation"
        
        education = education.strip()
        
        # Add relevant details if missing
        if 'degree' not in education.lower() and 'bachelor' not in education.lower() and 'master' not in education.lower():
            education = f"Degree in {education}"
        
        return education
    
    def _enhance_projects(self, projects: str, profession: str) -> str:
        """Enhance projects section"""
        if not projects.strip():
            return f"Led innovative {profession} projects demonstrating technical expertise and creative problem-solving abilities"
        
        projects = projects.strip()
        
        # Add project context if missing
        if not any(word in projects.lower() for word in ['project', 'developed', 'built', 'created', 'designed']):
            projects = f"Project: {projects}"
        
        return projects
    
    def _enhance_bullet_point(self, point: str, job_title: str) -> str:
        """Enhance individual bullet point"""
        point = point.strip()
        
        # Remove existing bullet points
        point = re.sub(r'^[-•*]\s*', '', point)
        
        # Add action verbs if missing
        action_verbs = ['Developed', 'Implemented', 'Managed', 'Led', 'Delivered', 'Created', 'Designed', 'Optimized', 'Improved', 'Enhanced']
        if not any(verb in point for verb in action_verbs):
            point = f"Successfully {point.lower()}"
        
        # Add quantifiable results if possible
        if not any(char.isdigit() for char in point):
            point += " with measurable positive impact"
        
        # Ensure proper capitalization
        point = point[0].upper() + point[1:] if point else point
        
        return point
    
    def _enhance_generic(self, content: str, field_type: str, profession: str) -> str:
        """Generic enhancement for unknown field types"""
        if not content.strip():
            return f"Professional {field_type} content for {profession} role"
        
        content = content.strip()
        
        # Add professional context
        if not any(word in content.lower() for word in ['professional', 'experienced', 'skilled', 'expert']):
            content = f"Professional {content.lower()}"
        
        # Ensure proper ending
        if not content.endswith(('.', '!', '?')):
            content += "."
        
        return content
    
    def get_francisca_suggestions(self, profession: str, field_type: str) -> List[str]:
        """Get suggestions for specific field types"""
        suggestions_map = {
            'jobTitle': [
                f"Senior {profession}",
                f"Lead {profession}",
                f"Principal {profession}",
                f"Staff {profession}",
                f"{profession} Manager"
            ],
            'summary': [
                f"Results-driven {profession} with proven expertise",
                f"Experienced {profession} with strong technical background",
                f"Passionate {profession} focused on innovation",
                f"Skilled {profession} with excellent problem-solving abilities"
            ],
            'experience': [
                "Led cross-functional teams to deliver successful projects",
                "Implemented innovative solutions that improved efficiency",
                "Collaborated with stakeholders to achieve business objectives",
                "Developed and maintained high-quality deliverables"
            ],
            'skills': [
                "Technical Skills, Problem Solving, Team Collaboration",
                "Leadership, Communication, Strategic Thinking",
                "Project Management, Quality Assurance, Innovation",
                "Mentoring, Process Improvement, Results Delivery"
            ]
        }
        
        return suggestions_map.get(field_type, [
            f"Professional {field_type} content",
            f"Industry-specific {field_type}",
            f"Compelling {field_type} presentation"
        ])

# Create singleton instance
fallback_ai_service = FallbackAIService()









