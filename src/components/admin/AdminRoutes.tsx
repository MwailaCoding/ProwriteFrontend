import React from 'react';
import { useLocation } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import UserManagement from './UserManagement';
import TemplateManagement from './TemplateManagement';
import { PDFTemplateManagement } from './PDFTemplateManagement';
import { PDFTemplateUpload } from './PDFTemplateUpload';
import { TemplateTest } from './TemplateTest';
import AIContentProcessor from './AIContentProcessor';
import AdminLogin from './AdminLogin';
import { TemplateAnalytics } from './TemplateAnalytics';
import { TemplateFeaturesSummary } from './TemplateFeaturesSummary';
import { TemplateManagementDashboard } from './TemplateManagementDashboard';
import { TemplateShowcase } from './TemplateShowcase';
import { Phase4Summary } from './Phase4Summary';
import { PDFSharingCollaboration } from './PDFSharingCollaboration';
import { AdvancedPDFGenerator } from './AdvancedPDFGenerator';
import { PDFGenerationDemo } from './PDFGenerationDemo';
import { PDFTemplatePreview } from './PDFTemplatePreview';
import { ContentAreaEditor } from './ContentAreaEditor';
import IntelligentFieldMapper from './IntelligentFieldMapper';
import { SimpleTemplateCreator } from './SimpleTemplateCreator';
import AITestComponent from './AITestComponent';

