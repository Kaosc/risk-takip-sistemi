import {
	getFirestore,
	collection,
	serverTimestamp,
	addDoc,
	doc,
	deleteDoc,
	updateDoc,
	getDocs,
	query,
	orderBy,
} from "@react-native-firebase/firestore"
import { COLLECTIONS } from "../enums"

const db = getFirestore()

// add, update, getAll, getById, delete

export const getAllRisks = async (): Promise<Risk[]> => {
	try {
		const risksRef = collection(db, COLLECTIONS.RISKS)
		const q = query(risksRef, orderBy("createdAt", "desc"))
		const snapshot = await getDocs(q)

		const risks: Risk[] = snapshot.docs.map((doc) => {
			const data = doc.data() as Risk
			return { ...data, id: doc.id }
		})

		return risks
	} catch (error: any) {
		console.error("Tüm riskler alınırken hata oluştu:", error)
		return []
	}
}

export const addRisk = async (riskData: Partial<Risk>) => {
	try {
		const risksRef = collection(db, COLLECTIONS.RISKS)

		const docRef = await addDoc(risksRef, {
			...riskData,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		})

		console.log("Risk başarıyla eklendi, ID:", docRef.id)

		return { success: true, id: docRef.id }
	} catch (error: any) {
		console.error("Risk eklenirken hata oluştu:", error)
		return { success: false, error: error.message }
	}
}

export const updateRisk = async (id: string, data: Partial<Risk>) => {
	try {
		await updateDoc(doc(db, COLLECTIONS.RISKS, id), {
			...data,
			updatedAt: serverTimestamp(),
		})

		return { success: true }
	} catch (error: any) {
		console.error("Risk güncellenirken hata oluştu:", error)
		return { success: false, error: error.message }
	}
}

export const deleteRisk = async (id: string) => {
	try {
		await deleteDoc(doc(db, COLLECTIONS.RISKS, id))
		return { success: true }
	} catch (error: any) {
		console.error("Risk silinirken hata oluştu:", error)
		return { success: false, error: error.message }
	}
}
