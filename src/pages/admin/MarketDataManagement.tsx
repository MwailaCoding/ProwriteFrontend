import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  Download,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Filter,
  FileText,
  BarChart3
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useApi, useApiMutation } from '../../hooks/useApi';
import { marketService } from '../../services/marketService';
import { adminService } from '../../services/adminService';
import { MarketData } from '../../types';

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

export const MarketDataManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MarketData | null>(null);

  const { data: marketData, loading, execute: refetchData } = useApi<MarketData[]>(
    () => marketService.getMarketData()
  );

  const { execute: updateMarketData, loading: updating } = useApiMutation(
    (data: MarketData[]) => adminService.updateMarketData(data),
    {
      onSuccess: () => {
        refetchData();
      }
    }
  );

  const regions = ['all', 'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'];
  const industries = ['all', 'technology', 'healthcare', 'finance', 'marketing', 'education', 'consulting'];

  const filteredData = marketData?.filter(item => {
    const matchesSearch = item.skill.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === 'all' || item.region === selectedRegion;
    const matchesIndustry = selectedIndustry === 'all' || item.industry === selectedIndustry;
    return matchesSearch && matchesRegion && matchesIndustry;
  }) || [];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const handleExportData = () => {
    if (!marketData) return;
    
    const csvContent = [
      ['Skill', 'Industry', 'Region', 'Demand %', 'Trend'],
      ...marketData.map(item => [
        item.skill,
        item.industry,
        item.region,
        item.demand_percentage.toString(),
        item.trend
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'market-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = [
    {
      title: 'Total Skills',
      value: marketData?.length || 0,
      icon: BarChart3,
      color: 'sunset'
    },
    {
      title: 'Trending Up',
      value: marketData?.filter(item => item.trend === 'up').length || 0,
      icon: TrendingUp,
      color: 'green'
    },
    {
      title: 'Trending Down',
      value: marketData?.filter(item => item.trend === 'down').length || 0,
      icon: TrendingDown,
      color: 'red'
    },
    {
      title: 'Industries',
      value: new Set(marketData?.map(item => item.industry)).size || 0,
      icon: FileText,
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
            <h1 className="text-3xl font-bold text-gray-900">Market Data Management</h1>
            <p className="text-gray-600 mt-2">
              Manage skill demand data and market trends
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={handleExportData}
              icon={<Download className="h-5 w-5" />}
            >
              Export Data
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowImportModal(true)}
              icon={<Upload className="h-5 w-5" />}
            >
              Import Data
            </Button>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-sunset-gradient"
              icon={<Plus className="h-5 w-5" />}
            >
              Add Skill
            </Button>
          </div>
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
                placeholder="Search skills or industries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sunset-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sunset-500 focus:border-transparent"
              >
                {regions.map(region => (
                  <option key={region} value={region}>
                    {region === 'all' ? 'All Regions' : region}
                  </option>
                ))}
              </select>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sunset-500 focus:border-transparent"
              >
                {industries.map(industry => (
                  <option key={industry} value={industry}>
                    {industry === 'all' ? 'All Industries' : industry.charAt(0).toUpperCase() + industry.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Data Table */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Market Data ({filteredData.length} items)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Skill</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Industry</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Region</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Demand</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Trend</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{item.skill}</td>
                        <td className="py-3 px-4 text-gray-600 capitalize">{item.industry}</td>
                        <td className="py-3 px-4 text-gray-600">{item.region}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-sunset-gradient h-2 rounded-full"
                                style={{ width: `${item.demand_percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {item.demand_percentage}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(item.trend)}`}>
                            {getTrendIcon(item.trend)}
                            <span className="ml-1 capitalize">{item.trend}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingItem(item)}
                              icon={<Edit className="h-4 w-4" />}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this item?')) {
                                  // TODO: Implement delete
                                }
                              }}
                              icon={<Trash2 className="h-4 w-4" />}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingItem) && (
        <MarketDataModal
          item={editingItem}
          onClose={() => {
            setShowAddModal(false);
            setEditingItem(null);
          }}
          onSuccess={() => {
            setShowAddModal(false);
            setEditingItem(null);
            refetchData();
          }}
        />
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ImportDataModal
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            setShowImportModal(false);
            refetchData();
          }}
        />
      )}
    </motion.div>
  );
};

