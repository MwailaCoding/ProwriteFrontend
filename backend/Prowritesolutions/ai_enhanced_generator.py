"""
AI-enhanced version of the Professional Francisca PDF Generator
"""

from francisca_pdf_generator import ProfessionalFranciscaPDFGenerator
from ai_resume_enhancer import AIResumeEnhancer

class AIEnhancedResumeGenerator(ProfessionalFranciscaPDFGenerator):
    def __init__(self, openai_api_key=None, theme_name="professional"):
        """Initialize with optional OpenAI API key and theme"""
        super().__init__(theme_name)
        self.ai_enhancer = AIResumeEnhancer(openai_api_key)

    def generate_ai_enhanced_resume(self, resume_data, output_path, 
                                  job_description=None, industry=None):
        """Generate resume with AI enhancements"""
        # Enhance content with AI
        enhanced_data = self.ai_enhancer.enhance_resume(
            resume_data,
            job_description,
            industry
        )
        
        # Generate PDF
        success = self.generate_resume_pdf(enhanced_data, output_path)
        
        # Return enhanced data and analysis
        result = {
            "pdf_path": output_path,
            "enhanced_data": enhanced_data,
        }
        
        if job_description and "skills_analysis" in enhanced_data:
            result["skills_analysis"] = enhanced_data["skills_analysis"]
            result["job_keywords"] = enhanced_data.get("job_keywords", [])
            
        return result

    def get_design_recommendations(self, resume_data):
        """Get AI-powered design recommendations"""
        current_design = {
            "font_family": "Helvetica",
            "color_scheme": "Professional blue",
            "layout": "Single column with sections",
            "spacing": "Standard resume spacing",
            "theme": self.current_theme,
            "margins": {
                "top": f"{self.margins[0]/inch} inches",
                "bottom": f"{self.margins[1]/inch} inches",
                "left": f"{self.margins[2]/inch} inches",
                "right": f"{self.margins[3]/inch} inches"
            }
        }
        
        return self.ai_enhancer.suggest_design_improvements(resume_data, current_design)
