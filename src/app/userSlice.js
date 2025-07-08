import { createSlice } from "@reduxjs/toolkit";
import { USER_SLICE_NAME, isTokenExpired } from "../utils/constant";
const initialState = {
    loading: false,
    status: false,
    user: null,
    accessToken: null
}

const userSlice = createSlice({
    name: USER_SLICE_NAME,
    initialState,
    reducers: {
        loading: (state, action) => {
            state.loading = !state.loading
        },
        login: (state, action) => {
            state.status = true;
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
        },
        logout: (state, action) => {
            state.status = false;
            state.user = null;
            state.accessToken = null;
            localStorage.removeItem("user");
        },
        checkAndValidateToken: (state, action) => {
            const userData = localStorage.getItem("user");
            if (userData) {
                try {
                    const parsedData = JSON.parse(userData);
                    if (parsedData && parsedData.accessToken) {
                        if (isTokenExpired(parsedData.tokenExpiry)) {
                            console.log("Token expired, logging out user");
                            localStorage.removeItem("user");
                            state.status = false;
                            state.user = null;
                            state.accessToken = null;
                        } else {
                            state.status = true;
                            state.user = parsedData.user;
                            state.accessToken = parsedData.accessToken;
                        }
                    } else {
                        state.status = false;
                        state.user = null;
                        state.accessToken = null;
                    }
                } catch (error) {
                    console.error("Error parsing user data from localStorage:", error);
                    localStorage.removeItem("user");
                    state.status = false;
                    state.user = null;
                    state.accessToken = null;
                }
            } else {
                // No user data, ensure logged out state
                state.status = false;
                state.user = null;
                state.accessToken = null;
            }
        },
    }
})

export const { login, logout, loading, checkAndValidateToken } = userSlice.actions;

export default userSlice.reducer;