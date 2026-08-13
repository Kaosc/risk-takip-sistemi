import  { useEffect, createContext, useRef } from "react"
import { getMessaging,  } from "@react-native-firebase/messaging"
import FirebaseHandler from "../lib/firebase/firebase"

const messaging = getMessaging()

export const FirebaseContext = createContext({})

export default function FirebaseProvider({ children }: { children: React.ReactNode }) {
	
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


	// TODO: Handle foreground notifications like show them in the alert card in home screen
	useEffect(() => {
		const unsubscribe = messaging.onMessage(async (remoteMessage) => {
			console.log("remoteMessage: ", remoteMessage)
		})

		return unsubscribe
	}, [])

	return <FirebaseContext.Provider value={{}}>{children}</FirebaseContext.Provider>
}
