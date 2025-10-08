import React from 'react';
import { Card } from '../Card';
import { 
  RichTextEditor, 
  DynamicArrayField, 
  DateRangeField,
  LocationField
} from '../AdvancedFormComponents';
import { WorkExperience } from '../../types';

interface WorkExperienceSectionProps {
  workExperience: WorkExperience[];
  onUpdate: (updates: WorkExperience[]) => void;
  errors: Record<string, string>;
}

export const WorkExperienceSection: React.FC<WorkExperienceSectionProps> = ({
  workExperience,
  onUpdate,
  errors
}) => {
  const addWorkExperience = () => {
    const newExperience: WorkExperience = {
      id: `exp_${Date.now()}`,
      jobTitle: '',
      employer: '',
      city: '',
      country: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      achievements: [],
      skills: []
    };
    onUpdate([...workExperience, newExperience]);
  };

  const removeWorkExperience = (index: number) => {
    onUpdate(workExperience.filter((_, i) => i !== index));
  };

  const updateWorkExperience = (index: number, updates: Partial<WorkExperience>) => {
    const updated = [...workExperience];
    updated[index] = { ...updated[index], ...updates };
    onUpdate(updated);
  };

  const addAchievement = (index: number) => {
    const updated = [...workExperience];
    updated[index].achievements = [...(updated[index].achievements || []), ''];
    onUpdate(updated);
  };

  const removeAchievement = (expIndex: number, achievementIndex: number) => {
    const updated = [...workExperience];
    updated[expIndex].achievements = updated[expIndex].achievements?.filter((_, i) => i !== achievementIndex);
    onUpdate(updated);
  };

  const updateAchievement = (expIndex: number, achievementIndex: number, value: string) => {
    const updated = [...workExperience];
    if (updated[expIndex].achievements) {
      updated[expIndex].achievements![achievementIndex] = value;
      onUpdate(updated);
    }
  };

  const addSkill = (index: number) => {
    const updated = [...workExperience];
    updated[index].skills = [...(updated[index].skills || []), ''];
    onUpdate(updated);
  };

  const removeSkill = (expIndex: number, skillIndex: number) => {
    const updated = [...workExperience];
    updated[expIndex].skills = updated[expIndex].skills?.filter((_, i) => i !== skillIndex);
    onUpdate(updated);
  };

  const updateSkill = (expIndex: number, skillIndex: number, value: string) => {
    const updated = [...workExperience];
    if (updated[expIndex].skills) {
      updated[expIndex].skills![skillIndex] = value;
      onUpdate(updated);
    }
  };

  const renderWorkExperience = (exp: WorkExperience, index: number) => (
    <Card key={exp.id} className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900">
            Work Experience #{index + 1}
          </h4>
          <div className="text-sm text-gray-500">
            {exp.current ? 'Current Position' : 'Previous Position'}
          </div>
        </div>

        {/* Job Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title *
            </label>
            <input
              type="text"
              value={exp.jobTitle}
              onChange={(e) => updateWorkExperience(index, { jobTitle: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors[`workExperience.${index}.jobTitle`] ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Senior Software Engineer"
              required
            />
            {errors[`workExperience.${index}.jobTitle`] && (
              <p className="text-red-500 text-sm mt-1">{errors[`workExperience.${index}.jobTitle`]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employer/Company *
            </label>
            <input
              type="text"
              value={exp.employer}
              onChange={(e) => updateWorkExperience(index, { employer: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors[`workExperience.${index}.employer`] ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Google Inc."
              required
            />
            {errors[`workExperience.${index}.employer`] && (
              <p className="text-red-500 text-sm mt-1">{errors[`workExperience.${index}.employer`]}</p>
            )}
          </div>
        </div>

        {/* Location */}
        <LocationField
          city={exp.city}
          country={exp.country}
          onCityChange={(city) => updateWorkExperience(index, { city })}
          onCountryChange={(country) => updateWorkExperience(index, { country })}
        />

        {/* Date Range */}
        <DateRangeField
          startDate={exp.startDate}
          endDate={exp.endDate}
          isCurrent={exp.current}
          onStartDateChange={(startDate) => updateWorkExperience(index, { startDate })}
          onEndDateChange={(endDate) => updateWorkExperience(index, { endDate })}
          onCurrentChange={(current) => updateWorkExperience(index, { current })}
          startLabel="Start Date"
          endLabel="End Date"
        />

        {/* Job Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Description *
          </label>
          <RichTextEditor
            value={exp.description}
            onChange={(description) => updateWorkExperience(index, { description })}
            placeholder="Describe your responsibilities, achievements, and the impact you made in this role. Use action verbs and quantify results when possible."
            rows={6}
          />
          {errors[`workExperience.${index}.description`] && (
            <p className="text-red-500 text-sm mt-1">{errors[`workExperience.${index}.description`]}</p>
          )}
        </div>

        {/* Key Achievements */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Key Achievements
          </label>
          <div className="space-y-3">
            {exp.achievements?.map((achievement, achievementIndex) => (
              <div key={achievementIndex} className="flex items-center space-x-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={achievement}
                    onChange={(e) => updateAchievement(index, achievementIndex, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Increased team productivity by 25% through process optimization"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeAchievement(index, achievementIndex)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addAchievement(index)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              + Add Achievement
            </button>
          </div>
        </div>

        {/* Skills Used */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Skills & Technologies Used
          </label>
          <div className="space-y-3">
            {exp.skills?.map((skill, skillIndex) => (
              <div key={skillIndex} className="flex items-center space-x-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => updateSkill(index, skillIndex, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., React, Node.js, AWS"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSkill(index, skillIndex)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addSkill(index)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              + Add Skill
            </button>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Work Experience</h3>
          <p className="text-gray-600">Showcase your professional journey and achievements</p>
        </div>

        {/* Resume Objective */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Professional Summary / Resume Objective
          </label>
          <div className="relative">
            <RichTextEditor
              value={workExperience.length > 0 ? workExperience[0]?.description || '' : ''}
              onChange={(description) => {
                if (workExperience.length > 0) {
                  updateWorkExperience(0, { description });
                }
              }}
              placeholder="Write a compelling professional summary that highlights your key strengths, career goals, and what makes you unique. This should be 2-3 sentences that grab the reader's attention."
              rows={4}
            />
            <button
              type="button"
              onClick={() => {
                if (workExperience.length > 0) {
                  updateWorkExperience(0, { 
                    description: 'Results-driven software developer with 5+ years of experience in web development, specializing in React, Node.js, and cloud technologies. Proven track record of delivering scalable solutions and leading cross-functional teams to achieve business objectives. Passionate about creating innovative user experiences and optimizing application performance.' 
                  });
                }
              }}
              className="absolute right-2 top-2 p-2 text-gray-400 hover:text-blue-600 transition-colors bg-white rounded border shadow-sm"
              title="AI-Enhanced Summary"
            >
              ✨
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Use the AI button (✨) to get an enhanced professional summary
          </p>
        </div>

        {/* Work Experience List */}
        <DynamicArrayField
          items={workExperience}
          onAdd={addWorkExperience}
          onRemove={removeWorkExperience}
          onUpdate={updateWorkExperience}
          renderItem={renderWorkExperience}
          addButtonText="+ Add Work Experience"
          emptyStateText="No work experience added yet. Click 'Add Work Experience' to get started."
        />

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Tips for Work Experience</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Use action verbs to start each bullet point (e.g., "Developed", "Led", "Implemented")</li>
            <li>• Quantify your achievements with numbers and percentages when possible</li>
            <li>• Focus on results and impact, not just responsibilities</li>
            <li>• Include relevant skills and technologies used in each role</li>
            <li>• List experiences in reverse chronological order (most recent first)</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};
