import React from 'react';
import Button from '../components/Form/Button';
import AuthLayout from '../components/Layout/AuthLayout';
import SignupForm from '../components/Authentication/SignupForm';

const Signup = () => {
  const illustration = (
    <div
      className="flex-1 flex items-center justify-center relative rounded-2xl"
      style={{ backgroundColor: '#FFE5E0', height: '100%' }}
    >
      <img
        src="/bazzingo-head.png"
        alt="Bazzingo Head"
        className="absolute"
        style={{
          width: '110%',
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
        <h1 className="text-5xl font-bold text-gray-800">Welcome</h1>
        <p className="text-lg text-gray-500 mt-2">
          Please sign-up to your account and start the adventure
        </p>
      </div>
      <div className="w-full">
        <SignupForm />
        <div className="text-center my-6">
          <p className="text-gray-500">Or Continue With</p>
        </div>
        <div className="flex justify-center gap-4">
          <Button className="flex items-center justify-center gap-2 w-[45%] px-4 py-3 border border-gray-300 rounded-lg">
            <img src="/google-icon.svg" alt="Google" className="w-4 h-4" />
            <span className="font-bold text-sm text-gray-800">Google</span>
          </Button>
          <Button className="flex items-center justify-center gap-2 w-[55%] px-4 py-3 border border-gray-300 rounded-lg">
            <img
              src="/facebook-icon.svg"
              alt="Facebook"
              className="w-4 h-4"
            />
            <span className="font-bold text-sm text-gray-800">
              Facebook
            </span>
          </Button>
        </div>
        <div className="text-center mt-6">
          <p className="text-gray-500">
            Already have an account?{' '}
            <a href="#" className="text-orange-500 font-medium">
              Signin
            </a>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Signup;
