import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StreamlinedCoverLetterBuilder } from '../../components/cover-letters/StreamlinedCoverLetterBuilder';

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
    <StreamlinedCoverLetterBuilder 
      onSuccess={handleSuccess}
      onClose={handleClose}
    />
  );
};
