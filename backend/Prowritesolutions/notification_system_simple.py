"""
Simplified Notification System for ProWrite
Basic notification functionality without WebSocket dependency
"""

import json
import sqlite3
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum
import uuid
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class NotificationType(Enum):
    """Notification types for different categories"""
    SYSTEM = "system"
    PAYMENT = "payment"
    AI_ENHANCEMENT = "ai_enhancement"
    COLLABORATION = "collaboration"
    SECURITY = "security"
    TEMPLATE = "template"
    RESUME = "resume"
    COVER_LETTER = "cover_letter"
    MARKET_INSIGHTS = "market_insights"
    REMINDER = "reminder"
    ACHIEVEMENT = "achievement"
    WELCOME = "welcome"
    UPDATES = "updates"
    MAINTENANCE = "maintenance"

class NotificationPriority(Enum):
    """Notification priority levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class NotificationStatus(Enum):
    """Notification status"""
    UNREAD = "unread"
    READ = "read"
    ARCHIVED = "archived"
    DELETED = "deleted"

@dataclass
class Notification:
    """Notification data structure"""
    id: str
    user_id: int
    title: str
    message: str
    notification_type: NotificationType
    priority: NotificationPriority
    status: NotificationStatus
    created_at: datetime
    read_at: Optional[datetime] = None
    archived_at: Optional[datetime] = None
    data: Optional[Dict[str, Any]] = None
    action_url: Optional[str] = None
    expires_at: Optional[datetime] = None
    category: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None

class NotificationDatabase:
    """Database operations for notifications"""
    
    def __init__(self, db_path: str = "prowrite.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize notification tables"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create notifications table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS notifications (
                id TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                notification_type TEXT NOT NULL,
                priority TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'unread',
                created_at TIMESTAMP NOT NULL,
                read_at TIMESTAMP,
                archived_at TIMESTAMP,
                data TEXT,
                action_url TEXT,
                expires_at TIMESTAMP,
                category TEXT,
                icon TEXT,
                color TEXT,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Create notification preferences table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS notification_preferences (
                user_id INTEGER PRIMARY KEY,
                email_enabled BOOLEAN DEFAULT 1,
                push_enabled BOOLEAN DEFAULT 1,
                in_app_enabled BOOLEAN DEFAULT 1,
                marketing_enabled BOOLEAN DEFAULT 1,
                security_enabled BOOLEAN DEFAULT 1,
                updates_enabled BOOLEAN DEFAULT 1,
                reminders_enabled BOOLEAN DEFAULT 1,
                quiet_hours_start TIME,
                quiet_hours_end TIME,
                timezone TEXT DEFAULT 'UTC',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def create_notification(self, notification: Notification) -> bool:
        """Create a new notification"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO notifications (
                    id, user_id, title, message, notification_type, priority, status,
                    created_at, read_at, archived_at, data, action_url, expires_at,
                    category, icon, color
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                notification.id, notification.user_id, notification.title, notification.message,
                notification.notification_type.value, notification.priority.value, notification.status.value,
                notification.created_at.isoformat(), notification.read_at.isoformat() if notification.read_at else None,
                notification.archived_at.isoformat() if notification.archived_at else None,
                json.dumps(notification.data) if notification.data else None,
                notification.action_url, notification.expires_at.isoformat() if notification.expires_at else None,
                notification.category, notification.icon, notification.color
            ))
            
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            logger.error(f"Error creating notification: {e}")
            return False
    
    def get_user_notifications(self, user_id: int, limit: int = 50, offset: int = 0, 
                             status: Optional[NotificationStatus] = None,
                             notification_type: Optional[NotificationType] = None) -> List[Notification]:
        """Get notifications for a user"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            query = '''
                SELECT id, user_id, title, message, notification_type, priority, status,
                       created_at, read_at, archived_at, data, action_url, expires_at,
                       category, icon, color
                FROM notifications
                WHERE user_id = ?
            '''
            params = [user_id]
            
            if status:
                query += ' AND status = ?'
                params.append(status.value)
            
            if notification_type:
                query += ' AND notification_type = ?'
                params.append(notification_type.value)
            
            query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
            params.extend([limit, offset])
            
            cursor.execute(query, params)
            rows = cursor.fetchall()
            conn.close()
            
            notifications = []
            for row in rows:
                notification = Notification(
                    id=row[0], user_id=row[1], title=row[2], message=row[3],
                    notification_type=NotificationType(row[4]), priority=NotificationPriority(row[5]),
                    status=NotificationStatus(row[6]), created_at=datetime.fromisoformat(row[7]),
                    read_at=datetime.fromisoformat(row[8]) if row[8] else None,
                    archived_at=datetime.fromisoformat(row[9]) if row[9] else None,
                    data=json.loads(row[10]) if row[10] else None,
                    action_url=row[11], expires_at=datetime.fromisoformat(row[12]) if row[12] else None,
                    category=row[13], icon=row[14], color=row[15]
                )
                notifications.append(notification)
            
            return notifications
        except Exception as e:
            logger.error(f"Error getting user notifications: {e}")
            return []
    
    def mark_as_read(self, notification_id: str, user_id: int) -> bool:
        """Mark notification as read"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE notifications
                SET status = ?, read_at = ?
                WHERE id = ? AND user_id = ?
            ''', (NotificationStatus.READ.value, datetime.now().isoformat(), notification_id, user_id))
            
            conn.commit()
            conn.close()
            return cursor.rowcount > 0
        except Exception as e:
            logger.error(f"Error marking notification as read: {e}")
            return False
    
    def mark_all_as_read(self, user_id: int) -> bool:
        """Mark all notifications as read for a user"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE notifications
                SET status = ?, read_at = ?
                WHERE user_id = ? AND status = ?
            ''', (NotificationStatus.READ.value, datetime.now().isoformat(), user_id, NotificationStatus.UNREAD.value))
            
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            logger.error(f"Error marking all notifications as read: {e}")
            return False
    
    def delete_notification(self, notification_id: str, user_id: int) -> bool:
        """Delete a notification"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE notifications
                SET status = ?
                WHERE id = ? AND user_id = ?
            ''', (NotificationStatus.DELETED.value, notification_id, user_id))
            
            conn.commit()
            conn.close()
            return cursor.rowcount > 0
        except Exception as e:
            logger.error(f"Error deleting notification: {e}")
            return False
    
    def get_unread_count(self, user_id: int) -> int:
        """Get unread notification count for a user"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT COUNT(*) FROM notifications
                WHERE user_id = ? AND status = ?
            ''', (user_id, NotificationStatus.UNREAD.value))
            
            count = cursor.fetchone()[0]
            conn.close()
            return count
        except Exception as e:
            logger.error(f"Error getting unread count: {e}")
            return 0

class NotificationService:
    """Main notification service (simplified version)"""
    
    def __init__(self, db_path: str = "prowrite.db"):
        self.db = NotificationDatabase(db_path)
        self.notification_templates = self._load_notification_templates()
    
    def _load_notification_templates(self) -> Dict[str, Dict[str, Any]]:
        """Load notification templates for different types"""
        return {
            "welcome": {
                "title": "Welcome to ProWrite!",
                "message": "Get started by creating your first professional resume",
                "icon": "welcome",
                "color": "#10B981",
                "priority": NotificationPriority.MEDIUM
            },
            "payment_success": {
                "title": "Payment Successful",
                "message": "Your payment has been processed successfully",
                "icon": "check-circle",
                "color": "#10B981",
                "priority": NotificationPriority.HIGH
            },
            "ai_enhancement_complete": {
                "title": "AI Enhancement Complete",
                "message": "Your resume has been enhanced with AI-powered suggestions",
                "icon": "brain",
                "color": "#8B5CF6",
                "priority": NotificationPriority.MEDIUM
            },
            "template_uploaded": {
                "title": "Template Uploaded",
                "message": "Your custom template has been successfully uploaded",
                "icon": "file-text",
                "color": "#06B6D4",
                "priority": NotificationPriority.LOW
            },
            "collaboration_invite": {
                "title": "Collaboration Invite",
                "message": "You've been invited to collaborate on a resume",
                "icon": "users",
                "color": "#F59E0B",
                "priority": NotificationPriority.HIGH
            },
            "security_alert": {
                "title": "Security Alert",
                "message": "Unusual activity detected on your account",
                "icon": "shield",
                "color": "#EF4444",
                "priority": NotificationPriority.URGENT
            }
        }
    
    def create_notification(self, user_id: int, title: str, message: str,
                          notification_type: NotificationType,
                          priority: NotificationPriority = NotificationPriority.MEDIUM,
                          data: Optional[Dict[str, Any]] = None,
                          action_url: Optional[str] = None,
                          expires_at: Optional[datetime] = None,
                          category: Optional[str] = None,
                          icon: Optional[str] = None,
                          color: Optional[str] = None) -> Optional[Notification]:
        """Create and send a notification"""
        try:
            notification = Notification(
                id=str(uuid.uuid4()),
                user_id=user_id,
                title=title,
                message=message,
                notification_type=notification_type,
                priority=priority,
                status=NotificationStatus.UNREAD,
                created_at=datetime.now(),
                data=data,
                action_url=action_url,
                expires_at=expires_at,
                category=category,
                icon=icon,
                color=color
            )
            
            # Save to database
            if self.db.create_notification(notification):
                logger.info(f"Notification created for user {user_id}: {title}")
                return notification
            else:
                logger.error(f"Failed to create notification for user {user_id}")
                return None
                
        except Exception as e:
            logger.error(f"Error creating notification: {e}")
            return None
    
    def create_template_notification(self, template_name: str, user_id: int) -> Optional[Notification]:
        """Create notification from template"""
        template = self.notification_templates.get(template_name)
        if not template:
            return None
        
        return self.create_notification(
            user_id=user_id,
            title=template["title"],
            message=template["message"],
            notification_type=NotificationType.SYSTEM,
            priority=template["priority"],
            icon=template["icon"],
            color=template["color"]
        )
    
    def get_user_notifications(self, user_id: int, limit: int = 50, offset: int = 0,
                             status: Optional[NotificationStatus] = None,
                             notification_type: Optional[NotificationType] = None) -> List[Notification]:
        """Get notifications for a user"""
        return self.db.get_user_notifications(user_id, limit, offset, status, notification_type)
    
    def mark_as_read(self, notification_id: str, user_id: int) -> bool:
        """Mark notification as read"""
        return self.db.mark_as_read(notification_id, user_id)
    
    def mark_all_as_read(self, user_id: int) -> bool:
        """Mark all notifications as read"""
        return self.db.mark_all_as_read(user_id)
    
    def delete_notification(self, notification_id: str, user_id: int) -> bool:
        """Delete a notification"""
        return self.db.delete_notification(notification_id, user_id)
    
    def get_unread_count(self, user_id: int) -> int:
        """Get unread notification count"""
        return self.db.get_unread_count(user_id)

# Global notification service instance
notification_service = NotificationService()

# Convenience functions for common notifications
def notify_payment_success(user_id: int, amount: float, currency: str = "USD"):
    """Send payment success notification"""
    return notification_service.create_notification(
        user_id=user_id,
        title="Payment Successful",
        message=f"Your payment of {currency} {amount:.2f} has been processed successfully",
        notification_type=NotificationType.PAYMENT,
        priority=NotificationPriority.HIGH,
        icon="check-circle",
        color="#10B981",
        action_url="/billing"
    )

def notify_ai_enhancement_complete(user_id: int, resume_title: str):
    """Send AI enhancement completion notification"""
    return notification_service.create_notification(
        user_id=user_id,
        title="AI Enhancement Complete",
        message=f"Your resume '{resume_title}' has been enhanced with AI-powered suggestions",
        notification_type=NotificationType.AI_ENHANCEMENT,
        priority=NotificationPriority.MEDIUM,
        icon="brain",
        color="#8B5CF6",
        action_url="/resumes"
    )

def notify_template_uploaded(user_id: int, template_name: str):
    """Send template upload notification"""
    return notification_service.create_notification(
        user_id=user_id,
        title="Template Uploaded",
        message=f"Your template '{template_name}' has been successfully uploaded and is ready to use",
        notification_type=NotificationType.TEMPLATE,
        priority=NotificationPriority.LOW,
        icon="file-text",
        color="#06B6D4",
        action_url="/templates"
    )

def notify_collaboration_invite(user_id: int, inviter_name: str, resume_title: str):
    """Send collaboration invite notification"""
    return notification_service.create_notification(
        user_id=user_id,
        title="Collaboration Invite",
        message=f"{inviter_name} has invited you to collaborate on '{resume_title}'",
        notification_type=NotificationType.COLLABORATION,
        priority=NotificationPriority.HIGH,
        icon="users",
        color="#F59E0B",
        action_url="/collaboration"
    )

def notify_security_alert(user_id: int, alert_type: str, details: str):
    """Send security alert notification"""
    return notification_service.create_notification(
        user_id=user_id,
        title="Security Alert",
        message=f"{alert_type}: {details}",
        notification_type=NotificationType.SECURITY,
        priority=NotificationPriority.URGENT,
        icon="shield",
        color="#EF4444",
        action_url="/security"
    )

