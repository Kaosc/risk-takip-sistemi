import { useEffect, useState } from "react"
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	ActivityIndicator,
	KeyboardAvoidingView,
	TouchableOpacity,
	ScrollView,
} from "react-native"
import { useDispatch, useSelector } from "react-redux"
import { useNavigation, NavigationProp, StackActions } from "@react-navigation/native"
import { useTranslation } from "react-i18next"
import { useMMKVObject, useMMKVString } from "react-native-mmkv"
import { Image } from "expo-image"

import { resetPassword, staffLogin, memberLogin } from "../lib/firebase/auth"
import { setAuth } from "../store/features/authSlice"
import { clearUserAuth, setStaffCredentials } from "../utils/storage"
import { Theme } from "../utils/theme"
import ThemedButton from "../components/ui/ThemedButton"
import ThemedActivityIndicator from "../components/ui/ThemedActivityIndicator"
import ThemedText from "../components/ui/ThemedText"

export default function LoginScreen() {
	const { darkMode } = useSelector((state: RootState) => state.settings)
	const { t } = useTranslation()

	const dispatch = useDispatch<any>()
	const navigation = useNavigation() as NavigationProp<any>

	const styles = createStyles(darkMode)

	const [userAuth] = useMMKVObject<UserAuth | undefined>("auth")
	const [role] = useMMKVString("role")

	const [isStaffLogin, setIsStaffLogin] = useState(false)
	const [forgotPassword, setForgotPassword] = useState(false)
	const [isLoading, setIsLoading] = useState(false)

	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [error, setError] = useState("")

	useEffect(() => {
		setTimeout(() => {
			if (isStaffLogin) {
				setEmail(process.env.EXPO_PUBLIC_ADMIN_EMAIL || "")
				setPassword(process.env.EXPO_PUBLIC_ADMIN_PASSWORD || "")
			} else {
				setEmail(process.env.EXPO_PUBLIC_MEMBER_EMAIL || "")
				setPassword(process.env.EXPO_PUBLIC_MEMBER_PASSWORD || "")
			}
		}, 100)
	}, [isStaffLogin])

	useEffect(() => {
		autoLogin()
	}, [])

	const autoLogin = async () => {
		try {
			setIsLoading(true)

			if (!role || !userAuth) {
				return
			}

			const email = userAuth?.email
			const password = userAuth?.password

			let user = null

			if (role === "MEMBER") {
				user = await memberLogin(email || "", password || "")
			} else {
				user = await staffLogin(email || "", password || "")
			}

			if (!user) {
				setError(t("autoLoginFailed"))
				return
			}

			dispatch(setAuth({ isAuthenticated: true, uid: user?.uid, email: user?.email, role: role }))
			navigation.dispatch(StackActions.replace(role === "MEMBER" ? "MemberTabs" : "Tabs"))
		} catch (e) {
			console.warn("App.tsx:50", e)
			clearUserAuth()
			setError(t("autoLoginFailed"))
		} finally {
			setIsLoading(false)
		}
	}

	const handleForgotPassword = async () => {
		if (!email.trim()) {
			setError(t("emailRequired"))
			return
		}

		setIsLoading(true)
		const success = await resetPassword(email)

		if (success) {
			setForgotPassword(false)
		}

		setIsLoading(false)
	}

	const handleLogin = async () => {
		if (forgotPassword) {
			handleForgotPassword()
			return
		}

		if (!email.trim() || !password.trim()) {
			setError(t("emailAndPasswordRequired"))
			return
		}

		setError("")
		setIsLoading(true)

		try {
			const result = isStaffLogin ? await staffLogin(email, password) : await memberLogin(email, password)
			const { uid, role } = result
			const isNewMember = "isNewMember" in result ? result.isNewMember : false

			dispatch(setAuth({ isAuthenticated: true, uid, email, role }))

			if (role === "ADMIN" || role === "STAFF") {
				setStaffCredentials(email, password)
			}

			if (isNewMember && role === "MEMBER") {
				navigation.navigate("MemberFormScreen", { isNewMember: true })
			} else {
				navigation.dispatch(StackActions.replace(role === "MEMBER" ? "MemberTabs" : "Tabs"))
			}
		} catch (e: any) {
			const errorMessage = e?.message || ""
			if (errorMessage === t("memberExistsNoAccount") || errorMessage === t("emailNotVerified")) {
				setError(errorMessage)
			} else {
				setError(t("loginFailed"))
			}
		} finally {
			setIsLoading(false)
		}
	}

	if (isLoading && userAuth && !error) {
		return (
			<View>
				<ThemedActivityIndicator size="large" />
			</View>
		)
	}

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={"padding"}
		>
			<ScrollView
				style={styles.form}
				contentContainerStyle={styles.contentContainer}
				showsVerticalScrollIndicator={false}
			>
				<Image
					source={require("../assets/logo.png")}
					style={styles.logo}
				/>

				<ThemedText style={styles.title}>
					{forgotPassword ? t("resetPasswordTitle") : isStaffLogin ? t("staffLogin") : t("memberLogin")}
				</ThemedText>

				{!forgotPassword && (
					<View style={styles.segmentedControl}>
						<TouchableOpacity
							style={[styles.segment, isStaffLogin && styles.segmentActive]}
							activeOpacity={0.7}
							onPress={() => setIsStaffLogin(true)}
						>
							<Text style={[styles.segmentText, isStaffLogin && styles.segmentTextActive]}>{t("staffLogin")}</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.segment, !isStaffLogin && styles.segmentActive]}
							activeOpacity={0.7}
							onPress={() => setIsStaffLogin(false)}
						>
							<Text style={[styles.segmentText, !isStaffLogin && styles.segmentTextActive]}>{t("memberLogin")}</Text>
						</TouchableOpacity>
					</View>
				)}
				<TextInput
					style={styles.input}
					placeholder={t("email")}
					placeholderTextColor="#888"
					value={email}
					onChangeText={setEmail}
					autoCapitalize="none"
					keyboardType="email-address"
				/>

				{!forgotPassword && (
					<TextInput
						style={styles.input}
						placeholder={t("password")}
						placeholderTextColor="#888"
						value={password}
						onChangeText={setPassword}
						secureTextEntry
					/>
				)}

				{error ? <Text style={styles.error}>{error}</Text> : null}

				<ThemedButton
					onPress={handleLogin}
					disabled={isLoading}
				>
					{isLoading ? (
						<ActivityIndicator color={darkMode ? "#000" : "#fff"} />
					) : (
						<ThemedText style={styles.buttonText}>{forgotPassword ? t("sendResetEmail") : t("login")}</ThemedText>
					)}
				</ThemedButton>

				<TouchableOpacity
					style={styles.registerLink}
					activeOpacity={0.7}
					onPress={() => setForgotPassword(!forgotPassword)}
				>
					<ThemedText style={styles.registerLinkText}>{forgotPassword ? t("backToLogin") : t("resetPassword")}</ThemedText>
				</TouchableOpacity>

				{!isStaffLogin && !forgotPassword && (
					<TouchableOpacity
						style={styles.registerLink}
						activeOpacity={0.7}
						onPress={() => navigation.navigate("RegisterScreen")}
					>
						<ThemedText style={styles.registerLinkText}>{t("register")}</ThemedText>
					</TouchableOpacity>
				)}
			</ScrollView>
		</KeyboardAvoidingView>
	)
}

