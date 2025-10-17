"""
Admin API Routes for ProWrite
Comprehensive admin system with user management, document tracking, and analytics
"""

from flask import Blueprint, request, jsonify, send_file
import mysql.connector
import os
import logging
from datetime import datetime, timedelta
from functools import wraps
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'Prowrite.mysql.pythonanywhere-services.com'),
    'user': os.getenv('DB_USER', 'Prowrite'),
    'password': os.getenv('DB_PASSWORD', 'Hamilton2025'),
    'database': os.getenv('DB_NAME', 'Prowrite$dbprowrite'),
    'charset': 'utf8mb4'
}

# Create Blueprint
admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

# Configure logging
logger = logging.getLogger(__name__)

def get_db_connection():
    """Get database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except mysql.connector.Error as e:
        logger.error(f"Database connection error: {e}")
        return None

def admin_required(f):
    """Decorator to require admin privileges"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "No token provided"}), 401
        
        try:
            token = auth_header.split(' ')[1]  # Bearer <token>
        except IndexError:
            return jsonify({"error": "Invalid token format"}), 401
        
        # Verify token and check admin status
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500
        
        try:
            cursor = connection.cursor()
            
            # Decode token (simplified - in production use proper JWT verification)
            # For now, we'll get user from token payload
            # This should be replaced with proper JWT verification
            user_id = request.current_user.get('user_id') if hasattr(request, 'current_user') else None
            
            if not user_id:
                return jsonify({"error": "Invalid token"}), 401
            
            # Check if user is admin
            cursor.execute("SELECT is_admin FROM users WHERE user_id = %s", (user_id,))
            user_data = cursor.fetchone()
            
            if not user_data or not user_data[0]:
                return jsonify({"error": "Admin privileges required"}), 403
            
            # Log admin action
            log_admin_action(user_id, f"accessed_{f.__name__}", request.path, request.remote_addr)
            
            return f(*args, **kwargs)
            
        except Exception as e:
            logger.error(f"Admin verification error: {e}")
            return jsonify({"error": "Admin verification failed"}), 500
        finally:
            if connection:
                connection.close()
    
    return decorated_function

def log_admin_action(admin_id, action, target_path, ip_address):
    """Log admin action to database"""
    connection = get_db_connection()
    if not connection:
        return
    
    try:
        cursor = connection.cursor()
        cursor.execute("""
            INSERT INTO admin_activity_logs (admin_id, action, target_type, details, ip_address)
            VALUES (%s, %s, %s, %s, %s)
        """, (admin_id, action, 'api_endpoint', f'{{"path": "{target_path}"}}', ip_address))
        connection.commit()
    except Exception as e:
        logger.error(f"Failed to log admin action: {e}")
    finally:
        if connection:
            connection.close()

# User Management Routes
@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_users():
    """Get all users with filtering and pagination"""
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 50))
        search = request.args.get('search', '')
        filter_type = request.args.get('filter', 'all')  # all, premium, free, admin
        
        offset = (page - 1) * per_page
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500
        
        try:
            cursor = connection.cursor()
            
            # Build query with filters
            where_conditions = []
            params = []
            
            if search:
                where_conditions.append("(email LIKE %s OR first_name LIKE %s OR last_name LIKE %s)")
                search_param = f"%{search}%"
                params.extend([search_param, search_param, search_param])
            
            if filter_type == 'premium':
                where_conditions.append("is_premium = 1")
            elif filter_type == 'free':
                where_conditions.append("is_premium = 0")
            elif filter_type == 'admin':
                where_conditions.append("is_admin = 1")
            
            where_clause = "WHERE " + " AND ".join(where_conditions) if where_conditions else ""
            
            # Get total count
            count_query = f"SELECT COUNT(*) FROM users {where_clause}"
            cursor.execute(count_query, params)
            total_count = cursor.fetchone()[0]
            
            # Get users
            query = f"""
                SELECT user_id, email, first_name, last_name, is_premium, is_admin, 
                       created_at, last_login, is_active
                FROM users {where_clause}
                ORDER BY created_at DESC
                LIMIT %s OFFSET %s
            """
            cursor.execute(query, params + [per_page, offset])
            users = cursor.fetchall()
            
            # Format response
            user_list = []
            for user in users:
                user_list.append({
                    "id": user[0],
                    "email": user[1],
                    "firstName": user[2],
                    "lastName": user[3],
                    "isPremium": bool(user[4]),
                    "isAdmin": bool(user[5]),
                    "createdAt": user[6].isoformat() if user[6] else None,
                    "lastLogin": user[7].isoformat() if user[7] else None,
                    "isActive": bool(user[8])
                })
            
            return jsonify({
                "users": user_list,
                "pagination": {
                    "page": page,
                    "per_page": per_page,
                    "total": total_count,
                    "pages": (total_count + per_page - 1) // per_page
                }
            }), 200
            
        finally:
            if connection:
                connection.close()
                
    except Exception as e:
        logger.error(f"Get users error: {e}")
        return jsonify({"error": "Failed to get users"}), 500

