import {
	createUserWithEmailAndPassword,
	getAuth,
	sendEmailVerification,
	sendPasswordResetEmail,
	signInWithEmailAndPassword,
	signOut,
	deleteUser,
} from "@react-native-firebase/auth"
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "@react-native-firebase/firestore"
import { t } from "i18next"

import { COLLECTIONS } from "./enums"
import { storeRole, storeUserAuth } from "../../utils/storage"

const auth = getAuth()
const db = getFirestore()

export const generatePassword = () => {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
	let password = ""
	for (let i = 0; i < 8; i++) {
		password += chars.charAt(Math.floor(Math.random() * chars.length))
	}
	return password
}

export const staffLogin = async (email: string, password: string) => {
	const userCredential = await signInWithEmailAndPassword(auth, email, password)
	const uid = userCredential.user.uid

	const staffRef = doc(db, COLLECTIONS.USERS, uid)
	const staffDoc = await getDoc(staffRef)

	if (!staffDoc.exists()) {
		await signOut(auth)
		throw new Error(t("staffRecordNotFound"))
	}

	storeUserAuth({ email, password })
	storeRole(staffDoc.data()?.role as UserRole)

	const data = staffDoc.data()
	return { uid, email, role: data?.role as UserRole }
}

export const memberLogin = async (email: string, password: string) => {
	try {
		const userCredential = await signInWithEmailAndPassword(auth, email, password)
		const uid = userCredential.user.uid

		if (!userCredential.user.emailVerified) {
			await sendEmailVerification(userCredential.user)
			await signOut(auth)
			throw new Error(t("emailNotVerified"))
		}

		// Check if a member doc exists with this uid
		const memberRef = doc(db, COLLECTIONS.MEMBERS, uid)
		const memberDoc = await getDoc(memberRef)

		storeUserAuth({ email, password })
		storeRole("MEMBER" as UserRole)

		if (memberDoc.exists()) {
			if (memberDoc.data()?.isActive === false) {
				await signOut(auth)
				toast.show(t("memberDeactivated"), { duration: 10000, type: "danger" })
				throw new Error(t("memberDeactivated"))
			}

			return { uid, email, role: "MEMBER" as UserRole }
		}

		// No member doc found brand new organic user
		return { isNewMember: true, uid, email, role: "MEMBER" as UserRole } as any
	} catch (e: any) {
		// Check if auth account doesn't exist but member data exists in Firestore
		// Handles the case where a member was created in Firestore but never had an auth account created
		// Which is likely to happen the member added to collection but auth acc creatiion is failed.
		if (e?.code === "auth/user-not-found") {
			try {
				const membersRef = collection(db, COLLECTIONS.MEMBERS)
				const q = query(membersRef, where("email", "==", email))
				const snapshot = await getDocs(q)

				if (!snapshot.empty) {
					// member data exists but no auth account
					throw new Error(t("memberExistsNoAccount"))
				}
			} catch (innerError: any) {
				// if its already our custom err throw it
				if (innerError?.message === t("memberExistsNoAccount")) {
					throw innerError
				}
				// otherwise ignore the firestore err and fall back
				console.debug("[AUTH] memberLogin Firestore check:", innerError?.message || innerError)
			}
		}

		console.debug("[AUTH] memberLogin:", e?.message || e)
		throw e
	}
}

export const createMemberAuthAccount = async (email: string): Promise<string | null> => {
	try {
		const password = generatePassword()
		const credential = await createUserWithEmailAndPassword(auth, email, password)
		const uid = credential.user.uid

		// Send password reset email so the member can set their own password
		await sendPasswordResetEmail(auth, email)

		return uid
	} catch (error: any) {
		console.debug("[AUTH] createMemberAuthAccount:", error?.message || error)
		const alert = (m: string) => toast.show(m, { duration: 6000, type: "danger" })

		switch (error.code) {
			case "auth/email-already-in-use":
				alert(t("emailAlreadyInUse"))
				break
			case "auth/invalid-email":
				alert(t("invalidEmail"))
				break
			default:
				alert(t("registrationError"))
				break
		}
		return null
	}
}

export const registerMember = async (email: string, password: string) => {
	let uid: string | null = null

	try {
		const credential = await createUserWithEmailAndPassword(auth, email, password)
		await sendEmailVerification(credential.user)
		await signOut(auth)
		toast.show(t("registerSuccess"), { duration: 10000, type: "success" })
		uid = credential.user.uid
	} catch (error: any) {
		console.debug("[AUTH] registerMember:", error?.message || error)
		const alert = (m: string) => toast.show(m, { duration: 6000, type: "danger" })

		switch (error.code) {
			case "auth/email-already-in-use":
				alert(t("emailAlreadyInUse"))
				break
			case "auth/invalid-email":
				alert(t("invalidEmail"))
				break
			case "auth/weak-password":
				alert(t("weakPassword"))
				break
			default:
				alert(t("registrationError"))
				break
		}
	}

	return uid
}

export const resetPassword = async (email: string): Promise<boolean> => {
	try {
		await sendPasswordResetEmail(auth, email)
		toast.show(t("resetEmailSent"), { duration: 6000, type: "success" })
		return true
	} catch (error: any) {
		console.debug("[AUTH] sendPasswordResetEmail:", error?.message || error)
		toast.show(t("resetEmailError"), { duration: 10000, type: "danger" })
		return false
	}
}

export const createStaffUser = async (email: string, password: string): Promise<string | null> => {
	try {
		const userCredential = await createUserWithEmailAndPassword(auth, email, password)
		return userCredential.user.uid
	} catch (error: any) {
		console.debug("[AUTH] createStaffUser:", error?.message || error)
		const alert = (m: string) => toast.show(m, { duration: 6000, type: "danger" })

		switch (error.code) {
			case "auth/email-already-in-use":
				alert(t("emailAlreadyInUse"))
				break
			case "auth/invalid-email":
				alert(t("invalidEmail"))
				break
			case "auth/weak-password":
				alert(t("weakPassword"))
				break
			default:
				alert(t("registrationError"))
				break
		}
		return null
	}
}

export const reAuthStaffUser = async (email: string, password: string) => {
	const userCredential = await signInWithEmailAndPassword(auth, email, password)
	const uid = userCredential.user.uid

	const staffRef = doc(db, COLLECTIONS.USERS, uid)
	const staffDoc = await getDoc(staffRef)

	if (!staffDoc.exists()) {
		await signOut(auth)
		throw new Error(t("staffRecordNotFound"))
	}

	const data = staffDoc.data()
	return { uid, email, role: data?.role as UserRole }
}

export const logoutUser = async (): Promise<void> => {
	try {
		await signOut(auth)
	} catch (e: any) {
		console.debug("[AUTH] logoutUser:", e?.message || e)
		throw e
	}
}

export const deleteCurrentAuthAccount = async (): Promise<boolean> => {
	try {
		const auth = getAuth()
		await deleteUser(auth.currentUser!)
		return true
	} catch (e: any) {
		console.debug("[AUTH] deleteMemberAuthAccount:", e?.message || e)
		return false
	}
}
