import { createSlice } from "@reduxjs/toolkit"

export const authSlice = createSlice({
	name: "auth",
	initialState: {
		isAuthenticated: false,
		uid: undefined,
		email: undefined,
		role: undefined,
	} as Auth,
	reducers: {
		setAuth: (state, action) => {
			const settings = {
				...state,
				...action.payload,
			}
			return settings
		},
		logout(state) {
			state.isAuthenticated = false
			state.uid = undefined
			state.email = undefined
			state.role = undefined
		},
	},
})

export const { logout, setAuth } = authSlice.actions
