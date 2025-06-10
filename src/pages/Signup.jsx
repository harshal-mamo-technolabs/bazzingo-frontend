import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="flex justify-center pt-4 w-screen h-screen overflow-hidden bg-white">
      <div
        className="box-border flex flex-row items-center p-8 bg-white border border-gray-200 rounded-3xl shadow-2xl"
        style={{ width: '1228px', height: '751px', transform: 'scale(0.7)' }}
      >
        {/* Left side: form */}
        <div className="flex-1">
          <div
            className="flex flex-col justify-center items-center gap-11 mx-auto w-[85%]"
          >
            {/* Header */}
            <div className="text-center">
              <h1 className="text-5xl font-bold text-gray-800">Welcome</h1>
              <p className="text-lg text-gray-500 mt-2">
                Please sign-up to your account and start the adventure
              </p>
            </div>

            {/* Form */}
            <div className="w-full">
              <form className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Email address
                    </label>
                    <input
                      type="email"
                      placeholder="Enter email address"
                      className="w-full px-5 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter password"
                        className="w-full px-5 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-500"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Enter password"
                        className="w-full px-5 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((p) => !p)}
                        className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-500"
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Signup Button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-orange-500 rounded-lg text-white font-bold tracking-wide hover:bg-orange-600 transition"
                >
                  SIGNUP
                </button>
              </form>

              {/* Or continue */}
              <div className="text-center my-6">
                <p className="text-gray-500">Or Continue With</p>
              </div>

              {/* Social Buttons */}
              <div className="flex justify-center gap-4">
                <button className="flex items-center justify-center gap-2 w-[45%] px-4 py-3 border border-gray-300 rounded-lg">
                  <img src="/google-icon.svg" alt="Google" className="w-4 h-4" />
                  <span className="font-bold text-sm text-gray-800">Google</span>
                </button>
                <button className="flex items-center justify-center gap-2 w-[55%] px-4 py-3 border border-gray-300 rounded-lg">
                  <img
                    src="/facebook-icon.svg"
                    alt="Facebook"
                    className="w-4 h-4"
                  />
                  <span className="font-bold text-sm text-gray-800">
                    Facebook
                  </span>
                </button>
              </div>

              {/* Signin Link */}
              <div className="text-center mt-6">
                <p className="text-gray-500">
                  Already have an account?{' '}
                  <a href="#" className="text-orange-500 font-medium">
                    Signin
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side: illustration */}
        <div
          className="flex-1 flex items-center justify-center relative rounded-2xl"
          style={{ backgroundColor: '#FFE5E0', height: '100%' }}
        >
          {/* Head graphic */}
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

          {/* Logo pill */}
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
    </div>
  );
};

export default Signup;
