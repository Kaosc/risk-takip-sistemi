import i18next from "i18next"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native"
import { useDispatch, useSelector } from "react-redux"
import { useNavigation } from "@react-navigation/native"

import ThemedIcon from "../components/ui/ThemedIcon"
import ThemedText from "../components/ui/ThemedText"
import CustomHeader from "../components/CustomHeader"

import { clearUserAuth, getIsThemeAuto } from "../utils/storage"
import { setSettings } from "../store/features/settingsSlice"
import toggleTheme from "../utils/toggleTheme"

import { deleteMemberAccount } from "../lib/firebase/firestore/member"
import { deleteCurrentAuthAccount } from "../lib/firebase/auth"

import { logout } from "../store/features/authSlice"
import { AllIconNames } from "../types/icon"
import { Theme } from "../utils/theme"
import app from "../../app.json"

export default function SettingsScreen() {
	const navigation = useNavigation() as any
	const { darkMode, lang } = useSelector((state: RootState) => state.settings)
	const dispatch = useDispatch()
	const { uid, role } = useSelector((state: RootState) => state.auth)
	const { t } = useTranslation()

	const theme = Theme[darkMode ? "dark" : "light"]

	const styles = createStyles(darkMode)

	const [themeIcon, setThemeIcon] = useState<AllIconNames>(
		getIsThemeAuto() ? "theme-light-dark" : darkMode ? "weather-night" : "white-balance-sunny",
	)

	const handleToggleTheme = () => {
		toggleTheme({ darkMode, dispatch, setThemeIcon })
	}

	const setLang = () => {
		const newLang = lang === "en" ? "tr" : "en"
		i18next.changeLanguage(newLang)
		dispatch(setSettings({ lang: newLang }))
	}

	const handleDeleteAccount = async () => {
		if (!uid) return
		const isMemberDocDeleted = await deleteMemberAccount(uid)

		if (isMemberDocDeleted) {
			const authDeleted = await deleteCurrentAuthAccount()

			if (authDeleted) {
				dispatch(logout())
				clearUserAuth()

				toast.show(t("accountDeleted"), {
					type: "success",
					duration: 10000,
				})

				navigation.reset({
					index: 0,
					routes: [{ name: "AuthStack" }],
				})
			}
		}
	}

	const deleteAlert = () => {
		Alert.alert(
			t("deleteMyAccount"),
			t("deleteAccountConfirmation"),

			[
				{
					text: t("cancel"),
					style: "cancel",
				},
				{
					text: t("delete"),
					style: "destructive",
					onPress: handleDeleteAccount,
				},
			],
		)
	}

	//////////////////////////// RENDER ////////////////////////////

	const Title = ({ title }: { title: string }) => (
		<View style={{ marginVertical: 15, marginHorizontal: 13.5 }}>
			<ThemedText style={{ fontSize: 22, fontWeight: "bold" }}>{t(title)}</ThemedText>
		</View>
	)

	return (
		<>
			<CustomHeader title={t("settings")} />
			<ScrollView
				style={{ flex: 1 }}
				contentContainerStyle={{ flexGrow: 1, paddingBottom: 20, paddingTop: 22, gap: 10 }}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.groupContainer}>
					<View style={styles.settingContainer}>
						<View style={styles.optionContainer}>
							<ThemedIcon
								name="translate"
								size={25}
							/>
							<ThemedText style={styles.settingText}>{t("language")}</ThemedText>
						</View>
						<TouchableOpacity onPress={setLang}>
							<ThemedText style={[styles.optionText, { fontSize: 21, letterSpacing: 0.5, fontFamily: "InterMedium" }]}>
								{lang.toLocaleUpperCase()}
							</ThemedText>
						</TouchableOpacity>
					</View>

					<View style={styles.settingContainer}>
						<View style={styles.optionContainer}>
							<ThemedIcon
								name="palette"
								size={26}
							/>
							<ThemedText style={styles.settingText}>{t("theme")}</ThemedText>
						</View>
						<TouchableOpacity onPress={handleToggleTheme}>
							<ThemedIcon
								name={themeIcon}
								size={28}
							/>
						</TouchableOpacity>
					</View>
				</View>

				<Title title="App" />

				<View style={styles.groupContainer}>
					<View style={styles.settingContainer}>
						<View style={styles.optionContainer}>
							<ThemedIcon
								name="information-outline"
								size={26}
								style={{ marginTop: 6 }}
							/>
							<ThemedText style={{ ...styles.settingText, marginTop: 5 }}>{t("version")}</ThemedText>
						</View>
						<ThemedText style={styles.settingText}>{app.expo.version}</ThemedText>
					</View>
					<View style={styles.settingContainer}>
						<View style={styles.optionContainer}>
							<ThemedIcon
								name="code-tags"
								size={26}
								style={{ marginTop: 6 }}
							/>
							<ThemedText style={{ ...styles.settingText, marginTop: 5 }}>{t("runtimeVersion")}</ThemedText>
						</View>
						<ThemedText style={styles.settingText}>{app.expo.runtimeVersion}</ThemedText>
					</View>
				</View>

				{role === "MEMBER" ? (
					<>
						<Title title={t("dangerZone")} />

						<View style={styles.dangerZoneCard}>
							<View style={{ flexDirection: "row", alignItems: "center", gap: 13, flex: 1 }}>
								<ThemedIcon
									name="alert-octagon"
									size={35}
									color={theme.red.foreground}
								/>
								<View style={{ flex: 1 }}>
									<ThemedText style={styles.dangerText}>{t("dangerZoneDescription")}</ThemedText>
								</View>
							</View>
							<TouchableOpacity
								style={styles.dangerButton}
								onPress={deleteAlert}
							>
								<ThemedIcon
									name="delete"
									size={20}
									color={theme.red.foreground}
								/>
								<ThemedText style={styles.dangerButtonText}>{t("deleteMyAccount")}</ThemedText>
							</TouchableOpacity>
						</View>
					</>
				) : (
					<></>
				)}
			</ScrollView>
		</>
	)
}

