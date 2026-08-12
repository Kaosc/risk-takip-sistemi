//////////////////////////////////////////////////////
////////////////////// TOAST /////////////////////////
//////////////////////////////////////////////////////

type ToastType = import("react-native-toast-notifications").ToastType

declare global {
	const toast: ToastType
}

declare var toast: ToastType

//////////////////////////////////////////////////////
////////////////////// GENERAL ///////////////////////
//////////////////////////////////////////////////////

type RootState = {
	settings: Settings
	config: Config
	auth: Auth
}

type Auth = {
	isAuthenticated: boolean
	uid: string | undefined
	role: UserRole | undefined
	email: string | undefined
}

type Settings = {
	lang: "tr" | "en"
	darkMode: boolean
}

type Config = {
	isConnected: boolean
}

type ConsentValues = {
	analytics_storage: boolean
	ad_storage: boolean
	ad_user_data: boolean
	ad_personalization_signals: boolean
}

///////////////////////////////////////////////////
////////////////////// DATA ///////////////////////
///////////////////////////////////////////////////


type UserRole = "ADMIN" | "STAFF"

type FieldValue = import("@react-native-firebase/firestore").FieldValue
type FirebaseTimestamp = import("@react-native-firebase/firestore").Timestamp

interface UserAuth {
	email: string
	password: string
}