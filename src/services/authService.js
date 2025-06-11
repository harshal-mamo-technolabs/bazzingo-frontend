import axios from "axios";
import { API_CONNECTION_HOST_URL, SIGNUP_ENDPOINT, LOGIN_ENDPOINT, GOOGLE_LOGIN_ENDPOINT } from "../utils/constant";

export async function signup(email, password) {
    const response = await axios.post(`${API_CONNECTION_HOST_URL}${SIGNUP_ENDPOINT}`, {
        name: "test",
        email,
        password,
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