import { useEffect, createContext, useRef } from "react"
import { getMessaging } from "@react-native-firebase/messaging"
import FirebaseHandler from "../lib/firebase/firebase"
import { useMMKVObject } from "react-native-mmkv"

const messaging = getMessaging()

export const FirebaseContext = createContext({})

export default function FirebaseProvider({ children }: { children: React.ReactNode }) {
	const [notifications, setNotifications] = useMMKVObject<NotificationData[]>("latestNotifications")
	const firebaseInit = useRef(false)

	/////////////////////////////////////////
	// #region FIREBASE INIT
	/////////////////////////////////////////

	const initFirebase = async () => {
		if (!firebaseInit.current) {
			await FirebaseHandler.initAppCheck().then(async () => {
				firebaseInit.current = true
			})
		}
	}

	useEffect(() => {
		initFirebase()
	}, [])

	///////////////////////////////////////////
	// #region NOTIFICATION HANDLER
	///////////////////////////////////////////

	useEffect(() => {
		const unsubscribe = messaging.onMessage(async (remoteMessage) => {
			console.log("Foreground notification received:", remoteMessage.messageId)

			try {
				let newNotifications = notifications || []

				const newNotification: NotificationData = {
					id: remoteMessage.messageId,
					title: remoteMessage.notification?.title || "Yeni Bildirim",
					body: remoteMessage.notification?.body || "",
					date: new Date().toISOString(),
					riskId: remoteMessage.data?.riskId,
					read: false,
				}

				newNotifications.unshift(newNotification)

				if (newNotifications.length > 20) {
					newNotifications = newNotifications.slice(0, 20)
				}

				setNotifications(newNotifications)
			} catch (e) {
				console.error("Foreground notification kaydedilirken hata oluştu:", e)
			}
		})

		return unsubscribe
	}, [])

	return <FirebaseContext.Provider value={{}}>{children}</FirebaseContext.Provider>
}
