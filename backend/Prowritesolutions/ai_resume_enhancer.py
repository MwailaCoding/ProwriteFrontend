"""
AI-powered resume enhancement features for the Francisca template.
Provides content improvement, skills analysis, and ATS optimization.
"""

import os
import json
from mock_ai_service import MockAIService
from typing import Dict, List, Optional, Union

class AIResumeEnhancer:
    def __init__(self, api_key: Optional[str] = None):
        """Initialize the AI enhancer with optional API key"""
        self.client = MockAIService()

    def safe_ai_call(self, func, *args, **kwargs):
        """Safely call AI functions with proper error handling"""
        try:
            if not self.client:
                raise Exception("AI client not initialized")
            return func(*args, **kwargs)
        except Exception as e:
            print(f"AI operation failed: {e}")
            # Return appropriate fallback based on function
            if func.__name__ == "enhance_achievements":
                return args[0]  # Return original bullet points
            elif func.__name__ == "generate_summary":
                return ""
            elif func.__name__ == "analyze_skills_gap":
                return {"missing_skills": [], "recommendations": []}
            elif func.__name__ == "optimize_for_ats":
                return args[0]  # Return original data
            elif func.__name__ == "suggest_design_improvements":
                return []
            elif func.__name__ == "extract_keywords_from_job_description":
                return []
            return None

    def enhance_achievements(self, bullet_points: List[str], job_title: str) -> List[str]:
        """Transform basic responsibilities into achievement-oriented statements"""
        if not self.client:
            return bullet_points
            
        prompt = f"""
        Transform these job responsibilities into achievement-oriented resume bullet points for a {job_title}.
        Use strong action verbs and quantify results where possible.
        Focus on impact and measurable outcomes.
        
        Original responsibilities:
        {json.dumps(bullet_points, indent=2)}
        
        Return only a JSON array of enhanced bullet points.
        Each bullet point should:
        1. Start with a strong action verb
        2. Include quantifiable metrics where possible
        3. Show impact and results
        4. Be concise but specific
        """
        
        try:
            enhanced_points = self.client.enhance_achievements(bullet_points, job_title)
            return enhanced_points
            
        except Exception as e:
            print(f"Achievement enhancement failed: {e}")
            return bullet_points

    def generate_summary(self, resume_data: Dict) -> str:
        """Generate a professional summary based on resume content"""
        if not self.client:
            return resume_data.get('summary', '')
            
        prompt = f"""
        Create a compelling professional summary for a resume based on this data:
        {json.dumps(resume_data, indent=2)}
        
        Requirements:
        1. 3-4 lines maximum
        2. Focus on key achievements and value proposition
        3. Include years of experience if available
        4. Highlight unique selling points
        5. Target the industry from their experience
        6. Use strong, active language
        
        Return only the summary text.
        """
        
        try:
            return self.client.generate_summary(resume_data)
            
        except Exception as e:
            print(f"Summary generation failed: {e}")
            return resume_data.get('summary', '')

    def analyze_skills_gap(self, resume_data: Dict, job_description: str) -> Dict:
        """Analyze gaps between current skills and target job requirements"""
        if not self.client:
            return {"missing_skills": [], "recommendations": []}
            
        prompt = f"""
        Analyze this resume against the target job description and identify:
        1. Missing skills that are required for the job
        2. Recommendations to bridge the gap
        3. Strengths that align well with the role
        4. Areas where experience could be better highlighted
        
        Resume data:
        {json.dumps(resume_data, indent=2)}
        
        Job description:
        {job_description}
        
        Return a JSON object with:
        1. 'missing_skills': array of skills mentioned in job but missing from resume
        2. 'recommendations': array of specific actions to improve alignment
        3. 'strengths': array of matching qualifications
        4. 'highlight_suggestions': array of experience points to emphasize
        """
        
        try:
            analysis = self.client.analyze_skills_gap(resume_data, job_description)
            return analysis
            
        except Exception as e:
            print(f"Skills gap analysis failed: {e}")
            return {
                "missing_skills": [],
                "recommendations": [],
                "strengths": [],
                "highlight_suggestions": []
            }

    def optimize_for_ats(self, resume_data: Dict, job_description: Optional[str] = None, industry: Optional[str] = None) -> Dict:
        """Optimize resume content for ATS systems"""
        if not self.client:
            return resume_data
            
        context = []
        if job_description:
            context.append(f"Job Description:\n{job_description}")
        if industry:
            context.append(f"Industry: {industry}")
        
        prompt = f"""
        Optimize this resume data for Applicant Tracking Systems (ATS).
        
        Context:
        {'\n'.join(context)}
        
        Current resume data:
        {json.dumps(resume_data, indent=2)}
        
        Optimization requirements:
        1. Add relevant industry keywords
        2. Improve keyword density without stuffing
        3. Use standard section headers
        4. Format job titles to match common ATS searches
        5. Include key skills in context
        6. Ensure all dates are properly formatted
        7. Use recognized abbreviations
        
        Return the optimized resume data in the same JSON format.
        """
        
        try:
            optimized_data = self.client.optimize_for_ats(resume_data, job_description, industry)
            return optimized_data
            
        except Exception as e:
            print(f"ATS optimization failed: {e}")
            return resume_data

    def suggest_design_improvements(self, resume_data: Dict, current_design: Dict) -> List[str]:
        """Get AI suggestions for resume design and layout"""
        if not self.client:
            return []
            
        prompt = f"""
        Analyze this resume content and current design, then suggest specific improvements:
        
        Resume content:
        {json.dumps(resume_data, indent=2)}
        
        Current design characteristics:
        {json.dumps(current_design, indent=2)}
        
        Provide 5-7 specific design improvements for:
        1. Visual hierarchy
        2. Readability
        3. Professional appearance
        4. ATS compatibility
        5. Industry appropriateness
        6. Space utilization
        7. Typography and formatting
        
        Return a JSON array of detailed suggestions.
        Each suggestion should be specific and actionable.
        """
        
        try:
            suggestions = self.client.suggest_design_improvements(resume_data, current_design)
            return suggestions
            
        except Exception as e:
            print(f"Design suggestions failed: {e}")
            return []

    def extract_keywords_from_job(self, job_description: str) -> List[str]:
        """Extract important keywords from a job description"""
        if not self.client:
            return []
            
        prompt = f"""
        Extract the most important keywords and skills from this job description
        that would be critical for Applicant Tracking Systems.
        Focus on:
        1. Technical skills
        2. Soft skills
        3. Industry-specific terms
        4. Required certifications
        5. Tools and technologies
        6. Methodologies and processes
        
        Job description:
        {job_description}
        
        Return a JSON array of keywords, categorized by type.
        """
        
        try:
            keywords = self.client.extract_keywords_from_job(job_description)
            return keywords
            
        except Exception as e:
            print(f"Keyword extraction failed: {e}")
            return []

    def enhance_resume(self, resume_data: Dict, job_description: Optional[str] = None, industry: Optional[str] = None) -> Dict:
        """Apply all AI enhancements to a resume"""
        enhanced_data = resume_data.copy()
        
        # Generate or enhance professional summary
        if not enhanced_data.get('summary'):
            enhanced_data['summary'] = self.safe_ai_call(self.generate_summary, enhanced_data)
        
        # Enhance experience bullet points
        for exp in enhanced_data.get('workExperience', []):
            if 'description' in exp and isinstance(exp['description'], list):
                exp['description'] = self.safe_ai_call(
                    self.enhance_achievements,
                    exp['description'],
                    exp.get('jobTitle', '')
                )
        
        # Optimize for ATS if job description provided
        if job_description:
            enhanced_data = self.safe_ai_call(
                self.optimize_for_ats,
                enhanced_data,
                job_description,
                industry
            )
            
            # Analyze skills gap
            skills_analysis = self.safe_ai_call(
                self.analyze_skills_gap,
                enhanced_data,
                job_description
            )
            
            # Extract keywords
            keywords = self.safe_ai_call(
                self.extract_keywords_from_job,
                job_description
            )
            
            # Add analysis to enhanced data
            enhanced_data['skills_analysis'] = skills_analysis
            enhanced_data['job_keywords'] = keywords
        
        return enhanced_data
