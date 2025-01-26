import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currentAdmin: null,
    error: null,
    loading: false,
    showWelcomeMessage: false,
};

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        signInStart: (state) => {
            state.loading = true;
        },
        signInSuccess: (state, action) => {
            state.currentAdmin = action.payload;
            state.loading = false;
            state.error = null;
            state.showWelcomeMessage = true; // Show welcome message on sign in
        },
        signInFailure: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        updateStart: (state) => {
            state.loading = true;
        },
        updateSuccess: (state, action) => {
            state.currentAdmin = action.payload;
            state.loading = false;
            state.error = null;
        },
        updateFailure: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        deleteAdminStart: (state) => {
            state.loading = true;
        },
        deleteAdminSuccess: (state, action) => {
            state.currentAdmin = null;
            state.loading = false;
            state.error = null;
        },
        deleteAdminFailure: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        signOutAdminStart: (state) => {
            state.loading = true;
        },
        signOutAdminSuccess: (state, action) => {
            state.currentAdmin = null;
            state.loading = false;
            state.error = null;
            state.showWelcomeMessage = false; // Reset welcome message on sign out
        },
        signOutAdminFailure: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        resetWelcomeMessage: (state) => {
            state.showWelcomeMessage = false; // Action to reset the welcome message
        },
    },
});

export const {
    signInStart,
    signInSuccess,
    signInFailure,
    updateStart,
    updateSuccess,
    updateFailure,
    deleteAdminStart,
    deleteAdminSuccess,
    deleteAdminFailure,
    signOutAdminStart,
    signOutAdminSuccess,
    signOutAdminFailure,
    resetWelcomeMessage, // Export the reset action
} = adminSlice.actions;

export default adminSlice.reducer;