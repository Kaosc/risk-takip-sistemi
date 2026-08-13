import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native"
import { useSelector } from "react-redux"
import { useNavigation, NavigationProp } from "@react-navigation/native"
import { Image } from "expo-image"

import ThemedText from "../components/ui/ThemedText"
import ThemedButton from "../components/ui/ThemedButton"
import ThemedIcon from "../components/ui/ThemedIcon"
import GradientCard from "../components/ui/GradientCard"
import CustomHeader from "../components/CustomHeader"

import { AllIconNames } from "../types/icon"
import { Theme } from "../utils/theme"

const roleActions: Record<string, { title: string; destination: string; icon: AllIconNames }> = {
	member: { title: "Create New Risk/Case", destination: "MemberFormScreen", icon: "creation-outline" },
	staff: { title: "Update Assigned Task", destination: "StaffFormScreen", icon: "pencil-outline" },
	admin: { title: "Manage Cases", destination: "AdminFormScreen", icon: "briefcase-account-outline" },
}

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

	// Normalize the role so the mapping is case-insensitive.
	const action = roleActions[(auth.role || "").toLowerCase()] ?? roleActions.member

	const handleNavigate = (destination: string) => {
		navigation.navigate(destination)
	}

	return (
		<View style={styles.container}>
			<CustomHeader
				title="Home"
				showBackButton={false}
				rightComponent={
					<TouchableOpacity onPress={() => handleNavigate("SettingsScreen")}>
						<ThemedIcon
							name="cog"
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
				{/* ===== Profile Card ===== */}
				<GradientCard style={styles.profileCard}>
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
					</View>
				</GradientCard>

				{/* ===== Latest Notification Card ===== */}
				<View style={styles.notificationCard}>
					<View style={styles.notificationHeader}>
						<ThemedIcon
							name="bell-ring-outline"
							size={22}
						/>
						<ThemedText style={styles.notificationTitle}>Latest Notification</ThemedText>
					</View>
					<ThemedText style={styles.notificationBody}>New case assigned to you. Tap to view the details.</ThemedText>
				</View>

				{/* ===== Actions ===== */}
				<ThemedButton
					text="View Risks"
					icon="shield-alert-outline"
					iconSize={22}
					onPress={() => handleNavigate("RisksStack")}
					style={styles.primaryButton}
				/>

				<ThemedButton
					text={action.title}
					icon={action.icon}
					iconSize={22}
					onPress={() => handleNavigate(action.destination)}
				/>
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
			padding: 20,
			paddingTop: 28,
			gap: 18,
		},
		screenTitle: {
			fontSize: 26,
			fontWeight: "800",
			letterSpacing: 0.5,
		},
		profileCard: {
			borderRadius: 20,
			padding: 18,
		},
		profileRow: {
			flexDirection: "row",
			alignItems: "center",
			gap: 14,
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
		notificationCard: {
			borderRadius: 16,
			borderWidth: 1,
			borderColor: theme.border,
			backgroundColor: theme.cardBackground,
			padding: 16,
			gap: 8,
		},
		notificationHeader: {
			flexDirection: "row",
			alignItems: "center",
			gap: 8,
		},
		notificationTitle: {
			fontSize: 16,
			fontWeight: "700",
		},
		notificationBody: {
			fontSize: 14,
			opacity: 0.85,
			lineHeight: 20,
		},
		primaryButton: {
			marginTop: 6,
		},
	})
}
