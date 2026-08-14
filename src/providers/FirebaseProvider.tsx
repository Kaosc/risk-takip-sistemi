import { useEffect, createContext, useRef } from "react"
import FirebaseHandler from "../lib/firebase/firebase"

export const FirebaseContext = createContext({})

export default function FirebaseProvider({ children }: { children: React.ReactNode }) {
	const firebaseInit = useRef(false)

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

	return <FirebaseContext.Provider value={{}}>{children}</FirebaseContext.Provider>
}
