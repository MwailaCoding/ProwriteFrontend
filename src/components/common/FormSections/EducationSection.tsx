import React from 'react';
import { Card } from '../Card';
import { 
  RichTextEditor, 
  DynamicArrayField, 
  DateRangeField,
  LocationField
} from '../AdvancedFormComponents';
import { Education } from '../../types';

interface EducationSectionProps {
  education: Education[];
  onUpdate: (updates: Education[]) => void;
  errors: Record<string, string>;
}

export const EducationSection: React.FC<EducationSectionProps> = ({
  education,
  onUpdate,
  errors
}) => {
  const addEducation = () => {
    const newEducation: Education = {
      id: `edu_${Date.now()}`,
      degree: '',
      fieldOfStudy: '',
      institution: '',
      city: '',
      country: '',
      startDate: '',
      endDate: '',
      current: false,
      gpa: '',
      description: '',
      relevantCourses: []
    };
    onUpdate([...education, newEducation]);
  };

  const removeEducation = (index: number) => {
    onUpdate(education.filter((_, i) => i !== index));
  };

  const updateEducation = (index: number, updates: Partial<Education>) => {
    const updated = [...education];
    updated[index] = { ...updated[index], ...updates };
    onUpdate(updated);
  };

  const addRelevantCourse = (index: number) => {
    const updated = [...education];
    updated[index].relevantCourses = [...(updated[index].relevantCourses || []), ''];
    onUpdate(updated);
  };

  const removeRelevantCourse = (eduIndex: number, courseIndex: number) => {
    const updated = [...education];
    updated[eduIndex].relevantCourses = updated[eduIndex].relevantCourses?.filter((_, i) => i !== courseIndex);
    onUpdate(updated);
  };

  const updateRelevantCourse = (eduIndex: number, courseIndex: number, value: string) => {
    const updated = [...education];
    if (updated[eduIndex].relevantCourses) {
      updated[eduIndex].relevantCourses![courseIndex] = value;
      onUpdate(updated);
    }
  };

  const renderEducation = (edu: Education, index: number) => (
    <Card key={edu.id} className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900">
            Education #{index + 1}
          </h4>
          <div className="text-sm text-gray-500">
            {edu.current ? 'Currently Studying' : 'Completed'}
          </div>
        </div>

        {/* Degree Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Degree/Certificate *
            </label>
            <input
              type="text"
              value={edu.degree}
              onChange={(e) => updateEducation(index, { degree: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors[`education.${index}.degree`] ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Bachelor of Science"
              required
            />
            {errors[`education.${index}.degree`] && (
              <p className="text-red-500 text-sm mt-1">{errors[`education.${index}.degree`]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Field of Study *
            </label>
            <input
              type="text"
              value={edu.fieldOfStudy}
              onChange={(e) => updateEducation(index, { fieldOfStudy: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors[`education.${index}.fieldOfStudy`] ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Computer Science"
              required
            />
            {errors[`education.${index}.fieldOfStudy`] && (
              <p className="text-red-500 text-sm mt-1">{errors[`education.${index}.fieldOfStudy`]}</p>
            )}
          </div>
        </div>

        {/* Institution Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Institution/University *
          </label>
          <input
            type="text"
            value={edu.institution}
            onChange={(e) => updateEducation(index, { institution: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors[`education.${index}.institution`] ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Stanford University"
            required
          />
          {errors[`education.${index}.institution`] && (
            <p className="text-red-500 text-sm mt-1">{errors[`education.${index}.institution`]}</p>
          )}
        </div>

        {/* Location */}
        <LocationField
          city={edu.city}
          country={edu.country}
          onCityChange={(city) => updateEducation(index, { city })}
          onCountryChange={(country) => updateEducation(index, { country })}
        />

        {/* Date Range */}
        <DateRangeField
          startDate={edu.startDate}
          endDate={edu.endDate}
          isCurrent={edu.current}
          onStartDateChange={(startDate) => updateEducation(index, { startDate })}
          onEndDateChange={(endDate) => updateEducation(index, { endDate })}
          onCurrentChange={(current) => updateEducation(index, { current })}
          startLabel="Start Date"
          endLabel="Graduation Date"
        />

        {/* GPA */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GPA (Optional)
          </label>
          <input
            type="text"
            value={edu.gpa}
            onChange={(e) => updateEducation(index, { gpa: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., 3.8/4.0 or 4.2/5.0"
          />
          <p className="text-sm text-gray-500 mt-1">
            Include your GPA if it's 3.5 or higher, or if specifically requested
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Academic Description
          </label>
          <RichTextEditor
            value={edu.description}
            onChange={(description) => updateEducation(index, { description })}
            placeholder="Describe your academic achievements, research projects, thesis work, or any notable academic accomplishments. Include honors, awards, or special recognition."
            rows={4}
          />
        </div>

        {/* Relevant Courses */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Relevant Courses
          </label>
          <div className="space-y-3">
            {edu.relevantCourses?.map((course, courseIndex) => (
              <div key={courseIndex} className="flex items-center space-x-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => updateRelevantCourse(index, courseIndex, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Advanced Algorithms, Machine Learning, Database Systems"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeRelevantCourse(index, courseIndex)}
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
              onClick={() => addRelevantCourse(index)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              + Add Course
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
          <h3 className="text-2xl font-bold text-gray-900">Education & Qualifications</h3>
          <p className="text-gray-600">Showcase your academic background and achievements</p>
        </div>

        {/* Education List */}
        <DynamicArrayField
          items={education}
          onAdd={addEducation}
          onRemove={removeEducation}
          onUpdate={updateEducation}
          renderItem={renderEducation}
          addButtonText="+ Add Education"
          emptyStateText="No education added yet. Click 'Add Education' to get started."
        />

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Tips for Education Section</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• List education in reverse chronological order (most recent first)</li>
            <li>• Include relevant coursework that relates to your target job</li>
            <li>• Mention academic honors, awards, or special recognition</li>
            <li>• Include research projects, thesis work, or capstone projects</li>
            <li>• Only include GPA if it's 3.5+ or specifically requested</li>
            <li>• For recent graduates, education can be listed before work experience</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};
