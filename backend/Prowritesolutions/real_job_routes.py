from flask import Blueprint, request, jsonify
from real_job_search_service import real_job_search_service_v2
import logging

logger = logging.getLogger(__name__)

# Create blueprint for real job search
real_job_bp = Blueprint('real_job', __name__, url_prefix='/api/real-jobs')

@real_job_bp.route('/search', methods=['GET'])
def search_real_jobs():
    """
    Search for real jobs across multiple platforms
    """
    try:
        # Get query parameters
        query = request.args.get('query', '')
        location = request.args.get('location', '')
        experience_level = request.args.get('experience_level', '')
        job_type = request.args.get('job_type', '')
        limit = int(request.args.get('limit', 50))
        
        if not query:
            return jsonify({
                'success': False,
                'message': 'Query parameter is required',
                'data': []
            }), 400
        
        # Search for jobs across platforms
        jobs = real_job_search_service_v2.search_jobs_across_platforms(
            query=query,
            location=location,
            experience_level=experience_level,
            job_type=job_type,
            limit=limit
        )
        
        return jsonify({
            'success': True,
            'message': f'Found {len(jobs)} jobs for "{query}"',
            'data': jobs
        })
        
    except Exception as e:
        logger.error(f"Error searching real jobs: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error searching jobs',
            'data': []
        }), 500

@real_job_bp.route('/platforms', methods=['GET'])
def get_available_platforms():
    """
    Get list of available job platforms
    """
    platforms = [
        {
            'name': 'LinkedIn',
            'url': 'https://linkedin.com/jobs',
            'description': 'Professional networking and job search platform',
            'api_available': bool(real_job_search_service_v2.linkedin_api_key)
        },
        {
            'name': 'Indeed',
            'url': 'https://indeed.com',
            'description': 'World\'s largest job search site',
            'api_available': bool(real_job_search_service_v2.indeed_api_key)
        },
        {
            'name': 'Glassdoor',
            'url': 'https://glassdoor.com',
            'description': 'Job search with company reviews and salary data',
            'api_available': bool(real_job_search_service_v2.glassdoor_api_key)
        },
        {
            'name': 'ZipRecruiter',
            'url': 'https://ziprecruiter.com',
            'description': 'AI-powered job matching platform',
            'api_available': bool(real_job_search_service_v2.ziprecruiter_api_key)
        }
    ]
    
    return jsonify({
        'success': True,
        'message': 'Available job platforms',
        'data': platforms
    })

@real_job_bp.route('/trending', methods=['GET'])
def get_trending_jobs():
    """
    Get trending job searches
    """
    trending_queries = [
        'Software Engineer',
        'Data Scientist',
        'Product Manager',
        'DevOps Engineer',
        'Frontend Developer',
        'Backend Developer',
        'Full Stack Developer',
        'Machine Learning Engineer',
        'Cloud Engineer',
        'UX Designer'
    ]
    
    trending_jobs = []
    for query in trending_queries[:5]:  # Get top 5 trending
        try:
            jobs = real_job_search_service_v2.search_jobs_across_platforms(
                query=query,
                limit=3
            )
            if jobs:
                trending_jobs.extend(jobs)
        except Exception as e:
            logger.error(f"Error getting trending jobs for {query}: {str(e)}")
            continue
    
    return jsonify({
        'success': True,
        'message': 'Trending job searches',
        'data': trending_jobs[:15]  # Return top 15 trending jobs
    })
