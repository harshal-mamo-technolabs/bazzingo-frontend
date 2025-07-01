import React from 'react';
import { ArrowLeft } from 'lucide-react';

const PageHeader = () => {
  return (
    <div className="mx-auto px-4 lg:px-12 pt-4">
      <div className="flex items-center" style={{ marginBottom: '8px' }}>
        <ArrowLeft style={{ height: '14px', width: '14px', marginRight: '8px' }} className="text-gray-600" />
        <h2 className="text-gray-900 font-medium lg:font-bold" style={{ fontFamily: 'Roboto, sans-serif', fontSize: 'clamp(18px, 2vw, 20px)' }}>
          Support Tickets
        </h2>
      </div>
      <p className="text-gray-500 text-base" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400', fontSize: "14px" }}>
        Need help? Raise a ticket and our support team will get back to you shortly.
      </p>
    </div>
  );
};

export default PageHeader;
