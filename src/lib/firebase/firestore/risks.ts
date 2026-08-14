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
	count,
	getCountFromServer,
	where,
	getDoc,
} from "@react-native-firebase/firestore"
import { COLLECTIONS } from "../enums"

const db = getFirestore()

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

export const assignRiskToStaff = async (riskId: string, taskDescription: string, dueDate: Date | null, staffId: string) => {
	try {
		await updateDoc(doc(db, COLLECTIONS.RISKS, riskId), {
			assignedTo: staffId,
			taskDescription: taskDescription,
			dueDate: dueDate,
		})

		return { success: true }
	} catch (error: any) {
		console.error("Risk personel ataması yapılırken hata oluştu:", error)
		return { success: false, error: error.message }
	}
}

export const updateStatus = async (id: string, newStatus: RiskStatus) => {
	try {
		await updateDoc(doc(db, COLLECTIONS.RISKS, id), {
			status: newStatus,
			updatedAt: serverTimestamp(),
		})

		return { success: true }
	} catch (error: any) {
		console.error("Risk durumu güncellenirken hata oluştu:", error)
		return { success: false, error: error.message }
	}
}

export const getCountOfRisksByStatus = async (): Promise<Record<RiskStatus, number>> => {
	const statuses: RiskStatus[] = ["new", "inprogress", "pending", "completed"]
	const counts: Record<RiskStatus, number> = {
		new: 0,
		inprogress: 0,
		pending: 0,
		completed: 0,
	}

	try {
		for (const status of statuses) {
			const q = query(collection(db, COLLECTIONS.RISKS), where("status", "==", status))
			const snapshot = await getCountFromServer(q)
			counts[status] = snapshot.data().count
		}

		return counts
	} catch (error: any) {
		console.error("Risk durum sayıları alınırken hata oluştu:", error)
		return counts
	}
}

export const getRisksByUserId = async (userId: string): Promise<Risk[]> => {
	try {
		const risksRef = collection(db, COLLECTIONS.RISKS)
		const q = query(risksRef, where("createdById", "==", userId), orderBy("createdAt", "desc"))
		const snapshot = await getDocs(q)

		return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Risk)
	} catch (error: any) {
		console.error("Kullanıcıya ait riskler alınırken hata oluştu:", error)
		return []
	}
}

export const getRisksAssignedToStaff = async (staffId: string): Promise<Risk[]> => {
	try {
		const risksRef = collection(db, COLLECTIONS.RISKS)
		const q = query(risksRef, where("assignedTo", "==", staffId), orderBy("createdAt", "desc"))
		const snapshot = await getDocs(q)

		return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Risk)
	} catch (error: any) {
		console.error("Personel atanan riskler alınırken hata oluştu:", error)
		return []
	}
}

export const getRiskById = async (riskId: string): Promise<Risk | null> => {
	try {
		const riskDoc = await getDoc(doc(db, COLLECTIONS.RISKS, riskId))
		const riskData = riskDoc.data() as Risk | undefined

		if (!riskData) {
			console.error("Risk bulunamadı:", riskId)
			return null
		}
		return { ...riskData }
	} catch (error: any) {
		console.error("Risk alınırken hata oluştu:", error)
		return null
	}
}
