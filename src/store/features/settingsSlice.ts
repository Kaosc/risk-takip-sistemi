import { Appearance } from "react-native"
import { createSlice } from "@reduxjs/toolkit"

import { getIsThemeAuto, getSettings, storeAutoTheme,  } from "../../utils/storage"

import { getLanguageCode } from "../../lib/language"

const getDeviceTheme = () => {
	const deviceTheme = Appearance.getColorScheme()
	return {
		darkMode: deviceTheme === "dark" ? true : false,
	}
}

const initialSettings = (): Settings => {
	const initialData: Settings = {
		lang: "tr",
		darkMode: true,
	}

	try {
		const settings = getSettings()
		const isThemeAuto = getIsThemeAuto()
		const deviceTheme = getDeviceTheme()

		if (settings) {
			return {
				...initialData,
				...settings,
				darkMode: isThemeAuto ? deviceTheme.darkMode : settings.darkMode,
			}
		} else {
			storeAutoTheme()

			const lang = getLanguageCode() as "tr" | "en"

			return {
				...initialData,
				lang: lang,
				darkMode: deviceTheme.darkMode,
			}
		}
	} catch (e) {
		return initialData
	}
}

export const settingsSlice = createSlice({
	name: "settings",
	initialState: initialSettings(),
	reducers: {
		setSettings: (state, action) => {
			const settings = {
				...state,
				...action.payload,
			}
			return settings
		},
	},
})

export const { setSettings } = settingsSlice.actions
