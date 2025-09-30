import React from 'react';
import RealJobSearch from '../../components/jobs/RealJobSearch';
import { RealJob } from '../../services/realJobService';

const RealJobSearchPage: React.FC = () => {
  const handleJobSelect = (job: RealJob) => {
    // Handle job selection - could open a detailed modal or navigate to job details
    console.log('Selected job:', job);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <RealJobSearch onJobSelect={handleJobSelect} />
    </div>
  );
};

export default RealJobSearchPage;

