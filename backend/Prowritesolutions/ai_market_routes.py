from flask import Blueprint, request, jsonify
import json
import random
from datetime import datetime, timedelta

ai_market_bp = Blueprint('ai_market', __name__)

# Mock AI-generated market data
def generate_ai_market_data(region, industry=None):
    """Generate AI-powered market insights data"""
    
    skills = [
        'React.js', 'Python', 'Data Analysis', 'Machine Learning', 'DevOps',
        'UI/UX Design', 'Project Management', 'Digital Marketing', 'Sales',
        'Customer Service', 'Content Writing', 'Graphic Design', 'SEO',
        'Social Media Marketing', 'Business Analysis', 'Agile', 'Scrum',
        'AWS', 'Docker', 'Kubernetes', 'Node.js', 'TypeScript', 'Vue.js',
        'Angular', 'Java', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift',
        'Kotlin', 'Flutter', 'React Native', 'TensorFlow', 'PyTorch',
        'Pandas', 'NumPy', 'Scikit-learn', 'Tableau', 'Power BI'
    ]
    
    industries = [
        'technology', 'healthcare', 'finance', 'marketing', 'education',
        'consulting', 'retail', 'manufacturing', 'logistics', 'real_estate'
    ]
    
    if industry and industry != 'all':
        filtered_industries = [industry]
    else:
        filtered_industries = industries
    
    data = []
    for i, skill in enumerate(skills[:20]):  # Limit to 20 skills for performance
        selected_industry = random.choice(filtered_industries)
        
        # Generate realistic AI analysis
        demand_percentage = random.randint(60, 95)
        trend = random.choice(['up', 'down', 'stable'])
        sentiment = random.choice(['positive', 'negative', 'neutral'])
        growth_prediction = random.randint(10, 40)
        
        # Generate salary ranges based on skill type
        if 'AI' in skill or 'Machine Learning' in skill or 'Data' in skill:
            salary_range = f"${random.randint(80, 150)}k - ${random.randint(150, 250)}k"
        elif 'React' in skill or 'Node' in skill or 'Python' in skill:
            salary_range = f"${random.randint(60, 120)}k - ${random.randint(120, 180)}k"
        else:
            salary_range = f"${random.randint(40, 80)}k - ${random.randint(80, 140)}k"
        
        ai_analysis = {
            "market_sentiment": sentiment,
            "growth_prediction": growth_prediction,
            "salary_range": salary_range,
            "skill_evolution": f"{skill} is evolving rapidly with new frameworks and methodologies emerging. The demand is expected to grow by {growth_prediction}% in the next year.",
            "market_opportunities": [
                "Remote work opportunities increasing",
                "High demand in startup ecosystem",
                "Growing need in enterprise companies",
                "International market expansion"
            ],
            "risk_factors": [
                "Automation may impact entry-level positions",
                "Rapid technology changes require continuous learning",
                "Market saturation in some areas"
            ],
            "learning_path": [
                "Start with fundamentals and core concepts",
                "Practice with real-world projects",
                "Get industry-recognized certifications",
                "Build a strong portfolio and network"
            ],
            "certification_recommendations": [
                "AWS Certified Solutions Architect",
                "Google Cloud Professional",
                "Microsoft Azure Developer",
                "Industry-specific certifications"
            ]
        }
        
        data.append({
            "id": f"ai-{i+1}",
            "skill": skill,
            "industry": selected_industry,
            "demand_percentage": demand_percentage,
            "trend": trend,
            "region": region,
            "ai_analysis": ai_analysis,
            "timestamp": datetime.now().isoformat()
        })
    
    return data