@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@admin_required
def get_user_details(user_id):
    """Get detailed user information"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500
        
        try:
            cursor = connection.cursor()
            
            # Get user details
            cursor.execute("""
                SELECT user_id, email, first_name, last_name, phone_number, country,
                       is_premium, is_admin, created_at, last_login, is_active,
                       bio, location, website, linkedin, github, twitter
                FROM users WHERE user_id = %s
            """, (user_id,))
            
            user_data = cursor.fetchone()
            if not user_data:
                return jsonify({"error": "User not found"}), 404
            
            # Get user's document count
            cursor.execute("""
                SELECT COUNT(*) FROM user_documents WHERE user_id = %s
            """, (user_id,))
            document_count = cursor.fetchone()[0]
            
            # Get user's payment count
            cursor.execute("""
                SELECT COUNT(*) FROM manual_payments 
                WHERE JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.personalEmail')) = %s
            """, (user_data[1],))
            payment_count = cursor.fetchone()[0]
            
            user_details = {
                "id": user_data[0],
                "email": user_data[1],
                "firstName": user_data[2],
                "lastName": user_data[3],
                "phone": user_data[4],
                "country": user_data[5],
                "isPremium": bool(user_data[6]),
                "isAdmin": bool(user_data[7]),
                "createdAt": user_data[8].isoformat() if user_data[8] else None,
                "lastLogin": user_data[9].isoformat() if user_data[9] else None,
                "isActive": bool(user_data[10]),
                "bio": user_data[11],
                "location": user_data[12],
                "website": user_data[13],
                "linkedin": user_data[14],
                "github": user_data[15],
                "twitter": user_data[16],
                "documentCount": document_count,
                "paymentCount": payment_count
            }
            
            return jsonify({"user": user_details}), 200
            
        finally:
            if connection:
                connection.close()
                
    except Exception as e:
        logger.error(f"Get user details error: {e}")
        return jsonify({"error": "Failed to get user details"}), 500

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    """Update user information"""
    try:
        data = request.get_json()
        admin_id = request.current_user.get('user_id')
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500
        
        try:
            cursor = connection.cursor()
            
            # Check if user exists
            cursor.execute("SELECT user_id FROM users WHERE user_id = %s", (user_id,))
            if not cursor.fetchone():
                return jsonify({"error": "User not found"}), 404
            
            # Build update query
            update_fields = []
            params = []
            
            if 'isPremium' in data:
                update_fields.append("is_premium = %s")
                params.append(data['isPremium'])
            
            if 'isAdmin' in data:
                update_fields.append("is_admin = %s")
                params.append(data['isAdmin'])
            
            if 'isActive' in data:
                update_fields.append("is_active = %s")
                params.append(data['isActive'])
            
            if 'firstName' in data:
                update_fields.append("first_name = %s")
                params.append(data['firstName'])
            
            if 'lastName' in data:
                update_fields.append("last_name = %s")
                params.append(data['lastName'])
            
            if not update_fields:
                return jsonify({"error": "No fields to update"}), 400
            
            # Add updated_at
            update_fields.append("updated_at = NOW()")
            params.append(user_id)
            
            query = f"UPDATE users SET {', '.join(update_fields)} WHERE user_id = %s"
            cursor.execute(query, params)
            connection.commit()
            
            # Log admin action
            log_admin_action(admin_id, f"updated_user_{user_id}", f"users/{user_id}", request.remote_addr)
            
            return jsonify({"message": "User updated successfully"}), 200
            
        finally:
            if connection:
                connection.close()
                
    except Exception as e:
        logger.error(f"Update user error: {e}")
        return jsonify({"error": "Failed to update user"}), 500

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    """Delete user account"""
    try:
        admin_id = request.current_user.get('user_id')
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500
        
        try:
            cursor = connection.cursor()
            
            # Check if user exists
            cursor.execute("SELECT email FROM users WHERE user_id = %s", (user_id,))
            user_data = cursor.fetchone()
            if not user_data:
                return jsonify({"error": "User not found"}), 404
            
            # Prevent admin from deleting themselves
            if admin_id == user_id:
                return jsonify({"error": "Cannot delete your own account"}), 400
            
            # Delete user (cascade will handle related records)
            cursor.execute("DELETE FROM users WHERE user_id = %s", (user_id,))
            connection.commit()
            
            # Log admin action
            log_admin_action(admin_id, f"deleted_user_{user_id}", f"users/{user_id}", request.remote_addr)
            
            return jsonify({"message": "User deleted successfully"}), 200
            
        finally:
            if connection:
                connection.close()
                
    except Exception as e:
        logger.error(f"Delete user error: {e}")
        return jsonify({"error": "Failed to delete user"}), 500

@admin_bp.route('/users/<int:user_id>/documents', methods=['GET'])
@admin_required
def get_user_documents(user_id):
    """Get all documents for a specific user"""
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        offset = (page - 1) * per_page
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500
        
        try:
            cursor = connection.cursor()
            
            # Check if user exists
            cursor.execute("SELECT email FROM users WHERE user_id = %s", (user_id,))
            if not cursor.fetchone():
                return jsonify({"error": "User not found"}), 404
            
            # Get total count
            cursor.execute("SELECT COUNT(*) FROM user_documents WHERE user_id = %s", (user_id,))
            total_count = cursor.fetchone()[0]
            
            # Get documents
            cursor.execute("""
                SELECT id, document_type, reference, status, download_count, created_at
                FROM user_documents 
                WHERE user_id = %s
                ORDER BY created_at DESC
                LIMIT %s OFFSET %s
            """, (user_id, per_page, offset))
            
            documents = cursor.fetchall()
            
            document_list = []
            for doc in documents:
                document_list.append({
                    "id": doc[0],
                    "documentType": doc[1],
                    "reference": doc[2],
                    "status": doc[3],
                    "downloadCount": doc[4],
                    "createdAt": doc[5].isoformat() if doc[5] else None
                })
            
            return jsonify({
                "documents": document_list,
                "pagination": {
                    "page": page,
                    "per_page": per_page,
                    "total": total_count,
                    "pages": (total_count + per_page - 1) // per_page
                }
            }), 200
            
        finally:
            if connection:
                connection.close()
                
    except Exception as e:
        logger.error(f"Get user documents error: {e}")
        return jsonify({"error": "Failed to get user documents"}), 500

# Document Management Routes
@admin_bp.route('/documents', methods=['GET'])
@admin_required
def get_all_documents():
    """Get all documents across all users"""
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 50))
        search = request.args.get('search', '')
        document_type = request.args.get('type', '')
        date_from = request.args.get('date_from', '')
        date_to = request.args.get('date_to', '')
        
        offset = (page - 1) * per_page
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500
        
        try:
            cursor = connection.cursor()
            
            # Build query with filters
            where_conditions = []
            params = []
            
            if search:
                where_conditions.append("(ud.reference LIKE %s OR u.email LIKE %s)")
                search_param = f"%{search}%"
                params.extend([search_param, search_param])
            
            if document_type:
                where_conditions.append("ud.document_type = %s")
                params.append(document_type)
            
            if date_from:
                where_conditions.append("ud.created_at >= %s")
                params.append(date_from)
            
            if date_to:
                where_conditions.append("ud.created_at <= %s")
                params.append(date_to)
            
            where_clause = "WHERE " + " AND ".join(where_conditions) if where_conditions else ""
            
            # Get total count
            count_query = f"""
                SELECT COUNT(*) FROM user_documents ud
                JOIN users u ON ud.user_id = u.user_id
                {where_clause}
            """
            cursor.execute(count_query, params)
            total_count = cursor.fetchone()[0]
            
            # Get documents with user info
            query = f"""
                SELECT ud.id, ud.document_type, ud.reference, ud.status, 
                       ud.download_count, ud.created_at, ud.file_path,
                       u.user_id, u.email, u.first_name, u.last_name
                FROM user_documents ud
                JOIN users u ON ud.user_id = u.user_id
                {where_clause}
                ORDER BY ud.created_at DESC
                LIMIT %s OFFSET %s
            """
            cursor.execute(query, params + [per_page, offset])
            documents = cursor.fetchall()
            
            document_list = []
            for doc in documents:
                document_list.append({
                    "id": doc[0],
                    "documentType": doc[1],
                    "reference": doc[2],
                    "status": doc[3],
                    "downloadCount": doc[4],
                    "createdAt": doc[5].isoformat() if doc[5] else None,
                    "filePath": doc[6],
                    "user": {
                        "id": doc[7],
                        "email": doc[8],
                        "firstName": doc[9],
                        "lastName": doc[10]
                    }
                })
            
            return jsonify({
                "documents": document_list,
                "pagination": {
                    "page": page,
                    "per_page": per_page,
                    "total": total_count,
                    "pages": (total_count + per_page - 1) // per_page
                }
            }), 200
            
        finally:
            if connection:
                connection.close()
                
    except Exception as e:
        logger.error(f"Get all documents error: {e}")
        return jsonify({"error": "Failed to get documents"}), 500

@admin_bp.route('/documents/<reference>/download', methods=['GET'])
@admin_required
def download_document(reference):
    """Download any document by reference"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500
        
        try:
            cursor = connection.cursor()
            
            # Get document info
            cursor.execute("""
                SELECT ud.file_path, ud.document_type, u.email
                FROM user_documents ud
                JOIN users u ON ud.user_id = u.user_id
                WHERE ud.reference = %s
            """, (reference,))
            
            doc_data = cursor.fetchone()
            if not doc_data:
                return jsonify({"error": "Document not found"}), 404
            
            file_path, document_type, user_email = doc_data
            
            # Update download count
            cursor.execute("""
                UPDATE user_documents 
                SET download_count = download_count + 1 
                WHERE reference = %s
            """, (reference,))
            connection.commit()
            
            # Log admin action
            admin_id = request.current_user.get('user_id')
            log_admin_action(admin_id, f"downloaded_document_{reference}", f"documents/{reference}/download", request.remote_addr)
            
            # Return file if it exists, otherwise return download URL
            if file_path and os.path.exists(file_path):
                return send_file(file_path, as_attachment=True, download_name=f"{reference}.pdf")
            else:
                # Generate on-demand download URL
                download_url = f"/api/downloads/resume_{reference}.pdf"
                return jsonify({
                    "message": "Document download initiated",
                    "download_url": download_url,
                    "document_type": document_type,
                    "user_email": user_email
                }), 200
            
        finally:
            if connection:
                connection.close()
                
    except Exception as e:
        logger.error(f"Download document error: {e}")
        return jsonify({"error": "Failed to download document"}), 500

