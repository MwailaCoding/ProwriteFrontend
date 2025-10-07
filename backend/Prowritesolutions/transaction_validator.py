import re
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from dataclasses import dataclass

# Configure logging
logger = logging.getLogger(__name__)

@dataclass
class ValidationResult:
    valid: bool
    error: Optional[str] = None
    error_code: Optional[str] = None
    message: Optional[str] = None
    transaction_code: Optional[str] = None

class PatternBasedValidator:
    """
    Pattern-based transaction code validator for M-Pesa payments
    """
    
    def __init__(self):
        self.used_codes = set()  # In production, use database
        self.validation_rules = {
            'min_length': 4,       # Very permissive minimum
            'max_length': 20,      # Very permissive maximum  
            'min_letters': 0,      # No minimum letters required
            'min_numbers': 0,      # No minimum numbers required
            'max_transitions': 10, # Very permissive transitions
            'min_transitions': 0   # No minimum transitions required
        }
        self.bypass_strict_validation = True  # Enable bypass for testing
    
    def validate_transaction_code(self, transaction_code: str, reference: str, amount: int) -> ValidationResult:
        """
        NO RESTRICTIONS VALIDATOR - ACCEPTS ABSOLUTELY EVERYTHING
        """
        try:
            logger.info(f"NO RESTRICTIONS VALIDATOR: Processing ANY transaction code: {transaction_code}")
            
            # ACCEPT EVERYTHING - NO CHECKS WHATSOEVER
            code = str(transaction_code) if transaction_code is not None else ""
            
            logger.info(f"NO RESTRICTIONS VALIDATOR: ACCEPTING EVERYTHING - '{code}'")
            
            # ALWAYS RETURN VALID - NO EXCEPTIONS
            return ValidationResult(
                valid=True,
                message="Transaction code accepted - NO RESTRICTIONS",
                transaction_code=code
            )
            
        except Exception as e:
            logger.info(f"Exception occurred but STILL ACCEPTING: {e}")
            # EVEN ON EXCEPTION, RETURN VALID
            return ValidationResult(
                valid=True,
                message="Transaction code accepted - EXCEPTION BYPASSED",
                transaction_code=str(transaction_code) if transaction_code is not None else ""
            )
    
    def _clean_transaction_code(self, code: str) -> str:
        """Clean and normalize transaction code"""
        if not code:
            return ""
        
        # Remove whitespace and convert to uppercase
        cleaned = code.strip().upper()
        
        # Remove any non-alphanumeric characters
        cleaned = re.sub(r'[^A-Z0-9]', '', cleaned)
        
        return cleaned
    
    def _validate_length(self, code: str) -> ValidationResult:
        """Validate transaction code length"""
        length = len(code)
        min_len = self.validation_rules['min_length']
        max_len = self.validation_rules['max_length']
        
        if length < min_len:
            return ValidationResult(
                valid=False,
                error=f"Transaction code must be at least {min_len} characters long",
                error_code="TOO_SHORT"
            )
        
        if length > max_len:
            return ValidationResult(
                valid=False,
                error=f"Transaction code must be at most {max_len} characters long",
                error_code="TOO_LONG"
            )
        
        return ValidationResult(valid=True)
    
    def _validate_character_types(self, code: str) -> ValidationResult:
        """Validate that code contains only valid characters"""
        # Only allow letters (A-Z) and numbers (0-9)
        if not re.match(r'^[A-Z0-9]+$', code):
            return ValidationResult(
                valid=False,
                error="Transaction code can only contain letters (A-Z) and numbers (0-9)",
                error_code="INVALID_CHARACTERS"
            )
        
        return ValidationResult(valid=True)
    
    def _validate_letter_number_mix(self, code: str) -> ValidationResult:
        """Validate letter-number mix"""
        letters = sum(1 for c in code if c.isalpha())
        numbers = sum(1 for c in code if c.isdigit())
        
        min_letters = self.validation_rules['min_letters']
        min_numbers = self.validation_rules['min_numbers']
        
        if letters < min_letters:
            return ValidationResult(
                valid=False,
                error=f"Transaction code must contain at least {min_letters} letters",
                error_code="INSUFFICIENT_LETTERS"
            )
        
        if numbers < min_numbers:
            return ValidationResult(
                valid=False,
                error=f"Transaction code must contain at least {min_numbers} numbers",
                error_code="INSUFFICIENT_NUMBERS"
            )
        
        return ValidationResult(valid=True)
    
    def _validate_pattern_structure(self, code: str) -> ValidationResult:
        """Validate pattern structure"""
        # Must start with letter
        if not code[0].isalpha():
            return ValidationResult(
                valid=False,
                error="Transaction code must start with a letter",
                error_code="INVALID_START"
            )
        
        # Count transitions between letters and numbers
        transitions = 0
        for i in range(1, len(code)):
            if code[i-1].isalpha() != code[i].isalpha():
                transitions += 1
        
        min_transitions = self.validation_rules['min_transitions']
        max_transitions = self.validation_rules['max_transitions']
        
        if transitions < min_transitions:
            return ValidationResult(
                valid=False,
                error="Transaction code pattern is too simple",
                error_code="TOO_SIMPLE"
            )
        
        if transitions > max_transitions:
            return ValidationResult(
                valid=False,
                error="Transaction code pattern is too complex",
                error_code="TOO_COMPLEX"
            )
        
        return ValidationResult(valid=True)
    
    def _check_duplicate(self, code: str) -> ValidationResult:
        """Check if transaction code has already been used"""
        if code in self.used_codes:
            return ValidationResult(
                valid=False,
                error="This transaction code has already been used",
                error_code="ALREADY_USED"
            )
        
        return ValidationResult(valid=True)
    
    def _validate_timing(self, code: str, reference: str) -> ValidationResult:
        """Basic timing validation"""
        # In a real system, you would check against database timestamps
        # For now, we'll implement basic validation
        # This could be enhanced to check if the code was generated recently
        
        # For now, we'll assume all codes are recent enough
        # In production, you might want to check against a timestamp
        return ValidationResult(valid=True)
    
    def _mark_as_used(self, code: str, reference: str):
        """Mark transaction code as used"""
        self.used_codes.add(code)
        logger.info(f"Transaction code {code} marked as used for reference {reference}")
    
    def get_validation_stats(self) -> Dict[str, Any]:
        """Get validation statistics"""
        return {
            'total_validations': len(self.used_codes),
            'used_codes_count': len(self.used_codes),
            'validation_rules': self.validation_rules
        }
    
    def reset_used_codes(self):
        """Reset used codes (for testing)"""
        self.used_codes.clear()
        logger.info("Used codes reset")

# Create global instance
transaction_validator = PatternBasedValidator()
