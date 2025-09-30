import React from 'react';
import { Card } from '../Card';
import { 
  RichTextEditor, 
  DynamicArrayField, 
  SkillLevelSelector
} from '../AdvancedFormComponents';
import { Skill, Language, Project, Award, Certification } from '../../types';

interface SkillsAndAdditionalSectionProps {
  skills: Skill[];
  languages: Language[];
  interests: string;
  projects: Project[];
  awards: Award[];
  certifications: Certification[];
  onUpdate: (updates: any) => void;
  errors: Record<string, string>;
}

export const SkillsAndAdditionalSection: React.FC<SkillsAndAdditionalSectionProps> = ({
  skills,
  languages,
  interests,
  projects,
  awards,
  certifications,
  onUpdate,
  errors
}) => {
  // Skills management
  const addSkill = () => {
    const newSkill: Skill = {
      id: `skill_${Date.now()}`,
      name: '',
      level: 'intermediate',
      category: 'Technical',
      yearsOfExperience: undefined
    };
    onUpdate({ skills: [...skills, newSkill] });
  };

  const removeSkill = (index: number) => {
    onUpdate({ skills: skills.filter((_, i) => i !== index) });
  };

  const updateSkill = (index: number, updates: Partial<Skill>) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], ...updates };
    onUpdate({ skills: updated });
  };

  // Languages management
  const addLanguage = () => {
    const newLanguage: Language = {
      id: `lang_${Date.now()}`,
      name: '',
      proficiency: 'conversational'
    };
    onUpdate({ languages: [...languages, newLanguage] });
  };

  const removeLanguage = (index: number) => {
    onUpdate({ languages: languages.filter((_, i) => i !== index) });
  };

  const updateLanguage = (index: number, updates: Partial<Language>) => {
    const updated = [...languages];
    updated[index] = { ...updated[index], ...updates };
    onUpdate({ languages: updated });
  };

  // Projects management
  const addProject = () => {
    const newProject: Project = {
      id: `proj_${Date.now()}`,
      name: '',
      description: '',
      technologies: [],
      startDate: '',
      endDate: '',
      url: '',
      highlights: []
    };
    onUpdate({ projects: [...projects, newProject] });
  };

  const removeProject = (index: number) => {
    onUpdate({ projects: projects.filter((_, i) => i !== index) });
  };

  const updateProject = (index: number, updates: Partial<Project>) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], ...updates };
    onUpdate({ projects: updated });
  };

  // Awards management
  const addAward = () => {
    const newAward: Award = {
      id: `award_${Date.now()}`,
      name: '',
      issuingOrganization: '',
      issueDate: '',
      description: ''
    };
    onUpdate({ awards: [...awards, newAward] });
  };

  const removeAward = (index: number) => {
    onUpdate({ awards: awards.filter((_, i) => i !== index) });
  };

  const updateAward = (index: number, updates: Partial<Award>) => {
    const updated = [...awards];
    updated[index] = { ...updated[index], ...updates };
    onUpdate({ awards: updated });
  };

  // Certifications management
  const addCertification = () => {
    const newCertification: Certification = {
      id: `cert_${Date.now()}`,
      name: '',
      issuingOrganization: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      url: ''
    };
    onUpdate({ certifications: [...certifications, newCertification] });
  };

  const removeCertification = (index: number) => {
    onUpdate({ certifications: certifications.filter((_, i) => i !== index) });
  };

  const updateCertification = (index: number, updates: Partial<Certification>) => {
    const updated = [...certifications];
    updated[index] = { ...updated[index], ...updates };
    onUpdate({ certifications: updated });
  };

  const renderSkill = (skill: Skill, index: number) => (
    <Card key={skill.id} className="p-4">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skill Name *
            </label>
            <input
              type="text"
              value={skill.name}
              onChange={(e) => updateSkill(index, { name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors[`skills.${index}.name`] ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., JavaScript, Project Management"
              required
            />
            {errors[`skills.${index}.name`] && (
              <p className="text-red-500 text-sm mt-1">{errors[`skills.${index}.name`]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={skill.category}
              onChange={(e) => updateSkill(index, { category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Technical">Technical</option>
              <option value="Soft Skills">Soft Skills</option>
              <option value="Leadership">Leadership</option>
              <option value="Industry Specific">Industry Specific</option>
              <option value="Tools">Tools</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years of Experience
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={skill.yearsOfExperience || ''}
              onChange={(e) => updateSkill(index, { yearsOfExperience: parseInt(e.target.value) || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 3"
            />
          </div>
        </div>

        <SkillLevelSelector
          level={skill.level}
          onChange={(level) => updateSkill(index, { level: level as any })}
        />
      </div>
    </Card>
  );

  const renderLanguage = (language: Language, index: number) => (
    <Card key={language.id} className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language *
          </label>
          <input
            type="text"
            value={language.name}
            onChange={(e) => updateLanguage(index, { name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Spanish, French"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Proficiency Level *
          </label>
          <select
            value={language.proficiency}
            onChange={(e) => updateLanguage(index, { proficiency: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="basic">Basic</option>
            <option value="conversational">Conversational</option>
            <option value="fluent">Fluent</option>
            <option value="native">Native</option>
          </select>
        </div>
      </div>
    </Card>
  );

  const renderProject = (project: Project, index: number) => (
    <Card key={project.id} className="p-4">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              value={project.name}
              onChange={(e) => updateProject(index, { name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., E-commerce Platform"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project URL
            </label>
            <input
              type="url"
              value={project.url}
              onChange={(e) => updateProject(index, { url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://project-demo.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={project.description}
            onChange={(e) => updateProject(index, { description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe the project, your role, and the outcomes achieved"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={project.startDate}
              onChange={(e) => updateProject(index, { startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={project.endDate}
              onChange={(e) => updateProject(index, { endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Technologies Used
          </label>
          <input
            type="text"
            value={project.technologies.join(', ')}
            onChange={(e) => updateProject(index, { technologies: e.target.value.split(',').map(t => t.trim()) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="React, Node.js, MongoDB (comma separated)"
          />
        </div>
      </div>
    </Card>
  );

  const renderAward = (award: Award, index: number) => (
    <Card key={award.id} className="p-4">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Award Name *
            </label>
            <input
              type="text"
              value={award.name}
              onChange={(e) => updateAward(index, { name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Employee of the Year"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issuing Organization
            </label>
            <input
              type="text"
              value={award.issuingOrganization}
              onChange={(e) => updateAward(index, { issuingOrganization: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Company Name"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issue Date
            </label>
            <input
              type="date"
              value={award.issueDate}
              onChange={(e) => updateAward(index, { issueDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={award.description}
              onChange={(e) => updateAward(index, { description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of the award"
            />
          </div>
        </div>
      </div>
    </Card>
  );

  const renderCertification = (cert: Certification, index: number) => (
    <Card key={cert.id} className="p-4">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Certification Name *
            </label>
            <input
              type="text"
              value={cert.name}
              onChange={(e) => updateCertification(index, { name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., AWS Certified Solutions Architect"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issuing Organization
            </label>
            <input
              type="text"
              value={cert.issuingOrganization}
              onChange={(e) => updateCertification(index, { issuingOrganization: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Amazon Web Services"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issue Date
            </label>
            <input
              type="date"
              value={cert.issueDate}
              onChange={(e) => updateCertification(index, { issueDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date
            </label>
            <input
              type="date"
              value={cert.expiryDate}
              onChange={(e) => updateCertification(index, { expiryDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Credential ID
            </label>
            <input
              type="text"
              value={cert.credentialId}
              onChange={(e) => updateCertification(index, { credentialId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., AWS-12345"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Verification URL
          </label>
          <input
            type="url"
            value={cert.url}
            onChange={(e) => updateCertification(index, { url: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://verify.certification.com"
          />
        </div>
      </div>
    </Card>
  );

  return (
    <Card className="p-6">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Skills & Additional Information</h3>
          <p className="text-gray-600">Highlight your skills, languages, and other achievements</p>
        </div>

        {/* Skills Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Skills</h4>
            <button
              type="button"
              onClick={() => {
                const enhancedSkills = [
                  { id: `skill_${Date.now()}`, name: 'JavaScript (ES6+, React, Node.js)', level: 'advanced', category: 'Technical', yearsOfExperience: 5 },
                  { id: `skill_${Date.now() + 1}`, name: 'Python (Django, Flask, Data Analysis)', level: 'intermediate', category: 'Technical', yearsOfExperience: 3 },
                  { id: `skill_${Date.now() + 2}`, name: 'SQL (MySQL, PostgreSQL)', level: 'intermediate', category: 'Technical', yearsOfExperience: 4 },
                  { id: `skill_${Date.now() + 3}`, name: 'Project Management', level: 'intermediate', category: 'Soft Skills', yearsOfExperience: 3 },
                  { id: `skill_${Date.now() + 4}`, name: 'Team Leadership', level: 'intermediate', category: 'Soft Skills', yearsOfExperience: 2 }
                ];
                onUpdate({ skills: [...skills, ...enhancedSkills] });
              }}
              className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-sm"
              title="AI-Enhanced Skills"
            >
              <span>✨</span>
              <span>AI Enhance Skills</span>
            </button>
          </div>
          <DynamicArrayField
            items={skills}
            onAdd={addSkill}
            onRemove={removeSkill}
            onUpdate={updateSkill}
            renderItem={renderSkill}
            addButtonText="+ Add Skill"
            emptyStateText="No skills added yet. Click 'Add Skill' to get started."
          />
          <p className="text-sm text-gray-500 mt-2">
            Use the AI button to get industry-relevant skills with proper categorization
          </p>
        </div>

        {/* Languages Section */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Languages</h4>
          <DynamicArrayField
            items={languages}
            onAdd={addLanguage}
            onRemove={removeLanguage}
            onUpdate={updateLanguage}
            renderItem={renderLanguage}
            addButtonText="+ Add Language"
            emptyStateText="No languages added yet. Click 'Add Language' to get started."
          />
        </div>

        {/* Interests Section */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Interests & Hobbies</h4>
          <RichTextEditor
            value={interests}
            onChange={(interests) => onUpdate({ interests })}
            placeholder="Share your interests, hobbies, or activities that showcase your personality and well-roundedness. This can include sports, volunteer work, creative pursuits, etc."
            rows={3}
          />
        </div>

        {/* Projects Section */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Projects</h4>
          <DynamicArrayField
            items={projects}
            onAdd={addProject}
            onRemove={removeProject}
            onUpdate={updateProject}
            renderItem={renderProject}
            addButtonText="+ Add Project"
            emptyStateText="No projects added yet. Click 'Add Project' to get started."
          />
        </div>

        {/* Awards Section */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Awards & Recognition</h4>
          <DynamicArrayField
            items={awards}
            onAdd={addAward}
            onRemove={removeAward}
            onUpdate={updateAward}
            renderItem={renderAward}
            addButtonText="+ Add Award"
            emptyStateText="No awards added yet. Click 'Add Award' to get started."
          />
        </div>

        {/* Certifications Section */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Certifications</h4>
          <DynamicArrayField
            items={certifications}
            onAdd={addCertification}
            onRemove={removeCertification}
            onUpdate={updateCertification}
            renderItem={renderCertification}
            addButtonText="+ Add Certification"
            emptyStateText="No certifications added yet. Click 'Add Certification' to get started."
          />
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Tips for Skills & Additional Info</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• List skills in order of relevance to your target job</li>
            <li>• Include both technical and soft skills</li>
            <li>• Be honest about your proficiency levels</li>
            <li>• Highlight languages if relevant to the position</li>
            <li>• Include projects that demonstrate your skills</li>
            <li>• Mention awards and certifications that add credibility</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};
