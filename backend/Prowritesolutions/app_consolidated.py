"""
ProWrite Backend - Consolidated Flask Application
All backend functionality integrated into a single file for easy hosting
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import datetime, timedelta
import os
import jwt
import bcrypt
import mysql.connector
from functools import wraps
import logging
from logging.handlers import RotatingFileHandler
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'prowrite_db'),
    'charset': 'utf8mb4'
}

# Logging Configuration
def setup_logging():
    """Setup production logging configuration"""
    if not os.path.exists('logs'):
        os.makedirs('logs')
    
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            RotatingFileHandler(
                'logs/app.log',
                maxBytes=10*1024*1024,  # 10MB
                backupCount=5
            ),
            logging.StreamHandler()
        ]
    )
    
    logging.getLogger('werkzeug').setLevel(logging.WARNING)
    logging.getLogger('urllib3').setLevel(logging.WARNING)
    logging.getLogger('requests').setLevel(logging.WARNING)
    
    return logging.getLogger('prowrite')

# Initialize logger
logger = setup_logging()

# Authentication System
class AuthSystem:
    def __init__(self):
        self.secret_key = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-this-in-production')
        self.algorithm = 'HS256'
        self.token_expiry_hours = 24
        
    def get_db_connection(self):
        """Get database connection with error handling"""
        try:
            connection = mysql.connector.connect(**DB_CONFIG)
            return connection
        except mysql.connector.Error as e:
            logger.error(f"Database connection error: {e}")
            return None
    
    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    def verify_password(self, password: str, hashed: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    
    def create_user(self, email: str, password: str, first_name: str, last_name: str):
        """Create a new user in the database"""
        connection = self.get_db_connection()
        if not connection:
            return {"error": "Database connection failed"}, 500
            
        try:
            cursor = connection.cursor()
            
            # Check if user already exists
            cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
            if cursor.fetchone():
                return {"error": "User already exists"}, 400
            
            # Hash password
            hashed_password = self.hash_password(password)
            
            # Insert new user
            cursor.execute("""
                INSERT INTO users (email, password, first_name, last_name, created_at, updated_at)
                VALUES (%s, %s, %s, %s, NOW(), NOW())
            """, (email, hashed_password, first_name, last_name))
            
            user_id = cursor.lastrowid
            connection.commit()
            
            # Get user data
            cursor.execute("""
                SELECT id, email, first_name, last_name, is_premium, is_admin, created_at
                FROM users WHERE id = %s
            """, (user_id,))
            
            user_data = cursor.fetchone()
            user = {
                "id": user_data[0],
                "email": user_data[1],
                "firstName": user_data[2],
                "lastName": user_data[3],
                "isPremium": user_data[4],
                "is_admin": user_data[5],
                "createdAt": user_data[6].isoformat() if user_data[6] else None
            }
            
            return {"user": user, "message": "User created successfully"}, 201
            
        except mysql.connector.Error as e:
            logger.error(f"Database error: {e}")
            return {"error": "Database error occurred"}, 500
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return {"error": "An unexpected error occurred"}, 500
        finally:
            if connection:
                connection.close()
    
    def authenticate_user(self, email: str, password: str):
        """Authenticate user and return user data if valid"""
        connection = self.get_db_connection()
        if not connection:
            return {"error": "Database connection failed"}, 500
            
        try:
            cursor = connection.cursor()
            
            # Get user data
            cursor.execute("""
                SELECT id, email, password, first_name, last_name, is_premium, is_admin, created_at
                FROM users WHERE email = %s
            """, (email,))
            
            user_data = cursor.fetchone()
            if not user_data:
                return {"error": "Invalid credentials"}, 401
            
            # Verify password
            if not self.verify_password(password, user_data[2]):
                return {"error": "Invalid credentials"}, 401
            
            # Return user data
            user = {
                "id": user_data[0],
                "email": user_data[1],
                "firstName": user_data[3],
                "lastName": user_data[4],
                "isPremium": user_data[5],
                "is_admin": user_data[6],
                "createdAt": user_data[7].isoformat() if user_data[7] else None
            }
            
            return {"user": user}, 200
            
        except mysql.connector.Error as e:
            logger.error(f"Database error: {e}")
            return {"error": "Database error occurred"}, 500
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return {"error": "An unexpected error occurred"}, 500
        finally:
            if connection:
                connection.close()
    
    def create_access_token(self, user_data: dict) -> str:
        """Create JWT access token"""
        try:
            payload = {
                'user_id': user_data['id'],
                'email': user_data['email'],
                'is_admin': user_data.get('is_admin', 0),
                'exp': datetime.utcnow() + timedelta(hours=self.token_expiry_hours),
                'iat': datetime.utcnow(),
                'type': 'access'
            }
            
            token = jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
            return token
            
        except Exception as e:
            logger.error(f"Token creation error: {e}")
            raise e
    
    def verify_token(self, token: str) -> dict:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            return {"error": "Token expired"}
        except jwt.InvalidTokenError:
            return {"error": "Invalid token"}
        except Exception as e:
            logger.error(f"Token verification error: {e}")
            return {"error": "Token verification failed"}
    
    def get_user_by_id(self, user_id: int):
        """Get user data by ID"""
        connection = self.get_db_connection()
        if not connection:
            return None
            
        try:
            cursor = connection.cursor()
            cursor.execute("""
                SELECT id, email, first_name, last_name, is_premium, is_admin, created_at
                FROM users WHERE id = %s
            """, (user_id,))
            
            user_data = cursor.fetchone()
            if not user_data:
                return None
            
            user = {
                "id": user_data[0],
                "email": user_data[1],
                "firstName": user_data[2],
                "lastName": user_data[3],
                "isPremium": user_data[4],
                "is_admin": user_data[5],
                "createdAt": user_data[6].isoformat() if user_data[6] else None
            }
            
            return user
            
        except mysql.connector.Error as e:
            logger.error(f"Database error: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return None
        finally:
            if connection:
                connection.close()

# Initialize auth system
auth_system = AuthSystem()

# JWT decorator for protected routes
def jwt_required_custom(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                token = auth_header.split(' ')[1]
            except IndexError:
                return jsonify({"error": "Invalid token format"}), 401
        else:
            return jsonify({"error": "No token provided"}), 401
        
        if not token:
            return jsonify({"error": "No token provided"}), 401
        
        payload = auth_system.verify_token(token)
        if 'error' in payload:
            return jsonify({"error": payload['error']}), 401
        
        request.current_user = payload
        return f(*args, **kwargs)
    
    return decorated_function

# Error Handlers
def register_error_handlers(app):
    """Register production error handlers"""
    
    @app.errorhandler(400)
    def bad_request(error):
        logger.error(f"Bad Request: {error}")
        return jsonify({
            'error': 'Bad Request',
            'message': 'The request could not be understood by the server',
            'status_code': 400
        }), 400

    @app.errorhandler(401)
    def unauthorized(error):
        logger.error(f"Unauthorized: {error}")
        return jsonify({
            'error': 'Unauthorized',
            'message': 'Authentication required',
            'status_code': 401
        }), 401

    @app.errorhandler(403)
    def forbidden(error):
        logger.error(f"Forbidden: {error}")
        return jsonify({
            'error': 'Forbidden',
            'message': 'Access denied',
            'status_code': 403
        }), 403

    @app.errorhandler(404)
    def not_found(error):
        logger.error(f"Not Found: {error}")
        return jsonify({
            'error': 'Not Found',
            'message': 'The requested resource was not found',
            'status_code': 404
        }), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        logger.error(f"Method Not Allowed: {error}")
        return jsonify({
            'error': 'Method Not Allowed',
            'message': 'The method is not allowed for this resource',
            'status_code': 405
        }), 405

    @app.errorhandler(500)
    def internal_server_error(error):
        logger.error(f"Internal Server Error: {error}")
        return jsonify({
            'error': 'Internal Server Error',
            'message': 'An unexpected error occurred',
            'status_code': 500
        }), 500

    @app.errorhandler(Exception)
    def handle_exception(error):
        logger.error(f"Unhandled Exception: {error}")
        return jsonify({
            'error': 'Internal Server Error',
            'message': 'An unexpected error occurred',
            'status_code': 500
        }), 500

    @app.before_request
    def log_request():
        logger.info(f"Request: {request.method} {request.path} from {request.remote_addr}")

    @app.after_request
    def log_response(response):
        logger.info(f"Response: {response.status_code} for {request.method} {request.path}")
        return response

# Create Flask app
app = Flask(__name__)

# Enable CORS
CORS(app, origins=[
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
])

# JWT Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-this-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['JWT_ALGORITHM'] = 'HS256'
app.config['JWT_TOKEN_LOCATION'] = ['headers']
app.config['JWT_HEADER_NAME'] = 'Authorization'
app.config['JWT_HEADER_TYPE'] = 'Bearer'

# Initialize JWT
jwt = JWTManager(app)

# Register error handlers
register_error_handlers(app)

# Authentication Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'firstName', 'lastName']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"{field} is required"}), 400
        
        # Create user
        result, status_code = auth_system.create_user(
            email=data['email'],
            password=data['password'],
            first_name=data['firstName'],
            last_name=data['lastName']
        )
        
        if status_code != 201:
            return jsonify(result), status_code
        
        # Create access token
        access_token = auth_system.create_access_token(result['user'])
        
        return jsonify({
            "message": "User registered successfully",
            "access_token": access_token,
            "user": result['user']
        }), 201
        
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return jsonify({"error": "Registration failed"}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return jsonify({"error": "Email and password are required"}), 400
        
        # Authenticate user
        result, status_code = auth_system.authenticate_user(
            email=data['email'],
            password=data['password']
        )
        
        if status_code != 200:
            return jsonify(result), status_code
        
        # Create access token
        access_token = auth_system.create_access_token(result['user'])
        
        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "user": result['user']
        }), 200
        
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({"error": "Login failed"}), 500

@app.route('/api/auth/me', methods=['GET'])
@jwt_required_custom
def get_current_user():
    try:
        user_id = request.current_user['user_id']
        user = auth_system.get_user_by_id(user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify({"user": user}), 200
        
    except Exception as e:
        logger.error(f"Get user error: {e}")
        return jsonify({"error": "Failed to get user data"}), 500

@app.route('/api/auth/refresh', methods=['POST'])
@jwt_required_custom
def refresh_token():
    try:
        user_id = request.current_user['user_id']
        user = auth_system.get_user_by_id(user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Create new access token
        access_token = auth_system.create_access_token(user)
        
        return jsonify({
            "message": "Token refreshed successfully",
            "access_token": access_token
        }), 200
        
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        return jsonify({"error": "Token refresh failed"}), 500

@app.route('/api/auth/logout', methods=['POST'])
@jwt_required_custom
def logout():
    try:
        return jsonify({"message": "Logout successful"}), 200
    except Exception as e:
        logger.error(f"Logout error: {e}")
        return jsonify({"error": "Logout failed"}), 500

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "message": "ProWrite API is running",
        "version": "1.0.0"
    }), 200

# Root endpoint
@app.route('/', methods=['GET'])
def root():
    return jsonify({
        "message": "Welcome to ProWrite API",
        "version": "1.0.0",
        "endpoints": {
            "auth": {
                "register": "POST /api/auth/register",
                "login": "POST /api/auth/login",
                "me": "GET /api/auth/me",
                "refresh": "POST /api/auth/refresh",
                "logout": "POST /api/auth/logout"
            },
            "health": "GET /api/health"
        }
    }), 200

# Database setup endpoint
@app.route('/api/setup/database', methods=['POST'])
def setup_database():
    """Setup database and tables"""
    try:
        connection = mysql.connector.connect(
            host=DB_CONFIG['host'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password'],
            charset='utf8mb4'
        )
        cursor = connection.cursor()
        
        # Create database
        cursor.execute("CREATE DATABASE IF NOT EXISTS prowrite_db")
        logger.info("Database 'prowrite_db' created or already exists")
        
        # Use the database
        cursor.execute("USE prowrite_db")
        
        # Create users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                is_premium BOOLEAN DEFAULT FALSE,
                is_admin BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        """)
        logger.info("Users table created or already exists")
        
        # Create a test admin user if it doesn't exist
        cursor.execute("SELECT id FROM users WHERE email = %s", ('admin@prowrite.com',))
        if not cursor.fetchone():
            hashed_password = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            cursor.execute("""
                INSERT INTO users (email, password, first_name, last_name, is_admin)
                VALUES (%s, %s, %s, %s, %s)
            """, ('admin@prowrite.com', hashed_password, 'Admin', 'User', True))
            logger.info("Test admin user created (email: admin@prowrite.com, password: admin123)")
        
        connection.commit()
        connection.close()
        
        return jsonify({
            "message": "Database setup completed successfully!",
            "admin_user": {
                "email": "admin@prowrite.com",
                "password": "admin123"
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Database setup error: {e}")
        return jsonify({"error": "Database setup failed"}), 500

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=False,
        threaded=True
    )

