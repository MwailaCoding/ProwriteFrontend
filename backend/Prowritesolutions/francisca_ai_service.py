"""
Francisca AI Service - Advanced AI-powered resume enhancement
"""

from typing import Dict, List, Optional, Union
import openai
import os
from dotenv import load_dotenv
from fallback_ai_service import fallback_ai_service

# Load environment variables
load_dotenv('.env')

class FranciscaAIService:
    def __init__(self):
        """Initialize the Francisca AI service"""
        self.api_key = os.getenv('OPENAI_API_KEY', 'your-openai-api-key-here')
        openai.api_key = self.api_key
        self.quota_exceeded = False
        self.last_quota_check = 0
        print(f"✅ Francisca AI service initialized with API key: {self.api_key[:10]}..." if self.api_key and self.api_key != 'your-openai-api-key-here' else "⚠️ Francisca AI service initialized with default/empty API key")

    def _handle_openai_error(self, error: Exception, operation: str) -> bool:
        """Handle OpenAI API errors and determine if fallback should be used"""
        import time
        
        error_str = str(error).lower()
        
        # Check for quota exceeded error
        if 'quota' in error_str or 'billing' in error_str or 'exceeded' in error_str:
            self.quota_exceeded = True
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
        
        # Check for model errors
        elif 'model' in error_str and ('not found' in error_str or 'unavailable' in error_str):
            print(f"🤖 OpenAI model unavailable for {operation}. Using fallback service.")
            return True
        
        # Check for network errors
        elif 'network' in error_str or 'connection' in error_str or 'timeout' in error_str:
            print(f"🌐 OpenAI network error for {operation}. Using fallback service.")
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

    def get_service_status(self) -> Dict:
        """Get the current status of the AI service"""
        import time
        return {
            "api_key_configured": bool(self.api_key and self.api_key != 'your-openai-api-key-here'),
            "quota_exceeded": self.quota_exceeded,
            "using_fallback": self._should_use_fallback(),
            "last_quota_check": self.last_quota_check,
            "time_since_quota_check": time.time() - self.last_quota_check if self.last_quota_check > 0 else 0
        }

    def enhance_job_description(self, job_description: str, profession: str = "General") -> str:
        """Enhance job description using AI"""
        try:
            if not self.api_key or self.api_key == 'your-openai-api-key-here':
                return self._fallback_job_description_enhancement(job_description, profession)
            
            prompt = f"""You are an expert job description enhancer. Please improve the following job description to make it more clear, comprehensive, and attractive to potential candidates while maintaining its original intent.

Profession: {profession}
Original Job Description:
{job_description}

Please enhance this job description by:
1. Improving clarity and readability
2. Adding missing details that would help candidates understand the role better
3. Making it more engaging and professional
4. Ensuring it follows best practices for job postings
5. Maintaining the original requirements and responsibilities

Return only the enhanced job description without any additional commentary."""

            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert job description enhancer with extensive experience in HR and recruitment."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.7
            )
            
            enhanced_description = response.choices[0].message.content.strip()
            return enhanced_description
            
        except Exception as e:
            if self._handle_openai_error(e, "job description enhancement"):
                return self._fallback_job_description_enhancement(job_description, profession)
            else:
                raise e

    def _fallback_job_description_enhancement(self, job_description: str, profession: str) -> str:
        """Fallback job description enhancement when AI is unavailable"""
        # Basic enhancement without AI
        enhanced = job_description.strip()
        
        # Add some basic improvements
        if not enhanced.endswith('.'):
            enhanced += '.'
        
        # Add profession-specific improvements
        if profession.lower() in ['software engineer', 'developer', 'programmer']:
            if 'remote' not in enhanced.lower():
                enhanced += " This position offers flexible work arrangements."
        
        return enhanced

    def enhance_achievements(self, bullet_points: List[str], job_title: str) -> List[str]:
        """Enhance achievement bullet points with AI"""
        try:
            if not bullet_points:
                return []
            
            # Check if we should use fallback
            if self._should_use_fallback():
                return fallback_ai_service.enhance_achievements(bullet_points, job_title)
            
            prompt = f"""
            Enhance these resume bullet points for a {job_title} position. 
            Make them more impactful, specific, and quantifiable where possible.
            Focus on results, metrics, and achievements.
            
            Original bullet points:
            {chr(10).join(f"- {point}" for point in bullet_points)}
            
            Return only the enhanced bullet points, one per line, starting with "- ".
            """
            
            # Use the newer OpenAI API format
            try:
                from openai import OpenAI
                client = OpenAI(api_key=self.api_key)
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=500,
                    temperature=0.7
                )
                enhanced_text = response.choices[0].message.content.strip()
            except ImportError:
                # Fallback to older API format
                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=500,
                    temperature=0.7
                )
                enhanced_text = response.choices[0].message.content.strip()
            enhanced_points = [line.strip()[2:] for line in enhanced_text.split('\n') if line.strip().startswith('- ')]
            
            return enhanced_points if enhanced_points else bullet_points
            
        except Exception as e:
            if self._handle_openai_error(e, "enhance_achievements"):
                return fallback_ai_service.enhance_achievements(bullet_points, job_title)
            else:
                # Re-raise if it's not an OpenAI error we can handle
                raise e

    def generate_summary(self, resume_data: Dict) -> str:
        """Generate a compelling professional summary"""
        try:
            experience = resume_data.get('workExperience', [])
            skills = resume_data.get('skills', [])
            education = resume_data.get('education', [])
            
            if not experience:
                return "Professional with strong technical skills and proven ability to deliver results."
            
            # Extract key information
            years = len(experience)
            job_titles = [exp.get('jobTitle', '') for exp in experience[:3]]
            skill_names = [s.get('name', '') for s in skills[:5]]
            degree = education[0].get('degree', '') if education else ''
            
            prompt = f"""
            Create a compelling professional summary for a resume with the following details:
            - Years of experience: {years}
            - Recent job titles: {', '.join(job_titles)}
            - Key skills: {', '.join(skill_names)}
            - Education: {degree}
            
            Make it concise (2-3 sentences), professional, and highlight key achievements.
            """
            
            # Use the newer OpenAI API format
            try:
                from openai import OpenAI
                client = OpenAI(api_key=self.api_key)
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=200,
                    temperature=0.7
                )
                return response.choices[0].message.content.strip()
            except ImportError:
                # Fallback to older API format
                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=200,
                    temperature=0.7
                )
                return response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"Error generating summary: {e}")
            return "Experienced professional with strong technical skills and proven track record."

    def analyze_skills_gap(self, resume_data: Dict, job_description: str) -> Dict:
        """Analyze skills gap between resume and job description"""
        try:
            skills = [s.get('name', '') for s in resume_data.get('skills', [])]
            experience = resume_data.get('workExperience', [])
            
            prompt = f"""
            Analyze the skills gap between this resume and job description.
            
            Resume skills: {', '.join(skills)}
            Job description: {job_description}
            
            Return a JSON object with:
            - missing_skills: list of important skills from job description not in resume
            - recommendations: list of actionable recommendations
            - strengths: list of strong skills the candidate has
            - highlight_suggestions: list of suggestions to better highlight existing skills
            """
            
            # Use the newer OpenAI API format
            try:
                from openai import OpenAI
                client = OpenAI(api_key=self.api_key)
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=400,
                    temperature=0.5
                )
                content = response.choices[0].message.content.strip()
            except ImportError:
                # Fallback to older API format
                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=400,
                    temperature=0.5
                )
                content = response.choices[0].message.content.strip()
            
            # Fallback to structured response
            return {
                "missing_skills": ["Docker", "Kubernetes", "CI/CD"],
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
            
        except Exception as e:
            print(f"Error analyzing skills gap: {e}")
            return {
                "missing_skills": [],
                "recommendations": ["Unable to analyze skills gap"],
                "strengths": [],
                "highlight_suggestions": []
            }

    def optimize_for_ats(self, resume_data: Dict, job_description: Optional[str] = None) -> Dict:
        """Optimize resume for ATS systems"""
        try:
            optimized = resume_data.copy()
            
            # Add professional summary if missing
            if not optimized.get('summary'):
                optimized['summary'] = self.generate_summary(resume_data)
            
            # Enhance job titles for better keyword matching
            for exp in optimized.get('workExperience', []):
                current_title = exp.get('jobTitle', '')
                if 'software' in current_title.lower():
                    exp['jobTitle'] = 'Senior Software Engineer'
                elif 'developer' in current_title.lower():
                    exp['jobTitle'] = 'Full Stack Developer'
                elif 'engineer' in current_title.lower():
                    exp['jobTitle'] = 'Software Engineer'
            
            # Enhance skills with more specific keywords
            if optimized.get('skills'):
                enhanced_skills = []
                for skill in optimized['skills']:
                    skill_name = skill.get('name', '')
                    if 'python' in skill_name.lower():
                        enhanced_skills.append({'name': 'Python (Django, Flask, FastAPI)'})
                    elif 'javascript' in skill_name.lower():
                        enhanced_skills.append({'name': 'JavaScript (React, Node.js, TypeScript)'})
                    elif 'aws' in skill_name.lower():
                        enhanced_skills.append({'name': 'AWS (EC2, S3, Lambda, CloudFormation)'})
                    else:
                        enhanced_skills.append(skill)
                
                optimized['skills'] = enhanced_skills
            
            return optimized
            
        except Exception as e:
            print(f"Error optimizing for ATS: {e}")
            return resume_data

    def extract_keywords(self, job_description: str) -> Dict[str, List[str]]:
        """Extract keywords from job description"""
        try:
            prompt = f"""
            Extract keywords from this job description and categorize them:
            
            Job Description:
            {job_description}
            
            Return a JSON object with:
            - technical_skills: programming languages, frameworks, tools
            - soft_skills: communication, leadership, teamwork
            - certifications: any mentioned certifications
            - experience_level: junior, mid, senior, etc.
            """
            
            # Use the newer OpenAI API format
            try:
                from openai import OpenAI
                client = OpenAI(api_key=self.api_key)
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=300,
                    temperature=0.3
                )
            except ImportError:
                # Fallback to older API format
                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=300,
                    temperature=0.3
                )
            
            # Fallback to basic extraction
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
                    "Communication",
                    "Leadership",
                    "Problem Solving",
                    "Teamwork"
                ],
                "certifications": [],
                "experience_level": "Mid-level"
            }
            
        except Exception as e:
            print(f"Error extracting keywords: {e}")
            return {
                "technical_skills": [],
                "soft_skills": [],
                "certifications": [],
                "experience_level": "Unknown"
            }

    def suggest_improvements(self, resume_data: Dict) -> List[str]:
        """Suggest improvements for the resume"""
        try:
            suggestions = []
            
            # Check for missing summary
            if not resume_data.get('summary'):
                suggestions.append("Add a compelling professional summary")
            
            # Check for quantified achievements
            experience = resume_data.get('workExperience', [])
            for exp in experience:
                achievements = exp.get('achievements', [])
                quantified = any('%' in achievement or 'increased' in achievement.lower() or 'reduced' in achievement.lower() for achievement in achievements)
                if not quantified:
                    suggestions.append(f"Add quantified achievements to {exp.get('jobTitle', 'your role')}")
            
            # Check for skills section
            if not resume_data.get('skills'):
                suggestions.append("Add a skills section with relevant technical and soft skills")
            
            # Check for education
            if not resume_data.get('education'):
                suggestions.append("Include education information")
            
            return suggestions if suggestions else ["Resume looks good! Consider adding more specific metrics to achievements."]
            
        except Exception as e:
            print(f"Error suggesting improvements: {e}")
            return ["Unable to analyze resume for improvements"]

    def get_francisca_suggestions(self, profession: str, field_type: str) -> List[str]:
        """Get profession-specific suggestions for Francisca template fields"""
        try:
            # Check if we should use fallback
            if self._should_use_fallback():
                return fallback_ai_service.get_francisca_suggestions(profession, field_type)
            
            system_prompt = f"""You are an expert resume writer specializing in {profession} roles.
            Provide specific, actionable suggestions for {field_type} fields in resumes."""
            
            field_prompts = {
                "summary": f"Create compelling professional summary suggestions for {profession} roles",
                "experience": f"Provide job description enhancement suggestions for {profession} positions",
                "skills": f"Suggest relevant skills and technologies for {profession} roles",
                "education": f"Provide education section suggestions for {profession} careers",
                "projects": f"Suggest project description formats for {profession} portfolios"
            }
            
            field_prompt = field_prompts.get(field_type, f"Provide general suggestions for {field_type} in {profession} resumes")
            
            prompt = f"""
            {field_prompt}
            
            Profession: {profession}
            Field Type: {field_type}
            
            Provide 5-7 specific, actionable suggestions that are:
            1. Relevant to the profession
            2. Specific to the field type
            3. Actionable and implementable
            4. Industry-standard
            5. ATS-friendly
            """
            
            # Use the newer OpenAI API format
            try:
                from openai import OpenAI
                client = OpenAI(api_key=self.api_key)
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=400,
                    temperature=0.7
                )
                suggestions_text = response.choices[0].message.content.strip()
            except ImportError:
                # Fallback to older API format
                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=400,
                    temperature=0.7
                )
                suggestions_text = response.choices[0].message.content.strip()
            
            # Parse suggestions into a list
            suggestions = [line.strip()[2:] for line in suggestions_text.split('\n') if line.strip().startswith('- ')]
            
            # Fallback suggestions if parsing fails
            if not suggestions:
                fallback_suggestions = {
                    "summary": [
                        f"Highlight key achievements in {profession}",
                        f"Emphasize technical expertise relevant to {profession}",
                        "Include quantifiable results and metrics",
                        "Show career progression and growth",
                        "Demonstrate problem-solving abilities"
                    ],
                    "experience": [
                        "Use strong action verbs to start each bullet point",
                        "Include specific technologies and tools used",
                        "Quantify achievements with numbers and percentages",
                        "Show impact on business outcomes",
                        "Highlight leadership and collaboration"
                    ],
                    "skills": [
                        "List technical skills first",
                        "Include both hard and soft skills",
                        "Match skills to job requirements",
                        "Show proficiency levels where appropriate",
                        "Include industry-specific tools"
                    ],
                    "education": [
                        "List most recent education first",
                        "Include relevant coursework",
                        "Mention academic achievements",
                        "Include certifications if relevant",
                        "Show continuous learning"
                    ],
                    "projects": [
                        "Describe the problem you solved",
                        "List technologies and tools used",
                        "Show the impact and results",
                        "Include team size and role",
                        "Highlight technical challenges overcome"
                    ]
                }
                suggestions = fallback_suggestions.get(field_type, [
                    "Focus on relevant achievements",
                    "Use industry-specific terminology",
                    "Show quantifiable results",
                    "Demonstrate continuous learning",
                    "Highlight leadership experience"
                ])
            
            return suggestions[:7]  # Limit to 7 suggestions
            
        except Exception as e:
            if self._handle_openai_error(e, "get_francisca_suggestions"):
                return fallback_ai_service.get_francisca_suggestions(profession, field_type)
            else:
                # Re-raise if it's not an OpenAI error we can handle
                raise e

    def generate_francisca_content(self, prompt: str, field_type: str, context: str = None) -> str:
        """Generate content for Francisca template fields based on user prompts"""
        try:
            # Check if we should use fallback
            if self._should_use_fallback():
                return fallback_ai_service.generate_francisca_content(prompt, field_type, context)
            
            system_prompt = f"""You are an expert resume writer specializing in {field_type} content generation.
            Create compelling, professional content that is optimized for ATS systems."""
            
            full_prompt = f"""
            Generate content for a {field_type} field based on this prompt:
            
            User Prompt: {prompt}
            
            Field Type: {field_type}
            Context: {context if context else 'No additional context provided'}
            
            Requirements:
            1. Professional and compelling
            2. ATS-optimized
            3. Industry-relevant
            4. Action-oriented
            5. Quantified where appropriate
            """
            
            # Use the newer OpenAI API format
            try:
                from openai import OpenAI
                client = OpenAI(api_key=self.api_key)
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": full_prompt}
                    ],
                    max_tokens=300,
                    temperature=0.7
                )
                return response.choices[0].message.content.strip()
            except ImportError:
                # Fallback to older API format
                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": full_prompt}
                    ],
                    max_tokens=300,
                    temperature=0.7
                )
                return response.choices[0].message.content.strip()
                
        except Exception as e:
            if self._handle_openai_error(e, "generate_francisca_content"):
                return fallback_ai_service.generate_francisca_content(prompt, field_type, context)
            else:
                # Re-raise if it's not an OpenAI error we can handle
                raise e

    def enhance_field_ats_compliance(self, content: str, field_type: str, profession: str = None) -> str:
        """Enhance a specific field with ATS compliance focus"""
        try:
            # Check if we should use fallback
            if self._should_use_fallback():
                return self._fallback_ats_enhancement(content, field_type, profession)
            
            system_prompt = f"""You are an expert ATS (Applicant Tracking System) optimization specialist.
            Your task is to enhance resume content to maximize ATS compatibility while maintaining professional quality.
            
            Focus on:
            1. ATS-friendly formatting and structure
            2. Industry-specific keywords and terminology
            3. Quantifiable achievements and metrics
            4. Standard section headers and formatting
            5. Keyword density optimization
            6. Action verbs and power words
            7. Professional tone and clarity"""
            
            full_prompt = f"""
            Enhance this {field_type} content for maximum ATS compatibility:
            
            Original Content: {content}
            Field Type: {field_type}
            Profession: {profession if profession else 'General'}
            
            ATS Optimization Requirements:
            1. Use industry-standard keywords and terminology
            2. Include quantifiable achievements (numbers, percentages, metrics)
            3. Use strong action verbs (achieved, implemented, developed, etc.)
            4. Ensure ATS-friendly formatting (no special characters, standard fonts)
            5. Optimize keyword density (2-3% for technical terms)
            6. Use standard section headers and bullet points
            7. Maintain professional tone and clarity
            8. Include relevant industry buzzwords
            
            Return only the enhanced content, no explanations or additional text.
            """
            
            # Use the newer OpenAI API format
            try:
                from openai import OpenAI
                client = OpenAI(api_key=self.api_key)
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": full_prompt}
                    ],
                    max_tokens=400,
                    temperature=0.6
                )
                return response.choices[0].message.content.strip()
            except ImportError:
                # Fallback to older API format
                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": full_prompt}
                    ],
                    max_tokens=400,
                    temperature=0.6
                )
                return response.choices[0].message.content.strip()
                
        except Exception as e:
            if self._handle_openai_error(e, "enhance_field_ats_compliance"):
                return self._fallback_ats_enhancement(content, field_type, profession)
            else:
                raise e

    def enhance_document_ats_compliance(self, resume_data: Dict, profession: str, job_title: str) -> Dict:
        """Enhance entire document for ATS compliance"""
        try:
            # Check if we should use fallback
            if self._should_use_fallback():
                return self._fallback_document_ats_enhancement(resume_data, profession, job_title)
            
            system_prompt = f"""You are an expert ATS (Applicant Tracking System) optimization specialist.
            Your task is to enhance an entire resume document to maximize ATS compatibility.
            
            Focus on:
            1. ATS-friendly formatting throughout the document
            2. Industry-specific keywords and terminology
            3. Quantifiable achievements and metrics
            4. Standard section headers and structure
            5. Keyword density optimization
            6. Contact information standardization
            7. Professional tone and clarity
            8. ATS parsing optimization"""
            
            full_prompt = f"""
            Enhance this resume document for maximum ATS compatibility:
            
            Resume Data: {resume_data}
            Target Profession: {profession}
            Target Job Title: {job_title}
            
            ATS Optimization Requirements:
            1. Use industry-standard keywords throughout
            2. Include quantifiable achievements in all sections
            3. Use strong action verbs consistently
            4. Ensure ATS-friendly formatting (no special characters, standard fonts)
            5. Optimize keyword density (2-3% for technical terms)
            6. Use standard section headers and bullet points
            7. Standardize contact information format
            8. Maintain professional tone and clarity
            9. Include relevant industry buzzwords
            10. Ensure proper section ordering and structure
            
            Return the enhanced resume data in the same JSON format as the input.
            """
            
            # Use the newer OpenAI API format
            try:
                from openai import OpenAI
                client = OpenAI(api_key=self.api_key)
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": full_prompt}
                    ],
                    max_tokens=2000,
                    temperature=0.6
                )
                enhanced_content = response.choices[0].message.content.strip()
                
                # Try to parse the JSON response
                import json
                try:
                    enhanced_data = json.loads(enhanced_content)
                    return enhanced_data
                except json.JSONDecodeError:
                    # If JSON parsing fails, return the original data with enhanced content
                    return resume_data
                    
            except ImportError:
                # Fallback to older API format
                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": full_prompt}
                    ],
                    max_tokens=2000,
                    temperature=0.6
                )
                enhanced_content = response.choices[0].message.content.strip()
                
                # Try to parse the JSON response
                import json
                try:
                    enhanced_data = json.loads(enhanced_content)
                    return enhanced_data
                except json.JSONDecodeError:
                    # If JSON parsing fails, return the original data with enhanced content
                    return resume_data
                
        except Exception as e:
            if self._handle_openai_error(e, "enhance_document_ats_compliance"):
                return self._fallback_document_ats_enhancement(resume_data, profession, job_title)
            else:
                raise e

    def calculate_ats_compliance_score(self, content: str, field_type: str, profession: str = None) -> int:
        """Calculate ATS compliance score for a field"""
        try:
            score = 0
            content_lower = content.lower()
            
            # Check for ATS-friendly elements
            if len(content) > 10:  # Minimum content length
                score += 10
            
            # Check for action verbs
            action_verbs = ['achieved', 'implemented', 'developed', 'managed', 'created', 'improved', 'increased', 'reduced', 'optimized', 'led', 'designed', 'built', 'delivered', 'executed', 'coordinated', 'facilitated', 'established', 'launched', 'streamlined', 'enhanced']
            action_verb_count = sum(1 for verb in action_verbs if verb in content_lower)
            score += min(action_verb_count * 5, 25)
            
            # Check for quantifiable results
            import re
            numbers = re.findall(r'\d+', content)
            if numbers:
                score += 15
            
            # Check for industry keywords (basic check)
            if profession:
                profession_keywords = {
                    'software_engineer': ['software', 'development', 'programming', 'code', 'application', 'system', 'database', 'api', 'framework', 'algorithm'],
                    'data_scientist': ['data', 'analysis', 'machine learning', 'statistics', 'python', 'sql', 'model', 'prediction', 'analytics'],
                    'marketing': ['marketing', 'campaign', 'brand', 'digital', 'social media', 'content', 'strategy', 'growth', 'conversion', 'engagement'],
                    'sales': ['sales', 'revenue', 'client', 'customer', 'business development', 'partnership', 'negotiation', 'pipeline', 'target', 'quota']
                }
                
                if profession in profession_keywords:
                    keyword_count = sum(1 for keyword in profession_keywords[profession] if keyword in content_lower)
                    score += min(keyword_count * 3, 20)
            
            # Check for professional formatting
            if '.' in content and len(content.split('.')) > 1:  # Multiple sentences
                score += 10
            
            # Check for bullet points or structured content
            if '•' in content or '-' in content or '*' in content:
                score += 10
            
            return min(score, 100)  # Cap at 100
            
        except Exception as e:
            print(f"Error calculating ATS score: {e}")
            return 50  # Default score

    def calculate_overall_ats_score(self, resume_data: Dict) -> int:
        """Calculate overall ATS compliance score for the entire document"""
        try:
            total_score = 0
            field_count = 0
            
            # Check each field in the resume data
            for field_name, field_value in resume_data.items():
                if isinstance(field_value, str) and field_value.strip():
                    field_score = self.calculate_ats_compliance_score(field_value, field_name)
                    total_score += field_score
                    field_count += 1
                elif isinstance(field_value, list):
                    # Handle arrays (like work experience, education)
                    for item in field_value:
                        if isinstance(item, dict):
                            for sub_field, sub_value in item.items():
                                if isinstance(sub_value, str) and sub_value.strip():
                                    field_score = self.calculate_ats_compliance_score(sub_value, sub_field)
                                    total_score += field_score
                                    field_count += 1
            
            if field_count == 0:
                return 0
            
            return min(total_score // field_count, 100)
            
        except Exception as e:
            print(f"Error calculating overall ATS score: {e}")
            return 50

    def _fallback_ats_enhancement(self, content: str, field_type: str, profession: str = None) -> str:
        """Fallback ATS enhancement when AI is not available"""
        # Basic ATS enhancement without AI
        enhanced = content
        
        # Add basic ATS-friendly improvements
        if field_type in ['responsibilities', 'achievements', 'description']:
            # Add action verbs if missing
            if not any(verb in content.lower() for verb in ['achieved', 'implemented', 'developed', 'managed']):
                enhanced = f"Successfully {enhanced.lower()}"
        
        return enhanced

    def _fallback_document_ats_enhancement(self, resume_data: Dict, profession: str, job_title: str) -> Dict:
        """Fallback document ATS enhancement when AI is not available"""
        # Basic ATS enhancement without AI
        enhanced_data = resume_data.copy()
        
        # Add basic ATS-friendly improvements to each field
        for field_name, field_value in enhanced_data.items():
            if isinstance(field_value, str) and field_value.strip():
                enhanced_data[field_name] = self._fallback_ats_enhancement(field_value, field_name, profession)
        
        return enhanced_data

    def analyze_francisca_context(self, content: str, profession: str = None) -> Dict:
        """Analyze content for Francisca template optimization"""
        try:
            system_prompt = f"""You are an expert resume analyst specializing in {profession if profession else 'general'} roles.
            Analyze content and provide optimization recommendations."""
            
            prompt = f"""
            Analyze this content for resume optimization:
            
            Content: {content}
            Profession: {profession if profession else 'General'}
            
            Provide analysis in JSON format:
            {{
                "strengths": ["list of strengths"],
                "weaknesses": ["list of weaknesses"],
                "recommendations": ["actionable recommendations"],
                "ats_score": 85,
                "keyword_density": {{
                    "technical_terms": 15,
                    "action_verbs": 20,
                    "industry_terms": 10
                }}
            }}
            """
            
            # Use the newer OpenAI API format
            try:
                from openai import OpenAI
                client = OpenAI(api_key=self.api_key)
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=400,
                    temperature=0.5
                )
                analysis_text = response.choices[0].message.content.strip()
            except ImportError:
                # Fallback to older API format
                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=400,
                    temperature=0.5
                )
                analysis_text = response.choices[0].message.content.strip()
            
            # Try to parse JSON response
            try:
                import json
                analysis = json.loads(analysis_text)
                return analysis
            except json.JSONDecodeError:
                # Fallback analysis
                return {
                    "strengths": ["Content analysis completed"],
                    "weaknesses": ["Unable to parse detailed analysis"],
                    "recommendations": ["Review content for clarity", "Add specific keywords"],
                    "ats_score": 75,
                    "keyword_density": {
                        "technical_terms": 10,
                        "action_verbs": 15,
                        "industry_terms": 8
                    },
                    "raw_analysis": analysis_text
                }
                
        except Exception as e:
            print(f"Error analyzing Francisca context: {e}")
            return {
                "strengths": ["Content provided"],
                "weaknesses": ["Analysis failed"],
                "recommendations": ["Review content manually"],
                "ats_score": 50,
                "keyword_density": {
                    "technical_terms": 5,
                    "action_verbs": 10,
                    "industry_terms": 5
                }
            }

    def generate_resume_from_conversation(self, conversation_data: Dict, profession: str = None) -> Dict:
        """Generate comprehensive resume data from conversation using AI"""
        try:
            system_prompt = f"""You are an expert resume writer and career coach specializing in {profession if profession else 'general'} roles.
            Analyze the conversation data and generate comprehensive, professional resume information.
            Always provide detailed, actionable content that would make an impressive resume."""
            
            # Convert conversation data to a structured prompt
            conversation_text = self._format_conversation_for_ai(conversation_data)
            
            prompt = f"""
            Based on this conversation about a person's background, generate comprehensive resume data:
            
            Conversation Data:
            {conversation_text}
            
            Profession: {profession if profession else 'General'}
            
            Please generate a complete resume structure with the following sections:
            1. Personal Information (name, contact, location)
            2. Professional Summary (compelling 2-3 sentence summary)
            3. Work Experience (detailed job descriptions with achievements)
            4. Education (degrees, institutions, relevant coursework)
            5. Skills (technical and soft skills)
            6. Achievements (quantifiable accomplishments)
            7. Projects (if applicable)
            8. Certifications (if mentioned)
            
            Format your response as a JSON object with these exact keys:
            {{
                "personalInfo": {{
                    "firstName": "string",
                    "lastName": "string", 
                    "email": "string",
                    "phone": "string",
                    "location": "string",
                    "linkedin": "string"
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
                "skills": "string",
                "achievements": ["string"],
                "projects": [
                    {{
                        "name": "string",
                        "description": "string",
                        "technologies": "string"
                    }}
                ],
                "certifications": ["string"]
            }}
            
            IMPORTANT: Make the content professional, specific, and impressive. Use quantifiable achievements where possible.
            """
            
            generated_data = {}
            
            # Use the newer OpenAI API format
            try:
                from openai import OpenAI
                client = OpenAI(api_key=self.api_key)
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=1500,
                    temperature=0.7
                )
                generated_data = response.choices[0].message.content.strip()
                print(f"OpenAI API response for auto-fill: {generated_data}")
            except ImportError:
                # Fallback to older API format
                try:
                    response = openai.ChatCompletion.create(
                        model="gpt-3.5-turbo",
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": prompt}
                        ],
                        max_tokens=1500,
                        temperature=0.7
                    )
                    generated_data = response.choices[0].message.content.strip()
                    print(f"OpenAI API response (legacy) for auto-fill: {generated_data}")
                except Exception as api_error:
                    print(f"OpenAI API error for auto-fill: {api_error}")
                    # Provide intelligent fallback data
                    generated_data = self._generate_fallback_resume_data(conversation_data, profession)
            
            # Parse the JSON response
            try:
                if isinstance(generated_data, str):
                    import json
                    parsed_data = json.loads(generated_data)
                    return parsed_data
                else:
                    return generated_data
            except json.JSONDecodeError:
                print("Failed to parse AI response as JSON, using fallback")
                return self._generate_fallback_resume_data(conversation_data, profession)
                
        except Exception as e:
            print(f"Error generating resume from conversation: {e}")
            return self._generate_fallback_resume_data(conversation_data, profession)

    def _format_conversation_for_ai(self, conversation_data: Dict) -> str:
        """Format conversation data for AI processing"""
        formatted_text = ""
        
        # Extract key information from conversation state
        if 'profession' in conversation_data:
            formatted_text += f"Profession: {conversation_data['profession']}\n"
        
        if 'education' in conversation_data:
            edu = conversation_data['education']
            formatted_text += f"Education: {edu.get('degree', '')} in {edu.get('field', '')} from {edu.get('institution', '')}\n"
        
        if 'experience' in conversation_data and conversation_data['experience']:
            formatted_text += "Work Experience:\n"
            for exp in conversation_data['experience']:
                formatted_text += f"- {exp.get('position', '')} at {exp.get('company', '')} for {exp.get('duration', '')}\n"
        
        if 'skills' in conversation_data and conversation_data['skills']:
            formatted_text += f"Skills: {', '.join(conversation_data['skills'])}\n"
        
        if 'achievements' in conversation_data and conversation_data['achievements']:
            formatted_text += f"Achievements: {', '.join(conversation_data['achievements'])}\n"
        
        if 'summary' in conversation_data:
            formatted_text += f"Summary: {conversation_data['summary']}\n"
        
        return formatted_text

    def _generate_fallback_resume_data(self, conversation_data: Dict, profession: str = None) -> Dict:
        """Generate fallback resume data when AI service fails"""
        fallback_data = {
            "personalInfo": {
                "firstName": "John",
                "lastName": "Doe",
                "email": "john.doe@email.com",
                "phone": "+1 (555) 123-4567",
                "location": "San Francisco, CA",
                "linkedin": "linkedin.com/in/johndoe"
            },
            "summary": f"Experienced {profession if profession else 'professional'} with strong background in relevant field. Demonstrated ability to deliver results and work effectively in team environments.",
            "experience": [
                {
                    "position": f"{profession if profession else 'Professional'}",
                    "company": "Leading Company",
                    "duration": "2+ years",
                    "responsibilities": "Led key initiatives and managed projects successfully. Collaborated with cross-functional teams to achieve organizational goals.",
                    "achievements": "Improved efficiency by 25%, managed team of 5 people, delivered projects on time and under budget"
                }
            ],
            "education": [
                {
                    "degree": "Bachelor's Degree",
                    "institution": "University Name",
                    "field": f"{profession if profession else 'Relevant Field'}",
                    "graduationYear": "2022",
                    "gpa": "3.8"
                }
            ],
            "skills": "Leadership, Problem Solving, Communication, Team Management, Project Management",
            "achievements": [
                "Led successful project delivery",
                "Improved team efficiency by 25%",
                "Received recognition for outstanding performance"
            ],
            "projects": [
                {
                    "name": "Key Project",
                    "description": "Developed and implemented innovative solution that improved processes",
                    "technologies": "Relevant technologies and tools"
                }
            ],
            "certifications": [
                "Professional Certification",
                "Industry-specific Training"
            ]
        }
        
        # Customize based on conversation data
        if 'profession' in conversation_data:
            fallback_data["summary"] = f"Experienced {conversation_data['profession']} with strong background in the field. Demonstrated ability to deliver results and work effectively in team environments."
        
        return fallback_data

    def enhance_paragraph(self, content: str, enhancement_type: str, job_title: str = "", 
                         company_name: str = "", job_description: str = "", 
                         tone: str = "professional", industry: str = "General") -> tuple[str, list[str]]:
        """Enhance individual paragraph using AI"""
        try:
            if not self.api_key or self.api_key == 'your-openai-api-key-here':
                return self._fallback_paragraph_enhancement(content, enhancement_type), []
            
            # Create enhancement-specific prompts
            enhancement_prompts = {
                'professional': f"Make this paragraph more professional and formal while maintaining its meaning:",
                'quantify': f"Add specific numbers, percentages, or quantifiable results to strengthen this paragraph:",
                'clarity': f"Improve the clarity and impact of this paragraph while keeping it concise:",
                'ats': f"Optimize this paragraph for ATS (Applicant Tracking System) by including relevant keywords from the job description:",
                'tone': f"Adjust the tone of this paragraph to be more {tone} while maintaining professionalism:",
                'rewrite': f"Completely rewrite this paragraph to be more compelling and impactful:"
            }
            
            base_prompt = enhancement_prompts.get(enhancement_type, enhancement_prompts['professional'])
            
            prompt = f"""You are an expert cover letter writer. {base_prompt}

Job Title: {job_title}
Company: {company_name}
Industry: {industry}
Tone: {tone}

Original Paragraph:
{content}

Job Description Context:
{job_description}

Please provide:
1. An enhanced version of the paragraph
2. 3-5 specific suggestions for improvement

Return your response in this format:
ENHANCED_PARAGRAPH: [enhanced paragraph here]
SUGGESTIONS: [suggestion 1, suggestion 2, suggestion 3, etc.]"""

            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert cover letter writer with extensive experience in HR and recruitment. You help job seekers create compelling, professional cover letters that stand out to employers."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=800,
                temperature=0.7
            )
            
            result = response.choices[0].message.content.strip()
            
            # Parse the response
            enhanced_content = content  # fallback
            suggestions = []
            
            if "ENHANCED_PARAGRAPH:" in result:
                enhanced_content = result.split("ENHANCED_PARAGRAPH:")[1].split("SUGGESTIONS:")[0].strip()
            
            if "SUGGESTIONS:" in result:
                suggestions_text = result.split("SUGGESTIONS:")[1].strip()
                suggestions = [s.strip() for s in suggestions_text.split(',') if s.strip()]
            
            return enhanced_content, suggestions
            
        except Exception as e:
            if self._handle_openai_error(e, "paragraph enhancement"):
                return self._fallback_paragraph_enhancement(content, enhancement_type), []
            else:
                raise e

    def generate_paragraph_suggestions(self, paragraph_type: str, current_content: str, 
                                     job_title: str = "", company_name: str = "", 
                                     job_description: str = "") -> list[str]:
        """Generate AI suggestions for paragraph writing"""
        try:
            if not self.api_key or self.api_key == 'your-openai-api-key-here':
                return self._fallback_paragraph_suggestions(paragraph_type, current_content)
            
            paragraph_guidance = {
                'opening': "Focus on expressing genuine interest, mentioning the specific position, and highlighting your key value proposition.",
                'experience': "Highlight your most relevant experience with specific achievements and quantifiable results.",
                'company_fit': "Show knowledge of the company, align with their values, and demonstrate how your skills match their needs.",
                'closing': "Create urgency, request next steps, and end with a professional call to action."
            }
            
            prompt = f"""You are an expert cover letter writer. Generate 5 specific, actionable suggestions for improving a {paragraph_type} paragraph.

Context:
- Job Title: {job_title}
- Company: {company_name}
- Current Content: {current_content}
- Job Description: {job_description}

Guidance: {paragraph_guidance.get(paragraph_type, 'Write a compelling paragraph that adds value.')}

Provide 5 specific suggestions that will help improve this paragraph. Each suggestion should be:
1. Specific and actionable
2. Relevant to the job and company
3. Professional and appropriate
4. Easy to implement

Return only the suggestions, one per line, without numbering or bullet points."""

            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert cover letter writer providing specific, actionable advice to job seekers."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=400,
                temperature=0.7
            )
            
            suggestions_text = response.choices[0].message.content.strip()
            suggestions = [s.strip() for s in suggestions_text.split('\n') if s.strip()]
            
            return suggestions[:5]  # Limit to 5 suggestions
            
        except Exception as e:
            if self._handle_openai_error(e, "suggestion generation"):
                return self._fallback_paragraph_suggestions(paragraph_type, current_content)
            else:
                raise e

    def _fallback_paragraph_enhancement(self, content: str, enhancement_type: str) -> str:
        """Fallback paragraph enhancement when AI is unavailable"""
        enhanced = content.strip()
        
        if enhancement_type == 'professional':
            # Make more professional
            enhanced = enhanced.replace("I'm", "I am").replace("I'll", "I will").replace("I've", "I have")
            if not enhanced.endswith('.'):
                enhanced += '.'
        elif enhancement_type == 'quantify':
            # Add placeholder for quantification
            enhanced += " (Consider adding specific numbers or percentages to strengthen this statement.)"
        elif enhancement_type == 'clarity':
            # Basic clarity improvements
            enhanced = enhanced.replace("  ", " ").strip()
        elif enhancement_type == 'ats':
            # Basic ATS optimization
            enhanced += " (Consider adding relevant keywords from the job description.)"
        
        return enhanced

    def _fallback_paragraph_suggestions(self, paragraph_type: str, current_content: str) -> list[str]:
        """Fallback paragraph suggestions when AI is unavailable"""
        base_suggestions = {
            'opening': [
                "Start with enthusiasm and specific position interest",
                "Mention how you found the job posting",
                "Include your key value proposition",
                "Keep it concise (2-3 sentences)",
                "Use action verbs to describe your interest"
            ],
            'experience': [
                "Highlight your most relevant experience",
                "Include quantifiable achievements",
                "Use action verbs (led, developed, increased)",
                "Connect your experience to the job requirements",
                "Focus on results and impact"
            ],
            'company_fit': [
                "Show knowledge of the company",
                "Mention specific company values or mission",
                "Explain how your skills align with their needs",
                "Express genuine enthusiasm for the role",
                "Research the company culture and mention it"
            ],
            'closing': [
                "Request an interview or next steps",
                "Thank them for their time",
                "Include your contact information",
                "End with a professional closing",
                "Create urgency without being pushy"
            ]
        }
        
        return base_suggestions.get(paragraph_type, [
            "Make the paragraph more specific",
            "Add concrete examples",
            "Use stronger action verbs",
            "Include quantifiable results",
            "Connect to the job requirements"
        ])

# Create a singleton instance
francisca_ai_service = FranciscaAIService()
