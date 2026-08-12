import { configureStore } from "@reduxjs/toolkit"

import { authSlice } from "./features/authSlice"
import { configSlice } from "./features/configSlice"
import { settingsSlice } from "./features/settingsSlice"

import { storeSettings } from "../utils/storage"

export const store = configureStore({
	reducer: {
		settings: settingsSlice.reducer,
		config: configSlice.reducer,
		auth: authSlice.reducer,
	},
})

// Initialize prevState with the current state
let prevState = store.getState()

store.subscribe(() => {
	const state = store.getState()

	const { settings } = state

	if (settings !== prevState.settings) {
		storeSettings(settings)
	}

	// Update prevState for the next callback
	prevState = state
})
