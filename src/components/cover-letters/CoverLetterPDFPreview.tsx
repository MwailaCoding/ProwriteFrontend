import React from 'react';

interface CoverLetterPDFPreviewProps {
  personalName: string;
  personalAddress: string;
  personalEmail: string;
  personalPhone: string;
  linkedinProfile: string;
  employerName: string;
  companyName: string;
  employerAddress: string;
  jobTitle: string;
  jobBoard: string;
  introduction: string;
  experience: string;
  companyFit: string;
  closing: string;
}

export const CoverLetterPDFPreview: React.FC<CoverLetterPDFPreviewProps> = ({
  personalName,
  personalAddress,
  personalEmail,
  personalPhone,
  linkedinProfile,
  employerName,
  companyName,
  employerAddress,
  jobTitle,
  jobBoard,
  introduction,
  experience,
  companyFit,
  closing
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const formatAddress = (address: string) => {
    if (!address) return '';
    return address.split('\n').map((line, index) => (
      <div key={index}>{line}</div>
    ));
  };

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Personal Information - Top Left */}
      <div className="mb-6">
        <div className="text-lg font-bold text-black mb-2">
          {personalName || '[Your Name]'}
        </div>
        <div className="text-sm text-black space-y-1">
          {personalAddress && (
            <div>{formatAddress(personalAddress)}</div>
          )}
          {personalPhone && (
            <div>{personalPhone}</div>
          )}
          {personalEmail && (
            <div>{personalEmail}</div>
          )}
          {linkedinProfile && (
            <div>{linkedinProfile}</div>
          )}
        </div>
      </div>

      {/* Date - Top Right */}
      <div className="text-right text-sm text-black mb-6">
        {currentDate}
      </div>

      {/* Employer Information */}
      <div className="mb-6">
        <div className="text-sm font-bold text-black mb-1">
          {employerName || '[Hiring Manager\'s Name]'}
        </div>
        <div className="text-sm text-black space-y-1">
          {companyName && (
            <div>{companyName}</div>
          )}
          {employerAddress && (
            <div>{formatAddress(employerAddress)}</div>
          )}
        </div>
      </div>

      {/* Salutation */}
      <div className="mb-4">
        <div className="text-sm text-black">
          Dear {employerName || '[Hiring Manager\'s Name]'},
        </div>
      </div>

      {/* Body Paragraphs */}
      <div className="space-y-4 mb-6">
        {/* Introduction Paragraph */}
        {introduction && (
          <div className="text-sm text-black leading-relaxed">
            {introduction}
          </div>
        )}

        {/* Experience Paragraph */}
        {experience && (
          <div className="text-sm text-black leading-relaxed">
            {experience}
          </div>
        )}

        {/* Company Fit Paragraph */}
        {companyFit && (
          <div className="text-sm text-black leading-relaxed">
            {companyFit}
          </div>
        )}

        {/* Closing Paragraph */}
        {closing && (
          <div className="text-sm text-black leading-relaxed">
            {closing}
          </div>
        )}

        {/* Default content if no paragraphs are filled */}
        {!introduction && !experience && !companyFit && !closing && (
          <div className="space-y-4">
            <div className="text-sm text-black leading-relaxed">
              I am writing to express my interest in the {jobTitle || '[Job Title]'} position at {companyName || '[Company Name]'}, as advertised on {jobBoard || '[Job Board/Company Website]'}. With my background in [your field/skills] and a passion for [relevant interest connected to the role], I am confident that I can make a strong contribution to your team.
            </div>
            
            <div className="text-sm text-black leading-relaxed">
              In my previous role as [Your Most Recent Role/Experience] at [Company/Organization Name], I [describe a key achievement, responsibility, or project that shows your skills and impact—use numbers if possible]. This experience strengthened my ability to [specific skill required in the new role] and taught me the importance of [value or principle relevant to the company's mission].
            </div>
            
            <div className="text-sm text-black leading-relaxed">
              What excites me most about {companyName || '[Company Name]'} is [something specific about the company—culture, innovation, mission, impact, etc.]. I believe my skills in [list 2-3 key skills] align closely with your needs, and I am eager to contribute to [specific project/goal of the company].
            </div>
            
            <div className="text-sm text-black leading-relaxed">
              I would welcome the opportunity to discuss how my background, skills, and enthusiasm can add value to your team. Thank you for considering my application. I look forward to the possibility of contributing to {companyName || '[Company Name]'}'s continued success.
            </div>
          </div>
        )}
      </div>

      {/* Closing */}
      <div className="mb-4">
        <div className="text-sm text-black">
          Sincerely,
        </div>
      </div>

      {/* Signature */}
      <div className="mt-6">
        <div className="text-sm text-black">
          {personalName || '[Your Full Name]'}
        </div>
      </div>
    </div>
  );
};
