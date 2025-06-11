import React from 'react';
import AuthLayout from '../components/Layout/AuthLayout';
import ForgetPasswordEmailInputForm from '../components/Authentication/ForgetPasswordEmailInputForm';

const ForgotPassword = () => {
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
    <AuthLayout illustration={illustration}>
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-800">Forgot Password</h1>
        <p className="text-base text-gray-500 mt-4 max-w-md">
          Don't worry! Resetting your password is easy. Just type in the email you registered to Bazzingo
        </p>
      </div>
      <div className="w-full">
        <ForgetPasswordEmailInputForm />
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Did you remembered your password?{' '}
            <a href="/login" className="text-orange-500 font-medium">
              Try Sign in
            </a>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;