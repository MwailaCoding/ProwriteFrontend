"""
Notification Integration Service
Integrates notifications with existing ProWrite features
"""

from notification_system import (
    notification_service, NotificationType, NotificationPriority,
    notify_payment_success, notify_ai_enhancement_complete,
    notify_template_uploaded, notify_collaboration_invite, notify_security_alert
)
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class NotificationIntegration:
    """Integrates notifications with ProWrite features"""
    
    def __init__(self):
        self.notification_service = notification_service
    
    def notify_resume_generated(self, user_id: int, resume_title: str, template_name: str = None):
        """Send notification when resume is generated"""
        try:
            message = f"Your resume '{resume_title}' has been successfully generated"
            if template_name:
                message += f" using the {template_name} template"
            
            return self.notification_service.create_notification(
                user_id=user_id,
                title="Resume Generated",
                message=message,
                notification_type=NotificationType.RESUME,
                priority=NotificationPriority.MEDIUM,
                icon="file-user",
                color="#84CC16",
                action_url="/resumes"
            )
        except Exception as e:
            logger.error(f"Error sending resume generation notification: {e}")
            return None
    
    def notify_ai_enhancement_started(self, user_id: int, resume_title: str):
        """Send notification when AI enhancement starts"""
        try:
            return self.notification_service.create_notification(
                user_id=user_id,
                title="AI Enhancement Started",
                message=f"AI is analyzing and enhancing your resume '{resume_title}'",
                notification_type=NotificationType.AI_ENHANCEMENT,
                priority=NotificationPriority.LOW,
                icon="brain",
                color="#8B5CF6",
                action_url="/resumes"
            )
        except Exception as e:
            logger.error(f"Error sending AI enhancement started notification: {e}")
            return None
    
    def notify_ai_enhancement_completed(self, user_id: int, resume_title: str, improvements: list = None):
        """Send notification when AI enhancement completes"""
        try:
            message = f"AI enhancement completed for '{resume_title}'"
            if improvements:
                message += f". {len(improvements)} improvements were made"
            
            return self.notification_service.create_notification(
                user_id=user_id,
                title="AI Enhancement Complete",
                message=message,
                notification_type=NotificationType.AI_ENHANCEMENT,
                priority=NotificationPriority.MEDIUM,
                icon="brain",
                color="#8B5CF6",
                action_url="/resumes",
                data={"improvements": improvements} if improvements else None
            )
        except Exception as e:
            logger.error(f"Error sending AI enhancement completed notification: {e}")
            return None
    
    def notify_template_uploaded(self, user_id: int, template_name: str, template_type: str = "custom"):
        """Send notification when template is uploaded"""
        try:
            return self.notification_service.create_notification(
                user_id=user_id,
                title="Template Uploaded",
                message=f"Your {template_type} template '{template_name}' has been successfully uploaded and is ready to use",
                notification_type=NotificationType.TEMPLATE,
                priority=NotificationPriority.LOW,
                icon="file-text",
                color="#06B6D4",
                action_url="/templates"
            )
        except Exception as e:
            logger.error(f"Error sending template upload notification: {e}")
            return None
    
    def notify_template_processed(self, user_id: int, template_name: str, status: str):
        """Send notification when template processing completes"""
        try:
            status_messages = {
                "success": f"Template '{template_name}' has been successfully processed and is ready to use",
                "error": f"Template '{template_name}' processing failed. Please check the template format",
                "warning": f"Template '{template_name}' processed with warnings. Some features may not work correctly"
            }
            
            priority_map = {
                "success": NotificationPriority.LOW,
                "error": NotificationPriority.HIGH,
                "warning": NotificationPriority.MEDIUM
            }
            
            return self.notification_service.create_notification(
                user_id=user_id,
                title=f"Template Processing {status.title()}",
                message=status_messages.get(status, f"Template '{template_name}' processing {status}"),
                notification_type=NotificationType.TEMPLATE,
                priority=priority_map.get(status, NotificationPriority.MEDIUM),
                icon="file-text",
                color="#06B6D4" if status == "success" else "#EF4444" if status == "error" else "#F59E0B",
                action_url="/templates"
            )
        except Exception as e:
            logger.error(f"Error sending template processing notification: {e}")
            return None
    
    def notify_cover_letter_generated(self, user_id: int, cover_letter_title: str, job_title: str = None):
        """Send notification when cover letter is generated"""
        try:
            message = f"Your cover letter '{cover_letter_title}' has been successfully generated"
            if job_title:
                message += f" for the {job_title} position"
            
            return self.notification_service.create_notification(
                user_id=user_id,
                title="Cover Letter Generated",
                message=message,
                notification_type=NotificationType.COVER_LETTER,
                priority=NotificationPriority.MEDIUM,
                icon="mail",
                color="#EC4899",
                action_url="/cover-letters"
            )
        except Exception as e:
            logger.error(f"Error sending cover letter generation notification: {e}")
            return None
    
    def notify_payment_processed(self, user_id: int, amount: float, currency: str = "USD", 
                               payment_type: str = "subscription", status: str = "success"):
        """Send notification when payment is processed"""
        try:
            if status == "success":
                return notify_payment_success(user_id, amount, currency)
            else:
                return self.notification_service.create_notification(
                    user_id=user_id,
                    title="Payment Failed",
                    message=f"Your payment of {currency} {amount:.2f} could not be processed. Please try again.",
                    notification_type=NotificationType.PAYMENT,
                    priority=NotificationPriority.HIGH,
                    icon="credit-card",
                    color="#EF4444",
                    action_url="/billing"
                )
        except Exception as e:
            logger.error(f"Error sending payment notification: {e}")
            return None
    
    def notify_subscription_renewal(self, user_id: int, plan_name: str, renewal_date: str):
        """Send notification for subscription renewal"""
        try:
            return self.notification_service.create_notification(
                user_id=user_id,
                title="Subscription Renewal",
                message=f"Your {plan_name} subscription will renew on {renewal_date}",
                notification_type=NotificationType.PAYMENT,
                priority=NotificationPriority.MEDIUM,
                icon="credit-card",
                color="#10B981",
                action_url="/billing"
            )
        except Exception as e:
            logger.error(f"Error sending subscription renewal notification: {e}")
            return None
    
    def notify_collaboration_invite(self, user_id: int, inviter_name: str, resume_title: str, 
                                  collaboration_type: str = "view"):
        """Send notification for collaboration invite"""
        try:
            action_text = "view" if collaboration_type == "view" else "edit"
            return self.notification_service.create_notification(
                user_id=user_id,
                title="Collaboration Invite",
                message=f"{inviter_name} has invited you to {action_text} '{resume_title}'",
                notification_type=NotificationType.COLLABORATION,
                priority=NotificationPriority.HIGH,
                icon="users",
                color="#F59E0B",
                action_url="/collaboration",
                data={"collaboration_type": collaboration_type, "inviter": inviter_name}
            )
        except Exception as e:
            logger.error(f"Error sending collaboration invite notification: {e}")
            return None
    
    def notify_collaboration_update(self, user_id: int, collaborator_name: str, resume_title: str, 
                                  update_type: str = "modified"):
        """Send notification for collaboration update"""
        try:
            return self.notification_service.create_notification(
                user_id=user_id,
                title="Collaboration Update",
                message=f"{collaborator_name} has {update_type} '{resume_title}'",
                notification_type=NotificationType.COLLABORATION,
                priority=NotificationPriority.LOW,
                icon="users",
                color="#F59E0B",
                action_url="/collaboration"
            )
        except Exception as e:
            logger.error(f"Error sending collaboration update notification: {e}")
            return None
    
    def notify_security_alert(self, user_id: int, alert_type: str, details: str, 
                            severity: str = "medium"):
        """Send notification for security alert"""
        try:
            priority_map = {
                "low": NotificationPriority.LOW,
                "medium": NotificationPriority.MEDIUM,
                "high": NotificationPriority.HIGH,
                "critical": NotificationPriority.URGENT
            }
            
            return self.notification_service.create_notification(
                user_id=user_id,
                title=f"Security Alert: {alert_type}",
                message=details,
                notification_type=NotificationType.SECURITY,
                priority=priority_map.get(severity, NotificationPriority.MEDIUM),
                icon="shield",
                color="#EF4444",
                action_url="/security"
            )
        except Exception as e:
            logger.error(f"Error sending security alert notification: {e}")
            return None
    
    def notify_achievement_unlocked(self, user_id: int, achievement_name: str, description: str):
        """Send notification for achievement unlocked"""
        try:
            return self.notification_service.create_notification(
                user_id=user_id,
                title="Achievement Unlocked!",
                message=f"You've unlocked '{achievement_name}': {description}",
                notification_type=NotificationType.ACHIEVEMENT,
                priority=NotificationPriority.MEDIUM,
                icon="trophy",
                color="#EAB308",
                action_url="/achievements"
            )
        except Exception as e:
            logger.error(f"Error sending achievement notification: {e}")
            return None
    
    def notify_market_insights(self, user_id: int, insight_type: str, title: str, summary: str):
        """Send notification for market insights"""
        try:
            return self.notification_service.create_notification(
                user_id=user_id,
                title=f"Market Insight: {title}",
                message=summary,
                notification_type=NotificationType.MARKET_INSIGHTS,
                priority=NotificationPriority.LOW,
                icon="trending-up",
                color="#F97316",
                action_url="/market-insights",
                data={"insight_type": insight_type}
            )
        except Exception as e:
            logger.error(f"Error sending market insights notification: {e}")
            return None
    
    def notify_system_maintenance(self, user_id: int, maintenance_type: str, 
                                scheduled_time: str, duration: str = "1 hour"):
        """Send notification for system maintenance"""
        try:
            return self.notification_service.create_notification(
                user_id=user_id,
                title="Scheduled Maintenance",
                message=f"{maintenance_type} maintenance is scheduled for {scheduled_time} and will last approximately {duration}",
                notification_type=NotificationType.MAINTENANCE,
                priority=NotificationPriority.MEDIUM,
                icon="wrench",
                color="#6B7280",
                action_url="/status"
            )
        except Exception as e:
            logger.error(f"Error sending maintenance notification: {e}")
            return None
    
    def notify_welcome(self, user_id: int, user_name: str = None):
        """Send welcome notification for new users"""
        try:
            name = user_name or "there"
            return self.notification_service.create_notification(
                user_id=user_id,
                title="Welcome to ProWrite!",
                message=f"Hi {name}! Welcome to ProWrite. Get started by creating your first professional resume.",
                notification_type=NotificationType.WELCOME,
                priority=NotificationPriority.MEDIUM,
                icon="welcome",
                color="#10B981",
                action_url="/dashboard"
            )
        except Exception as e:
            logger.error(f"Error sending welcome notification: {e}")
            return None
    
    def notify_reminder(self, user_id: int, reminder_type: str, message: str, 
                       action_url: str = None):
        """Send reminder notification"""
        try:
            return self.notification_service.create_notification(
                user_id=user_id,
                title=f"Reminder: {reminder_type}",
                message=message,
                notification_type=NotificationType.REMINDER,
                priority=NotificationPriority.LOW,
                icon="clock",
                color="#6B7280",
                action_url=action_url
            )
        except Exception as e:
            logger.error(f"Error sending reminder notification: {e}")
            return None

