import { createMMKV } from "react-native-mmkv"

export const storage = createMMKV()

export const storeAutoTheme = () => storage.set("autoTheme", true)
export const getIsThemeAuto = () => storage.getBoolean("autoTheme")

export const storeSettings = async (settings: Settings) => storage.set("settings", JSON.stringify(settings))
export const getSettings = (): Settings => JSON.parse(storage.getString("settings") || "null")

export const storeStaffCredentials = (email: string, password: string) => {
	storage.set("staffEmail", email)
	storage.set("staffPassword", password)
}

export const getStaffCredentials = (): { email: string; password: string } | null => {
	const email = storage.getString("staffEmail")
	const password = storage.getString("staffPassword")
	if (email && password) return { email, password }
	return null
}

export const clearUser = () => {
	storage.remove("auth")
	storage.remove("role")
	storage.remove("staffEmail")
	storage.remove("staffPassword")
}

/////////////////////////////////// DELETE ////////////////////////////////

export const storageRemoveKey = (key: string) => storage.remove(key)
export const clearAllData = async () => storage.clearAll()
