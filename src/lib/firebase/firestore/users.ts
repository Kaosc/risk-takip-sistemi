import { getFirestore, doc, getDoc, setDoc, query, where, collection, getDocs, updateDoc } from "@react-native-firebase/firestore"
import { COLLECTIONS } from "../enums"
import { getMessaging, getToken } from "@react-native-firebase/messaging"
import { getAuth } from "@react-native-firebase/auth"

const db = getFirestore()
const messaging = getMessaging()
const auth = getAuth()

export const getStaffUserById = async (uid: string): Promise<User | null> => {
	try {
		const docRef = doc(db, COLLECTIONS.USERS, uid)
		const docSnap = await getDoc(docRef)

		if (docSnap.exists()) {
			const data = docSnap.data() as User
			return data
		}

		return null
	} catch (e) {
		console.debug("[FIRESTORE] getStaffUserById:", e)
		throw e
	}
}

export const addUser = async (staffData: User): Promise<boolean> => {
	try {
		await setDoc(doc(db, COLLECTIONS.USERS, staffData.uid), staffData)
		return true
	} catch (error: any) {
		console.debug("[Firestore] addStaff error:", error?.message || error)
		return false
	}
}

export const getStaffs = async (): Promise<User[]> => {
	try {
		const q = query(collection(db, COLLECTIONS.USERS), where("role", "==", "STAFF"))

		const querySnapshot = await getDocs(q)
		const staffs: User[] = []

		querySnapshot.forEach((doc) => {
			const data = doc.data() as User
			staffs.push(data)
		})

		return staffs
	} catch (e) {
		console.debug("[FIRESTORE] getStaffs:", e)
		throw e
	}
}

export const assignFCMTokenToUser = async (): Promise<string | null> => {
	try {
		const currentToken = await getToken(messaging)

		const user = auth.currentUser
		if (!user) {
			console.debug("[FIRESTORE] assignFCMTokenToUser: No authenticated user found.")
			return null
		}

		const userRef = doc(db, COLLECTIONS.USERS, user.uid)
		const userSnap = await getDoc(userRef)

		if (userSnap.exists()) {
			const userData = userSnap.data()
			
			if (userData.fcmToken !== currentToken) {
				await updateDoc(userRef, {
					fcmToken: currentToken,
				})
				console.debug("[FIRESTORE] assignFCMTokenToUser: FCM Token updated in Firestore:", currentToken)
			}
		}

		return currentToken
	} catch (error) {
		console.debug("[FIRESTORE] assignFCMTokenToUser error:", error)
		return null
	}
}