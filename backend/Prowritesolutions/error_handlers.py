"""
Production Error Handlers
"""

from flask import jsonify, request
import logging
from logging_config import log_error

def register_error_handlers(app):
    """Register production error handlers"""
    
    @app.errorhandler(400)
    def bad_request(error):
        """Handle 400 Bad Request errors"""
        log_error(f"Bad Request: {error}", "ERROR_400")
        return jsonify({
            'error': 'Bad Request',
            'message': 'The request could not be understood by the server',
            'status_code': 400
        }), 400

    @app.errorhandler(401)
    def unauthorized(error):
        """Handle 401 Unauthorized errors"""
        log_error(f"Unauthorized: {error}", "ERROR_401")
        return jsonify({
            'error': 'Unauthorized',
            'message': 'Authentication required',
            'status_code': 401
        }), 401

    @app.errorhandler(403)
    def forbidden(error):
        """Handle 403 Forbidden errors"""
        log_error(f"Forbidden: {error}", "ERROR_403")
        return jsonify({
            'error': 'Forbidden',
            'message': 'Access denied',
            'status_code': 403
        }), 403

    @app.errorhandler(404)
    def not_found(error):
        """Handle 404 Not Found errors"""
        log_error(f"Not Found: {error}", "ERROR_404")
        return jsonify({
            'error': 'Not Found',
            'message': 'The requested resource was not found',
            'status_code': 404
        }), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        """Handle 405 Method Not Allowed errors"""
        log_error(f"Method Not Allowed: {error}", "ERROR_405")
        return jsonify({
            'error': 'Method Not Allowed',
            'message': 'The method is not allowed for this resource',
            'status_code': 405
        }), 405

    @app.errorhandler(429)
    def too_many_requests(error):
        """Handle 429 Too Many Requests errors"""
        log_error(f"Too Many Requests: {error}", "ERROR_429")
        return jsonify({
            'error': 'Too Many Requests',
            'message': 'Rate limit exceeded',
            'status_code': 429
        }), 429

    @app.errorhandler(500)
    def internal_server_error(error):
        """Handle 500 Internal Server Error"""
        log_error(f"Internal Server Error: {error}", "ERROR_500")
        return jsonify({
            'error': 'Internal Server Error',
            'message': 'An unexpected error occurred',
            'status_code': 500
        }), 500

    @app.errorhandler(502)
    def bad_gateway(error):
        """Handle 502 Bad Gateway errors"""
        log_error(f"Bad Gateway: {error}", "ERROR_502")
        return jsonify({
            'error': 'Bad Gateway',
            'message': 'The server received an invalid response',
            'status_code': 502
        }), 502

    @app.errorhandler(503)
    def service_unavailable(error):
        """Handle 503 Service Unavailable errors"""
        log_error(f"Service Unavailable: {error}", "ERROR_503")
        return jsonify({
            'error': 'Service Unavailable',
            'message': 'The service is temporarily unavailable',
            'status_code': 503
        }), 503

    @app.errorhandler(Exception)
    def handle_exception(error):
        """Handle all unhandled exceptions"""
        log_error(f"Unhandled Exception: {error}", "ERROR_UNHANDLED")
        return jsonify({
            'error': 'Internal Server Error',
            'message': 'An unexpected error occurred',
            'status_code': 500
        }), 500

    @app.before_request
    def log_request():
        """Log all incoming requests"""
        logging.getLogger('prowrite').info(f"Request: {request.method} {request.path} from {request.remote_addr}")

    @app.after_request
    def log_response(response):
        """Log all outgoing responses"""
        logging.getLogger('prowrite').info(f"Response: {response.status_code} for {request.method} {request.path}")
        return response

