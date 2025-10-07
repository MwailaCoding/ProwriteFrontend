"""
Flask API routes for the notification system
"""

from flask import Blueprint, request, jsonify, current_app
from functools import wraps
import json
from datetime import datetime, timedelta
from notification_system_simple import (
    notification_service, NotificationType, NotificationPriority, 
    NotificationStatus, notify_payment_success, notify_ai_enhancement_complete,
    notify_template_uploaded, notify_collaboration_invite, notify_security_alert
)

# Create Blueprint
notification_bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')

def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # In a real implementation, you would verify the JWT token here
        # For now, we'll extract user_id from headers or query params
        user_id = request.headers.get('X-User-ID') or request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401
        try:
            user_id = int(user_id)
        except ValueError:
            return jsonify({'error': 'Invalid user ID'}), 400
        return f(user_id, *args, **kwargs)
    return decorated_function

@notification_bp.route('/', methods=['GET'])
@require_auth
def get_notifications(user_id):
    """Get notifications for a user"""
    try:
        # Query parameters
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))
        status = request.args.get('status')
        notification_type = request.args.get('type')
        
        # Convert string to enum if provided
        status_enum = None
        if status:
            try:
                status_enum = NotificationStatus(status)
            except ValueError:
                return jsonify({'error': 'Invalid status'}), 400
        
        type_enum = None
        if notification_type:
            try:
                type_enum = NotificationType(notification_type)
            except ValueError:
                return jsonify({'error': 'Invalid notification type'}), 400
        
        # Get notifications
        notifications = notification_service.get_user_notifications(
            user_id, limit, offset, status_enum, type_enum
        )
        
        # Convert to JSON-serializable format
        notifications_data = []
        for notification in notifications:
            notification_data = {
                'id': notification.id,
                'title': notification.title,
                'message': notification.message,
                'type': notification.notification_type.value,
                'priority': notification.priority.value,
                'status': notification.status.value,
                'created_at': notification.created_at.isoformat(),
                'read_at': notification.read_at.isoformat() if notification.read_at else None,
                'archived_at': notification.archived_at.isoformat() if notification.archived_at else None,
                'data': notification.data,
                'action_url': notification.action_url,
                'expires_at': notification.expires_at.isoformat() if notification.expires_at else None,
                'category': notification.category,
                'icon': notification.icon,
                'color': notification.color
            }
            notifications_data.append(notification_data)
        
        return jsonify({
            'success': True,
            'notifications': notifications_data,
            'total': len(notifications_data)
        })
        
    except Exception as e:
        current_app.logger.error(f"Error getting notifications: {e}")
        return jsonify({'error': 'Failed to get notifications'}), 500

@notification_bp.route('/unread-count', methods=['GET'])
@require_auth
def get_unread_count(user_id):
    """Get unread notification count for a user"""
    try:
        count = notification_service.get_unread_count(user_id)
        return jsonify({
            'success': True,
            'unread_count': count
        })
    except Exception as e:
        current_app.logger.error(f"Error getting unread count: {e}")
        return jsonify({'error': 'Failed to get unread count'}), 500

@notification_bp.route('/<notification_id>/read', methods=['POST'])
@require_auth
def mark_as_read(user_id, notification_id):
    """Mark a notification as read"""
    try:
        success = notification_service.mark_as_read(notification_id, user_id)
        if success:
            return jsonify({'success': True, 'message': 'Notification marked as read'})
        else:
            return jsonify({'error': 'Notification not found or already read'}), 404
    except Exception as e:
        current_app.logger.error(f"Error marking notification as read: {e}")
        return jsonify({'error': 'Failed to mark notification as read'}), 500

@notification_bp.route('/mark-all-read', methods=['POST'])
@require_auth
def mark_all_as_read(user_id):
    """Mark all notifications as read for a user"""
    try:
        success = notification_service.mark_all_as_read(user_id)
        if success:
            return jsonify({'success': True, 'message': 'All notifications marked as read'})
        else:
            return jsonify({'error': 'Failed to mark notifications as read'}), 500
    except Exception as e:
        current_app.logger.error(f"Error marking all notifications as read: {e}")
        return jsonify({'error': 'Failed to mark all notifications as read'}), 500

@notification_bp.route('/<notification_id>', methods=['DELETE'])
@require_auth
def delete_notification(user_id, notification_id):
    """Delete a notification"""
    try:
        success = notification_service.delete_notification(notification_id, user_id)
        if success:
            return jsonify({'success': True, 'message': 'Notification deleted'})
        else:
            return jsonify({'error': 'Notification not found'}), 404
    except Exception as e:
        current_app.logger.error(f"Error deleting notification: {e}")
        return jsonify({'error': 'Failed to delete notification'}), 500

