import { Appearance } from "react-native"
import { SystemBars } from "react-native-edge-to-edge"

import { getIsThemeAuto, storageRemoveKey, storeAutoTheme } from "./storage"
import { setSettings } from "../store/features/settingsSlice"
import { AllIconNames } from "../types/icon"

type ToggleThemeParams = {
	darkMode: boolean
	dispatch: any
	setThemeIcon: (name: AllIconNames) => void
}

export default function toggleTheme({ darkMode, dispatch, setThemeIcon }: ToggleThemeParams) {
	let newDarkMode: boolean = false

	const autoTheme = getIsThemeAuto()

	if (autoTheme) {
		newDarkMode = true
		storageRemoveKey("autoTheme")
		setThemeIcon("weather-night")
	} else if (!darkMode && !autoTheme) {
		storeAutoTheme()
		newDarkMode = Appearance.getColorScheme() === "dark" ? true : false
		setThemeIcon("theme-light-dark")
	} else {
		newDarkMode = !darkMode
		storageRemoveKey("autoTheme")
		setThemeIcon(newDarkMode ? "weather-night" : "white-balance-sunny")
	}

	dispatch(setSettings({ darkMode: newDarkMode }))
}

export function setExternalTheme(darkMode: boolean) {
	SystemBars.setStyle(darkMode ? "light" : "dark")
}
