"""
Analytics Dashboard System
Phase 4: Usage tracking, insights, and performance metrics
"""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime, timedelta
import json
import statistics

@dataclass
class UsageMetrics:
    total_cover_letters: int
    total_downloads: int
    total_enhancements: int
    average_ats_score: float
    most_used_template: str
    average_creation_time: float
    success_rate: float

@dataclass
class PerformanceMetrics:
    response_time_avg: float
    error_rate: float
    user_satisfaction: float
    feature_usage: Dict[str, int]
    peak_usage_hours: List[int]

@dataclass
class UserInsights:
    user_id: int
    total_cover_letters: int
    favorite_templates: List[str]
    average_ats_score: float
    improvement_trend: str
    collaboration_score: float

class AnalyticsDashboard:
    def __init__(self):
        self.usage_data = {}
        self.performance_data = {}
        self.user_insights = {}
        
    def track_cover_letter_creation(self, user_id: int, template_used: str, 
                                  creation_time: float, ats_score: float):
        """Track cover letter creation metrics"""
        if user_id not in self.usage_data:
            self.usage_data[user_id] = {
                "cover_letters_created": 0,
                "templates_used": {},
                "creation_times": [],
                "ats_scores": [],
                "downloads": 0,
                "enhancements": 0
            }
        
        user_data = self.usage_data[user_id]
        user_data["cover_letters_created"] += 1
        user_data["creation_times"].append(creation_time)
        user_data["ats_scores"].append(ats_score)
        
        if template_used not in user_data["templates_used"]:
            user_data["templates_used"][template_used] = 0
        user_data["templates_used"][template_used] += 1
    
    def track_download(self, user_id: int):
        """Track cover letter download"""
        if user_id in self.usage_data:
            self.usage_data[user_id]["downloads"] += 1
    
    def track_enhancement(self, user_id: int):
        """Track cover letter enhancement"""
        if user_id in self.usage_data:
            self.usage_data[user_id]["enhancements"] += 1
    
    def track_performance(self, endpoint: str, response_time: float, success: bool):
        """Track API performance metrics"""
        if endpoint not in self.performance_data:
            self.performance_data[endpoint] = {
                "response_times": [],
                "success_count": 0,
                "error_count": 0,
                "total_requests": 0
            }
        
        endpoint_data = self.performance_data[endpoint]
        endpoint_data["response_times"].append(response_time)
        endpoint_data["total_requests"] += 1
        
        if success:
            endpoint_data["success_count"] += 1
        else:
            endpoint_data["error_count"] += 1
    
    def get_user_analytics(self, user_id: int) -> Optional[UserInsights]:
        """Get comprehensive analytics for a specific user"""
        if user_id not in self.usage_data:
            return None
        
        user_data = self.usage_data[user_id]
        
        # Calculate favorite templates
        templates = user_data["templates_used"]
        favorite_templates = sorted(templates.items(), key=lambda x: x[1], reverse=True)[:3]
        favorite_template_names = [t[0] for t in favorite_templates]
        
        # Calculate average ATS score
        ats_scores = user_data["ats_scores"]
        average_ats_score = statistics.mean(ats_scores) if ats_scores else 0
        
        # Calculate improvement trend
        improvement_trend = self._calculate_improvement_trend(ats_scores)
        
        # Calculate collaboration score (placeholder)
        collaboration_score = min(user_data["enhancements"] / max(user_data["cover_letters_created"], 1), 1.0)
        
        return UserInsights(
            user_id=user_id,
            total_cover_letters=user_data["cover_letters_created"],
            favorite_templates=favorite_template_names,
            average_ats_score=round(average_ats_score, 2),
            improvement_trend=improvement_trend,
            collaboration_score=round(collaboration_score, 2)
        )
    
    def get_global_usage_metrics(self) -> UsageMetrics:
        """Get global usage metrics across all users"""
        total_cover_letters = sum(data["cover_letters_created"] for data in self.usage_data.values())
        total_downloads = sum(data["downloads"] for data in self.usage_data.values())
        total_enhancements = sum(data["enhancements"] for data in self.usage_data.values())
        
        # Calculate average ATS score
        all_ats_scores = []
        for data in self.usage_data.values():
            all_ats_scores.extend(data["ats_scores"])
        average_ats_score = statistics.mean(all_ats_scores) if all_ats_scores else 0
        
        # Find most used template
        template_usage = {}
        for data in self.usage_data.values():
            for template, count in data["templates_used"].items():
                if template not in template_usage:
                    template_usage[template] = 0
                template_usage[template] += count
        
        most_used_template = max(template_usage.items(), key=lambda x: x[1])[0] if template_usage else "None"
        
        # Calculate average creation time
        all_creation_times = []
        for data in self.usage_data.values():
            all_creation_times.extend(data["creation_times"])
        average_creation_time = statistics.mean(all_creation_times) if all_creation_times else 0
        
        # Calculate success rate
        success_rate = (total_downloads / max(total_cover_letters, 1)) * 100
        
        return UsageMetrics(
            total_cover_letters=total_cover_letters,
            total_downloads=total_downloads,
            total_enhancements=total_enhancements,
            average_ats_score=round(average_ats_score, 2),
            most_used_template=most_used_template,
            average_creation_time=round(average_creation_time, 2),
            success_rate=round(success_rate, 2)
        )
    
    def get_performance_metrics(self) -> PerformanceMetrics:
        """Get system performance metrics"""
        all_response_times = []
        total_requests = 0
        total_errors = 0
        
        for endpoint_data in self.performance_data.values():
            all_response_times.extend(endpoint_data["response_times"])
            total_requests += endpoint_data["total_requests"]
            total_errors += endpoint_data["error_count"]
        
        response_time_avg = statistics.mean(all_response_times) if all_response_times else 0
        error_rate = (total_errors / max(total_requests, 1)) * 100
        
        # Calculate feature usage
        feature_usage = {}
        for endpoint, data in self.performance_data.items():
            feature_name = endpoint.split('/')[-1] if '/' in endpoint else endpoint
            feature_usage[feature_name] = data["total_requests"]
        
        # Placeholder for user satisfaction and peak usage hours
        user_satisfaction = 85.0  # This would come from user surveys
        peak_usage_hours = [9, 10, 14, 15, 16]  # This would be calculated from actual usage data
        
        return PerformanceMetrics(
            response_time_avg=round(response_time_avg, 3),
            error_rate=round(error_rate, 2),
            user_satisfaction=user_satisfaction,
            feature_usage=feature_usage,
            peak_usage_hours=peak_usage_hours
        )
    
    def get_trend_analysis(self, days: int = 30) -> Dict[str, Any]:
        """Get trend analysis for the specified period"""
        # This would typically query a time-series database
        # For now, we'll generate sample trend data
        
        trend_data = {
            "cover_letter_creation": {
                "trend": "increasing",
                "growth_rate": 15.5,
                "daily_average": 25.3
            },
            "ats_score_improvement": {
                "trend": "improving",
                "average_improvement": 8.2,
                "consistency_score": 92.1
            },
            "template_usage": {
                "trend": "diversifying",
                "most_popular": "modern",
                "emerging_trend": "executive"
            },
            "user_engagement": {
                "trend": "stable",
                "daily_active_users": 150,
                "retention_rate": 78.5
            }
        }
        
        return trend_data
    
    def get_recommendations(self, user_id: int) -> List[Dict[str, Any]]:
        """Get personalized recommendations for a user"""
        user_insights = self.get_user_analytics(user_id)
        if not user_insights:
            return []
        
        recommendations = []
        
        # Template recommendations
        if len(user_insights.favorite_templates) < 3:
            recommendations.append({
                "type": "template_exploration",
                "title": "Try New Templates",
                "description": "Explore different templates to diversify your cover letter style",
                "priority": "medium"
            })
        
        # ATS score recommendations
        if user_insights.average_ats_score < 75:
            recommendations.append({
                "type": "ats_improvement",
                "title": "Improve ATS Score",
                "description": "Your average ATS score is below optimal. Try using the ATS enhancement features.",
                "priority": "high"
            })
        
        # Collaboration recommendations
        if user_insights.collaboration_score < 0.5:
            recommendations.append({
                "type": "collaboration",
                "title": "Enable Collaboration",
                "description": "Share your cover letters for feedback to improve quality",
                "priority": "medium"
            })
        
        # Usage recommendations
        if user_insights.total_cover_letters < 5:
            recommendations.append({
                "type": "usage_encouragement",
                "title": "Create More Cover Letters",
                "description": "Practice makes perfect! Create more cover letters to improve your skills",
                "priority": "low"
            })
        
        return recommendations
    
    def generate_analytics_report(self, user_id: Optional[int] = None) -> Dict[str, Any]:
        """Generate a comprehensive analytics report"""
        report = {
            "generated_at": datetime.now().isoformat(),
            "global_metrics": self.get_global_usage_metrics().__dict__,
            "performance_metrics": self.get_performance_metrics().__dict__,
            "trend_analysis": self.get_trend_analysis()
        }
        
        if user_id:
            user_insights = self.get_user_analytics(user_id)
            if user_insights:
                report["user_insights"] = user_insights.__dict__
                report["recommendations"] = self.get_recommendations(user_id)
        
        return report
    
    def _calculate_improvement_trend(self, ats_scores: List[float]) -> str:
        """Calculate improvement trend from ATS scores"""
        if len(ats_scores) < 2:
            return "insufficient_data"
        
        # Calculate trend using linear regression (simplified)
        recent_scores = ats_scores[-5:]  # Last 5 scores
        if len(recent_scores) < 2:
            return "stable"
        
        first_half = recent_scores[:len(recent_scores)//2]
        second_half = recent_scores[len(recent_scores)//2:]
        
        avg_first = statistics.mean(first_half)
        avg_second = statistics.mean(second_half)
        
        if avg_second > avg_first + 5:
            return "improving"
        elif avg_second < avg_first - 5:
            return "declining"
        else:
            return "stable"