# Payment Management Routes
@admin_bp.route('/payments', methods=['GET'])
@admin_required
def get_all_payments():
    """Get all payments with filtering"""
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 50))
        status = request.args.get('status', '')
        payment_type = request.args.get('type', '')
        date_from = request.args.get('date_from', '')
        date_to = request.args.get('date_to', '')
        
        offset = (page - 1) * per_page
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500
        
        try:
            cursor = connection.cursor()
            
            # Get manual payments
            where_conditions = []
            params = []
            
            if status:
                where_conditions.append("status = %s")
                params.append(status)
            
            if date_from:
                where_conditions.append("created_at >= %s")
                params.append(date_from)
            
            if date_to:
                where_conditions.append("created_at <= %s")
                params.append(date_to)
            
            where_clause = "WHERE " + " AND ".join(where_conditions) if where_conditions else ""
            
            # Get manual payments
            query = f"""
                SELECT id, reference, amount, status, document_type, 
                       transaction_code, created_at, updated_at,
                       JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.personalEmail')) as user_email
                FROM manual_payments
                {where_clause}
                ORDER BY created_at DESC
                LIMIT %s OFFSET %s
            """
            cursor.execute(query, params + [per_page, offset])
            manual_payments = cursor.fetchall()
            
            payment_list = []
            for payment in manual_payments:
                payment_list.append({
                    "id": payment[0],
                    "reference": payment[1],
                    "amount": float(payment[2]),
                    "status": payment[3],
                    "documentType": payment[4],
                    "transactionCode": payment[5],
                    "createdAt": payment[6].isoformat() if payment[6] else None,
                    "updatedAt": payment[7].isoformat() if payment[7] else None,
                    "userEmail": payment[8],
                    "paymentType": "manual"
                })
            
            return jsonify({
                "payments": payment_list,
                "pagination": {
                    "page": page,
                    "per_page": per_page,
                    "total": len(payment_list),
                    "pages": 1
                }
            }), 200
            
        finally:
            if connection:
                connection.close()
                
    except Exception as e:
        logger.error(f"Get payments error: {e}")
        return jsonify({"error": "Failed to get payments"}), 500

