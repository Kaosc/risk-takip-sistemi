import {
	createUserWithEmailAndPassword,
	deleteUser,
	getAuth,
	sendEmailVerification,
	sendPasswordResetEmail,
	signInWithEmailAndPassword,
	signOut,
} from "@react-native-firebase/auth"
import { getFirestore, doc, getDoc } from "@react-native-firebase/firestore"

import { COLLECTIONS } from "./enums"
import { addUser } from "./firestore/users"

const auth = getAuth()
const db = getFirestore()

export const login = async (email: string, password: string) => {
	try {
		const userCredential = await signInWithEmailAndPassword(auth, email, password)
		const uid = userCredential.user.uid

		const usersRef = doc(db, COLLECTIONS.USERS, uid)
		const userDoc = await getDoc(usersRef)

		if (!userDoc.exists()) {
			await signOut(auth)
			throw new Error()
		}

		const data = userDoc.data()
		return { uid, email, role: data?.role as UserRole }
	} catch (e: any) {
		console.debug("[AUTH] loginUser:", e?.message || e)

		switch (e.code) {
			case "auth/user-not-found":
				throw new Error("Kullanıcı bulunamadı. Lütfen kayıt olun.")
			case "auth/wrong-password":
				throw new Error("Yanlış şifre. Lütfen tekrar deneyin.")
			case "auth/invalid-credential":
				throw new Error("Şifre veya e-posta hatalı. Lütfen tekrar deneyin.")
			case "auth/invalid-email":
				throw new Error("Geçersiz e-posta adresi. Lütfen geçerli bir e-posta adresi girin.")
			case "auth/too-many-requests":
				throw new Error("Çok fazla istek gönderildi. Lütfen biraz bekleyin.")
			default:
				throw new Error("Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.")
		}
	}
}

export const register = async (email: string, password: string, name: string) => {
	let uid: string | null = null
	try {
		const credential = await createUserWithEmailAndPassword(auth, email, password)
		console.log(credential)

		if (!credential.user) {
			throw new Error("Hesap oluşturulamadı. Lütfen tekrar deneyin.")
		}

		const addUserResult = await addUser({
			uid: credential.user.uid,
			email: credential.user.email || "",
			role: "MEMBER",
			name: name,
			createdAt: new Date() as unknown as FirebaseTimestamp,
			updatedAt: new Date() as unknown as FirebaseTimestamp,
		})

		if (!addUserResult) {
			await deleteUser(credential.user)
			await signOut(auth)
			toast.show("Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.", { duration: 10000, type: "danger" })
			return null
		}

		await sendEmailVerification(credential.user)
		await signOut(auth)
		toast.show("Kayıt başarılı. E-posta adresinizi doğrulayın.", { duration: 10000, type: "success" })
		uid = credential.user.uid
	} catch (error: any) {
		console.debug("[AUTH] registerMember:", error?.message || error)
		const alert = (m: string) => toast.show(m, { duration: 6000, type: "danger" })

		switch (error.code) {
			case "auth/email-already-in-use":
				alert("Bu e-posta adresi zaten kullanılıyor. Lütfen başka bir e-posta adresi deneyin.")
				break
			case "auth/invalid-email":
				alert("Geçersiz e-posta adresi. Lütfen geçerli bir e-posta adresi girin.")
				break
			case "auth/weak-password":
				alert("Zayıf şifre. Lütfen en az 6 karakter uzunluğunda bir şifre girin.")
				break
			default:
				alert("Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.")
				break
		}
	}

	return uid
}

export const resetPassword = async (email: string): Promise<boolean> => {
	try {
		await sendPasswordResetEmail(auth, email)
		toast.show("Şifre sıfırlama e-postası gönderildi.", { duration: 6000, type: "success" })
		return true
	} catch (error: any) {
		console.debug("[AUTH] sendPasswordResetEmail:", error?.message || error)
		toast.show("Şifre sıfırlama e-postası gönderilirken bir hata oluştu.", { duration: 10000, type: "danger" })
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
