from flask import Blueprint, request, jsonify, send_file, abort
import logging
import os
from dotenv import load_dotenv
from fast_manual_payment_service import manual_payment_service
from transaction_validator import transaction_validator

# Load environment variables from .env file
load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

# Create Blueprint
manual_payment_bp = Blueprint('manual_payment', __name__, url_prefix='/api/payments/manual')

@manual_payment_bp.route('/initiate', methods=['POST'])
def initiate_manual_payment():
    """
    Initiate manual payment process
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['form_data', 'document_type', 'user_email']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Extract data
        form_data = data['form_data']
        document_type = data['document_type']
        user_email = data['user_email']
        phone_number = data.get('phone_number')
        
        # Validate document type
        valid_document_types = ['Francisca Resume', 'Prowrite Template Resume', 'Cover Letter']
        if document_type not in valid_document_types:
            return jsonify({
                'success': False,
                'error': f'Invalid document type. Must be one of: {valid_document_types}'
            }), 400
        
        # Initiate payment
        result = manual_payment_service.initiate_payment(
            form_data=form_data,
            document_type=document_type,
            user_email=user_email,
            phone_number=phone_number
        )
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 500
            
    except Exception as e:
        logger.error(f"Payment initiation error: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@manual_payment_bp.route('/validate', methods=['POST'])
def validate_transaction_code():
    """
    Validate transaction code for manual payment
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['transaction_code', 'reference']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Extract data
        transaction_code = data['transaction_code']
        reference = data['reference']
        
        # Validate transaction code
        result = manual_payment_service.validate_transaction_code(
            transaction_code=transaction_code,
            reference=reference
        )
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Transaction validation error: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@manual_payment_bp.route('/status/<reference>', methods=['GET'])
def get_payment_status(reference):
    """
    Get payment status for a reference
    """
    try:
        result = manual_payment_service.get_payment_status(reference)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 404
            
    except Exception as e:
        logger.error(f"Status check error: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@manual_payment_bp.route('/admin/confirm', methods=['POST'])
def admin_confirm_payment():
    """
    Admin confirmation of payment
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['reference', 'admin_user_id']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Extract data
        reference = data['reference']
        admin_user_id = data['admin_user_id']
        
        # Confirm payment
        result = manual_payment_service.admin_confirm_payment(
            reference=reference,
            admin_user_id=admin_user_id
        )
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Admin confirmation error: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@manual_payment_bp.route('/admin/reject', methods=['POST'])
def admin_reject_payment():
    """
    Admin rejection of payment
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['reference', 'admin_user_id', 'reason']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Extract data
        reference = data['reference']
        admin_user_id = data['admin_user_id']
        reason = data['reason']
        
        # Reject payment
        result = manual_payment_service.admin_reject_payment(
            reference=reference,
            admin_user_id=admin_user_id,
            reason=reason
        )
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Admin rejection error: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@manual_payment_bp.route('/admin/pending', methods=['GET'])
def get_pending_admin_confirmations():
    """
    Get all payments pending admin confirmation
    """
    try:
        pending_payments = manual_payment_service.get_pending_admin_confirmations()
        
        return jsonify({
            'success': True,
            'pending_payments': pending_payments,
            'count': len(pending_payments)
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting pending confirmations: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@manual_payment_bp.route('/admin/stats', methods=['GET'])
def get_admin_stats():
    """
    Get admin statistics
    """
    try:
        # Get validation stats
        validation_stats = transaction_validator.get_validation_stats()
        
        # Get pending confirmations count
        pending_payments = manual_payment_service.get_pending_admin_confirmations()
        
        return jsonify({
            'success': True,
            'stats': {
                'total_validations': validation_stats['total_validations'],
                'pending_admin_confirmations': len(pending_payments),
                'validation_rules': validation_stats['validation_rules']
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting admin stats: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@manual_payment_bp.route('/test-validation', methods=['POST'])
def test_transaction_validation():
    """
    Test transaction code validation (for development)
    """
    try:
        data = request.get_json()
        
        if 'transaction_code' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing transaction_code field'
            }), 400
        
        transaction_code = data['transaction_code']
        reference = data.get('reference', 'TEST-REF')
        amount = data.get('amount', 500)
        
        # Test validation
        result = transaction_validator.validate_transaction_code(
            transaction_code, reference, amount
        )
        
        return jsonify({
            'success': True,
            'validation_result': {
                'valid': result.valid,
                'error': result.error,
                'error_code': result.error_code,
                'message': result.message,
                'transaction_code': result.transaction_code
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Test validation error: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

@manual_payment_bp.route('/download/<reference>', methods=['GET'])
def download_pdf(reference):
    """
    Download PDF after payment verification
    """
    try:
        logger.info(f"📥 PDF download requested for reference: {reference}")
        
        # Get PDF path from payment service
        pdf_path = manual_payment_service.get_pdf_download_path(reference)
        
        logger.info(f"📥 PDF path retrieved: {pdf_path}")
        
        if not pdf_path:
            logger.error(f"❌ PDF not found for reference: {reference}")
            return jsonify({
                'success': False,
                'error': 'PDF not found or not ready for download'
            }), 404
        
        if not os.path.exists(pdf_path):
            logger.error(f"❌ PDF file does not exist: {pdf_path}")
            return jsonify({
                'success': False,
                'error': 'PDF file not found'
            }), 404
        
        # Get filename for download
        filename = os.path.basename(pdf_path)
        
        logger.info(f"✅ Serving PDF download: {filename} from {pdf_path}")
        
        # Send file for download
        return send_file(
            pdf_path,
            as_attachment=True,
            download_name=filename,
            mimetype='application/pdf'
        )
        
    except Exception as e:
        logger.error(f"❌ PDF download error: {e}")
        import traceback
        logger.error(f"❌ Traceback: {traceback.format_exc()}")
        return jsonify({
            'success': False,
            'error': 'Download failed'
        }), 500