@notification_bp.route('/create', methods=['POST'])
@require_auth
def create_notification(user_id):
    """Create a new notification"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'message', 'type']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Parse notification type
        try:
            notification_type = NotificationType(data['type'])
        except ValueError:
            return jsonify({'error': 'Invalid notification type'}), 400
        
        # Parse priority (optional)
        priority = NotificationPriority.MEDIUM
        if 'priority' in data:
            try:
                priority = NotificationPriority(data['priority'])
            except ValueError:
                return jsonify({'error': 'Invalid priority'}), 400
        
        # Create notification
        notification = notification_service.create_notification(
            user_id=user_id,
            title=data['title'],
            message=data['message'],
            notification_type=notification_type,
            priority=priority,
            data=data.get('data'),
            action_url=data.get('action_url'),
            expires_at=datetime.fromisoformat(data['expires_at']) if data.get('expires_at') else None,
            category=data.get('category'),
            icon=data.get('icon'),
            color=data.get('color')
        )
        
        if notification:
            return jsonify({
                'success': True,
                'notification': {
                    'id': notification.id,
                    'title': notification.title,
                    'message': notification.message,
                    'type': notification.notification_type.value,
                    'priority': notification.priority.value,
                    'created_at': notification.created_at.isoformat()
                }
            })
        else:
            return jsonify({'error': 'Failed to create notification'}), 500
            
    except Exception as e:
        current_app.logger.error(f"Error creating notification: {e}")
        return jsonify({'error': 'Failed to create notification'}), 500

@notification_bp.route('/templates', methods=['GET'])
def get_notification_templates():
    """Get available notification templates"""
    try:
        templates = {
            'welcome': {
                'title': 'Welcome to ProWrite!',
                'message': 'Get started by creating your first professional resume',
                'icon': 'welcome',
                'color': '#10B981',
                'priority': 'medium'
            },
            'payment_success': {
                'title': 'Payment Successful',
                'message': 'Your payment has been processed successfully',
                'icon': 'check-circle',
                'color': '#10B981',
                'priority': 'high'
            },
            'ai_enhancement_complete': {
                'title': 'AI Enhancement Complete',
                'message': 'Your resume has been enhanced with AI-powered suggestions',
                'icon': 'brain',
                'color': '#8B5CF6',
                'priority': 'medium'
            },
            'template_uploaded': {
                'title': 'Template Uploaded',
                'message': 'Your custom template has been successfully uploaded',
                'icon': 'file-text',
                'color': '#06B6D4',
                'priority': 'low'
            },
            'collaboration_invite': {
                'title': 'Collaboration Invite',
                'message': 'You\'ve been invited to collaborate on a resume',
                'icon': 'users',
                'color': '#F59E0B',
                'priority': 'high'
            },
            'security_alert': {
                'title': 'Security Alert',
                'message': 'Unusual activity detected on your account',
                'icon': 'shield',
                'color': '#EF4444',
                'priority': 'urgent'
            }
        }
        
        return jsonify({
            'success': True,
            'templates': templates
        })
        
    except Exception as e:
        current_app.logger.error(f"Error getting notification templates: {e}")
        return jsonify({'error': 'Failed to get notification templates'}), 500

@notification_bp.route('/test', methods=['POST'])
@require_auth
def test_notification(user_id):
    """Test notification creation"""
    try:
        data = request.get_json()
        test_type = data.get('type', 'welcome')
        
        if test_type == 'payment':
            notification = notify_payment_success(user_id, 29.99)
        elif test_type == 'ai':
            notification = notify_ai_enhancement_complete(user_id, "Test Resume")
        elif test_type == 'template':
            notification = notify_template_uploaded(user_id, "Test Template")
        elif test_type == 'collaboration':
            notification = notify_collaboration_invite(user_id, "Test User", "Test Resume")
        elif test_type == 'security':
            notification = notify_security_alert(user_id, "Test Alert", "This is a test security alert")
        else:
            notification = notification_service.create_template_notification('welcome', user_id)
        
        if notification:
            return jsonify({
                'success': True,
                'message': f'Test {test_type} notification created',
                'notification_id': notification.id
            })
        else:
            return jsonify({'error': 'Failed to create test notification'}), 500
            
    except Exception as e:
        current_app.logger.error(f"Error creating test notification: {e}")
        return jsonify({'error': 'Failed to create test notification'}), 500

@notification_bp.route('/preferences', methods=['GET'])
@require_auth
def get_notification_preferences(user_id):
    """Get notification preferences for a user"""
    try:
        # This would typically fetch from the database
        # For now, return default preferences
        preferences = {
            'email_enabled': True,
            'push_enabled': True,
            'in_app_enabled': True,
            'marketing_enabled': True,
            'security_enabled': True,
            'updates_enabled': True,
            'reminders_enabled': True,
            'quiet_hours_start': None,
            'quiet_hours_end': None,
            'timezone': 'UTC'
        }
        
        return jsonify({
            'success': True,
            'preferences': preferences
        })
        
    except Exception as e:
        current_app.logger.error(f"Error getting notification preferences: {e}")
        return jsonify({'error': 'Failed to get notification preferences'}), 500

@notification_bp.route('/preferences', methods=['PUT'])
@require_auth
def update_notification_preferences(user_id):
    """Update notification preferences for a user"""
    try:
        data = request.get_json()
        
        # This would typically update the database
        # For now, just return success
        return jsonify({
            'success': True,
            'message': 'Notification preferences updated'
        })
        
    except Exception as e:
        current_app.logger.error(f"Error updating notification preferences: {e}")
        return jsonify({'error': 'Failed to update notification preferences'}), 500

# WebSocket endpoint for real-time notifications
@notification_bp.route('/websocket', methods=['GET'])
def websocket_info():
    """Get WebSocket connection information"""
    return jsonify({
        'success': True,
        'websocket_url': 'ws://localhost:8765',
        'message': 'Connect to WebSocket with ?user_id=YOUR_USER_ID'
    })
