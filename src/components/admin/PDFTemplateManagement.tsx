import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Trash2, 
  Settings,
  FileText,
  Calendar,
  Tag,
  MapPin
} from 'lucide-react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { pdfTemplateService } from '../../services/pdfTemplateService';
import { PDFTemplate, PDFContentArea } from '../../types';
import { PDFTemplateUpload } from './PDFTemplateUpload';
import { ContentAreaEditor } from './ContentAreaEditor';

export const PDFTemplateManagement: React.FC = () => {
  console.log('=== PDFTemplateManagement Component Rendering ===');
  const [templates, setTemplates] = useState<PDFTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUpload, setShowUpload] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PDFTemplate | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [showContentEditor, setShowContentEditor] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PDFTemplate | null>(null);

  // Load templates on component mount
  useEffect(() => {
    console.log('=== PDFTemplateManagement Component Mount ===');
    loadTemplates();
    loadCategories();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading PDF templates...');
      const data = await pdfTemplateService.getPDFTemplates();
      console.log('PDF templates loaded:', data);
      setTemplates(data || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
      setError(error instanceof Error ? error.message : 'Failed to load templates');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await pdfTemplateService.getTemplateCategories();
      setCategories(data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setCategories(['Professional', 'Creative', 'Modern', 'Classic', 'Minimalist', 'Executive']);
    }
  };

  // Handle template upload
  const handleTemplateUploaded = (template: PDFTemplate) => {
    setTemplates(prev => [template, ...prev]);
    setShowUpload(false);
  };

  // Handle template deletion
  const handleDeleteTemplate = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await pdfTemplateService.deletePDFTemplate(id);
        setTemplates(prev => prev.filter(t => t.id !== id));
      } catch (error) {
        console.error('Failed to delete template:', error);
      }
    }
  };

  // Handle template update
  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;
    
    try {
      const updatedTemplate = await pdfTemplateService.updatePDFTemplate(
        editingTemplate.id,
        {
          name: editingTemplate.name,
          description: editingTemplate.description,
          category: editingTemplate.category,
          isActive: editingTemplate.isActive
        }
      );
      
      await loadTemplates();
      setEditingTemplate(null);
    } catch (error) {
      console.error('Failed to update template:', error);
      alert('Failed to update template. Please try again.');
    }
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async (isActive: boolean) => {
    if (selectedTemplates.length === 0) return;
    
    try {
      await pdfTemplateService.bulkUpdateStatus(selectedTemplates, isActive);
      setTemplates(prev => 
        prev.map(t => 
          selectedTemplates.includes(t.id) 
            ? { ...t, isActive } 
            : t
        )
      );
      setSelectedTemplates([]);
    } catch (error) {
      console.error('Failed to update template status:', error);
    }
  };

  // Handle template selection for content editing
  const handleTemplateSelectForEditing = (template: PDFTemplate) => {
    setSelectedTemplate(template);
    setShowContentEditor(true);
  };

  // Handle content areas save
  const handleContentAreasSave = async (contentAreas: PDFContentArea[]) => {
    if (!selectedTemplate) return;
    
    try {
      await pdfTemplateService.updateContentAreas(selectedTemplate.id, contentAreas);
      await loadTemplates();
    } catch (error) {
      console.error('Failed to save content areas:', error);
    }
  };

  // Handle process template
  const handleProcessTemplate = async () => {
    if (!selectedTemplate) return;
    
    try {
      const result = await pdfTemplateService.processPDFTemplate(selectedTemplate.id);
      await loadTemplates();
      return result;
    } catch (error) {
      console.error('Failed to process template:', error);
      throw error;
    }
  };

  // Handle close content editor
  const handleCloseContentEditor = () => {
    setShowContentEditor(false);
    setSelectedTemplate(null);
  };

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle template selection
  const handleTemplateSelect = (id: string) => {
    setSelectedTemplates(prev => 
      prev.includes(id) 
        ? prev.filter(t => t !== id)
        : [...prev, id]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedTemplates.length === filteredTemplates.length) {
      setSelectedTemplates([]);
    } else {
      setSelectedTemplates(filteredTemplates.map(t => t.id));
    }
  };

  // Show content editor if active
  if (showContentEditor && selectedTemplate) {
    return (
      <ContentAreaEditor
        templateId={selectedTemplate.id}
        contentAreas={selectedTemplate.contentAreas || []}
        onSave={handleContentAreasSave}
        onProcess={handleProcessTemplate}
      />
    );
  }

  console.log('PDFTemplateManagement rendering main content');
    return (
      <div className="space-y-6">
      {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">PDF Template Management</h1>
            <p className="text-gray-600">Upload and manage PDF resume templates</p>
          </div>
        <Button
          onClick={() => setShowUpload(true)}
          icon={<Plus className="h-4 w-4" />}
        >
          Upload Template
        </Button>
        </div>
        
      {/* Loading State */}
      {loading && (
        <Card className="p-8">
          <div className="flex items-center justify-center">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-gray-600">Loading templates...</span>
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="p-6">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Templates</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadTemplates} variant="outline">
              Try Again
            </Button>
          </div>
        </Card>
      )}

      {/* Main Content - Only show when not loading and no error */}
      {!loading && !error && (
        <>
      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <Button
              variant="outline"
              icon={<Filter className="h-4 w-4" />}
            >
              Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedTemplates.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedTemplates.length} template(s) selected
            </span>
            <div className="flex space-x-2">
              <Button
                onClick={() => handleBulkStatusUpdate(true)}
                variant="outline"
                size="sm"
              >
                Activate
              </Button>
              <Button
                onClick={() => handleBulkStatusUpdate(false)}
                variant="outline"
                size="sm"
              >
                Deactivate
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredTemplates.map((template) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-4 hover:shadow-lg transition-shadow">
                {/* Template Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedTemplates.includes(template.id)}
                      onChange={() => handleTemplateSelect(template.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <FileText className="h-5 w-5 text-blue-500" />
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Eye className="h-4 w-4" />}
                      onClick={() => window.open(template.pdfFile, '_blank')}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<MapPin className="h-4 w-4" />}
                      onClick={() => handleTemplateSelectForEditing(template)}
                      title="Edit Content Areas"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Edit3 className="h-4 w-4" />}
                      onClick={() => setEditingTemplate(template)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 className="h-4 w-4" />}
                      onClick={() => handleDeleteTemplate(template.id)}
                    />
                  </div>
                </div>

                {/* Template Preview */}
                <div className="mb-3">
                      <div className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                </div>

                {/* Template Info */}
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900 truncate">{template.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Tag className="h-3 w-3" />
                      <span>{template.category}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      template.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </span>
                    
                    <span className="text-xs text-gray-500">
                      {template.contentAreas?.length || 0} content areas
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && !loading && (
        <Card className="p-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by uploading your first PDF template'
            }
          </p>
              {!searchTerm && selectedCategory !== 'all' && (
            <Button
              onClick={() => setShowUpload(true)}
              icon={<Plus className="h-4 w-4" />}
            >
              Upload Template
            </Button>
          )}
        </Card>
          )}
        </>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <PDFTemplateUpload
                onTemplateUploaded={handleTemplateUploaded}
                onClose={() => setShowUpload(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Template Modal */}
      <AnimatePresence>
        {editingTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
            >
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Edit Template: {editingTemplate.name}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Name
                    </label>
                    <input
                      type="text"
                      value={editingTemplate.name}
                      onChange={(e) => setEditingTemplate({
                        ...editingTemplate,
                        name: e.target.value
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editingTemplate.description}
                      onChange={(e) => setEditingTemplate({
                        ...editingTemplate,
                        description: e.target.value
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={editingTemplate.category}
                      onChange={(e) => setEditingTemplate({
                        ...editingTemplate,
                        category: e.target.value
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Professional">Professional</option>
                      <option value="Creative">Creative</option>
                      <option value="Modern">Modern</option>
                      <option value="Classic">Classic</option>
                      <option value="Minimalist">Minimalist</option>
                      <option value="Executive">Executive</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={editingTemplate.isActive ? 'true' : 'false'}
                      onChange={(e) => setEditingTemplate({
                        ...editingTemplate,
                        isActive: e.target.value === 'true'
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={handleUpdateTemplate}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditingTemplate(null)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
