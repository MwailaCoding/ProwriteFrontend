import React from 'react';

interface CoverLetterTemplateProps {
  // Personal Information
  personalName: string;
  personalAddress: string;
  personalPhone: string;
  personalEmail: string;
  linkedinProfile?: string;
  
  // Date
  date: string;
  
  // Employer Information
  employerName: string;
  companyName: string;
  companyAddress: string;
  
  // Job Information
  jobTitle: string;
  jobBoard?: string;
  
  // Content
  introduction: string;
  experience: string;
  companyFit: string;
  closing: string;
  
  // Advanced Options
  fontSize?: 'small' | 'medium' | 'large';
  lineSpacing?: 'single' | '1.5' | 'double';
  marginSize?: 'narrow' | 'standard' | 'wide';
  fontFamily?: 'arial' | 'times' | 'calibri' | 'georgia';
}

export const CoverLetterTemplate: React.FC<CoverLetterTemplateProps> = ({
  personalName,
  personalAddress,
  personalPhone,
  personalEmail,
  linkedinProfile,
  date,
  employerName,
  companyName,
  companyAddress,
  jobTitle,
  jobBoard,
  introduction,
  experience,
  companyFit,
  closing,
  fontSize = 'medium',
  lineSpacing = '1.5',
  marginSize = 'standard',
  fontFamily = 'arial'
}) => {
  const getFontSize = () => {
    switch (fontSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      default: return 'text-base';
    }
  };

  const getLineSpacing = () => {
    switch (lineSpacing) {
      case 'single': return 'leading-tight';
      case 'double': return 'leading-loose';
      default: return 'leading-relaxed';
    }
  };

  const getMarginSize = () => {
    switch (marginSize) {
      case 'narrow': return 'mx-8 my-6';
      case 'wide': return 'mx-4 my-8';
      default: return 'mx-6 my-6';
    }
  };

  const getFontFamily = () => {
    switch (fontFamily) {
      case 'times': return 'font-serif';
      case 'calibri': return 'font-sans';
      case 'georgia': return 'font-serif';
      default: return 'font-sans';
    }
  };

  return (
    <div className={`bg-white border-2 border-gray-600 p-4 sm:p-6 lg:p-8 ${getMarginSize()} ${getFontFamily()} ${getFontSize()} ${getLineSpacing()} min-w-[280px] sm:min-w-[400px] lg:min-w-[500px]`}>
      {/* Personal Contact Information - Top Left */}
      <div className="mb-4 sm:mb-6">
        <div className="text-left">
          <div className="font-semibold">{personalName}</div>
          <div className="whitespace-pre-line">{personalAddress}</div>
          <div>{personalPhone}</div>
          <div>{personalEmail}</div>
          {linkedinProfile && <div className="break-all">{linkedinProfile}</div>}
        </div>
      </div>

      {/* Date */}
      <div className="mb-4 sm:mb-6 text-left">
        <div>{date}</div>
      </div>

      {/* Employer Information */}
      <div className="mb-4 sm:mb-6 text-left">
        <div className="font-semibold">{employerName}</div>
        <div>{companyName}</div>
        <div className="whitespace-pre-line">{companyAddress}</div>
      </div>

      {/* Salutation */}
      <div className="mb-3 sm:mb-4 text-left">
        <div>Dear {employerName},</div>
      </div>

      {/* Body Paragraphs */}
      <div className="space-y-3 sm:space-y-4 text-left">
        {/* Introduction Paragraph */}
        <div className="text-justify">
          {introduction}
        </div>

        {/* Experience Paragraph */}
        <div className="text-justify">
          {experience}
        </div>

        {/* Company Fit Paragraph */}
        <div className="text-justify">
          {companyFit}
        </div>

        {/* Closing Paragraph */}
        <div className="text-justify">
          {closing}
        </div>
      </div>

      {/* Closing */}
      <div className="mt-6 sm:mt-8 text-left">
        <div>Sincerely,</div>
        <div className="mt-3 sm:mt-4 font-semibold">{personalName}</div>
      </div>
    </div>
  );
};

// Template with placeholders for the builder
export const CoverLetterTemplateWithPlaceholders: React.FC<CoverLetterTemplateProps> = (props) => {
  const defaultProps = {
    personalName: '[Your Name]',
    personalAddress: '[Your Address]\n[City, Postal Code]',
    personalPhone: '[Phone Number]',
    personalEmail: '[Email Address]',
    linkedinProfile: '[LinkedIn Profile (optional)]',
    date: '[Date]',
    employerName: '[Hiring Manager\'s Name]',
    companyName: '[Company Name]',
    companyAddress: '[Company Address]\n[City, Postal Code]',
    jobTitle: '[Job Title]',
    jobBoard: '[Job Board/Company Website]',
    introduction: `I am writing to express my interest in the ${props.jobTitle || '[Job Title]'} position at ${props.companyName || '[Company Name]'}, as advertised on ${props.jobBoard || '[Job Board/Company Website]'}. With my [your field/skills] and [relevant interest connected to the role], I am confident in my ability to make a strong contribution to your team.`,
    experience: `In my most recent role as [Your Most Recent Role/Experience] at [Company/Organization Name], I [describe a key achievement, responsibility, or project that shows your skills and impact - use numbers if possible]. This experience strengthened my [specific skill required in the new role] and taught me the importance of [value or principle relevant to the company's mission].`,
    companyFit: `What excites me most about ${props.companyName || '[Company Name]'} is [something specific about the company — culture, innovation, mission, impact, etc.]. My [list 2-3 key skills] align perfectly with your needs, and I am eager to contribute to [specific project/goal of the company].`,
    closing: `I welcome the opportunity to discuss my background, skills, and enthusiasm for this role. Thank you for considering my application. I look forward to contributing to ${props.companyName || '[Company Name]\'s'} continued success.`,
    ...props
  };

  return <CoverLetterTemplate {...defaultProps} />;
};

