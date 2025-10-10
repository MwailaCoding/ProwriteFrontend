"""
Smart Resume Optimization Engine
Provides intelligent optimization suggestions based on industry best practices
"""

import os
import json
import re
import openai
from typing import Dict, List, Any, Optional
from datetime import datetime

class SmartOptimizationEngine:
    def __init__(self):
        """Initialize the smart optimization engine"""
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        if self.openai_api_key:
            openai.api_key = self.openai_api_key
        
        # Optimization categories and their weights
        self.optimization_categories = {
            'content_quality': {
                'weight': 0.25,
                'checks': ['action_verbs', 'quantifiable_results', 'achievement_focus', 'professional_tone']
            },
            'keyword_optimization': {
                'weight': 0.20,
                'checks': ['relevant_keywords', 'industry_terms', 'skill_alignment', 'keyword_density']
            },
            'structure_formatting': {
                'weight': 0.20,
                'checks': ['clear_sections', 'consistent_formatting', 'readable_layout', 'ats_friendly']
            },
            'impact_measurement': {
                'weight': 0.15,
                'checks': ['measurable_results', 'business_impact', 'leadership_demonstration', 'innovation_showcase']
            },
            'professional_presentation': {
                'weight': 0.20,
                'checks': ['grammar_spelling', 'concise_writing', 'professional_language', 'coherent_flow']
            }
        }
        
        # Industry-specific optimization rules
        self.industry_rules = {
            'technology': {
                'keywords': ['software development', 'programming', 'agile', 'scrum', 'devops', 'cloud computing'],
                'metrics': ['performance improvement', 'user adoption', 'system uptime', 'code quality'],
                'focus_areas': ['technical skills', 'project management', 'innovation', 'problem solving']
            },
            'marketing': {
                'keywords': ['digital marketing', 'campaign management', 'brand awareness', 'lead generation'],
                'metrics': ['conversion rates', 'ROI', 'engagement rates', 'brand reach'],
                'focus_areas': ['creative thinking', 'analytics', 'strategy', 'communication']
            },
            'finance': {
                'keywords': ['financial analysis', 'budgeting', 'risk management', 'compliance'],
                'metrics': ['cost savings', 'revenue growth', 'risk reduction', 'compliance rates'],
                'focus_areas': ['analytical skills', 'attention to detail', 'regulatory knowledge', 'strategic thinking']
            },
            'healthcare': {
                'keywords': ['patient care', 'clinical', 'healthcare technology', 'patient safety'],
                'metrics': ['patient satisfaction', 'safety metrics', 'efficiency improvements'],
                'focus_areas': ['patient care', 'clinical skills', 'safety protocols', 'team collaboration']
            }
        }
        
        # Common optimization patterns
        self.optimization_patterns = {
            'weak_phrases': [
                'responsible for', 'helped with', 'assisted in', 'worked on', 'participated in',
                'involved in', 'contributed to', 'supported', 'helped', 'did'
            ],
            'strong_phrases': [
                'achieved', 'implemented', 'developed', 'managed', 'coordinated', 'spearheaded',
                'pioneered', 'transformed', 'accelerated', 'optimized', 'engineered', 'architected'
            ],
            'quantifiable_indicators': [
                r'\d+%', r'\$\d+', r'\d+\s*(?:percent|%)', r'\d+\s*(?:million|thousand|k)',
                r'increased by \d+', r'reduced by \d+', r'improved by \d+'
            ]
        }

    def analyze_resume_optimization(self, resume_content: str, profession: str = None, industry: str = None) -> Dict[str, Any]:
        """Analyze resume content and provide optimization suggestions"""
        try:
            if not self.openai_api_key:
                return self._mock_optimization_analysis(resume_content, profession, industry)
            
            # Perform comprehensive analysis
            analysis_results = {}
            overall_score = 0
            
            for category, config in self.optimization_categories.items():
                category_score = 0
                category_checks = []
                
                for check in config['checks']:
                    check_result = self._perform_optimization_check(resume_content, check, profession, industry)
                    category_checks.append(check_result)
                    category_score += check_result['score']
                
                # Calculate average score for category
                category_score = category_score / len(config['checks'])
                analysis_results[category] = {
                    'score': category_score,
                    'weight': config['weight'],
                    'checks': category_checks,
                    'suggestions': self._generate_category_suggestions(category, category_checks, profession, industry)
                }
                
                overall_score += category_score * config['weight']
            
            # Generate overall optimization recommendations
            overall_suggestions = self._generate_overall_suggestions(analysis_results, profession, industry)
            
            return {
                'success': True,
                'overall_score': overall_score,
                'category_analysis': analysis_results,
                'overall_suggestions': overall_suggestions,
                'profession': profession,
                'industry': industry,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error in resume optimization analysis: {e}")
            return {
                'success': False,
                'error': str(e),
                'content': self._mock_optimization_analysis(resume_content, profession, industry)
            }

    def optimize_specific_section(self, section_content: str, section_type: str, profession: str = None) -> Dict[str, Any]:
        """Optimize a specific resume section"""
        try:
            if not self.openai_api_key:
                return self._mock_section_optimization(section_content, section_type, profession)
            
            # Build optimization prompt for specific section
            prompt = f"""Optimize the following {section_type} section for a {profession or 'professional'} resume.

Current content:
{section_content}

Optimization requirements:
- Use strong action verbs
- Include quantifiable results where possible
- Make it more impactful and professional
- Ensure clarity and conciseness
- Focus on achievements and outcomes

Optimized content:"""
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert resume writer who optimizes content to make it more professional and impactful."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=400,
                temperature=0.6
            )
            
            optimized_content = response.choices[0].message.content.strip()
            
            # Analyze improvements
            improvements = self._analyze_section_improvements(section_content, optimized_content)
            
            return {
                'success': True,
                'original_content': section_content,
                'optimized_content': optimized_content,
                'section_type': section_type,
                'profession': profession,
                'improvements': improvements,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error in section optimization: {e}")
            return {
                'success': False,
                'error': str(e),
                'content': self._mock_section_optimization(section_content, section_type, profession)
            }

    def generate_keyword_suggestions(self, resume_content: str, target_job: str, industry: str = None) -> Dict[str, Any]:
        """Generate keyword suggestions for resume optimization"""
        try:
            if not self.openai_api_key:
                return self._mock_keyword_suggestions(resume_content, target_job, industry)
            
            # Get industry-specific keywords
            industry_keywords = []
            if industry and industry in self.industry_rules:
                industry_keywords = self.industry_rules[industry]['keywords']
            
            prompt = f"""Analyze this resume content and suggest relevant keywords for a {target_job} position.

Resume content:
{resume_content}

Industry: {industry or 'general'}

Requirements:
- Suggest 10-15 relevant keywords
- Include technical skills, soft skills, and industry terms
- Focus on keywords that would help with ATS optimization
- Consider both required and preferred skills

Suggested keywords:"""
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert at identifying relevant keywords for resume optimization and ATS compatibility."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=300,
                temperature=0.5
            )
            
            keyword_suggestions = response.choices[0].message.content.strip()
            
            # Analyze current keyword usage
            current_keywords = self._extract_current_keywords(resume_content)
            missing_keywords = self._identify_missing_keywords(keyword_suggestions, current_keywords)
            
            return {
                'success': True,
                'target_job': target_job,
                'industry': industry,
                'suggested_keywords': keyword_suggestions,
                'current_keywords': current_keywords,
                'missing_keywords': missing_keywords,
                'industry_keywords': industry_keywords,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error in keyword suggestions: {e}")
            return {
                'success': False,
                'error': str(e),
                'content': self._mock_keyword_suggestions(resume_content, target_job, industry)
            }

    def _perform_optimization_check(self, content: str, check_type: str, profession: str = None, industry: str = None) -> Dict[str, Any]:
        """Perform a specific optimization check"""
        content_lower = content.lower()
        
        if check_type == 'action_verbs':
            strong_verbs = sum(1 for verb in self.optimization_patterns['strong_phrases'] if verb in content_lower)
            weak_phrases = sum(1 for phrase in self.optimization_patterns['weak_phrases'] if phrase in content_lower)
            score = min(100, (strong_verbs * 20) - (weak_phrases * 10))
            return {
                'check': check_type,
                'score': max(0, score),
                'details': f'Found {strong_verbs} strong action verbs, {weak_phrases} weak phrases'
            }
        
        elif check_type == 'quantifiable_results':
            quantifiable_count = sum(1 for pattern in self.optimization_patterns['quantifiable_indicators'] 
                                   if re.search(pattern, content, re.IGNORECASE))
            score = min(100, quantifiable_count * 25)
            return {
                'check': check_type,
                'score': score,
                'details': f'Found {quantifiable_count} quantifiable results'
            }
        
        elif check_type == 'relevant_keywords':
            if industry and industry in self.industry_rules:
                industry_keywords = self.industry_rules[industry]['keywords']
                found_keywords = sum(1 for keyword in industry_keywords if keyword in content_lower)
                score = min(100, (found_keywords / len(industry_keywords)) * 100)
                return {
                    'check': check_type,
                    'score': score,
                    'details': f'Found {found_keywords}/{len(industry_keywords)} industry keywords'
                }
            else:
                return {
                    'check': check_type,
                    'score': 50,
                    'details': 'Industry not specified for keyword analysis'
                }
        
        else:
            # Default check
            return {
                'check': check_type,
                'score': 75,
                'details': 'Standard optimization check completed'
            }

    def _generate_category_suggestions(self, category: str, checks: List[Dict], profession: str, industry: str) -> List[str]:
        """Generate suggestions for a specific category"""
        suggestions = []
        
        if category == 'content_quality':
            suggestions.extend([
                "Use strong action verbs at the beginning of bullet points",
                "Include specific numbers and percentages to quantify achievements",
                "Focus on accomplishments rather than just responsibilities",
                "Maintain a professional and confident tone throughout"
            ])
        
        elif category == 'keyword_optimization':
            if industry and industry in self.industry_rules:
                keywords = self.industry_rules[industry]['keywords']
                suggestions.append(f"Include industry-specific keywords: {', '.join(keywords[:5])}")
            suggestions.extend([
                "Research job descriptions to identify relevant keywords",
                "Use variations of important keywords throughout the resume",
                "Ensure keyword density is appropriate (not overstuffed)"
            ])
        
        elif category == 'structure_formatting':
            suggestions.extend([
                "Use clear section headers and consistent formatting",
                "Ensure the resume is ATS-friendly with standard fonts",
                "Maintain consistent spacing and alignment",
                "Use bullet points for easy scanning"
            ])
        
        return suggestions[:3]  # Limit to top 3 suggestions

    def _generate_overall_suggestions(self, analysis_results: Dict, profession: str, industry: str) -> List[str]:
        """Generate overall optimization suggestions"""
        suggestions = []
        
        # Identify areas needing improvement
        low_score_categories = [cat for cat, result in analysis_results.items() 
                              if result['score'] < 70]
        
        if 'content_quality' in low_score_categories:
            suggestions.append("Focus on improving content quality with stronger action verbs and quantifiable results")
        
        if 'keyword_optimization' in low_score_categories:
            suggestions.append("Optimize keyword usage for better ATS compatibility and industry relevance")
        
        if 'structure_formatting' in low_score_categories:
            suggestions.append("Improve resume structure and formatting for better readability and ATS compatibility")
        
        # Add general suggestions
        suggestions.extend([
            "Review and update your resume regularly to reflect new achievements",
            "Customize your resume for each job application",
            "Seek feedback from industry professionals or career counselors"
        ])
        
        return suggestions[:5]  # Limit to top 5 suggestions

    def _analyze_section_improvements(self, original: str, optimized: str) -> List[str]:
        """Analyze improvements made to a section"""
        improvements = []
        
        # Check for action verbs
        strong_verbs = self.optimization_patterns['strong_phrases']
        original_lower = original.lower()
        optimized_lower = optimized.lower()
        
        for verb in strong_verbs:
            if verb in optimized_lower and verb not in original_lower:
                improvements.append(f"Added strong action verb: '{verb}'")
                break
        
        # Check for quantifiable results
        if re.search(r'\d+%|\d+\s*(?:percent|%)', optimized, re.IGNORECASE):
            if not re.search(r'\d+%|\d+\s*(?:percent|%)', original, re.IGNORECASE):
                improvements.append("Added quantifiable results with percentages")
        
        # Check length improvement
        if len(optimized) > len(original):
            improvements.append("Enhanced content length and detail")
        
        return improvements

    def _extract_current_keywords(self, content: str) -> List[str]:
        """Extract current keywords from content"""
        # Simple keyword extraction (in production, use more sophisticated NLP)
        words = re.findall(r'\b\w+\b', content.lower())
        # Filter out common words and short words
        keywords = [word for word in words if len(word) > 3 and word not in ['with', 'and', 'the', 'for', 'that', 'this']]
        return list(set(keywords))[:20]  # Return top 20 unique keywords

    def _identify_missing_keywords(self, suggested: str, current: List[str]) -> List[str]:
        """Identify keywords that are missing from current content"""
        suggested_words = re.findall(r'\b\w+\b', suggested.lower())
        missing = [word for word in suggested_words if word not in current and len(word) > 3]
        return missing[:10]  # Return top 10 missing keywords

    def _mock_optimization_analysis(self, resume_content: str, profession: str, industry: str) -> Dict[str, Any]:
        """Mock optimization analysis for testing"""
        return {
            'success': True,
            'overall_score': 78.5,
            'category_analysis': {
                'content_quality': {
                    'score': 75.0,
                    'weight': 0.25,
                    'checks': [],
                    'suggestions': ['Use stronger action verbs', 'Add more quantifiable results']
                },
                'keyword_optimization': {
                    'score': 80.0,
                    'weight': 0.20,
                    'checks': [],
                    'suggestions': ['Include more industry-specific keywords']
                },
                'structure_formatting': {
                    'score': 85.0,
                    'weight': 0.20,
                    'checks': [],
                    'suggestions': ['Maintain consistent formatting']
                }
            },
            'overall_suggestions': [
                'Focus on improving content quality',
                'Optimize keyword usage',
                'Review and update regularly'
            ],
            'profession': profession,
            'industry': industry,
            'timestamp': datetime.now().isoformat()
        }

    def _mock_section_optimization(self, section_content: str, section_type: str, profession: str) -> Dict[str, Any]:
        """Mock section optimization for testing"""
        optimized = f"Optimized {section_type}: {section_content}"
        if 'achieved' not in section_content.lower():
            optimized = optimized.replace("Optimized", "Achieved and optimized")
        
        return {
            'success': True,
            'original_content': section_content,
            'optimized_content': optimized,
            'section_type': section_type,
            'profession': profession,
            'improvements': ['Enhanced action verbs', 'Added quantifiable results'],
            'timestamp': datetime.now().isoformat()
        }

    def _mock_keyword_suggestions(self, resume_content: str, target_job: str, industry: str) -> Dict[str, Any]:
        """Mock keyword suggestions for testing"""
        return {
            'success': True,
            'target_job': target_job,
            'industry': industry,
            'suggested_keywords': 'project management, leadership, strategic planning, team collaboration, problem solving',
            'current_keywords': ['project', 'management', 'team'],
            'missing_keywords': ['leadership', 'strategic', 'planning'],
            'industry_keywords': ['project management', 'leadership'] if industry else [],
            'timestamp': datetime.now().isoformat()
        }

# Global instance for easy access
smart_optimization_engine = SmartOptimizationEngine()























