"""
Collaboration System for Cover Letters
Phase 4: Sharing, feedback, and team collaboration features
"""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime
import uuid
import json

@dataclass
class CollaborationInvite:
    invite_id: str
    cover_letter_id: int
    owner_id: int
    invitee_email: str
    permissions: List[str]
    status: str  # pending, accepted, declined
    created_at: datetime
    expires_at: datetime

@dataclass
class FeedbackComment:
    comment_id: str
    cover_letter_id: int
    user_id: int
    user_name: str
    content: str
    section: str  # header, body, closing, overall
    rating: int  # 1-5 stars
    created_at: datetime
    resolved: bool

@dataclass
class VersionHistory:
    version_id: str
    cover_letter_id: int
    user_id: int
    version_number: int
    content: str
    changes_summary: str
    created_at: datetime
    template_used: Optional[str]

class CollaborationSystem:
    def __init__(self):
        self.invites = {}
        self.feedback = {}
        self.versions = {}
        
    def create_collaboration_invite(self, cover_letter_id: int, owner_id: int, 
                                  invitee_email: str, permissions: List[str]) -> CollaborationInvite:
        """Create a new collaboration invite"""
        invite_id = str(uuid.uuid4())
        expires_at = datetime.now().replace(hour=datetime.now().hour + 72)  # 72 hours
        
        invite = CollaborationInvite(
            invite_id=invite_id,
            cover_letter_id=cover_letter_id,
            owner_id=owner_id,
            invitee_email=invite_email,
            permissions=permissions,
            status="pending",
            created_at=datetime.now(),
            expires_at=expires_at
        )
        
        self.invites[invite_id] = invite
        return invite
    
    def accept_collaboration_invite(self, invite_id: str, user_id: int) -> bool:
        """Accept a collaboration invite"""
        if invite_id not in self.invites:
            return False
        
        invite = self.invites[invite_id]
        if invite.status != "pending":
            return False
        
        if datetime.now() > invite.expires_at:
            invite.status = "expired"
            return False
        
        invite.status = "accepted"
        return True
    
    def decline_collaboration_invite(self, invite_id: str) -> bool:
        """Decline a collaboration invite"""
        if invite_id not in self.invites:
            return False
        
        invite = self.invites[invite_id]
        invite.status = "declined"
        return True
    
    def get_user_collaborations(self, user_id: int) -> List[Dict[str, Any]]:
        """Get all collaborations for a user"""
        collaborations = []
        
        # Get accepted invites where user is the invitee
        for invite in self.invites.values():
            if invite.status == "accepted":
                # This would typically query a database for user associations
                collaborations.append({
                    "cover_letter_id": invite.cover_letter_id,
                    "permissions": invite.permissions,
                    "role": "collaborator",
                    "invited_at": invite.created_at
                })
        
        return collaborations
    
    def add_feedback_comment(self, cover_letter_id: int, user_id: int, user_name: str,
                           content: str, section: str, rating: int) -> FeedbackComment:
        """Add a feedback comment to a cover letter"""
        comment_id = str(uuid.uuid4())
        
        comment = FeedbackComment(
            comment_id=comment_id,
            cover_letter_id=cover_letter_id,
            user_id=user_id,
            user_name=user_name,
            content=content,
            section=section,
            rating=rating,
            created_at=datetime.now(),
            resolved=False
        )
        
        if cover_letter_id not in self.feedback:
            self.feedback[cover_letter_id] = []
        
        self.feedback[cover_letter_id].append(comment)
        return comment
    
    def get_cover_letter_feedback(self, cover_letter_id: int) -> List[FeedbackComment]:
        """Get all feedback for a cover letter"""
        return self.feedback.get(cover_letter_id, [])
    
    def resolve_feedback_comment(self, comment_id: str) -> bool:
        """Mark a feedback comment as resolved"""
        for comments in self.feedback.values():
            for comment in comments:
                if comment.comment_id == comment_id:
                    comment.resolved = True
                    return True
        return False
    
    def create_version_snapshot(self, cover_letter_id: int, user_id: int, 
                              content: str, changes_summary: str, 
                              template_used: Optional[str] = None) -> VersionHistory:
        """Create a version snapshot of a cover letter"""
        version_id = str(uuid.uuid4())
        
        # Get current version number
        current_versions = [v for v in self.versions.values() if v.cover_letter_id == cover_letter_id]
        version_number = len(current_versions) + 1
        
        version = VersionHistory(
            version_id=version_id,
            cover_letter_id=cover_letter_id,
            user_id=user_id,
            version_number=version_number,
            content=content,
            changes_summary=changes_summary,
            created_at=datetime.now(),
            template_used=template_used
        )
        
        self.versions[version_id] = version
        return version
    
    def get_version_history(self, cover_letter_id: int) -> List[VersionHistory]:
        """Get version history for a cover letter"""
        versions = [v for v in self.versions.values() if v.cover_letter_id == cover_letter_id]
        return sorted(versions, key=lambda x: x.version_number, reverse=True)
    
    def get_version_by_id(self, version_id: str) -> Optional[VersionHistory]:
        """Get a specific version by ID"""
        return self.versions.get(version_id)
    
    def restore_version(self, version_id: str) -> Optional[str]:
        """Restore a cover letter to a specific version"""
        version = self.get_version_by_id(version_id)
        if not version:
            return None
        
        return version.content
    
    def get_collaboration_analytics(self, user_id: int) -> Dict[str, Any]:
        """Get collaboration analytics for a user"""
        # Get user's collaborations
        collaborations = self.get_user_collaborations(user_id)
        
        # Get feedback statistics
        total_feedback = 0
        average_rating = 0
        feedback_by_section = {}
        
        for cover_letter_id in [c["cover_letter_id"] for c in collaborations]:
            feedback = self.get_cover_letter_feedback(cover_letter_id)
            total_feedback += len(feedback)
            
            if feedback:
                ratings = [f.rating for f in feedback]
                average_rating = sum(ratings) / len(ratings)
                
                for comment in feedback:
                    section = comment.section
                    if section not in feedback_by_section:
                        feedback_by_section[section] = 0
                    feedback_by_section[section] += 1
        
        return {
            "total_collaborations": len(collaborations),
            "total_feedback": total_feedback,
            "average_rating": round(average_rating, 2),
            "feedback_by_section": feedback_by_section,
            "active_collaborations": len([c for c in collaborations if c.get("active", True)])
        }
    
    def generate_collaboration_report(self, cover_letter_id: int) -> Dict[str, Any]:
        """Generate a comprehensive collaboration report"""
        feedback = self.get_cover_letter_feedback(cover_letter_id)
        versions = self.get_version_history(cover_letter_id)
        
        # Calculate feedback statistics
        total_comments = len(feedback)
        resolved_comments = len([f for f in feedback if f.resolved])
        average_rating = 0
        
        if feedback:
            ratings = [f.rating for f in feedback]
            average_rating = sum(ratings) / len(ratings)
        
        # Group feedback by section
        feedback_by_section = {}
        for comment in feedback:
            section = comment.section
            if section not in feedback_by_section:
                feedback_by_section[section] = []
            feedback_by_section[section].append(comment)
        
        # Version statistics
        total_versions = len(versions)
        recent_changes = versions[:5] if versions else []
        
        return {
            "cover_letter_id": cover_letter_id,
            "total_feedback": total_comments,
            "resolved_feedback": resolved_comments,
            "pending_feedback": total_comments - resolved_comments,
            "average_rating": round(average_rating, 2),
            "feedback_by_section": feedback_by_section,
            "total_versions": total_versions,
            "recent_changes": [
                {
                    "version_number": v.version_number,
                    "changes_summary": v.changes_summary,
                    "created_at": v.created_at.isoformat(),
                    "template_used": v.template_used
                }
                for v in recent_changes
            ],
            "collaboration_timeline": [
                {
                    "type": "version",
                    "data": {
                        "version_number": v.version_number,
                        "changes_summary": v.changes_summary,
                        "created_at": v.created_at.isoformat()
                    }
                }
                for v in versions
            ] + [
                {
                    "type": "feedback",
                    "data": {
                        "user_name": f.user_name,
                        "section": f.section,
                        "rating": f.rating,
                        "content": f.content,
                        "created_at": f.created_at.isoformat()
                    }
                }
                for f in feedback
            ]
        }
    
    def get_team_performance_metrics(self, team_member_ids: List[int]) -> Dict[str, Any]:
        """Get team performance metrics"""
        team_metrics = {
            "total_collaborations": 0,
            "total_feedback_given": 0,
            "total_feedback_received": 0,
            "average_response_time": 0,
            "member_performance": {}
        }
        
        for member_id in team_member_ids:
            member_analytics = self.get_collaboration_analytics(member_id)
            team_metrics["total_collaborations"] += member_analytics["total_collaborations"]
            team_metrics["total_feedback_given"] += member_analytics["total_feedback"]
            
            team_metrics["member_performance"][member_id] = {
                "collaborations": member_analytics["total_collaborations"],
                "feedback_given": member_analytics["total_feedback"],
                "average_rating": member_analytics["average_rating"],
                "active_collaborations": member_analytics["active_collaborations"]
            }
        
        return team_metrics



