@admin_bp.route('/payments/<int:payment_id>/approve', methods=['PUT'])
@admin_required
def approve_payment(payment_id):
    """Approve or reject a payment"""
    try:
        data = request.get_json()
        action = data.get('action')  # 'approve' or 'reject'
        reason = data.get('reason', '')
        admin_id = request.current_user.get('user_id')
        
        if action not in ['approve', 'reject']:
            return jsonify({"error": "Invalid action. Must be 'approve' or 'reject'"}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500
        
        try:
            cursor = connection.cursor()
            
            # Get payment details
            cursor.execute("""
                SELECT reference, status, JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.personalEmail')) as user_email
                FROM manual_payments WHERE id = %s
            """, (payment_id,))
            
            payment_data = cursor.fetchone()
            if not payment_data:
                return jsonify({"error": "Payment not found"}), 404
            
            reference, current_status, user_email = payment_data
            
            if current_status != 'pending':
                return jsonify({"error": f"Payment is already {current_status}"}), 400
            
            # Update payment status
            new_status = 'completed' if action == 'approve' else 'failed'
            cursor.execute("""
                UPDATE manual_payments 
                SET status = %s, updated_at = NOW()
                WHERE id = %s
            """, (new_status, payment_id))
            
            # Log in payment_approvals table
            cursor.execute("""
                INSERT INTO payment_approvals 
                (payment_id, payment_type, reference, amount, user_email, status, approved_by, created_at)
                SELECT id, 'manual', reference, amount, 
                       JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.personalEmail')),
                       %s, %s, NOW()
                FROM manual_payments WHERE id = %s
            """, (new_status, admin_id, payment_id))
            
            connection.commit()
            
            # Log admin action
            log_admin_action(admin_id, f"{action}_payment_{payment_id}", f"payments/{payment_id}/approve", request.remote_addr)
            
            return jsonify({
                "message": f"Payment {action}d successfully",
                "status": new_status,
                "reference": reference
            }), 200
            
        finally:
            if connection:
                connection.close()
                
    except Exception as e:
        logger.error(f"Approve payment error: {e}")
        return jsonify({"error": "Failed to process payment"}), 500

# System Logs Routes
@admin_bp.route('/system/logs', methods=['GET'])
@admin_required
def get_system_logs():
    """Get system activity logs"""
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 100))
        level = request.args.get('level', '')
        module = request.args.get('module', '')
        date_from = request.args.get('date_from', '')
        date_to = request.args.get('date_to', '')
        
        offset = (page - 1) * per_page
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500
        
        try:
            cursor = connection.cursor()
            
            # Build query with filters
            where_conditions = []
            params = []
            
            if level:
                where_conditions.append("level = %s")
                params.append(level)
            
            if module:
                where_conditions.append("module = %s")
                params.append(module)
            
            if date_from:
                where_conditions.append("created_at >= %s")
                params.append(date_from)
            
            if date_to:
                where_conditions.append("created_at <= %s")
                params.append(date_to)
            
            where_clause = "WHERE " + " AND ".join(where_conditions) if where_conditions else ""
            
            # Get total count
            count_query = f"SELECT COUNT(*) FROM system_logs {where_clause}"
            cursor.execute(count_query, params)
            total_count = cursor.fetchone()[0]
            
            # Get logs
            query = f"""
                SELECT id, level, message, module, user_id, ip_address, 
                       metadata, created_at
                FROM system_logs {where_clause}
                ORDER BY created_at DESC
                LIMIT %s OFFSET %s
            """
            cursor.execute(query, params + [per_page, offset])
            logs = cursor.fetchall()
            
            log_list = []
            for log in logs:
                log_list.append({
                    "id": log[0],
                    "level": log[1],
                    "message": log[2],
                    "module": log[3],
                    "userId": log[4],
                    "ipAddress": log[5],
                    "metadata": log[6],
                    "createdAt": log[7].isoformat() if log[7] else None
                })
            
            return jsonify({
                "logs": log_list,
                "pagination": {
                    "page": page,
                    "per_page": per_page,
                    "total": total_count,
                    "pages": (total_count + per_page - 1) // per_page
                }
            }), 200
            
        finally:
            if connection:
                connection.close()
                
    except Exception as e:
        logger.error(f"Get system logs error: {e}")
        return jsonify({"error": "Failed to get system logs"}), 500

