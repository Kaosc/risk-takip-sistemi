import {
	getFirestore,
	collection,
	updateDoc,
	deleteDoc,
	doc,
	getDocs,
	getDoc,
	serverTimestamp,
	setDoc,
	query,
	increment,
	orderBy,
	startAfter,
	limit,
} from "@react-native-firebase/firestore"

import { COLLECTIONS } from "../enums"

const db = getFirestore()

export const addMember = async (memberData: Member): Promise<boolean> => {
	try {
		const docRef = doc(db, COLLECTIONS.MEMBERS, memberData.uid)
		const member: Member = {
			...memberData,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		}
		await setDoc(docRef, member)

		return !!docRef.id
	} catch (e) {
		console.debug("[FIRESTORE] addMember:", e)
		throw e
	}
}

export const updateMember = async (updatedMemberData: Member): Promise<boolean> => {
	try {
		const memberId = updatedMemberData.uid
		const memberRef = doc(db, COLLECTIONS.MEMBERS, memberId)

		await updateDoc(memberRef, {
			...updatedMemberData,
			updatedAt: serverTimestamp(),
		})

		return true
	} catch (e) {
		console.debug("[FIRESTORE] updateMember:", e)
		return false
	}
}

export const deleteMember = async (memberId: string): Promise<void> => {
	try {
		const memberRef = doc(db, COLLECTIONS.MEMBERS, memberId)
		await deleteDoc(memberRef)
	} catch (e) {
		console.debug("[FIRESTORE] deleteMember:", e)
		throw e
	}
}

export const getMembersPaged = async (lastSnapshot?: any): Promise<{ members: Member[]; lastSnapshot: any }> => {
	const max = 7

	try {
		const membersRef = collection(db, COLLECTIONS.MEMBERS)
		const q = lastSnapshot
			? query(membersRef, orderBy("createdAt", "desc"), startAfter(lastSnapshot), limit(max))
			: query(membersRef, orderBy("createdAt", "desc"), limit(max))

		const snapshot = await getDocs(q)

		if (snapshot.empty) {
			console.debug("All available members are fetched.")
			return { members: [], lastSnapshot: null }
		}

		const lastDocSnapshot = snapshot.docs[snapshot.docs.length - 1]
		const members = snapshot.docs.map((docSnap) => docSnap.data()) as Member[]

		return { members: members, lastSnapshot: lastDocSnapshot }
	} catch (e) {
		console.debug("[FIRESTORE] getMembersPaged:", e)
		throw e
	}
}

export const getMemberById = async (memberId: string): Promise<Member | null> => {
	try {
		const memberRef = doc(db, COLLECTIONS.MEMBERS, memberId)
		const docSnap = await getDoc(memberRef)

		if (docSnap.exists()) {
			return { ...docSnap.data() } as Member
		}

		return null
	} catch (e) {
		console.debug("[FIRESTORE] getMemberById:", e)
		throw e
	}
}

export const inactivateMember = async (memberId: string): Promise<boolean> => {
	try {
		const memberRef = doc(db, COLLECTIONS.MEMBERS, memberId)
		await updateDoc(memberRef, {
			isActive: false,
			updatedAt: serverTimestamp(),
		})
		return true
	} catch (e) {
		console.debug("[FIRESTORE] inactivateMember:", e)
		return false
	}
}

export const activateMember = async (memberId: string): Promise<boolean> => {
	try {
		const memberRef = doc(db, COLLECTIONS.MEMBERS, memberId)
		await updateDoc(memberRef, {
			isActive: true,
			updatedAt: serverTimestamp(),
		})
		return true
	} catch (e) {
		console.debug("[FIRESTORE] activateMember:", e)
		return false
	}
}

export const incrementMemberCheckInCount = async (memberId: string): Promise<boolean> => {
	try {
		const memberRef = doc(db, COLLECTIONS.MEMBERS, memberId)
		await updateDoc(memberRef, {
			totalCheckIns: increment(1),
			updatedAt: serverTimestamp(),
		})
		return true
	} catch (e) {
		console.debug("[FIRESTORE] incrementMemberCheckInCount:", e)
		return false
	}
}

export const getAllMembers = async (): Promise<Member[]> => {
	try {
		const membersRef = collection(db, COLLECTIONS.MEMBERS)
		const snapshot = await getDocs(membersRef)

		if (snapshot.empty) {
			return []
		}

		const members = snapshot.docs.map((docSnap) => docSnap.data()) as Member[]

		return members
	} catch (e) {
		console.debug("[FIRESTORE] getAllMembers:", e)
		return []
	}
}

/**
 * Keeps member sub data along with the member data only delete sensitive user personal data from the member's document. This is to comply with GDPR and other privacy regulations.
 */
export const deleteMemberAccount = async (memberId: string): Promise<boolean> => {
	try {
		const memberRef = doc(db, COLLECTIONS.MEMBERS, memberId)

		const sensitiveFieldsToDelete: Partial<Member> = {
			address: "",
			birthDate: null,
			bloodType: "",
			email: "",
			firstName: "",
			phoneNumber: "",
			lastName: "",
			emergencyContact: {
				name: "",
				phone: "",
			},
			gender: "UNSPECIFIED",
			weight: null,
			height: null,
			isActive: false,
			updatedAt: serverTimestamp(),
		}

		await updateDoc(memberRef, sensitiveFieldsToDelete)
		return true
	} catch (e) {
		console.debug("[FIRESTORE] deleteMemberAccount:", e)
		return false
	}
}
