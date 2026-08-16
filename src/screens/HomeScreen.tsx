import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native"
import { useSelector } from "react-redux"
import { useNavigation, NavigationProp } from "@react-navigation/native"
import { Image } from "expo-image"

import ThemedText from "../components/ui/ThemedText"
import ThemedButton from "../components/ui/ThemedButton"
import ThemedIcon from "../components/ui/ThemedIcon"
import NotificationsCard from "../components/NotificationsCard"
import { RiskStatusCounts } from "../components/CountsCard"
import CustomHeader from "../components/CustomHeader"

import { Theme } from "../utils/theme"
import { logout } from "../lib/firebase/auth"
import { clearUser } from "../utils/storage"

const getInitials = (name?: string) =>
	name
		?.trim()
		.split(/\s+/)
		.map((part) => part[0])
		.join("")
		.slice(0, 2)
		.toUpperCase() || "?"

export default function HomeScreen() {
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const auth = useSelector((state: RootState) => state.auth)
	const navigation = useNavigation() as NavigationProp<any>

	const styles = createStyles(darkMode)

	const handleLogout = async () => {
		logout()
		clearUser()
		navigation.reset({
			index: 0,
			routes: [{ name: "AuthStack" }],
		})
	}

	return (
		<View style={styles.container}>
			<CustomHeader
				title="Risk Takip Sistemi"
				showBackButton={false}
				rightComponent={
					<TouchableOpacity onPress={() => navigation.navigate("NotificationsScreen")}>
						<ThemedIcon
							name="bell"
							size={25}
						/>
					</TouchableOpacity>
				}
			/>

			<ScrollView
				style={styles.container}
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.topContent}>
					{/* ===== Profile Card ===== */}
					<View style={styles.profileRow}>
						{auth.profilePic ? (
							<Image
								source={{ uri: auth.profilePic }}
								style={styles.avatar}
							/>
						) : (
							<View style={styles.avatarFallback}>
								<ThemedText style={styles.avatarInitials}>{getInitials(auth.name)}</ThemedText>
							</View>
						)}

						<View style={styles.profileInfo}>
							<ThemedText
								style={styles.profileName}
								numberOfLines={1}
							>
								{auth.name || "Guest"}
							</ThemedText>
							<View style={styles.roleBadge}>
								<ThemedText style={styles.roleBadgeText}>{(auth.role || "MEMBER").toLowerCase()}</ThemedText>
							</View>
							<ThemedText
								style={styles.profileEmail}
								numberOfLines={1}
							>
								{auth.email || "—"}
							</ThemedText>
						</View>

						<TouchableOpacity onPress={handleLogout}>
							<ThemedIcon
								name="logout"
								size={25}
							/>
						</TouchableOpacity>
					</View>

					<View
						style={{
							paddingHorizontal: 13,
							gap: 16,
						}}
					>
						<NotificationsCard />
						<RiskStatusCounts />
					</View>
				</View>

				<View
					style={{
						paddingHorizontal: 13,
						paddingBottom: 20,
						gap: 12,
					}}
				>
					<ThemedButton
						text={"Yeni Risk Ekle"}
						icon={"plus-circle-outline"}
						iconSize={22}
						onPress={() => navigation.navigate("RiskFormScreen")}
					/>
				</View>
			</ScrollView>
		</View>
	)
}

const createStyles = (darkMode: boolean) => {
	const theme = Theme[darkMode ? "dark" : "light"]

	return StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: darkMode ? "#000" : "#fff",
		},
		content: {
			flexGrow: 1,
			justifyContent: "space-between",
			gap: 18,
		},
		screenTitle: {
			fontSize: 26,
			fontWeight: "800",
			letterSpacing: 0.5,
		},
		profileCard: {},
		profileRow: {
			flexDirection: "row",
			alignItems: "center",
			gap: 14,
			backgroundColor: theme.cardBackground,
			borderBottomWidth: 1,
			borderBottomColor: theme.border,
			paddingHorizontal: 16,
			paddingVertical: 20,
		},
		avatar: {
			width: 64,
			height: 64,
			borderRadius: 32,
			backgroundColor: darkMode ? "#2a2a2a" : "#e2e2e2",
		},
		avatarFallback: {
			width: 64,
			height: 64,
			borderRadius: 32,
			alignItems: "center",
			justifyContent: "center",
			backgroundColor: darkMode ? "#2a2a2a" : "#e2e2e2",
			borderWidth: 1,
			borderColor: theme.border,
		},
		avatarInitials: {
			fontSize: 24,
			fontWeight: "700",
		},
		profileInfo: {
			flex: 1,
			gap: 6,
		},
		profileName: {
			fontSize: 20,
			fontWeight: "700",
		},
		roleBadge: {
			alignSelf: "flex-start",
			paddingHorizontal: 10,
			paddingVertical: 3,
			borderRadius: 99,
			backgroundColor: darkMode ? "#fff" : "#000",
		},
		roleBadgeText: {
			fontSize: 12,
			fontWeight: "700",
			textTransform: "uppercase",
			color: darkMode ? "#000" : "#fff",
		},
		profileEmail: {
			fontSize: 13,
			opacity: 0.7,
		},
		primaryButton: {
			marginTop: 6,
		},
		topContent: {
			gap: 15,
		},
	})
}