# Global notification integration instance
notification_integration = NotificationIntegration()

# Convenience functions for common integrations
def notify_resume_generated(user_id: int, resume_title: str, template_name: str = None):
    """Convenience function for resume generation notification"""
    return notification_integration.notify_resume_generated(user_id, resume_title, template_name)

def notify_ai_enhancement_completed(user_id: int, resume_title: str, improvements: list = None):
    """Convenience function for AI enhancement completion notification"""
    return notification_integration.notify_ai_enhancement_completed(user_id, resume_title, improvements)

def notify_template_uploaded(user_id: int, template_name: str, template_type: str = "custom"):
    """Convenience function for template upload notification"""
    return notification_integration.notify_template_uploaded(user_id, template_name, template_type)

def notify_cover_letter_generated(user_id: int, cover_letter_title: str, job_title: str = None):
    """Convenience function for cover letter generation notification"""
    return notification_integration.notify_cover_letter_generated(user_id, cover_letter_title, job_title)

def notify_payment_processed(user_id: int, amount: float, currency: str = "USD", 
                           payment_type: str = "subscription", status: str = "success"):
    """Convenience function for payment notification"""
    return notification_integration.notify_payment_processed(user_id, amount, currency, payment_type, status)

def notify_welcome(user_id: int, user_name: str = None):
    """Convenience function for welcome notification"""
    return notification_integration.notify_welcome(user_id, user_name)

