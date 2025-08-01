import React from 'react';
import AuthLayout from '../components/Layout/AuthLayout';
import { ResetPasswordForm } from '../components/Authentication';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import toast from "react-hot-toast";
import { resetPassword as resetPasswordService } from '../services/authService';
import { loading as loadingAction } from '../app/userSlice';
import { API_RESPONSE_STATUS_SUCCESS } from '../utils/constant';

const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useParams();

  const resetPasswordHandler = async (formData) => {
    try {
      dispatch(loadingAction());
      const response = await resetPasswordService(token, formData.password);

      if (response.status === API_RESPONSE_STATUS_SUCCESS) {
        toast.success(response.message || "Your password has been reset successfully.");
        navigate("/login");
      }
    } catch (error) {
      const message =
        error?.response?.data?.message || "An error occurred. Please try again later.";
      toast.error(message);
    } finally {
      dispatch(loadingAction());
    }
  };

  const illustration = (
    <div
      className="hidden md:flex flex-1 items-center justify-center relative rounded-2xl"
      style={{ backgroundColor: '#F8EED5', height: '100%' }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <img
          src="/bazzingo-puzzle-bear.png"
          alt="Reset Password Illustration"
          className="max-w-md"
        />
        <div
          className="absolute bottom-8 flex items-center justify-center bg-white rounded-2xl shadow-lg p-4"
          style={{ width: '42%', height: '12%' }}
        >
          <img
            src="/bazzingo-logo.png"
            alt="Bazzingo Logo"
            style={{ width: '75%' }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <AuthLayout illustration={illustration} responsiveIllustration="/bazzingo-puzzle-bear.png">
      <div className="text-center">
        <h1 className="md:text-5xl text-[32px] font-bold text-gray-800">Reset Password</h1>
        <p className="md:text-lg text-[16px] text-gray-500 mt-4 max-w-md mb-4 md:mb-0n">
          Enter your new password below.
        </p>
      </div>

      <div className="w-full">
        <ResetPasswordForm resetPasswordHandler={resetPasswordHandler} />
      </div>
    </AuthLayout>
  );
};

export default ResetPassword; 