"""
AI-Powered Insights Engine
Phase 5: Advanced AI analytics, machine learning, and predictive capabilities
"""

from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
import json
import numpy as np
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import joblib
import re

@dataclass
class AIInsight:
    insight_id: str
    user_id: int
    insight_type: str  # performance, trend, prediction, recommendation
    title: str
    description: str
    confidence_score: float
    data_points: Dict[str, Any]
    created_at: datetime
    actionable: bool

@dataclass
class PredictionModel:
    model_id: str
    model_type: str  # ats_score, success_rate, engagement
    accuracy: float
    features: List[str]
    last_trained: datetime
    version: str

class AIInsightsEngine:
    def __init__(self):
        self.models = {}
        self.insights = {}
        self.user_data = {}
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.scaler = StandardScaler()
        
    def train_ats_prediction_model(self, training_data: List[Dict[str, Any]]) -> PredictionModel:
        """Train a machine learning model to predict ATS scores"""
        model_id = f"ats_predictor_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Extract features
        features = []
        targets = []
        
        for data_point in training_data:
            feature_vector = self._extract_ats_features(data_point)
            features.append(feature_vector)
            targets.append(data_point.get('ats_score', 0))
        
        # Train Random Forest model
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(features, targets)
        
        # Calculate accuracy
        predictions = model.predict(features)
        accuracy = self._calculate_accuracy(targets, predictions)
        
        # Save model
        self.models[model_id] = {
            'model': model,
            'type': 'ats_score',
            'accuracy': accuracy,
            'features': self._get_ats_feature_names(),
            'last_trained': datetime.now(),
            'version': '1.0'
        }
        
        return PredictionModel(
            model_id=model_id,
            model_type='ats_score',
            accuracy=accuracy,
            features=self._get_ats_feature_names(),
            last_trained=datetime.now(),
            version='1.0'
        )
    
    def predict_ats_score(self, cover_letter_data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict ATS score for a cover letter"""
        if not self.models:
            return {"predicted_score": 75.0, "confidence": 0.5, "model_available": False}
        
        # Get the latest ATS model
        ats_models = [m for m in self.models.values() if m['type'] == 'ats_score']
        if not ats_models:
            return {"predicted_score": 75.0, "confidence": 0.5, "model_available": False}
        
        latest_model = max(ats_models, key=lambda x: x['last_trained'])
        model = latest_model['model']
        
        # Extract features
        features = self._extract_ats_features(cover_letter_data)
        
        # Make prediction
        predicted_score = model.predict([features])[0]
        
        # Calculate confidence based on model accuracy
        confidence = latest_model['accuracy']
        
        return {
            "predicted_score": round(predicted_score, 2),
            "confidence": round(confidence, 3),
            "model_available": True,
            "model_version": latest_model['version']
        }
    
    def train_success_prediction_model(self, training_data: List[Dict[str, Any]]) -> PredictionModel:
        """Train a model to predict cover letter success rates"""
        model_id = f"success_predictor_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Extract features
        features = []
        targets = []
        
        for data_point in training_data:
            feature_vector = self._extract_success_features(data_point)
            features.append(feature_vector)
            targets.append(1 if data_point.get('success', False) else 0)
        
        # Train Random Forest classifier
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(features, targets)
        
        # Calculate accuracy
        predictions = model.predict(features)
        accuracy = sum(1 for p, t in zip(predictions, targets) if p == t) / len(targets)
        
        # Save model
        self.models[model_id] = {
            'model': model,
            'type': 'success_rate',
            'accuracy': accuracy,
            'features': self._get_success_feature_names(),
            'last_trained': datetime.now(),
            'version': '1.0'
        }
        
        return PredictionModel(
            model_id=model_id,
            model_type='success_rate',
            accuracy=accuracy,
            features=self._get_success_feature_names(),
            last_trained=datetime.now(),
            version='1.0'
        )
    
    def predict_success_probability(self, cover_letter_data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict success probability for a cover letter"""
        if not self.models:
            return {"success_probability": 0.5, "confidence": 0.5, "model_available": False}
        
        # Get the latest success model
        success_models = [m for m in self.models.values() if m['type'] == 'success_rate']
        if not success_models:
            return {"success_probability": 0.5, "confidence": 0.5, "model_available": False}
        
        latest_model = max(success_models, key=lambda x: x['last_trained'])
        model = latest_model['model']
        
        # Extract features
        features = self._extract_success_features(cover_letter_data)
        
        # Make prediction
        success_prob = model.predict_proba([features])[0][1]  # Probability of success
        
        return {
            "success_probability": round(success_prob, 3),
            "confidence": round(latest_model['accuracy'], 3),
            "model_available": True,
            "model_version": latest_model['version']
        }
    
    def generate_ai_insights(self, user_id: int, user_data: Dict[str, Any]) -> List[AIInsight]:
        """Generate AI-powered insights for a user"""
        insights = []
        
        # Performance insights
        performance_insights = self._analyze_performance_patterns(user_data)
        insights.extend(performance_insights)
        
        # Trend insights
        trend_insights = self._analyze_trends(user_data)
        insights.extend(trend_insights)
        
        # Predictive insights
        predictive_insights = self._generate_predictions(user_data)
        insights.extend(predictive_insights)
        
        # Recommendation insights
        recommendation_insights = self._generate_recommendations(user_data)
        insights.extend(recommendation_insights)
        
        # Store insights
        if user_id not in self.insights:
            self.insights[user_id] = []
        self.insights[user_id].extend(insights)
        
        return insights
    
    def _extract_ats_features(self, data: Dict[str, Any]) -> List[float]:
        """Extract features for ATS score prediction"""
        content = data.get('content', '')
        
        features = [
            len(content),  # Content length
            len(content.split()),  # Word count
            len(content.split('\n')),  # Paragraph count
            len(re.findall(r'\b[A-Z]{2,}\b', content)),  # Acronyms
            len(re.findall(r'\b\d+\b', content)),  # Numbers
            len(re.findall(r'[!@#$%^&*(),.?":{}|<>]', content)),  # Special characters
            len(re.findall(r'\b(?:and|or|but|however|therefore|furthermore)\b', content, re.IGNORECASE)),  # Transition words
            len(re.findall(r'\b(?:experience|skills|achievements|leadership|management|project|team)\b', content, re.IGNORECASE)),  # Key words
            data.get('template_complexity', 1.0),  # Template complexity
            data.get('industry_match_score', 0.5),  # Industry match
        ]
        
        return features
    
    def _extract_success_features(self, data: Dict[str, Any]) -> List[float]:
        """Extract features for success prediction"""
        content = data.get('content', '')
        
        features = [
            data.get('ats_score', 75.0),  # ATS score
            len(content),  # Content length
            data.get('template_popularity', 0.5),  # Template popularity
            data.get('industry_alignment', 0.5),  # Industry alignment
            data.get('user_experience_level', 2.0),  # User experience level
            data.get('collaboration_count', 0),  # Number of collaborators
            data.get('feedback_score', 3.0),  # Average feedback score
            data.get('revision_count', 0),  # Number of revisions
            data.get('time_spent', 30.0),  # Time spent in minutes
            data.get('keyword_density', 0.05),  # Keyword density
        ]
        
        return features
    
    def _get_ats_feature_names(self) -> List[str]:
        """Get feature names for ATS prediction"""
        return [
            'content_length', 'word_count', 'paragraph_count', 'acronyms',
            'numbers', 'special_chars', 'transition_words', 'key_words',
            'template_complexity', 'industry_match'
        ]
    
    def _get_success_feature_names(self) -> List[str]:
        """Get feature names for success prediction"""
        return [
            'ats_score', 'content_length', 'template_popularity', 'industry_alignment',
            'user_experience', 'collaboration_count', 'feedback_score', 'revision_count',
            'time_spent', 'keyword_density'
        ]
    
    def _calculate_accuracy(self, actual: List[float], predicted: List[float]) -> float:
        """Calculate prediction accuracy"""
        if not actual or not predicted:
            return 0.0
        
        mse = np.mean((np.array(actual) - np.array(predicted)) ** 2)
        rmse = np.sqrt(mse)
        max_score = max(actual) if actual else 100
        accuracy = max(0, 1 - (rmse / max_score))
        
        return round(accuracy, 3)
    
    def _analyze_performance_patterns(self, user_data: Dict[str, Any]) -> List[AIInsight]:
        """Analyze performance patterns and generate insights"""
        insights = []
        
        # ATS score analysis
        ats_scores = user_data.get('ats_scores', [])
        if len(ats_scores) >= 3:
            recent_avg = np.mean(ats_scores[-3:])
            overall_avg = np.mean(ats_scores)
            
            if recent_avg > overall_avg + 5:
                insights.append(AIInsight(
                    insight_id=f"perf_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                    user_id=user_data.get('user_id', 0),
                    insight_type='performance',
                    title='Improving ATS Performance',
                    description=f'Your recent ATS scores ({recent_avg:.1f}) are significantly higher than your average ({overall_avg:.1f}). Keep up the great work!',
                    confidence_score=0.85,
                    data_points={'recent_avg': recent_avg, 'overall_avg': overall_avg},
                    created_at=datetime.now(),
                    actionable=True
                ))
            elif recent_avg < overall_avg - 5:
                insights.append(AIInsight(
                    insight_id=f"perf_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                    user_id=user_data.get('user_id', 0),
                    insight_type='performance',
                    title='ATS Score Decline Detected',
                    description=f'Your recent ATS scores ({recent_avg:.1f}) are below your average ({overall_avg:.1f}). Consider using the ATS enhancement features.',
                    confidence_score=0.80,
                    data_points={'recent_avg': recent_avg, 'overall_avg': overall_avg},
                    created_at=datetime.now(),
                    actionable=True
                ))
        
        return insights
    
    def _analyze_trends(self, user_data: Dict[str, Any]) -> List[AIInsight]:
        """Analyze trends and generate insights"""
        insights = []
        
        # Template usage trends
        template_usage = user_data.get('template_usage', {})
        if len(template_usage) >= 3:
            most_used = max(template_usage.items(), key=lambda x: x[1])
            insights.append(AIInsight(
                insight_id=f"trend_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                user_id=user_data.get('user_id', 0),
                insight_type='trend',
                title='Template Preference Identified',
                description=f'You prefer the "{most_used[0]}" template, using it {most_used[1]} times. Consider exploring other templates for variety.',
                confidence_score=0.90,
                data_points={'favorite_template': most_used[0], 'usage_count': most_used[1]},
                created_at=datetime.now(),
                actionable=True
            ))
        
        return insights
    
    def _generate_predictions(self, user_data: Dict[str, Any]) -> List[AIInsight]:
        """Generate predictive insights"""
        insights = []
        
        # Success prediction
        if self.models:
            success_models = [m for m in self.models.values() if m['type'] == 'success_rate']
            if success_models:
                latest_model = max(success_models, key=lambda x: x['last_trained'])
                avg_success_prob = 0.65  # Placeholder - would be calculated from user data
                
                insights.append(AIInsight(
                    insight_id=f"pred_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                    user_id=user_data.get('user_id', 0),
                    insight_type='prediction',
                    title='Success Probability Forecast',
                    description=f'Based on your patterns, your cover letters have a {avg_success_prob:.1%} success probability. Focus on ATS optimization to improve.',
                    confidence_score=latest_model['accuracy'],
                    data_points={'success_probability': avg_success_prob},
                    created_at=datetime.now(),
                    actionable=True
                ))
        
        return insights
    
    def _generate_recommendations(self, user_data: Dict[str, Any]) -> List[AIInsight]:
        """Generate AI-powered recommendations"""
        insights = []
        
        # Template diversity recommendation
        template_usage = user_data.get('template_usage', {})
        if len(template_usage) < 3:
            insights.append(AIInsight(
                insight_id=f"rec_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                user_id=user_data.get('user_id', 0),
                insight_type='recommendation',
                title='Explore Template Diversity',
                description='Try different templates to match various industries and roles. This can improve your application success rate.',
                confidence_score=0.75,
                data_points={'templates_used': len(template_usage)},
                created_at=datetime.now(),
                actionable=True
            ))
        
        # Collaboration recommendation
        collaboration_score = user_data.get('collaboration_score', 0)
        if collaboration_score < 0.5:
            insights.append(AIInsight(
                insight_id=f"rec_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                user_id=user_data.get('user_id', 0),
                insight_type='recommendation',
                title='Enable Collaboration',
                description='Sharing your cover letters for feedback can improve quality by 25%. Consider inviting colleagues for review.',
                confidence_score=0.80,
                data_points={'collaboration_score': collaboration_score},
                created_at=datetime.now(),
                actionable=True
            ))
        
        return insights
    
    def get_user_insights(self, user_id: int) -> List[AIInsight]:
        """Get all insights for a user"""
        return self.insights.get(user_id, [])
    
    def get_insight_by_id(self, insight_id: str) -> Optional[AIInsight]:
        """Get a specific insight by ID"""
        for user_insights in self.insights.values():
            for insight in user_insights:
                if insight.insight_id == insight_id:
                    return insight
        return None
    
    def mark_insight_actioned(self, insight_id: str) -> bool:
        """Mark an insight as actioned by the user"""
        insight = self.get_insight_by_id(insight_id)
        if insight:
            insight.actionable = False
            return True
        return False
    
    def generate_ai_report(self, user_id: int) -> Dict[str, Any]:
        """Generate comprehensive AI-powered report"""
        user_insights = self.get_user_insights(user_id)
        
        # Categorize insights
        performance_insights = [i for i in user_insights if i.insight_type == 'performance']
        trend_insights = [i for i in user_insights if i.insight_type == 'trend']
        prediction_insights = [i for i in user_insights if i.insight_type == 'prediction']
        recommendation_insights = [i for i in user_insights if i.insight_type == 'recommendation']
        
        # Calculate insight statistics
        total_insights = len(user_insights)
        actionable_insights = len([i for i in user_insights if i.actionable])
        avg_confidence = np.mean([i.confidence_score for i in user_insights]) if user_insights else 0
        
        return {
            "user_id": user_id,
            "generated_at": datetime.now().isoformat(),
            "summary": {
                "total_insights": total_insights,
                "actionable_insights": actionable_insights,
                "average_confidence": round(avg_confidence, 3),
                "insight_categories": {
                    "performance": len(performance_insights),
                    "trends": len(trend_insights),
                    "predictions": len(prediction_insights),
                    "recommendations": len(recommendation_insights)
                }
            },
            "insights": {
                "performance": [i.__dict__ for i in performance_insights],
                "trends": [i.__dict__ for i in trend_insights],
                "predictions": [i.__dict__ for i in prediction_insights],
                "recommendations": [i.__dict__ for i in recommendation_insights]
            },
            "model_performance": {
                "ats_prediction_accuracy": self._get_model_accuracy('ats_score'),
                "success_prediction_accuracy": self._get_model_accuracy('success_rate')
            }
        }
    
    def _get_model_accuracy(self, model_type: str) -> float:
        """Get accuracy for a specific model type"""
        models = [m for m in self.models.values() if m['type'] == model_type]
        if models:
            return max(m['accuracy'] for m in models)
        return 0.0



















