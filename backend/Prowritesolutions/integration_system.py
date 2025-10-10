"""
Integration System for Cover Letters
Phase 6: Third-party integrations, mobile APIs, and advanced security
"""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime, timedelta
import json
import requests
import hashlib
import hmac
import base64
import jwt
from cryptography.fernet import Fernet
import uuid

@dataclass
class IntegrationConfig:
    integration_id: str
    platform_name: str
    api_key: str
    api_secret: str
    base_url: str
    is_active: bool
    created_at: datetime
    last_sync: Optional[datetime]

@dataclass
class MobileDevice:
    device_id: str
    user_id: int
    device_type: str  # ios, android, web
    device_token: str
    push_enabled: bool
    last_active: datetime
    app_version: str

@dataclass
class SecurityAudit:
    audit_id: str
    user_id: int
    action: str
    resource: str
    ip_address: str
    user_agent: str
    timestamp: datetime
    success: bool
    risk_score: float

class IntegrationSystem:
    def __init__(self):
        self.integrations = {}
        self.mobile_devices = {}
        self.security_audits = {}
        self.encryption_key = Fernet.generate_key()
        self.cipher_suite = Fernet(self.encryption_key)
        
    def add_integration(self, platform_name: str, api_key: str, api_secret: str, base_url: str) -> IntegrationConfig:
        """Add a new third-party integration"""
        integration_id = str(uuid.uuid4())
        
        # Encrypt sensitive data
        encrypted_api_key = self.cipher_suite.encrypt(api_key.encode()).decode()
        encrypted_api_secret = self.cipher_suite.encrypt(api_secret.encode()).decode()
        
        integration = IntegrationConfig(
            integration_id=integration_id,
            platform_name=platform_name,
            api_key=encrypted_api_key,
            api_secret=encrypted_api_secret,
            base_url=base_url,
            is_active=True,
            created_at=datetime.now(),
            last_sync=None
        )
        
        self.integrations[integration_id] = integration
        return integration
    
    def get_integration(self, integration_id: str) -> Optional[IntegrationConfig]:
        """Get integration configuration"""
        return self.integrations.get(integration_id)
    
    def update_integration(self, integration_id: str, **kwargs) -> bool:
        """Update integration configuration"""
        if integration_id not in self.integrations:
            return False
        
        integration = self.integrations[integration_id]
        
        for key, value in kwargs.items():
            if hasattr(integration, key):
                if key in ['api_key', 'api_secret'] and value:
                    # Encrypt sensitive data
                    encrypted_value = self.cipher_suite.encrypt(value.encode()).decode()
                    setattr(integration, key, encrypted_value)
                else:
                    setattr(integration, key, value)
        
        return True
    
    def sync_with_linkedin(self, integration_id: str, cover_letter_data: Dict[str, Any]) -> Dict[str, Any]:
        """Sync cover letter with LinkedIn"""
        integration = self.get_integration(integration_id)
        if not integration or integration.platform_name != 'linkedin':
            return {"success": False, "error": "Invalid LinkedIn integration"}
        
        try:
            # Decrypt API credentials
            api_key = self.cipher_suite.decrypt(integration.api_key.encode()).decode()
            api_secret = self.cipher_suite.decrypt(integration.api_secret.encode()).decode()
            
            # LinkedIn API integration (simulated)
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                'cover_letter': cover_letter_data.get('content'),
                'job_title': cover_letter_data.get('job_title'),
                'company': cover_letter_data.get('company_name'),
                'timestamp': datetime.now().isoformat()
            }
            
            # Simulate API call
            response = {"status": "success", "message": "Cover letter synced to LinkedIn"}
            
            # Update last sync
            integration.last_sync = datetime.now()
            
            return {
                "success": True,
                "message": "Cover letter synced successfully",
                "platform": "LinkedIn",
                "sync_timestamp": integration.last_sync.isoformat()
            }
            
        except Exception as e:
            return {"success": False, "error": f"LinkedIn sync failed: {str(e)}"}
    
    def sync_with_indeed(self, integration_id: str, cover_letter_data: Dict[str, Any]) -> Dict[str, Any]:
        """Sync cover letter with Indeed"""
        integration = self.get_integration(integration_id)
        if not integration or integration.platform_name != 'indeed':
            return {"success": False, "error": "Invalid Indeed integration"}
        
        try:
            # Decrypt API credentials
            api_key = self.cipher_suite.decrypt(integration.api_key.encode()).decode()
            api_secret = self.cipher_suite.decrypt(integration.api_secret.encode()).decode()
            
            # Indeed API integration (simulated)
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                'cover_letter': cover_letter_data.get('content'),
                'job_id': cover_letter_data.get('job_id'),
                'application_id': cover_letter_data.get('application_id'),
                'timestamp': datetime.now().isoformat()
            }
            
            # Simulate API call
            response = {"status": "success", "message": "Cover letter synced to Indeed"}
            
            # Update last sync
            integration.last_sync = datetime.now()
            
            return {
                "success": True,
                "message": "Cover letter synced successfully",
                "platform": "Indeed",
                "sync_timestamp": integration.last_sync.isoformat()
            }
            
        except Exception as e:
            return {"success": False, "error": f"Indeed sync failed: {str(e)}"}
    
    def sync_with_glassdoor(self, integration_id: str, cover_letter_data: Dict[str, Any]) -> Dict[str, Any]:
        """Sync cover letter with Glassdoor"""
        integration = self.get_integration(integration_id)
        if not integration or integration.platform_name != 'glassdoor':
            return {"success": False, "error": "Invalid Glassdoor integration"}
        
        try:
            # Decrypt API credentials
            api_key = self.cipher_suite.decrypt(integration.api_key.encode()).decode()
            api_secret = self.cipher_suite.decrypt(integration.api_secret.encode()).decode()
            
            # Glassdoor API integration (simulated)
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                'cover_letter': cover_letter_data.get('content'),
                'company_id': cover_letter_data.get('company_id'),
                'position_id': cover_letter_data.get('position_id'),
                'timestamp': datetime.now().isoformat()
            }
            
            # Simulate API call
            response = {"status": "success", "message": "Cover letter synced to Glassdoor"}
            
            # Update last sync
            integration.last_sync = datetime.now()
            
            return {
                "success": True,
                "message": "Cover letter synced successfully",
                "platform": "Glassdoor",
                "sync_timestamp": integration.last_sync.isoformat()
            }
            
        except Exception as e:
            return {"success": False, "error": f"Glassdoor sync failed: {str(e)}"}
    
    def register_mobile_device(self, user_id: int, device_type: str, device_token: str, app_version: str) -> MobileDevice:
        """Register a mobile device for push notifications"""
        device_id = str(uuid.uuid4())
        
        device = MobileDevice(
            device_id=device_id,
            user_id=user_id,
            device_type=device_type,
            device_token=device_token,
            push_enabled=True,
            last_active=datetime.now(),
            app_version=app_version
        )
        
        self.mobile_devices[device_id] = device
        return device
    
    def update_device_status(self, device_id: str, **kwargs) -> bool:
        """Update mobile device status"""
        if device_id not in self.mobile_devices:
            return False
        
        device = self.mobile_devices[device_id]
        
        for key, value in kwargs.items():
            if hasattr(device, key):
                setattr(device, key, value)
        
        return True
    
    def send_push_notification(self, user_id: int, title: str, message: str, data: Dict[str, Any] = None) -> Dict[str, Any]:
        """Send push notification to user's devices"""
        user_devices = [d for d in self.mobile_devices.values() if d.user_id == user_id and d.push_enabled]
        
        if not user_devices:
            return {"success": False, "error": "No active devices found"}
        
        results = []
        for device in user_devices:
            try:
                # Simulate push notification (would use Firebase/APNS in production)
                notification_data = {
                    "title": title,
                    "message": message,
                    "data": data or {},
                    "device_id": device.device_id,
                    "timestamp": datetime.now().isoformat()
                }
                
                # Update device last active
                device.last_active = datetime.now()
                
                results.append({
                    "device_id": device.device_id,
                    "device_type": device.device_type,
                    "status": "sent",
                    "timestamp": device.last_active.isoformat()
                })
                
            except Exception as e:
                results.append({
                    "device_id": device.device_id,
                    "device_type": device.device_type,
                    "status": "failed",
                    "error": str(e)
                })
        
        return {
            "success": True,
            "total_devices": len(user_devices),
            "successful_sends": len([r for r in results if r["status"] == "sent"]),
            "failed_sends": len([r for r in results if r["status"] == "failed"]),
            "results": results
        }
    
    def log_security_audit(self, user_id: int, action: str, resource: str, ip_address: str, 
                          user_agent: str, success: bool, risk_score: float = 0.0) -> SecurityAudit:
        """Log security audit event"""
        audit_id = str(uuid.uuid4())
        
        audit = SecurityAudit(
            audit_id=audit_id,
            user_id=user_id,
            action=action,
            resource=resource,
            ip_address=ip_address,
            user_agent=user_agent,
            timestamp=datetime.now(),
            success=success,
            risk_score=risk_score
        )
        
        self.security_audits[audit_id] = audit
        return audit
    
    def get_security_audits(self, user_id: Optional[int] = None, start_date: Optional[datetime] = None, 
                           end_date: Optional[datetime] = None) -> List[SecurityAudit]:
        """Get security audit logs"""
        audits = list(self.security_audits.values())
        
        if user_id:
            audits = [a for a in audits if a.user_id == user_id]
        
        if start_date:
            audits = [a for a in audits if a.timestamp >= start_date]
        
        if end_date:
            audits = [a for a in audits if a.timestamp <= end_date]
        
        return sorted(audits, key=lambda x: x.timestamp, reverse=True)
    
    def calculate_risk_score(self, user_id: int, action: str, ip_address: str) -> float:
        """Calculate risk score for security event"""
        # Get recent audits for user
        recent_audits = self.get_security_audits(user_id)
        recent_audits = [a for a in recent_audits if a.timestamp > datetime.now() - timedelta(hours=1)]
        
        # Base risk score
        risk_score = 0.0
        
        # Failed attempts increase risk
        failed_attempts = len([a for a in recent_audits if not a.success])
        risk_score += failed_attempts * 0.2
        
        # Multiple IP addresses increase risk
        unique_ips = len(set(a.ip_address for a in recent_audits))
        if unique_ips > 2:
            risk_score += 0.3
        
        # Suspicious actions increase risk
        suspicious_actions = ['delete', 'export', 'admin', 'login_failure']
        if any(action.lower() in a.action.lower() for a in recent_audits for action in suspicious_actions):
            risk_score += 0.4
        
        # High frequency of actions increases risk
        if len(recent_audits) > 10:
            risk_score += 0.2
        
        return min(risk_score, 1.0)
    
    def generate_integration_report(self, user_id: int) -> Dict[str, Any]:
        """Generate integration activity report"""
        user_integrations = [i for i in self.integrations.values() if i.is_active]
        user_devices = [d for d in self.mobile_devices.values() if d.user_id == user_id]
        user_audits = self.get_security_audits(user_id)
        
        # Integration statistics
        total_integrations = len(user_integrations)
        active_integrations = len([i for i in user_integrations if i.last_sync])
        last_sync = max([i.last_sync for i in user_integrations if i.last_sync], default=None)
        
        # Device statistics
        total_devices = len(user_devices)
        active_devices = len([d for d in user_devices if d.last_active > datetime.now() - timedelta(days=7)])
        device_types = list(set(d.device_type for d in user_devices))
        
        # Security statistics
        total_audits = len(user_audits)
        failed_attempts = len([a for a in user_audits if not a.success])
        avg_risk_score = sum(a.risk_score for a in user_audits) / len(user_audits) if user_audits else 0
        
        return {
            "user_id": user_id,
            "generated_at": datetime.now().isoformat(),
            "integrations": {
                "total": total_integrations,
                "active": active_integrations,
                "last_sync": last_sync.isoformat() if last_sync else None,
                "platforms": [i.platform_name for i in user_integrations]
            },
            "mobile_devices": {
                "total": total_devices,
                "active": active_devices,
                "device_types": device_types,
                "push_enabled": len([d for d in user_devices if d.push_enabled])
            },
            "security": {
                "total_audits": total_audits,
                "failed_attempts": failed_attempts,
                "average_risk_score": round(avg_risk_score, 3),
                "recent_activity": len([a for a in user_audits if a.timestamp > datetime.now() - timedelta(hours=24)])
            }
        }
    
    def export_data_for_platform(self, platform_name: str, user_id: int, data_type: str) -> Dict[str, Any]:
        """Export data in platform-specific format"""
        if platform_name == "linkedin":
            return self._export_for_linkedin(user_id, data_type)
        elif platform_name == "indeed":
            return self._export_for_indeed(user_id, data_type)
        elif platform_name == "glassdoor":
            return self._export_for_glassdoor(user_id, data_type)
        else:
            return {"success": False, "error": f"Unsupported platform: {platform_name}"}
    
    def _export_for_linkedin(self, user_id: int, data_type: str) -> Dict[str, Any]:
        """Export data in LinkedIn format"""
        return {
            "success": True,
            "platform": "LinkedIn",
            "format": "linkedin_api_v2",
            "data_type": data_type,
            "export_timestamp": datetime.now().isoformat(),
            "data": {
                "cover_letters": [],  # Would contain actual cover letter data
                "profile_data": {},
                "application_history": []
            }
        }
    
    def _export_for_indeed(self, user_id: int, data_type: str) -> Dict[str, Any]:
        """Export data in Indeed format"""
        return {
            "success": True,
            "platform": "Indeed",
            "format": "indeed_api_v1",
            "data_type": data_type,
            "export_timestamp": datetime.now().isoformat(),
            "data": {
                "cover_letters": [],
                "job_applications": [],
                "resume_data": {}
            }
        }
    
    def _export_for_glassdoor(self, user_id: int, data_type: str) -> Dict[str, Any]:
        """Export data in Glassdoor format"""
        return {
            "success": True,
            "platform": "Glassdoor",
            "format": "glassdoor_api_v1",
            "data_type": data_type,
            "export_timestamp": datetime.now().isoformat(),
            "data": {
                "cover_letters": [],
                "company_reviews": [],
                "salary_data": {}
            }
        }



















