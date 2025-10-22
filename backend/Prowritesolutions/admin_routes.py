from flask import Blueprint, request, jsonify
from functools import wraps
import mysql.connector
from datetime import datetime, timedelta
import json
import os
from werkzeug.security import check_password_hash
import jwt

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'prowrite_db'),
    'port': int(os.getenv('DB_PORT', 3306))
}

def get_db_connection():
    return mysql.connector.connect(**DB_CONFIG)

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            
            data = jwt.decode(token, os.getenv('JWT_SECRET_KEY', 'your-secret-key'), algorithms=['HS256'])
            user_id = data['user_id']
            
            # Verify user is admin
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT is_admin FROM users WHERE user_id = %s", (user_id,))
            user = cursor.fetchone()
            cursor.close()
            conn.close()
            
            if not user or not user['is_admin']:
                return jsonify({'error': 'Admin access required'}), 403
                
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        except Exception as e:
            return jsonify({'error': 'Token verification failed'}), 401
            
        return f(*args, **kwargs)
    return decorated_function

@admin_bp.route('/login', methods=['POST'])
def admin_login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Check if user exists and is admin
        cursor.execute("""
            SELECT user_id, first_name, last_name, email, password_hash, is_admin 
            FROM users 
            WHERE email = %s AND is_admin = 1 AND deleted_at IS NULL
        """, (email,))
        
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not user:
            return jsonify({'error': 'Invalid credentials or not an admin'}), 401
        
        # Debug password hash
        print(f"Password hash for {email}: {user['password_hash'][:20]}...")
        print(f"Hash length: {len(user['password_hash'])}")
        
        # Check password with better error handling
        try:
            if not check_password_hash(user['password_hash'], password):
                return jsonify({'error': 'Invalid credentials'}), 401
        except Exception as e:
            print(f"Password hash error: {e}")
            # If hash format is invalid, try to update it
            try:
                from werkzeug.security import generate_password_hash
                new_hash = generate_password_hash(password)
                conn = get_db_connection()
                cursor = conn.cursor()
                cursor.execute("""
                    UPDATE users 
                    SET password_hash = %s 
                    WHERE user_id = %s
                """, (new_hash, user['user_id']))
                conn.commit()
                cursor.close()
                conn.close()
                print("Password hash updated successfully")
            except Exception as update_error:
                print(f"Failed to update password hash: {update_error}")
                return jsonify({'error': 'Invalid credentials'}), 401
        
        # Generate JWT token
        token_payload = {
            'user_id': user['user_id'],
            'email': user['email'],
            'is_admin': True,
            'exp': datetime.utcnow() + timedelta(days=7)
        }
        
        token = jwt.encode(token_payload, os.getenv('JWT_SECRET_KEY', 'your-secret-key'), algorithm='HS256')
        
        # Return user data and token
        user_data = {
            'user_id': user['user_id'],
            'first_name': user['first_name'],
            'last_name': user['last_name'],
            'email': user['email'],
            'is_admin': user['is_admin']
        }
        
        return jsonify({
            'user': user_data,
            'access_token': token
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/dashboard/stats', methods=['GET'])
@admin_required
def get_dashboard_stats():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Get total users
        cursor.execute("SELECT COUNT(*) as total FROM users WHERE deleted_at IS NULL")
        total_users = cursor.fetchone()['total']
        
        # Get active users (logged in last 30 days)
        thirty_days_ago = datetime.now() - timedelta(days=30)
        cursor.execute("SELECT COUNT(*) as active FROM users WHERE last_login > %s AND deleted_at IS NULL", (thirty_days_ago,))
        active_users = cursor.fetchone()['active']
        
        # Get premium users
        cursor.execute("SELECT COUNT(*) as premium FROM users WHERE is_premium = 1 AND deleted_at IS NULL")
        premium_users = cursor.fetchone()['premium']
        
        # Get total documents
        cursor.execute("SELECT COUNT(*) as total FROM user_documents WHERE status = 'active'")
        total_documents = cursor.fetchone()['total']
        
        # Get total revenue - check if amount column exists
        cursor.execute("DESCRIBE payments")
        payment_columns = [col[0] for col in cursor.fetchall()]
        
        if 'amount' in payment_columns:
            cursor.execute("SELECT COALESCE(SUM(amount), 0) as revenue FROM payments WHERE status = 'completed'")
        else:
            # If no amount column, set revenue to 0 for now
            cursor.execute("SELECT 0 as revenue")
        total_revenue = cursor.fetchone()['revenue']
        
        # Get recent activity
        cursor.execute("""
            SELECT 'user_registration' as type, 
                   CONCAT('New user registered: ', email) as message,
                   created_at as timestamp
            FROM users 
            WHERE created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
            AND deleted_at IS NULL
            ORDER BY created_at DESC
            LIMIT 5
        """)
        recent_activity = cursor.fetchall()
        
        # Calculate growth rates (simplified - you might want to store historical data)
        user_growth = 8.3  # This should be calculated from historical data
        document_growth = 15.2
        revenue_growth = 22.1
        monthly_growth = 12.5
        
        conversion_rate = (premium_users / total_users * 100) if total_users > 0 else 0
        avg_revenue_per_user = (total_revenue / total_users) if total_users > 0 else 0
        
        stats = {
            'total_users': total_users,
            'active_users': active_users,
            'premium_users': premium_users,
            'total_documents': total_documents,
            'total_revenue': float(total_revenue),
            'user_growth': user_growth,
            'document_growth': document_growth,
            'revenue_growth': revenue_growth,
            'monthly_growth': monthly_growth,
            'conversion_rate': round(conversion_rate, 1),
            'average_revenue_per_user': round(avg_revenue_per_user, 2)
        }
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'stats': stats,
            'recent_activity': recent_activity
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_users():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Get query parameters
        search = request.args.get('search', '')
        role = request.args.get('role', 'all')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        offset = (page - 1) * limit
        
        # Build query
        where_conditions = ["deleted_at IS NULL"]
        params = []
        
        if search:
            where_conditions.append("(first_name LIKE %s OR last_name LIKE %s OR email LIKE %s)")
            search_term = f"%{search}%"
            params.extend([search_term, search_term, search_term])
        
        if role == 'premium':
            where_conditions.append("is_premium = 1")
        elif role == 'admin':
            where_conditions.append("is_admin = 1")
        elif role == 'regular':
            where_conditions.append("is_premium = 0 AND is_admin = 0")
        
        where_clause = " AND ".join(where_conditions)
        
        # Get total count
        count_query = f"SELECT COUNT(*) as total FROM users WHERE {where_clause}"
        cursor.execute(count_query, params)
        total = cursor.fetchone()['total']
        
        # Get users
        query = f"""
            SELECT user_id, first_name, last_name, email, is_premium, is_admin, 
                   created_at, last_login, 'active' as status
            FROM users 
            WHERE {where_clause}
            ORDER BY created_at DESC
            LIMIT %s OFFSET %s
        """
        cursor.execute(query, params + [limit, offset])
        users = cursor.fetchall()
        
        # Format response
        for user in users:
            user['created_at'] = user['created_at'].isoformat() if user['created_at'] else None
            user['last_login'] = user['last_login'].isoformat() if user['last_login'] else None
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'users': users,
            'pagination': {
                'total': total,
                'page': page,
                'per_page': limit,
                'pages': (total + limit - 1) // limit
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    try:
        data = request.get_json()
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Build update query
        update_fields = []
        params = []
        
        if 'first_name' in data:
            update_fields.append("first_name = %s")
            params.append(data['first_name'])
        
        if 'last_name' in data:
            update_fields.append("last_name = %s")
            params.append(data['last_name'])
        
        if 'email' in data:
            update_fields.append("email = %s")
            params.append(data['email'])
        
        if 'is_premium' in data:
            update_fields.append("is_premium = %s")
            params.append(data['is_premium'])
        
        if 'is_admin' in data:
            update_fields.append("is_admin = %s")
            params.append(data['is_admin'])
        
        if not update_fields:
            return jsonify({'error': 'No fields to update'}), 400
        
        params.append(user_id)
        query = f"UPDATE users SET {', '.join(update_fields)} WHERE user_id = %s"
        
        cursor.execute(query, params)
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'message': 'User updated successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>/suspend', methods=['POST'])
@admin_required
def suspend_user(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Soft delete by setting deleted_at
        cursor.execute("UPDATE users SET deleted_at = NOW() WHERE user_id = %s", (user_id,))
        cursor.execute("INSERT INTO admin_activity_logs (admin_id, action, details) VALUES (%s, %s, %s)", 
                      (1, 'suspend_user', f'Suspended user {user_id}'))
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({'message': 'User suspended successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>/activate', methods=['POST'])
@admin_required
def activate_user(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Reactivate by setting deleted_at to NULL
        cursor.execute("UPDATE users SET deleted_at = NULL WHERE user_id = %s", (user_id,))
        cursor.execute("INSERT INTO admin_activity_logs (admin_id, action, details) VALUES (%s, %s, %s)", 
                      (1, 'activate_user', f'Activated user {user_id}'))
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({'message': 'User activated successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>/promote', methods=['POST'])
@admin_required
def promote_user(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("UPDATE users SET is_premium = 1 WHERE user_id = %s", (user_id,))
        cursor.execute("INSERT INTO admin_activity_logs (admin_id, action, details) VALUES (%s, %s, %s)", 
                      (1, 'promote_user', f'Promoted user {user_id} to premium'))
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({'message': 'User promoted to premium successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>/demote', methods=['POST'])
@admin_required
def demote_user(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("UPDATE users SET is_premium = 0 WHERE user_id = %s", (user_id,))
        cursor.execute("INSERT INTO admin_activity_logs (admin_id, action, details) VALUES (%s, %s, %s)", 
                      (1, 'demote_user', f'Demoted user {user_id} from premium'))
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({'message': 'User demoted from premium successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Soft delete
        cursor.execute("UPDATE users SET deleted_at = NOW() WHERE user_id = %s", (user_id,))
        cursor.execute("INSERT INTO admin_activity_logs (admin_id, action, details) VALUES (%s, %s, %s)", 
                      (1, 'delete_user', f'Deleted user {user_id}'))
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return jsonify({'message': 'User deleted successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/documents', methods=['GET'])
@admin_required
def get_documents():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        search = request.args.get('search', '')
        doc_type = request.args.get('type', 'all')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        offset = (page - 1) * limit
        
        where_conditions = ["status = 'active'"]
        params = []
        
        if search:
            where_conditions.append("(ud.file_path LIKE %s OR u.email LIKE %s)")
            search_term = f"%{search}%"
            params.extend([search_term, search_term])
        
        if doc_type != 'all':
            where_conditions.append("document_type = %s")
            params.append(doc_type)
        
        where_clause = " AND ".join(where_conditions)
        
        # Get total count
        count_query = f"""
            SELECT COUNT(*) as total 
            FROM user_documents ud 
            JOIN users u ON ud.user_id = u.user_id 
            WHERE {where_clause}
        """
        cursor.execute(count_query, params)
        total = cursor.fetchone()['total']
        
        # Get documents
        query = f"""
            SELECT ud.id, ud.user_id, u.email as user_email, ud.file_path as file_name, 
                   ud.document_type, ud.created_at, ud.download_count
            FROM user_documents ud 
            JOIN users u ON ud.user_id = u.user_id 
            WHERE {where_clause}
            ORDER BY ud.created_at DESC
            LIMIT %s OFFSET %s
        """
        cursor.execute(query, params + [limit, offset])
        documents = cursor.fetchall()
        
        # Format response
        for doc in documents:
            doc['created_at'] = doc['created_at'].isoformat() if doc['created_at'] else None
            # Extract filename from file_path
            if doc['file_name']:
                doc['file_name'] = doc['file_name'].split('/')[-1]
            else:
                doc['file_name'] = 'Unknown'
            doc['file_size'] = '0 MB'  # We don't have file size in the current schema
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'documents': documents,
            'pagination': {
                'total': total,
                'page': page,
                'per_page': limit,
                'pages': (total + limit - 1) // limit
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/payments', methods=['GET'])
@admin_required
def get_payments():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        search = request.args.get('search', '')
        status = request.args.get('status', 'all')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        offset = (page - 1) * limit
        
        where_conditions = []
        params = []
        
        if search:
            where_conditions.append("(p.reference LIKE %s OR u.email LIKE %s)")
            search_term = f"%{search}%"
            params.extend([search_term, search_term])
        
        if status != 'all':
            where_conditions.append("p.status = %s")
            params.append(status)
        
        where_clause = " AND ".join(where_conditions) if where_conditions else "1=1"
        
        # Get total count
        count_query = f"""
            SELECT COUNT(*) as total 
            FROM payments p 
            JOIN users u ON p.user_id = u.user_id 
            WHERE {where_clause}
        """
        cursor.execute(count_query, params)
        total = cursor.fetchone()['total']
        
        # Get payments
        query = f"""
            SELECT p.payment_id as id, p.user_id, u.email as user_email, 
                   COALESCE(p.amount, 0) as amount, p.status, 
                   p.payment_type as payment_method, p.mpesa_code as reference, 
                   p.created_at, p.completed_at as processed_at
            FROM payments p 
            JOIN users u ON p.user_id = u.user_id 
            WHERE {where_clause}
            ORDER BY p.created_at DESC
            LIMIT %s OFFSET %s
        """
        cursor.execute(query, params + [limit, offset])
        payments = cursor.fetchall()
        
        # Get total revenue
        cursor.execute("SELECT COALESCE(SUM(COALESCE(amount, 0)), 0) as revenue FROM payments WHERE status = 'completed'")
        total_revenue = cursor.fetchone()['revenue']
        
        # Get pending amount
        cursor.execute("SELECT COALESCE(SUM(COALESCE(amount, 0)), 0) as pending FROM payments WHERE status = 'pending'")
        pending_amount = cursor.fetchone()['pending']
        
        # Format response
        for payment in payments:
            payment['created_at'] = payment['created_at'].isoformat() if payment['created_at'] else None
            payment['processed_at'] = payment['processed_at'].isoformat() if payment['processed_at'] else None
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'payments': payments,
            'pagination': {
                'total': total,
                'page': page,
                'per_page': limit,
                'pages': (total + limit - 1) // limit
            },
            'total_revenue': float(total_revenue),
            'pending_amount': float(pending_amount)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/analytics', methods=['GET'])
@admin_required
def get_analytics():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Get all the stats we need
        cursor.execute("SELECT COUNT(*) as total FROM users WHERE deleted_at IS NULL")
        total_users = cursor.fetchone()['total']
        
        cursor.execute("SELECT COUNT(*) as active FROM users WHERE last_login > DATE_SUB(NOW(), INTERVAL 30 DAY) AND deleted_at IS NULL")
        active_users = cursor.fetchone()['active']
        
        cursor.execute("SELECT COUNT(*) as premium FROM users WHERE is_premium = 1 AND deleted_at IS NULL")
        premium_users = cursor.fetchone()['premium']
        
        cursor.execute("SELECT COUNT(*) as total FROM user_documents WHERE status = 'active'")
        total_documents = cursor.fetchone()['total']
        
        cursor.execute("SELECT COALESCE(SUM(COALESCE(amount, 0)), 0) as revenue FROM payments WHERE status = 'completed'")
        total_revenue = cursor.fetchone()['revenue']
        
        # Get total payments count
        cursor.execute("SELECT COUNT(*) as total FROM payments")
        total_payments = cursor.fetchone()['total']
        
        # Calculate rates
        conversion_rate = (premium_users / total_users * 100) if total_users > 0 else 0
        avg_revenue_per_user = (total_revenue / total_users) if total_users > 0 else 0
        
        analytics = {
            'users': {
                'total': total_users,
                'active': active_users,
                'premium': premium_users,
                'premiumPercentage': round(conversion_rate, 1)
            },
            'documents': {
                'total': total_documents,
                'types': {}
            },
            'payments': {
                'total': total_payments,
                'revenue': float(total_revenue),
                'statuses': {
                    'completed': 0,
                    'pending': 0,
                    'failed': 0
                }
            },
            'charts': {
                'dailyRegistrations': [],
                'dailyRevenue': []
            }
        }
        
        cursor.close()
        conn.close()
        
        return jsonify(analytics)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/analytics/stats', methods=['GET'])
@admin_required
def get_analytics_stats():
    try:
        period = request.args.get('period', '30d')
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Calculate date range based on period
        if period == '7d':
            days = 7
        elif period == '30d':
            days = 30
        elif period == '90d':
            days = 90
        else:
            days = 30
        
        # Get user stats
        cursor.execute("SELECT COUNT(*) as total FROM users WHERE deleted_at IS NULL")
        total_users = cursor.fetchone()['total']
        
        cursor.execute("""
            SELECT COUNT(*) as this_week 
            FROM users 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND deleted_at IS NULL
        """)
        users_this_week = cursor.fetchone()['this_week']
        
        cursor.execute("""
            SELECT COUNT(*) as previous_week 
            FROM users 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY) 
            AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY) AND deleted_at IS NULL
        """)
        users_previous_week = cursor.fetchone()['previous_week']
        
        user_growth = ((users_this_week - users_previous_week) / users_previous_week * 100) if users_previous_week > 0 else 0
        
        # Get document stats
        cursor.execute("SELECT COUNT(*) as total FROM user_documents WHERE status = 'active'")
        total_documents = cursor.fetchone()['total']
        
        cursor.execute("""
            SELECT COUNT(*) as this_week 
            FROM user_documents 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND status = 'active'
        """)
        docs_this_week = cursor.fetchone()['this_week']
        
        cursor.execute("""
            SELECT COUNT(*) as previous_week 
            FROM user_documents 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY) 
            AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY) AND status = 'active'
        """)
        docs_previous_week = cursor.fetchone()['previous_week']
        
        doc_growth = ((docs_this_week - docs_previous_week) / docs_previous_week * 100) if docs_previous_week > 0 else 0
        
        # Get payment stats
        cursor.execute("SELECT COALESCE(SUM(COALESCE(amount, 0)), 0) as total FROM payments WHERE status = 'completed'")
        total_revenue = cursor.fetchone()['total']
        
        cursor.execute("""
            SELECT COALESCE(SUM(COALESCE(amount, 0)), 0) as this_week 
            FROM payments 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND status = 'completed'
        """)
        revenue_this_week = cursor.fetchone()['this_week']
        
        cursor.execute("""
            SELECT COALESCE(SUM(COALESCE(amount, 0)), 0) as previous_week 
            FROM payments 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY) 
            AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY) AND status = 'completed'
        """)
        revenue_previous_week = cursor.fetchone()['previous_week']
        
        revenue_growth = ((revenue_this_week - revenue_previous_week) / revenue_previous_week * 100) if revenue_previous_week > 0 else 0
        
        # Calculate monthly growth
        cursor.execute("""
            SELECT COUNT(*) as this_month 
            FROM users 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND deleted_at IS NULL
        """)
        users_this_month = cursor.fetchone()['this_month']
        
        cursor.execute("""
            SELECT COUNT(*) as previous_month 
            FROM users 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 60 DAY) 
            AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY) AND deleted_at IS NULL
        """)
        users_previous_month = cursor.fetchone()['previous_month']
        
        monthly_growth = ((users_this_month - users_previous_month) / users_previous_month * 100) if users_previous_month > 0 else 0
        
        analytics = {
            'users': {
                'total': total_users,
                'growth': round(user_growth, 1),
                'this_week': users_this_week
            },
            'documents': {
                'total': total_documents,
                'growth': round(doc_growth, 1),
                'this_week': docs_this_week
            },
            'payments': {
                'total': float(total_revenue),
                'growth': round(revenue_growth, 1),
                'this_week': float(revenue_this_week)
            },
            'charts': {
                'monthly_growth': round(monthly_growth, 1),
                'growth_trend': round(monthly_growth, 1)
            }
        }
        
        cursor.close()
        conn.close()
        
        return jsonify(analytics)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/logs', methods=['GET'])
@admin_required
def get_system_logs():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        level = request.args.get('level', 'all')
        source = request.args.get('source', '')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        offset = (page - 1) * limit
        
        where_conditions = []
        params = []
        
        if level != 'all':
            where_conditions.append("level = %s")
            params.append(level)
        
        if source:
            where_conditions.append("module = %s")
            params.append(source)
        
        where_clause = " AND ".join(where_conditions) if where_conditions else "1=1"
        
        # Get total count
        count_query = f"SELECT COUNT(*) as total FROM system_logs WHERE {where_clause}"
        cursor.execute(count_query, params)
        total = cursor.fetchone()['total']
        
        # Get logs
        query = f"""
            SELECT id, level, message, module as source, user_id, created_at
            FROM system_logs 
            WHERE {where_clause}
            ORDER BY created_at DESC
            LIMIT %s OFFSET %s
        """
        cursor.execute(query, params + [limit, offset])
        logs = cursor.fetchall()
        
        # Format response
        for log in logs:
            log['created_at'] = log['created_at'].isoformat() if log['created_at'] else None
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'logs': logs,
            'pagination': {
                'total': total,
                'page': page,
                'per_page': limit,
                'pages': (total + limit - 1) // limit
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500# Admin Notifications Routes
@admin_bp.route('/notifications', methods=['GET'])
@admin_required
def get_admin_notifications():
    """Get all notifications for admin panel"""
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 50))
        status = request.args.get('status')
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Build query
        where_clause = "WHERE 1=1"
        params = []
        
        if status:
            where_clause += " AND status = %s"
            params.append(status)
        
        # Get total count
        count_query = f"SELECT COUNT(*) as total FROM notifications {where_clause}"
        cursor.execute(count_query, params)
        total = cursor.fetchone()['total']
        
        # Get notifications with pagination
        offset = (page - 1) * per_page
        query = f"""
            SELECT 
                id,
                title,
                message,
                type,
                status,
                created_at,
                updated_at,
                user_id
            FROM notifications 
            {where_clause}
            ORDER BY created_at DESC
            LIMIT %s OFFSET %s
        """
        params.extend([per_page, offset])
        cursor.execute(query, params)
        notifications = cursor.fetchall()
        
        # Format notifications
        formatted_notifications = []
        for notif in notifications:
            formatted_notifications.append({
                'id': notif['id'],
                'title': notif['title'],
                'message': notif['message'],
                'type': notif['type'],
                'is_read': notif['status'] == 'read',
                'created_at': notif['created_at'].isoformat() if notif['created_at'] else None,
                'user_id': notif['user_id']
            })
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'notifications': formatted_notifications,
            'pagination': {
                'total': total,
                'page': page,
                'per_page': per_page,
                'pages': (total + per_page - 1) // per_page
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/notifications/send', methods=['POST'])
@admin_required
def send_admin_notification():
    """Send a notification to users"""
    try:
        data = request.get_json()
        
        title = data.get('title')
        message = data.get('message')
        notification_type = data.get('type', 'info')
        target_users = data.get('target_users', 'all')
        
        if not title or not message:
            return jsonify({'error': 'Title and message are required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Create notification
        cursor.execute("""
            INSERT INTO notifications (title, message, type, status, created_at, updated_at)
            VALUES (%s, %s, %s, 'unread', NOW(), NOW())
        """, (title, message, notification_type))
        
        notification_id = cursor.lastrowid
        
        # If targeting specific users, you would add user_notifications entries here
        # For now, we'll create a system-wide notification
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Notification sent successfully',
            'notification_id': notification_id
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/notifications/<int:notification_id>/read', methods=['POST'])
@admin_required
def mark_notification_read(notification_id):
    """Mark a notification as read"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE notifications 
            SET status = 'read', updated_at = NOW()
            WHERE id = %s
        """, (notification_id,))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Notification marked as read'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/notifications/<int:notification_id>', methods=['DELETE'])
@admin_required
def delete_notification(notification_id):
    """Delete a notification"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM notifications WHERE id = %s", (notification_id,))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Notification deleted'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
