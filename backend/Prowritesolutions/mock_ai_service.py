"""
Mock AI service for testing
"""

from typing import Dict, List, Optional, Union

class MockAIService:
    def __init__(self):
        """Initialize the mock service"""
        print("✅ Mock AI service initialized")

    def enhance_achievements(self, bullet_points: List[str], job_title: str) -> List[str]:
        """Mock achievement enhancement"""
        enhanced = []
        for point in bullet_points:
            if "developed" in point.lower():
                enhanced.append(f"Successfully {point} resulting in 30% improved performance")
            elif "led" in point.lower():
                enhanced.append(f"{point} and increased team productivity by 25%")
            elif "implemented" in point.lower():
                enhanced.append(f"{point} reducing deployment time by 40%")
            else:
                enhanced.append(point)
        return enhanced

    def generate_summary(self, resume_data: Dict) -> str:
        """Mock summary generation"""
        experience = resume_data.get('workExperience', [])
        skills = resume_data.get('skills', [])
        education = resume_data.get('education', [])

        years = len(experience)
        skill_names = [s['name'] for s in skills[:3]]
        degree = education[0]['degree'] if education else ''

        return f"Experienced {experience[0]['jobTitle']} with {years}+ years of expertise in {', '.join(skill_names)}. {degree} graduate with a proven track record of delivering high-impact solutions."

    def analyze_skills_gap(self, resume_data: Dict, job_description: str) -> Dict:
        """Mock skills gap analysis"""
        return {
            "missing_skills": [
                "Docker",
                "Kubernetes",
                "CI/CD"
            ],
            "recommendations": [
                "Add experience with containerization technologies",
                "Highlight any DevOps experience",
                "Consider obtaining cloud certifications"
            ],
            "strengths": [
                "Strong programming background",
                "Team leadership experience",
                "Cloud platform knowledge"
            ],
            "highlight_suggestions": [
                "Emphasize cloud-based projects",
                "Quantify team size and project impact",
                "Add specific AWS services used"
            ]
        }

    def optimize_for_ats(self, resume_data: Dict, job_description: Optional[str] = None) -> Dict:
        """Mock ATS optimization"""
        optimized = resume_data.copy()
        
        # Add a professional summary
        if not optimized.get('summary'):
            optimized['summary'] = self.generate_summary(resume_data)
        
        # Enhance job titles
        for exp in optimized.get('workExperience', []):
            if 'software' in exp['jobTitle'].lower():
                exp['jobTitle'] = 'Senior Software Engineer'
            elif 'developer' in exp['jobTitle'].lower():
                exp['jobTitle'] = 'Full Stack Developer'
        
        # Enhance skills
        if optimized.get('skills'):
            optimized['skills'] = [
                {'name': 'Python (Django, Flask)'},
                {'name': 'JavaScript (React, Node.js)'},
                {'name': 'AWS (EC2, S3, Lambda)'},
                {'name': 'DevOps (CI/CD, Docker)'},
                {'name': 'Database Design (SQL, NoSQL)'}
            ]
        
        return optimized

    def extract_keywords(self, job_description: str) -> Dict[str, List[str]]:
        """Mock keyword extraction"""
        return {
            "technical_skills": [
                "Python",
                "JavaScript",
                "React",
                "Node.js",
                "AWS",
                "CI/CD"
            ],
            "soft_skills": [
                "Leadership",
                "Communication",
                "Problem Solving",
                "Team Management",
                "Mentoring"
            ],
            "industry_terms": [
                "Full Stack Development",
                "Cloud Computing",
                "DevOps",
                "Agile Methodology",
                "Microservices"
            ],
            "certifications": [
                "AWS Certified Developer",
                "Professional Scrum Master",
                "Docker Certified Associate"
            ]
        }

    def suggest_design_improvements(self, resume_data: Dict, current_design: Dict) -> List[str]:
        """Mock design suggestions"""
        return [
            "Use a more prominent header for your name and contact information",
            "Add more whitespace between sections for better readability",
            "Consider using bullet points for skills to improve scannability",
            "Make job titles slightly larger than company names",
            "Use consistent date formatting throughout",
            "Add subtle dividing lines between major sections",
            "Consider using a complementary color for section headers"
        ]