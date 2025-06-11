import React from 'react';
import Button from '../components/Form/Button';
import AuthLayout from '../components/Layout/AuthLayout';
import { SignupForm } from '../components/Authentication';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";
import { signup, googleLogin } from '../services/authService';
import { login as loginAction, loading as loadingAction } from '../app/userSlice';
import { API_RESPONSE_STATUS_SUCCESS } from '../utils/constant';
import { GoogleLogin } from '@react-oauth/google';

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const signupHandler = async (formData) => {
    try {
      dispatch(loadingAction());
      const response = await signup(formData.email, formData.password);

      if (response.status === API_RESPONSE_STATUS_SUCCESS) {
        const userData = {
          user: response.data.user,
          accessToken: response.data.accessToken,
        };
        dispatch(loginAction(userData));
        localStorage.setItem("user", JSON.stringify(userData));
        toast.success("Logged in successfully!");
        navigate("/");
      }
    } catch (error) {
      const message =
        error?.response?.data?.message || "registration failed, please try again later.";
      toast.error(message);
    } finally {
      dispatch(loadingAction());
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      dispatch(loadingAction());
      const response = await googleLogin(credentialResponse.credential);

      if (response.status === API_RESPONSE_STATUS_SUCCESS) {
        const userData = {
          user: response.data.user,
          accessToken: response.data.accessToken,
        };
        dispatch(loginAction(userData));
        localStorage.setItem("user", JSON.stringify(userData));
        toast.success("Logged in successfully!");
        navigate("/");
      }
    } catch (error) {
      const message =
        error?.response?.data?.message || "Google login failed, please try again later.";
      toast.error(message);
    } finally {
      dispatch(loadingAction());
    }
  };

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
        <SignupForm signupHandler={signupHandler} />
        <div className="text-center my-6">
          <p className="text-gray-500">Or Continue With</p>
        </div>
        <div className="flex justify-center gap-4">
          <div className="relative flex-1">
            <Button
              className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-gray-300 rounded-lg"
            >
              <img src="/google-icon.svg" alt="Google" className="w-4 h-4" />
              <span className="font-bold text-sm text-gray-800">Google</span>
            </Button>
            <div className="absolute top-0 left-0 w-full h-full opacity-0">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => {
                  toast.error("Google login failed. Please try again.");
                }}
              />
            </div>
          </div>
          <Button className="flex flex-1 items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg">
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
            <a href="/login" className="text-orange-500 font-medium">
              Signin
            </a>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Signup;