@admin_bp.route('/system/audit', methods=['GET'])
@admin_required
def get_audit_trail():
    """Get admin audit trail"""
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 100))
        admin_id = request.args.get('admin_id', '')
        action = request.args.get('action', '')
        date_from = request.args.get('date_from', '')
        date_to = request.args.get('date_to', '')
        
        offset = (page - 1) * per_page
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500
        
        try:
            cursor = connection.cursor()
            
            # Build query with filters
            where_conditions = []
            params = []
            
            if admin_id:
                where_conditions.append("aal.admin_id = %s")
                params.append(admin_id)
            
            if action:
                where_conditions.append("aal.action LIKE %s")
                params.append(f"%{action}%")
            
            if date_from:
                where_conditions.append("aal.created_at >= %s")
                params.append(date_from)
            
            if date_to:
                where_conditions.append("aal.created_at <= %s")
                params.append(date_to)
            
            where_clause = "WHERE " + " AND ".join(where_conditions) if where_conditions else ""
            
            # Get total count
            count_query = f"""
                SELECT COUNT(*) FROM admin_activity_logs aal
                JOIN users u ON aal.admin_id = u.user_id
                {where_clause}
            """
            cursor.execute(count_query, params)
            total_count = cursor.fetchone()[0]
            
            # Get audit trail
            query = f"""
                SELECT aal.id, aal.action, aal.target_type, aal.target_id,
                       aal.details, aal.ip_address, aal.created_at,
                       u.email as admin_email, u.first_name, u.last_name
                FROM admin_activity_logs aal
                JOIN users u ON aal.admin_id = u.user_id
                {where_clause}
                ORDER BY aal.created_at DESC
                LIMIT %s OFFSET %s
            """
            cursor.execute(query, params + [per_page, offset])
            audit_logs = cursor.fetchall()
            
            audit_list = []
            for log in audit_logs:
                audit_list.append({
                    "id": log[0],
                    "action": log[1],
                    "targetType": log[2],
                    "targetId": log[3],
                    "details": log[4],
                    "ipAddress": log[5],
                    "createdAt": log[6].isoformat() if log[6] else None,
                    "admin": {
                        "email": log[7],
                        "firstName": log[8],
                        "lastName": log[9]
                    }
                })
            
            return jsonify({
                "auditLogs": audit_list,
                "pagination": {
                    "page": page,
                    "per_page": per_page,
                    "total": total_count,
                    "pages": (total_count + per_page - 1) // per_page
                }
            }), 200
            
        finally:
            if connection:
                connection.close()
                
    except Exception as e:
        logger.error(f"Get audit trail error: {e}")
        return jsonify({"error": "Failed to get audit trail"}), 500

