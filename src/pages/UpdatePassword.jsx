import React, { useState } from 'react';
import { ArrowLeft, Bell, Menu, Eye, EyeOff } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";
import { updatePassword as updatePasswordService } from '../services/authService';
import { loading as loadingAction } from '../app/userSlice';
import { API_RESPONSE_STATUS_SUCCESS } from '../utils/constant';
import MainLayout from '../components/Layout/MainLayout';

const UpdatePassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const unreadCount = 3;

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const updatePasswordHandler = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      dispatch(loadingAction());

      const response = await updatePasswordService(
        formData.currentPassword,
        formData.newPassword
      );

      if (response.status === API_RESPONSE_STATUS_SUCCESS) {
        toast.success(response.message || "Password updated successfully!");
        navigate("/");
      }
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to update password. Please try again.";
      toast.error(message);
    } finally {
      dispatch(loadingAction());
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <MainLayout unreadCount={unreadCount}>
      <div className="bg-white min-h-screen" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '12px' }}>
        {/* Main Content */}
        <main>
          {/* Page Header */}
          <div className="mx-auto px-4 lg:px-12 py-4 lg:py-4">
            <div className="flex items-center" style={{ marginBottom: '8px' }}>
              <ArrowLeft
                style={{ height: '14px', width: '14px', marginRight: '8px' }}
                className="text-gray-600 cursor-pointer"
                onClick={() => navigate(-1)}
              />
              <h2 className="text-gray-900" style={{ fontSize: '16px', fontWeight: '600' }}>Update Your Password</h2>
            </div>
            <p className="text-gray-600" style={{ fontSize: '11px' }}>Keep your account secure by updating your password regularly.</p>
          </div >

          {/* Form Container */}
          < div className="mx-auto px-4 lg:px-12 py-4 lg:py-4" >
            <div className="w-full md:max-w-[320px]">
              <form onSubmit={updatePasswordHandler}>
                {/* Current Password */}
                <div style={{ marginBottom: '16px' }}>
                  <label className="block text-gray-700" style={{ fontSize: '11px', fontWeight: '500', marginBottom: '8px' }}>
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      placeholder="Enter Current Password"
                      value={formData.currentPassword}
                      onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-500 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                      style={{ fontSize: '11px', height: '36px' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.current ? (
                        <EyeOff style={{ height: '14px', width: '14px' }} />
                      ) : (
                        <Eye style={{ height: '14px', width: '14px' }} />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div style={{ marginBottom: '16px' }}>
                  <label className="block text-gray-700" style={{ fontSize: '11px', fontWeight: '500', marginBottom: '8px' }}>
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      placeholder="Enter New Password"
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange('newPassword', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-500 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                      style={{ fontSize: '11px', height: '36px' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? (
                        <EyeOff style={{ height: '14px', width: '14px' }} />
                      ) : (
                        <Eye style={{ height: '14px', width: '14px' }} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div style={{ marginBottom: '16px' }}>
                  <label className="block text-gray-700" style={{ fontSize: '11px', fontWeight: '500', marginBottom: '8px' }}>
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      placeholder="Enter New Password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-500 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                      style={{ fontSize: '11px', height: '36px' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff style={{ height: '14px', width: '14px' }} />
                      ) : (
                        <Eye style={{ height: '14px', width: '14px' }} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password Requirements */}
                <div style={{ marginBottom: '20px' }}>
                  <div className="flex items-center" style={{ marginBottom: '4px' }}>
                    <span className="w-1 h-1 bg-gray-600 rounded-full mr-2"></span>
                    <span className="text-gray-600" style={{ fontSize: '11px' }}>Use at least 8 characters</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-1 h-1 bg-gray-600 rounded-full mr-2"></span>
                    <span className="text-gray-600" style={{ fontSize: '11px' }}>Include a mix of letters, numbers, and symbols</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-[#FF6B3E] text-white rounded-md hover:bg-[#e55a35] transition-colors"
                  style={{ fontSize: '12px', fontWeight: '600', height: '40px' }}
                >
                  Change Password
                </button>
              </form>
            </div>
          </ div>
        </main>
      </div>
    </MainLayout>
  );
};

export default UpdatePassword;
