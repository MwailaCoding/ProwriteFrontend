"""
Francisca AI Question Engine - Advanced structured resume building
Guides users through step-by-step resume creation with real-time enhancement
"""

from typing import Dict, List, Optional, Any
import json
from datetime import datetime

class FranciscaQuestionEngine:
    def __init__(self):
        """Initialize the question engine"""
        self.current_step = 0
        self.user_responses = {}
        self.completed_steps = set()
        self.question_flow = self._initialize_question_flow()
        print("✅ Francisca Question Engine initialized")
    
    def _initialize_question_flow(self) -> List[Dict]:
        """Initialize the structured question flow"""
        return [
            {
                "step": "personal_info",
                "title": "Personal Information",
                "description": "Let's start with your basic information",
                "fields": [
                    {
                        "field": "firstName",
                        "question": "What's your first name?",
                        "type": "text",
                        "required": True,
                        "placeholder": "Enter your first name",
                        "enhancement_hint": "Use your full legal first name"
                    },
                    {
                        "field": "lastName", 
                        "question": "What's your last name?",
                        "type": "text",
                        "required": True,
                        "placeholder": "Enter your last name",
                        "enhancement_hint": "Use your full legal last name"
                    },
                    {
                        "field": "email",
                        "question": "What's your professional email address?",
                        "type": "email",
                        "required": True,
                        "placeholder": "your.email@example.com",
                        "enhancement_hint": "Use a professional email address"
                    },
                    {
                        "field": "phone",
                        "question": "What's your phone number?",
                        "type": "tel",
                        "required": True,
                        "placeholder": "+1 (555) 123-4567",
                        "enhancement_hint": "Include country code for international format"
                    },
                    {
                        "field": "location",
                        "question": "Where are you located? (City, State/Country)",
                        "type": "text",
                        "required": True,
                        "placeholder": "New York, NY",
                        "enhancement_hint": "Include city and state/country for better visibility"
                    },
                    {
                        "field": "linkedin",
                        "question": "What's your LinkedIn profile URL? (optional)",
                        "type": "url",
                        "required": False,
                        "placeholder": "https://linkedin.com/in/yourprofile",
                        "enhancement_hint": "Include your LinkedIn profile for networking"
                    }
                ]
            },
            {
                "step": "profession",
                "title": "Professional Focus",
                "description": "Tell us about your career focus",
                "fields": [
                    {
                        "field": "profession",
                        "question": "What's your profession or field?",
                        "type": "select",
                        "required": True,
                        "options": [
                            "Software Engineer", "Data Scientist", "Product Manager",
                            "Marketing Manager", "Sales Representative", "Designer",
                            "Project Manager", "Business Analyst", "Consultant",
                            "Other"
                        ],
                        "enhancement_hint": "Choose the field that best describes your expertise"
                    },
                    {
                        "field": "experienceLevel",
                        "question": "What's your experience level?",
                        "type": "select",
                        "required": True,
                        "options": [
                            "Entry Level (0-2 years)",
                            "Mid Level (3-5 years)", 
                            "Senior Level (6-10 years)",
                            "Executive Level (10+ years)"
                        ],
                        "enhancement_hint": "This helps us tailor questions to your level"
                    },
                    {
                        "field": "targetRole",
                        "question": "What specific role are you targeting?",
                        "type": "text",
                        "required": True,
                        "placeholder": "e.g., Senior Software Engineer, Product Manager",
                        "enhancement_hint": "Be specific about your target position"
                    }
                ]
            },
            {
                "step": "education",
                "title": "Education Background",
                "description": "Tell us about your educational background",
                "fields": [
                    {
                        "field": "highestDegree",
                        "question": "What's your highest degree?",
                        "type": "select",
                        "required": True,
                        "options": [
                            "High School Diploma",
                            "Associate's Degree",
                            "Bachelor's Degree",
                            "Master's Degree",
                            "Doctorate (PhD)",
                            "Professional Certification"
                        ],
                        "enhancement_hint": "Select your highest completed degree"
                    },
                    {
                        "field": "degreeField",
                        "question": "What field did you study?",
                        "type": "text",
                        "required": True,
                        "placeholder": "e.g., Computer Science, Business Administration",
                        "enhancement_hint": "Include your major or field of study"
                    },
                    {
                        "field": "university",
                        "question": "Which university did you attend?",
                        "type": "text",
                        "required": True,
                        "placeholder": "e.g., Stanford University",
                        "enhancement_hint": "Include the full university name"
                    },
                    {
                        "field": "graduationYear",
                        "question": "When did you graduate?",
                        "type": "number",
                        "required": True,
                        "placeholder": "2020",
                        "enhancement_hint": "Include your graduation year"
                    },
                    {
                        "field": "gpa",
                        "question": "What was your GPA? (optional)",
                        "type": "number",
                        "required": False,
                        "placeholder": "3.8",
                        "enhancement_hint": "Only include if 3.5 or higher"
                    }
                ]
            },
            {
                "step": "experience",
                "title": "Work Experience",
                "description": "Tell us about your professional experience",
                "fields": [
                    {
                        "field": "currentJob",
                        "question": "What's your current job title?",
                        "type": "text",
                        "required": True,
                        "placeholder": "e.g., Software Engineer",
                        "enhancement_hint": "Use your official job title"
                    },
                    {
                        "field": "currentCompany",
                        "question": "Where do you currently work?",
                        "type": "text",
                        "required": True,
                        "placeholder": "e.g., Google, Microsoft",
                        "enhancement_hint": "Include the company name"
                    },
                    {
                        "field": "currentDuration",
                        "question": "How long have you been in this role?",
                        "type": "text",
                        "required": True,
                        "placeholder": "e.g., 2 years, 6 months",
                        "enhancement_hint": "Include duration in years and months"
                    },
                    {
                        "field": "keyResponsibilities",
                        "question": "What are your main responsibilities? (3-5 key points)",
                        "type": "textarea",
                        "required": True,
                        "placeholder": "• Lead development of web applications\n• Mentor junior developers\n• Collaborate with cross-functional teams",
                        "enhancement_hint": "Use bullet points and action verbs"
                    },
                    {
                        "field": "keyAchievements",
                        "question": "What are your biggest achievements in this role?",
                        "type": "textarea",
                        "required": True,
                        "placeholder": "• Increased team productivity by 30%\n• Led migration of legacy system\n• Reduced bug reports by 50%",
                        "enhancement_hint": "Include quantifiable results and metrics"
                    }
                ]
            },
            {
                "step": "skills",
                "title": "Skills & Expertise",
                "description": "What skills do you bring to the table?",
                "fields": [
                    {
                        "field": "technicalSkills",
                        "question": "What are your technical skills?",
                        "type": "tags",
                        "required": True,
                        "placeholder": "e.g., Python, JavaScript, React, AWS",
                        "enhancement_hint": "Include programming languages, tools, and technologies"
                    },
                    {
                        "field": "softSkills",
                        "question": "What are your key soft skills?",
                        "type": "tags",
                        "required": True,
                        "placeholder": "e.g., Leadership, Communication, Problem Solving",
                        "enhancement_hint": "Include interpersonal and professional skills"
                    },
                    {
                        "field": "certifications",
                        "question": "Do you have any relevant certifications? (optional)",
                        "type": "textarea",
                        "required": False,
                        "placeholder": "• AWS Certified Solutions Architect\n• Google Analytics Certified",
                        "enhancement_hint": "Include professional certifications and licenses"
                    }
                ]
            },
            {
                "step": "achievements",
                "title": "Key Achievements",
                "description": "Highlight your biggest accomplishments",
                "fields": [
                    {
                        "field": "majorAchievements",
                        "question": "What are your 3-5 biggest career achievements?",
                        "type": "textarea",
                        "required": True,
                        "placeholder": "• Led team of 10 developers to deliver $2M project\n• Increased company revenue by 25%\n• Published research paper in top-tier journal",
                        "enhancement_hint": "Focus on quantifiable results and impact"
                    },
                    {
                        "field": "awards",
                        "question": "Have you received any awards or recognition? (optional)",
                        "type": "textarea",
                        "required": False,
                        "placeholder": "• Employee of the Year 2023\n• Best Innovation Award",
                        "enhancement_hint": "Include professional awards and recognition"
                    }
                ]
            },
            {
                "step": "summary",
                "title": "Professional Summary",
                "description": "Create your professional summary",
                "fields": [
                    {
                        "field": "summary",
                        "question": "Write a brief professional summary (2-3 sentences)",
                        "type": "textarea",
                        "required": True,
                        "placeholder": "Experienced software engineer with 5+ years developing scalable web applications. Passionate about clean code and team collaboration. Seeking senior role to lead technical initiatives.",
                        "enhancement_hint": "Highlight your experience, skills, and career goals"
                    }
                ]
            }
        ]
    
    def get_current_question(self) -> Dict:
        """Get the current question step"""
        if self.current_step < len(self.question_flow):
            return self.question_flow[self.current_step]
        return None
    
    def get_next_question(self) -> Optional[Dict]:
        """Get the next question step"""
        self.current_step += 1
        if self.current_step < len(self.question_flow):
            return self.question_flow[self.current_step]
        return None
    
    def get_previous_question(self) -> Optional[Dict]:
        """Get the previous question step"""
        if self.current_step > 0:
            self.current_step -= 1
            return self.question_flow[self.current_step]
        return None
    
    def submit_answer(self, field: str, answer: str, enhanced_answer: str = None) -> Dict:
        """Submit an answer for a field"""
        self.user_responses[field] = {
            "original": answer,
            "enhanced": enhanced_answer or answer,
            "timestamp": datetime.now().isoformat()
        }
        
        # Mark current step as completed if all required fields are filled
        current_step = self.get_current_question()
        if current_step:
            required_fields = [f["field"] for f in current_step["fields"] if f.get("required", False)]
            completed_required = all(field in self.user_responses for field in required_fields)
            
            if completed_required:
                self.completed_steps.add(current_step["step"])
        
        return {
            "success": True,
            "field": field,
            "answer": enhanced_answer or answer,
            "step_completed": current_step["step"] if current_step else None,
            "progress": self.get_progress()
        }
    
    def get_progress(self) -> Dict:
        """Get current progress information"""
        total_steps = len(self.question_flow)
        completed_steps = len(self.completed_steps)
        current_step_name = self.question_flow[self.current_step]["step"] if self.current_step < len(self.question_flow) else None
        
        return {
            "current_step": self.current_step,
            "current_step_name": current_step_name,
            "total_steps": total_steps,
            "completed_steps": completed_steps,
            "progress_percentage": (completed_steps / total_steps) * 100,
            "is_complete": completed_steps == total_steps
        }
    
    def get_resume_data(self) -> Dict:
        """Get the complete resume data for auto-filling"""
        resume_data = {}
        
        for field, response in self.user_responses.items():
            resume_data[field] = response["enhanced"]
        
        return resume_data
    
    def get_step_summary(self, step_name: str) -> Dict:
        """Get a summary of a specific step"""
        step_data = next((step for step in self.question_flow if step["step"] == step_name), None)
        if not step_data:
            return None
        
        step_responses = {}
        for field in step_data["fields"]:
            field_name = field["field"]
            if field_name in self.user_responses:
                step_responses[field_name] = self.user_responses[field_name]["enhanced"]
        
        return {
            "step": step_name,
            "title": step_data["title"],
            "responses": step_responses,
            "is_complete": step_name in self.completed_steps
        }
    
    def reset_flow(self):
        """Reset the question flow"""
        self.current_step = 0
        self.user_responses = {}
        self.completed_steps = set()
    
    def jump_to_step(self, step_name: str) -> bool:
        """Jump to a specific step"""
        step_index = next((i for i, step in enumerate(self.question_flow) if step["step"] == step_name), -1)
        if step_index >= 0:
            self.current_step = step_index
            return True
        return False

# Create singleton instance
francisca_question_engine = FranciscaQuestionEngine()









