import {createSlice} from '@reduxjs/toolkit'

const initialState = {
    currentAdmin: null,
    error: null,
    loading: false
}

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        signInStart: (state) => {
            state.loading = true
        },
        signInSuccess: (state, action) => {
            state.currentAdmin = action.payload
            state.loading = false
            state.error = null
        },
        signInFailure: (state, action) => {
            state.error = action.payload
            state.loading = false
        },
        updateStart: (state) => {
            state.loading = true
        },
        updateSuccess: (state, action) => {
            state.currentAdmin = action.payload
            state.loading = false
            state.error = null
        },
        updateFailure: (state, action) => {
            state.error = action.payload
            state.loading = false
        },
        deleteAdminStart: (state) => {
            state.loading = true
        },
        deleteAdminSuccess: (state, action) => {
            state.currentAdmin = null
            state.loading = false
            state.error = null
        },
        deleteAdminFailure: (state, action) => {
            state.error = action.payload
            state.loading = false
        },
        signOutAdminStart: (state) => {
            state.loading = true
        },
        signOutAdminSuccess: (state, action) => {
            state.currentAdmin = null
            state.loading = false
            state.error = null
        },
        signOutAdminFailure: (state, action) => {
            state.error = action.payload
            state.loading = false
        }
    }
})

export const {signInStart, signInSuccess, signInFailure, updateStart, updateSuccess, updateFailure, deleteAdminStart, deleteAdminSuccess, deleteAdminFailure, signOutAdminStart, signOutAdminSuccess, signOutAdminFailure} = adminSlice.actions

export default adminSlice.reducer
