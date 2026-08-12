import { createSlice } from "@reduxjs/toolkit"

export const configSlice = createSlice({
	name: "config",
	initialState: {
		isConnected: true,
	},
	reducers: {
		setConfig: (state, action) => {
			return { ...state, ...action.payload }
		},
	},
})

export const { setConfig } = configSlice.actions
