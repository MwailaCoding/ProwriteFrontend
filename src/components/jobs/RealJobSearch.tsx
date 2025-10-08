import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Clock, 
  Star, 
  ExternalLink, 
  Building2, 
  Bookmark,
  CheckCircle,
  TrendingUp,
  Filter,
  X
} from 'lucide-react';
import { RealJobService, RealJob, JobPlatform } from '../../services/realJobService';

interface RealJobSearchProps {
  onJobSelect?: (job: RealJob) => void;
}

const RealJobSearch: React.FC<RealJobSearchProps> = ({ onJobSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [jobType, setJobType] = useState('');
  const [jobs, setJobs] = useState<RealJob[]>([]);
  const [trendingJobs, setTrendingJobs] = useState<RealJob[]>([]);
  const [platforms, setPlatforms] = useState<JobPlatform[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedJobs, setSavedJobs] = useState<RealJob[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<RealJob[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState<RealJob | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    loadInitialData();
    loadSavedJobs();
    loadAppliedJobs();
  }, []);

  const loadInitialData = async () => {
    try {
      const [trending, platformsData] = await Promise.all([
        RealJobService.getTrendingJobs(),
        RealJobService.getAvailablePlatforms()
      ]);
      setTrendingJobs(trending);
      setPlatforms(platformsData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadSavedJobs = () => {
    const saved = localStorage.getItem('savedJobs');
    if (saved) {
      setSavedJobs(JSON.parse(saved));
    }
  };

  const loadAppliedJobs = () => {
    const applied = localStorage.getItem('appliedJobs');
    if (applied) {
      setAppliedJobs(JSON.parse(applied));
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const results = await RealJobService.searchJobs(
        searchQuery,
        location,
        experienceLevel,
        jobType,
        50
      );
      setJobs(results);
    } catch (error) {
      console.error('Error searching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToJob = (job: RealJob) => {
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  const handleConfirmApply = () => {
    if (selectedJob) {
      // Add to applied jobs
      const newAppliedJobs = [...appliedJobs, selectedJob];
      setAppliedJobs(newAppliedJobs);
      localStorage.setItem('appliedJobs', JSON.stringify(newAppliedJobs));
      
      // Open application URL
      RealJobService.applyToJob(selectedJob);
      
      setShowApplyModal(false);
      setSelectedJob(null);
    }
  };

  const handleExternalApply = () => {
    if (selectedJob) {
      RealJobService.applyToJob(selectedJob);
      setShowApplyModal(false);
      setSelectedJob(null);
    }
  };

  const handleSaveJob = (job: RealJob) => {
    const isSaved = savedJobs.some(savedJob => savedJob.id === job.id);
    
    if (isSaved) {
      const newSavedJobs = savedJobs.filter(savedJob => savedJob.id !== job.id);
      setSavedJobs(newSavedJobs);
      localStorage.setItem('savedJobs', JSON.stringify(newSavedJobs));
    } else {
      const newSavedJobs = [...savedJobs, job];
      setSavedJobs(newSavedJobs);
      localStorage.setItem('savedJobs', JSON.stringify(newSavedJobs));
    }
  };

  const isJobSaved = (job: RealJob) => {
    return savedJobs.some(savedJob => savedJob.id === job.id);
  };

  const isJobApplied = (job: RealJob) => {
    return appliedJobs.some(appliedJob => appliedJob.id === job.id);
  };

  const handleVisitCompany = (job: RealJob) => {
    RealJobService.visitCompany(job);
  };

  const isValidJob = (job: RealJob): boolean => {
    return !!(job && job.id && job.title && job.company);
  };

  const renderJobCard = (job: RealJob) => {
    if (!isValidJob(job)) {
      return null;
    }
    const sourceInfo = RealJobService.getJobSourceInfo(job.source);
    const experienceBadge = RealJobService.getExperienceBadge(job.experience_level);
    const jobTypeBadge = RealJobService.getJobTypeBadge(job.job_type);
    const daysSincePosted = RealJobService.getDaysSincePosted(job.posted_date);
    const postingTimeBadge = RealJobService.getPostingTimeBadge(daysSincePosted);
    const salary = RealJobService.formatSalary(job.salary_range, job.currency);

    return (
      <div key={job.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-shadow">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-2">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer line-clamp-2 flex-1">
                {job.title}
              </h3>
              {isJobApplied(job) && (
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5" />
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                <span className="text-gray-700 font-medium text-sm sm:text-base truncate">{job.company}</span>
              </div>
              <button
                onClick={() => handleVisitCompany(job)}
                className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm flex items-center gap-1 self-start sm:self-center"
              >
                <ExternalLink className="w-3 h-3" />
                Visit
              </button>
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
              <span className="text-gray-600 text-sm sm:text-base truncate">{job.location}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 self-end sm:self-start">
            <button
              onClick={() => handleSaveJob(job)}
              className={`p-2 rounded-full transition-colors ${
                isJobSaved(job) 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Bookmark className={`w-4 h-4 sm:w-5 sm:h-5 ${isJobSaved(job) ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${experienceBadge.color}`}>
            {experienceBadge.text}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${jobTypeBadge.color}`}>
            {jobTypeBadge.text}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${postingTimeBadge.color}`}>
            {postingTimeBadge.text}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${sourceInfo.bgColor} ${sourceInfo.color} hidden sm:inline-flex`}>
            {sourceInfo.icon} {job.source}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-gray-600">
              AI Match: {job.ai_match_score}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-gray-600">
              Demand: {job.market_demand}%
            </span>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-700 text-xs sm:text-sm line-clamp-2">{job.description}</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <div className="text-sm font-medium text-gray-900">{salary}</div>
          <div className="flex flex-wrap items-center gap-2">
            {job.skills_required.slice(0, 2).map((skill, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                {skill}
              </span>
            ))}
            {job.skills_required.length > 2 && (
              <span className="text-xs text-gray-500">
                +{job.skills_required.length - 2} more
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => handleApplyToJob(job)}
            disabled={isJobApplied(job)}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors text-sm ${
              isJobApplied(job)
                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isJobApplied(job) ? 'Applied' : 'Apply Now'}
          </button>
          <button
            onClick={() => onJobSelect?.(job)}
            className="py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Details</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Real Job Search
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Search real jobs across LinkedIn, Indeed, Glassdoor, and ZipRecruiter with direct application links
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search jobs (e.g., Software Engineer, Data Scientist)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
            <button
              onClick={handleSearch}
              disabled={loading || !searchQuery.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="City, State, or Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Any Level</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Type
                </label>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Any Type</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Available Platforms */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Platforms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {platforms.map((platform) => (
            <div key={platform.name} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{platform.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  platform.api_available 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {platform.api_available ? 'Live' : 'Demo'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{platform.description}</p>
              <a
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
              >
                Visit Site
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Jobs */}
      {trendingJobs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Trending Jobs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {trendingJobs.slice(0, 6).filter(isValidJob).map(renderJobCard)}
        </div>
        </div>
      )}

      {/* Search Results */}
      {jobs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Search Results ({jobs.length} jobs)
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Saved: {savedJobs.length}</span>
              <span>Applied: {appliedJobs.length}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {jobs.filter(isValidJob).map(renderJobCard)}
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && jobs.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-600">
            Try adjusting your search terms or filters to find more opportunities.
          </p>
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Apply to Job</h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium text-gray-900">{selectedJob.title}</h4>
              <p className="text-gray-600">{selectedJob.company}</p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleConfirmApply}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply via {selectedJob.source}
              </button>
              <button
                onClick={handleExternalApply}
                className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Open in New Tab
              </button>
              <button
                onClick={() => setShowApplyModal(false)}
                className="w-full py-2 px-4 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealJobSearch;












