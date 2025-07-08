import React, { useEffect } from 'react';
import Button from '../components/Form/Button';
import AuthLayout from '../components/Layout/AuthLayout';
import { SignupForm } from '../components/Authentication';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";
import { signup, googleLogin } from '../services/authService';
import { login as loginAction, loading as loadingAction, checkAndValidateToken } from '../app/userSlice';
import { API_RESPONSE_STATUS_SUCCESS, getTokenExpiry } from '../utils/constant';
import { GoogleLogin } from '@react-oauth/google';

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status: isAuthenticated } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(checkAndValidateToken());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const signupHandler = async (formData) => {
    try {
      dispatch(loadingAction());
      const response = await signup(formData.email, formData.password);

      // Debug: Log the actual response structure
      console.log("Signup response:", response);

      if (response.status === API_RESPONSE_STATUS_SUCCESS) {
        // Handle different possible response structures
        const userData = {
          user: response.data?.user || response.user || response.data,
          accessToken: response.data?.accessToken || response.accessToken || response.data?.token || response.token,
          tokenExpiry: getTokenExpiry(),
        };

        console.log("Extracted userData:", userData);

        dispatch(loginAction(userData));
        localStorage.setItem("user", JSON.stringify(userData));
        toast.success("Signed up successfully!");
        navigate("/dashboard");
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

      // Debug: Log the actual response structure
      console.log("Google login response:", response);

      if (response.status === API_RESPONSE_STATUS_SUCCESS) {
        // Handle different possible response structures
        const userData = {
          user: response.data?.user || response.user || response.data,
          accessToken: response.data?.accessToken || response.accessToken || response.data?.token || response.token,
          tokenExpiry: getTokenExpiry(),
        };

        console.log("Extracted userData:", userData);

        dispatch(loginAction(userData));
        localStorage.setItem("user", JSON.stringify(userData));
        toast.success("Logged in successfully!");
        navigate("/dashboard");
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
      style={{ backgroundColor: '#f7bba9', height: '100%' }}
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
        className="absolute bottom-8 flex items-center justify-center bg-white rounded-2xl shadow-lg p-4 md:p-0"
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
    <AuthLayout illustration={illustration} responsiveIllustration="/bazzingo-head.png">
      <div className="text-center">
        <h1 className="md:text-5xl text-[32px] font-bold text-gray-800">Welcome</h1>
        <p className="md:text-lg text-[16px] text-gray-500 mt-2 md:mb-0 mb-2">
          Please sign-up to your account and start the adventure
        </p>
      </div>
      <div className="w-full">
        <SignupForm signupHandler={signupHandler} />
        <div className="text-center my-4 md:my-6">
          <p className="text-gray-500 text-[14px] md:text-[16px]">Or Continue With</p>
        </div>
        <div className="flex justify-center gap-4">
          <div className="relative flex-none md:flex-1">
            <Button
              className="flex items-center justify-center gap-2 w-full px-4 py-2 md:py-3 border border-gray-300 rounded-lg"
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
          <Button className="flex flex-none md:flex-1 items-center justify-center gap-2 px-4 py-2 md:py-3 border border-gray-300 rounded-lg">
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
        <div className="text-center mt-3 md:mt-6">
          <p className="text-gray-500 text-[14px] md:text-[16px]">
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