# Notification Routes
@admin_bp.route('/notifications/send', methods=['POST'])
@admin_required
def send_notification():
    """Send email/notification to users"""
    try:
        data = request.get_json()
        admin_id = request.current_user.get('user_id')
        
        recipient_type = data.get('recipient_type')  # 'individual', 'all', 'premium', 'free'
        recipient_email = data.get('recipient_email', '')
        subject = data.get('subject', '')
        body = data.get('body', '')
        body_html = data.get('body_html', '')
        scheduled_at = data.get('scheduled_at')
        
        if not subject or not body:
            return jsonify({"error": "Subject and body are required"}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500
        
        try:
            cursor = connection.cursor()
            
            if recipient_type == 'individual':
                if not recipient_email:
                    return jsonify({"error": "Recipient email is required for individual notifications"}), 400
                
                # Get user ID if user exists
                cursor.execute("SELECT user_id FROM users WHERE email = %s", (recipient_email,))
                user_data = cursor.fetchone()
                recipient_id = user_data[0] if user_data else None
                
                # Add to notification queue
                cursor.execute("""
                    INSERT INTO notification_queue 
                    (recipient_id, recipient_email, subject, body, body_html, 
                     status, scheduled_at, created_by, created_at)
                    VALUES (%s, %s, %s, %s, %s, 'pending', %s, %s, NOW())
                """, (recipient_id, recipient_email, subject, body, body_html, scheduled_at, admin_id))
                
            else:
                # Get users based on type
                if recipient_type == 'all':
                    cursor.execute("SELECT user_id, email FROM users WHERE is_active = 1")
                elif recipient_type == 'premium':
                    cursor.execute("SELECT user_id, email FROM users WHERE is_premium = 1 AND is_active = 1")
                elif recipient_type == 'free':
                    cursor.execute("SELECT user_id, email FROM users WHERE is_premium = 0 AND is_active = 1")
                else:
                    return jsonify({"error": "Invalid recipient type"}), 400
                
                users = cursor.fetchall()
                
                # Add notifications for all users
                for user_id, email in users:
                    cursor.execute("""
                        INSERT INTO notification_queue 
                        (recipient_id, recipient_email, subject, body, body_html, 
                         status, scheduled_at, created_by, created_at)
                        VALUES (%s, %s, %s, %s, %s, 'pending', %s, %s, NOW())
                    """, (user_id, email, subject, body, body_html, scheduled_at, admin_id))
            
            connection.commit()
            
            # Log admin action
            log_admin_action(admin_id, f"sent_notification_{recipient_type}", "notifications/send", request.remote_addr)
            
            return jsonify({
                "message": "Notification queued successfully",
                "recipient_type": recipient_type,
                "scheduled_at": scheduled_at
            }), 200
            
        finally:
            if connection:
                connection.close()
                
    except Exception as e:
        logger.error(f"Send notification error: {e}")
        return jsonify({"error": "Failed to send notification"}), 500

@admin_bp.route('/notifications', methods=['GET'])
@admin_required
def get_notifications():
    """Get notification history"""
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 50))
        status = request.args.get('status', '')
        
        offset = (page - 1) * per_page
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500
        
        try:
            cursor = connection.cursor()
            
            where_conditions = []
            params = []
            
            if status:
                where_conditions.append("status = %s")
                params.append(status)
            
            where_clause = "WHERE " + " AND ".join(where_conditions) if where_conditions else ""
            
            # Get total count
            count_query = f"SELECT COUNT(*) FROM notification_queue {where_clause}"
            cursor.execute(count_query, params)
            total_count = cursor.fetchone()[0]
            
            # Get notifications
            query = f"""
                SELECT nq.id, nq.recipient_email, nq.subject, nq.status,
                       nq.scheduled_at, nq.sent_at, nq.error_message,
                       nq.created_at, u.email as created_by_email
                FROM notification_queue nq
                LEFT JOIN users u ON nq.created_by = u.user_id
                {where_clause}
                ORDER BY nq.created_at DESC
                LIMIT %s OFFSET %s
            """
            cursor.execute(query, params + [per_page, offset])
            notifications = cursor.fetchall()
            
            notification_list = []
            for notif in notifications:
                notification_list.append({
                    "id": notif[0],
                    "recipientEmail": notif[1],
                    "subject": notif[2],
                    "status": notif[3],
                    "scheduledAt": notif[4].isoformat() if notif[4] else None,
                    "sentAt": notif[5].isoformat() if notif[5] else None,
                    "errorMessage": notif[6],
                    "createdAt": notif[7].isoformat() if notif[7] else None,
                    "createdBy": notif[8]
                })
            
            return jsonify({
                "notifications": notification_list,
                "pagination": {
                    "page": page,
                    "per_page": per_page,
                    "total": total_count,
                    "pages": (total_count + per_page - 1) // per_page
                }
            }), 200
            
        finally:
            if connection:
                connection.close()
                
    except Exception as e:
        logger.error(f"Get notifications error: {e}")
        return jsonify({"error": "Failed to get notifications"}), 500

