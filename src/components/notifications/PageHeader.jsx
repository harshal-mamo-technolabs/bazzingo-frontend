import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PageHeader = ({ title = "Notification Preference", subtitle }) => {
  const navigate = useNavigate();

  return (
    <div className="mx-auto px-4 lg:px-12 py-4 lg:py-4">
      <div
        className="flex items-center cursor-pointer"
        style={{ marginBottom: '8px' }}
        onClick={() => navigate(-1)} // 🔙 Go back to previous page
      >
        <ArrowLeft
          style={{ height: '18px', width: '18px', marginRight: '8px' }}
          className="text-gray-600 hover:text-black transition-colors"
        />
        <h2
          className="text-gray-900"
          style={{
            fontFamily: 'Roboto, sans-serif',
            fontWeight: '500',
            fontSize: 'clamp(18px, 2vw, 20px)',
          }}
        >
          {title}
        </h2>
      </div>
      <p
        className="text-gray-600 text-base"
        style={{
          fontFamily: 'Roboto, sans-serif',
          fontWeight: '400',
        }}
      >
        {subtitle ||
          'Manage how and when you receive updates from Bazingo. Stay in the loop without the noise.'}
      </p>
    </div>
  );
};

export default PageHeader;
