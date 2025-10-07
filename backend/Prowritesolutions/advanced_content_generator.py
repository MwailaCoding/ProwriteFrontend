"""
Advanced Content Generation Service
Generates professional content for resume sections with various styles and tones
"""

import os
import json
import re
import openai
from typing import Dict, List, Any, Optional
from datetime import datetime

class AdvancedContentGenerator:
    def __init__(self):
        """Initialize the advanced content generator"""
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        if self.openai_api_key:
            openai.api_key = self.openai_api_key
        
        # Content generation styles
        self.content_styles = {
            'professional': {
                'tone': 'formal and business-like',
                'description': 'Traditional professional tone suitable for corporate environments',
                'keywords': ['achieved', 'implemented', 'developed', 'managed', 'coordinated']
            },
            'modern': {
                'tone': 'contemporary and dynamic',
                'description': 'Fresh and engaging tone for creative and tech industries',
                'keywords': ['spearheaded', 'pioneered', 'transformed', 'accelerated', 'optimized']
            },
            'executive': {
                'tone': 'strategic and leadership-focused',
                'description': 'High-level strategic tone for senior positions',
                'keywords': ['strategized', 'orchestrated', 'championed', 'architected', 'visioned']
            },
            'creative': {
                'tone': 'innovative and expressive',
                'description': 'Creative and artistic tone for design and creative roles',
                'keywords': ['crafted', 'designed', 'conceptualized', 'innovated', 'curated']
            },
            'technical': {
                'tone': 'precise and analytical',
                'description': 'Technical and detail-oriented tone for engineering roles',
                'keywords': ['engineered', 'architected', 'optimized', 'implemented', 'debugged']
            }
        }
        
        # Section-specific generation templates
        self.section_templates = {
            'summary': {
                'prompt_template': 'Write a {style} professional summary for a {profession} with {experience} years of experience. Focus on {focus_areas}.',
                'max_length': 150,
                'key_elements': ['experience level', 'key skills', 'achievements', 'career goals']
            },
            'experience': {
                'prompt_template': 'Generate {style} bullet points for a {position} role at {company}. Include achievements, responsibilities, and impact. Use action verbs and quantifiable results.',
                'max_length': 200,
                'key_elements': ['action verbs', 'quantifiable results', 'technologies used', 'impact on business']
            },
            'skills': {
                'prompt_template': 'Create a comprehensive list of {style} skills for a {profession}. Include technical skills, soft skills, and industry-specific competencies.',
                'max_length': 100,
                'key_elements': ['technical skills', 'soft skills', 'tools and technologies', 'industry knowledge']
            },
            'achievements': {
                'prompt_template': 'Write {style} achievement statements for a {profession}. Focus on quantifiable results, awards, and significant contributions.',
                'max_length': 150,
                'key_elements': ['quantifiable results', 'awards and recognition', 'leadership achievements', 'innovation']
            },
            'projects': {
                'prompt_template': 'Describe {style} projects for a {profession}. Include project scope, technologies used, challenges overcome, and outcomes achieved.',
                'max_length': 200,
                'key_elements': ['project scope', 'technologies', 'challenges', 'outcomes', 'team size']
            }
        }
        
        # Industry-specific content patterns
        self.industry_patterns = {
            'technology': {
                'keywords': ['software development', 'agile', 'scrum', 'devops', 'cloud computing'],
                'metrics': ['performance improvement', 'user adoption', 'system uptime', 'code quality'],
                'achievements': ['reduced deployment time', 'improved system performance', 'increased user satisfaction']
            },
            'marketing': {
                'keywords': ['digital marketing', 'campaign management', 'brand awareness', 'lead generation'],
                'metrics': ['conversion rates', 'ROI', 'engagement rates', 'brand reach'],
                'achievements': ['increased conversion rates', 'improved brand awareness', 'generated qualified leads']
            },
            'finance': {
                'keywords': ['financial analysis', 'budgeting', 'risk management', 'compliance'],
                'metrics': ['cost savings', 'revenue growth', 'risk reduction', 'compliance rates'],
                'achievements': ['reduced costs', 'increased revenue', 'improved compliance']
            },
            'healthcare': {
                'keywords': ['patient care', 'clinical', 'healthcare technology', 'patient safety'],
                'metrics': ['patient satisfaction', 'safety metrics', 'efficiency improvements'],
                'achievements': ['improved patient outcomes', 'enhanced safety protocols', 'increased efficiency']
            }
        }

    def generate_section_content(self, section: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate content for a specific resume section"""
        try:
            if not self.openai_api_key:
                return self._mock_section_generation(section, context)
            
            # Extract context parameters
            profession = context.get('profession', 'professional')
            experience_years = context.get('experience_years', 3)
            style = context.get('style', 'professional')
            focus_areas = context.get('focus_areas', 'general skills and achievements')
            company = context.get('company', 'various companies')
            position = context.get('position', 'professional role')
            
            # Get template for the section
            template = self.section_templates.get(section, {})
            if not template:
                return {
                    'success': False,
                    'error': f'Section {section} is not supported'
                }
            
            # Build the prompt
            prompt = template['prompt_template'].format(
                style=style,
                profession=profession,
                experience=experience_years,
                focus_areas=focus_areas,
                company=company,
                position=position
            )
            
            # Add style-specific instructions
            style_info = self.content_styles.get(style, self.content_styles['professional'])
            prompt += f"\n\nUse a {style_info['tone']} tone. Include relevant keywords and focus on {', '.join(template['key_elements'])}."
            
            # Generate content using OpenAI
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert resume writer specializing in creating compelling, professional content. Generate content that is concise, impactful, and tailored to the specific requirements."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=500,
                temperature=0.7
            )
            
            generated_content = response.choices[0].message.content.strip()
            
            return {
                'success': True,
                'section': section,
                'content': generated_content,
                'style': style,
                'context': context,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error in section content generation: {e}")
            return {
                'success': False,
                'error': str(e),
                'content': self._mock_section_generation(section, context)
            }

    def generate_multiple_variations(self, section: str, context: Dict[str, Any], count: int = 3) -> Dict[str, Any]:
        """Generate multiple variations of content for a section"""
        try:
            variations = []
            styles = list(self.content_styles.keys())
            
            for i in range(min(count, len(styles))):
                style = styles[i]
                context_with_style = {**context, 'style': style}
                
                result = self.generate_section_content(section, context_with_style)
                if result['success']:
                    variations.append({
                        'style': style,
                        'content': result['content'],
                        'description': self.content_styles[style]['description']
                    })
            
            return {
                'success': True,
                'section': section,
                'variations': variations,
                'context': context,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error in multiple variations generation: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def generate_industry_specific_content(self, section: str, industry: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate industry-specific content for a section"""
        try:
            # Get industry patterns
            industry_pattern = self.industry_patterns.get(industry, {})
            if not industry_pattern:
                return {
                    'success': False,
                    'error': f'Industry {industry} is not supported'
                }
            
            # Add industry-specific context
            enhanced_context = {
                **context,
                'industry_keywords': industry_pattern.get('keywords', []),
                'industry_metrics': industry_pattern.get('metrics', []),
                'industry_achievements': industry_pattern.get('achievements', [])
            }
            
            # Generate content with industry focus
            result = self.generate_section_content(section, enhanced_context)
            
            if result['success']:
                result['industry'] = industry
                result['industry_patterns'] = industry_pattern
            
            return result
            
        except Exception as e:
            print(f"Error in industry-specific content generation: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def enhance_existing_content(self, content: str, style: str, section: str) -> Dict[str, Any]:
        """Enhance existing content with a specific style"""
        try:
            if not self.openai_api_key:
                return self._mock_content_enhancement(content, style, section)
            
            style_info = self.content_styles.get(style, self.content_styles['professional'])
            
            prompt = f"""Enhance the following {section} content to match a {style} style with a {style_info['tone']} tone.

Original content:
{content}

Enhancement requirements:
- Maintain the core information
- Improve clarity and impact
- Use {style} action verbs and keywords
- Make it more compelling and professional
- Keep it concise and focused

Enhanced content:"""
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert resume writer who enhances existing content to make it more professional and impactful."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=400,
                temperature=0.6
            )
            
            enhanced_content = response.choices[0].message.content.strip()
            
            return {
                'success': True,
                'original_content': content,
                'enhanced_content': enhanced_content,
                'style': style,
                'section': section,
                'improvements': self._analyze_improvements(content, enhanced_content),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error in content enhancement: {e}")
            return {
                'success': False,
                'error': str(e),
                'content': self._mock_content_enhancement(content, style, section)
            }

    def generate_achievement_statements(self, profession: str, experience_years: int, industry: str = None) -> Dict[str, Any]:
        """Generate specific achievement statements"""
        try:
            if not self.openai_api_key:
                return self._mock_achievement_generation(profession, experience_years, industry)
            
            industry_context = ""
            if industry and industry in self.industry_patterns:
                pattern = self.industry_patterns[industry]
                industry_context = f"Focus on {industry} industry achievements including: {', '.join(pattern['achievements'])}. Use metrics like: {', '.join(pattern['metrics'])}."
            
            prompt = f"""Generate 5-7 compelling achievement statements for a {profession} with {experience_years} years of experience.

Requirements:
- Use strong action verbs
- Include quantifiable results (numbers, percentages, metrics)
- Focus on impact and outcomes
- Make them specific and measurable
- Vary the types of achievements (leadership, technical, business impact)

{industry_context}

Generate achievement statements:"""
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert at creating compelling, quantifiable achievement statements for resumes."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=600,
                temperature=0.7
            )
            
            achievements = response.choices[0].message.content.strip()
            
            return {
                'success': True,
                'profession': profession,
                'experience_years': experience_years,
                'industry': industry,
                'achievements': achievements,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error in achievement generation: {e}")
            return {
                'success': False,
                'error': str(e),
                'content': self._mock_achievement_generation(profession, experience_years, industry)
            }

    def _analyze_improvements(self, original: str, enhanced: str) -> List[str]:
        """Analyze improvements made to content"""
        improvements = []
        
        # Check for action verbs
        action_verbs = ['achieved', 'implemented', 'developed', 'managed', 'coordinated', 'spearheaded', 'pioneered']
        enhanced_lower = enhanced.lower()
        
        for verb in action_verbs:
            if verb in enhanced_lower and verb not in original.lower():
                improvements.append(f"Added strong action verb: '{verb}'")
                break
        
        # Check for quantifiable results
        if re.search(r'\d+%|\d+\s*(?:percent|%)', enhanced, re.IGNORECASE):
            if not re.search(r'\d+%|\d+\s*(?:percent|%)', original, re.IGNORECASE):
                improvements.append("Added quantifiable results with percentages")
        
        # Check for numbers
        if re.search(r'\d+', enhanced):
            if not re.search(r'\d+', original):
                improvements.append("Added specific numbers and metrics")
        
        # Check length improvement
        if len(enhanced) > len(original):
            improvements.append("Enhanced content length and detail")
        
        return improvements

    def _mock_section_generation(self, section: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Mock section generation for testing"""
        mock_content = {
            'summary': "Experienced professional with strong analytical skills and proven track record of delivering results. Skilled in project management and team leadership.",
            'experience': "• Led cross-functional teams to deliver projects on time and within budget\n• Implemented new processes that improved efficiency by 25%\n• Managed client relationships and exceeded expectations",
            'skills': "Project Management, Team Leadership, Strategic Planning, Data Analysis, Communication, Problem Solving",
            'achievements': "• Increased team productivity by 30% through process optimization\n• Received Employee of the Year award for outstanding performance\n• Successfully managed 15+ concurrent projects",
            'projects': "• Developed and launched new product line generating $500K in revenue\n• Led digital transformation initiative improving operational efficiency\n• Created comprehensive training program for 50+ employees"
        }
        
        return {
            'success': True,
            'section': section,
            'content': mock_content.get(section, "Generated content for this section"),
            'style': context.get('style', 'professional'),
            'context': context,
            'timestamp': datetime.now().isoformat()
        }

    def _mock_content_enhancement(self, content: str, style: str, section: str) -> Dict[str, Any]:
        """Mock content enhancement for testing"""
        enhanced = f"Enhanced {style} version: {content}"
        if 'achieved' not in content.lower():
            enhanced = enhanced.replace("Generated", "Achieved and generated")
        
        return {
            'success': True,
            'original_content': content,
            'enhanced_content': enhanced,
            'style': style,
            'section': section,
            'improvements': ['Enhanced tone and style', 'Added action verbs'],
            'timestamp': datetime.now().isoformat()
        }

    def _mock_achievement_generation(self, profession: str, experience_years: int, industry: str = None) -> Dict[str, Any]:
        """Mock achievement generation for testing"""
        achievements = f"""• Led successful projects resulting in 25% efficiency improvement
• Managed team of {experience_years * 2} professionals across multiple departments
• Implemented new strategies that increased revenue by 15%
• Received recognition for outstanding performance and leadership
• Developed and executed training programs for 50+ employees"""
        
        return {
            'success': True,
            'profession': profession,
            'experience_years': experience_years,
            'industry': industry,
            'achievements': achievements,
            'timestamp': datetime.now().isoformat()
        }

# Global instance for easy access
advanced_content_generator = AdvancedContentGenerator()















