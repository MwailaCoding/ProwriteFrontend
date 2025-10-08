import React from 'react';

interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    linkedin: string;
  };
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    gpa: string;
  }>;
  skills: string[];
  certifications: string[];
  languages: string[];
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
}

interface FranciscaStyleTemplateProps {
  resumeData: ResumeData;
}

export const FranciscaStyleTemplate: React.FC<FranciscaStyleTemplateProps> = ({ resumeData }) => {
  return (
    <div className="francisca-template bg-white p-8 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div className="header-section mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{resumeData.personalInfo.name}</h1>
        <div className="contact-info text-gray-600 space-y-1">
          <p>{resumeData.personalInfo.email}</p>
          <p>{resumeData.personalInfo.phone}</p>
          <p>{resumeData.personalInfo.address}</p>
          {resumeData.personalInfo.linkedin && (
            <p>LinkedIn: {resumeData.personalInfo.linkedin}</p>
          )}
        </div>
      </div>

      {/* Summary */}
      {resumeData.summary && (
        <div className="section mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b-2 border-blue-500 pb-1">
            Professional Summary
          </h2>
          <p className="text-gray-700 leading-relaxed">{resumeData.summary}</p>
        </div>
      )}

      {/* Experience */}
      {resumeData.experience && resumeData.experience.length > 0 && (
        <div className="section mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b-2 border-blue-500 pb-1">
            Professional Experience
          </h2>
          <div className="space-y-4">
            {resumeData.experience.map((exp, index) => (
              <div key={index} className="experience-item">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{exp.title}</h3>
                  <span className="text-gray-600 text-sm">{exp.duration}</span>
                </div>
                <p className="text-blue-600 font-medium mb-2">{exp.company}</p>
                <p className="text-gray-700">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {resumeData.education && resumeData.education.length > 0 && (
        <div className="section mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b-2 border-blue-500 pb-1">
            Education
          </h2>
          <div className="space-y-3">
            {resumeData.education.map((edu, index) => (
              <div key={index} className="education-item">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{edu.degree}</h3>
                    <p className="text-blue-600 font-medium">{edu.institution}</p>
                    {edu.gpa && <p className="text-gray-600 text-sm">GPA: {edu.gpa}</p>}
                  </div>
                  <span className="text-gray-600 text-sm">{edu.year}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {resumeData.skills && resumeData.skills.length > 0 && (
        <div className="section mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b-2 border-blue-500 pb-1">
            Technical Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {resumeData.skills.map((skill, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {resumeData.projects && resumeData.projects.length > 0 && (
        <div className="section mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b-2 border-blue-500 pb-1">
            Projects
          </h2>
          <div className="space-y-4">
            {resumeData.projects.map((project, index) => (
              <div key={index} className="project-item">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.name}</h3>
                <p className="text-gray-700 mb-2">{project.description}</p>
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.map((tech, techIndex) => (
                      <span key={techIndex} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {resumeData.certifications && resumeData.certifications.length > 0 && (
        <div className="section mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b-2 border-blue-500 pb-1">
            Certifications
          </h2>
          <ul className="list-disc list-inside space-y-1">
            {resumeData.certifications.map((cert, index) => (
              <li key={index} className="text-gray-700">{cert}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Languages */}
      {resumeData.languages && resumeData.languages.length > 0 && (
        <div className="section mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b-2 border-blue-500 pb-1">
            Languages
          </h2>
          <div className="flex flex-wrap gap-2">
            {resumeData.languages.map((language, index) => (
              <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                {language}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FranciscaStyleTemplate;