# Analytics Routes
@admin_bp.route('/analytics/stats', methods=['GET'])
@admin_required
def get_analytics_stats():
    """Get comprehensive system statistics"""
    try:
        period = request.args.get('period', '30d')  # 7d, 30d, 90d, 1y
        
        # Calculate date range
        end_date = datetime.now()
        if period == '7d':
            start_date = end_date - timedelta(days=7)
        elif period == '30d':
            start_date = end_date - timedelta(days=30)
        elif period == '90d':
            start_date = end_date - timedelta(days=90)
        elif period == '1y':
            start_date = end_date - timedelta(days=365)
        else:
            start_date = end_date - timedelta(days=30)
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500
        
        try:
            cursor = connection.cursor()
            
            # User statistics
            cursor.execute("SELECT COUNT(*) FROM users")
            total_users = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM users WHERE is_premium = 1")
            premium_users = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM users WHERE created_at >= %s", (start_date,))
            new_users = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM users WHERE last_login >= %s", (start_date,))
            active_users = cursor.fetchone()[0]
            
            # Document statistics
            cursor.execute("SELECT COUNT(*) FROM user_documents")
            total_documents = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM user_documents WHERE created_at >= %s", (start_date,))
            new_documents = cursor.fetchone()[0]
            
            # Payment statistics
            cursor.execute("SELECT COUNT(*) FROM manual_payments")
            total_payments = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM manual_payments WHERE created_at >= %s", (start_date,))
            new_payments = cursor.fetchone()[0]
            
            cursor.execute("SELECT SUM(amount) FROM manual_payments WHERE status = 'completed' AND created_at >= %s", (start_date,))
            revenue_result = cursor.fetchone()[0]
            revenue = float(revenue_result) if revenue_result else 0.0
            
            # Document type breakdown
            cursor.execute("""
                SELECT document_type, COUNT(*) as count
                FROM user_documents 
                WHERE created_at >= %s
                GROUP BY document_type
            """, (start_date,))
            document_types = cursor.fetchall()
            
            # Payment status breakdown
            cursor.execute("""
                SELECT status, COUNT(*) as count
                FROM manual_payments 
                WHERE created_at >= %s
                GROUP BY status
            """, (start_date,))
            payment_statuses = cursor.fetchall()
            
            # Daily user registrations (last 30 days)
            cursor.execute("""
                SELECT DATE(created_at) as date, COUNT(*) as count
                FROM users 
                WHERE created_at >= %s
                GROUP BY DATE(created_at)
                ORDER BY date
            """, (start_date,))
            daily_registrations = cursor.fetchall()
            
            # Daily revenue (last 30 days)
            cursor.execute("""
                SELECT DATE(created_at) as date, SUM(amount) as revenue
                FROM manual_payments 
                WHERE status = 'completed' AND created_at >= %s
                GROUP BY DATE(created_at)
                ORDER BY date
            """, (start_date,))
            daily_revenue = cursor.fetchall()
            
            stats = {
                "period": period,
                "dateRange": {
                    "start": start_date.isoformat(),
                    "end": end_date.isoformat()
                },
                "users": {
                    "total": total_users,
                    "premium": premium_users,
                    "new": new_users,
                    "active": active_users,
                    "premiumPercentage": round((premium_users / total_users * 100) if total_users > 0 else 0, 2)
                },
                "documents": {
                    "total": total_documents,
                    "new": new_documents,
                    "types": {doc_type: count for doc_type, count in document_types}
                },
                "payments": {
                    "total": total_payments,
                    "new": new_payments,
                    "revenue": revenue,
                    "statuses": {status: count for status, count in payment_statuses}
                },
                "charts": {
                    "dailyRegistrations": [{"date": str(date), "count": count} for date, count in daily_registrations],
                    "dailyRevenue": [{"date": str(date), "revenue": float(revenue) if revenue else 0} for date, revenue in daily_revenue]
                }
            }
            
            return jsonify(stats), 200
            
        finally:
            if connection:
                connection.close()
                
    except Exception as e:
        logger.error(f"Get analytics stats error: {e}")
        return jsonify({"error": "Failed to get analytics stats"}), 500

