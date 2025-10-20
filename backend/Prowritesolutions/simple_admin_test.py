from flask import Blueprint, jsonify
import mysql.connector
import os
from datetime import datetime

simple_admin_bp = Blueprint('simple_admin', __name__, url_prefix='/api/simple-admin')

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

@simple_admin_bp.route('/test', methods=['GET'])
def test_connection():
    """Simple test endpoint without authentication"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Test basic connection
        cursor.execute("SELECT 1 as test")
        result = cursor.fetchone()
        
        # Check if users table exists
        cursor.execute("SHOW TABLES LIKE 'users'")
        users_table = cursor.fetchone()
        
        # Get basic user count
        user_count = 0
        if users_table:
            cursor.execute("SELECT COUNT(*) as count FROM users")
            user_count = cursor.fetchone()['count']
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'status': 'success',
            'message': 'Database connection successful',
            'database_connected': True,
            'users_table_exists': users_table is not None,
            'user_count': user_count
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'database_connected': False
        }), 500

@simple_admin_bp.route('/stats', methods=['GET'])
def get_simple_stats():
    """Get basic stats without authentication"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        stats = {}
        
        # Get user count
        try:
            cursor.execute("SELECT COUNT(*) as total FROM users")
            stats['total_users'] = cursor.fetchone()['total']
        except:
            stats['total_users'] = 0
        
        # Get premium user count
        try:
            cursor.execute("SELECT COUNT(*) as premium FROM users WHERE is_premium = 1")
            stats['premium_users'] = cursor.fetchone()['premium']
        except:
            stats['premium_users'] = 0
        
        # Get admin user count
        try:
            cursor.execute("SELECT COUNT(*) as admin FROM users WHERE is_admin = 1")
            stats['admin_users'] = cursor.fetchone()['admin']
        except:
            stats['admin_users'] = 0
        
        # Get document count
        try:
            cursor.execute("SELECT COUNT(*) as total FROM user_documents")
            stats['total_documents'] = cursor.fetchone()['total']
        except:
            stats['total_documents'] = 0
        
        # Get payment count
        try:
            cursor.execute("SELECT COUNT(*) as total FROM payments")
            stats['total_payments'] = cursor.fetchone()['total']
        except:
            stats['total_payments'] = 0
        
        # Get total revenue
        try:
            cursor.execute("SELECT COALESCE(SUM(amount), 0) as revenue FROM payments WHERE status = 'completed'")
            stats['total_revenue'] = float(cursor.fetchone()['revenue'])
        except:
            stats['total_revenue'] = 0.0
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'status': 'success',
            'stats': stats
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'stats': {
                'total_users': 0,
                'premium_users': 0,
                'admin_users': 0,
                'total_documents': 0,
                'total_payments': 0,
                'total_revenue': 0.0
            }
        }), 500

@simple_admin_bp.route('/users', methods=['GET'])
def test_users():
    """Test endpoint to verify admin users route is accessible"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Get basic user data
        cursor.execute("""
            SELECT user_id, first_name, last_name, email, is_premium, is_admin, created_at
            FROM users 
            WHERE deleted_at IS NULL
            ORDER BY created_at DESC
            LIMIT 10
        """)
        users = cursor.fetchall()
        
        # Get total count
        cursor.execute("SELECT COUNT(*) as total FROM users WHERE deleted_at IS NULL")
        total = cursor.fetchone()['total']
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'status': 'success',
            'message': 'Admin users endpoint working',
            'users': users,
            'pagination': {
                'total': total,
                'page': 1,
                'per_page': 10,
                'pages': (total + 9) // 10
            },
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Database error: {str(e)}',
            'timestamp': datetime.now().isoformat()
        }), 500
