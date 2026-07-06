import React, { useEffect, useState } from 'react';
import Button from '../components/Form/Button';
import AuthLayout from '../components/Layout/AuthLayout';
import { SignupForm } from '../components/Authentication';
import { isMSISDNControlEnabled, getPlatformHeadImagePath } from '../config/accessControl';
import { PlatformLogo } from '../components/PlatformBrand';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from "react-hot-toast";
import { signup, googleLogin, signupMSISDN, loginMSISDN } from '../services/authService';
import { login as loginAction, loading as loadingAction, checkAndValidateToken } from '../app/userSlice';
import { API_RESPONSE_STATUS_SUCCESS, getTokenExpiry } from '../utils/constant';
import { GoogleLogin } from '@react-oauth/google';
import TranslatedText from '../components/TranslatedText.jsx';
import { useTranslateText } from '../hooks/useTranslate';
import MSISDNSignupForm from '../components/Authentication/MSISDNSignupForm';
import { checkSubscription, isSubscriptionActive, redirectToLandingPage } from '../services/comparoSubscriptionService';

/** Same identifier may appear as sessionId, public_id, public_uuid, or user_public_uuid in the URL. */
function getUserPublicUuidFromSearchParams(searchParams) {
  return (
    searchParams.get('sessionId') ||
    searchParams.get('public_id') ||
    searchParams.get('public_uuid') ||
    searchParams.get('user_public_uuid')
  );
}

