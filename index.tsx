import { LogBox } from "react-native"

LogBox.ignoreLogs([
	"SafeAreaView has been deprecated and will be removed in a future release. Please use 'react-native-safe-area-context' instead. See https://github.com/AppAndFlow/react-native-safe-area-context",
])

import messaging from "@react-native-firebase/messaging"
import { registerRootComponent } from "expo"
import { I18nextProvider } from "react-i18next"
import { Provider } from "react-redux"

import { getLatestNotifications, storeLatestNotifications } from "./src/utils/storage"
import ToastNotification from "./src/components/ToastNotification"
import { store } from "./src/store/store"
import i18n from "./i18n"
import App from "./App"

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
	try {
		let notifications = getLatestNotifications()

		const newNotification: NotificationData = {
			id: remoteMessage.messageId,
			title: remoteMessage.notification?.title || "Yeni Bildirim",
			body: remoteMessage.notification?.body || "",
			date: new Date().toISOString(),
			riskId: remoteMessage.data?.riskId,
			read: false,
		}

		notifications.unshift(newNotification)

		if (notifications.length > 20) {
			notifications = notifications.slice(0, 20)
		}

		storeLatestNotifications(notifications)
	} catch (e) {
		console.error("Bildirim kaydedilirken hata oluştu:", e)
	}
})

const IndexApp = () => {
	return (
		<I18nextProvider
			i18n={i18n}
			defaultNS={"translation"}
		>
			<Provider store={store}>
				<App />
			</Provider>
			<ToastNotification />
		</I18nextProvider>
	)
}

registerRootComponent(IndexApp)
