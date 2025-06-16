import React from 'react';
import AuthLayout from '../components/Layout/AuthLayout';
import { LoginForm } from '../components/Authentication';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";
import { login as loginService } from '../services/authService';
import { login as loginAction, loading as loadingAction } from '../app/userSlice';
import { API_RESPONSE_STATUS_SUCCESS } from '../utils/constant';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loginHandler = async (formData) => {
    try {
      dispatch(loadingAction());

      const response = await loginService(formData.email, formData.password);

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
        error?.response?.data?.message || "Login failed, please try again later.";
      toast.error(message);
    } finally {
      dispatch(loadingAction());
    }
  };

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
    <AuthLayout illustration={illustration} responsiveIllustration="/bazzingo-bulb.png">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-800">Welcome Back</h1>
        <p className="text-lg text-gray-500 mt-2">
          Please sign-in to your account and start the adventure
        </p>
      </div>

      <div className="w-full">
        <LoginForm loginHandler={loginHandler} />
        <div className="text-center mt-6">
          <p className="text-gray-500">
            Don't have an account?{' '}
            <a href="/signup" className="text-orange-500 font-medium">
              Signup
            </a>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;
