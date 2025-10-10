import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  TrendingUp,
  Award,
  Calendar,
  Target,
  BarChart3,
  User,
  Brain,
  Lightbulb,
  Zap,
  TrendingDown,
  ArrowUpRight,
  Clock,
  Star,
  CheckCircle,
  AlertCircle,
  Rocket,
  Sparkles,
  Activity,
  Users,
  BookOpen,
  Briefcase,
  Settings,
  Bell,
  ChevronRight,
  Play,
  Pause,
  RefreshCw,
  Download,
  Eye,
  Edit3,
  Globe,
  Shield,
  Crown,
  Heart,
  MessageCircle,
  Share2,
  ExternalLink
} from 'lucide-react';
import { RootState } from '../../store';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useApi } from '../../hooks/useApi';
import { resumeService } from '../../services/resumeService';
import { marketService } from '../../services/marketService';
import { aiService } from '../../services/aiService';
import { advancedAIMarketService } from '../../services/advancedAIMarketService';
import { Resume, MarketData } from '../../types';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

const cardHoverVariants = {
  hover: {
    y: -8,
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  tap: {
    scale: 0.98
  }
};

const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Floating particles component
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-20"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -20, 0],
          x: [0, Math.random() * 20 - 10, 0],
          opacity: [0.2, 0.8, 0.2],
        }}
        transition={{
          duration: 3 + Math.random() * 2,
          repeat: Infinity,
          delay: Math.random() * 2,
        }}
      />
    ))}
  </div>
);

// Animated counter component
const AnimatedCounter = ({ value, duration = 2 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{count}</span>;
};

// Progress bar component
const ProgressBar = ({ value, max = 100, color = "blue", animated = true }: { 
  value: number; 
  max?: number; 
  color?: string; 
  animated?: boolean;
}) => {
  const percentage = (value / max) * 100;
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
      <motion.div
        className={`h-full rounded-full bg-gradient-to-r ${
          color === 'blue' ? 'from-blue-500 to-blue-600' :
          color === 'green' ? 'from-green-500 to-green-600' :
          color === 'purple' ? 'from-purple-500 to-purple-600' :
          'from-gray-500 to-gray-600'
        }`}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: animated ? 1.5 : 0, ease: "easeOut" }}
      />
    </div>
  );
};

