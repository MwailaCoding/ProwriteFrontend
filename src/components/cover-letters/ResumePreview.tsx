import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../common/Card';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Code, 
  Award, 
  Globe, 
  MapPin, 
  Mail, 
  Phone,
  Linkedin,
  Calendar,
  Building
} from 'lucide-react';
import { ParsedResume } from '../../services/resumeService';

interface ResumePreviewProps {
  parsedResume: ParsedResume;
  className?: string;
  compact?: boolean;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  parsedResume,
  className = '',
  compact = false
}) => {
  const { parsed_data } = parsedResume;

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

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`space-y-6 ${className}`}
    >
      {/* Header with Personal Info */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {parsed_data.personal_info?.name || 'Name Not Found'}
              </h2>
              {parsed_data.summary && (
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {parsed_data.summary}
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                {parsed_data.personal_info?.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{parsed_data.personal_info.email}</span>
                  </div>
                )}
                {parsed_data.personal_info?.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{parsed_data.personal_info.phone}</span>
                  </div>
                )}
                {parsed_data.personal_info?.address && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{parsed_data.personal_info.address}</span>
                  </div>
                )}
                {parsed_data.personal_info?.linkedin && (
                  <div className="flex items-center space-x-2">
                    <Linkedin className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{parsed_data.personal_info.linkedin}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Experience Section */}
      {parsed_data.experience && parsed_data.experience.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Briefcase className="w-6 h-6 text-blue-500" />
              <h3 className="text-xl font-semibold text-gray-900">Professional Experience</h3>
            </div>
            <div className="space-y-4">
              {parsed_data.experience.map((exp, index) => (
                <div key={index} className="border-l-4 border-blue-200 pl-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{exp.duration}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-700">{exp.company}</span>
                  </div>
                  {!compact && exp.description && (
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Education Section */}
      {parsed_data.education && parsed_data.education.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <GraduationCap className="w-6 h-6 text-green-500" />
              <h3 className="text-xl font-semibold text-gray-900">Education</h3>
            </div>
            <div className="space-y-4">
              {parsed_data.education.map((edu, index) => (
                <div key={index} className="border-l-4 border-green-200 pl-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{edu.year}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-700">{edu.institution}</span>
                  </div>
                  {edu.gpa && (
                    <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Skills Section */}
      {parsed_data.skills && parsed_data.skills.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Code className="w-6 h-6 text-purple-500" />
              <h3 className="text-xl font-semibold text-gray-900">Skills</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {parsed_data.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Projects Section */}
      {parsed_data.projects && parsed_data.projects.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Code className="w-6 h-6 text-orange-500" />
              <h3 className="text-xl font-semibold text-gray-900">Projects</h3>
            </div>
            <div className="space-y-4">
              {parsed_data.projects.map((project, index) => (
                <div key={index} className="border-l-4 border-orange-200 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{project.name}</h4>
                  {!compact && project.description && (
                    <p className="text-gray-600 text-sm mb-2 leading-relaxed">
                      {project.description}
                    </p>
                  )}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Certifications Section */}
      {parsed_data.certifications && parsed_data.certifications.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Award className="w-6 h-6 text-yellow-500" />
              <h3 className="text-xl font-semibold text-gray-900">Certifications</h3>
            </div>
            <div className="space-y-2">
              {parsed_data.certifications.map((cert, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span className="text-gray-700">{cert}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Languages Section */}
      {parsed_data.languages && parsed_data.languages.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="w-6 h-6 text-teal-500" />
              <h3 className="text-xl font-semibold text-gray-900">Languages</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {parsed_data.languages.map((language, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium"
                >
                  {language}
                </span>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};


















