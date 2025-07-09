export const USER_SLICE_NAME = "user";

export const API_CONNECTION_HOST_URL = "https://51l68pgk-4000.inc1.devtunnels.ms";
export const SIGNUP_ENDPOINT = "/auth/signup";
export const LOGIN_ENDPOINT = "/auth/login";
export const GOOGLE_LOGIN_ENDPOINT = "/auth/google-login";
export const FORGOT_PASSWORD_ENDPOINT = "/auth/forgot-password";
export const UPDATE_PASSWORD_ENDPOINT = "/auth/reset-password";

export const API_RESPONSE_STATUS_SUCCESS = 'success';
export const API_RESPONSE_STATUS_ERROR = 'error';

// Token expiry duration (7 days in milliseconds)
export const TOKEN_EXPIRY_DURATION = 7 * 24 * 60 * 60 * 1000;

// Utility function to check if token is expired
export const isTokenExpired = (tokenExpiry) => {
    if (!tokenExpiry) return true;
    return Date.now() > tokenExpiry;
};

// Utility function to get token expiry time
export const getTokenExpiry = () => {
    return Date.now() + TOKEN_EXPIRY_DURATION;
};