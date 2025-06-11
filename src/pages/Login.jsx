import React from 'react';
import { Input, Button, PasswordInput } from '../components/Form';
import AuthLayout from '../components/Layout/AuthLayout';
import LoginForm from '../components/Authentication/LoginForm';
const Login = () => {
  const illustration = (
    <div
      className="flex-1 flex items-center justify-center relative rounded-2xl"
      style={{ height: '100%' }}
    >
      <img
        src="/bazzingo-bulb.png"
        alt="Bazzingo Bulb"
        className="absolute rounded-2xl"
        style={{
          width: '550px',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
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
  );

  return (
    <AuthLayout illustration={illustration}>
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-800">Welcome Back</h1>
        <p className="text-lg text-gray-500 mt-2">
          Please sign-in to your account and start the adventure
        </p>
      </div>

      <div className="w-full">
        <LoginForm />
        <div className="text-center mt-6">
          <p className="text-gray-500">
            Don't have an account?{' '}
            <a href="#" className="text-orange-500 font-medium">
              Signup
            </a>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
