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
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [careerPath, setCareerPath] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const { callApi: fetchResumes } = useApi(resumeService.getResumes);
  const { callApi: fetchMarketData } = useApi(marketService.getMarketData);
  const { callApi: fetchAIInsights } = useApi(aiService.getInsights);
  const { callApi: fetchCareerPath } = useApi(advancedAIMarketService.getCareerPath);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [resumesData, marketDataResult, aiInsightsResult, careerPathResult] = await Promise.all([
          fetchResumes(),
          fetchMarketData(),
          fetchAIInsights(),
          fetchCareerPath()
        ]);

        if (resumesData.success) {
          setResumes(resumesData.data || []);
        }

        if (marketDataResult.success) {
          setMarketData(marketDataResult.data);
        }

        if (aiInsightsResult.success) {
          setAiInsights(aiInsightsResult.data);
        }

        if (careerPathResult.success) {
          setCareerPath(careerPathResult.data);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [fetchResumes, fetchMarketData, fetchAIInsights, fetchCareerPath]);

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
            Loading your personalized dashboard...
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
              <span className="text-sm font-medium text-gray-700">AI-Powered Career Platform</span>
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
              Your AI-powered career journey starts here. Let's build something amazing together.
            </motion.p>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatsCard
            title="Resumes Created"
            value={resumes.length}
            change="+2 this week"
            icon={FileText}
            color="blue"
            delay={0.1}
          />
          <StatsCard
            title="AI Optimizations"
            value={resumes.length * 3}
            change="+12 this month"
            icon={Brain}
            color="purple"
            delay={0.2}
          />
          <StatsCard
            title="Job Matches"
            value={24}
            change="+5 today"
            icon={Target}
            color="green"
            delay={0.3}
          />
          <StatsCard
            title="Success Rate"
            value="94%"
            change="+3% this week"
            icon={TrendingUp}
            color="orange"
            delay={0.4}
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - AI Insights */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* AI Career Intelligence */}
            <Card className="relative overflow-hidden border-0 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white shadow-lg">
                      <Brain className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">AI Career Intelligence</CardTitle>
                      <p className="text-sm text-gray-600">Personalized insights powered by AI</p>
                    </div>
                  </div>
                  <motion.div
                    animate={pulseVariants.pulse}
                    className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full"
                  >
                    Live
                  </motion.div>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-6">
                {/* Career Progress */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                      <Rocket className="h-5 w-5 text-blue-600" />
                      <span>Career Trajectory</span>
                    </h4>
                    <div className="space-y-3">
                      <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Current Level</span>
                          <span className="text-sm font-bold text-blue-600">Mid-Level</span>
                        </div>
                        <ProgressBar value={65} color="blue" />
                      </div>
                      <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Next Milestone</span>
                          <span className="text-sm font-bold text-green-600">Senior Role</span>
                        </div>
                        <ProgressBar value={35} color="green" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                      <Target className="h-5 w-5 text-green-600" />
                      <span>Skill Development</span>
                    </h4>
                    <div className="space-y-3">
                      <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Leadership</span>
                          <span className="text-sm font-bold text-green-600">70%</span>
                        </div>
                        <ProgressBar value={70} color="green" />
                      </div>
                      <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Data Analytics</span>
                          <span className="text-sm font-bold text-purple-600">45%</span>
                        </div>
                        <ProgressBar value={45} color="purple" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-amber-600" />
                    <span>AI Recommendations</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { text: "Complete leadership certification", icon: Award, color: "green" },
                      { text: "Join industry networking groups", icon: Users, color: "blue" },
                      { text: "Update your portfolio with recent projects", icon: Briefcase, color: "purple" },
                      { text: "Practice technical interviews", icon: Brain, color: "orange" }
                    ].map((rec, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300"
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg bg-${rec.color}-100`}>
                            <rec.icon className={`h-4 w-4 text-${rec.color}-600`} />
                          </div>
                          <span className="text-sm text-gray-700 font-medium">{rec.text}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="relative overflow-hidden border-0 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
              <CardHeader className="relative">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl text-white shadow-lg">
                    <Zap className="h-6 w-6" />
                  </div>
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <QuickActionButton
                    title="Create Resume"
                    icon={Plus}
                    color="blue"
                    delay={0.1}
                  />
                  <QuickActionButton
                    title="AI Enhance"
                    icon={Brain}
                    color="purple"
                    delay={0.2}
                  />
                  <QuickActionButton
                    title="Job Search"
                    icon={Target}
                    color="green"
                    delay={0.3}
                  />
                  <QuickActionButton
                    title="Market Insights"
                    icon={TrendingUp}
                    color="orange"
                    delay={0.4}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Recent Activity & Resources */}
          <motion.div variants={itemVariants} className="space-y-6 sm:space-y-8">
            {/* Recent Activity */}
            <Card className="relative overflow-hidden border-0 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-teal-500/5" />
              <CardHeader className="relative">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg text-white shadow-lg">
                    <Activity className="h-5 w-5" />
                  </div>
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-4">
                {[
                  { action: "Resume optimized", time: "2 hours ago", icon: CheckCircle, color: "green" },
                  { action: "New job match found", time: "4 hours ago", icon: Target, color: "blue" },
                  { action: "AI analysis completed", time: "1 day ago", icon: Brain, color: "purple" },
                  { action: "Profile updated", time: "2 days ago", icon: User, color: "orange" }
                ].map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center space-x-3 p-3 bg-white/80 backdrop-blur-sm rounded-xl hover:bg-white transition-colors duration-300"
                  >
                    <div className={`p-2 rounded-lg bg-${activity.color}-100`}>
                      <activity.icon className={`h-4 w-4 text-${activity.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Resources & Learning */}
            <Card className="relative overflow-hidden border-0 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-blue-500/5" />
              <CardHeader className="relative">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg text-white shadow-lg">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <span>Learning Resources</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative space-y-4">
                {[
                  { title: "Leadership Fundamentals", progress: 75, color: "blue" },
                  { title: "Data Analytics Bootcamp", progress: 45, color: "green" },
                  { title: "Technical Interview Prep", progress: 60, color: "purple" },
                  { title: "Industry Networking", progress: 30, color: "orange" }
                ].map((resource, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">{resource.title}</h4>
                      <span className="text-sm font-bold text-gray-600">{resource.progress}%</span>
                    </div>
                    <ProgressBar value={resource.progress} color={resource.color} />
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Feature Cards */}
        <motion.div variants={itemVariants} className="space-y-6 sm:space-y-8">
          <div className="text-center px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              Everything you need to advance your career, powered by cutting-edge AI technology
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <FeatureCard
              title="Smart Resume Builder"
              description="AI-powered resume creation with real-time optimization and ATS compatibility"
              icon={FileText}
              color="blue"
              href="/app/templates"
              delay={0.1}
              badge="AI"
            />
            <FeatureCard
              title="Market Intelligence"
              description="Real-time industry insights, salary data, and skill demand analysis"
              icon={BarChart3}
              color="green"
              href="/app/market-insights"
              delay={0.2}
              badge="Live"
            />
            <FeatureCard
              title="Job Search Engine"
              description="AI-matched job opportunities with personalized recommendations"
              icon={Target}
              color="purple"
              href="/app/real-jobs"
              delay={0.3}
              badge="AI"
            />
            <FeatureCard
              title="Cover Letter Generator"
              description="Create compelling cover letters tailored to specific job applications"
              icon={BookOpen}
              color="orange"
              href="/app/cover-letters"
              delay={0.4}
              badge="New"
            />
            <FeatureCard
              title="Career Analytics"
              description="Track your progress and get insights on your career development"
              icon={TrendingUp}
              color="pink"
              href="/app/analytics"
              delay={0.5}
              badge="Pro"
            />
            <FeatureCard
              title="AI Career Coach"
              description="Personalized career guidance and development recommendations"
              icon={Brain}
              color="blue"
              href="/app/coach"
              delay={0.6}
              badge="AI"
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};