def generate_ai_top_skills(region):
    """Generate AI-powered top skills data"""
    top_skills = [
        'React.js', 'Python', 'Data Analysis', 'Machine Learning', 'DevOps',
        'UI/UX Design', 'Project Management', 'Digital Marketing', 'Sales'
    ]
    
    data = []
    for i, skill in enumerate(top_skills):
        industry = random.choice(['technology', 'healthcare', 'finance', 'marketing'])
        demand_percentage = 85 - (i * 5)  # Decreasing demand for lower ranks
        
        ai_analysis = {
            "market_sentiment": "positive",
            "growth_prediction": random.randint(15, 30),
            "salary_range": f"${random.randint(60, 120)}k - ${random.randint(120, 200)}k",
            "skill_evolution": f"{skill} is experiencing high growth with increasing market adoption and demand across multiple industries.",
            "market_opportunities": [
                "High demand across multiple industries",
                "Remote work friendly",
                "Excellent career progression opportunities",
                "Strong community support"
            ],
            "risk_factors": [
                "Competitive market requires continuous upskilling",
                "Technology changes rapidly"
            ],
            "learning_path": [
                "Master fundamentals and core concepts",
                "Build practical projects and portfolio",
                "Network with professionals in the field",
                "Stay updated with latest trends and technologies"
            ],
            "certification_recommendations": [
                "Industry-recognized certifications",
                "Specialized training programs",
                "Advanced skill development courses"
            ]
        }
        
        data.append({
            "id": f"top-{i+1}",
            "skill": skill,
            "industry": industry,
            "demand_percentage": demand_percentage,
            "trend": "up",
            "region": region,
            "ai_analysis": ai_analysis,
            "timestamp": datetime.now().isoformat()
        })
    
    return data

def generate_ai_trending_skills(region):
    """Generate AI-powered trending skills data"""
    trending_skills = [
        'AI/ML', 'Blockchain', 'Cybersecurity', 'Cloud Computing', 'Data Science',
        'DevOps', 'React.js', 'Python', 'Kubernetes', 'Docker'
    ]
    
    data = []
    for i, skill in enumerate(trending_skills):
        industry = random.choice(['technology', 'finance', 'healthcare'])
        demand_percentage = random.randint(80, 95)
        
        ai_analysis = {
            "market_sentiment": "positive",
            "growth_prediction": random.randint(20, 50),
            "salary_range": f"${random.randint(80, 150)}k - ${random.randint(150, 250)}k",
            "skill_evolution": f"{skill} is rapidly evolving with high market demand and excellent future prospects.",
            "market_opportunities": [
                "Explosive growth in demand",
                "High salary potential",
                "Future-proof career path",
                "Global market opportunities"
            ],
            "risk_factors": [
                "Fast-changing technology landscape",
                "High learning curve and complexity"
            ],
            "learning_path": [
                "Start with fundamental concepts",
                "Hands-on practice and experimentation",
                "Advanced courses and specializations",
                "Real-world project implementation"
            ],
            "certification_recommendations": [
                "Advanced technical certifications",
                "Specialized training programs",
                "Industry workshops and conferences",
                "Expert-level skill development"
            ]
        }
        
        data.append({
            "id": f"trending-{i+1}",
            "skill": skill,
            "industry": industry,
            "demand_percentage": demand_percentage,
            "trend": "up",
            "region": region,
            "ai_analysis": ai_analysis,
            "timestamp": datetime.now().isoformat()
        })
    
    return data

def generate_industry_analysis(region):
    """Generate AI-powered industry analysis"""
    industries = [
        'Technology', 'Healthcare', 'Finance', 'Marketing', 'Education',
        'Consulting', 'Retail', 'Manufacturing'
    ]
    
    data = []
    for industry in industries:
        growth_rate = random.randint(10, 30)
        
        analysis = {
            "industry": industry,
            "growth_rate": growth_rate,
            "top_skills": [
                'Leadership', 'Communication', 'Problem Solving',
                'Technical Skills', 'Analytical Thinking', 'Innovation'
            ],
            "emerging_roles": [
                'AI Specialist', 'Data Scientist', 'DevOps Engineer',
                'Product Manager', 'UX Designer', 'Digital Transformation Lead'
            ],
            "market_trends": [
                'Digital transformation accelerating',
                'Remote work becoming standard',
                'AI integration increasing',
                'Sustainability focus growing'
            ],
            "salary_trends": f"Salaries increasing by {random.randint(5, 15)}-{random.randint(15, 25)}% annually",
            "ai_insights": f"The {industry} industry is experiencing significant digital transformation with high demand for technical and soft skills. Growth rate of {growth_rate}% indicates strong market potential."
        }
        
        data.append(analysis)
    
    return data

