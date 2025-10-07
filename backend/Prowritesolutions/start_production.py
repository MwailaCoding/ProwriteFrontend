#!/usr/bin/env python3
"""
Production Startup Script for ProWrite Backend
"""

import os
import sys
from dotenv import load_dotenv

def main():
    """Start the production server"""
    
    # Load environment variables
    load_dotenv()
    
    # Check if running in production
    if os.getenv('FLASK_ENV') != 'production':
        print("⚠️  Warning: Not running in production mode")
        print("   Set FLASK_ENV=production in your .env file")
    
    # Check required environment variables
    required_vars = [
        'AI_API_KEY',
        'JWT_SECRET_KEY',
        'SECRET_KEY',
        'DB_HOST',
        'DB_USER',
        'DB_PASSWORD',
        'DB_NAME'
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print("❌ Missing required environment variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("   Please check your .env file")
        sys.exit(1)
    
    # Create necessary directories
    os.makedirs('logs', exist_ok=True)
    os.makedirs('uploads', exist_ok=True)
    os.makedirs('thumbnails', exist_ok=True)
    os.makedirs('static', exist_ok=True)
    
    # Import and start the app
    from app import create_app
    
    app = create_app()
    
    # Start the server
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=False,
        threaded=True
    )

if __name__ == '__main__':
    main()

