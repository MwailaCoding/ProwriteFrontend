"""
Production Logging Configuration
"""

import logging
import os
from logging.handlers import RotatingFileHandler
from datetime import datetime

def setup_production_logging():
    """Setup production logging configuration"""
    
    # Create logs directory if it doesn't exist
    if not os.path.exists('logs'):
        os.makedirs('logs')
    
    # Configure root logger
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            # File handler with rotation
            RotatingFileHandler(
                'logs/app.log',
                maxBytes=10*1024*1024,  # 10MB
                backupCount=5
            ),
            # Console handler for errors only
            logging.StreamHandler()
        ]
    )
    
    # Set specific loggers
    logging.getLogger('werkzeug').setLevel(logging.WARNING)
    logging.getLogger('urllib3').setLevel(logging.WARNING)
    logging.getLogger('requests').setLevel(logging.WARNING)
    
    # Create application logger
    app_logger = logging.getLogger('prowrite')
    app_logger.setLevel(logging.INFO)
    
    return app_logger

def log_error(error, context=""):
    """Log errors with context"""
    logger = logging.getLogger('prowrite')
    logger.error(f"{context}: {error}")

def log_info(message, context=""):
    """Log info messages with context"""
    logger = logging.getLogger('prowrite')
    logger.info(f"{context}: {message}")

def log_warning(message, context=""):
    """Log warning messages with context"""
    logger = logging.getLogger('prowrite')
    logger.warning(f"{context}: {message}")

