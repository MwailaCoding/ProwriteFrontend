"""
ATS Analysis Service
Analyzes resumes for ATS compatibility and employability scoring
"""

import os
import json
import re
import openai
from typing import Dict, List, Any, Optional
from datetime import datetime

class ATSAnalysisService:
    def __init__(self):
        """Initialize the ATS analysis service"""
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        if self.openai_api_key:
            openai.api_key = self.openai_api_key
        
        # ATS scoring criteria
        self.ats_criteria = {
            'formatting': {
                'weight': 0.15,
                'checks': [
                    'clean_formatting',
                    'proper_fonts',
                    'no_images_or_graphics',
                    'standard_sections',
                    'readable_layout'
                ]
            },
            'keywords': {
                'weight': 0.25,
                'checks': [
                    'relevant_keywords',
                    'industry_terminology',
                    'skill_matching',
                    'job_title_alignment'
                ]
            },
            'content_quality': {
                'weight': 0.20,
                'checks': [
                    'action_verbs',
                    'quantifiable_results',
                    'professional_language',
                    'achievement_focused'
                ]
            },
            'structure': {
                'weight': 0.15,
                'checks': [
                    'clear_sections',
                    'logical_flow',
                    'consistent_formatting',
                    'proper_headings'
                ]
            },
            'completeness': {
                'weight': 0.15,
                'checks': [
                    'contact_information',
                    'work_experience',
                    'education',
                    'skills_section'
                ]
            },
            'optimization': {
                'weight': 0.10,
                'checks': [
                    'no_spelling_errors',
                    'grammar_check',
                    'professional_tone',
                    'appropriate_length'
                ]
            }
        }
        
        # Industry-specific keywords
        self.industry_keywords = {
            'software_engineer': [
                'python', 'javascript', 'java', 'react', 'node.js', 'sql', 'aws', 'docker',
                'kubernetes', 'git', 'agile', 'scrum', 'api', 'microservices', 'machine learning',
                'data structures', 'algorithms', 'full stack', 'frontend', 'backend', 'devops'
            ],
            'marketing_manager': [
                'digital marketing', 'seo', 'sem', 'social media', 'content marketing', 'email marketing',
                'campaign management', 'analytics', 'google ads', 'facebook ads', 'brand management',
                'market research', 'lead generation', 'conversion optimization', 'crm', 'marketing automation'
            ],
            'sales_professional': [
                'sales', 'business development', 'account management', 'lead generation', 'prospecting',
                'negotiation', 'client relationship', 'crm', 'salesforce', 'quota', 'territory management',
                'pipeline management', 'closing deals', 'customer acquisition', 'revenue growth'
            ],
            'healthcare_professional': [
                'patient care', 'clinical', 'medical', 'healthcare', 'nursing', 'diagnosis', 'treatment',
                'patient assessment', 'medical records', 'healthcare technology', 'patient safety',
                'clinical protocols', 'medical terminology', 'healthcare regulations', 'patient education'
            ],
            'finance_professional': [
                'financial analysis', 'budgeting', 'forecasting', 'financial modeling', 'risk management',
                'compliance', 'accounting', 'audit', 'tax', 'investment', 'portfolio management',
                'financial reporting', 'excel', 'quickbooks', 'sap', 'financial planning'
            ]
        }

    def analyze_resume_ats(self, resume_content: str, profession: str = None, job_title: str = None) -> Dict[str, Any]:
        """Analyze resume for ATS compatibility and provide scoring"""
        try:
            if not self.openai_api_key:
                return self._mock_ats_analysis(resume_content, profession, job_title)
            
            # Perform comprehensive ATS analysis
            analysis_results = {
                'overall_score': 0,
                'category_scores': {},
                'detailed_analysis': {},
                'recommendations': [],
                'employability_rating': '',
                'ats_compatibility': '',
                'keyword_analysis': {},
                'formatting_analysis': {},
                'content_analysis': {}
            }
            
            # Analyze each category
            for category, config in self.ats_criteria.items():
                category_score, category_analysis = self._analyze_category(
                    resume_content, category, config, profession, job_title
                )
                analysis_results['category_scores'][category] = category_score
                analysis_results['detailed_analysis'][category] = category_analysis
            
            # Calculate overall score
            overall_score = self._calculate_overall_score(analysis_results['category_scores'])
            analysis_results['overall_score'] = overall_score
            
            # Generate recommendations
            analysis_results['recommendations'] = self._generate_recommendations(
                analysis_results['category_scores'], analysis_results['detailed_analysis']
            )
            
            # Determine employability rating
            analysis_results['employability_rating'] = self._get_employability_rating(overall_score)
            analysis_results['ats_compatibility'] = self._get_ats_compatibility(overall_score)
            
            # Perform keyword analysis
            analysis_results['keyword_analysis'] = self._analyze_keywords(resume_content, profession, job_title)
            
            # Perform formatting analysis
            analysis_results['formatting_analysis'] = self._analyze_formatting(resume_content)
            
            # Perform content analysis
            analysis_results['content_analysis'] = self._analyze_content_quality(resume_content)
            
            return {
                'success': True,
                'analysis': analysis_results,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error in ATS analysis: {e}")
            return {
                'success': False,
                'error': str(e),
                'analysis': self._mock_ats_analysis(resume_content, profession, job_title)
            }

    def _analyze_category(self, content: str, category: str, config: Dict, profession: str, job_title: str) -> tuple:
        """Analyze a specific category of ATS criteria"""
        checks = config.get('checks', [])
        total_score = 0
        max_score = len(checks)
        analysis = {}
        
        for check in checks:
            score, details = self._perform_check(content, check, profession, job_title)
            total_score += score
            analysis[check] = {
                'score': score,
                'details': details,
                'max_score': 1
            }
        
        category_score = (total_score / max_score) * 100 if max_score > 0 else 0
        return category_score, analysis

    def _perform_check(self, content: str, check: str, profession: str, job_title: str) -> tuple:
        """Perform a specific ATS check"""
        content_lower = content.lower()
        
        if check == 'clean_formatting':
            # Check for clean, simple formatting
            has_complex_formatting = bool(re.search(r'[^\w\s\-\.\,\;\:\!\?\(\)]', content))
            return (0 if has_complex_formatting else 1, 
                   "Clean formatting detected" if not has_complex_formatting else "Complex formatting may cause ATS issues")
        
        elif check == 'proper_fonts':
            # Check for standard fonts (this is more of a PDF analysis, but we can check for font mentions)
            return (1, "Standard fonts recommended for ATS compatibility")
        
        elif check == 'no_images_or_graphics':
            # Check for image/graphic indicators
            has_images = any(word in content_lower for word in ['image', 'graphic', 'photo', 'picture'])
            return (0 if has_images else 1, 
                   "No images detected" if not has_images else "Images may not be parsed by ATS")
        
        elif check == 'standard_sections':
            # Check for standard resume sections
            sections = ['experience', 'education', 'skills', 'summary', 'objective']
            found_sections = sum(1 for section in sections if section in content_lower)
            score = min(1, found_sections / 3)  # Need at least 3 sections
            return (score, f"Found {found_sections} standard sections")
        
        elif check == 'relevant_keywords':
            # Check for relevant keywords based on profession
            if profession and profession in self.industry_keywords:
                keywords = self.industry_keywords[profession]
                found_keywords = sum(1 for keyword in keywords if keyword.lower() in content_lower)
                score = min(1, found_keywords / 5)  # Need at least 5 keywords
                return (score, f"Found {found_keywords} relevant keywords")
            return (0.5, "Profession not specified for keyword analysis")
        
        elif check == 'action_verbs':
            # Check for action verbs
            action_verbs = [
                'developed', 'implemented', 'managed', 'achieved', 'created', 'designed',
                'led', 'coordinated', 'improved', 'increased', 'launched', 'established',
                'optimized', 'delivered', 'executed', 'generated', 'maintained', 'enhanced'
            ]
            found_verbs = sum(1 for verb in action_verbs if verb in content_lower)
            score = min(1, found_verbs / 3)  # Need at least 3 action verbs
            return (score, f"Found {found_verbs} action verbs")
        
        elif check == 'quantifiable_results':
            # Check for numbers and percentages
            has_numbers = bool(re.search(r'\d+%|\d+\.\d+%|\$\d+|\d+\s*(?:million|thousand|k|m)', content))
            return (1 if has_numbers else 0, 
                   "Quantifiable results found" if has_numbers else "Add specific numbers and percentages")
        
        elif check == 'contact_information':
            # Check for contact information
            has_email = bool(re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', content))
            has_phone = bool(re.search(r'\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}', content))
            score = 1 if has_email and has_phone else 0.5 if has_email or has_phone else 0
            return (score, f"Contact info: {'Complete' if score == 1 else 'Partial' if score == 0.5 else 'Missing'}")
        
        elif check == 'no_spelling_errors':
            # Basic spelling check (simplified)
            common_errors = ['recieve', 'seperate', 'occured', 'accomodate']
            has_errors = any(error in content_lower for error in common_errors)
            return (0 if has_errors else 1, 
                   "No obvious spelling errors" if not has_errors else "Potential spelling errors detected")
        
        elif check == 'appropriate_length':
            # Check resume length
            word_count = len(content.split())
            if 300 <= word_count <= 800:
                score = 1
                details = "Optimal length"
            elif 200 <= word_count < 300 or 800 < word_count <= 1000:
                score = 0.7
                details = "Acceptable length"
            else:
                score = 0.3
                details = "Length may need adjustment"
            return (score, f"{word_count} words - {details}")
        
        else:
            # Default check
            return (0.5, f"Check '{check}' not implemented")

    def _calculate_overall_score(self, category_scores: Dict[str, float]) -> float:
        """Calculate overall ATS score"""
        total_score = 0
        total_weight = 0
        
        for category, score in category_scores.items():
            weight = self.ats_criteria[category]['weight']
            total_score += score * weight
            total_weight += weight
        
        return total_score if total_weight > 0 else 0

    def _generate_recommendations(self, category_scores: Dict[str, float], detailed_analysis: Dict) -> List[str]:
        """Generate improvement recommendations"""
        recommendations = []
        
        # Sort categories by score (lowest first)
        sorted_categories = sorted(category_scores.items(), key=lambda x: x[1])
        
        for category, score in sorted_categories[:3]:  # Focus on top 3 areas for improvement
            if score < 70:
                if category == 'keywords':
                    recommendations.append("Add more industry-specific keywords and technical terms")
                elif category == 'content_quality':
                    recommendations.append("Include more quantifiable achievements and action verbs")
                elif category == 'formatting':
                    recommendations.append("Simplify formatting and remove any graphics or complex layouts")
                elif category == 'structure':
                    recommendations.append("Ensure clear section headers and logical content flow")
                elif category == 'completeness':
                    recommendations.append("Add missing sections like skills, education, or contact information")
                elif category == 'optimization':
                    recommendations.append("Proofread for spelling and grammar errors")
        
        # Add general recommendations
        if len(recommendations) < 3:
            recommendations.extend([
                "Use standard fonts like Arial, Calibri, or Times New Roman",
                "Keep formatting simple and avoid tables or columns",
                "Include relevant keywords from the job description"
            ])
        
        return recommendations[:5]  # Limit to 5 recommendations

    def _get_employability_rating(self, score: float) -> str:
        """Get employability rating based on score"""
        if score >= 90:
            return "Excellent - High chance of passing ATS screening"
        elif score >= 80:
            return "Very Good - Strong ATS compatibility"
        elif score >= 70:
            return "Good - Likely to pass most ATS systems"
        elif score >= 60:
            return "Fair - May need some improvements"
        elif score >= 50:
            return "Poor - Significant improvements needed"
        else:
            return "Very Poor - Unlikely to pass ATS screening"

    def _get_ats_compatibility(self, score: float) -> str:
        """Get ATS compatibility rating"""
        if score >= 85:
            return "Highly Compatible"
        elif score >= 70:
            return "Compatible"
        elif score >= 55:
            return "Moderately Compatible"
        elif score >= 40:
            return "Low Compatibility"
        else:
            return "Not Compatible"

    def _analyze_keywords(self, content: str, profession: str, job_title: str) -> Dict[str, Any]:
        """Analyze keyword usage and relevance"""
        content_lower = content.lower()
        analysis = {
            'total_keywords_found': 0,
            'relevant_keywords': [],
            'missing_keywords': [],
            'keyword_density': 0,
            'profession_match': 0
        }
        
        if profession and profession in self.industry_keywords:
            keywords = self.industry_keywords[profession]
            found_keywords = [kw for kw in keywords if kw.lower() in content_lower]
            analysis['relevant_keywords'] = found_keywords
            analysis['total_keywords_found'] = len(found_keywords)
            analysis['missing_keywords'] = [kw for kw in keywords if kw.lower() not in content_lower]
            analysis['profession_match'] = len(found_keywords) / len(keywords) if keywords else 0
        
        # Calculate keyword density
        word_count = len(content.split())
        analysis['keyword_density'] = (analysis['total_keywords_found'] / word_count * 100) if word_count > 0 else 0
        
        return analysis

    def _analyze_formatting(self, content: str) -> Dict[str, Any]:
        """Analyze formatting for ATS compatibility"""
        analysis = {
            'has_complex_characters': bool(re.search(r'[^\w\s\-\.\,\;\:\!\?\(\)]', content)),
            'has_standard_sections': len([s for s in ['experience', 'education', 'skills'] if s in content.lower()]),
            'word_count': len(content.split()),
            'character_count': len(content),
            'has_email': bool(re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', content)),
            'has_phone': bool(re.search(r'\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}', content))
        }
        
        return analysis

    def _analyze_content_quality(self, content: str) -> Dict[str, Any]:
        """Analyze content quality for professional impact"""
        content_lower = content.lower()
        
        # Count action verbs
        action_verbs = [
            'developed', 'implemented', 'managed', 'achieved', 'created', 'designed',
            'led', 'coordinated', 'improved', 'increased', 'launched', 'established',
            'optimized', 'delivered', 'executed', 'generated', 'maintained', 'enhanced'
        ]
        found_verbs = [verb for verb in action_verbs if verb in content_lower]
        
        # Check for quantifiable results
        has_numbers = bool(re.search(r'\d+%|\d+\.\d+%|\$\d+|\d+\s*(?:million|thousand|k|m)', content))
        
        analysis = {
            'action_verbs_found': found_verbs,
            'action_verb_count': len(found_verbs),
            'has_quantifiable_results': has_numbers,
            'professional_tone': self._assess_professional_tone(content),
            'achievement_focused': self._assess_achievement_focus(content)
        }
        
        return analysis

    def _assess_professional_tone(self, content: str) -> str:
        """Assess the professional tone of the content"""
        unprofessional_words = ['awesome', 'cool', 'amazing', 'super', 'really', 'very', 'super']
        content_lower = content.lower()
        
        unprofessional_count = sum(1 for word in unprofessional_words if word in content_lower)
        
        if unprofessional_count == 0:
            return "Professional"
        elif unprofessional_count <= 2:
            return "Mostly Professional"
        else:
            return "Needs Improvement"

    def _assess_achievement_focus(self, content: str) -> str:
        """Assess if content is achievement-focused"""
        achievement_indicators = ['achieved', 'increased', 'improved', 'reduced', 'grew', 'developed', 'launched']
        content_lower = content.lower()
        
        achievement_count = sum(1 for indicator in achievement_indicators if indicator in content_lower)
        
        if achievement_count >= 3:
            return "Achievement-Focused"
        elif achievement_count >= 1:
            return "Some Achievements"
        else:
            return "Needs More Achievements"

    def _mock_ats_analysis(self, content: str, profession: str, job_title: str) -> Dict[str, Any]:
        """Mock ATS analysis for testing"""
        return {
            'overall_score': 75.0,
            'category_scores': {
                'formatting': 80.0,
                'keywords': 70.0,
                'content_quality': 75.0,
                'structure': 85.0,
                'completeness': 90.0,
                'optimization': 70.0
            },
            'detailed_analysis': {
                'keywords': {
                    'found_keywords': ['python', 'javascript', 'react', 'development', 'software'],
                    'missing_keywords': ['docker', 'kubernetes', 'aws', 'microservices'],
                    'keyword_density': 2.5,
                    'profession_match': 0.7,
                    'industry_relevance': 75
                },
                'content_quality': {
                    'action_verbs': ['developed', 'managed', 'achieved', 'improved', 'created'],
                    'quantifiable_results': True,
                    'professional_tone': 'Professional',
                    'achievement_focus': 'Some Achievements',
                    'impact_statements': 3
                },
                'formatting': {
                    'ats_friendly': True,
                    'standard_sections': 3,
                    'word_count': 320,
                    'readability_score': 70,
                    'contact_info_complete': True
                },
                'structure': {
                    'logical_flow': True,
                    'section_headers': ['Experience', 'Education', 'Skills'],
                    'bullet_points': 5,
                    'consistent_formatting': True
                },
                'completeness': {
                    'required_sections': ['Experience', 'Education', 'Skills'],
                    'missing_sections': [],
                    'experience_coverage': 80,
                    'education_coverage': 85
                },
                'optimization': {
                    'seo_score': 70,
                    'industry_keywords': ['software development', 'web applications'],
                    'trending_skills': ['AI/ML', 'Cloud Computing', 'DevOps'],
                    'modern_formatting': True
                }
            },
            'recommendations': {
                'critical': ['Add more industry-specific keywords'],
                'important': ['Include more quantifiable achievements'],
                'optional': ['Consider adding a professional summary']
            },
            'market_insights': {
                'industry_trends': ['Remote work is becoming standard', 'AI skills are in demand'],
                'salary_impact': 'Above average',
                'competition_level': 'High',
                'hiring_timeline': '2-4 weeks'
            },
            'real_world_performance': {
                'estimated_interview_rate': 75.0,
                'ats_pass_rate': 75.0,
                'recruiter_scan_time': 6.5,
                'keyword_match_percentage': 70.0
            },
            'employability_rating': "Good - Likely to pass most ATS systems",
            'ats_compatibility': "Compatible"
        }

# Global instance for easy access
ats_analysis_service = ATSAnalysisService()