const createStyles = (darkMode: boolean) => {
	const theme = Theme[darkMode ? "dark" : "light"]
	return StyleSheet.create({
		groupContainer: {
			padding: 5,
			marginHorizontal: 5,
			borderRadius: 10,
		},
		settingContainer: {
			paddingVertical: 15,
			paddingHorizontal: 15,
			marginVertical: 1.5,
			borderRadius: 8,
			alignItems: "center",
			flexDirection: "row",
			justifyContent: "space-between",
			backgroundColor: darkMode ? "#1c1c1c" : "#f2f2f2",
		},
		settingText: {
			fontSize: 17,
			flexShrink: 1,
		},
		optionText: {
			fontSize: 17,
			marginRight: 2,
			flexShrink: 1,
		},
		optionContainer: {
			alignItems: "center",
			justifyContent: "flex-start",
			flexDirection: "row",
			gap: 10,
			flex: 1,
		},
		dangerZoneCard: {
			backgroundColor: theme.red.background,
			borderColor: theme.red.foreground,
			gap: 20,
			padding: 25,
			marginHorizontal: 13,
			borderRadius: 16,
			borderWidth: 1,
		},
		dangerTitle: {
			fontSize: 18,
			fontWeight: "900",
		},
		dangerText: {
			fontSize: 14,
			flexWrap: "wrap",
			flex: 1,
		},
		dangerButtonText: {
			fontSize: 16,
			fontWeight: "900",
		},
		dangerButton: {
			flexDirection: "row",
			borderWidth: 1,
			paddingVertical: 10,
			paddingHorizontal: 16,
			borderRadius: 99,
			gap: 10,
			borderColor: theme.red.foreground,
		},
	})
}