interface MarketDataModalProps {
  item?: MarketData | null;
  onClose: () => void;
  onSuccess: () => void;
}

const MarketDataModal: React.FC<MarketDataModalProps> = ({ item, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    skill: item?.skill || '',
    industry: item?.industry || 'technology',
    region: item?.region || 'Nairobi',
    demand_percentage: item?.demand_percentage || 0,
    trend: item?.trend || 'stable'
  });

  const { execute: saveItem, loading } = useApiMutation(
    (data: any) => {
      // TODO: Implement save/update API call
      return Promise.resolve({ message: 'Success' });
    },
    {
      onSuccess: () => {
        onSuccess();
      }
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveItem(formData);
  };

  const industries = ['technology', 'healthcare', 'finance', 'marketing', 'education', 'consulting'];
  const regions = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'];
  const trends = ['up', 'down', 'stable'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-md w-full"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {item ? 'Edit Skill Data' : 'Add New Skill'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skill Name
              </label>
              <input
                type="text"
                value={formData.skill}
                onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sunset-500 focus:border-transparent"
                placeholder="e.g., React.js"
                required
              />
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
                Region
              </label>
              <select
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sunset-500 focus:border-transparent"
              >
                {regions.map(region => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Demand Percentage
              </label>
              <input
                type="number"
                value={formData.demand_percentage}
                onChange={(e) => setFormData({ ...formData, demand_percentage: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sunset-500 focus:border-transparent"
                min="0"
                max="100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trend
              </label>
              <select
                value={formData.trend}
                onChange={(e) => setFormData({ ...formData, trend: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sunset-500 focus:border-transparent"
              >
                {trends.map(trend => (
                  <option key={trend} value={trend}>
                    {trend.charAt(0).toUpperCase() + trend.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-4 pt-4">
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
                {item ? 'Update' : 'Add'} Skill
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

interface ImportDataModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const ImportDataModal: React.FC<ImportDataModalProps> = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);

  const { execute: importData, loading } = useApiMutation(
    (data: MarketData[]) => adminService.updateMarketData(data),
    {
      onSuccess: () => {
        onSuccess();
      }
    }
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Parse CSV for preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const csv = event.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        const data = lines.slice(1, 6).map(line => {
          const values = line.split(',');
          return headers.reduce((obj, header, index) => {
            obj[header.trim()] = values[index]?.trim() || '';
            return obj;
          }, {} as any);
        });
        setPreview(data);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csv = event.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0].split(',');
      
      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        return {
          skill: values[0]?.trim() || '',
          industry: values[1]?.trim() || '',
          region: values[2]?.trim() || '',
          demand_percentage: parseInt(values[3]?.trim()) || 0,
          trend: values[4]?.trim() || 'stable'
        };
      }).filter(item => item.skill); // Filter out empty rows

      await importData(data);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Import Market Data</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CSV File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Drop your CSV file here, or{' '}
                    <label className="text-sunset-600 hover:text-sunset-700 cursor-pointer">
                      browse
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </p>
                  <p className="text-xs text-gray-500">
                    CSV format: Skill, Industry, Region, Demand %, Trend
                  </p>
                </div>
                {file && (
                  <div className="mt-4 p-3 bg-sunset-50 rounded-lg">
                    <p className="text-sm font-medium text-sunset-800">{file.name}</p>
                  </div>
                )}
              </div>
            </div>

            {preview.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Preview (first 5 rows)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3">Skill</th>
                        <th className="text-left py-2 px-3">Industry</th>
                        <th className="text-left py-2 px-3">Region</th>
                        <th className="text-left py-2 px-3">Demand %</th>
                        <th className="text-left py-2 px-3">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2 px-3">{row.Skill}</td>
                          <td className="py-2 px-3">{row.Industry}</td>
                          <td className="py-2 px-3">{row.Region}</td>
                          <td className="py-2 px-3">{row['Demand %']}</td>
                          <td className="py-2 px-3">{row.Trend}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

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
                onClick={handleImport}
                loading={loading}
                disabled={!file}
                className="flex-1 bg-sunset-gradient"
              >
                Import Data
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};