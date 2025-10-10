"""
Francisca Enhanced AI Service - Real-time answer enhancement and guidance
Provides intelligent suggestions and enhancements during the resume building process
"""

from typing import Dict, List, Optional, Any
import openai
import os
from dotenv import load_dotenv
from fallback_ai_service import fallback_ai_service

# Load environment variables
load_dotenv('.env')

class FranciscaEnhancedAI:
    def __init__(self):
        """Initialize the enhanced AI service"""
        self.api_key = os.getenv('OPENAI_API_KEY', 'your-openai-api-key-here')
        openai.api_key = self.api_key
        self.quota_exceeded = False
        self.last_quota_check = 0
        print(f"✅ Francisca Enhanced AI service initialized with API key: {self.api_key[:10]}..." if self.api_key and self.api_key != 'your-openai-api-key-here' else "⚠️ Francisca Enhanced AI service initialized with default/empty API key")
    
    def _handle_openai_error(self, error: Exception, operation: str) -> bool:
        """Handle OpenAI API errors and determine if fallback should be used"""
        import time
        
        error_str = str(error).lower()
        
        # Check for quota exceeded error
        if 'quota' in error_str or 'billing' in error_str or 'exceeded' in error_str:
            self.quota_exceeded = True
            self.last_quota_check = time.time()
            print(f"🚫 OpenAI quota exceeded for {operation}. Using fallback service.")
            return True
        
        # Check for rate limiting
        elif 'rate limit' in error_str or 'too many requests' in error_str:
            print(f"⏳ OpenAI rate limit hit for {operation}. Using fallback service.")
            return True
        
        # Check for authentication errors
        elif 'unauthorized' in error_str or 'invalid api key' in error_str:
            print(f"🔑 OpenAI authentication failed for {operation}. Using fallback service.")
            return True
        
        # For other errors, log and use fallback
        else:
            print(f"❌ OpenAI error for {operation}: {error}. Using fallback service.")
            return True
    
    def _should_use_fallback(self) -> bool:
        """Check if we should use fallback service"""
        import time
        
        # If quota exceeded, use fallback for 1 hour
        if self.quota_exceeded and (time.time() - self.last_quota_check) < 3600:
            return True
        
        # Reset quota check if enough time has passed
        if self.quota_exceeded and (time.time() - self.last_quota_check) >= 3600:
            self.quota_exceeded = False
            self.last_quota_check = time.time()
        
        return False
    
    def enhance_answer(self, field: str, answer: str, context: Dict = None) -> Dict:
        """Enhance a user's answer with AI suggestions"""
        try:
            if not answer.strip():
                return {
                    "enhanced": answer,
                    "suggestions": [],
                    "quality_score": 0,
                    "improvements": ["Please provide an answer to enhance"]
                }
            
            # Check if we should use fallback
            if self._should_use_fallback():
                return self._enhance_with_fallback(field, answer, context)
            
            # Get field-specific enhancement
            enhancement = self._get_field_enhancement(field, answer, context)
            
            # Use OpenAI for enhancement
            enhanced_answer = self._call_openai_for_enhancement(field, answer, context)
            
            return {
                "enhanced": enhanced_answer,
                "suggestions": enhancement.get("suggestions", []),
                "quality_score": enhancement.get("quality_score", 0),
                "improvements": enhancement.get("improvements", []),
                "field_specific_tips": enhancement.get("tips", [])
            }
            
        except Exception as e:
            if self._handle_openai_error(e, "enhance_answer"):
                return self._enhance_with_fallback(field, answer, context)
            else:
                raise e
    
    def _call_openai_for_enhancement(self, field: str, answer: str, context: Dict = None) -> str:
        """Call OpenAI API for answer enhancement"""
        context = context or {}
        profession = context.get("profession", "Professional")
        experience_level = context.get("experienceLevel", "Mid Level")
        
        field_prompts = {
            "firstName": f"Keep the first name as is: {answer}",
            "lastName": f"Keep the last name as is: {answer}",
            "email": f"Ensure email format is professional: {answer}",
            "phone": f"Format phone number professionally: {answer}",
            "location": f"Format location as 'City, State' or 'City, Country': {answer}",
            "linkedin": f"Ensure LinkedIn URL is complete: {answer}",
            "profession": f"Use professional title: {answer}",
            "experienceLevel": f"Keep experience level as is: {answer}",
            "targetRole": f"Make job title more specific and professional: {answer}",
            "highestDegree": f"Keep degree as is: {answer}",
            "degreeField": f"Use full field name: {answer}",
            "university": f"Use full university name: {answer}",
            "graduationYear": f"Keep year as is: {answer}",
            "gpa": f"Format GPA as decimal: {answer}",
            "currentJob": f"Enhance job title for {profession} field: {answer}",
            "currentCompany": f"Use full company name: {answer}",
            "currentDuration": f"Format duration professionally: {answer}",
            "keyResponsibilities": f"Enhance responsibilities with action verbs and quantifiable results for {profession}: {answer}",
            "keyAchievements": f"Enhance achievements with metrics and impact for {profession}: {answer}",
            "technicalSkills": f"Format technical skills as comma-separated list: {answer}",
            "softSkills": f"Format soft skills as comma-separated list: {answer}",
            "certifications": f"Format certifications with bullet points: {answer}",
            "majorAchievements": f"Enhance achievements with quantifiable results: {answer}",
            "awards": f"Format awards with bullet points: {answer}",
            "summary": f"Create compelling professional summary for {profession} with {experience_level} experience: {answer}"
        }
        
        prompt = field_prompts.get(field, f"Enhance this {field} answer professionally: {answer}")
        
        system_prompt = f"""You are an expert resume writer specializing in {profession} roles.
        Enhance the user's answer to be more professional, clear, and impactful.
        Return only the enhanced answer, no explanations."""
        
        try:
            from openai import OpenAI
            client = OpenAI(api_key=self.api_key)
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=200,
                temperature=0.7
            )
            return response.choices[0].message.content.strip()
        except ImportError:
            # Fallback to older API format
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=200,
                temperature=0.7
            )
            return response.choices[0].message.content.strip()
    
    def _enhance_with_fallback(self, field: str, answer: str, context: Dict = None) -> Dict:
        """Enhance answer using fallback service"""
        context = context or {}
        profession = context.get("profession", "Professional")
        
        # Use fallback service for enhancement
        enhanced = fallback_ai_service.generate_francisca_content(answer, field, profession)
        
        return {
            "enhanced": enhanced,
            "suggestions": self._get_fallback_suggestions(field, answer),
            "quality_score": 75,  # Fallback quality score
            "improvements": self._get_fallback_improvements(field, answer),
            "field_specific_tips": self._get_field_tips(field)
        }
    
    def _get_field_enhancement(self, field: str, answer: str, context: Dict = None) -> Dict:
        """Get field-specific enhancement suggestions"""
        context = context or {}
        profession = context.get("profession", "Professional")
        
        enhancement_rules = {
            "email": {
                "suggestions": ["Use a professional email address", "Avoid numbers or nicknames"],
                "quality_score": 90 if "@" in answer and "." in answer else 60,
                "improvements": ["Check email format", "Use professional domain"]
            },
            "phone": {
                "suggestions": ["Include country code", "Use consistent format"],
                "quality_score": 85 if len(answer.replace(" ", "").replace("-", "").replace("(", "").replace(")", "")) >= 10 else 60,
                "improvements": ["Format with country code", "Use standard format"]
            },
            "location": {
                "suggestions": ["Include city and state/country", "Use standard abbreviations"],
                "quality_score": 80 if "," in answer else 60,
                "improvements": ["Add state/country", "Use standard format"]
            },
            "targetRole": {
                "suggestions": ["Be specific about the role", "Include seniority level"],
                "quality_score": 85 if len(answer.split()) >= 2 else 60,
                "improvements": ["Add seniority level", "Be more specific"]
            },
            "keyResponsibilities": {
                "suggestions": ["Use action verbs", "Include quantifiable results", "Focus on impact"],
                "quality_score": 80 if any(word in answer.lower() for word in ["led", "developed", "managed", "increased", "improved"]) else 60,
                "improvements": ["Add action verbs", "Include metrics", "Show impact"]
            },
            "keyAchievements": {
                "suggestions": ["Include specific numbers", "Show business impact", "Use strong action verbs"],
                "quality_score": 85 if any(char.isdigit() for char in answer) else 60,
                "improvements": ["Add quantifiable results", "Show business impact"]
            },
            "summary": {
                "suggestions": ["Highlight key skills", "Include years of experience", "Show career goals"],
                "quality_score": 80 if len(answer.split()) >= 20 else 60,
                "improvements": ["Add more detail", "Include experience level", "Show value proposition"]
            }
        }
        
        return enhancement_rules.get(field, {
            "suggestions": ["Make it more professional", "Add more detail"],
            "quality_score": 70,
            "improvements": ["Enhance professionalism", "Add context"]
        })
    
    def _get_fallback_suggestions(self, field: str, answer: str) -> List[str]:
        """Get fallback suggestions for a field"""
        suggestions_map = {
            "email": ["Use a professional email address", "Include your name in the email"],
            "phone": ["Include country code", "Use consistent formatting"],
            "location": ["Include city and state", "Use standard abbreviations"],
            "targetRole": ["Be specific about the role", "Include seniority level"],
            "keyResponsibilities": ["Use action verbs", "Include quantifiable results"],
            "keyAchievements": ["Add specific numbers", "Show business impact"],
            "summary": ["Highlight key skills", "Include experience level"]
        }
        return suggestions_map.get(field, ["Make it more professional", "Add more detail"])
    
    def _get_fallback_improvements(self, field: str, answer: str) -> List[str]:
        """Get fallback improvement suggestions"""
        improvements_map = {
            "email": ["Check email format", "Use professional domain"],
            "phone": ["Format with country code", "Use standard format"],
            "location": ["Add state/country", "Use standard format"],
            "targetRole": ["Add seniority level", "Be more specific"],
            "keyResponsibilities": ["Add action verbs", "Include metrics"],
            "keyAchievements": ["Add quantifiable results", "Show business impact"],
            "summary": ["Add more detail", "Include experience level"]
        }
        return improvements_map.get(field, ["Enhance professionalism", "Add context"])
    
    def _get_field_tips(self, field: str) -> List[str]:
        """Get field-specific tips"""
        tips_map = {
            "email": ["Use a professional email address", "Avoid nicknames or numbers"],
            "phone": ["Include country code for international visibility", "Use consistent formatting"],
            "location": ["Include city and state/country", "Use standard abbreviations"],
            "targetRole": ["Be specific about the role you want", "Include seniority level"],
            "keyResponsibilities": ["Use strong action verbs", "Include quantifiable results", "Focus on impact"],
            "keyAchievements": ["Include specific numbers and metrics", "Show business impact", "Use strong action verbs"],
            "summary": ["Highlight your key skills", "Include years of experience", "Show your value proposition"]
        }
        return tips_map.get(field, ["Make it professional and clear", "Add relevant details"])
    
    def generate_guided_response(self, step: str, field: str, user_input: str, context: Dict = None) -> Dict:
        """Generate a guided response for the question flow"""
        context = context or {}
        
        # Get enhancement for the answer
        enhancement = self.enhance_answer(field, user_input, context)
        
        # Generate contextual guidance
        guidance = self._generate_contextual_guidance(step, field, user_input, context)
        
        return {
            "enhanced_answer": enhancement["enhanced"],
            "suggestions": enhancement["suggestions"],
            "quality_score": enhancement["quality_score"],
            "improvements": enhancement["improvements"],
            "guidance": guidance,
            "next_steps": self._get_next_steps(step, field)
        }
    
    def _generate_contextual_guidance(self, step: str, field: str, user_input: str, context: Dict = None) -> str:
        """Generate contextual guidance based on the step and field"""
        context = context or {}
        profession = context.get("profession", "Professional")
        
        guidance_map = {
            "personal_info": f"Great! Your {field} looks good. This information will help employers contact you.",
            "profession": f"Perfect! This helps us tailor the rest of your resume for {profession} roles.",
            "education": f"Excellent! Your educational background in {user_input} is valuable for {profession} positions.",
            "experience": f"Outstanding! Your experience as {user_input} shows strong qualifications for {profession} roles.",
            "skills": f"Fantastic! These skills are highly relevant for {profession} positions.",
            "achievements": f"Impressive! These achievements demonstrate your value in {profession}.",
            "summary": f"Perfect! This summary effectively showcases your {profession} expertise."
        }
        
        return guidance_map.get(step, f"Great answer! This information will strengthen your resume.")
    
    def _get_next_steps(self, step: str, field: str) -> List[str]:
        """Get suggested next steps based on current progress"""
        next_steps_map = {
            "personal_info": ["Complete your contact information", "Add your LinkedIn profile"],
            "profession": ["Define your target role", "Set your experience level"],
            "education": ["Add your degree details", "Include relevant coursework"],
            "experience": ["Detail your responsibilities", "Highlight your achievements"],
            "skills": ["Add technical skills", "Include soft skills"],
            "achievements": ["Quantify your results", "Show business impact"],
            "summary": ["Review your complete resume", "Make final adjustments"]
        }
        
        return next_steps_map.get(step, ["Continue with the next section", "Review your information"])

# Create singleton instance
francisca_enhanced_ai = FranciscaEnhancedAI()









