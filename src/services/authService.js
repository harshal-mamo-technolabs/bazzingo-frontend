import axios from "axios";
import { API_CONNECTION_HOST_URL, SIGNUP_ENDPOINT, LOGIN_ENDPOINT, GOOGLE_LOGIN_ENDPOINT, FORGOT_PASSWORD_ENDPOINT, UPDATE_PASSWORD_ENDPOINT, REFRESH_TOKEN_LP_ENDPOINT } from "../utils/constant";

export async function signup(name, email, password, age, country) {
    const response = await axios.post(`${API_CONNECTION_HOST_URL}${SIGNUP_ENDPOINT}`, {
        name,
        email,
        password,
        age,
        country,
    });

    return response.data;
}

export async function login(email, password) {
    const response = await axios.post(`${API_CONNECTION_HOST_URL}${LOGIN_ENDPOINT}`, {
        email,
        password,
    });

    return response.data;
}

export async function googleLogin(idToken) {
    const response = await axios.post(`${API_CONNECTION_HOST_URL}${GOOGLE_LOGIN_ENDPOINT}`, {
        idToken,
    });

    return response.data;
}

export async function forgotPassword(email) {
    const response = await axios.post(`${API_CONNECTION_HOST_URL}${FORGOT_PASSWORD_ENDPOINT}`, {
        email,
    });

    return response.data;
}

export async function resetPassword(token, password) {
    const response = await axios.post(`${API_CONNECTION_HOST_URL}${FORGOT_PASSWORD_ENDPOINT}/${token}`, {
        password,
    });

    return response.data;
}

export async function updatePassword(currentPassword, newPassword) {
    // Get the user token from localStorage
    const userData = localStorage.getItem("user");

    if (!userData) {
        throw new Error("User not authenticated. Please log in again.");
    }

    let parsedUserData;
    try {
        parsedUserData = JSON.parse(userData);
    } catch (error) {
        throw new Error("Invalid user data. Please log in again.");
    }

    const token = parsedUserData?.accessToken;

    if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
    }

    const response = await axios.post(`${API_CONNECTION_HOST_URL}${UPDATE_PASSWORD_ENDPOINT}`, {
        oldPassword: currentPassword,
        newPassword,
    }, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
}

export async function refreshTokenLP(token) {
    const response = await axios.post(`${API_CONNECTION_HOST_URL}${REFRESH_TOKEN_LP_ENDPOINT}`, {
        token,
    });

    return response.data;
}