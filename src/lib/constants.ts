import { AllIconNames } from "../types/icon"

export const LangDBList = {
	tr: require("../lang/tr.json"),
	en: require("../lang/en.json"),
}

export const BOTTOM_TAB_HEIGHT = 64

export const typeIconMap: Record<RiskType, AllIconNames> = {
	risk: "shield-alert-outline",
	accident: "ambulance",
	nearmiss: "alert-circle-outline",
}

export const roleNameMap 	: Record<UserRole, string> = {
	ADMIN: "İSG PERSONELİ",
	STAFF: "SAHA PERSONELİ",
	MEMBER: "ÇALIŞAN",
}
