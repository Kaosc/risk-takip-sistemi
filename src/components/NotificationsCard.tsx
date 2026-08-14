import { View, StyleSheet, TouchableOpacity } from "react-native"
import { NavigationProp, useNavigation } from "@react-navigation/native"
import { useSelector } from "react-redux"
import { useMMKVObject } from "react-native-mmkv"

import ThemedText from "./ui/ThemedText"
import ThemedIcon from "./ui/ThemedIcon"

import { Theme } from "../utils/theme"
import { safeTimestampToDateTimeString } from "../utils/date"

export default function NotificationsCard() {
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const navigation = useNavigation() as NavigationProp<any>

	const styles = createStyles(darkMode)

	const [notifications, setNotifications] = useMMKVObject<NotificationData[]>("latestNotifications")

	const handlePress = (riskId: string | object) => {
		navigation.navigate("RiskDetailsScreen", { riskId })

		// TODO: Uncomment after testings done
		// Remove the pressed notification from the list
		// setNotifications(notifications?.filter((notification) => notification.riskId !== riskId) || [])
	}

	return (
		<View style={styles.notificationCard}>
			<View style={styles.notificationHeader}>
				<ThemedIcon
					name="bell-ring-outline"
					size={22}
				/>
				<ThemedText style={styles.notificationTitle}>Son Bildirimler</ThemedText>
			</View>

			{notifications && notifications.length > 0 ? (
				notifications.map((notification) => (
					<TouchableOpacity
						key={notification.id}
						onPress={() => handlePress(notification.riskId!)}
						style={styles.notificationBody}
					>
						<View style={{ flex: 1, gap: 4 }}>
							<ThemedText style={styles.notificationTitle}>{notification.title}</ThemedText>
							<ThemedText style={styles.notificationDate}>
								{safeTimestampToDateTimeString(new Date(notification.date))}
							</ThemedText>
							<ThemedText style={styles.notificationText}>{notification.body}</ThemedText>
						</View>
						<ThemedIcon
							name="chevron-right"
							size={25}
						/>
					</TouchableOpacity>
				))
			) : (
				<ThemedText style={styles.notificationTitle}>Henüz bildirim yok.</ThemedText>
			)}
		</View>
	)
}

const createStyles = (darkMode: boolean) => {
	const theme = Theme[darkMode ? "dark" : "light"]

	return StyleSheet.create({
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
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			backgroundColor: theme.cardBackground,
			borderWidth: 2,
			borderColor: theme.border,
			borderRadius: 12,
			padding: 10,
			fontSize: 14,
			opacity: 1,
			lineHeight: 20,
			marginTop: 5,
			gap: 10,
		},
		notificationText: {
			fontSize: 14,
			lineHeight: 20,
		},
		notificationDate: {
			fontSize: 12,
			marginBottom: 5,
		},
	})
}
