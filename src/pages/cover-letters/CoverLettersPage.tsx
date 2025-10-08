import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  FileText,
  Edit,
  Download,
  Copy,
  Trash2,
  Calendar,
  Building,
  Briefcase,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Star,
  Clock,
  Sparkles,
  ArrowRight,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  Zap
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useApi, useApiMutation } from '../../hooks/useApi';
import { coverLetterService } from '../../services/coverLetterService';
import { CoverLetter } from '../../types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 20
    }
  },
  hover: {
    y: -8,
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  }
};

export const CoverLettersPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'company'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const { data: coverLetters, loading, execute: refetchCoverLetters } = useApi<CoverLetter[]>(
    () => coverLetterService.getCoverLetters()
  );

  // Check for success message from navigation state
  React.useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the state to prevent showing the message again
      navigate(location.pathname, { replace: true });
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    }
  }, [location.state, navigate, location.pathname]);


  const filteredCoverLetters = React.useMemo(() => {
    if (!Array.isArray(coverLetters)) return [];
    
    let filtered = coverLetters.filter(letter =>
      letter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      letter.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      letter.position?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'company':
          aValue = (a.company || '').toLowerCase();
          bValue = (b.company || '').toLowerCase();
          break;
        case 'date':
        default:
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [coverLetters, searchTerm, sortBy, sortOrder]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Success Message */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <svg className="h-5 w-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-emerald-800">{successMessage}</p>
                  </div>
                  <div className="ml-auto">
                    <button
                      onClick={() => setSuccessMessage(null)}
                      className="text-emerald-400 hover:text-emerald-600 transition-colors"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modern Header */}
        <motion.div variants={itemVariants} className="mb-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4">
              Cover Letters
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Create compelling, personalized cover letters that get you noticed by employers
            </p>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-4">
              <div className="bg-white rounded-2xl px-6 py-3 shadow-lg border border-gray-100">
                <span className="text-sm font-medium text-gray-500">Total Cover Letters</span>
                <div className="text-2xl font-bold text-gray-900">{filteredCoverLetters.length}</div>
              </div>
              <div className="bg-white rounded-2xl px-6 py-3 shadow-lg border border-gray-100">
                <span className="text-sm font-medium text-gray-500">This Month</span>
                <div className="text-2xl font-bold text-blue-600">0</div>
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => navigate('/app/cover-letters/create')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold text-lg"
                icon={<Sparkles className="h-6 w-6" />}
              >
                Create New Cover Letter
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Advanced Search and Filters */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, company, or position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-lg"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-blue-100 text-blue-600 shadow-md' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Grid3X3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-blue-100 text-blue-600 shadow-md' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>

              {/* Sort Controls */}
              <div className="flex items-center space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'company')}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="date">Sort by Date</option>
                  <option value="title">Sort by Title</option>
                  <option value="company">Sort by Company</option>
                </select>
                
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all duration-200"
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-5 w-5" /> : <SortDesc className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Cover Letters Content */}
        {loading ? (
          <motion.div 
            variants={itemVariants}
            className="flex justify-center py-20"
          >
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-600 font-medium">Loading your cover letters...</p>
            </div>
          </motion.div>
        ) : filteredCoverLetters.length > 0 ? (
          <motion.div variants={itemVariants}>
            <div className={`${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8' 
                : 'space-y-4'
            }`}>
              <AnimatePresence>
                {filteredCoverLetters.map((letter, index) => (
                  <CoverLetterCard
                    key={letter.cover_letter_id}
                    letter={letter}
                    index={index}
                    onUpdate={refetchCoverLetters}
                    viewMode={viewMode}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants}>
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                  <FileText className="h-16 w-16 text-blue-500" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  {searchTerm ? 'No Results Found' : 'No Cover Letters Yet'}
                </h3>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  {searchTerm 
                    ? 'Try adjusting your search terms or filters to find what you\'re looking for.' 
                    : 'Create your first professional cover letter and start landing more interviews.'
                  }
                </p>
                {!searchTerm && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => navigate('/app/cover-letters/create')}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold text-lg"
                      icon={<Sparkles className="h-6 w-6" />}
                    >
                      Create Your First Cover Letter
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

interface CoverLetterCardProps {
  letter: CoverLetter;
  index: number;
  onUpdate: () => void;
  viewMode: 'grid' | 'list';
}

const CoverLetterCard: React.FC<CoverLetterCardProps> = ({ letter, index, onUpdate, viewMode }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this cover letter?')) {
      // TODO: Implement delete functionality
      onUpdate();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateString);
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        whileHover="hover"
        className="group"
      >
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300">
          <div className="flex items-center p-6">
            {/* Preview Thumbnail */}
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mr-6 flex-shrink-0">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 truncate">
                    {letter.title}
                  </h3>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    {letter.company && (
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-1" />
                        <span className="truncate">{letter.company}</span>
                      </div>
                    )}
                    {letter.position && (
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-1" />
                        <span className="truncate">{letter.position}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{getTimeAgo(letter.created_at)}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-2">
                    {letter.content.substring(0, 150)}...
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <Link to={`/app/cover-letters/${letter.cover_letter_id}/edit`}>
                    <Button variant="outline" size="sm" className="px-4">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      try {
                        const blob = await coverLetterService.downloadCoverLetterById(letter.cover_letter_id, 'pdf');
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `cover-letter-${letter.title}.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                      } catch (error) {
                        console.error('Download failed:', error);
                      }
                    }}
                    className="px-4"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>

                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    
                    {showMenu && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10">
                        <button
                          onClick={handleDelete}
                          className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors flex items-center"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      whileHover="hover"
      className="group"
    >
      <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 h-full">
        {/* Cover Letter Preview */}
        <div className="relative h-64 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
          <div className="relative h-full bg-white rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
              <div className="text-xs text-gray-500 font-medium">
                {formatDate(letter.created_at)}
              </div>
            </div>
            <div className="text-sm text-gray-700 line-clamp-8 leading-relaxed">
              {letter.content.substring(0, 300)}...
            </div>
          </div>
        </div>

        {/* Cover Letter Info */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 truncate">
                {letter.title}
              </h3>
              
              <div className="flex items-center space-x-3 text-sm text-gray-500">
                {letter.company && (
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-1" />
                    <span className="truncate">{letter.company}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{getTimeAgo(letter.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="relative ml-4">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10">
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors flex items-center"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-3">
            <Link to={`/app/cover-letters/${letter.cover_letter_id}/edit`} className="flex-1">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-purple-100 hover:border-blue-300 transition-all duration-200"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                try {
                  const blob = await coverLetterService.downloadCoverLetterById(letter.cover_letter_id, 'pdf');
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `cover-letter-${letter.title}.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                } catch (error) {
                  console.error('Download failed:', error);
                }
              }}
              className="px-4 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 hover:from-green-100 hover:to-emerald-100 transition-all duration-200"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