@admin_bp.route('/analytics/export', methods=['GET'])
@admin_required
def export_analytics():
    """Export analytics data"""
    try:
        export_type = request.args.get('type', 'users')  # users, documents, payments
        format_type = request.args.get('format', 'csv')  # csv, json
        date_from = request.args.get('date_from', '')
        date_to = request.args.get('date_to', '')
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500
        
        try:
            cursor = connection.cursor()
            
            if export_type == 'users':
                query = """
                    SELECT user_id, email, first_name, last_name, is_premium, is_admin,
                           created_at, last_login, is_active
                    FROM users
                """
                if date_from:
                    query += " WHERE created_at >= %s"
                    params = [date_from]
                    if date_to:
                        query += " AND created_at <= %s"
                        params.append(date_to)
                else:
                    params = []
                
                cursor.execute(query, params)
                data = cursor.fetchall()
                
                if format_type == 'csv':
                    # Return CSV format
                    csv_data = "ID,Email,First Name,Last Name,Premium,Admin,Created At,Last Login,Active\n"
                    for row in data:
                        csv_data += f"{row[0]},{row[1]},{row[2]},{row[3]},{row[4]},{row[5]},{row[6]},{row[7]},{row[8]}\n"
                    
                    return jsonify({
                        "data": csv_data,
                        "format": "csv",
                        "filename": f"users_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
                    }), 200
                
            elif export_type == 'documents':
                query = """
                    SELECT ud.id, ud.document_type, ud.reference, ud.status, ud.download_count,
                           ud.created_at, u.email, u.first_name, u.last_name
                    FROM user_documents ud
                    JOIN users u ON ud.user_id = u.user_id
                """
                if date_from:
                    query += " WHERE ud.created_at >= %s"
                    params = [date_from]
                    if date_to:
                        query += " AND ud.created_at <= %s"
                        params.append(date_to)
                else:
                    params = []
                
                cursor.execute(query, params)
                data = cursor.fetchall()
                
                if format_type == 'csv':
                    csv_data = "ID,Document Type,Reference,Status,Download Count,Created At,User Email,User Name\n"
                    for row in data:
                        csv_data += f"{row[0]},{row[1]},{row[2]},{row[3]},{row[4]},{row[5]},{row[6]},{row[7]} {row[8]}\n"
                    
                    return jsonify({
                        "data": csv_data,
                        "format": "csv",
                        "filename": f"documents_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
                    }), 200
            
            elif export_type == 'payments':
                query = """
                    SELECT id, reference, amount, status, document_type, transaction_code,
                           created_at, updated_at, JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.personalEmail')) as user_email
                    FROM manual_payments
                """
                if date_from:
                    query += " WHERE created_at >= %s"
                    params = [date_from]
                    if date_to:
                        query += " AND created_at <= %s"
                        params.append(date_to)
                else:
                    params = []
                
                cursor.execute(query, params)
                data = cursor.fetchall()
                
                if format_type == 'csv':
                    csv_data = "ID,Reference,Amount,Status,Document Type,Transaction Code,Created At,Updated At,User Email\n"
                    for row in data:
                        csv_data += f"{row[0]},{row[1]},{row[2]},{row[3]},{row[4]},{row[5]},{row[6]},{row[7]},{row[8]}\n"
                    
                    return jsonify({
                        "data": csv_data,
                        "format": "csv",
                        "filename": f"payments_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
                    }), 200
            
            return jsonify({"error": "Invalid export type"}), 400
            
        finally:
            if connection:
                connection.close()
                
    except Exception as e:
        logger.error(f"Export analytics error: {e}")
        return jsonify({"error": "Failed to export analytics"}), 500
