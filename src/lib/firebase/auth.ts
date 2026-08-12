import {
	createUserWithEmailAndPassword,
	getAuth,
	sendEmailVerification,
	sendPasswordResetEmail,
	signInWithEmailAndPassword,
	signOut,
} from "@react-native-firebase/auth"
import { getFirestore, doc, getDoc } from "@react-native-firebase/firestore"
import { t } from "i18next"

import { COLLECTIONS } from "./enums"
import { addUser } from "./firestore/users"

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

export const login = async (email: string, password: string) => {
	const userCredential = await signInWithEmailAndPassword(auth, email, password)
	const uid = userCredential.user.uid

	const usersRef = doc(db, COLLECTIONS.USERS, uid)
	const userDoc = await getDoc(usersRef)

	if (!userDoc.exists()) {
		await signOut(auth)
		throw new Error(t("staffRecordNotFound"))
	}

	const data = userDoc.data()
	return { uid, email, role: data?.role as UserRole }
}

export const register = async (email: string, password: string) => {
	let uid: string | null = null

	try {
		const credential = await createUserWithEmailAndPassword(auth, email, password)
		await addUser({
			uid: credential.user.uid,
			email: credential.user.email || "",
			role: "MEMBER",
			name: "",
			createdAt: new Date() as unknown as FirebaseTimestamp,
			updatedAt: new Date() as unknown as FirebaseTimestamp,
		})
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

export const logout = async (): Promise<void> => {
	try {
		await signOut(auth)
	} catch (e: any) {
		console.debug("[AUTH] logoutUser:", e?.message || e)
		throw e
	}
}
