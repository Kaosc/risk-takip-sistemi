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
	name: string | undefined
	profilePic: string | undefined
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

type FieldValue = import("@react-native-firebase/firestore").FieldValue
type FirebaseTimestamp = import("@react-native-firebase/firestore").Timestamp

interface UserAuth {
	email: string
	password: string
}

type UserRole = "ADMIN" | "STAFF" | "MEMBER"

interface User {
	uid: string
	email: string
	role: UserRole
	name: string
	createdAt: FirebaseTimestamp
	updatedAt: FirebaseTimestamp
}

// Tip güvenliği (Type Safety) için statik değerleri İngilizce yapıyoruz
type RiskType = "risk" | "accident" | "nearmiss"
type RiskSeverity = "low" | "medium" | "high" | "critical"
type RiskStatus = "new" | "pending" | "inprogress" | "completed" | "closed"

interface Risk {
	id: string // Firebase Document ID
	reportNumber?: string // İsteğe bağlı (Örn: 2026-0154)

	// --- 1. REPORTING STAGE (Çalışan Doldurur) ---
	type: RiskType
	category: string // "Machinery", "Electrical", "Fire" vb.
	location: string // "Production Line 2", "Warehouse" vb.
	description: string
	severity: RiskSeverity
	images: string[]
	createdBy: string
	createdAt: FirebaseTimestamp
	updatedAt: FirebaseTimestamp
	status: RiskStatus

	// --- EXTRA FIELDS FOR ACCIDENT (Sadece "type === 'Accident'" ise) ---
	accidentDetails?: {
		involvedPersons: string[] // Kazaya karışan kişiler
		injuryStatus: string // "Minor scratch", "Fracture" vb.
		firstAidProvided: boolean // İlk müdahale yapıldı mı?
	}

	// --- 2. ASSESSMENT & ASSIGNMENT STAGE (İSG Uzmanı Doldurur) ---
	assignedTo?: string // Görev atanan personelin UID'si
	taskDescription?: string // Yapılması istenen düzeltici faaliyet
	dueDate?: FirebaseTimestamp // Termin tarihi

	// --- 3. ACTION / RESOLUTION STAGE (Bakım Personeli Doldurur) ---
	afterImages?: string[] // İşlem bittikten sonra çekilen "Sonra" fotoğrafları
	completedAt?: FirebaseTimestamp // Görevin tamamlandığı tarih
	completionNotes?: string // Yapılan işlemlerle ilgili notlar
}

type MemberFormData = {
	type: RiskType
	category: string
	location: string
	description: string
	severity: RiskSeverity
	images: string[]

	// Kaza detayları (Sadece type === 'Accident' ise)
	accidentDetails?: {
		involvedPersons: string
		injuryStatus: string
		firstAidProvided: boolean
	}
}
