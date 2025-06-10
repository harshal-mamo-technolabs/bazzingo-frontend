import { createSlice } from "@reduxjs/toolkit";
import { USER_SLICE_NAME } from "../utils/constant";
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
        }
    }
})

export const { login, logout, loading } = userSlice.actions;

export default userSlice.reducer;