import { getFirestore, doc, getDoc, setDoc } from "@react-native-firebase/firestore"
import { COLLECTIONS } from "../enums"

const db = getFirestore()

export const getStaffUserById = async (uid: string): Promise<StaffUser | null> => {
	try {
		const docRef = doc(db, COLLECTIONS.USERS, uid)
		const docSnap = await getDoc(docRef)

		if (docSnap.exists()) {
			const data = docSnap.data() as StaffUser
			return data
		}

		return null
	} catch (e) {
		console.debug("[FIRESTORE] getStaffUserById:", e)
		throw e
	}
}

export const addStaff = async (staffData: StaffUser): Promise<boolean> => {
	try {
		await setDoc(doc(db, COLLECTIONS.USERS, staffData.uid), staffData)
		return true
	} catch (error: any) {
		console.debug("[Firestore] addStaff error:", error?.message || error)
		return false
	}
}
