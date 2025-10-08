import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  Eye,
  Download,
  Heart,
  Clock,
  Users,
  TrendingUp
} from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { PDFTemplate } from '../../types';
import { pdfTemplateService } from '../../services/pdfTemplateService';

interface EnhancedTemplateSelectorProps {
  onTemplateSelect: (template: PDFTemplate) => void;
  selectedTemplate?: PDFTemplate;
  onClose?: () => void;
  formDataReady?: boolean; // New prop to indicate form data is ready
}

export const EnhancedTemplateSelector: React.FC<EnhancedTemplateSelectorProps> = ({
  onTemplateSelect,
  selectedTemplate,
  onClose,
  formDataReady = false
}) => {
  const [currentCategory, setCurrentCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'popularity' | 'newest' | 'name'>('newest');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [templates, setTemplates] = useState<PDFTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load templates from API
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedTemplates = await pdfTemplateService.getPublicPDFTemplates();
        setTemplates(fetchedTemplates);
      } catch (err) {
        console.error('Error loading templates:', err);
        setError('Failed to load templates. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

  // Helper function to get category icon
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'professional': return '💼';
      case 'creative': return '🎨';
      case 'academic': return '🎓';
      case 'technical': return '⚙️';
      case 'entry-level': return '🚀';
      default: return '📄';
    }
  };

  // Generate categories from actual templates
  const categories = React.useMemo(() => {
    const uniqueCategories = new Set(templates.map(t => t.category).filter(Boolean));
    return Array.from(uniqueCategories).map(cat => ({
      id: cat,
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      icon: getCategoryIcon(cat)
    }));
  }, [templates]);

  // Filter and sort templates
  const filteredTemplates = React.useMemo(() => {
    return templates
      .filter(template => {
        if (currentCategory !== 'all' && template.category !== currentCategory) return false;
        if (searchQuery && !template.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
            !template.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'popularity': 
            return (b.popularity || 0) - (a.popularity || 0);
          case 'newest': 
            return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
          case 'name': 
            return a.name.localeCompare(b.name);
          default: 
            return 0;
        }
      });
  }, [templates, currentCategory, searchQuery, sortBy]);

  const toggleFavorite = (templateId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(templateId)) {
      newFavorites.delete(templateId);
    } else {
      newFavorites.add(templateId);
    }
    setFavorites(newFavorites);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPopularityStars = (popularity: number) => {
    const stars = [];
    const filledStars = Math.floor(popularity / 20);
    const hasHalfStar = popularity % 20 >= 10;

    for (let i = 0; i < 5; i++) {
      if (i < filledStars) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
      } else if (i === filledStars && hasHalfStar) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-gray-300" />);
      }
    }
    return stars;
  };

  const renderTemplateCard = (template: PDFTemplate) => (
    <Card 
      key={template.id} 
      className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
        selectedTemplate?.id === template.id 
          ? 'ring-2 ring-blue-500 bg-blue-50 shadow-lg' 
          : 'hover:bg-gray-50'
      }`}
      onClick={() => {
        if (typeof onTemplateSelect === 'function') {
          onTemplateSelect(template);
        }
      }}
    >
             {/* Template Image */}
       <div className="relative mb-4">
         <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
           <div className="text-center">
             <div className="text-6xl mb-3 opacity-80">📄</div>
             <div className="text-sm text-gray-600 font-medium">{template.name}</div>
             <div className="text-xs text-gray-500 mt-1">{template.category}</div>
           </div>
         </div>
        
        {/* Popularity Badge */}
        <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 shadow-sm">
          <div className="flex items-center space-x-1">
            {getPopularityStars(template.popularity || 0)}
          </div>
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(template.id);
          }}
          className="absolute top-2 left-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-50"
        >
          <Heart 
            className={`h-4 w-4 ${
              favorites.has(template.id) 
                ? 'fill-red-500 text-red-500' 
                : 'text-gray-400'
            }`} 
          />
        </button>

        {/* Difficulty Badge */}
        <div className="absolute bottom-2 left-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template.metadata?.difficulty || 'beginner')}`}>
            {template.metadata?.difficulty || 'Beginner'}
          </span>
        </div>
      </div>

      {/* Template Info */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 text-lg">{template.name}</h3>
        <p className="text-gray-600 text-sm line-clamp-2">{template.description}</p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {template.tags.slice(0, 3).map((tag) => (
            <span 
              key={tag} 
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {template.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{template.tags.length - 3}
            </span>
          )}
        </div>

                 {/* Template Stats */}
         <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100 mb-3">
           <div className="flex items-center space-x-1">
             <Clock className="h-3 w-3" />
             <span>{template.pageCount || 1} page{template.pageCount !== 1 ? 's' : ''}</span>
           </div>
           <div className="flex items-center space-x-1">
             <TrendingUp className="h-3 w-3" />
             <span>{template.popularity || 0}%</span>
           </div>
         </div>
         
         {/* Select Template Button */}
         <button
           onClick={(e) => {
             e.stopPropagation();
             if (typeof onTemplateSelect === 'function') {
               onTemplateSelect(template);
             }
           }}
           className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
         >
           {formDataReady ? 'Select Template & Preview' : 'Select Template'}
         </button>
        

      </div>
    </Card>
  );

  const renderTemplateList = (template: PDFTemplate) => (
    <Card 
      key={template.id} 
      className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
        selectedTemplate?.id === template.id 
          ? 'ring-2 ring-blue-500 bg-blue-50' 
          : 'hover:bg-gray-50'
      }`}
      onClick={() => {
        if (typeof onTemplateSelect === 'function') {
          onTemplateSelect(template);
        }
      }}
    >
      <div className="flex items-center space-x-4">
        {/* Template Image */}
        <div className="relative">
          <div className="w-24 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl mb-1">📄</div>
              <div className="text-xs text-gray-500">{template.name}</div>
            </div>
          </div>
          
          {/* Popularity Badge */}
          <div className="absolute -top-1 -right-1 bg-white rounded-full px-1 py-0.5 shadow-sm">
            <div className="flex items-center space-x-0.5">
              {getPopularityStars(template.popularity || 0)}
            </div>
          </div>
        </div>

        {/* Template Info */}
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{template.name}</h3>
              <p className="text-gray-600 text-sm">{template.description}</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(template.id);
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Heart 
                  className={`h-4 w-4 ${
                    favorites.has(template.id) 
                      ? 'fill-red-500 text-red-500' 
                      : 'text-gray-400'
                  }`} 
                />
              </button>
              
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template.metadata?.difficulty || 'beginner')}`}>
                {template.metadata?.difficulty || 'Beginner'}
              </span>
            </div>
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {template.tags.map((tag) => (
              <span 
                key={tag} 
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          
          {/* Template Stats */}
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{template.pageCount || 1} page{template.pageCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="h-3 w-3" />
              <span>{template.popularity || 0}% popularity</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>{template.category}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        {formDataReady ? (
          <>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <div className="text-2xl mr-3">✅</div>
                <div>
                  <h3 className="text-lg font-semibold text-green-800">Form Data Ready!</h3>
                  <p className="text-green-700">Your resume information has been saved. Now select a template to generate your personalized resume.</p>
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Select Template for Your Resume</h1>
            <p className="text-gray-600">
              Choose a template to preview and generate your personalized resume
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Resume Template</h1>
            <p className="text-gray-600">
              Select from our collection of professionally designed templates
            </p>
          </>
        )}
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates by name, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={currentCategory}
              onChange={(e) => setCurrentCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="popularity">Popularity</option>
              <option value="newest">Newest</option>
              <option value="name">Name</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      {!searchQuery && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCurrentCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentCategory === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🌟 All Templates
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setCurrentCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentCategory === category.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
          {currentCategory !== 'all' && !searchQuery && ` in ${categories.find(cat => cat.id === currentCategory)?.name}`}
        </p>
      </div>

      {/* Templates Grid/List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚙️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading templates...</h3>
          <p className="text-gray-600 mb-4">
            Please wait while we fetch the latest templates from our database.
          </p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error: {error}</h3>
          <p className="text-gray-600 mb-4">
            Failed to load templates. Please check your internet connection or try again later.
          </p>
          <Button
            onClick={() => {
              setSearchQuery('');
              setCurrentCategory('all');
            }}
            variant="outline"
          >
            Clear Filters
          </Button>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates available</h3>
          <p className="text-gray-600 mb-4">
            No templates have been uploaded yet. Please check back later or contact an administrator.
          </p>
        </div>
      ) : filteredTemplates.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
          {filteredTemplates.map((template, index) => 
            viewMode === 'grid' ? renderTemplateCard(template) : renderTemplateList(template)
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search terms or category filter
          </p>
          <Button
            onClick={() => {
              setSearchQuery('');
              setCurrentCategory('all');
            }}
            variant="outline"
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Close Button */}
      {onClose && (
        <div className="mt-8 text-center">
          <Button onClick={onClose} variant="outline">
            Close Template Selector
          </Button>
        </div>
      )}
    </div>
  );
};