def generate_skill_predictions(region):
    """Generate AI-powered skill predictions"""
    skills = [
        'React.js', 'Python', 'Machine Learning', 'DevOps', 'Data Science',
        'Cybersecurity', 'Cloud Computing', 'Blockchain', 'AI/ML', 'Kubernetes'
    ]
    
    data = []
    for skill in skills:
        current_demand = random.randint(60, 90)
        predicted_6months = min(100, current_demand + random.randint(5, 20))
        predicted_1year = min(100, predicted_6months + random.randint(5, 15))
        confidence = random.randint(80, 95)
        
        prediction = {
            "skill": skill,
            "current_demand": current_demand,
            "predicted_demand_6months": predicted_6months,
            "predicted_demand_1year": predicted_1year,
            "confidence_level": confidence,
            "factors": [
                'Market adoption rate',
                'Technology evolution',
                'Industry demand patterns',
                'Geographic and economic factors'
            ]
        }
        
        data.append(prediction)
    
    return data

@ai_market_bp.route('/api/ai/market-data', methods=['GET'])
def get_ai_market_data():
    """Get AI-powered market data"""
    try:
        region = request.args.get('region', 'Nairobi')
        industry = request.args.get('industry', 'all')
        
        data = generate_ai_market_data(region, industry)
        
        return jsonify({
            'success': True,
            'data': data,
            'region': region,
            'industry': industry,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@ai_market_bp.route('/api/ai/top-skills', methods=['GET'])
def get_ai_top_skills():
    """Get AI-powered top skills"""
    try:
        region = request.args.get('region', 'Nairobi')
        
        data = generate_ai_top_skills(region)
        
        return jsonify({
            'success': True,
            'data': data,
            'region': region,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@ai_market_bp.route('/api/ai/trending-skills', methods=['GET'])
def get_ai_trending_skills():
    """Get AI-powered trending skills"""
    try:
        region = request.args.get('region', 'Nairobi')
        
        data = generate_ai_trending_skills(region)
        
        return jsonify({
            'success': True,
            'data': data,
            'region': region,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@ai_market_bp.route('/api/ai/industry-analysis', methods=['GET'])
def get_ai_industry_analysis():
    """Get AI-powered industry analysis"""
    try:
        region = request.args.get('region', 'Nairobi')
        
        data = generate_industry_analysis(region)
        
        return jsonify({
            'success': True,
            'data': data,
            'region': region,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@ai_market_bp.route('/api/ai/skill-predictions', methods=['GET'])
def get_ai_skill_predictions():
    """Get AI-powered skill predictions"""
    try:
        region = request.args.get('region', 'Nairobi')
        
        data = generate_skill_predictions(region)
        
        return jsonify({
            'success': True,
            'data': data,
            'region': region,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@ai_market_bp.route('/api/ai/analyze-skill', methods=['POST'])
def analyze_skill_with_ai():
    """Analyze a specific skill with AI"""
    try:
        data = request.get_json()
        skill = data.get('skill', '')
        region = data.get('region', 'Nairobi')
        
        if not skill:
            return jsonify({
                'success': False,
                'error': 'Skill parameter is required'
            }), 400
        
        # Generate AI analysis for the specific skill
        demand_percentage = random.randint(60, 95)
        trend = random.choice(['up', 'down', 'stable'])
        sentiment = random.choice(['positive', 'negative', 'neutral'])
        growth_prediction = random.randint(10, 40)
        
        ai_analysis = {
            "market_sentiment": sentiment,
            "growth_prediction": growth_prediction,
            "salary_range": f"${random.randint(50, 100)}k - ${random.randint(100, 180)}k",
            "skill_evolution": f"{skill} is experiencing significant market demand and is expected to grow by {growth_prediction}% in the next year.",
            "market_opportunities": [
                "High demand across multiple industries",
                "Remote work opportunities available",
                "Excellent career growth potential",
                "Strong community and learning resources"
            ],
            "risk_factors": [
                "Competitive market requires continuous learning",
                "Technology changes rapidly"
            ],
            "learning_path": [
                "Start with fundamentals and core concepts",
                "Practice with real-world projects",
                "Get industry-recognized certifications",
                "Build a strong portfolio and professional network"
            ],
            "certification_recommendations": [
                "Industry-specific certifications",
                "Advanced skill development programs",
                "Specialized training courses"
            ]
        }
        
        result = {
            "id": f"analysis-{datetime.now().timestamp()}",
            "skill": skill,
            "industry": "technology",
            "demand_percentage": demand_percentage,
            "trend": trend,
            "region": region,
            "ai_analysis": ai_analysis,
            "timestamp": datetime.now().isoformat()
        }
        
        return jsonify({
            'success': True,
            'data': result,
            'skill': skill,
            'region': region,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500




















