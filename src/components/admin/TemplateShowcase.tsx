import React, { useState } from 'react';
import { 
  Star, 
  Eye, 
  Download, 
  Heart, 
  Clock, 
  Users,
  TrendingUp,
  Filter,
  Grid,
  List,
  Search,
  ArrowRight,
  Play
} from 'lucide-react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { resumeTemplateCategories, getPopularTemplates } from '../../data/resumeTemplates';
import { PDFTemplate } from '../../types';

interface TemplateShowcaseProps {
  onTemplateSelect?: (template: PDFTemplate) => void;
  onClose?: () => void;
}

export const TemplateShowcase: React.FC<TemplateShowcaseProps> = ({
  onTemplateSelect,
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const popularTemplates = getPopularTemplates(8);

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
      className="p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:bg-gray-50 group"
      onClick={() => onTemplateSelect?.(template)}
    >
      {/* Template Image */}
      <div className="relative mb-4">
        <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center group-hover:from-blue-50 group-hover:to-blue-100 transition-colors">
          <div className="text-center">
            <div className="text-4xl mb-2">📄</div>
            <div className="text-sm text-gray-500">{template.name}</div>
          </div>
        </div>
        
        {/* Popularity Badge */}
        <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 shadow-sm">
          <div className="flex items-center space-x-1">
            {getPopularityStars(template.popularity)}
          </div>
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(template.id);
          }}
          className="absolute top-2 left-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
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
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template.metadata.difficulty)}`}>
            {template.metadata.difficulty}
          </span>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button size="sm" icon={<Play className="h-4 w-4" />}>
              Preview
            </Button>
          </div>
        </div>
      </div>

      {/* Template Info */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
          {template.name}
        </h3>
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
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{template.pageCount} page{template.pageCount > 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center space-x-1">
            <TrendingUp className="h-3 w-3" />
            <span>{template.popularity}%</span>
          </div>
        </div>
      </div>
    </Card>
  );

  const renderTemplateList = (template: PDFTemplate) => (
    <Card 
      key={template.id} 
      className="p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:bg-gray-50 group"
      onClick={() => onTemplateSelect?.(template)}
    >
      <div className="flex items-center space-x-4">
        {/* Template Image */}
        <div className="relative">
          <div className="w-24 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center group-hover:from-blue-50 group-hover:to-blue-100 transition-colors">
            <div className="text-center">
              <div className="text-2xl mb-1">📄</div>
              <div className="text-xs text-gray-500">{template.name}</div>
            </div>
          </div>
          
          {/* Popularity Badge */}
          <div className="absolute -top-1 -right-1 bg-white rounded-full px-1 py-0.5 shadow-sm">
            <div className="flex items-center space-x-0.5">
              {getPopularityStars(template.popularity)}
            </div>
          </div>
        </div>

        {/* Template Info */}
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                {template.name}
              </h3>
              <p className="text-gray-600 text-sm">{template.description}</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(template.id);
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <Heart 
                  className={`h-4 w-4 ${
                    favorites.has(template.id) 
                      ? 'fill-red-500 text-red-500' 
                      : 'text-gray-400'
                  }`} 
                />
              </button>
              
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template.metadata.difficulty)}`}>
                {template.metadata.difficulty}
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
              <span>{template.pageCount} page{template.pageCount > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="h-3 w-3" />
              <span>{template.popularity}% popularity</span>
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
        <h1 className="text-4xl font-bold text-gray-900 mb-4">🎨 Resume Template Collection</h1>
        <p className="text-xl text-gray-600 max-w-3xl">
          Discover our professionally designed resume templates, carefully crafted for different industries and experience levels
        </p>
      </div>

      {/* Search and Controls */}
      <div className="mb-8 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center justify-between">
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

          <div className="text-sm text-gray-500">
            {resumeTemplateCategories.reduce((total, cat) => total + cat.templates.length, 0)} templates available
          </div>
        </div>
      </div>

      {/* Popular Templates Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Star className="h-6 w-6 text-yellow-500 mr-2" />
            Most Popular Templates
          </h2>
          <Button variant="outline" icon={<ArrowRight className="h-4 w-4" />}>
            View All Popular
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularTemplates.map((template) => renderTemplateCard(template))}
        </div>
      </div>

      {/* Category Sections */}
      {resumeTemplateCategories.map((category) => (
        <div key={category.id} className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="text-3xl mr-3">{category.icon}</span>
                {category.name} Templates
              </h2>
              <p className="text-gray-600 mt-1">{category.description}</p>
            </div>
            <Button variant="outline" icon={<ArrowRight className="h-4 w-4" />}>
              View All {category.name}
            </Button>
          </div>
          
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
            {category.templates.map((template) => 
              viewMode === 'grid' ? renderTemplateCard(template) : renderTemplateList(template)
            )}
          </div>
        </div>
      ))}

      {/* Template Stats */}
      <Card className="p-8 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Template Collection Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {resumeTemplateCategories.reduce((total, cat) => total + cat.templates.length, 0)}
              </div>
              <div className="text-sm text-blue-800">Total Templates</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {resumeTemplateCategories.length}
              </div>
              <div className="text-sm text-green-800">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {Math.round(popularTemplates.reduce((avg, t) => avg + t.popularity, 0) / popularTemplates.length)}%
              </div>
              <div className="text-sm text-purple-800">Avg. Popularity</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {resumeTemplateCategories.reduce((total, cat) => total + cat.templates.filter(t => t.metadata.difficulty === 'beginner').length, 0)}
              </div>
              <div className="text-sm text-orange-800">Beginner Friendly</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Close Button */}
      {onClose && (
        <div className="mt-8 text-center">
          <Button onClick={onClose} variant="outline">
            Close Showcase
          </Button>
        </div>
      )}
    </div>
  );
};
