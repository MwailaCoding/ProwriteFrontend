import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { Layout } from './components/common/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import './styles/mobile-responsive.css';

// Landing Page
import { LandingPage } from './pages/LandingPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPageSimple';
import RegisterPage from './pages/auth/RegisterPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// User Pages
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { TemplatesPage } from './pages/templates/TemplatesPage';
import { FormBuilderDemo } from './pages/FormBuilderDemo';

import { MarketInsightsPage } from './pages/market/MarketInsightsPage';
import { BillingPage } from './pages/billing/BillingPage';
import ProwriteTemplateFormPage from './pages/ProwriteTemplateFormPage';
import RealJobSearchPage from './pages/jobs/RealJobSearchPage';

// Admin Routes
import AdminRoutes from './components/admin/AdminRoutes';

// Additional Pages
import { CoverLettersPage } from './pages/cover-letters/CoverLettersPage';
import { CreateCoverLetterPage } from './pages/cover-letters/CreateCoverLetterPage';
import { EditCoverLetterPage } from './pages/cover-letters/EditCoverLetterPage';
import { PaymentHistoryPage } from './pages/payments/PaymentHistoryPage';
import ProfilePage from './pages/profile/ProfilePage';
import ProwriteTemplateStyleTemplate from './components/resume/ProwriteTemplateStyleTemplate';
import { sampleProwriteTemplateData } from './data/sampleResumeData';
import './styles/prowriteTemplateTemplate.css';
// Ensure CSS is loaded

// Simple test component to show Prowrite template template - Updated for deployment - Force rebuild
const ProwriteTemplateTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Prowrite Template Template Test</h1>
        <div className="bg-white rounded-lg shadow-lg p-8">
          <ProwriteTemplateStyleTemplate resumeData={sampleProwriteTemplateData} />
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Admin Routes - Must come FIRST to avoid conflicts */}
          <Route path="/admin/*" element={<AdminRoutes />} />
          
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />
          
          <Route path="/login" element={
            <ProtectedRoute guestOnly>
              <LoginPage />
            </ProtectedRoute>
          } />
          <Route path="/register" element={
            <ProtectedRoute guestOnly>
              <RegisterPage />
            </ProtectedRoute>
          } />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected Routes */}
          <Route path="/app" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            
            {/* Prowrite Template Template Route - Place early to avoid conflicts */}
            <Route path="prowrite-template" element={<ProwriteTemplateFormPage />} />
            <Route path="prowrite-template/" element={<ProwriteTemplateFormPage />} />
            <Route path="prowrite-template-test" element={<ProwriteTemplateTest />} />
            
            {/* Demo Route */}
            <Route path="demo" element={<FormBuilderDemo />} />
            
            {/* Template Routes */}
            <Route path="templates" element={<TemplatesPage />} />
            <Route path="cover-letters" element={<CoverLettersPage />} />
            <Route path="cover-letters/create" element={<CreateCoverLetterPage />} />
            <Route path="cover-letters/:id/edit" element={<EditCoverLetterPage />} />
            <Route path="market-insights" element={<MarketInsightsPage />} />
            <Route path="real-jobs" element={<RealJobSearchPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="payments" element={<PaymentHistoryPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Catch all - but don't interfere with admin routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;