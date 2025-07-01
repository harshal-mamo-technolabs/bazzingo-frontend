import React from 'react';
import { ArrowLeft } from 'lucide-react';

const PageHeader = () => {
  return (
    <div className="mx-auto px-4 lg:px-12 py-4 lg:py-4">
      <div className="flex items-center" style={{ marginBottom: '8px' }}>
        <ArrowLeft style={{ height: '14px', width: '14px', marginRight: '8px' }} className="text-gray-600" />
        <h2 className="text-gray-900" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500', fontSize: 'clamp(18px, 2vw, 20px)' }}>
          Notification Preference
        </h2>
      </div>
      <p className="text-gray-600 text-base" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
        Manage how and when you receive updates from Bazingo. Stay in the loop without the noise.
      </p>
    </div>
  );
};

export default PageHeader;
