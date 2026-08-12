import { useState } from "react"
import { Text, TextInput, StyleSheet, ActivityIndicator, KeyboardAvoidingView, TouchableOpacity, ScrollView } from "react-native"
import { useSelector } from "react-redux"
import { useNavigation, NavigationProp } from "@react-navigation/native"
import { useTranslation } from "react-i18next"
import { useForm, Controller } from "react-hook-form"
import { Image } from "expo-image"

import ThemedButton from "../components/ui/ThemedButton"
import ThemedText from "../components/ui/ThemedText"

import { registerMember } from "../lib/firebase/auth"
import { Theme } from "../utils/theme"

type RegisterFormData = {
	email: string
	password: string
	confirmPassword: string
}

export default function RegisterScreen() {
	const { darkMode } = useSelector((state: RootState) => state.settings)
	const { t } = useTranslation()

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
			email: "",
			password: "",
			confirmPassword: "",
		},
	})

	const passwordValue = watch("password")

	const onSubmit = async (data: RegisterFormData) => {
		setIsSubmitting(true)
		setFirebaseError("")

		await registerMember(data.email, data.password)
		navigation.goBack()

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
					source={darkMode ? require("../assets/logo-transparent-white.png") : require("../assets/logo-transparent-black.png")}
					style={styles.logo}
				/>

				<ThemedText style={styles.title}>{t("register")}</ThemedText>

				<Controller
					control={control}
					name="email"
					rules={{
						required: t("emailAndPasswordRequired"),
					}}
					render={({ field: { onChange, onBlur, value } }) => (
						<TextInput
							style={[styles.input, errors.email && styles.inputError]}
							placeholder={t("email")}
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
						required: t("emailAndPasswordRequired"),
						minLength: { value: 6, message: t("passwordMinLength") },
					}}
					render={({ field: { onChange, onBlur, value } }) => (
						<TextInput
							style={[styles.input, errors.password && styles.inputError]}
							placeholder={t("password")}
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
						required: t("emailAndPasswordRequired"),
						validate: (value) => value === passwordValue || t("passwordMismatch"),
					}}
					render={({ field: { onChange, onBlur, value } }) => (
						<TextInput
							style={[styles.input, errors.confirmPassword && styles.inputError]}
							placeholder={t("confirmPassword")}
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
					{isSubmitting ? <ActivityIndicator color="#000" /> : <ThemedText style={styles.buttonText}>{t("register")}</ThemedText>}
				</ThemedButton>

				<TouchableOpacity
					style={styles.loginLink}
					activeOpacity={0.7}
					onPress={() => navigation.goBack()}
				>
					<ThemedText style={styles.loginLinkText}>{t("alreadyHaveAccount")}</ThemedText>
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
