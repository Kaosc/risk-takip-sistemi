import { getAuth } from "@react-native-firebase/auth"
import {
	collection,
	doc,
	getDocs,
	getFirestore,
	limit,
	orderBy,
	query,
	serverTimestamp,
	setDoc,
	updateDoc,
	where,
} from "@react-native-firebase/firestore"
import { t } from "i18next"

import { COLLECTIONS } from "../enums"
import { getLockerByUserUid } from "./lockers"
import { toDate } from "../../../utils/date"

const auth = getAuth()
const db = getFirestore()

export const isMemberCheckedInToday = async (memberUid: string): Promise<boolean> => {
	try {
		// Q the latest checking time by this user.
		const checkInsCollection = collection(db, COLLECTIONS.CHECKINS)
		const q = query(checkInsCollection, where("memberUid", "==", memberUid), orderBy("checkInTime", "desc"), limit(1))
		const querySnapshot = await getDocs(q)

		if (querySnapshot.empty) {
			return false
		}

		const latestCheckInDoc = querySnapshot.docs[0]
		const latestCheckInData = latestCheckInDoc.data() as CheckIn

		// Check if the member has already checked out
		if (latestCheckInData.checkOutTime !== null) {
			return false
		}

		const checkInDate = toDate(latestCheckInData.checkInTime)
		if (!checkInDate) {
			console.debug("[FIRESTORE] isMemberCheckedInToday: Invalid check-in time for memberUid:", memberUid)
			return false
		}

		const today = new Date()
		today.setHours(0, 0, 0, 0)

		return checkInDate >= today
	} catch (e) {
		console.debug("[FIRESTORE] isMemberCheckedInToday:", e)
		return false
	}
}

export const getAllCheckIns = async (): Promise<CheckIn[] | null> => {
	try {
		const checkInsCollection = collection(db, COLLECTIONS.CHECKINS)
		const q = query(checkInsCollection, orderBy("checkInTime", "desc"))
		const querySnapshot = await getDocs(q)
		const checkIns: CheckIn[] = []

		querySnapshot.forEach((doc) => {
			const checkInData = doc.data() as CheckIn
			checkIns.push(checkInData)
		})

		return checkIns
	} catch (e) {
		console.debug("[FIRESTORE] getAllCheckIns:", e)
		return null
	}
}

export const getCheckinsByDate = async (dateString?: string): Promise<CheckIn[] | null> => {
	if (!dateString) return []

	try {
		const startDate = new Date(dateString)
		startDate.setHours(0, 0, 0, 0)

		const endDate = new Date(startDate)
		endDate.setDate(endDate.getDate() + 1)

		const checkInsCollection = collection(db, COLLECTIONS.CHECKINS)

		const q = query(
			checkInsCollection,
			where("checkInTime", ">=", startDate),
			where("checkInTime", "<", endDate),
			orderBy("checkInTime", "desc"),
		)

		const querySnapshot = await getDocs(q)

		if (querySnapshot.empty) {
			return []
		}

		const checkIns: CheckIn[] = []
		querySnapshot.forEach((doc) => {
			const checkInData = doc.data() as CheckIn
			checkIns.push(checkInData)
		})

		return checkIns
	} catch (e) {
		console.debug("[FIRESTORE] getCheckinsByDate:", e)
		throw e
	}
}

export const checkInMember = async (checkInData: CheckInQRData): Promise<boolean> => {
	try {
		const checkInRef = doc(collection(db, COLLECTIONS.CHECKINS))

		// Check is user checkin today
		const isCheckedInToday = await isMemberCheckedInToday(checkInData.memberUid)

		if (isCheckedInToday) {
			console.debug("[FIRESTORE] checkInMember: Member has already checked in today for memberUid:", checkInData.memberUid)
			toast.show(t("checkin_already_checked_in"), { type: "warning", duration: 5000 })
			return false
		}

		const data: CheckIn = {
			memberUid: checkInData.memberUid,
			firstName: checkInData.firstName,
			lastName: checkInData.lastName,
			checkInTime: serverTimestamp(),
			checkOutTime: null,
			lockerIdAtCheckout: null,
			lastCheckedInBy: auth.currentUser?.email || "unknown",
		}

		await setDoc(checkInRef, data)
		return true
	} catch (e) {
		toast.show(t("checkin_failed"), {
			type: "danger",
		})
		console.debug("[FIRESTORE] checkInMember:", e)
		return false
	}
}

export const checkOutMember = async (checkInData: CheckInQRData): Promise<boolean> => {
	try {
		// Q the latest check-in
		const checkInRef = collection(db, COLLECTIONS.CHECKINS)
		const q = query(checkInRef, where("memberUid", "==", checkInData.memberUid), orderBy("checkInTime", "desc"), limit(1))
		const querySnapshot = await getDocs(q)

		if (querySnapshot.empty && querySnapshot.docs.length === 0) {
			console.debug("[FIRESTORE] checkOutMember: No check-in record found for memberUid:", checkInData.memberUid)
			throw new Error(t("checkin_not_found"))
		}

		// Unassing locker if any
		let locker
		try {
			locker = await getLockerByUserUid(checkInData.memberUid)

			if (locker) {
				const lockerRef = doc(db, COLLECTIONS.LOCKERS, locker.id.toString())
				await updateDoc(lockerRef, {
					isOccupied: false,
					occupiedByUid: null,
					occupiedAt: null,
				})
				toast.show(t("locker_removed_success"), { type: "success", duration: 7000 })
			}
		} catch (e) {
			console.info("[FIRESTORE] checkOutMember: Error fetching locker for memberUid:", checkInData.memberUid, e)
		}

		// Check if the member has already checked out
		const latestCheckInDoc = querySnapshot.docs[0]
		const latestCheckInData = latestCheckInDoc.data() as CheckIn

		if (latestCheckInData.checkOutTime !== null) {
			console.debug("[FIRESTORE] checkOutMember: Member has already checked out for memberUid:", checkInData.memberUid)
			throw new Error(t("checkin_already_checked_out"))
		}

		// Checkout
		const checkInDoc = querySnapshot.docs[0]

		const data: CheckIn = {
			...(checkInDoc.data() as CheckIn),
			checkOutTime: serverTimestamp(),
			lockerIdAtCheckout: locker ? locker.id : null,
			lastCheckedOutBy: auth.currentUser?.email || "unknown",
		}

		await updateDoc(checkInDoc.ref, { ...data })

		toast.show(t("checkout_success"), { type: "success", duration: 5000 })
		return true
	} catch (e: any) {
		throw new Error(e?.message || t("checkin_checkout_failed"))
	}
}
