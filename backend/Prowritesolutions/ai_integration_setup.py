"""
AI Integration Setup and Configuration
Complete setup for real AI integration with OpenAI and other AI services
"""

import os
import sys
import json
import requests
from typing import Dict, Any, Optional
import openai
from datetime import datetime

class AIIntegrationSetup:
    def __init__(self):
        self.ai_api_key = None
        self.ai_services_status = {}
        self.test_results = {}
        
    def setup_environment(self):
        """Setup environment variables for AI integration"""
        # Check for existing .env file
        env_file_path = os.path.join(os.path.dirname(__file__), '.env')
        
        if not os.path.exists(env_file_path):
            env_content = """# AI Integration Configuration
AI_API_KEY=your-ai-api-key-here

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=prowrite_db

# Flask Configuration
SECRET_KEY=admin-secret-key-12345
JWT_SECRET_KEY=admin-secret-key-12345

# File Upload Configuration
UPLOAD_FOLDER=uploads
THUMBNAIL_FOLDER=thumbnails

# Server Configuration
FLASK_ENV=development
FLASK_DEBUG=True
"""
            try:
                with open(env_file_path, 'w') as f:
                    f.write(env_content)
            except Exception as e:
                import logging
                logging.error(f"Failed to create .env file: {e}")
                return False
        
        # Load environment variables
        from dotenv import load_dotenv
        load_dotenv()
        
        # Get AI API key
        self.ai_api_key = os.getenv('AI_API_KEY')
        
        if not self.ai_api_key or self.ai_api_key == 'your-ai-api-key-here':
            import logging
            logging.warning("AI API key not configured")
            return False
        
        return True
    
    def test_openai_connection(self) -> bool:
        """Test OpenAI API connection"""
        print("🧪 Testing OpenAI API connection...")
        
        if not self.openai_api_key:
            print("❌ No OpenAI API key configured")
            return False
        
        try:
            # Test with OpenAI client
            client = openai.OpenAI(api_key=self.openai_api_key)
            
            # Test API call
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": "Hello, this is a test."}],
                max_tokens=10
            )
            
            if response.choices[0].message.content:
                print("✅ OpenAI API connection successful")
                self.ai_services_status['openai'] = True
                return True
            else:
                print("❌ OpenAI API returned empty response")
                return False
                
        except Exception as e:
            print(f"❌ OpenAI API connection failed: {e}")
            self.ai_services_status['openai'] = False
            return False
    
    def test_ai_services(self) -> Dict[str, Any]:
        """Test all AI services"""
        print("🧪 Testing AI Services...")
        
        test_results = {}
        
        # Test AI Service
        try:
            from ai_service import RealAIService
            ai_service = RealAIService()
            
            # Test achievement enhancement
            test_bullets = ["Managed team of 5 developers", "Implemented new features"]
            enhanced = ai_service.enhance_achievements(test_bullets, "Software Engineer")
            
            if enhanced and len(enhanced) > 0:
                test_results['ai_service'] = {
                    'status': 'success',
                    'message': 'AI service working correctly',
                    'test_data': enhanced[:2]  # Show first 2 enhanced bullets
                }
                print("✅ AI Service: Working")
            else:
                test_results['ai_service'] = {
                    'status': 'error',
                    'message': 'AI service returned empty results'
                }
                print("❌ AI Service: Failed")
                
        except Exception as e:
            test_results['ai_service'] = {
                'status': 'error',
                'message': f'AI service error: {str(e)}'
            }
            print(f"❌ AI Service: {e}")
        
        # Test ATS Analysis Service
        try:
            from ats_analysis_service import ATSAnalysisService
            ats_service = ATSAnalysisService()
            
            test_content = "Experienced software engineer with 5 years of experience in Python and JavaScript."
            analysis = ats_service.analyze_ats_compatibility(test_content, ["Python", "JavaScript"])
            
            if analysis and 'score' in analysis:
                test_results['ats_service'] = {
                    'status': 'success',
                    'message': 'ATS analysis working correctly',
                    'test_data': {'score': analysis['score']}
                }
                print("✅ ATS Analysis Service: Working")
            else:
                test_results['ats_service'] = {
                    'status': 'error',
                    'message': 'ATS analysis returned invalid results'
                }
                print("❌ ATS Analysis Service: Failed")
                
        except Exception as e:
            test_results['ats_service'] = {
                'status': 'error',
                'message': f'ATS service error: {str(e)}'
            }
            print(f"❌ ATS Analysis Service: {e}")
        
        # Test Job Description Analyzer
        try:
            from job_description_analyzer import JobDescriptionAnalyzer
            jd_analyzer = JobDescriptionAnalyzer()
            
            test_jd = "We are looking for a Python developer with experience in Django and React."
            analysis = jd_analyzer.analyze_job_description(test_jd)
            
            if analysis and 'keywords' in analysis:
                test_results['jd_analyzer'] = {
                    'status': 'success',
                    'message': 'Job description analyzer working correctly',
                    'test_data': {'keywords': analysis['keywords'][:3]}
                }
                print("✅ Job Description Analyzer: Working")
            else:
                test_results['jd_analyzer'] = {
                    'status': 'error',
                    'message': 'Job description analyzer returned invalid results'
                }
                print("❌ Job Description Analyzer: Failed")
                
        except Exception as e:
            test_results['jd_analyzer'] = {
                'status': 'error',
                'message': f'JD analyzer error: {str(e)}'
            }
            print(f"❌ Job Description Analyzer: {e}")
        
        # Test Advanced Content Generator
        try:
            from advanced_content_generator import AdvancedContentGenerator
            content_gen = AdvancedContentGenerator()
            
            test_prompt = "Generate a professional summary for a software engineer"
            content = content_gen.generate_content(test_prompt, "professional")
            
            if content and len(content) > 50:
                test_results['content_generator'] = {
                    'status': 'success',
                    'message': 'Content generator working correctly',
                    'test_data': {'content_length': len(content)}
                }
                print("✅ Content Generator: Working")
            else:
                test_results['content_generator'] = {
                    'status': 'error',
                    'message': 'Content generator returned insufficient content'
                }
                print("❌ Content Generator: Failed")
                
        except Exception as e:
            test_results['content_generator'] = {
                'status': 'error',
                'message': f'Content generator error: {str(e)}'
            }
            print(f"❌ Content Generator: {e}")
        
        self.test_results = test_results
        return test_results
    
    def generate_ai_config_report(self) -> Dict[str, Any]:
        """Generate comprehensive AI configuration report"""
        print("📊 Generating AI Configuration Report...")
        
        report = {
            'timestamp': datetime.now().isoformat(),
            'environment_setup': {
                'env_file_exists': os.path.exists(os.path.join(os.path.dirname(__file__), '.env')),
                'openai_api_key_configured': bool(self.openai_api_key and self.openai_api_key != 'your-openai-api-key-here'),
                'api_key_length': len(self.openai_api_key) if self.openai_api_key else 0
            },
            'ai_services_status': self.ai_services_status,
            'test_results': self.test_results,
            'summary': {
                'total_services': len(self.test_results),
                'working_services': len([r for r in self.test_results.values() if r['status'] == 'success']),
                'failed_services': len([r for r in self.test_results.values() if r['status'] == 'error']),
                'success_rate': len([r for r in self.test_results.values() if r['status'] == 'success']) / len(self.test_results) * 100 if self.test_results else 0
            }
        }
        
        return report
    
    def setup_complete_ai_integration(self) -> bool:
        """Complete AI integration setup"""
        print("🚀 Setting up Complete AI Integration...")
        
        # Step 1: Setup environment
        if not self.setup_environment():
            print("❌ Environment setup failed")
            return False
        
        # Step 2: Test OpenAI connection
        if not self.test_openai_connection():
            print("❌ OpenAI connection failed")
            return False
        
        # Step 3: Test all AI services
        test_results = self.test_ai_services()
        
        # Step 4: Generate report
        report = self.generate_ai_config_report()
        
        # Step 5: Save report
        report_file = os.path.join(os.path.dirname(__file__), 'ai_integration_report.json')
        try:
            with open(report_file, 'w') as f:
                json.dump(report, f, indent=2)
            print(f"✅ AI integration report saved to: {report_file}")
        except Exception as e:
            print(f"⚠️  Failed to save report: {e}")
        
        # Step 6: Print summary
        print("\n" + "="*50)
        print("🎉 AI INTEGRATION SETUP COMPLETE")
        print("="*50)
        print(f"📊 Success Rate: {report['summary']['success_rate']:.1f}%")
        print(f"✅ Working Services: {report['summary']['working_services']}/{report['summary']['total_services']}")
        print(f"❌ Failed Services: {report['summary']['failed_services']}")
        print("="*50)
        
        if report['summary']['success_rate'] >= 75:
            print("🎯 AI Integration Status: READY FOR PRODUCTION")
            return True
        elif report['summary']['success_rate'] >= 50:
            print("⚠️  AI Integration Status: PARTIALLY WORKING")
            return True
        else:
            print("❌ AI Integration Status: NEEDS CONFIGURATION")
            return False

def main():
    """Main function to run AI integration setup"""
    print("🤖 ProWrite AI Integration Setup")
    print("="*50)
    
    setup = AIIntegrationSetup()
    success = setup.setup_complete_ai_integration()
    
    if success:
        print("\n✅ AI Integration setup completed successfully!")
        print("🚀 You can now use all AI-powered features in ProWrite")
    else:
        print("\n❌ AI Integration setup failed")
        print("📋 Please check the configuration and try again")
    
    return success

if __name__ == "__main__":
    main()







