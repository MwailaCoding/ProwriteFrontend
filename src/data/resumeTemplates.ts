import { PDFTemplate } from '../types';

export interface ResumeTemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  templates: PDFTemplate[];
}

export const resumeTemplateCategories: ResumeTemplateCategory[] = [
  {
    id: 'prowrite-template',
    name: 'ProwriteTemplate Professional',
    description: 'Advanced dynamic form system with preserved template styling',
    icon: '✨',
    templates: [
      {
        id: 'prowrite-template-professional',
        name: 'ProwriteTemplate Professional Resume',
        description: 'Experience our advanced dynamic form system with preserved template styling. Add unlimited entries to any section with our enhanced array management features.',
        category: 'prowrite-template',
        thumbnailUrl: '/templates/prowrite-template-professional-thumb.jpg',
        pdfFile: '/templates/prowrite-template-professional.pdf',
        pageCount: 1,
        contentAreas: [
          {
            id: 'header-name',
            name: 'Full Name',
            formField: 'personalInfo.fullName',
            coordinates: { x: 50, y: 50, width: 200, height: 30, page: 1 },
            styling: { fontSize: 24, fontFamily: 'Arial', fontWeight: 'bold', color: '#2c3e50' },
            isRequired: true,
            placeholder: 'John Doe'
          },
          {
            id: 'header-title',
            name: 'Professional Title',
            formField: 'personalInfo.title',
            coordinates: { x: 50, y: 85, width: 200, height: 25, page: 1 },
            styling: { fontSize: 16, fontFamily: 'Arial', fontWeight: 'normal', color: '#7f8c8d' },
            isRequired: false,
            placeholder: 'Software Engineer'
          },
          {
            id: 'contact-email',
            name: 'Email',
            formField: 'personalInfo.email',
            coordinates: { x: 50, y: 120, width: 150, height: 20, page: 1 },
            styling: { fontSize: 12, fontFamily: 'Arial', fontWeight: 'normal', color: '#34495e' },
            isRequired: true,
            placeholder: 'john.doe@email.com'
          },
          {
            id: 'contact-phone',
            name: 'Phone',
            formField: 'personalInfo.phone',
            coordinates: { x: 220, y: 120, width: 120, height: 20, page: 1 },
            styling: { fontSize: 12, fontFamily: 'Arial', fontWeight: 'normal', color: '#34495e' },
            isRequired: true,
            placeholder: '+1 (555) 123-4567'
          },
          {
            id: 'summary',
            name: 'Professional Summary',
            formField: 'personalInfo.summary',
            coordinates: { x: 50, y: 160, width: 500, height: 60, page: 1 },
            styling: { fontSize: 12, fontFamily: 'Arial', fontWeight: 'normal', color: '#2c3e50' },
            isRequired: false,
            placeholder: 'Experienced professional with a proven track record...'
          }
        ],
        metadata: {
          pageCount: 1,
          orientation: 'portrait',
          pageSize: 'a4',
          colorScheme: 'prowrite-template',
          difficulty: 'advanced'
        },
        tags: ['dynamic', 'advanced', 'professional', 'style-preserved'],
        popularity: 100,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ]
  }
];

export const getAllTemplates = (): PDFTemplate[] => {
  return resumeTemplateCategories.flatMap(category => category.templates);
};

export const getTemplatesByCategory = (categoryId: string): PDFTemplate[] => {
  const category = resumeTemplateCategories.find(cat => cat.id === categoryId);
  return category ? category.templates : [];
};

export const getPopularTemplates = (limit: number = 5): PDFTemplate[] => {
  return getAllTemplates()
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, limit);
};

export const getTemplateById = (templateId: string): PDFTemplate | undefined => {
  return getAllTemplates().find(template => template.id === templateId);
};
