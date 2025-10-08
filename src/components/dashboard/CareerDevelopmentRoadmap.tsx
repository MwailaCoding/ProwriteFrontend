import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  CheckCircle, 
  Clock, 
  Star, 
  BookOpen, 
  Award,
  TrendingUp,
  Users,
  Calendar,
  ArrowRight,
  Play,
  Pause,
  Zap,
  Lightbulb,
  Rocket
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Button } from '../common/Button';

interface Milestone {
  id: string;
  title: string;
  description: string;
  category: 'skill' | 'certification' | 'experience' | 'networking';
  status: 'completed' | 'in-progress' | 'not-started' | 'paused';
  priority: 'critical' | 'high' | 'medium' | 'low';
  progress: number;
  estimatedTime: string;
  startDate?: string;
  dueDate?: string;
  skills: string[];
  impact: 'high' | 'medium' | 'low';
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  skills: string[];
  resources: string[];
  status: 'not-started' | 'in-progress' | 'completed';
  progress: number;
}

export const CareerDevelopmentRoadmap: React.FC = () => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate career roadmap data
    const generateRoadmapData = () => {
      const mockMilestones: Milestone[] = [
        {
          id: '1',
          title: 'Leadership Certification',
          description: 'Complete advanced leadership and management certification',
          category: 'certification',
          status: 'in-progress',
          priority: 'critical',
          progress: 60,
          estimatedTime: '3 months',
          startDate: '2024-01-15',
          dueDate: '2024-04-15',
          skills: ['Strategic Thinking', 'Team Management', 'Communication'],
          impact: 'high'
        },
        {
          id: '2',
          title: 'Data Analytics Mastery',
          description: 'Master advanced data analytics and visualization techniques',
          category: 'skill',
          status: 'in-progress',
          priority: 'high',
          progress: 75,
          estimatedTime: '4 months',
          startDate: '2024-02-01',
          dueDate: '2024-06-01',
          skills: ['Python', 'SQL', 'Tableau', 'Statistics'],
          impact: 'high'
        },
        {
          id: '3',
          title: 'Industry Networking',
          description: 'Build strong professional network in target industry',
          category: 'networking',
          status: 'not-started',
          priority: 'medium',
          progress: 0,
          estimatedTime: '6 months',
          skills: ['Networking', 'Communication', 'Relationship Building'],
          impact: 'medium'
        },
        {
          id: '4',
          title: 'AI/ML Fundamentals',
          description: 'Learn core AI and machine learning concepts',
          category: 'skill',
          status: 'not-started',
          priority: 'high',
          progress: 0,
          estimatedTime: '5 months',
          skills: ['Python', 'Machine Learning', 'Deep Learning', 'Statistics'],
          impact: 'high'
        },
        {
          id: '5',
          title: 'Project Management Experience',
          description: 'Lead a major project from start to finish',
          category: 'experience',
          status: 'not-started',
          priority: 'medium',
          progress: 0,
          estimatedTime: '8 months',
          skills: ['Project Management', 'Leadership', 'Risk Management'],
          impact: 'medium'
        }
      ];

      const mockLearningPaths: LearningPath[] = [
        {
          id: '1',
          title: 'Leadership Excellence Path',
          description: 'Comprehensive leadership development program',
          duration: '6 months',
          difficulty: 'intermediate',
          skills: ['Leadership', 'Management', 'Communication'],
          resources: ['Online Course', 'Mentorship', 'Practice Projects'],
          status: 'in-progress',
          progress: 40
        },
        {
          id: '2',
          title: 'Data Science Mastery',
          description: 'Complete data science and analytics program',
          duration: '8 months',
          difficulty: 'advanced',
          skills: ['Python', 'Statistics', 'Machine Learning'],
          resources: ['University Course', 'Online Platforms', 'Real Projects'],
          status: 'in-progress',
          progress: 65
        },
        {
          id: '3',
          title: 'AI/ML Professional',
          description: 'Advanced AI and machine learning certification',
          duration: '10 months',
          difficulty: 'advanced',
          skills: ['AI', 'Machine Learning', 'Deep Learning'],
          resources: ['Specialized Course', 'Research Papers', 'Competitions'],
          status: 'not-started',
          progress: 0
        }
      ];

      setMilestones(mockMilestones);
      setLearningPaths(mockLearningPaths);
      setLoading(false);
    };

    setTimeout(generateRoadmapData, 1000);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in-progress': return <Play className="h-5 w-5 text-blue-600" />;
      case 'paused': return <Pause className="h-5 w-5 text-yellow-600" />;
      case 'not-started': return <Clock className="h-5 w-5 text-gray-400" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-purple-600 bg-purple-100';
      case 'medium': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredMilestones = selectedCategory === 'all' 
    ? milestones 
    : milestones.filter(m => m.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Career Roadmap Overview */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-orange-900">
            <Rocket className="h-6 w-6" />
            <span>Career Development Roadmap</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Progress Overview */}
            <div className="space-y-4">
              <h4 className="font-semibold text-orange-900 mb-3">Overall Progress</h4>
              <div className="space-y-3">
                <div className="p-4 bg-white rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Career Goals</span>
                    <span className="text-sm text-orange-600 font-semibold">5 Active</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">35% Complete</div>
                </div>
                
                <div className="p-4 bg-white rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Skills Acquired</span>
                    <span className="text-sm text-green-600 font-semibold">12/25</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '48%' }}></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">48% Complete</div>
                </div>
              </div>
            </div>

            {/* Next Milestones */}
            <div className="space-y-4">
              <h4 className="font-semibold text-orange-900 mb-3">Next Milestones</h4>
              <div className="space-y-3">
                {milestones
                  .filter(m => m.status === 'in-progress')
                  .slice(0, 2)
                  .map((milestone) => (
                    <div key={milestone.id} className="p-3 bg-white rounded-lg border border-orange-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="h-4 w-4 text-orange-600" />
                        <h5 className="text-sm font-medium text-gray-900">{milestone.title}</h5>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Progress</span>
                          <span className="text-orange-600 font-semibold">{milestone.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${milestone.progress}%` }}></div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Due: {milestone.dueDate}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <h4 className="font-semibold text-orange-900 mb-3">Quick Actions</h4>
              <div className="space-y-3">
                <Button variant="outline" size="sm" className="w-full border-orange-300 text-orange-700 hover:bg-orange-50">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Start Learning
                </Button>
                <Button variant="outline" size="sm" className="w-full border-orange-300 text-orange-700 hover:bg-orange-50">
                  <Users className="h-4 w-4 mr-2" />
                  Find Mentor
                </Button>
                <Button variant="outline" size="sm" className="w-full border-orange-300 text-orange-700 hover:bg-orange-50">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Review
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Milestones Dashboard */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-900">
            <Target className="h-6 w-6" />
            <span>Career Milestones</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['all', 'skill', 'certification', 'experience', 'networking'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* Milestones Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMilestones.map((milestone, index) => (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-4 bg-white rounded-lg border border-blue-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(milestone.status)}
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm">{milestone.title}</h5>
                      <p className="text-xs text-gray-600">{milestone.category}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(milestone.priority)}`}>
                      {milestone.priority}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(milestone.impact)}`}>
                      {milestone.impact} impact
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 mb-3">{milestone.description}</p>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Progress</span>
                      <span className="text-blue-600 font-semibold">{milestone.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${milestone.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Timeline</span>
                    <span className="text-gray-700">{milestone.estimatedTime}</span>
                  </div>

                  <div className="pt-2 border-t border-blue-100">
                    <div className="flex flex-wrap gap-1">
                      {milestone.skills.slice(0, 3).map((skill, skillIndex) => (
                        <span key={skillIndex} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {milestone.status === 'in-progress' && (
                    <Button variant="outline" size="sm" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50">
                      Continue
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Learning Paths */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-emerald-900">
            <BookOpen className="h-6 w-6" />
            <span>Learning Paths</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {learningPaths.map((path, index) => (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-4 bg-white rounded-lg border border-emerald-200 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h5 className="font-medium text-gray-900">{path.title}</h5>
                  <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(path.difficulty)}`}>
                    {path.difficulty}
                  </span>
                </div>

                <p className="text-xs text-gray-600 mb-3">{path.description}</p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Duration</span>
                    <span className="text-emerald-600 font-medium">{path.duration}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Progress</span>
                      <span className="text-emerald-600 font-semibold">{path.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${path.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-emerald-100">
                    <div className="flex flex-wrap gap-1">
                      {path.skills.slice(0, 3).map((skill, skillIndex) => (
                        <span key={skillIndex} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-emerald-600 font-medium">View Path</span>
                    <ArrowRight className="h-3 w-3 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

