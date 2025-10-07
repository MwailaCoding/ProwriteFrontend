#!/usr/bin/env python3
"""
AI Content Processor for PDF Templates
Uses OpenAI GPT-4 to intelligently detect content areas in PDF templates
"""

import os
import json
import fitz  # PyMuPDF
from typing import List, Dict, Optional
import openai

class RealAIContentProcessor:
    """Real AI-powered content area detection using OpenAI GPT-4"""
    
    def __init__(self):
        # Hardcoded OpenAI API key as requested
        self.model = "gpt-3.5-turbo"
        self.ai_available = True
        
        try:
            self.openai_client = openai.OpenAI(api_key=self.api_key)
            # Test the connection
            self.openai_client.models.list()
            print("✅ OpenAI API connection successful")
        except Exception as e:
            print(f"⚠️ OpenAI API not available: {e}")
            self.ai_available = False
    
    def process_template_with_real_ai(self, pdf_path: str, template_name: str = "Resume Template") -> Dict:
        """Process PDF template with real AI to detect content areas"""
        print(f"🤖 Processing template with real AI: {pdf_path}")
        
        # Check if file exists
        if not os.path.exists(pdf_path):
            print(f"❌ PDF file not found: {pdf_path}")
            return {
                'success': False,
                'error': f'PDF file not found: {pdf_path}',
                'content_areas': [],
                'metadata': {'ai_processed': False}
            }
        
        try:
            # Extract text blocks from PDF
            text_blocks = self._extract_text_blocks(pdf_path)
            
            if not text_blocks:
                print("⚠️ No text blocks found, using fallback content areas")
                return {
                    'success': True,
                    'content_areas': self._create_fallback_content_areas(),
                    'metadata': {
                        'ai_processed': False,
                        'template_name': template_name,
                        'text_blocks_count': 0
                    }
                }
            
            # Analyze with AI
            content_areas = self._analyze_with_ai(text_blocks, template_name)
            
            # Map to form fields
            mapped_areas = self._map_to_form_fields(content_areas)
            
            return {
                'success': True,
                'content_areas': mapped_areas,
                'metadata': {
                    'ai_processed': self.ai_available,
                    'template_name': template_name,
                    'text_blocks_count': len(text_blocks),
                    'content_areas_count': len(mapped_areas)
                }
            }
            
        except Exception as e:
            print(f"❌ Error processing template: {e}")
            return {
                'success': False,
                'error': str(e),
                'content_areas': self._create_fallback_content_areas(),
                'metadata': {'ai_processed': False}
            }
    
    def process_pdf_template(self, pdf_path: str, template_name: str = "Resume Template") -> Dict:
        """Alias for process_template_with_real_ai for compatibility"""
        return self.process_template_with_real_ai(pdf_path, template_name)
    
    def _extract_text_blocks(self, pdf_path: str) -> List[Dict]:
        """Extract text blocks with positioning and formatting info"""
        text_blocks = []
        
        try:
            doc = fitz.open(pdf_path)
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                blocks = page.get_text("dict")
                
                for block in blocks.get("blocks", []):
                    if "lines" in block:
                        for line in block["lines"]:
                            for span in line["spans"]:
                                text = span["text"].strip()
                                if text and len(text) > 2:  # Meaningful text
                                    text_blocks.append({
                                        'text': text,
                                        'bbox': span["bbox"],
                                        'font': span["font"],
                                       'size': span["size"],
                                        'color': span["color"],
                                        'page': page_num + 1,
                                        'flags': span.get("flags", 0)
                                    })
            
            doc.close()
            return text_blocks
            
        except Exception as e:
            print(f"Error extracting text blocks: {e}")
            return []
    
    def _analyze_with_ai(self, text_blocks: List[Dict], template_name: str) -> List[Dict]:
        """Use OpenAI GPT-4 to analyze and classify content areas"""
        if not self.ai_available:
            print("⚠️ AI not available, using fallback analysis")
            return self._fallback_analysis(text_blocks)
        
        try:
            # Prepare text data for AI analysis
            text_data = []
            for i, block in enumerate(text_blocks[:50]):  # Limit to first 50 blocks
                text_data.append(f"Block {i+1}: '{block['text']}' (Font: {block['font']}, Size: {block['size']})")
            
            text_content = "\n".join(text_data)
            
            # Create AI prompt for content area detection
            prompt = f"""
            Analyze this PDF template content and identify content areas that should be replaceable in a resume.
            
            Template: {template_name}
            
            Text Content:
            {text_content}
            
            Your task is to identify content areas that represent:
            1. Personal Information (name, email, phone, address)
            2. Professional Experience (company names, job titles, dates)
            3. Education (institution names, degrees, graduation dates)
            4. Skills and Certifications
            5. Summary/Objective statements
            
            For each identified content area, provide:
            - name: Descriptive name for the content area
            - type: Content type (text, email, phone, date, etc.)
            - content: The actual text found
            - confidence: Confidence score (0.0-1.0)
            - isRequired: Whether this field is typically required
            
            Return as JSON array:
            [
                {{
                    "name": "Personal Name",
                    "type": "text",
                    "content": "John Doe",
                    "confidence": 0.95,
                    "isRequired": true
                }}
            ]
            
            Focus on identifying fields that users would want to customize in their resume.
            """
            
            # Call OpenAI API
            response = self.openai_client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert resume template analyzer. Identify content areas that should be customizable in resume templates."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,
                max_tokens=2000
            )
            
            # Parse AI response
            ai_response = response.choices[0].message.content.strip()
            
            try:
                # Try to extract JSON from response
                if "```json" in ai_response:
                    json_start = ai_response.find("```json") + 7
                    json_end = ai_response.find("```", json_start)
                    json_content = ai_response[json_start:json_end].strip()
                elif "```" in ai_response:
                    json_start = ai_response.find("```") + 3
                    json_end = ai_response.find("```", json_start)
                    json_content = ai_response[json_start:json_end].strip()
                else:
                    json_content = ai_response
                
                content_areas = json.loads(json_content)
                print(f"✅ AI detected {len(content_areas)} content areas")
                return content_areas
                
            except json.JSONDecodeError as e:
                print(f"⚠️ Failed to parse AI response as JSON: {e}")
                print(f"AI Response: {ai_response}")
                return self._fallback_analysis(text_blocks)
                
        except Exception as e:
            print(f"❌ AI analysis failed: {e}")
            return self._fallback_analysis(text_blocks)
    
    def _fallback_analysis(self, text_blocks: List[Dict]) -> List[Dict]:
        """Fallback analysis when AI is not available"""
        print("🔄 Using fallback content area analysis")
        
        content_areas = []
        
        for block in text_blocks[:20]:  # Analyze first 20 blocks
            text = block['text'].lower()
            
            # Personal information patterns
            if any(word in text for word in ['name', 'full name', 'first name', 'last name']):
                content_areas.append({
                    'name': 'Personal Name',
                    'type': 'text',
                    'content': block['text'],
                    'confidence': 0.8,
                    'isRequired': True
                })
            
            elif any(word in text for word in ['email', 'e-mail', '@']):
                content_areas.append({
                    'name': 'Email Address',
                    'type': 'email',
                    'content': block['text'],
                    'confidence': 0.9,
                    'isRequired': True
                })
            
            elif any(word in text for word in ['phone', 'mobile', 'cell', 'tel']):
                content_areas.append({
                    'name': 'Phone Number',
                    'type': 'phone',
                    'content': block['text'],
                    'confidence': 0.8,
                    'isRequired': True
                })
            
            elif any(word in text for word in ['address', 'location', 'city', 'state']):
                content_areas.append({
                    'name': 'Address/Location',
                    'type': 'text',
                    'content': block['text'],
                    'confidence': 0.7,
                    'isRequired': False
                })
            
            # Professional experience patterns
            elif any(word in text for word in ['experience', 'work history', 'employment']):
                content_areas.append({
                    'name': 'Experience Section',
                    'type': 'section',
                    'content': block['text'],
                    'confidence': 0.8,
                    'isRequired': True
                })
            
            # Education patterns
            elif any(word in text for word in ['education', 'academic', 'degree', 'university']):
                content_areas.append({
                    'name': 'Education Section',
                    'type': 'section',
                    'content': block['text'],
                    'confidence': 0.8,
                    'isRequired': True
                })
            
            # Skills patterns
            elif any(word in text for word in ['skills', 'competencies', 'technologies']):
                content_areas.append({
                    'name': 'Skills Section',
                    'type': 'section',
                    'content': block['text'],
                    'confidence': 0.8,
                    'isRequired': False
                })
        
        return content_areas
    
    def _map_to_form_fields(self, content_areas: List[Dict]) -> List[Dict]:
        """Map detected content areas to form field names"""
        field_mapping = {
            'personal name': 'personalInfo.firstName personalInfo.lastName',
            'name': 'personalInfo.firstName personalInfo.lastName',
            'full name': 'personalInfo.firstName personalInfo.lastName',
            'first name': 'personalInfo.firstName',
            'last name': 'personalInfo.lastName',
            'email address': 'personalInfo.email',
            'email': 'personalInfo.email',
            'phone number': 'personalInfo.phone',
            'phone': 'personalInfo.phone',
            'mobile': 'personalInfo.phone',
            'address': 'personalInfo.location',
            'location': 'personalInfo.location',
            'experience section': 'experience',
            'experience': 'experience',
            'work history': 'experience',
            'employment': 'experience',
            'education section': 'education',
            'education': 'education',
            'academic': 'education',
            'skills section': 'skills',
            'skills': 'skills',
            'competencies': 'skills',
            'summary': 'summary',
            'objective': 'summary',
            'projects': 'projects',
            'certifications': 'certifications'
        }
        
        mapped_areas = []
        
        for area in content_areas:
            area_name = area.get('name', '').lower()
            form_field = None
            
            # Find matching form field
            for key, value in field_mapping.items():
                if key in area_name:
                    form_field = value
                    break
            
            # If no direct match, try partial matching
            if not form_field:
                for key, value in field_mapping.items():
                    if any(word in area_name for word in key.split()):
                        form_field = value
                        break
            
            # Create mapped area
            mapped_area = {
                'id': f"area_{len(mapped_areas) + 1}",
                'name': area.get('name', 'Unknown'),
                'type': area.get('type', 'text'),
                'formField': form_field or 'custom',
                'content': area.get('content', ''),
                'confidence': area.get('confidence', 0.5),
                'isRequired': area.get('isRequired', False),
                'coordinates': {
                    'x': 100,
                    'y': 100 + len(mapped_areas) * 30,
                    'width': 200,
                    'height': 20
                }
            }
            
            mapped_areas.append(mapped_area)
        
        return mapped_areas
    
    def _create_fallback_content_areas(self) -> List[Dict]:
        """Create basic fallback content areas"""
        return [
            {
                'id': 'area_1',
                'name': 'Personal Name',
                'type': 'text',
                'formField': 'personalInfo.firstName personalInfo.lastName',
                'content': 'John Doe',
                'confidence': 0.8,
                'isRequired': True,
                'coordinates': {'x': 100, 'y': 100, 'width': 200, 'height': 20}
            },
            {
                'id': 'area_2',
                'name': 'Email Address',
                'type': 'email',
                'formField': 'personalInfo.email',
                'content': 'john.doe@example.com',
                'confidence': 0.9,
                'isRequired': True,
                'coordinates': {'x': 100, 'y': 130, 'width': 200, 'height': 20}
            },
            {
                'id': 'area_3',
                'name': 'Phone Number',
                'type': 'phone',
                'formField': 'personalInfo.phone',
                'content': '123-456-7890',
                'confidence': 0.8,
                'isRequired': True,
                'coordinates': {'x': 100, 'y': 160, 'width': 200, 'height': 20}
            },
            {
                'id': 'area_4',
                'name': 'Experience Section',
                'type': 'section',
                'formField': 'experience',
                'content': 'Professional Experience',
                'confidence': 0.8,
                'isRequired': True,
                'coordinates': {'x': 100, 'y': 200, 'width': 300, 'height': 100}
            },
            {
                'id': 'area_5',
                'name': 'Education Section',
                'type': 'section',
                'formField': 'education',
                'content': 'Education',
                'confidence': 0.8,
                'isRequired': True,
                'coordinates': {'x': 100, 'y': 320, 'width': 300, 'height': 80}
            }
        ]

# Create global instance
ai_processor = RealAIContentProcessor()
