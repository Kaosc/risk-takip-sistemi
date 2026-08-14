import { registerRootComponent } from "expo"
import { I18nextProvider } from "react-i18next"
import { Provider } from "react-redux"
import messaging from "@react-native-firebase/messaging"

import ToastNotification from "./src/components/ToastNotification"
import { processNotification, saveNotification } from "./src/lib/notifications"
import { store } from "./src/store/store"
import i18n from "./i18n"
import App from "./App"

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
	try {
		console.info("Background message received!")
		const notification = processNotification(remoteMessage)
		if (notification) {
			saveNotification(notification)
		}
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
