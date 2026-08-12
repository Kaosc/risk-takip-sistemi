import * as WebBrowser from "expo-web-browser"
import { t } from "i18next"
import { Linking, Platform, ToastAndroid } from "react-native"

import appJson from "../../app.json"
import { DEV_MAIL, WEBSITE_URL } from "./constants"

export const openPrivacyPolicy = (lang: "tr" | "en") => {
	const link = lang === "tr" ? "privacy/tr" : "privacy"
	WebBrowser.openBrowserAsync(`${WEBSITE_URL}/risktrack/${link}`)
}

export const openTermsOfService = (lang: "tr" | "en") => {
	const link = lang === "tr" ? "terms/tr" : "terms"
	WebBrowser.openBrowserAsync(`${WEBSITE_URL}/risktrack/${link}`)
}

export const contact = (report: boolean = false) => {
	const type = report ? t("issueReport") : t("feedback")
	try {
		Linking.openURL(`mailto:${DEV_MAIL}?subject=[risktrack]-[${type}]-[${appJson.expo.version}]-[OSV:${Platform.Version}]`)
	} catch (e) {
		ToastAndroid.show(t("contactError"), ToastAndroid.SHORT)
	}
}
