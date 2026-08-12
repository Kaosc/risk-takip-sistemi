import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import { LangDBList } from "./src/lib/constants"
import { getLanguageCode } from "./src/lib/language"

i18n.use(initReactI18next).init({
	compatibilityJSON: "v4",
	lng: getLanguageCode(),
	fallbackLng: "en",
	resources: {
		en: {
			translation: LangDBList.en,
		},
		tr: {
			translation: LangDBList.tr,
		},
	},
})

export default i18n
