
import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div
      className="w-8 h-8 border-4 border-gray-300 border-t-apple-blue rounded-full animate-spin"
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;
