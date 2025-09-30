import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Crown,
  FileText,
  Sparkles,
  Zap,
  Shield,
  CheckCircle,
  ArrowRight,
  Play,
  Download,
  Eye,
  Heart,
  Share2,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
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
  }
};

export const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const features = [
    { icon: Zap, title: "Dynamic Arrays", description: "Unlimited entries in any section" },
    { icon: Shield, title: "Style Preservation", description: "Perfect formatting maintained" },
    { icon: Clock, title: "Real-time Preview", description: "See changes instantly" },
    { icon: Users, title: "ATS Optimized", description: "Passes all screening systems" }
  ];

  const stats = [
    { label: "Success Rate", value: "98.7%", icon: TrendingUp, color: "text-green-600" },
    { label: "Users", value: "10K+", icon: Users, color: "text-blue-600" },
    { label: "Response Time", value: "<2s", icon: Clock, color: "text-purple-600" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        {/* Hero Header */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium mb-6 shadow-lg"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Premium Template
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-6">
            Resume Templates
          </h1>
          
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Experience the future of resume creation with our advanced AI-powered template system
          </p>
        </motion.div>

        {/* Featured Template Card */}
        <motion.div 
          variants={itemVariants}
          whileHover="hover"
          className="mb-16"
        >
          <motion.div
            variants={cardHoverVariants}
            whileHover="hover"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-indigo-50 border-0 shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transform rotate-12 scale-150"></div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsLiked(!isLiked)}
                className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'text-red-500 fill-current' : 'text-slate-600'}`} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Share2 className="h-5 w-5 text-slate-600" />
              </motion.button>
            </div>

            <div className="relative p-8 lg:p-12">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Left Side - Template Preview */}
                <div className="relative">
                  <motion.div
                    whileHover={{ rotateY: 15 }}
                    className="relative"
                  >
                    <div className="w-full h-80 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                      <div className="relative z-10 text-center">
                        <FileText className="h-24 w-24 text-white/90 mx-auto mb-4" />
                        <div className="space-y-2">
                          <div className="h-2 bg-white/30 rounded-full w-32 mx-auto"></div>
                          <div className="h-2 bg-white/20 rounded-full w-24 mx-auto"></div>
                          <div className="h-2 bg-white/25 rounded-full w-28 mx-auto"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Floating Badge */}
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -top-4 -right-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg"
                    >
                      <Star className="h-4 w-4 inline mr-1" />
                      Featured
                    </motion.div>
                  </motion.div>
                </div>

                {/* Right Side - Content */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-green-400 to-emerald-500 text-white">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Premium Template
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-400 to-indigo-500 text-white">
                      <Shield className="h-4 w-4 mr-1" />
                      ATS Optimized
                    </span>
                  </div>

                  <h2 className="text-4xl font-bold text-slate-900 leading-tight">
                    Francisca Professional Resume
                  </h2>
                  
                  <p className="text-lg text-slate-600 leading-relaxed">
                    Experience our revolutionary dynamic form system with intelligent styling preservation. 
                    Create unlimited entries in any section while maintaining perfect professional formatting.
                  </p>

                  {/* Features Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {features.map((feature, index) => (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="flex items-center space-x-3 p-3 rounded-lg bg-white/60 backdrop-blur-sm border border-white/20"
                      >
                        <feature.icon className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">{feature.title}</div>
                          <div className="text-xs text-slate-500">{feature.description}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                      <Button 
                  onClick={() => {
                    console.log('Button clicked, navigating to Francisca form...');
                    console.log('Current location:', window.location.pathname);
                    console.log('Target path: /app/francisca');
                    try {
                      navigate('/app/francisca');
                      console.log('Navigation successful');
                    } catch (error) {
                      console.error('Navigation error:', error);
                    }
                  }}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Try Francisca Form
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        variant="outline" 
                        className="w-full sm:w-auto border-2 border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-4 text-lg font-semibold transition-all duration-200"
                        onClick={() => setShowPreview(!showPreview)}
                      >
                        <Eye className="h-5 w-5 mr-2" />
                        Live Preview
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
            </motion.div>
        </motion.div>

        {/* Stats Section */}
        <motion.div variants={itemVariants} className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-slate-100 to-slate-200 mb-4`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</div>
                <div className="text-slate-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Exclusive Offering Section */}
        <motion.div variants={itemVariants} className="text-center">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-8 lg:p-12 border border-emerald-200/50">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-lg font-semibold mb-6 shadow-lg"
            >
              <Star className="h-5 w-5 mr-2" />
              Exclusive Offering
            </motion.div>
            
            <h3 className="text-3xl font-bold text-slate-900 mb-4">
              The Only Template You'll Ever Need
            </h3>
            
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
              The Francisca Professional Resume template represents the pinnacle of resume creation technology. 
              With advanced AI-powered formatting, dynamic content management, and guaranteed ATS compatibility, 
              it's designed to give you a competitive edge in today's job market.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2 px-4 py-2 bg-white/80 rounded-full border border-emerald-200"
              >
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-slate-700">AI-Powered</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2 px-4 py-2 bg-white/80 rounded-full border border-emerald-200"
              >
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-slate-700">ATS Optimized</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2 px-4 py-2 bg-white/80 rounded-full border border-emerald-200"
              >
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-slate-700">Style Preserved</span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900">Live Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <span className="sr-only">Close</span>
                  <div className="w-6 h-6 border-2 border-slate-400 rounded-full flex items-center justify-center">
                    <div className="w-3 h-0.5 bg-slate-400 rotate-45 transform origin-center"></div>
                    <div className="w-3 h-0.5 bg-slate-400 -rotate-45 transform origin-center"></div>
                  </div>
                </button>
              </div>
              
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-8 border border-slate-200">
                <div className="text-center">
                  <FileText className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-slate-900 mb-2">Interactive Preview</h4>
                  <p className="text-slate-600 mb-6">
                    Experience the dynamic form system in action. See how content adapts while maintaining perfect formatting.
                  </p>
                  <div className="space-y-3">
                    <div className="h-3 bg-blue-200 rounded-full w-3/4 mx-auto"></div>
                    <div className="h-3 bg-blue-200 rounded-full w-1/2 mx-auto"></div>
                    <div className="h-3 bg-blue-200 rounded-full w-2/3 mx-auto"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
