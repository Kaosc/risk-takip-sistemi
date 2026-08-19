import { RemoteMessage } from "@react-native-firebase/messaging"
import { getNotifications, storeNotifications } from "../utils/storage"
import { nanoid } from "@reduxjs/toolkit"

export const processNotification = (remoteMessage: RemoteMessage): NotificationData | null => {
	let newNotification: NotificationData | null = null

	try {
		newNotification = {
			id: nanoid(),
			title: remoteMessage.notification?.title || "Yeni Bildirim",
			body: remoteMessage.notification?.body || "---",
			date: new Date().toISOString(),
			riskId: (remoteMessage.data?.riskId as string) || "",
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
		if (!notifications) {
			storeNotifications([notification])
		} else {
			storeNotifications([notification, ...notifications])
		}
	} catch (e) {
		console.error("Notification kaydedilirken hata oluştu:", e)
	}
}
