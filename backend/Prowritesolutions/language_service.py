"""
Language Service for Multi-Language Resume Support
Handles language detection, translation, and localization
"""

import os
import json
import re
import openai
from typing import Dict, List, Any, Optional
from datetime import datetime

class LanguageService:
    def __init__(self):
        """Initialize the language service"""
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        if self.openai_api_key:
            openai.api_key = self.openai_api_key
        
        # Supported languages with their codes and names
        self.supported_languages = {
            'en': {'name': 'English', 'native': 'English'},
            'es': {'name': 'Spanish', 'native': 'Español'},
            'fr': {'name': 'French', 'native': 'Français'},
            'de': {'name': 'German', 'native': 'Deutsch'},
            'it': {'name': 'Italian', 'native': 'Italiano'},
            'pt': {'name': 'Portuguese', 'native': 'Português'},
            'ru': {'name': 'Russian', 'native': 'Русский'},
            'zh': {'name': 'Chinese', 'native': '中文'},
            'ja': {'name': 'Japanese', 'native': '日本語'},
            'ko': {'name': 'Korean', 'native': '한국어'},
            'ar': {'name': 'Arabic', 'native': 'العربية'},
            'hi': {'name': 'Hindi', 'native': 'हिन्दी'},
            'nl': {'name': 'Dutch', 'native': 'Nederlands'},
            'sv': {'name': 'Swedish', 'native': 'Svenska'},
            'no': {'name': 'Norwegian', 'native': 'Norsk'},
            'da': {'name': 'Danish', 'native': 'Dansk'},
            'fi': {'name': 'Finnish', 'native': 'Suomi'},
            'pl': {'name': 'Polish', 'native': 'Polski'},
            'tr': {'name': 'Turkish', 'native': 'Türkçe'},
            'he': {'name': 'Hebrew', 'native': 'עברית'}
        }
        
        # Common resume terms in different languages
        self.resume_terms = {
            'en': {
                'personal_info': 'Personal Information',
                'contact': 'Contact',
                'email': 'Email',
                'phone': 'Phone',
                'address': 'Address',
                'linkedin': 'LinkedIn',
                'website': 'Website',
                'summary': 'Professional Summary',
                'experience': 'Professional Experience',
                'education': 'Education',
                'skills': 'Skills',
                'languages': 'Languages',
                'certifications': 'Certifications',
                'projects': 'Projects',
                'achievements': 'Achievements',
                'references': 'References',
                'download': 'Download',
                'generate': 'Generate',
                'clear': 'Clear',
                'preview': 'Preview'
            },
            'es': {
                'personal_info': 'Información Personal',
                'contact': 'Contacto',
                'email': 'Correo Electrónico',
                'phone': 'Teléfono',
                'address': 'Dirección',
                'linkedin': 'LinkedIn',
                'website': 'Sitio Web',
                'summary': 'Resumen Profesional',
                'experience': 'Experiencia Profesional',
                'education': 'Educación',
                'skills': 'Habilidades',
                'languages': 'Idiomas',
                'certifications': 'Certificaciones',
                'projects': 'Proyectos',
                'achievements': 'Logros',
                'references': 'Referencias',
                'download': 'Descargar',
                'generate': 'Generar',
                'clear': 'Limpiar',
                'preview': 'Vista Previa'
            },
            'fr': {
                'personal_info': 'Informations Personnelles',
                'contact': 'Contact',
                'email': 'Email',
                'phone': 'Téléphone',
                'address': 'Adresse',
                'linkedin': 'LinkedIn',
                'website': 'Site Web',
                'summary': 'Résumé Professionnel',
                'experience': 'Expérience Professionnelle',
                'education': 'Formation',
                'skills': 'Compétences',
                'languages': 'Langues',
                'certifications': 'Certifications',
                'projects': 'Projets',
                'achievements': 'Réalisations',
                'references': 'Références',
                'download': 'Télécharger',
                'generate': 'Générer',
                'clear': 'Effacer',
                'preview': 'Aperçu'
            },
            'de': {
                'personal_info': 'Persönliche Informationen',
                'contact': 'Kontakt',
                'email': 'E-Mail',
                'phone': 'Telefon',
                'address': 'Adresse',
                'linkedin': 'LinkedIn',
                'website': 'Website',
                'summary': 'Berufliche Zusammenfassung',
                'experience': 'Berufserfahrung',
                'education': 'Ausbildung',
                'skills': 'Fähigkeiten',
                'languages': 'Sprachen',
                'certifications': 'Zertifizierungen',
                'projects': 'Projekte',
                'achievements': 'Erfolge',
                'references': 'Referenzen',
                'download': 'Herunterladen',
                'generate': 'Generieren',
                'clear': 'Löschen',
                'preview': 'Vorschau'
            }
        }

    def detect_language(self, text: str) -> Dict[str, Any]:
        """Detect the language of the input text"""
        try:
            if not self.openai_api_key:
                return self._mock_language_detection(text)
            
            # Use OpenAI for language detection
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a language detection expert. Analyze the given text and return the language code (ISO 639-1) and confidence score (0-1). Only respond with a JSON object containing 'language_code' and 'confidence'."
                    },
                    {
                        "role": "user",
                        "content": f"Detect the language of this text: {text[:500]}"
                    }
                ],
                max_tokens=50,
                temperature=0
            )
            
            result = json.loads(response.choices[0].message.content)
            language_code = result.get('language_code', 'en')
            confidence = result.get('confidence', 0.8)
            
            return {
                'success': True,
                'language_code': language_code,
                'language_name': self.supported_languages.get(language_code, {}).get('name', 'Unknown'),
                'confidence': confidence,
                'is_supported': language_code in self.supported_languages
            }
            
        except Exception as e:
            print(f"Error in language detection: {e}")
            return self._mock_language_detection(text)

    def translate_content(self, text: str, target_language: str, source_language: str = 'auto') -> Dict[str, Any]:
        """Translate content to target language"""
        try:
            if not self.openai_api_key:
                return self._mock_translation(text, target_language, source_language)
            
            # Validate target language
            if target_language not in self.supported_languages:
                return {
                    'success': False,
                    'error': f'Target language {target_language} is not supported'
                }
            
            # Use OpenAI for translation
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": f"You are a professional translator. Translate the given text to {self.supported_languages[target_language]['name']}. Maintain the professional tone and formatting. Only respond with the translated text."
                    },
                    {
                        "role": "user",
                        "content": f"Translate this text: {text}"
                    }
                ],
                max_tokens=1000,
                temperature=0.3
            )
            
            translated_text = response.choices[0].message.content.strip()
            
            return {
                'success': True,
                'original_text': text,
                'translated_text': translated_text,
                'source_language': source_language,
                'target_language': target_language,
                'target_language_name': self.supported_languages[target_language]['name']
            }
            
        except Exception as e:
            print(f"Error in translation: {e}")
            return self._mock_translation(text, target_language, source_language)

    def localize_resume_content(self, content: Dict[str, Any], target_language: str) -> Dict[str, Any]:
        """Localize resume content for a specific language"""
        try:
            if target_language not in self.supported_languages:
                return {
                    'success': False,
                    'error': f'Target language {target_language} is not supported'
                }
            
            localized_content = {}
            
            # Get localized terms
            terms = self.resume_terms.get(target_language, self.resume_terms['en'])
            
            # Localize section headers and labels
            for key, value in content.items():
                if isinstance(value, str):
                    # Translate text content
                    translation_result = self.translate_content(value, target_language)
                    if translation_result['success']:
                        localized_content[key] = translation_result['translated_text']
                    else:
                        localized_content[key] = value
                elif isinstance(value, list):
                    # Handle arrays (like experience, education, etc.)
                    localized_content[key] = []
                    for item in value:
                        if isinstance(item, dict):
                            localized_item = {}
                            for item_key, item_value in item.items():
                                if isinstance(item_value, str):
                                    translation_result = self.translate_content(item_value, target_language)
                                    if translation_result['success']:
                                        localized_item[item_key] = translation_result['translated_text']
                                    else:
                                        localized_item[item_key] = item_value
                                else:
                                    localized_item[item_key] = item_value
                            localized_content[key].append(localized_item)
                        else:
                            localized_content[key].append(item)
                else:
                    localized_content[key] = value
            
            return {
                'success': True,
                'original_content': content,
                'localized_content': localized_content,
                'target_language': target_language,
                'target_language_name': self.supported_languages[target_language]['name'],
                'localized_terms': terms
            }
            
        except Exception as e:
            print(f"Error in resume localization: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def get_language_suggestions(self, text: str) -> Dict[str, Any]:
        """Get language-specific suggestions for resume content"""
        try:
            # Detect language first
            detection_result = self.detect_language(text)
            
            if not detection_result['success']:
                return {
                    'success': False,
                    'error': 'Could not detect language'
                }
            
            language_code = detection_result['language_code']
            language_name = detection_result['language_name']
            
            # Get language-specific suggestions
            suggestions = self._get_language_specific_suggestions(language_code, text)
            
            return {
                'success': True,
                'detected_language': {
                    'code': language_code,
                    'name': language_name
                },
                'suggestions': suggestions,
                'is_supported': detection_result['is_supported']
            }
            
        except Exception as e:
            print(f"Error in language suggestions: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def _get_language_specific_suggestions(self, language_code: str, text: str) -> List[str]:
        """Get language-specific suggestions for resume content"""
        suggestions = []
        
        # Language-specific suggestions
        if language_code == 'en':
            suggestions.extend([
                "Use action verbs at the beginning of bullet points",
                "Include quantifiable achievements with numbers and percentages",
                "Keep bullet points concise and impactful",
                "Use industry-specific keywords",
                "Maintain consistent formatting throughout"
            ])
        elif language_code == 'es':
            suggestions.extend([
                "Usa verbos de acción al inicio de cada punto",
                "Incluye logros cuantificables con números y porcentajes",
                "Mantén los puntos concisos e impactantes",
                "Usa palabras clave específicas de la industria",
                "Mantén un formato consistente"
            ])
        elif language_code == 'fr':
            suggestions.extend([
                "Utilisez des verbes d'action au début de chaque point",
                "Incluez des réalisations quantifiables avec des chiffres",
                "Gardez les points concis et percutants",
                "Utilisez des mots-clés spécifiques à l'industrie",
                "Maintenez un formatage cohérent"
            ])
        elif language_code == 'de':
            suggestions.extend([
                "Verwenden Sie Aktionsverben am Anfang jedes Punktes",
                "Fügen Sie quantifizierbare Erfolge mit Zahlen hinzu",
                "Halten Sie die Punkte prägnant und wirkungsvoll",
                "Verwenden Sie branchenspezifische Schlüsselwörter",
                "Behalten Sie ein konsistentes Format bei"
            ])
        else:
            suggestions.extend([
                "Use professional language appropriate for your industry",
                "Include specific achievements and metrics",
                "Maintain clear and concise formatting",
                "Use relevant keywords for your field",
                "Ensure consistency in style and tone"
            ])
        
        return suggestions

    def _mock_language_detection(self, text: str) -> Dict[str, Any]:
        """Mock language detection for testing"""
        # Simple language detection based on common patterns
        text_lower = text.lower()
        
        # Check for common language patterns
        if re.search(r'[àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]', text):
            return {
                'success': True,
                'language_code': 'fr',
                'language_name': 'French',
                'confidence': 0.85,
                'is_supported': True
            }
        elif re.search(r'[ñáéíóúü]', text):
            return {
                'success': True,
                'language_code': 'es',
                'language_name': 'Spanish',
                'confidence': 0.80,
                'is_supported': True
            }
        elif re.search(r'[äöüß]', text):
            return {
                'success': True,
                'language_code': 'de',
                'language_name': 'German',
                'confidence': 0.85,
                'is_supported': True
            }
        else:
            return {
                'success': True,
                'language_code': 'en',
                'language_name': 'English',
                'confidence': 0.90,
                'is_supported': True
            }

    def _mock_translation(self, text: str, target_language: str, source_language: str) -> Dict[str, Any]:
        """Mock translation for testing"""
        # Simple mock translations
        mock_translations = {
            'es': {
                'Software Engineer': 'Ingeniero de Software',
                'Professional Experience': 'Experiencia Profesional',
                'Education': 'Educación',
                'Skills': 'Habilidades',
                'Summary': 'Resumen'
            },
            'fr': {
                'Software Engineer': 'Ingénieur Logiciel',
                'Professional Experience': 'Expérience Professionnelle',
                'Education': 'Formation',
                'Skills': 'Compétences',
                'Summary': 'Résumé'
            },
            'de': {
                'Software Engineer': 'Softwareentwickler',
                'Professional Experience': 'Berufserfahrung',
                'Education': 'Ausbildung',
                'Skills': 'Fähigkeiten',
                'Summary': 'Zusammenfassung'
            }
        }
        
        translations = mock_translations.get(target_language, {})
        translated_text = text
        
        for eng, translated in translations.items():
            translated_text = translated_text.replace(eng, translated)
        
        return {
            'success': True,
            'original_text': text,
            'translated_text': translated_text,
            'source_language': source_language,
            'target_language': target_language,
            'target_language_name': self.supported_languages.get(target_language, {}).get('name', 'Unknown')
        }

# Global instance for easy access
language_service = LanguageService()























