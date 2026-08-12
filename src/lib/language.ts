import { getSettings } from "../utils/storage"
import { getLocales } from "expo-localization"

export function getLanguageCode(): "tr" | "en" {
	try {
		const localLang = getSettings()?.lang
		if (localLang) {
			return localLang
		}

		const locales = getLocales()
		if (locales && Array.isArray(locales)) {
			const languageCode = locales[0]?.languageCode
			if (languageCode) {
				return languageCode === "tr" ? "tr" : "en"
			}

			const regionCode = locales[0]?.regionCode
			if (regionCode) {
				return regionCode === "TR" ? "tr" : "en"
			}
		}

		return "en"
	} catch (e) {
		console.debug("index.ts:202:", e)
		return "en"
	}
}
