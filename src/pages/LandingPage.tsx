import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PenTool,
  FileText,
  Zap,
  Target,
  TrendingUp,
  Award,
  Users,
  CheckCircle,
  ArrowRight,
  Star,
  Sparkles,
  BarChart3,
  Shield,
  Clock
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

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

export const LandingPage: React.FC = () => {
  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Enhancement',
      description: 'Transform your resume with intelligent suggestions and professional language optimization.',
      color: 'sunset'
    },
    {
      icon: Target,
      title: 'ATS Score Analyzer',
      description: 'Get detailed feedback on how well your resume performs with applicant tracking systems.',
      color: 'coral'
    },
    {
      icon: TrendingUp,
      title: 'Market Insights',
      description: 'Stay ahead with real-time data on trending skills and industry demands.',
      color: 'amber'
    },
    {
      icon: FileText,
      title: 'Professional Templates',
      description: 'Choose from our curated collection of industry-specific resume templates.',
      color: 'sunset'
    }
  ];

  const testimonials = [
    {
      name: 'Grace Wanjiku',
      role: 'Software Engineer',
      company: 'Safaricom PLC',
      content: 'ProWriteSolutions helped me land my dream job! The AI suggestions were spot-on and the ATS analyzer gave me the confidence I needed.',
      rating: 5,
      initials: 'GW'
    },
    {
      name: 'James Mwangi',
      role: 'Marketing Manager',
      company: 'Equity Bank',
      content: 'The market insights feature is incredible. I was able to tailor my resume to match exactly what employers were looking for.',
      rating: 5,
      initials: 'JM'
    },
    {
      name: 'Mary Akinyi',
      role: 'Data Analyst',
      company: 'KCB Bank',
      content: 'Professional templates and AI enhancement made my resume stand out. Got 3 interview calls in the first week!',
      rating: 5,
      initials: 'MA'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Resumes Created' },
    { number: '95%', label: 'Success Rate' },
    { number: '24/7', label: 'AI Support' },
    { number: '100+', label: 'Templates' }
  ];


  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-16 sm:pt-20 lg:pt-24 pb-12 sm:pb-16 lg:pb-20 bg-gradient-to-br from-sunset-50 via-amber-50 to-coral-50">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div variants={itemVariants} className="space-y-6 sm:space-y-8">
              <div className="space-y-4 sm:space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="inline-flex items-center space-x-2 bg-sunset-100 text-sunset-800 px-3 sm:px-4 py-2 rounded-full text-sm font-medium"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>AI-Powered Resume Builder</span>
                </motion.div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Build Your
                  <span className="bg-sunset-gradient bg-clip-text text-transparent"> Dream Career</span>
                  <br />
                  with AI
                </h1>
                
                <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                  Create professional resumes that get noticed. ProWriteSolutions AI-powered platform helps you craft compelling resumes, 
                  analyze ATS compatibility, and stay ahead of market trends.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto">
                    Start Building Free
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Sign In
                  </Button>
                </Link>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <span>Secure & private</span>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <PenTool className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Peter Kamau</h3>
                      <p className="text-sm text-gray-600">Software Engineer</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded-full"></div>
                    <div className="h-3 bg-gray-200 rounded-full w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded-full w-1/2"></div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600 font-medium">ATS Score: 95%</span>
                    <span className="text-blue-600 font-medium">AI Enhanced</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div key={stat.label} variants={itemVariants} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-sunset-600 mb-2">{stat.number}</div>
                <div className="text-sm sm:text-base text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </motion.h2>
            <motion.p variants={itemVariants} className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              ProWriteSolutions comprehensive platform provides all the tools you need to create a standout resume and advance your career.
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
          >
            {features.map((feature, index) => (
              <motion.div key={feature.title} variants={itemVariants}>
                <Card hover className="h-full p-6 sm:p-8 text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-${feature.color}-100 mb-4 sm:mb-6`}>
                    <feature.icon className={`h-6 w-6 sm:h-8 sm:w-8 text-${feature.color}-600`} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Loved by Kenyan Professionals
            </motion.h2>
            <motion.p variants={itemVariants} className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of Kenyan professionals who have transformed their careers with ProWriteSolutions.
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div key={testimonial.name} variants={itemVariants}>
                <Card className="h-full p-6 sm:p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 mb-6">{testimonial.content}</p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                      {testimonial.initials}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role} at {testimonial.company}</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-sunset-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Ready to Transform Your Career?
            </motion.h2>
            <motion.p variants={itemVariants} className="text-lg sm:text-xl text-white/90 mb-8">
              Join thousands of Kenyan professionals who have already taken their careers to the next level with ProWriteSolutions.
            </motion.p>
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Start Building Free
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Sign In
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <PenTool className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold">ProWriteSolutions</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                The AI-powered resume builder that helps Kenyan professionals create professional resumes, 
                analyze ATS compatibility, and stay ahead of market trends.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ProWriteSolutions. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};