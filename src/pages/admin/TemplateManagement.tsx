import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Upload,
  FileText,
  Edit,
  Trash2,
  Eye,
  Crown,
  Search,
  Filter,
  MoreVertical,
  Image as ImageIcon,
  Download,
  Settings
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useApi, useApiMutation } from '../../hooks/useApi';
import { templateService } from '../../services/templateService';
import { Template } from '../../types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export const TemplateManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const { data: templates, loading, execute: refetchTemplates } = useApi<Template[]>(
    () => templateService.getTemplates()
  );

  const { execute: deleteTemplate, loading: deleting } = useApiMutation(
    (id: number) => templateService.deleteTemplate(id),
    {
      onSuccess: () => {
        refetchTemplates();
      }
    }
  );

  const categories = ['all', 'modern', 'classic', 'creative', 'minimal', 'executive'];
  const industries = ['technology', 'healthcare', 'finance', 'marketing', 'education', 'consulting'];

  const filteredTemplates = templates?.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const handleDeleteTemplate = async (templateId: number) => {
    if (window.confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      await deleteTemplate(templateId);
    }
  };

  const stats = [
    {
      title: 'Total Templates',
      value: templates?.length || 0,
      icon: FileText,
      color: 'sunset'
    },
    {
      title: 'Premium Templates',
      value: templates?.filter(t => t.is_premium).length || 0,
      icon: Crown,
      color: 'amber'
    },
    {
      title: 'Free Templates',
      value: templates?.filter(t => !t.is_premium).length || 0,
      icon: FileText,
      color: 'green'
    },
    {
      title: 'Active Templates',
      value: templates?.filter(t => t.is_active).length || 0,
      icon: Settings,
      color: 'coral'
    }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Template Management</h1>
            <p className="text-gray-600 mt-2">
              Manage resume templates and upload new designs
            </p>
          </div>
          <Button
            onClick={() => setShowUploadModal(true)}
            className="bg-sunset-gradient"
            icon={<Plus className="h-5 w-5" />}
          >
            Add Template
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title} hover>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sunset-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sunset-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Templates Grid */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Templates ({filteredTemplates.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTemplates.map((template, index) => (
                  <TemplateCard
                    key={template.template_id}
                    template={template}
                    index={index}
                    onEdit={() => setSelectedTemplate(template)}
                    onDelete={() => handleDeleteTemplate(template.template_id)}
                    deleting={deleting}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadTemplateModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            refetchTemplates();
          }}
        />
      )}

      {/* Edit Modal */}
      {selectedTemplate && (
        <EditTemplateModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          onSuccess={() => {
            setSelectedTemplate(null);
            refetchTemplates();
          }}
        />
      )}
    </motion.div>
  );
};

