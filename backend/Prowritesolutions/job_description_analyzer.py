"""
Job Description Analyzer Service
Analyzes job descriptions and provides resume optimization suggestions
"""

import os
import json
import re
import openai
from typing import Dict, List, Any, Optional
from datetime import datetime

class JobDescriptionAnalyzer:
    def __init__(self):
        """Initialize the job description analyzer"""
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        if self.openai_api_key:
            openai.api_key = self.openai_api_key
        
        # Common job requirements patterns
        self.requirement_patterns = {
            'experience_years': r'(\d+)[\-\+]?\s*(?:years?|yrs?)\s*(?:of\s*)?experience',
            'education_level': r'(bachelor|master|phd|associate|high\s*school|diploma)',
            'skills': r'(python|javascript|java|react|node\.js|sql|aws|docker|kubernetes|git|agile|scrum)',
            'certifications': r'(certified|certification|cert|license)',
            'soft_skills': r'(leadership|communication|teamwork|problem\s*solving|analytical)',
            'tools': r'(excel|word|powerpoint|photoshop|illustrator|figma|slack|zoom)'
        }
        
        # Industry-specific keywords
        self.industry_keywords = {
            'technology': [
                'software development', 'programming', 'coding', 'web development',
                'mobile development', 'database', 'cloud computing', 'devops',
                'machine learning', 'artificial intelligence', 'data science'
            ],
            'marketing': [
                'digital marketing', 'social media', 'content marketing', 'seo',
                'sem', 'email marketing', 'brand management', 'campaign management',
                'analytics', 'google ads', 'facebook ads'
            ],
            'sales': [
                'sales', 'business development', 'account management', 'lead generation',
                'prospecting', 'negotiation', 'client relationship', 'crm',
                'salesforce', 'quota', 'territory management'
            ],
            'finance': [
                'financial analysis', 'budgeting', 'forecasting', 'financial modeling',
                'risk management', 'compliance', 'accounting', 'audit',
                'investment', 'portfolio management', 'financial reporting'
            ],
            'healthcare': [
                'patient care', 'clinical', 'medical', 'healthcare', 'nursing',
                'diagnosis', 'treatment', 'patient assessment', 'medical records',
                'healthcare technology', 'patient safety'
            ]
        }

    def analyze_job_description(self, job_description: str, resume_content: str = None) -> Dict[str, Any]:
        """Analyze job description and provide optimization insights"""
        try:
            if not self.openai_api_key:
                return self._mock_job_analysis(job_description, resume_content)
            
            # Extract key information from job description
            extracted_info = self._extract_job_requirements(job_description)
            
            # Analyze requirements and provide insights
            analysis = {
                'job_title': extracted_info.get('job_title', ''),
                'company': extracted_info.get('company', ''),
                'required_skills': extracted_info.get('required_skills', []),
                'preferred_skills': extracted_info.get('preferred_skills', []),
                'experience_requirements': extracted_info.get('experience_requirements', {}),
                'education_requirements': extracted_info.get('education_requirements', {}),
                'industry': extracted_info.get('industry', ''),
                'key_responsibilities': extracted_info.get('key_responsibilities', []),
                'match_analysis': {},
                'optimization_suggestions': [],
                'keyword_gaps': [],
                'resume_optimization': {}
            }
            
            # If resume content is provided, perform matching analysis
            if resume_content:
                match_analysis = self._analyze_resume_match(resume_content, extracted_info)
                analysis['match_analysis'] = match_analysis
                analysis['optimization_suggestions'] = self._generate_optimization_suggestions(
                    resume_content, extracted_info, match_analysis
                )
                analysis['keyword_gaps'] = self._identify_keyword_gaps(
                    resume_content, extracted_info
                )
                analysis['resume_optimization'] = self._generate_resume_optimization(
                    resume_content, extracted_info
                )
            
            return {
                'success': True,
                'analysis': analysis,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error in job description analysis: {e}")
            return {
                'success': False,
                'error': str(e),
                'analysis': self._mock_job_analysis(job_description, resume_content)
            }

    def _extract_job_requirements(self, job_description: str) -> Dict[str, Any]:
        """Extract key requirements from job description"""
        description_lower = job_description.lower()
        
        extracted = {
            'job_title': self._extract_job_title(job_description),
            'company': self._extract_company_name(job_description),
            'required_skills': [],
            'preferred_skills': [],
            'experience_requirements': {},
            'education_requirements': {},
            'industry': self._identify_industry(description_lower),
            'key_responsibilities': self._extract_responsibilities(job_description)
        }
        
        # Extract experience requirements
        experience_match = re.search(self.requirement_patterns['experience_years'], description_lower)
        if experience_match:
            extracted['experience_requirements'] = {
                'years': int(experience_match.group(1)),
                'text': experience_match.group(0)
            }
        
        # Extract education requirements
        education_match = re.search(self.requirement_patterns['education_level'], description_lower)
        if education_match:
            extracted['education_requirements'] = {
                'level': education_match.group(1),
                'text': education_match.group(0)
            }
        
        # Extract skills
        extracted['required_skills'] = self._extract_skills(description_lower, 'required')
        extracted['preferred_skills'] = self._extract_skills(description_lower, 'preferred')
        
        return extracted

    def _extract_job_title(self, job_description: str) -> str:
        """Extract job title from description"""
        # Look for common job title patterns
        title_patterns = [
            r'(?:seeking|looking for|hiring)\s+(?:a\s+)?([A-Z][a-z\s]+(?:Engineer|Manager|Specialist|Analyst|Developer|Coordinator|Director|Lead))',
            r'([A-Z][a-z\s]+(?:Engineer|Manager|Specialist|Analyst|Developer|Coordinator|Director|Lead))\s+(?:position|role|job)',
            r'Job Title:\s*([A-Z][a-z\s]+)',
            r'Position:\s*([A-Z][a-z\s]+)'
        ]
        
        for pattern in title_patterns:
            match = re.search(pattern, job_description, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        
        return "Unknown Position"

    def _extract_company_name(self, job_description: str) -> str:
        """Extract company name from description"""
        # Look for company name patterns
        company_patterns = [
            r'(?:at|with|for)\s+([A-Z][a-zA-Z\s&]+(?:Inc|Corp|LLC|Ltd|Company|Technologies|Solutions))',
            r'Company:\s*([A-Z][a-zA-Z\s&]+)',
            r'About\s+([A-Z][a-zA-Z\s&]+)'
        ]
        
        for pattern in company_patterns:
            match = re.search(pattern, job_description, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        
        return "Unknown Company"

    def _identify_industry(self, description_lower: str) -> str:
        """Identify industry based on keywords"""
        industry_scores = {}
        
        for industry, keywords in self.industry_keywords.items():
            score = sum(1 for keyword in keywords if keyword in description_lower)
            industry_scores[industry] = score
        
        if industry_scores:
            return max(industry_scores, key=industry_scores.get)
        
        return "General"

    def _extract_skills(self, description_lower: str, skill_type: str) -> List[str]:
        """Extract skills from job description"""
        skills = []
        
        # Extract technical skills
        tech_skills = re.findall(self.requirement_patterns['skills'], description_lower)
        skills.extend(tech_skills)
        
        # Extract soft skills
        soft_skills = re.findall(self.requirement_patterns['soft_skills'], description_lower)
        skills.extend(soft_skills)
        
        # Extract tools
        tools = re.findall(self.requirement_patterns['tools'], description_lower)
        skills.extend(tools)
        
        # Remove duplicates and clean up
        skills = list(set(skills))
        skills = [skill.strip() for skill in skills if skill.strip()]
        
        return skills

    def _extract_responsibilities(self, job_description: str) -> List[str]:
        """Extract key responsibilities from job description"""
        responsibilities = []
        
        # Look for responsibility patterns
        responsibility_patterns = [
            r'•\s*(.+?)(?=\n|$)',
            r'-\s*(.+?)(?=\n|$)',
            r'Responsibilities?:\s*(.+?)(?=\n\n|\n[A-Z]|$)',
            r'Duties?:\s*(.+?)(?=\n\n|\n[A-Z]|$)'
        ]
        
        for pattern in responsibility_patterns:
            matches = re.findall(pattern, job_description, re.IGNORECASE | re.MULTILINE)
            responsibilities.extend(matches)
        
        # Clean up responsibilities
        responsibilities = [resp.strip() for resp in responsibilities if resp.strip()]
        responsibilities = responsibilities[:10]  # Limit to top 10
        
        return responsibilities

    def _analyze_resume_match(self, resume_content: str, job_requirements: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze how well resume matches job requirements"""
        resume_lower = resume_content.lower()
        
        # Calculate skill match
        required_skills = job_requirements.get('required_skills', [])
        preferred_skills = job_requirements.get('preferred_skills', [])
        
        required_matches = sum(1 for skill in required_skills if skill.lower() in resume_lower)
        preferred_matches = sum(1 for skill in preferred_skills if skill.lower() in resume_lower)
        
        required_match_percentage = (required_matches / len(required_skills) * 100) if required_skills else 0
        preferred_match_percentage = (preferred_matches / len(preferred_skills) * 100) if preferred_skills else 0
        
        # Calculate overall match score
        overall_match = (required_match_percentage * 0.7) + (preferred_match_percentage * 0.3)
        
        return {
            'overall_match_percentage': overall_match,
            'required_skills_match': required_match_percentage,
            'preferred_skills_match': preferred_match_percentage,
            'matched_required_skills': [skill for skill in required_skills if skill.lower() in resume_lower],
            'matched_preferred_skills': [skill for skill in preferred_skills if skill.lower() in resume_lower],
            'missing_required_skills': [skill for skill in required_skills if skill.lower() not in resume_lower],
            'missing_preferred_skills': [skill for skill in preferred_skills if skill.lower() not in resume_lower]
        }

    def _generate_optimization_suggestions(self, resume_content: str, job_requirements: Dict[str, Any], match_analysis: Dict[str, Any]) -> List[str]:
        """Generate optimization suggestions based on job requirements"""
        suggestions = []
        
        # Skill gap suggestions
        missing_required = match_analysis.get('missing_required_skills', [])
        if missing_required:
            suggestions.append(f"Add missing required skills: {', '.join(missing_required[:3])}")
        
        missing_preferred = match_analysis.get('missing_preferred_skills', [])
        if missing_preferred:
            suggestions.append(f"Consider adding preferred skills: {', '.join(missing_preferred[:3])}")
        
        # Experience suggestions
        exp_req = job_requirements.get('experience_requirements', {})
        if exp_req and 'years' in exp_req:
            suggestions.append(f"Highlight {exp_req['years']}+ years of relevant experience")
        
        # Education suggestions
        edu_req = job_requirements.get('education_requirements', {})
        if edu_req and 'level' in edu_req:
            suggestions.append(f"Emphasize {edu_req['level']} education if applicable")
        
        # Industry-specific suggestions
        industry = job_requirements.get('industry', '')
        if industry:
            suggestions.append(f"Use {industry}-specific terminology and keywords")
        
        # General suggestions
        if match_analysis.get('overall_match_percentage', 0) < 70:
            suggestions.append("Consider restructuring resume to better align with job requirements")
        
        return suggestions[:5]  # Limit to top 5 suggestions

    def _identify_keyword_gaps(self, resume_content: str, job_requirements: Dict[str, Any]) -> List[str]:
        """Identify important keywords missing from resume"""
        resume_lower = resume_content.lower()
        missing_keywords = []
        
        # Check required skills
        for skill in job_requirements.get('required_skills', []):
            if skill.lower() not in resume_lower:
                missing_keywords.append(skill)
        
        # Check industry keywords
        industry = job_requirements.get('industry', '')
        if industry and industry in self.industry_keywords:
            for keyword in self.industry_keywords[industry]:
                if keyword.lower() not in resume_lower:
                    missing_keywords.append(keyword)
        
        return missing_keywords[:10]  # Limit to top 10

    def _generate_resume_optimization(self, resume_content: str, job_requirements: Dict[str, Any]) -> Dict[str, Any]:
        """Generate specific resume optimization recommendations"""
        optimization = {
            'keyword_additions': [],
            'content_enhancements': [],
            'structure_improvements': [],
            'formatting_suggestions': []
        }
        
        # Keyword additions
        missing_keywords = self._identify_keyword_gaps(resume_content, job_requirements)
        optimization['keyword_additions'] = missing_keywords[:5]
        
        # Content enhancements
        if job_requirements.get('experience_requirements'):
            optimization['content_enhancements'].append("Add quantifiable achievements and metrics")
        
        if job_requirements.get('key_responsibilities'):
            optimization['content_enhancements'].append("Align experience with job responsibilities")
        
        # Structure improvements
        optimization['structure_improvements'].append("Prioritize relevant experience at the top")
        optimization['structure_improvements'].append("Use job-specific keywords in section headers")
        
        # Formatting suggestions
        optimization['formatting_suggestions'].append("Ensure ATS-friendly formatting")
        optimization['formatting_suggestions'].append("Use standard section headers")
        
        return optimization

    def _mock_job_analysis(self, job_description: str, resume_content: str = None) -> Dict[str, Any]:
        """Mock job analysis for testing"""
        return {
            'job_title': 'Software Engineer',
            'company': 'TechCorp',
            'required_skills': ['python', 'javascript', 'react', 'sql'],
            'preferred_skills': ['aws', 'docker', 'agile'],
            'experience_requirements': {'years': 3, 'text': '3+ years experience'},
            'education_requirements': {'level': 'bachelor', 'text': 'bachelor degree'},
            'industry': 'technology',
            'key_responsibilities': [
                'Develop and maintain web applications',
                'Collaborate with cross-functional teams',
                'Write clean, maintainable code'
            ],
            'match_analysis': {
                'overall_match_percentage': 75.0,
                'required_skills_match': 80.0,
                'preferred_skills_match': 60.0,
                'matched_required_skills': ['python', 'javascript', 'react'],
                'matched_preferred_skills': ['agile'],
                'missing_required_skills': ['sql'],
                'missing_preferred_skills': ['aws', 'docker']
            },
            'optimization_suggestions': [
                'Add missing required skills: sql',
                'Consider adding preferred skills: aws, docker',
                'Highlight 3+ years of relevant experience',
                'Use technology-specific terminology and keywords'
            ],
            'keyword_gaps': ['sql', 'aws', 'docker', 'microservices', 'api'],
            'resume_optimization': {
                'keyword_additions': ['sql', 'aws', 'docker'],
                'content_enhancements': ['Add quantifiable achievements and metrics'],
                'structure_improvements': ['Prioritize relevant experience at the top'],
                'formatting_suggestions': ['Ensure ATS-friendly formatting']
            }
        }

# Global instance for easy access
job_description_analyzer = JobDescriptionAnalyzer()























