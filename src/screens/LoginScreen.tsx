import { useCallback, useEffect, useState } from "react"
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
import { useNavigation, NavigationProp, StackActions, useFocusEffect } from "@react-navigation/native"
import { useMMKVObject, useMMKVString } from "react-native-mmkv"
import { Image } from "expo-image"

import ThemedText from "../components/ui/ThemedText"
import ThemedButton from "../components/ui/ThemedButton"
import ThemedActivityIndicator from "../components/ui/ThemedActivityIndicator"

import { resetPassword, login } from "../lib/firebase/auth"
import { setAuth } from "../store/features/authSlice"
import { clearUserAuth, storeStaffCredentials } from "../utils/storage"
import { Theme } from "../utils/theme"

export default function LoginScreen() {
	const { darkMode } = useSelector((state: RootState) => state.settings)

	const dispatch = useDispatch<any>()
	const navigation = useNavigation() as NavigationProp<any>

	const styles = createStyles(darkMode)

	const [userAuth] = useMMKVObject<UserAuth | undefined>("auth")
	const [role] = useMMKVString("role")

	const [forgotPassword, setForgotPassword] = useState(false)
	const [isLoading, setIsLoading] = useState(false)

	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [error, setError] = useState("")

	useEffect(() => {
		setTimeout(() => {
			setEmail(process.env.EXPO_PUBLIC_ADMIN_EMAIL || "")
			setPassword(process.env.EXPO_PUBLIC_ADMIN_PASSWORD || "")
		}, 100)
	}, [])

	useEffect(() => {
		autoLogin()
	}, [])

	useFocusEffect(
		useCallback(() => {
			setError("")
		}, []),
	)

	const autoLogin = async () => {
		try {
			setIsLoading(true)

			let user = null
			user = await login(userAuth?.email || "", userAuth?.password || "")

			dispatch(setAuth({ isAuthenticated: true, uid: user?.uid, email: user?.email, role: role }))
			navigation.dispatch(StackActions.replace("HomeStack"))
		} catch (e: any) {
			console.warn("App.tsx:50", e)
			clearUserAuth()
			setError(e?.message || "Otomatik giriş başarısız. Lütfen bilgilerinizi kontrol edin.")
		} finally {
			setIsLoading(false)
		}
	}

	const handleForgotPassword = async () => {
		if (!email.trim()) {
			setError("E-posta alanı zorunludur.")
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
			setError("E-posta ve şifre alanları zorunludur.")
			return
		}

		setError("")
		setIsLoading(true)

		try {
			const result = await login(email, password)

			if (!result) {
				setError("Giriş başarısız. Lütfen bilgilerinizi kontrol edin.")
				return
			}

			const { uid, role } = result

			dispatch(setAuth({ isAuthenticated: true, uid, email, role }))
			storeStaffCredentials(email, password)

			navigation.dispatch(StackActions.replace("HomeStack"))
		} catch (e: any) {
			setError(e?.message || "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.")
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

				<ThemedText style={styles.title}>{forgotPassword ? "Şifre Sıfırla" : "Giriş Yap"}</ThemedText>

				<TextInput
					style={styles.input}
					placeholder={"E-posta"}
					placeholderTextColor="#888"
					value={email}
					onChangeText={setEmail}
					autoCapitalize="none"
					keyboardType="email-address"
				/>

				{!forgotPassword && (
					<TextInput
						style={styles.input}
						placeholder={"Şifre"}
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
						<ThemedText style={styles.buttonText}>{forgotPassword ? "Şifre Sıfırla" : "Giriş Yap"}</ThemedText>
					)}
				</ThemedButton>

				<TouchableOpacity
					style={styles.registerLink}
					activeOpacity={0.7}
					onPress={() => setForgotPassword(!forgotPassword)}
				>
					<ThemedText style={styles.registerLinkText}>{forgotPassword ? "Giriş Sayfasına Dön" : "Şifremi Unuttum"}</ThemedText>
				</TouchableOpacity>

				{!forgotPassword && (
					<TouchableOpacity
						style={styles.registerLink}
						activeOpacity={0.7}
						onPress={() => navigation.navigate("RegisterScreen")}
					>
						<ThemedText style={styles.registerLinkText}>{"Kayıt Ol"}</ThemedText>
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
