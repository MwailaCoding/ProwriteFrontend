import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CoverLetterBuilder } from '../../components/cover-letters/CoverLetterBuilder';

export const CreateCoverLetterPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = (coverLetterId: number) => {
    // Navigate back to cover letters page with success message
            navigate('/app/cover-letters', { 
          state: { 
            message: 'Cover letter created successfully!',
            coverLetterId 
          } 
        });
  };

      const handleClose = () => {
      navigate('/app/cover-letters');
    };

  return (
    <CoverLetterBuilder 
      onSuccess={handleSuccess}
      onClose={handleClose}
    />
  );
};
