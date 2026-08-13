import * as Notifications from "expo-notifications"

export const requestNotificationPermission = async () => {
	try {
		 await Notifications.requestPermissionsAsync()
	} catch (e) {
		console.debug("Permissions.ts - Notification permission error:", e)
		return false
	}
}