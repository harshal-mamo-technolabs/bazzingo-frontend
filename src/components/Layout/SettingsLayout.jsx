import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const SettingsLayout = ({ children, title, subtitle, showBackButton = true }) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Header */}
      <div className="hidden lg:block bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <img src="/bazzingo-logo.png" alt="Bazzingo" className="h-8" />
              </div>
              <nav className="flex space-x-8">
                <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">Games</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">Assessments</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">Statistics</a>
                <a href="#" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">Leaderboard</a>
              </nav>
            </div>
            
            {/* User Profile */}
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">A</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <img src="/bazzingo-logo.png" alt="Bazzingo" className="h-6" />
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <button className="p-1">
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <div className="w-full h-0.5 bg-black"></div>
                <div className="w-full h-0.5 bg-black"></div>
                <div className="w-full h-0.5 bg-black"></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
        {/* Back Button and Title */}
        <div className="mb-6 lg:mb-8">
          {showBackButton && (
            <button
              onClick={handleBackClick}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4 lg:mb-6"
            >
              <FaArrowLeft className="w-4 h-4 mr-2" />
              <span className="text-sm lg:text-base font-medium">{title}</span>
            </button>
          )}
          
          {subtitle && (
            <p className="text-gray-500 text-sm lg:text-base max-w-md">
              {subtitle}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
