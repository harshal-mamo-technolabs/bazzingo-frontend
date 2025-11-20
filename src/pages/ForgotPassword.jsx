import React from 'react';
import AuthLayout from '../components/Layout/AuthLayout';
import { ForgetPasswordEmailInputForm } from '../components/Authentication';
import { useDispatch } from 'react-redux';
import toast from "react-hot-toast";
import { forgotPassword as forgotPasswordService } from '../services/authService';
import { loading as loadingAction } from '../app/userSlice';
import { API_RESPONSE_STATUS_SUCCESS } from '../utils/constant';
import TranslatedText from '../components/TranslatedText.jsx';
import { useTranslateText } from '../hooks/useTranslate';

const ForgotPassword = () => {
  const dispatch = useDispatch();
  
  // Translated strings for toast messages
  const passwordResetLinkSentText = useTranslateText("If the email is registered, a password reset link has been sent.");
  const errorOccurredText = useTranslateText("An error occurred. Please try again later.");

  const forgotPasswordHandler = async (formData) => {
    try {
      dispatch(loadingAction());
      const response = await forgotPasswordService(formData.email);

      if (response.status === API_RESPONSE_STATUS_SUCCESS) {
        toast.success(response.message || passwordResetLinkSentText);
      }
    } catch (error) {
      const message =
        error?.response?.data?.message || errorOccurredText;
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
          alt="Forgot Password Illustration"
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
        <h1 className="md:text-5xl text-[32px] font-bold text-gray-800"><TranslatedText text="Forgot Password" /></h1>
        <p className="md:text-lg text-[16px] text-gray-500 mt-4 mb-4 md:mb-0 max-w-md">
          <TranslatedText text="Don't worry! Resetting your password is easy. Just type in the email you registered to Bazzingo" />
        </p>
      </div>
      <div className="w-full">
        <ForgetPasswordEmailInputForm forgotPasswordHandler={forgotPasswordHandler} />
        <div className="text-center mt-6">
          <p className="text-[14px] md:text-[16px] text-gray-600">
            <TranslatedText text="Did you remembered your password?" />{' '}
            <a href="/login" className="text-orange-500 font-medium">
              <TranslatedText text="Try Sign in" />
            </a>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;