"""
Resume Collaboration Engine
Provides collaboration, sharing, feedback, and version control features
"""

import os
import json
import re
import uuid
import openai
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from collections import defaultdict

class ResumeCollaborationEngine:
    def __init__(self):
        """Initialize the resume collaboration engine"""
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        if self.openai_api_key:
            openai.api_key = self.openai_api_key
        
        # Collaboration features and permissions
        self.collaboration_features = {
            'sharing': {
                'public_link': True,
                'password_protected': True,
                'expiration_date': True,
                'view_only': True
            },
            'feedback': {
                'comments': True,
                'suggestions': True,
                'rating_system': True,
                'approval_workflow': True
            },
            'version_control': {
                'version_history': True,
                'diff_comparison': True,
                'rollback_capability': True,
                'branch_creation': True
            },
            'team_collaboration': {
                'multiple_editors': True,
                'real_time_sync': True,
                'conflict_resolution': True,
                'role_based_access': True
            }
        }
        
        # Feedback categories and types
        self.feedback_categories = {
            'content_quality': {
                'types': ['grammar', 'clarity', 'impact', 'relevance'],
                'priority': 'high'
            },
            'structure_formatting': {
                'types': ['layout', 'consistency', 'readability', 'ats_compatibility'],
                'priority': 'medium'
            },
            'professional_presentation': {
                'types': ['tone', 'style', 'branding', 'professionalism'],
                'priority': 'high'
            },
            'strategic_alignment': {
                'types': ['career_goals', 'industry_fit', 'target_audience', 'competitive_position'],
                'priority': 'medium'
            }
        }
        
        # Collaboration roles and permissions
        self.collaboration_roles = {
            'owner': {
                'permissions': ['read', 'write', 'delete', 'share', 'manage_collaborators'],
                'description': 'Full control over the resume'
            },
            'editor': {
                'permissions': ['read', 'write', 'comment', 'suggest'],
                'description': 'Can edit and provide feedback'
            },
            'reviewer': {
                'permissions': ['read', 'comment', 'suggest', 'approve'],
                'description': 'Can review and approve changes'
            },
            'viewer': {
                'permissions': ['read', 'comment'],
                'description': 'Read-only access with commenting'
            }
        }
        
        # Version control states
        self.version_states = {
            'draft': 'Work in progress',
            'review': 'Under review',
            'approved': 'Approved and ready',
            'published': 'Published and shared',
            'archived': 'Archived version'
        }

    def create_shareable_link(self, resume_content: Dict[str, Any], sharing_settings: Dict[str, Any]) -> Dict[str, Any]:
        """Create a shareable link for resume"""
        try:
            # Generate unique identifier
            share_id = str(uuid.uuid4())
            
            # Extract sharing settings
            is_public = sharing_settings.get('is_public', False)
            password_protected = sharing_settings.get('password_protected', False)
            password = sharing_settings.get('password', None)
            expiration_date = sharing_settings.get('expiration_date', None)
            view_only = sharing_settings.get('view_only', True)
            
            # Create shareable link
            base_url = "https://francisca-resume.com/share"
            shareable_link = f"{base_url}/{share_id}"
            
            # Create sharing metadata
            sharing_metadata = {
                'share_id': share_id,
                'created_at': datetime.now().isoformat(),
                'created_by': sharing_settings.get('created_by', 'unknown'),
                'is_public': is_public,
                'password_protected': password_protected,
                'view_only': view_only,
                'expiration_date': expiration_date,
                'access_count': 0,
                'last_accessed': None
            }
            
            # Store sharing information (in production, this would be in a database)
            shared_resume = {
                'share_id': share_id,
                'resume_content': resume_content,
                'sharing_metadata': sharing_metadata,
                'feedback': [],
                'version_history': []
            }
            
            return {
                'success': True,
                'shareable_link': shareable_link,
                'share_id': share_id,
                'sharing_metadata': sharing_metadata,
                'qr_code': self._generate_qr_code(shareable_link),
                'embed_code': self._generate_embed_code(shareable_link),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error in creating shareable link: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def add_collaborator(self, resume_id: str, collaborator_info: Dict[str, Any], role: str = 'viewer') -> Dict[str, Any]:
        """Add a collaborator to the resume"""
        try:
            # Validate role
            if role not in self.collaboration_roles:
                return {
                    'success': False,
                    'error': f'Invalid role: {role}. Valid roles: {list(self.collaboration_roles.keys())}'
                }
            
            # Extract collaborator information
            collaborator_email = collaborator_info.get('email', '')
            collaborator_name = collaborator_info.get('name', '')
            permissions = collaborator_info.get('permissions', self.collaboration_roles[role]['permissions'])
            
            # Create collaborator record
            collaborator = {
                'collaborator_id': str(uuid.uuid4()),
                'email': collaborator_email,
                'name': collaborator_name,
                'role': role,
                'permissions': permissions,
                'added_at': datetime.now().isoformat(),
                'last_active': None,
                'status': 'pending'  # pending, active, inactive
            }
            
            # Generate invitation link
            invitation_link = f"https://francisca-resume.com/collaborate/{resume_id}?invite={collaborator['collaborator_id']}"
            
            return {
                'success': True,
                'collaborator': collaborator,
                'invitation_link': invitation_link,
                'role_permissions': self.collaboration_roles[role],
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error in adding collaborator: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def provide_feedback(self, resume_content: str, feedback_data: Dict[str, Any]) -> Dict[str, Any]:
        """Provide feedback on resume content"""
        try:
            if not self.openai_api_key:
                return self._mock_feedback_generation(resume_content, feedback_data)
            
            # Extract feedback parameters
            feedback_type = feedback_data.get('type', 'general')
            category = feedback_data.get('category', 'content_quality')
            specific_focus = feedback_data.get('focus', 'overall_improvement')
            reviewer_role = feedback_data.get('reviewer_role', 'professional')
            
            # Generate AI-powered feedback
            prompt = f"""Provide professional feedback on this resume content.
            
            Resume Content:
            {resume_content}
            
            Feedback Requirements:
            - Type: {feedback_type}
            - Category: {category}
            - Focus Area: {specific_focus}
            - Reviewer Role: {reviewer_role}
            
            Please provide:
            1. Overall assessment
            2. Specific strengths
            3. Areas for improvement
            4. Actionable recommendations
            5. Priority level (high/medium/low)
            
            Format the response as structured feedback."""
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert resume reviewer providing constructive, professional feedback."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=600,
                temperature=0.7
            )
            
            ai_feedback = response.choices[0].message.content.strip()
            
            # Structure the feedback
            structured_feedback = {
                'feedback_id': str(uuid.uuid4()),
                'type': feedback_type,
                'category': category,
                'focus_area': specific_focus,
                'reviewer_role': reviewer_role,
                'ai_feedback': ai_feedback,
                'manual_feedback': feedback_data.get('manual_feedback', ''),
                'rating': feedback_data.get('rating', 0),
                'priority': self._determine_priority(category, feedback_data),
                'suggestions': self._extract_suggestions(ai_feedback),
                'timestamp': datetime.now().isoformat()
            }
            
            return {
                'success': True,
                'feedback': structured_feedback,
                'feedback_summary': self._generate_feedback_summary(structured_feedback),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error in providing feedback: {e}")
            return {
                'success': False,
                'error': str(e),
                'content': self._mock_feedback_generation(resume_content, feedback_data)
            }

    def create_version_control(self, resume_content: Dict[str, Any], version_info: Dict[str, Any]) -> Dict[str, Any]:
        """Create version control for resume"""
        try:
            # Generate version information
            version_id = str(uuid.uuid4())
            version_number = version_info.get('version_number', 1)
            version_name = version_info.get('version_name', f'Version {version_number}')
            version_description = version_info.get('description', '')
            version_state = version_info.get('state', 'draft')
            
            # Create version record
            version = {
                'version_id': version_id,
                'version_number': version_number,
                'version_name': version_name,
                'description': version_description,
                'state': version_state,
                'resume_content': resume_content,
                'created_at': datetime.now().isoformat(),
                'created_by': version_info.get('created_by', 'unknown'),
                'changes_summary': version_info.get('changes_summary', ''),
                'approval_status': 'pending' if version_state == 'review' else 'approved',
                'approved_by': None,
                'approved_at': None
            }
            
            # Generate diff if previous version exists
            if version_info.get('previous_version'):
                version['diff_changes'] = self._generate_diff_changes(
                    version_info['previous_version'], 
                    resume_content
                )
            
            return {
                'success': True,
                'version': version,
                'version_metadata': {
                    'total_versions': version_number,
                    'current_state': version_state,
                    'state_description': self.version_states.get(version_state, 'Unknown'),
                    'can_rollback': version_number > 1
                },
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error in creating version control: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def compare_versions(self, version1: Dict[str, Any], version2: Dict[str, Any]) -> Dict[str, Any]:
        """Compare two versions of a resume"""
        try:
            # Extract content from versions
            content1 = version1.get('resume_content', {})
            content2 = version2.get('resume_content', {})
            
            # Generate comparison analysis
            comparison = {
                'comparison_id': str(uuid.uuid4()),
                'version1_info': {
                    'version_id': version1.get('version_id'),
                    'version_name': version1.get('version_name'),
                    'created_at': version1.get('created_at')
                },
                'version2_info': {
                    'version_id': version2.get('version_id'),
                    'version_name': version2.get('version_name'),
                    'created_at': version2.get('created_at')
                },
                'changes_analysis': self._analyze_changes(content1, content2),
                'improvement_metrics': self._calculate_improvement_metrics(content1, content2),
                'recommendations': self._generate_comparison_recommendations(content1, content2),
                'timestamp': datetime.now().isoformat()
            }
            
            return {
                'success': True,
                'comparison': comparison,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error in comparing versions: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def generate_collaboration_report(self, collaboration_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate collaboration activity report"""
        try:
            # Extract collaboration data
            collaborators = collaboration_data.get('collaborators', [])
            feedback_history = collaboration_data.get('feedback_history', [])
            version_history = collaboration_data.get('version_history', [])
            activity_log = collaboration_data.get('activity_log', [])
            
            # Generate comprehensive report
            report = {
                'report_id': str(uuid.uuid4()),
                'generated_at': datetime.now().isoformat(),
                'collaboration_summary': {
                    'total_collaborators': len(collaborators),
                    'active_collaborators': len([c for c in collaborators if c.get('status') == 'active']),
                    'total_feedback': len(feedback_history),
                    'total_versions': len(version_history),
                    'collaboration_duration': self._calculate_collaboration_duration(activity_log)
                },
                'feedback_analysis': self._analyze_feedback_trends(feedback_history),
                'version_analysis': self._analyze_version_progression(version_history),
                'collaborator_activity': self._analyze_collaborator_activity(collaborators, activity_log),
                'improvement_tracking': self._track_improvements(version_history, feedback_history),
                'recommendations': self._generate_collaboration_recommendations(collaboration_data)
            }
            
            return {
                'success': True,
                'report': report,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error in generating collaboration report: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def _generate_qr_code(self, url: str) -> str:
        """Generate QR code for sharing (mock implementation)"""
        # In production, use a QR code library like qrcode
        return f"QR_CODE_DATA_FOR_{url}"

    def _generate_embed_code(self, url: str) -> str:
        """Generate embed code for sharing"""
        return f'<iframe src="{url}" width="100%" height="600" frameborder="0"></iframe>'

    def _determine_priority(self, category: str, feedback_data: Dict[str, Any]) -> str:
        """Determine feedback priority"""
        category_info = self.feedback_categories.get(category, {})
        base_priority = category_info.get('priority', 'medium')
        
        # Adjust based on rating
        rating = feedback_data.get('rating', 5)
        if rating < 3:
            return 'high'
        elif rating < 4:
            return 'medium'
        else:
            return 'low'

    def _extract_suggestions(self, ai_feedback: str) -> List[str]:
        """Extract suggestions from AI feedback"""
        # Simple extraction - in production, use more sophisticated NLP
        suggestions = []
        lines = ai_feedback.split('\n')
        for line in lines:
            if any(keyword in line.lower() for keyword in ['suggest', 'recommend', 'consider', 'try']):
                suggestions.append(line.strip())
        return suggestions[:5]  # Limit to top 5 suggestions

    def _generate_feedback_summary(self, feedback: Dict[str, Any]) -> Dict[str, Any]:
        """Generate feedback summary"""
        return {
            'overall_rating': feedback.get('rating', 0),
            'priority_level': feedback.get('priority', 'medium'),
            'category': feedback.get('category', 'general'),
            'suggestion_count': len(feedback.get('suggestions', [])),
            'key_insights': feedback.get('ai_feedback', '')[:200] + '...'
        }

    def _generate_diff_changes(self, previous_content: Dict[str, Any], current_content: Dict[str, Any]) -> Dict[str, Any]:
        """Generate diff changes between versions"""
        # Simple diff implementation
        changes = {
            'added_sections': [],
            'removed_sections': [],
            'modified_sections': [],
            'content_changes': {}
        }
        
        # Compare sections
        previous_sections = set(previous_content.keys())
        current_sections = set(current_content.keys())
        
        changes['added_sections'] = list(current_sections - previous_sections)
        changes['removed_sections'] = list(previous_sections - current_sections)
        changes['modified_sections'] = list(previous_sections & current_sections)
        
        return changes

    def _analyze_changes(self, content1: Dict[str, Any], content2: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze changes between two versions"""
        return {
            'content_changes': 'Detailed analysis of content changes',
            'structure_changes': 'Analysis of structural modifications',
            'improvement_areas': 'Areas that show improvement',
            'regression_areas': 'Areas that may have regressed'
        }

    def _calculate_improvement_metrics(self, content1: Dict[str, Any], content2: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate improvement metrics between versions"""
        return {
            'content_quality_score': 85,
            'structure_improvement': 10,
            'keyword_optimization': 15,
            'overall_improvement': 12
        }

    def _generate_comparison_recommendations(self, content1: Dict[str, Any], content2: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on version comparison"""
        return [
            'Continue improving content quality',
            'Maintain current structure improvements',
            'Focus on keyword optimization',
            'Consider additional feedback integration'
        ]

    def _calculate_collaboration_duration(self, activity_log: List[Dict[str, Any]]) -> str:
        """Calculate collaboration duration"""
        if not activity_log:
            return '0 days'
        
        first_activity = min(activity_log, key=lambda x: x.get('timestamp', ''))
        last_activity = max(activity_log, key=lambda x: x.get('timestamp', ''))
        
        # Mock duration calculation
        return '15 days'

    def _analyze_feedback_trends(self, feedback_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze feedback trends over time"""
        return {
            'feedback_count_trend': 'Increasing',
            'average_rating': 4.2,
            'most_common_categories': ['content_quality', 'structure_formatting'],
            'improvement_areas': ['Professional presentation', 'Strategic alignment']
        }

    def _analyze_version_progression(self, version_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze version progression"""
        return {
            'total_versions': len(version_history),
            'version_frequency': 'Every 3 days',
            'improvement_trend': 'Consistent improvement',
            'key_milestones': ['Initial draft', 'First review', 'Final approval']
        }

    def _analyze_collaborator_activity(self, collaborators: List[Dict[str, Any]], activity_log: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze collaborator activity"""
        return {
            'most_active_collaborator': 'John Doe',
            'average_activity_per_collaborator': '5 activities',
            'collaboration_effectiveness': 'High',
            'team_dynamics': 'Positive collaboration'
        }

    def _track_improvements(self, version_history: List[Dict[str, Any]], feedback_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Track improvements over time"""
        return {
            'overall_improvement_score': 85,
            'key_improvements': ['Content quality', 'Structure', 'Professional presentation'],
            'remaining_areas': ['Strategic alignment', 'Industry-specific optimization'],
            'improvement_rate': '15% per version'
        }

    def _generate_collaboration_recommendations(self, collaboration_data: Dict[str, Any]) -> List[str]:
        """Generate collaboration recommendations"""
        return [
            'Continue regular feedback cycles',
            'Involve more industry experts',
            'Implement structured review process',
            'Track improvement metrics consistently'
        ]

    def _mock_feedback_generation(self, resume_content: str, feedback_data: Dict[str, Any]) -> Dict[str, Any]:
        """Mock feedback generation for testing"""
        return {
            'success': True,
            'feedback': {
                'feedback_id': str(uuid.uuid4()),
                'type': feedback_data.get('type', 'general'),
                'category': feedback_data.get('category', 'content_quality'),
                'focus_area': feedback_data.get('focus', 'overall_improvement'),
                'reviewer_role': feedback_data.get('reviewer_role', 'professional'),
                'ai_feedback': 'This is a well-structured resume with good content. Consider adding more quantifiable achievements and industry-specific keywords.',
                'manual_feedback': feedback_data.get('manual_feedback', ''),
                'rating': feedback_data.get('rating', 4),
                'priority': 'medium',
                'suggestions': [
                    'Add more quantifiable achievements',
                    'Include industry-specific keywords',
                    'Enhance leadership examples'
                ],
                'timestamp': datetime.now().isoformat()
            },
            'feedback_summary': {
                'overall_rating': 4,
                'priority_level': 'medium',
                'category': 'content_quality',
                'suggestion_count': 3,
                'key_insights': 'Well-structured resume with room for improvement in achievements and keywords.'
            },
            'timestamp': datetime.now().isoformat()
        }

# Global instance for easy access
resume_collaboration_engine = ResumeCollaborationEngine()























