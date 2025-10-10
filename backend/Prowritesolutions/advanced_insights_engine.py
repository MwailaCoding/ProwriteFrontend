"""
Advanced Resume Insights & Recommendations Engine
Provides deep analysis, personalized recommendations, and strategic insights
"""

import os
import json
import re
import openai
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from collections import defaultdict

class AdvancedInsightsEngine:
    def __init__(self):
        """Initialize the advanced insights engine"""
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        if self.openai_api_key:
            openai.api_key = self.openai_api_key
        
        # Insight categories and analysis types
        self.insight_categories = {
            'career_strategy': {
                'analysis_types': ['career_progression', 'skill_gaps', 'market_positioning'],
                'recommendations': ['skill_development', 'career_path', 'industry_trends']
            },
            'content_optimization': {
                'analysis_types': ['content_effectiveness', 'message_clarity', 'impact_measurement'],
                'recommendations': ['content_improvements', 'messaging_strategy', 'impact_enhancement']
            },
            'market_intelligence': {
                'analysis_types': ['industry_trends', 'salary_benchmarks', 'demand_analysis'],
                'recommendations': ['market_positioning', 'salary_negotiation', 'opportunity_identification']
            },
            'personal_branding': {
                'analysis_types': ['brand_consistency', 'unique_value_proposition', 'differentiation'],
                'recommendations': ['brand_development', 'value_proposition', 'differentiation_strategy']
            }
        }
        
        # Career level insights
        self.career_level_insights = {
            'entry_level': {
                'focus_areas': ['education', 'internships', 'projects', 'soft_skills'],
                'key_metrics': ['gpa', 'relevant_courses', 'project_experience', 'leadership_roles'],
                'recommendations': ['highlight_education', 'emphasize_projects', 'show_leadership_potential']
            },
            'mid_level': {
                'focus_areas': ['achievements', 'technical_skills', 'team_leadership', 'project_management'],
                'key_metrics': ['quantifiable_results', 'team_size', 'project_scope', 'skill_depth'],
                'recommendations': ['quantify_achievements', 'show_leadership', 'demonstrate_impact']
            },
            'senior_level': {
                'focus_areas': ['strategic_impact', 'business_results', 'team_management', 'innovation'],
                'key_metrics': ['revenue_impact', 'team_size', 'strategic_initiatives', 'industry_recognition'],
                'recommendations': ['emphasize_strategic_impact', 'show_business_acumen', 'highlight_innovation']
            },
            'executive_level': {
                'focus_areas': ['vision', 'strategy', 'business_transformation', 'board_experience'],
                'key_metrics': ['company_growth', 'market_expansion', 'strategic_initiatives', 'board_positions'],
                'recommendations': ['emphasize_vision', 'show_strategic_thinking', 'highlight_transformation']
            }
        }
        
        # Industry-specific insights
        self.industry_insights = {
            'technology': {
                'trends': ['AI/ML', 'Cloud Computing', 'DevOps', 'Cybersecurity'],
                'key_skills': ['Programming', 'System Design', 'Agile', 'Cloud Platforms'],
                'recommendations': ['Stay current with tech trends', 'Show technical depth', 'Emphasize innovation']
            },
            'marketing': {
                'trends': ['Digital Marketing', 'Data Analytics', 'Personalization', 'Content Marketing'],
                'key_skills': ['Campaign Management', 'Analytics', 'Creative Strategy', 'Brand Management'],
                'recommendations': ['Show data-driven results', 'Emphasize creativity', 'Highlight ROI']
            },
            'finance': {
                'trends': ['FinTech', 'Risk Management', 'Compliance', 'Digital Transformation'],
                'key_skills': ['Financial Analysis', 'Risk Assessment', 'Regulatory Knowledge', 'Strategic Planning'],
                'recommendations': ['Show financial acumen', 'Emphasize compliance', 'Highlight risk management']
            },
            'healthcare': {
                'trends': ['Telemedicine', 'Digital Health', 'Patient Safety', 'Healthcare Technology'],
                'key_skills': ['Patient Care', 'Clinical Skills', 'Healthcare Technology', 'Quality Improvement'],
                'recommendations': ['Emphasize patient outcomes', 'Show clinical expertise', 'Highlight safety focus']
            }
        }

    def generate_strategic_insights(self, resume_content: str, profession: str, experience_years: int, industry: str = None) -> Dict[str, Any]:
        """Generate strategic insights for resume optimization"""
        try:
            if not self.openai_api_key:
                return self._mock_strategic_insights(resume_content, profession, experience_years, industry)
            
            # Determine career level
            career_level = self._determine_career_level(experience_years)
            
            # Generate comprehensive strategic analysis
            strategic_analysis = {
                'career_level': career_level,
                'career_strategy': self._analyze_career_strategy(resume_content, profession, career_level, industry),
                'content_optimization': self._analyze_content_optimization(resume_content, career_level),
                'market_intelligence': self._analyze_market_intelligence(profession, industry),
                'personal_branding': self._analyze_personal_branding(resume_content, profession, career_level),
                'actionable_recommendations': [],
                'strategic_priorities': []
            }
            
            # Generate actionable recommendations
            strategic_analysis['actionable_recommendations'] = self._generate_strategic_recommendations(
                strategic_analysis, profession, career_level, industry
            )
            
            # Identify strategic priorities
            strategic_analysis['strategic_priorities'] = self._identify_strategic_priorities(
                strategic_analysis, career_level, industry
            )
            
            return {
                'success': True,
                'strategic_analysis': strategic_analysis,
                'profession': profession,
                'experience_years': experience_years,
                'industry': industry,
                'career_level': career_level,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error in strategic insights generation: {e}")
            return {
                'success': False,
                'error': str(e),
                'content': self._mock_strategic_insights(resume_content, profession, experience_years, industry)
            }

    def generate_personalized_recommendations(self, resume_content: str, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Generate personalized recommendations based on user profile"""
        try:
            if not self.openai_api_key:
                return self._mock_personalized_recommendations(resume_content, user_profile)
            
            # Extract user profile information
            profession = user_profile.get('profession', 'professional')
            experience_years = user_profile.get('experience_years', 3)
            industry = user_profile.get('industry', None)
            career_goals = user_profile.get('career_goals', [])
            target_companies = user_profile.get('target_companies', [])
            preferred_roles = user_profile.get('preferred_roles', [])
            
            # Generate personalized analysis
            personalized_analysis = {
                'career_alignment': self._analyze_career_alignment(resume_content, career_goals, target_companies),
                'skill_gap_analysis': self._analyze_skill_gaps(resume_content, preferred_roles, industry),
                'market_positioning': self._analyze_market_positioning(resume_content, profession, industry),
                'opportunity_identification': self._analyze_opportunities(resume_content, career_goals, industry),
                'personalized_recommendations': []
            }
            
            # Generate personalized recommendations
            personalized_analysis['personalized_recommendations'] = self._generate_personalized_recommendations(
                personalized_analysis, user_profile
            )
            
            return {
                'success': True,
                'personalized_analysis': personalized_analysis,
                'user_profile': user_profile,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error in personalized recommendations: {e}")
            return {
                'success': False,
                'error': str(e),
                'content': self._mock_personalized_recommendations(resume_content, user_profile)
            }

    def generate_industry_specific_insights(self, resume_content: str, industry: str, profession: str) -> Dict[str, Any]:
        """Generate industry-specific insights and recommendations"""
        try:
            if not self.openai_api_key:
                return self._mock_industry_insights(resume_content, industry, profession)
            
            # Get industry-specific information
            industry_data = self.industry_insights.get(industry, {})
            
            # Analyze industry alignment
            industry_analysis = {
                'industry_trends': industry_data.get('trends', []),
                'key_skills': industry_data.get('key_skills', []),
                'trend_alignment': self._analyze_trend_alignment(resume_content, industry_data.get('trends', [])),
                'skill_alignment': self._analyze_skill_alignment(resume_content, industry_data.get('key_skills', [])),
                'industry_recommendations': industry_data.get('recommendations', []),
                'competitive_advantages': [],
                'improvement_areas': []
            }
            
            # Identify competitive advantages and improvement areas
            industry_analysis['competitive_advantages'] = self._identify_competitive_advantages(
                resume_content, industry, profession
            )
            industry_analysis['improvement_areas'] = self._identify_improvement_areas(
                resume_content, industry, profession
            )
            
            return {
                'success': True,
                'industry_analysis': industry_analysis,
                'industry': industry,
                'profession': profession,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error in industry-specific insights: {e}")
            return {
                'success': False,
                'error': str(e),
                'content': self._mock_industry_insights(resume_content, industry, profession)
            }

    def generate_career_progression_insights(self, resume_content: str, current_role: str, target_role: str, industry: str = None) -> Dict[str, Any]:
        """Generate career progression insights and roadmap"""
        try:
            if not self.openai_api_key:
                return self._mock_career_progression_insights(resume_content, current_role, target_role, industry)
            
            # Analyze current position
            current_analysis = self._analyze_current_position(resume_content, current_role)
            
            # Analyze target position requirements
            target_analysis = self._analyze_target_position_requirements(target_role, industry)
            
            # Generate progression roadmap
            progression_roadmap = {
                'current_position': current_analysis,
                'target_position': target_analysis,
                'skill_gaps': self._identify_skill_gaps_for_progression(current_analysis, target_analysis),
                'experience_gaps': self._identify_experience_gaps_for_progression(current_analysis, target_analysis),
                'progression_steps': self._generate_progression_steps(current_analysis, target_analysis),
                'timeline_estimate': self._estimate_progression_timeline(current_analysis, target_analysis),
                'success_factors': self._identify_success_factors(target_role, industry)
            }
            
            return {
                'success': True,
                'progression_roadmap': progression_roadmap,
                'current_role': current_role,
                'target_role': target_role,
                'industry': industry,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error in career progression insights: {e}")
            return {
                'success': False,
                'error': str(e),
                'content': self._mock_career_progression_insights(resume_content, current_role, target_role, industry)
            }

    def _determine_career_level(self, experience_years: int) -> str:
        """Determine career level based on experience years"""
        if experience_years < 2:
            return 'entry_level'
        elif experience_years < 5:
            return 'mid_level'
        elif experience_years < 10:
            return 'senior_level'
        else:
            return 'executive_level'

    def _analyze_career_strategy(self, resume_content: str, profession: str, career_level: str, industry: str) -> Dict[str, Any]:
        """Analyze career strategy and progression"""
        career_insights = self.career_level_insights.get(career_level, {})
        
        return {
            'focus_areas': career_insights.get('focus_areas', []),
            'key_metrics': career_insights.get('key_metrics', []),
            'recommendations': career_insights.get('recommendations', []),
            'career_progression': self._analyze_career_progression(resume_content, profession, career_level),
            'skill_gaps': self._identify_skill_gaps(resume_content, career_level, industry),
            'market_positioning': self._analyze_market_positioning_strategy(resume_content, profession, industry)
        }

    def _analyze_content_optimization(self, resume_content: str, career_level: str) -> Dict[str, Any]:
        """Analyze content optimization opportunities"""
        return {
            'content_effectiveness': self._assess_content_effectiveness(resume_content, career_level),
            'message_clarity': self._assess_message_clarity(resume_content),
            'impact_measurement': self._assess_impact_measurement(resume_content),
            'optimization_opportunities': self._identify_content_optimization_opportunities(resume_content, career_level)
        }

    def _analyze_market_intelligence(self, profession: str, industry: str) -> Dict[str, Any]:
        """Analyze market intelligence and trends"""
        industry_data = self.industry_insights.get(industry, {})
        
        return {
            'industry_trends': industry_data.get('trends', []),
            'salary_benchmarks': self._get_salary_benchmarks(profession, industry),
            'demand_analysis': self._analyze_demand_trends(profession, industry),
            'market_opportunities': self._identify_market_opportunities(profession, industry)
        }

    def _analyze_personal_branding(self, resume_content: str, profession: str, career_level: str) -> Dict[str, Any]:
        """Analyze personal branding and differentiation"""
        return {
            'brand_consistency': self._assess_brand_consistency(resume_content),
            'unique_value_proposition': self._identify_unique_value_proposition(resume_content, profession),
            'differentiation': self._analyze_differentiation_factors(resume_content, career_level),
            'brand_development_opportunities': self._identify_brand_development_opportunities(resume_content)
        }

    def _generate_strategic_recommendations(self, strategic_analysis: Dict[str, Any], profession: str, career_level: str, industry: str) -> List[str]:
        """Generate strategic recommendations"""
        recommendations = []
        
        # Career strategy recommendations
        career_strategy = strategic_analysis.get('career_strategy', {})
        recommendations.extend(career_strategy.get('recommendations', []))
        
        # Content optimization recommendations
        content_optimization = strategic_analysis.get('content_optimization', {})
        opportunities = content_optimization.get('optimization_opportunities', [])
        recommendations.extend([f"Optimize {opp}" for opp in opportunities[:3]])
        
        # Market intelligence recommendations
        market_intelligence = strategic_analysis.get('market_intelligence', {})
        trends = market_intelligence.get('industry_trends', [])
        if trends:
            recommendations.append(f"Align with industry trends: {', '.join(trends[:3])}")
        
        # Personal branding recommendations
        personal_branding = strategic_analysis.get('personal_branding', {})
        brand_opportunities = personal_branding.get('brand_development_opportunities', [])
        recommendations.extend(brand_opportunities[:2])
        
        return recommendations[:8]  # Limit to top 8 recommendations

    def _identify_strategic_priorities(self, strategic_analysis: Dict[str, Any], career_level: str, industry: str) -> List[str]:
        """Identify strategic priorities"""
        priorities = []
        
        # Career level priorities
        career_insights = self.career_level_insights.get(career_level, {})
        priorities.extend(career_insights.get('focus_areas', [])[:2])
        
        # Industry priorities
        industry_data = self.industry_insights.get(industry, {})
        if industry_data.get('trends'):
            priorities.append(f"Stay current with {industry} trends")
        
        # Content priorities
        content_optimization = strategic_analysis.get('content_optimization', {})
        if content_optimization.get('optimization_opportunities'):
            priorities.append("Optimize content for maximum impact")
        
        return priorities[:5]  # Limit to top 5 priorities

    def _mock_strategic_insights(self, resume_content: str, profession: str, experience_years: int, industry: str) -> Dict[str, Any]:
        """Mock strategic insights for testing"""
        career_level = self._determine_career_level(experience_years)
        
        return {
            'success': True,
            'strategic_analysis': {
                'career_level': career_level,
                'career_strategy': {
                    'focus_areas': ['achievements', 'leadership', 'technical_skills'],
                    'key_metrics': ['quantifiable_results', 'team_size', 'project_scope'],
                    'recommendations': ['Quantify achievements', 'Show leadership impact', 'Demonstrate technical depth']
                },
                'content_optimization': {
                    'content_effectiveness': 'Good',
                    'message_clarity': 'Clear',
                    'impact_measurement': 'Strong',
                    'optimization_opportunities': ['Add more metrics', 'Enhance leadership examples']
                },
                'market_intelligence': {
                    'industry_trends': ['Digital transformation', 'AI/ML', 'Cloud computing'],
                    'salary_benchmarks': 'Competitive',
                    'demand_analysis': 'High demand',
                    'market_opportunities': ['Emerging technologies', 'Leadership roles']
                },
                'personal_branding': {
                    'brand_consistency': 'Consistent',
                    'unique_value_proposition': 'Technical leadership',
                    'differentiation': 'Strong',
                    'brand_development_opportunities': ['Thought leadership', 'Industry recognition']
                },
                'actionable_recommendations': [
                    'Quantify achievements with specific metrics',
                    'Highlight leadership and team management experience',
                    'Emphasize technical depth and innovation',
                    'Align with industry trends and emerging technologies'
                ],
                'strategic_priorities': [
                    'Achievements and impact measurement',
                    'Leadership demonstration',
                    'Technical skill depth',
                    'Industry trend alignment'
                ]
            },
            'profession': profession,
            'experience_years': experience_years,
            'industry': industry,
            'career_level': career_level,
            'timestamp': datetime.now().isoformat()
        }

    def _mock_personalized_recommendations(self, resume_content: str, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """Mock personalized recommendations for testing"""
        return {
            'success': True,
            'personalized_analysis': {
                'career_alignment': {
                    'alignment_score': 85,
                    'alignment_factors': ['Strong technical skills', 'Relevant experience'],
                    'misalignment_areas': ['Missing leadership examples']
                },
                'skill_gap_analysis': {
                    'identified_gaps': ['Advanced analytics', 'Strategic planning'],
                    'skill_priorities': ['Data analysis', 'Project management'],
                    'development_recommendations': ['Take advanced courses', 'Seek leadership opportunities']
                },
                'market_positioning': {
                    'current_position': 'Strong technical contributor',
                    'target_position': 'Technical leader',
                    'positioning_strategy': 'Emphasize leadership potential'
                },
                'opportunity_identification': {
                    'immediate_opportunities': ['Technical lead roles', 'Project management'],
                    'long_term_opportunities': ['Senior technical roles', 'Architecture positions'],
                    'growth_areas': ['Leadership development', 'Strategic thinking']
                },
                'personalized_recommendations': [
                    'Highlight leadership experience and potential',
                    'Add more quantifiable achievements',
                    'Develop strategic thinking skills',
                    'Seek opportunities to lead technical projects'
                ]
            },
            'user_profile': user_profile,
            'timestamp': datetime.now().isoformat()
        }

    def _mock_industry_insights(self, resume_content: str, industry: str, profession: str) -> Dict[str, Any]:
        """Mock industry insights for testing"""
        return {
            'success': True,
            'industry_analysis': {
                'industry_trends': ['AI/ML', 'Cloud Computing', 'DevOps'],
                'key_skills': ['Programming', 'System Design', 'Agile'],
                'trend_alignment': {
                    'alignment_score': 80,
                    'aligned_trends': ['Cloud Computing', 'Agile'],
                    'missing_trends': ['AI/ML']
                },
                'skill_alignment': {
                    'alignment_score': 85,
                    'aligned_skills': ['Programming', 'System Design'],
                    'missing_skills': ['Advanced AI/ML']
                },
                'industry_recommendations': [
                    'Stay current with tech trends',
                    'Show technical depth',
                    'Emphasize innovation'
                ],
                'competitive_advantages': [
                    'Strong technical foundation',
                    'Proven project delivery',
                    'Team collaboration skills'
                ],
                'improvement_areas': [
                    'AI/ML expertise',
                    'Advanced analytics',
                    'Strategic thinking'
                ]
            },
            'industry': industry,
            'profession': profession,
            'timestamp': datetime.now().isoformat()
        }

    def _mock_career_progression_insights(self, resume_content: str, current_role: str, target_role: str, industry: str) -> Dict[str, Any]:
        """Mock career progression insights for testing"""
        return {
            'success': True,
            'progression_roadmap': {
                'current_position': {
                    'strengths': ['Technical skills', 'Project delivery'],
                    'weaknesses': ['Leadership experience', 'Strategic thinking'],
                    'readiness_score': 70
                },
                'target_position': {
                    'requirements': ['Leadership experience', 'Strategic thinking', 'Team management'],
                    'key_skills': ['Technical leadership', 'Project management', 'Business acumen'],
                    'experience_needed': '3-5 years leadership'
                },
                'skill_gaps': [
                    'Leadership and team management',
                    'Strategic planning and execution',
                    'Business strategy and acumen'
                ],
                'experience_gaps': [
                    'Managing large teams',
                    'Strategic project planning',
                    'Cross-functional leadership'
                ],
                'progression_steps': [
                    'Take on team lead responsibilities',
                    'Develop strategic thinking skills',
                    'Gain cross-functional experience',
                    'Build business acumen'
                ],
                'timeline_estimate': '2-3 years',
                'success_factors': [
                    'Demonstrated leadership potential',
                    'Strong technical foundation',
                    'Business understanding',
                    'Strategic thinking ability'
                ]
            },
            'current_role': current_role,
            'target_role': target_role,
            'industry': industry,
            'timestamp': datetime.now().isoformat()
        }

# Global instance for easy access
advanced_insights_engine = AdvancedInsightsEngine()