const createStyles = (darkMode: boolean) => {
	const theme = Theme[darkMode ? "dark" : "light"]

	return StyleSheet.create({
		container: {
			flex: 1,
			justifyContent: "flex-start",
		},
		form: {
			flex: 1,
			gap: 3,
			paddingHorizontal: 40,
		},
		contentContainer: {
			flexGrow: 1,
			marginTop: 70,
		},
		title: {
			fontSize: 28,
			fontWeight: "700",
			marginBottom: 16,
			textAlign: "center",
		},
		segmentedControl: {
			flexDirection: "row",
			borderWidth: 1,
			borderColor: theme.border,
			borderRadius: 8,
			overflow: "hidden",
			marginBottom: 24,
		},
		segment: {
			flex: 1,
			paddingVertical: 12,
			alignItems: "center",
			backgroundColor: "transparent",
		},
		segmentActive: {
			backgroundColor: darkMode ? "#fff" : "#000",
		},
		segmentText: {
			fontSize: 15,
			fontWeight: "600",
			color: darkMode ? "#fff" : "#000",
		},
		segmentTextActive: {
			color: darkMode ? "#000" : "#fff",
		},
		input: {
			borderWidth: 1,
			borderColor: theme.border,
			borderRadius: 8,
			paddingVertical: 12,
			paddingHorizontal: 16,
			fontSize: 16,
			color: darkMode ? "#fff" : "#000",
			marginBottom: 16,
		},
		buttonText: {
			color: darkMode ? "#000" : "#fff",
			fontSize: 16,
			fontWeight: "bold",
		},
		error: {
			color: theme.red.foreground,
			marginBottom: 15,
			fontSize: 15,
			textAlign: "center",
		},
		logo: {
			width: 120,
			height: 120,
			borderRadius: 20,
			marginBottom: 50,
			alignSelf: "center",
		},
		registerLink: {
			marginTop: 16,
			alignItems: "center",
		},
		registerLinkText: {
			fontSize: 14,
			textDecorationLine: "underline",
		},
	})
}
