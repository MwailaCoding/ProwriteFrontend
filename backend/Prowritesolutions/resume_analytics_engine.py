"""
Resume Analytics Engine
Provides comprehensive analytics, performance metrics, and actionable insights
"""

import os
import json
import re
import openai
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from collections import defaultdict

class ResumeAnalyticsEngine:
    def __init__(self):
        """Initialize the resume analytics engine"""
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        if self.openai_api_key:
            openai.api_key = self.openai_api_key
        
        # Analytics categories and metrics
        self.analytics_categories = {
            'content_analysis': {
                'metrics': ['word_count', 'sentence_count', 'paragraph_count', 'bullet_point_count'],
                'insights': ['readability_score', 'content_density', 'structure_balance']
            },
            'keyword_analysis': {
                'metrics': ['keyword_density', 'unique_keywords', 'industry_keywords', 'action_verbs'],
                'insights': ['keyword_effectiveness', 'ats_compatibility', 'industry_alignment']
            },
            'impact_analysis': {
                'metrics': ['quantifiable_results', 'achievement_statements', 'leadership_indicators'],
                'insights': ['impact_strength', 'achievement_quality', 'leadership_demonstration']
            },
            'formatting_analysis': {
                'metrics': ['section_count', 'consistent_formatting', 'ats_friendly_elements'],
                'insights': ['formatting_quality', 'visual_appeal', 'professional_presentation']
            }
        }
        
        # Performance benchmarks by industry
        self.industry_benchmarks = {
            'technology': {
                'avg_word_count': 450,
                'avg_keywords': 25,
                'avg_achievements': 8,
                'target_readability': 70,
                'key_metrics': ['technical_skills', 'project_management', 'innovation']
            },
            'marketing': {
                'avg_word_count': 400,
                'avg_keywords': 20,
                'avg_achievements': 6,
                'target_readability': 75,
                'key_metrics': ['campaign_results', 'brand_awareness', 'lead_generation']
            },
            'finance': {
                'avg_word_count': 500,
                'avg_keywords': 30,
                'avg_achievements': 10,
                'target_readability': 65,
                'key_metrics': ['financial_analysis', 'risk_management', 'compliance']
            },
            'healthcare': {
                'avg_word_count': 350,
                'avg_keywords': 18,
                'avg_achievements': 5,
                'target_readability': 80,
                'key_metrics': ['patient_care', 'clinical_skills', 'safety_protocols']
            }
        }
        
        # Trend analysis patterns
        self.trend_patterns = {
            'improvement_indicators': [
                'increased_keyword_density',
                'more_quantifiable_results',
                'better_action_verbs',
                'improved_structure'
            ],
            'decline_indicators': [
                'decreased_readability',
                'fewer_achievements',
                'weak_action_verbs',
                'poor_formatting'
            ]
        }

    def generate_comprehensive_analytics(self, resume_content: str, profession: str = None, industry: str = None) -> Dict[str, Any]:
        """Generate comprehensive analytics for resume content"""
        try:
            if not self.openai_api_key:
                return self._mock_comprehensive_analytics(resume_content, profession, industry)
            
            # Perform detailed analysis
            analytics_results = {}
            
            # Content Analysis
            content_metrics = self._analyze_content_metrics(resume_content)
            analytics_results['content_analysis'] = {
                'metrics': content_metrics,
                'insights': self._generate_content_insights(content_metrics, industry),
                'score': self._calculate_content_score(content_metrics, industry)
            }
            
            # Keyword Analysis
            keyword_metrics = self._analyze_keyword_metrics(resume_content, industry)
            analytics_results['keyword_analysis'] = {
                'metrics': keyword_metrics,
                'insights': self._generate_keyword_insights(keyword_metrics, industry),
                'score': self._calculate_keyword_score(keyword_metrics, industry)
            }
            
            # Impact Analysis
            impact_metrics = self._analyze_impact_metrics(resume_content)
            analytics_results['impact_analysis'] = {
                'metrics': impact_metrics,
                'insights': self._generate_impact_insights(impact_metrics, industry),
                'score': self._calculate_impact_score(impact_metrics, industry)
            }
            
            # Formatting Analysis
            formatting_metrics = self._analyze_formatting_metrics(resume_content)
            analytics_results['formatting_analysis'] = {
                'metrics': formatting_metrics,
                'insights': self._generate_formatting_insights(formatting_metrics),
                'score': self._calculate_formatting_score(formatting_metrics)
            }
            
            # Overall Performance Score
            overall_score = self._calculate_overall_score(analytics_results)
            
            # Generate actionable recommendations
            recommendations = self._generate_actionable_recommendations(analytics_results, profession, industry)
            
            return {
                'success': True,
                'overall_score': overall_score,
                'category_analytics': analytics_results,
                'recommendations': recommendations,
                'profession': profession,
                'industry': industry,
                'benchmark_comparison': self._compare_with_benchmarks(analytics_results, industry),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error in comprehensive analytics: {e}")
            return {
                'success': False,
                'error': str(e),
                'content': self._mock_comprehensive_analytics(resume_content, profession, industry)
            }

    def analyze_performance_trends(self, resume_versions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze performance trends across multiple resume versions"""
        try:
            if len(resume_versions) < 2:
                return {
                    'success': False,
                    'error': 'Need at least 2 resume versions for trend analysis'
                }
            
            trends = {
                'score_trend': [],
                'improvement_areas': [],
                'decline_areas': [],
                'consistency_analysis': {},
                'recommendations': []
            }
            
            # Analyze score trends
            for version in resume_versions:
                analytics = self.generate_comprehensive_analytics(
                    version['content'], 
                    version.get('profession'), 
                    version.get('industry')
                )
                if analytics['success']:
                    trends['score_trend'].append({
                        'version': version.get('version', 'Unknown'),
                        'date': version.get('date', datetime.now().isoformat()),
                        'score': analytics['overall_score'],
                        'category_scores': {
                            cat: data['score'] for cat, data in analytics['category_analytics'].items()
                        }
                    })
            
            # Identify improvement and decline areas
            if len(trends['score_trend']) >= 2:
                first_version = trends['score_trend'][0]
                latest_version = trends['score_trend'][-1]
                
                for category in first_version['category_scores']:
                    if category in latest_version['category_scores']:
                        change = latest_version['category_scores'][category] - first_version['category_scores'][category]
                        if change > 5:
                            trends['improvement_areas'].append({
                                'category': category,
                                'improvement': change,
                                'description': f"Improved by {change:.1f} points"
                            })
                        elif change < -5:
                            trends['decline_areas'].append({
                                'category': category,
                                'decline': abs(change),
                                'description': f"Declined by {abs(change):.1f} points"
                            })
            
            # Generate trend-based recommendations
            trends['recommendations'] = self._generate_trend_recommendations(trends)
            
            return {
                'success': True,
                'trends': trends,
                'version_count': len(resume_versions),
                'analysis_period': self._calculate_analysis_period(trends['score_trend']),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error in performance trends analysis: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def generate_competitive_analysis(self, resume_content: str, target_job: str, industry: str = None) -> Dict[str, Any]:
        """Generate competitive analysis against industry standards"""
        try:
            if not self.openai_api_key:
                return self._mock_competitive_analysis(resume_content, target_job, industry)
            
            # Get industry benchmarks
            benchmarks = self.industry_benchmarks.get(industry, self.industry_benchmarks['technology'])
            
            # Analyze current resume
            current_analytics = self.generate_comprehensive_analytics(resume_content, target_job, industry)
            
            if not current_analytics['success']:
                return current_analytics
            
            # Compare with benchmarks
            competitive_analysis = {
                'current_performance': current_analytics['overall_score'],
                'industry_average': benchmarks.get('avg_score', 75),
                'competitive_position': self._determine_competitive_position(
                    current_analytics['overall_score'], 
                    benchmarks.get('avg_score', 75)
                ),
                'strengths': [],
                'weaknesses': [],
                'opportunities': [],
                'threats': [],
                'gap_analysis': {},
                'improvement_potential': 0
            }
            
            # Perform gap analysis
            competitive_analysis['gap_analysis'] = self._perform_gap_analysis(
                current_analytics, benchmarks, industry
            )
            
            # Identify SWOT elements
            swot_analysis = self._perform_swot_analysis(current_analytics, industry, target_job)
            competitive_analysis.update(swot_analysis)
            
            # Calculate improvement potential
            competitive_analysis['improvement_potential'] = self._calculate_improvement_potential(
                current_analytics, benchmarks
            )
            
            return {
                'success': True,
                'competitive_analysis': competitive_analysis,
                'target_job': target_job,
                'industry': industry,
                'benchmarks_used': benchmarks,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error in competitive analysis: {e}")
            return {
                'success': False,
                'error': str(e),
                'content': self._mock_competitive_analysis(resume_content, target_job, industry)
            }

    def _analyze_content_metrics(self, content: str) -> Dict[str, Any]:
        """Analyze content metrics"""
        words = content.split()
        sentences = re.split(r'[.!?]+', content)
        paragraphs = content.split('\n\n')
        bullet_points = len(re.findall(r'[•\-\*]\s*', content))
        
        return {
            'word_count': len(words),
            'sentence_count': len([s for s in sentences if s.strip()]),
            'paragraph_count': len([p for p in paragraphs if p.strip()]),
            'bullet_point_count': bullet_points,
            'avg_words_per_sentence': len(words) / max(len([s for s in sentences if s.strip()]), 1),
            'content_density': len(words) / max(len(content), 1) * 100
        }

    def _analyze_keyword_metrics(self, content: str, industry: str = None) -> Dict[str, Any]:
        """Analyze keyword metrics"""
        content_lower = content.lower()
        
        # Extract keywords
        words = re.findall(r'\b\w+\b', content_lower)
        unique_words = list(set(words))
        
        # Count action verbs
        action_verbs = ['achieved', 'implemented', 'developed', 'managed', 'coordinated', 'spearheaded', 'pioneered']
        action_verb_count = sum(1 for verb in action_verbs if verb in content_lower)
        
        # Industry keywords
        industry_keywords = []
        if industry and industry in self.industry_benchmarks:
            industry_keywords = self.industry_benchmarks[industry].get('key_metrics', [])
        
        industry_keyword_count = sum(1 for keyword in industry_keywords if keyword in content_lower)
        
        return {
            'total_keywords': len(unique_words),
            'action_verb_count': action_verb_count,
            'industry_keyword_count': industry_keyword_count,
            'keyword_density': len(unique_words) / max(len(words), 1) * 100,
            'action_verb_ratio': action_verb_count / max(len(words), 1) * 100
        }

    def _analyze_impact_metrics(self, content: str) -> Dict[str, Any]:
        """Analyze impact metrics"""
        # Count quantifiable results
        quantifiable_patterns = [
            r'\d+%', r'\$\d+', r'\d+\s*(?:percent|%)', r'\d+\s*(?:million|thousand|k)',
            r'increased by \d+', r'reduced by \d+', r'improved by \d+'
        ]
        quantifiable_count = sum(len(re.findall(pattern, content, re.IGNORECASE)) for pattern in quantifiable_patterns)
        
        # Count achievement statements
        achievement_indicators = ['achieved', 'accomplished', 'delivered', 'generated', 'increased', 'improved']
        achievement_count = sum(1 for indicator in achievement_indicators if indicator in content.lower())
        
        # Leadership indicators
        leadership_indicators = ['led', 'managed', 'supervised', 'directed', 'coordinated', 'orchestrated']
        leadership_count = sum(1 for indicator in leadership_indicators if indicator in content.lower())
        
        return {
            'quantifiable_results': quantifiable_count,
            'achievement_statements': achievement_count,
            'leadership_indicators': leadership_count,
            'impact_score': (quantifiable_count * 10) + (achievement_count * 5) + (leadership_count * 3)
        }

    def _analyze_formatting_metrics(self, content: str) -> Dict[str, Any]:
        """Analyze formatting metrics"""
        # Count sections
        section_headers = ['experience', 'education', 'skills', 'summary', 'achievements', 'projects']
        section_count = sum(1 for header in section_headers if header in content.lower())
        
        # Check for consistent formatting
        bullet_points = len(re.findall(r'[•\-\*]\s*', content))
        numbered_lists = len(re.findall(r'\d+\.\s*', content))
        
        # ATS-friendly elements
        ats_elements = {
            'standard_fonts': 1,  # Assuming standard fonts
            'clear_sections': 1 if section_count >= 3 else 0,
            'bullet_points': 1 if bullet_points > 0 else 0,
            'consistent_spacing': 1  # Assuming consistent spacing
        }
        
        return {
            'section_count': section_count,
            'bullet_point_count': bullet_points,
            'numbered_list_count': numbered_lists,
            'ats_friendly_score': sum(ats_elements.values()) / len(ats_elements) * 100,
            'formatting_consistency': 1 if bullet_points > 0 and section_count >= 3 else 0
        }

    def _calculate_content_score(self, metrics: Dict[str, Any], industry: str = None) -> float:
        """Calculate content analysis score"""
        benchmark = self.industry_benchmarks.get(industry, self.industry_benchmarks['technology'])
        
        # Word count score
        target_word_count = benchmark.get('avg_word_count', 400)
        word_count_score = min(100, (metrics['word_count'] / target_word_count) * 100)
        
        # Readability score (simplified)
        readability_score = max(0, 100 - abs(metrics['avg_words_per_sentence'] - 15) * 2)
        
        # Content density score
        density_score = min(100, metrics['content_density'] * 10)
        
        return (word_count_score * 0.4 + readability_score * 0.4 + density_score * 0.2)

    def _calculate_keyword_score(self, metrics: Dict[str, Any], industry: str = None) -> float:
        """Calculate keyword analysis score"""
        benchmark = self.industry_benchmarks.get(industry, self.industry_benchmarks['technology'])
        
        # Keyword density score
        target_keywords = benchmark.get('avg_keywords', 20)
        keyword_score = min(100, (metrics['total_keywords'] / target_keywords) * 100)
        
        # Action verb score
        action_verb_score = min(100, metrics['action_verb_ratio'] * 10)
        
        # Industry keyword score
        industry_score = min(100, metrics['industry_keyword_count'] * 20)
        
        return (keyword_score * 0.4 + action_verb_score * 0.3 + industry_score * 0.3)

    def _calculate_impact_score(self, metrics: Dict[str, Any], industry: str = None) -> float:
        """Calculate impact analysis score"""
        benchmark = self.industry_benchmarks.get(industry, self.industry_benchmarks['technology'])
        
        # Achievement score
        target_achievements = benchmark.get('avg_achievements', 6)
        achievement_score = min(100, (metrics['achievement_statements'] / target_achievements) * 100)
        
        # Quantifiable results score
        quantifiable_score = min(100, metrics['quantifiable_results'] * 15)
        
        # Leadership score
        leadership_score = min(100, metrics['leadership_indicators'] * 10)
        
        return (achievement_score * 0.4 + quantifiable_score * 0.4 + leadership_score * 0.2)

    def _calculate_formatting_score(self, metrics: Dict[str, Any]) -> float:
        """Calculate formatting analysis score"""
        # ATS-friendly score
        ats_score = metrics['ats_friendly_score']
        
        # Section completeness score
        section_score = min(100, metrics['section_count'] * 20)
        
        # Formatting consistency score
        consistency_score = metrics['formatting_consistency'] * 100
        
        return (ats_score * 0.5 + section_score * 0.3 + consistency_score * 0.2)

    def _calculate_overall_score(self, analytics_results: Dict[str, Any]) -> float:
        """Calculate overall performance score"""
        weights = {
            'content_analysis': 0.25,
            'keyword_analysis': 0.25,
            'impact_analysis': 0.30,
            'formatting_analysis': 0.20
        }
        
        overall_score = 0
        for category, weight in weights.items():
            if category in analytics_results:
                overall_score += analytics_results[category]['score'] * weight
        
        return overall_score

    def _generate_actionable_recommendations(self, analytics_results: Dict[str, Any], profession: str, industry: str) -> List[str]:
        """Generate actionable recommendations based on analytics"""
        recommendations = []
        
        # Content recommendations
        content_score = analytics_results.get('content_analysis', {}).get('score', 0)
        if content_score < 70:
            recommendations.append("Increase content length and add more detailed descriptions")
        
        # Keyword recommendations
        keyword_score = analytics_results.get('keyword_analysis', {}).get('score', 0)
        if keyword_score < 70:
            recommendations.append("Add more industry-specific keywords and action verbs")
        
        # Impact recommendations
        impact_score = analytics_results.get('impact_analysis', {}).get('score', 0)
        if impact_score < 70:
            recommendations.append("Include more quantifiable achievements and measurable results")
        
        # Formatting recommendations
        formatting_score = analytics_results.get('formatting_analysis', {}).get('score', 0)
        if formatting_score < 70:
            recommendations.append("Improve formatting consistency and ensure ATS compatibility")
        
        return recommendations[:5]  # Limit to top 5 recommendations

    def _compare_with_benchmarks(self, analytics_results: Dict[str, Any], industry: str) -> Dict[str, Any]:
        """Compare current performance with industry benchmarks"""
        benchmark = self.industry_benchmarks.get(industry, self.industry_benchmarks['technology'])
        
        comparison = {}
        for category, data in analytics_results.items():
            category_score = data.get('score', 0)
            comparison[category] = {
                'current_score': category_score,
                'industry_average': benchmark.get(f'avg_{category}_score', 75),
                'performance': 'above_average' if category_score > 75 else 'average' if category_score > 60 else 'below_average'
            }
        
        return comparison

    def _mock_comprehensive_analytics(self, resume_content: str, profession: str, industry: str) -> Dict[str, Any]:
        """Mock comprehensive analytics for testing"""
        return {
            'success': True,
            'overall_score': 78.5,
            'category_analytics': {
                'content_analysis': {
                    'metrics': {'word_count': 450, 'sentence_count': 25},
                    'insights': ['Good content length', 'Clear structure'],
                    'score': 80.0
                },
                'keyword_analysis': {
                    'metrics': {'total_keywords': 25, 'action_verb_count': 8},
                    'insights': ['Strong keyword usage', 'Good action verbs'],
                    'score': 75.0
                },
                'impact_analysis': {
                    'metrics': {'quantifiable_results': 5, 'achievement_statements': 7},
                    'insights': ['Good achievements', 'Quantifiable results present'],
                    'score': 85.0
                },
                'formatting_analysis': {
                    'metrics': {'section_count': 5, 'ats_friendly_score': 90},
                    'insights': ['ATS-friendly', 'Good formatting'],
                    'score': 90.0
                }
            },
            'recommendations': [
                'Add more industry-specific keywords',
                'Include more quantifiable results',
                'Improve content structure'
            ],
            'profession': profession,
            'industry': industry,
            'benchmark_comparison': {},
            'timestamp': datetime.now().isoformat()
        }

    def _mock_competitive_analysis(self, resume_content: str, target_job: str, industry: str) -> Dict[str, Any]:
        """Mock competitive analysis for testing"""
        return {
            'success': True,
            'competitive_analysis': {
                'current_performance': 78.5,
                'industry_average': 75.0,
                'competitive_position': 'above_average',
                'strengths': ['Strong achievements', 'Good formatting'],
                'weaknesses': ['Limited keywords', 'Few quantifiable results'],
                'opportunities': ['Add more industry keywords', 'Include more metrics'],
                'threats': ['Competition has stronger keywords'],
                'gap_analysis': {},
                'improvement_potential': 15.0
            },
            'target_job': target_job,
            'industry': industry,
            'benchmarks_used': self.industry_benchmarks.get(industry, {}),
            'timestamp': datetime.now().isoformat()
        }

# Global instance for easy access
resume_analytics_engine = ResumeAnalyticsEngine()























