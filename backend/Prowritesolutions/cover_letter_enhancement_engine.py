"""
Advanced Cover Letter Enhancement Engine
Phase 2: ATS Optimization, Tone Customization, and Industry-Specific Features
"""

import re
import json
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import openai

@dataclass
class ATSAnalysis:
    keyword_score: float
    keyword_matches: List[str]
    readability_score: float
    structure_score: float
    overall_score: float
    suggestions: List[str]

@dataclass
class ToneProfile:
    name: str
    description: str
    characteristics: List[str]
    example_phrases: List[str]

class CoverLetterEnhancementEngine:
    def __init__(self):
        self.industry_keywords = self._load_industry_keywords()
        self.tone_profiles = self._load_tone_profiles()
        self.ats_common_keywords = self._load_ats_keywords()
        
    def _load_industry_keywords(self) -> Dict[str, List[str]]:
        """Load industry-specific keywords for optimization"""
        return {
            "technology": [
                "software development", "programming", "coding", "debugging", "testing",
                "agile", "scrum", "git", "version control", "api", "database", "cloud",
                "machine learning", "artificial intelligence", "data analysis", "automation"
            ],
            "marketing": [
                "digital marketing", "social media", "content creation", "seo", "sem",
                "email marketing", "campaign management", "analytics", "conversion",
                "brand management", "market research", "customer acquisition", "roi"
            ],
            "finance": [
                "financial analysis", "budgeting", "forecasting", "risk management",
                "investment", "portfolio management", "compliance", "audit", "tax",
                "accounting", "financial modeling", "excel", "quickbooks", "sap"
            ],
            "healthcare": [
                "patient care", "clinical", "medical", "healthcare", "nursing",
                "diagnosis", "treatment", "medication", "patient safety", "compliance",
                "electronic health records", "ehr", "hipaa", "medical terminology"
            ],
            "education": [
                "curriculum development", "lesson planning", "student assessment",
                "classroom management", "educational technology", "differentiated instruction",
                "student engagement", "academic support", "parent communication"
            ],
            "sales": [
                "sales", "business development", "client relationship", "negotiation",
                "prospecting", "closing", "sales pipeline", "crm", "salesforce",
                "account management", "territory management", "sales targets"
            ]
        }
    
    def _load_tone_profiles(self) -> Dict[str, ToneProfile]:
        """Load different tone profiles for customization"""
        return {
            "professional": ToneProfile(
                name="Professional",
                description="Formal, business-like tone suitable for corporate environments",
                characteristics=["formal", "respectful", "confident", "measured"],
                example_phrases=[
                    "I am writing to express my interest in",
                    "I believe my qualifications align well with",
                    "I am confident that my experience in",
                    "I would welcome the opportunity to discuss"
                ]
            ),
            "enthusiastic": ToneProfile(
                name="Enthusiastic",
                description="Energetic and passionate tone showing excitement for the role",
                characteristics=["energetic", "passionate", "excited", "motivated"],
                example_phrases=[
                    "I am thrilled to apply for",
                    "I am incredibly excited about the opportunity to",
                    "I am passionate about",
                    "I am eager to contribute my skills to"
                ]
            ),
            "confident": ToneProfile(
                name="Confident",
                description="Assured and self-assured tone highlighting capabilities",
                characteristics=["confident", "assured", "capable", "decisive"],
                example_phrases=[
                    "I am confident that my track record demonstrates",
                    "My proven ability to",
                    "I have successfully delivered",
                    "I am certain that my expertise in"
                ]
            )
        }
    
    def _load_ats_keywords(self) -> List[str]:
        """Load common ATS keywords across industries"""
        return [
            "leadership", "management", "project management", "team leadership",
            "communication", "interpersonal skills", "collaboration", "teamwork",
            "problem solving", "analytical skills", "critical thinking", "decision making",
            "organization", "planning", "coordination", "implementation",
            "research", "analysis", "evaluation", "assessment",
            "development", "design", "creation", "production",
            "maintenance", "support", "service", "assistance",
            "training", "mentoring", "coaching", "guidance",
            "monitoring", "tracking", "reporting", "documentation",
            "quality assurance", "testing", "validation", "verification",
            "compliance", "regulatory", "standards", "policies",
            "budget", "financial", "cost", "revenue", "profit",
            "customer", "client", "stakeholder", "user",
            "technology", "software", "hardware", "systems",
            "data", "information", "knowledge", "expertise"
        ]
    
    def analyze_ats_compatibility(self, cover_letter_content: str, job_description: str) -> ATSAnalysis:
        """Analyze cover letter for ATS compatibility"""
        # Extract keywords from job description
        job_keywords = self._extract_keywords_from_text(job_description.lower())
        
        # Extract keywords from cover letter
        cover_letter_keywords = self._extract_keywords_from_text(cover_letter_content.lower())
        
        # Calculate keyword matches
        keyword_matches = [kw for kw in job_keywords if kw in cover_letter_keywords]
        keyword_score = len(keyword_matches) / max(len(job_keywords), 1) * 100
        
        # Analyze readability
        readability_score = self._calculate_readability_score(cover_letter_content)
        
        # Analyze structure
        structure_score = self._calculate_structure_score(cover_letter_content)
        
        # Calculate overall score
        overall_score = (keyword_score * 0.4 + readability_score * 0.3 + structure_score * 0.3)
        
        # Generate suggestions
        suggestions = self._generate_ats_suggestions(keyword_matches, job_keywords, cover_letter_content)
        
        return ATSAnalysis(
            keyword_score=keyword_score,
            keyword_matches=keyword_matches,
            readability_score=readability_score,
            structure_score=structure_score,
            overall_score=overall_score,
            suggestions=suggestions
        )
    
    def _extract_keywords_from_text(self, text: str) -> List[str]:
        """Extract relevant keywords from text"""
        # Remove common words and punctuation
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can'}
        
        # Clean text and split into words
        words = re.findall(r'\b[a-zA-Z]+\b', text.lower())
        
        # Filter out stop words and short words
        keywords = [word for word in words if word not in stop_words and len(word) > 3]
        
        # Add common ATS keywords that appear
        ats_matches = [kw for kw in self.ats_common_keywords if kw in text.lower()]
        keywords.extend(ats_matches)
        
        return list(set(keywords))  # Remove duplicates
    
    def _calculate_readability_score(self, text: str) -> float:
        """Calculate readability score (0-100)"""
        sentences = re.split(r'[.!?]+', text)
        words = text.split()
        
        if len(sentences) == 0 or len(words) == 0:
            return 0
        
        avg_sentence_length = len(words) / len(sentences)
        
        # Ideal sentence length is 15-20 words
        if 15 <= avg_sentence_length <= 20:
            return 100
        elif avg_sentence_length < 10:
            return 60
        elif avg_sentence_length > 30:
            return 40
        else:
            return 80
    
    def _calculate_structure_score(self, text: str) -> float:
        """Calculate structure score based on formatting and organization"""
        score = 0
        
        # Check for proper paragraphs
        paragraphs = text.split('\n\n')
        if len(paragraphs) >= 3:
            score += 30
        
        # Check for proper length (300-500 words is ideal)
        word_count = len(text.split())
        if 300 <= word_count <= 500:
            score += 40
        elif 200 <= word_count <= 600:
            score += 20
        
        # Check for professional language
        professional_indicators = ['experience', 'skills', 'qualifications', 'opportunity', 'contribute', 'professional']
        professional_count = sum(1 for indicator in professional_indicators if indicator in text.lower())
        score += min(professional_count * 5, 30)
        
        return min(score, 100)
    
    def _generate_ats_suggestions(self, matches: List[str], job_keywords: List[str], content: str) -> List[str]:
        """Generate suggestions for ATS optimization"""
        suggestions = []
        
        # Keyword suggestions
        missing_keywords = [kw for kw in job_keywords[:10] if kw not in matches]
        if missing_keywords:
            suggestions.append(f"Consider incorporating these keywords: {', '.join(missing_keywords[:5])}")
        
        # Structure suggestions
        if len(content.split('\n\n')) < 3:
            suggestions.append("Add more paragraphs to improve structure and readability")
        
        # Length suggestions
        word_count = len(content.split())
        if word_count < 250:
            suggestions.append("Consider expanding your cover letter to provide more detail")
        elif word_count > 600:
            suggestions.append("Consider condensing your cover letter to keep it concise")
        
        return suggestions
    
    def enhance_cover_letter_tone(self, content: str, tone: str, industry: str = None) -> str:
        """Enhance cover letter with specific tone and industry focus"""
        if tone not in self.tone_profiles:
            tone = "professional"  # Default fallback
        
        tone_profile = self.tone_profiles[tone]
        
        # Enhance with AI
        prompt = f"""
        Enhance this cover letter to match the '{tone_profile.name}' tone profile.
        
        Tone characteristics: {', '.join(tone_profile.characteristics)}
        Example phrases: {', '.join(tone_profile.example_phrases)}
        
        Industry: {industry if industry else 'General'}
        
        Original content:
        {content}
        
        Please enhance the content to:
        1. Match the specified tone profile
        2. Incorporate industry-specific language if applicable
        3. Maintain professionalism and clarity
        4. Keep the same core message and structure
        5. Make it more engaging and compelling
        
        Return only the enhanced cover letter content.
        """
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a professional cover letter enhancement expert. Focus on tone, clarity, and impact."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            enhanced_content = response.choices[0].message.content.strip()
            return enhanced_content
            
        except Exception as e:
            print(f"Tone enhancement failed: {str(e)}")
            return content  # Return original if enhancement fails
    
    def get_available_tones(self) -> Dict[str, ToneProfile]:
        """Get available tone profiles"""
        return self.tone_profiles
    
    def get_available_industries(self) -> List[str]:
        """Get available industries for optimization"""
        return list(self.industry_keywords.keys())
