import React from 'react';
import { getAllTemplates, resumeTemplateCategories } from '../../data/resumeTemplates';

export const TemplateTest: React.FC = () => {
  const templates = getAllTemplates();
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Template Test</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Template Categories ({resumeTemplateCategories.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumeTemplateCategories.map((category) => (
            <div key={category.id} className="border rounded-lg p-4">
              <div className="text-2xl mb-2">{category.icon}</div>
              <h3 className="font-semibold">{category.name}</h3>
              <p className="text-sm text-gray-600">{category.description}</p>
              <p className="text-sm text-gray-500 mt-2">{category.templates.length} templates</p>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-lg font-semibold mb-2">All Templates ({templates.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div key={template.id} className="border rounded-lg p-4">
              <h3 className="font-semibold">{template.name}</h3>
              <p className="text-sm text-gray-600">{template.description}</p>
              <p className="text-sm text-gray-500">Category: {template.category}</p>
              <p className="text-sm text-gray-500">Difficulty: {template.metadata.difficulty}</p>
              <p className="text-sm text-gray-500">Popularity: {template.popularity}%</p>
              <p className="text-sm text-gray-500">Pages: {template.pageCount}</p>
              <p className="text-sm text-gray-500">Content Areas: {template.contentAreas.length}</p>
              <p className="text-sm text-gray-500">Tags: {template.tags.join(', ')}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Debug Info</h3>
        <pre className="text-xs overflow-auto">
          {JSON.stringify({ 
            totalTemplates: templates.length, 
            categories: resumeTemplateCategories.length,
            sampleTemplate: templates[0] 
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
};





