interface TemplateCardProps {
  template: Template;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  index,
  onEdit,
  onDelete,
  deleting
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      variants={itemVariants}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group relative"
    >
      <Card hover className="overflow-hidden">
        {/* Template Preview */}
        <div className="relative aspect-[3/4] bg-gradient-to-br from-sunset-100 to-coral-100">
          {template.thumbnail_url ? (
            <img
              src={template.thumbnail_url}
              alt={template.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <FileText className="h-16 w-16 text-sunset-400" />
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-2 left-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              template.is_active
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {template.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Premium Badge */}
          {template.is_premium && (
            <div className="absolute top-2 right-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </span>
            </div>
          )}

          {/* Menu Button */}
          <div className="absolute bottom-2 right-2">
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
              >
                <MoreVertical className="h-4 w-4 text-gray-600" />
              </button>

              {showMenu && (
                <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                  <button
                    onClick={() => {
                      onEdit();
                      setShowMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Template
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Implement preview
                      setShowMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Implement download
                      setShowMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </button>
                  <hr className="my-2" />
                  <button
                    onClick={() => {
                      onDelete();
                      setShowMenu(false);
                    }}
                    disabled={deleting}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Template Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2 py-1 bg-sunset-100 text-sunset-800 rounded-full">
                {template.category}
              </span>
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                {template.industry}
              </span>
            </div>
            
            {template.is_premium ? (
              <span className="text-sm font-medium text-sunset-600">
                KES {template.price.toLocaleString()}
              </span>
            ) : (
              <span className="text-sm font-medium text-green-600">Free</span>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

interface UploadTemplateModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const UploadTemplateModal: React.FC<UploadTemplateModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'modern',
    industry: 'technology',
    is_premium: false,
    price: 0
  });
  const [file, setFile] = useState<File | null>(null);

  const { execute: uploadTemplate, loading } = useApiMutation(
    (data: FormData) => templateService.createTemplate(data),
    {
      onSuccess: () => {
        onSuccess();
      }
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('name', formData.name);
    uploadData.append('description', formData.description);
    uploadData.append('category', formData.category);
    uploadData.append('industry', formData.industry);
    uploadData.append('is_premium', formData.is_premium.toString());
    uploadData.append('price', formData.price.toString());

    await uploadTemplate(uploadData);
  };

  const categories = ['modern', 'classic', 'creative', 'minimal', 'executive'];
  const industries = ['technology', 'healthcare', 'finance', 'marketing', 'education', 'consulting'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Upload New Template</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-sunset-400 transition-colors">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Drop your template file here, or{' '}
                    <label className="text-sunset-600 hover:text-sunset-700 cursor-pointer">
                      browse
                      <input
                        type="file"
                        accept=".pdf,.docx,.txt"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                  </p>
                  <p className="text-xs text-gray-500">PDF, DOCX, or TXT files only</p>
                </div>
                {file && (
                  <div className="mt-4 p-3 bg-sunset-50 rounded-lg">
                    <p className="text-sm font-medium text-sunset-800">{file.name}</p>
                    <p className="text-xs text-sunset-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Template Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sunset-500 focus:border-transparent"
                  placeholder="Enter template name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sunset-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sunset-500 focus:border-transparent"
                >
                  {industries.map(industry => (
                    <option key={industry} value={industry}>
                      {industry.charAt(0).toUpperCase() + industry.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (KES)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sunset-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sunset-500 focus:border-transparent"
                placeholder="Describe this template..."
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_premium"
                checked={formData.is_premium}
                onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                className="rounded border-gray-300 text-sunset-600 focus:ring-sunset-500"
              />
              <label htmlFor="is_premium" className="ml-2 text-sm text-gray-700">
                This is a premium template
              </label>
            </div>

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                disabled={!file || !formData.name}
                className="flex-1 bg-sunset-gradient"
              >
                Upload Template
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

interface EditTemplateModalProps {
  template: Template;
  onClose: () => void;
  onSuccess: () => void;
}

const EditTemplateModal: React.FC<EditTemplateModalProps> = ({ template, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: template.name,
    description: template.description,
    category: template.category,
    industry: template.industry,
    is_premium: template.is_premium,
    price: template.price,
    is_active: template.is_active
  });

  const { execute: updateTemplate, loading } = useApiMutation(
    (data: any) => templateService.updateTemplate(template.template_id, data),
    {
      onSuccess: () => {
        onSuccess();
      }
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateTemplate(formData);
  };

  const categories = ['modern', 'classic', 'creative', 'minimal', 'executive'];
  const industries = ['technology', 'healthcare', 'finance', 'marketing', 'education', 'consulting'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Edit Template</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sunset-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sunset-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sunset-500 focus:border-transparent"
                >
                  {industries.map(industry => (
                    <option key={industry} value={industry}>
                      {industry.charAt(0).toUpperCase() + industry.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (KES)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sunset-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sunset-500 focus:border-transparent"
                required
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_premium"
                  checked={formData.is_premium}
                  onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                  className="rounded border-gray-300 text-sunset-600 focus:ring-sunset-500"
                />
                <label htmlFor="is_premium" className="ml-2 text-sm text-gray-700">
                  Premium template
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-sunset-600 focus:ring-sunset-500"
                />
                <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                  Template is active
                </label>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                className="flex-1 bg-sunset-gradient"
              >
                Update Template
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};