import { getFirestore, doc, getDoc, setDoc, query, where, collection, getDocs } from "@react-native-firebase/firestore"
import { COLLECTIONS } from "../enums"

const db = getFirestore()

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
