import { RemoteMessage } from "@react-native-firebase/messaging"
import { getNotifications, storeNotifications } from "../utils/storage"

export const processNotification = (remoteMessage: RemoteMessage): NotificationData | null => {
	let newNotification: NotificationData | null = null

	try {
		newNotification = {
			id: remoteMessage.messageId,
			title: remoteMessage.notification?.title || "Yeni Bildirim",
			body: remoteMessage.notification?.body || "",
			date: new Date().toISOString(),
			riskId: remoteMessage.data?.riskId,
			read: false,
		}
	} catch (e) {
		console.error("Foreground notification kaydedilirken hata oluştu:", e)
	}

	return newNotification
}

export const saveNotification = (notification: NotificationData) => {
	try {
		const notifications = getNotifications()
		storeNotifications([notification, ...notifications])
	} catch (e) {
		console.error("Notification kaydedilirken hata oluştu:", e)
	}
}