const REDIRECT_AFTER_SUBSCRIPTION_ALERT_MS = 4000;

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { status: isAuthenticated, loading } = useSelector((state) => state.user);

  const [sessionCheckLoading, setSessionCheckLoading] = useState(false);
  const [sessionMsisdn, setSessionMsisdn] = useState(null);
  const [subscriptionRedirectPending, setSubscriptionRedirectPending] = useState(false);
  
  // Translated strings for toast messages
  const signedUpSuccessText = useTranslateText('Signed up successfully!');
  const registrationFailedText = useTranslateText('Registration failed, please try again later.');
  const loggedInSuccessText = useTranslateText('Logged in successfully!');
  const googleLoginFailedText = useTranslateText('Google login failed, please try again later.');
  const noActiveSubscriptionText = useTranslateText(
    "You don't have an active subscription on this number.",
  );
  const subscriptionVerifyFailedText = useTranslateText(
    "We couldn't verify your subscription. You will be redirected to the landing page.",
  );

  // Handle legacy MSISDN redirect logic (isid flow)
  useEffect(() => {
    const isid = searchParams.get('isid');
    if (isid) {
      document.body.style.backgroundColor = '#ffffff';
      document.body.innerHTML = '';
      
      const redirectUrl = `https://comparocms.com/api/validate_subscription?isid=${isid}&success_url=https://bazzingo.net/signup&error_url=https://bazzingo.net/landingpage&token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhZ2VuY3lfaWQiOiIxOSIsImV4dHNlcnZpY2VfaWQiOiIxMTQifQ.quOp8vDpBqIe7i66JXkXuodh2pZAtVN3gpEIaW8aWaIMoeuUKSZizdNUT7f4wB0N_57nJ6yx2WXFGVvA544QXFHnEEeOwYmeJj-xdUYbkQZMBEd5h-RnMlWaJIDAWdDOoDGH8PesjViIK_7NjS5pdy8ih6DNFJIMTPmQ-zdYHDW5WsPebBHgnjyelzXFfgoZo9jyaku34XY90-DjqFZieLSSxOr81CWFpdayzhmhPzCjvBn6Tv9p_IH2dssGE7WE8_FZYcv5Gcqbene0SbGRoXqcxjq5VEKQkWTUfBzxefDZ_iyhOp6VjkOarTm3w8o_XNWhmF13M7clxE1djcB60Q`;
      window.location.href = redirectUrl;
      return;
    }
  }, [searchParams]);

  // MSISDN flow only: if user hits /signup without required query params, send
  // them to /login. In email/password mode the signup form is always available.
  useEffect(() => {
    if (!isMSISDNControlEnabled('useMSISDNSignup')) return;

    const isid = searchParams.get('isid');
    const userPublicUuid = getUserPublicUuidFromSearchParams(searchParams);
    const mobileFromQuery = searchParams.get('mobile_number')?.trim();

    if (!isid && !userPublicUuid && !mobileFromQuery) {
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate]);

  // sessionId / public_id / public_uuid / user_public_uuid → body { user_public_uuid }
  // ?mobile_number= → body { mobile_number } (same post-check flow)
  useEffect(() => {
    const mobileFromQuery = searchParams.get('mobile_number')?.trim();
    const userPublicUuid = getUserPublicUuidFromSearchParams(searchParams);
    const subscriptionInput = mobileFromQuery
      ? { mobileNumber: mobileFromQuery }
      : userPublicUuid
        ? userPublicUuid
        : null;
    if (!subscriptionInput) return;

    setSessionCheckLoading(true);
    let redirectTimer;
    let didAutoLogin = false;

    checkSubscription(subscriptionInput)
      .then(async (data) => {
        console.log('Check Subscription response (signup):', data);

        if (!data.is_ok || !isSubscriptionActive(data.subscriptionStatus)) {
          setSubscriptionRedirectPending(true);
          const message = data.mobile_number
            ? `${noActiveSubscriptionText}\n${data.mobile_number}`
            : noActiveSubscriptionText;
          window.alert(message);
          redirectTimer = setTimeout(
            () => redirectToLandingPage(),
            REDIRECT_AFTER_SUBSCRIPTION_ALERT_MS,
          );
          return;
        }

        const mobile = data.mobile_number || mobileFromQuery || null;
        if (!mobile) {
          return;
        }

        try {
          const response = await loginMSISDN(mobile);
          if (response.status === API_RESPONSE_STATUS_SUCCESS) {
            didAutoLogin = true;
            const userData = {
              user: response.data?.user || response.user || response.data,
              accessToken:
                response.data?.token ||
                response.token ||
                response.data?.accessToken ||
                response.accessToken,
              tokenExpiry: getTokenExpiry(),
            };
            dispatch(loginAction(userData));
            localStorage.setItem('user', JSON.stringify(userData));
            toast.success(loggedInSuccessText);
            navigate('/dashboard', { replace: true });
            return;
          }
        } catch (err) {
          console.log(
            'MSISDN auto-login skipped (user not registered or login failed):',
            err?.response?.status ?? err?.message,
          );
        }

        setSessionMsisdn(mobile);
      })
      .catch(() => {
        console.error('Check Subscription error (signup)');
        setSubscriptionRedirectPending(true);
        window.alert(subscriptionVerifyFailedText);
        redirectTimer = setTimeout(
          () => redirectToLandingPage(),
          REDIRECT_AFTER_SUBSCRIPTION_ALERT_MS,
        );
      })
      .finally(() => {
        if (!didAutoLogin) {
          setSessionCheckLoading(false);
        }
      });

    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [searchParams]);

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

      const response = await signup(formData.name, formData.email, formData.password, formData.age, formData.country);


      if (response.status === API_RESPONSE_STATUS_SUCCESS) {
        const userData = {
          user: response.data?.user || response.user || response.data,
          accessToken: response.data?.accessToken || response.accessToken || response.data?.token || response.token,
          tokenExpiry: getTokenExpiry(),
        };


        dispatch(loginAction(userData));
        localStorage.setItem("user", JSON.stringify(userData));
        toast.success(signedUpSuccessText);
        navigate("/dashboard");
      }
    } catch (error) {
      const message =
        error?.response?.data?.message || registrationFailedText;
      toast.error(message);
    } finally {
      dispatch(loadingAction());
    }
  };

  const msisdnSignupHandler = async (formData) => {
    try {
      dispatch(loadingAction());

      const response = await signupMSISDN(formData.msisdn, formData.name, formData.age, formData.country);

      if (response.status === API_RESPONSE_STATUS_SUCCESS) {
        const userData = {
          user: response.data?.user || response.user || response.data,
          accessToken: response.data?.token || response.token || response.data?.accessToken || response.accessToken,
          tokenExpiry: getTokenExpiry(),
        };

        dispatch(loginAction(userData));
        localStorage.setItem("user", JSON.stringify(userData));
        toast.success(signedUpSuccessText);
        navigate("/dashboard");
      }
    } catch (error) {
      const message =
        error?.response?.data?.message || registrationFailedText;
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
          user: response.data?.user || response.user || response.data,
          accessToken: response.data?.accessToken || response.accessToken || response.data?.token || response.token,
          tokenExpiry: getTokenExpiry(),
        };


        dispatch(loginAction(userData));
        localStorage.setItem("user", JSON.stringify(userData));
        toast.success(loggedInSuccessText);
        navigate("/dashboard");
      }
    } catch (error) {
      const message =
        error?.response?.data?.message || googleLoginFailedText;
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
        src={getPlatformHeadImagePath()}
        alt="Platform illustration"
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
        <PlatformLogo style={{ width: '75%' }} />
      </div>
    </div>
  );

  return (
    <AuthLayout illustration={illustration} responsiveIllustration={getPlatformHeadImagePath()}>
      <div className="text-center">
        <h1 className="md:text-5xl text-[32px] font-bold text-gray-800"><TranslatedText text="Welcome" /></h1>
        <p className="md:text-lg text-[16px] text-gray-500 mt-2 md:mb-0 mb-2">
          <TranslatedText text="Please sign-up to your account and start the adventure" />
        </p>
      </div>
      <div className="w-full">
        {sessionCheckLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 text-sm"><TranslatedText text="Verifying subscription..." /></p>
            </div>
          </div>
        ) : subscriptionRedirectPending ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500 text-sm">
              <TranslatedText text="Redirecting to the landing page..." />
            </p>
          </div>
        ) : isMSISDNControlEnabled('useMSISDNSignup') ? (
          <MSISDNSignupForm 
            signupHandler={msisdnSignupHandler} 
            loading={loading} 
            msisdn={
              sessionMsisdn ||
              searchParams.get('msisdn') ||
              searchParams.get('mobile_number')
            } 
          />
        ) : (
          <SignupForm signupHandler={signupHandler} loading={loading} />
        )}
        {/* Social Login Section - Commented Out */}
        {/* <div className="text-center my-4 md:my-6">
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
        </div> */}
        <div className="text-center mt-3 md:mt-6">
          <p className="text-gray-500 text-[14px] md:text-[16px]">
            <TranslatedText text="Already have an account?" />{' '}
            <a href="/login" className="text-orange-500 font-medium">
              <TranslatedText text="Signin" />
            </a>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Signup;
