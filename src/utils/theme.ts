import { DarkTheme, DefaultTheme } from "@react-navigation/native"
import { ColorValue } from "react-native"

export const NavigatorLight: ReactNavigation.Theme = {
	...DefaultTheme,
	dark: false,
	colors: {
		primary: "#000000",
		background: "#ffffff",
		card: "#ffffff",
		text: "#000000",
		border: "#313131",
		notification: "rgb(144, 110, 238)",
	},
}

export const NavigatorDark: ReactNavigation.Theme = {
	...DarkTheme,
	dark: true,
	colors: {
		primary: "#ffffff",
		background: "#000000",
		card: "#000000",
		text: "#ffffff",
		border: "#696969",
		notification: "rgb(144, 110, 238)",
	},
}

export const Theme = {
	dark: {
		background: "#000000",
		cardBackground: "#111111",
		text: "#ffffff",
		border: "#333333",
		gradient: ["#272727", "#1b1b1b"] as [ColorValue, ColorValue],
		green: {
			bg: "#1f492d",
			fg: "#27f08b",
		},
		red: {
			bg: "#3a1a1a",
			fg: "#ff6b6b",
		},
		orange: {
			bg: "#3a2a1a",
			fg: "#ffb347",
		},
		blue: {
			bg: "#1a2a3a",
			fg: "#4da6ff",
		},
		violet: {
			bg: "#2a1a3a",
			fg: "#b366ff",
		},
		primary: {
			bg: "#444444",
			fg: "#ffffff",
		},
	},
	light: {
		background: "#ffffff",
		cardBackground: "#f1f1f1",
		text: "#000000",
		border: "#c9c9c9",
		gradient: ["#e4e4e4", "#ffffff"] as [ColorValue, ColorValue],
		green: {
			bg: "#b5ffb3",
			fg: "#0b8b4b",
		},
		red: {
			bg: "#ffdae0",
			fg: "#c62828",
		},
		orange: {
			bg: "#fff0e0",
			fg: "#ff8c00",
		},
		blue: {
			bg: "#e0f0ff",
			fg: "#1a73e8",
		},
		violet: {
			bg: "#f0e0ff",
			fg: "#8e24aa",
		},
		primary: {
			bg: "#bbbbbb",
			fg: "#000000",
		},
	},
}
