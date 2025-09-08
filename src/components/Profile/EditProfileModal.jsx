import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Globe, ChevronDown } from 'lucide-react';
import { countries } from '../../utils/constant';
import { updateUserProfile } from '../../services/dashbaordService';

const EditProfileModal = ({ isOpen, onClose, currentProfile, onSave }) => {
  // Available avatar images
  const avatarImages = [
    './avatar/person1.png',
    './avatar/person2.png',
    './avatar/person3.png',
    './avatar/person4.png',
    './avatar/person5.png',
    './avatar/person6.png',
    './avatar/person7.png',
    './avatar/person8.png'
  ];

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    country: '',
    avatar: ''
  });

  const [currentAvatarIndex, setCurrentAvatarIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // Update form data when currentProfile changes or modal opens
  useEffect(() => {
    if (currentProfile && isOpen) {
      setFormData({
        name: currentProfile.name || '',
        age: currentProfile.age || '',
        country: currentProfile.country || '',
        avatar: currentProfile.avatar || avatarImages[0]
      });

      // Set current avatar index
      const avatarIndex = avatarImages.indexOf(currentProfile.avatar);
      setCurrentAvatarIndex(avatarIndex !== -1 ? avatarIndex : 0);
    }
  }, [currentProfile, isOpen]);

  // Track selected country for styling
  const selectedCountry = formData.country;

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle avatar navigation
  const handlePrevAvatar = () => {
    const newIndex = currentAvatarIndex === 0 ? avatarImages.length - 1 : currentAvatarIndex - 1;
    setCurrentAvatarIndex(newIndex);
    setFormData(prev => ({
      ...prev,
      avatar: avatarImages[newIndex]
    }));
  };

  const handleNextAvatar = () => {
    const newIndex = currentAvatarIndex === avatarImages.length - 1 ? 0 : currentAvatarIndex + 1;
    setCurrentAvatarIndex(newIndex);
    setFormData(prev => ({
      ...prev,
      avatar: avatarImages[newIndex]
    }));
  };

  // Handle form submission
  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Prepare data for API (only include fields that should be updated)
      const profileData = {
        name: formData.name,
        age: parseInt(formData.age),
        country: formData.country,
        avatar: formData.avatar
      };

      // Call the update API
      await updateUserProfile(profileData);
      
      // Call the parent onSave callback with updated data
      if (onSave) {
        onSave(profileData);
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
      // You might want to show an error message to the user here
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-xl shadow-2xl w-[90vw] md:w-[60vw] lg:w-[35vw] max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 z-20 text-gray-400 hover:text-gray-600 transition-colors bg-white rounded-full p-1 disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        <div className="relative p-3">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Edit Profile
          </h2>

          {/* Avatar Selection */}
          <div className="mb-8">
            <label className="block text-lg font-bold text-gray-800 mb-6 text-center" style={{ fontFamily: 'Roboto, sans-serif' }}>
              ✨ Choose Your Avatar ✨
            </label>

            {/* Enhanced Avatar Slider */}
            <div className="relative mb-6">
              {/* Background Glow Effect */}
              <div className="relative">
                <div className="flex items-center justify-center space-x-6">
                  {/* Previous Button */}
                  <button
                    onClick={handlePrevAvatar}
                    disabled={loading}
                    className="group p-3 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-3 h-3 text-white group-hover:animate-pulse" />
                  </button>

                  {/* Main Avatar Display */}
                  <div className="relative">
                    {/* Animated Ring */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-orange-400 via-purple-500 to-blue-500 rounded-full animate-spin opacity-75 blur-sm"></div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-300 via-purple-400 to-blue-400 rounded-full animate-pulse"></div>

                    {/* Avatar Container */}
                    <div className="relative w-20 h-20 rounded-full border-4 border-white overflow-hidden bg-white shadow-2xl transform transition-all duration-500 hover:scale-105">
                      <img
                        src={formData.avatar}
                        alt="Avatar"
                        className="w-full h-full object-cover transition-all duration-500 hover:brightness-110"
                        onError={(e) => {
                          e.target.src = './human.png'; // Fallback image
                        }}
                      />

                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* Selection Checkmark */}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={handleNextAvatar}
                    disabled={loading}
                    className="group p-3 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-3 h-3 text-white group-hover:animate-pulse" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="flex flex-col gap-5 md:gap-6">
            {/* Name Field */}
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-800 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={loading}
                className="w-full px-5 py-2 md:py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-[14px] md:text-[16px] disabled:opacity-50"
                placeholder="Enter your full name"
              />
            </div>

            {/* Age and Country Fields - Side by Side */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              {/* Age Field */}
              <div className="flex-1">
                <label className="block text-xs md:text-sm font-medium text-gray-800 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  disabled={loading}
                  className="w-full px-5 py-2 md:py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-[14px] md:text-[16px] disabled:opacity-50"
                  placeholder="Enter your age"
                  min="1"
                  max="120"
                />
              </div>

              {/* Country Field */}
              <div className="flex-1">
                <label className="block text-xs md:text-sm font-medium text-gray-800 mb-2">
                  Country
                </label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    disabled={loading}
                    className={`w-full pl-12 pr-12 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-[14px] md:text-[16px] bg-white appearance-none disabled:opacity-50 ${
                      selectedCountry ? "text-gray-800" : "text-gray-400"
                    }`}
                    style={{
                      color: selectedCountry ? '#1F2937' : '#9CA3AF'
                    }}
                  >
                    <option value="" disabled hidden style={{ color: '#9CA3AF' }}>
                      Select your country
                    </option>
                    {countries.map((country) => (
                      <option key={country} value={country} style={{ color: '#1F2937' }}>
                        {country}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 mt-8">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-[10px] md:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors md:text-[16px] text-[12px] font-bold tracking-wide disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 py-[10px] md:py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors md:text-[16px] text-[12px] font-bold tracking-wide disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;