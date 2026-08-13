import { useState } from "react"
import { Text, TextInput, StyleSheet, ActivityIndicator, KeyboardAvoidingView, TouchableOpacity, ScrollView } from "react-native"
import { useSelector } from "react-redux"
import { useNavigation, NavigationProp } from "@react-navigation/native"
import { useForm, Controller } from "react-hook-form"
import { Image } from "expo-image"

import ThemedButton from "../components/ui/ThemedButton"
import ThemedText from "../components/ui/ThemedText"

import { register } from "../lib/firebase/auth"
import { Theme } from "../utils/theme"

type RegisterFormData = {
	name: string
	email: string
	password: string
	confirmPassword: string
}

export default function RegisterScreen() {
	const { darkMode } = useSelector((state: RootState) => state.settings)

	const navigation = useNavigation() as NavigationProp<any>

	const styles = createStyles(darkMode)

	const [isSubmitting, setIsSubmitting] = useState(false)
	const [firebaseError, setFirebaseError] = useState("")

	const {
		control,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<RegisterFormData>({
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
	})

	const passwordValue = watch("password")

	const onSubmit = async (data: RegisterFormData) => {
		setIsSubmitting(true)
		setFirebaseError("")

		const uid = await register(data.email, data.password, data.name)
		
		if (uid) {
			navigation.goBack()
		}

		setIsSubmitting(false)
	}

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={"padding"}
		>
			<ScrollView
				style={{ flex: 1 }}
				contentContainerStyle={styles.form}
			>
				<Image
					source={require("../assets/logo.png")}
					style={styles.logo}
				/>

				<ThemedText style={styles.title}>{"Kayıt Ol"}</ThemedText>

				<Controller
					control={control}
					name="name"
					rules={{
						required: "İsim alanı zorunludur.",
					}}
					render={({ field: { onChange, onBlur, value } }) => (
						<TextInput
							style={[styles.input, errors.name && styles.inputError]}
							placeholder={"İsim"}
							placeholderTextColor="#888"
							value={value}
							onBlur={onBlur}
							onChangeText={onChange}
						/>
					)}
				/>

				<Controller
					control={control}
					name="email"
					rules={{
						required: "E-posta alanı zorunludur.",
					}}
					render={({ field: { onChange, onBlur, value } }) => (
						<TextInput
							style={[styles.input, errors.email && styles.inputError]}
							placeholder={"E-posta"}
							placeholderTextColor="#888"
							value={value}
							onBlur={onBlur}
							onChangeText={onChange}
							autoCapitalize="none"
							keyboardType="email-address"
						/>
					)}
				/>

				{errors.email && <Text style={styles.fieldError}>{errors.email.message}</Text>}

				<Controller
					control={control}
					name="password"
					rules={{
						required: "Şifre alanı zorunludur.",
						minLength: { value: 6, message: "Şifre en az 6 karakter olmalıdır." },
					}}
					render={({ field: { onChange, onBlur, value } }) => (
						<TextInput
							style={[styles.input, errors.password && styles.inputError]}
							placeholder={"Şifre"}
							placeholderTextColor="#888"
							value={value}
							onBlur={onBlur}
							onChangeText={onChange}
							secureTextEntry
						/>
					)}
				/>

				{errors.password && <Text style={styles.fieldError}>{errors.password.message}</Text>}

				<Controller
					control={control}
					name="confirmPassword"
					rules={{
						required: "Şifre tekrar alanı zorunludur.",
						validate: (value) => value === passwordValue || "Şifreler eşleşmiyor.",
					}}
					render={({ field: { onChange, onBlur, value } }) => (
						<TextInput
							style={[styles.input, errors.confirmPassword && styles.inputError]}
							placeholder={"Şifre Tekrar"}
							placeholderTextColor="#888"
							value={value}
							onBlur={onBlur}
							onChangeText={onChange}
							secureTextEntry
						/>
					)}
				/>

				{errors.confirmPassword && <Text style={styles.fieldError}>{errors.confirmPassword.message}</Text>}

				{firebaseError ? <Text style={styles.error}>{firebaseError}</Text> : null}

				<ThemedButton
					onPress={handleSubmit(onSubmit)}
					disabled={isSubmitting}
					style={{ marginTop: 25 }}
				>
					{isSubmitting ? <ActivityIndicator color="#000" /> : <ThemedText style={styles.buttonText}>{"Kayıt Ol"}</ThemedText>}
				</ThemedButton>

				<TouchableOpacity
					style={styles.loginLink}
					activeOpacity={0.7}
					onPress={() => navigation.goBack()}
				>
					<ThemedText style={styles.loginLinkText}>{"Zaten Hesabım Var"}</ThemedText>
				</TouchableOpacity>
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
			marginTop: 70,
			paddingHorizontal: 40,
		},
		form: {
			gap: 5,
			width: "100%",
		},
		title: {
			fontSize: 28,
			fontWeight: "700",
			marginBottom: 20,
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
			marginBottom: 4,
		},
		inputError: {
			borderColor: "red",
		},
		buttonText: {
			color: darkMode ? "#000" : "#fff",
			fontSize: 16,
			fontWeight: "bold",
		},
		error: {
			color: "red",
			marginBottom: 8,
			textAlign: "center",
		},
		fieldError: {
			color: "red",
			fontSize: 12,
			marginBottom: 12,
			marginLeft: 4,
		},
		loginLink: {
			marginTop: 16,
			alignItems: "center",
		},
		loginLinkText: {
			fontSize: 14,
			textDecorationLine: "underline",
		},
		logo: {
			width: 120,
			height: 120,
			borderRadius: 20,
			marginBottom: 50,
			alignSelf: "center",
		},
	})
}