// Stats card component
const StatsCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = "blue",
  delay = 0 
}: {
  title: string;
  value: number | string;
  change?: string;
  icon: React.ComponentType<any>;
  color?: string;
  delay?: number;
}) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    pink: "from-pink-500 to-pink-600"
  };

  return (
    <motion.div
      variants={{ ...itemVariants, hover: cardHoverVariants.hover }}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      whileHover="hover"
      className="relative group"
    >
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
        <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
        <CardContent className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg`}>
              <Icon className="h-6 w-6" />
            </div>
            {change && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: delay + 0.5 }}
                className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                  change.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                <TrendingUp className="h-3 w-3" />
                <span>{change}</span>
              </motion.div>
            )}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {typeof value === 'number' ? <AnimatedCounter value={value} /> : value}
            </h3>
            <p className="text-gray-600 text-sm font-medium">{title}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Feature card component
const FeatureCard = ({ 
  title, 
  description, 
  icon: Icon, 
  color = "blue",
  href,
  delay = 0,
  badge
}: {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color?: string;
  href: string;
  delay?: number;
  badge?: string;
}) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    pink: "from-pink-500 to-pink-600"
  };

  return (
    <motion.div
      variants={{ ...itemVariants, hover: cardHoverVariants.hover, tap: cardHoverVariants.tap }}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      whileHover="hover"
      whileTap="tap"
      className="group"
    >
      <Link to={href}>
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer h-full">
          <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
          <CardContent className="relative p-6 h-full flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="h-6 w-6" />
              </div>
              {badge && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                  {badge}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                {title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {description}
              </p>
            </div>
            <div className="flex items-center text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
              <span>Get started</span>
              <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

// Quick action button component
const QuickActionButton = ({ 
  title, 
  icon: Icon, 
  color = "blue",
  onClick,
  delay = 0
}: {
  title: string;
  icon: React.ComponentType<any>;
  color?: string;
  onClick?: () => void;
  delay?: number;
}) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    pink: "from-pink-500 to-pink-600"
  };

  return (
    <motion.button
      variants={{ ...itemVariants, hover: cardHoverVariants.hover, tap: cardHoverVariants.tap }}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      className={`group relative p-4 rounded-2xl bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden`}
    >
      <div className="relative z-10">
        <Icon className="h-8 w-8 mb-2 group-hover:scale-110 transition-transform duration-300" />
        <p className="font-semibold text-sm">{title}</p>
      </div>
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
    </motion.button>
  );
};

export const DashboardPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  const { callApi: fetchResumes } = useApi(resumeService.getResumes);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Only load resumes data
        const resumesResult = await fetchResumes();
        if (resumesResult.success) {
          setResumes(resumesResult.data || []);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [fetchResumes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <LoadingSpinner size="lg" />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-gray-600"
          >
            Loading your workspace...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <FloatingParticles />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative space-y-6 sm:space-y-8 p-4 sm:p-6"
      >
        {/* Hero Section */}
        <motion.div variants={itemVariants} className="relative">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg mb-6"
            >
              <motion.div
                animate={pulseVariants.pulse}
                className="w-2 h-2 bg-green-500 rounded-full"
              />
              <span className="text-sm font-medium text-gray-700">ProWriteSolutions Workspace</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4 px-4"
            >
              Welcome back, {user?.firstName}! 👋
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4"
            >
              Create professional documents with our Prowrite template templates and cover letter builder.
            </motion.p>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{resumes.length}</p>
                <p className="text-sm text-gray-600">Resumes Created</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Edit3 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-600">Cover Letters</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Download className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-600">Downloads</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Navigation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Prowrite Template Templates Section */}
          <motion.div variants={itemVariants} className="space-y-6">
            <Card className="relative overflow-hidden border-0 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5" />
              <CardHeader className="relative">
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white shadow-lg">
                    <FileText className="h-8 w-8" />
                  </div>
                  <span>Prowrite Template Resume Templates</span>
                </CardTitle>
                <p className="text-gray-600 mt-2">Professional ATS-friendly resume templates</p>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link to="/prowrite-template">
                    <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Create New Resume</h3>
                          <p className="text-sm text-gray-600">Start with Prowrite template template</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                  <Link to="/resumes">
                    <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                          <Eye className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">View Resumes</h3>
                          <p className="text-sm text-gray-600">Manage existing resumes</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900">Prowrite Template Features</h4>
                      <ul className="text-sm text-blue-700 mt-2 space-y-1">
                        <li>• ATS-optimized formatting</li>
                        <li>• Professional design templates</li>
                        <li>• AI-powered content suggestions</li>
                        <li>• Industry-specific customization</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Cover Letters Section */}
          <motion.div variants={itemVariants} className="space-y-6">
            <Card className="relative overflow-hidden border-0 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5" />
              <CardHeader className="relative">
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl text-white shadow-lg">
                    <Edit3 className="h-8 w-8" />
                  </div>
                  <span>Cover Letter Builder</span>
                </CardTitle>
                <p className="text-gray-600 mt-2">Create compelling cover letters</p>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link to="/cover-letters">
                    <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                          <Plus className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">Create Cover Letter</h3>
                          <p className="text-sm text-gray-600">Start new cover letter</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                  <Link to="/cover-letters">
                    <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                          <Edit3 className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">My Cover Letters</h3>
                          <p className="text-sm text-gray-600">View and edit existing</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
                
                <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Target className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-900">Cover Letter Features</h4>
                      <ul className="text-sm text-green-700 mt-2 space-y-1">
                        <li>• Job-specific customization</li>
                        <li>• Professional templates</li>
                        <li>• AI content enhancement</li>
                        <li>• Industry best practices</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Additional Tools & Features */}
        <motion.div variants={itemVariants} className="space-y-6 sm:space-y-8">
          <div className="text-center px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Additional Tools & Resources</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              More tools to help you succeed in your career journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <FeatureCard
              title="Document Templates"
              description="Professional templates for resumes, cover letters, and more"
              icon={FileText}
              color="blue"
              href="/templates"
              delay={0.1}
              badge="Free"
            />
            <FeatureCard
              title="File Manager"
              description="Organize and manage all your career documents"
              icon={Settings}
              color="green"
              href="/files"
              delay={0.2}
              badge="New"
            />
            <FeatureCard
              title="Export Options"
              description="Download your documents in multiple formats"
              icon={Download}
              color="purple"
              href="/export"
              delay={0.3}
              badge="Pro"
            />
            <FeatureCard
              title="Account Settings"
              description="Manage your profile and preferences"
              icon={User}
              color="orange"
              href="/settings"
              delay={0.4}
              badge=""
            />
            <FeatureCard
              title="Help & Support"
              description="Get help and contact our support team"
              icon={MessageCircle}
              color="pink"
              href="/help"
              delay={0.5}
              badge="24/7"
            />
            <FeatureCard
              title="About ProWriteSolutions"
              description="Learn more about our platform and features"
              icon={Globe}
              color="blue"
              href="/about"
              delay={0.6}
              badge="Info"
            />
          </div>
        </motion.div>

        {/* Quick Actions Bar */}
        <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Quick Actions</h3>
            <p className="text-gray-600">Get started with these common tasks</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link to="/prowrite-template">
              <div className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 hover:border-blue-300 transition-all duration-300 cursor-pointer group text-center">
                <div className="p-3 bg-blue-100 rounded-lg mx-auto mb-3 group-hover:bg-blue-200 transition-colors w-fit">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm">New Resume</h4>
              </div>
            </Link>
            
            <Link to="/cover-letters">
              <div className="p-4 bg-green-50 hover:bg-green-100 rounded-xl border border-green-200 hover:border-green-300 transition-all duration-300 cursor-pointer group text-center">
                <div className="p-3 bg-green-100 rounded-lg mx-auto mb-3 group-hover:bg-green-200 transition-colors w-fit">
                  <Edit3 className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors text-sm">Cover Letter</h4>
              </div>
            </Link>
            
            <Link to="/resumes">
              <div className="p-4 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 hover:border-purple-300 transition-all duration-300 cursor-pointer group text-center">
                <div className="p-3 bg-purple-100 rounded-lg mx-auto mb-3 group-hover:bg-purple-200 transition-colors w-fit">
                  <Eye className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors text-sm">View Files</h4>
              </div>
            </Link>
            
            <Link to="/settings">
              <div className="p-4 bg-orange-50 hover:bg-orange-100 rounded-xl border border-orange-200 hover:border-orange-300 transition-all duration-300 cursor-pointer group text-center">
                <div className="p-3 bg-orange-100 rounded-lg mx-auto mb-3 group-hover:bg-orange-200 transition-colors w-fit">
                  <Settings className="h-6 w-6 text-orange-600" />
                </div>
                <h4 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors text-sm">Settings</h4>
              </div>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};