const AdminRoutes: React.FC = () => {
  const adminToken = localStorage.getItem('adminToken');
  const location = useLocation();
  const path = location.pathname;

  // Handle logout route
  if (path === '/admin/logout') {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
    return null;
  }

  // If no admin token and not on login page, redirect to login
  if (!adminToken && path !== '/admin/login') {
    return <AdminLogin />;
  }

  // If on login page, show login form without admin layout
  if (path === '/admin/login') {
    return <AdminLogin />;
  }

  // If no admin token at this point, show login
  if (!adminToken) {
    return <AdminLogin />;
  }

  // Render content based on current path (only for authenticated users)
  const renderContent = () => {
    
    if (path === '/admin' || path === '/admin/') {
      return <AdminDashboard />;
    }
    
    if (path === '/admin/users') {
      return <UserManagement />;
    }
    
    if (path === '/admin/templates') {
      return <TemplateManagement />;
    }
    
    if (path === '/admin/pdf-templates') {
      return <PDFTemplateManagement />;
    }
    
    if (path === '/admin/ai-processor') {
      return <AIContentProcessor />;
    }
    
    if (path === '/admin/upload-template') {
      return <PDFTemplateUpload onTemplateUploaded={() => {}} onClose={() => {}} />;
    }
    
    if (path === '/admin/template-test') {
      return <TemplateTest />;
    }
    
    if (path === '/admin/moderation') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold">Content Moderation</h2>
          <p>AI content review functionality coming soon...</p>
        </div>
      );
    }
    
    if (path === '/admin/market-data') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold">Market Data</h2>
          <p>Skill demand analytics coming soon...</p>
        </div>
      );
    }
    
    if (path === '/admin/payments') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold">Payments</h2>
          <p>Payment tracking functionality coming soon...</p>
        </div>
      );
    }
    
    if (path === '/admin/ai-metrics') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold">AI Metrics</h2>
          <p>AI performance data coming soon...</p>
        </div>
      );
    }
    
    if (path === '/admin/config') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold">System Config</h2>
          <p>System settings coming soon...</p>
        </div>
      );
    }
    
    if (path === '/admin/audit') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold">Audit Logs</h2>
          <p>Activity tracking coming soon...</p>
        </div>
      );
    }
    
    if (path === '/admin/template-analytics') {
      return <TemplateAnalytics />;
    }
    
    if (path === '/admin/template-features') {
      return <TemplateFeaturesSummary />;
    }
    
    if (path === '/admin/template-dashboard') {
      return <TemplateManagementDashboard />;
    }
    
    if (path === '/admin/template-showcase') {
      return <TemplateShowcase />;
    }
    
    if (path === '/admin/phase4-summary') {
      return <Phase4Summary />;
    }
    
    if (path === '/admin/pdf-sharing') {
      return <PDFSharingCollaboration />;
    }
    
    if (path === '/admin/advanced-pdf-generator') {
      return <AdvancedPDFGenerator />;
    }
    
    if (path === '/admin/pdf-generation-demo') {
      return <PDFGenerationDemo />;
    }
    
    if (path === '/admin/pdf-template-preview') {
      return <PDFTemplatePreview />;
    }
    
    if (path === '/admin/content-area-editor') {
      return <ContentAreaEditor templateId="" contentAreas={[]} onSave={() => {}} onProcess={() => {}} />;
    }
    
    if (path === '/admin/intelligent-field-mapper') {
      return <IntelligentFieldMapper />;
    }
    
    if (path === '/admin/simple-template-creator') {
      return <SimpleTemplateCreator />;
    }
    
    if (path === '/admin/template-creation-wizard') {
      return (
        <div className="p-6">
          <h2 className="text-2xl font-bold">Template Creation Wizard</h2>
          <p>Coming soon...</p>
        </div>
      );
    }
    
    if (path === '/admin/ai-test') {
      return <AITestComponent />;
    }
    
    // Default fallback - 404 page for admin routes
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-4">The admin page you're looking for doesn't exist.</p>
          <p className="text-sm text-gray-500 mb-6">Path: {path}</p>
          <button
            onClick={() => window.location.href = '/admin'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Admin Dashboard
          </button>
        </div>
      </div>
    );
  };

  // If user is not logged in, show only the login form without admin layout
  if (!adminToken || path === '/admin/login') {
    return <AdminLogin />;
  }

  // For authenticated users, show the full admin layout
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="bg-white shadow-lg w-64">
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-xl font-bold text-gray-800">ProWrite</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <ul className="space-y-2">
            <li>
              <a href="/admin" className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                location.pathname === '/admin' || location.pathname === '/admin/'
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}>
                <span className="mr-3">🏠</span>
                <span>Dashboard</span>
              </a>
            </li>
            <li>
              <a href="/admin/users" className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                location.pathname === '/admin/users'
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}>
                <span className="mr-3">👥</span>
                <span>User Management</span>
              </a>
            </li>
            <li>
              <a href="/admin/templates" className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                location.pathname === '/admin/templates'
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}>
                <span className="mr-3">📄</span>
                <span>Templates</span>
              </a>
            </li>
            <li>
              <a href="/admin/pdf-templates" className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                location.pathname === '/admin/pdf-templates'
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}>
                <span className="mr-3">📋</span>
                <span>PDF Templates</span>
              </a>
            </li>
            <li>
              <a href="/admin/ai-processor" className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                location.pathname === '/admin/ai-processor'
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}>
                <span className="mr-3">⚙️</span>
                <span>AI Processor</span>
              </a>
            </li>
            <li>
              <a href="/admin/upload-template" className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                location.pathname === '/admin/upload-template'
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}>
                <span className="mr-3">⬆️</span>
                <span>Upload Template</span>
              </a>
            </li>
            <li>
              <a href="/admin/template-test" className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                location.pathname === '/admin/template-test'
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}>
                <span className="mr-3">✅</span>
                <span>Template Test</span>
              </a>
            </li>
            <li>
              <a href="/admin/moderation" className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                location.pathname === '/admin/moderation'
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}>
                <span className="mr-3">🛡️</span>
                <span>Content Moderation</span>
              </a>
            </li>
            <li>
              <a href="/admin/market-data" className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                location.pathname === '/admin/market-data'
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}>
                <span className="mr-3">📊</span>
                <span>Market Data</span>
              </a>
            </li>
            <li>
              <a href="/admin/payments" className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                location.pathname === '/admin/payments'
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}>
                <span className="mr-3">💰</span>
                <span>Payments</span>
              </a>
            </li>
            <li>
              <a href="/admin/ai-metrics" className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                location.pathname === '/admin/ai-metrics'
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}>
                <span className="mr-3">👁️</span>
                <span>AI Metrics</span>
              </a>
            </li>
            <li>
              <a href="/admin/config" className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                location.pathname === '/admin/config'
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}>
                <span className="mr-3">⚙️</span>
                <span>System Config</span>
              </a>
            </li>
            <li>
              <a href="/admin/audit" className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                location.pathname === '/admin/audit'
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}>
                <span className="mr-3">🗑️</span>
                <span>Audit Logs</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, System</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <span className="text-gray-600">🔔</span>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">👤</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">System Administrator</p>
                    <p className="text-xs text-gray-500">admin@prowrite.com</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem('adminToken');
                    window.location.href = '/admin/login';
                  }}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminRoutes;
