import { View, StyleSheet, TouchableOpacity } from "react-native"
import { NavigationProp, useNavigation } from "@react-navigation/native"
import { useSelector } from "react-redux"
import { getMessaging, onMessage } from "@react-native-firebase/messaging"
import { useEffect } from "react"
import { useMMKVObject } from "react-native-mmkv"

import ThemedText from "./ui/ThemedText"
import ThemedIcon from "./ui/ThemedIcon"
import NotificationItem from "./NotificationItem"

import { Theme } from "../utils/theme"
import { processNotification } from "../lib/notifications"

const messaging = getMessaging()

export default function NotificationsCard() {
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const navigation = useNavigation() as NavigationProp<any>

	const styles = createStyles(darkMode)

	const [notifications, setNotifications] = useMMKVObject<NotificationData[] | undefined>("notifications")

	const handlePress = (riskId: string | object) => {
		navigation.navigate("RiskDetailsScreen", { riskId })
		setNotifications(notifications?.filter((notification) => notification.riskId !== riskId) || [])

		// Mark the notification as read
		setNotifications(
			notifications?.map((notification) => (notification.riskId === riskId ? { ...notification, read: true } : notification)),
		)
	}

	useEffect(() => {
		const unsubscribe = onMessage(messaging, async (remoteMessage) => {
			const newNotification = processNotification(remoteMessage)
			if (newNotification) {
				if (Array.isArray(notifications)) {
					setNotifications((prev) => [newNotification, ...(prev || [])])
				} else {
					setNotifications([newNotification])
				}
			}
		})

		return unsubscribe
	}, [])

	return (
		<View style={styles.notificationCard}>
			<View style={styles.notificationHeader}>
				<ThemedIcon
					name="bell-ring-outline"
					size={22}
				/>
				<ThemedText style={styles.notificationTitle}>Son Bildirimler</ThemedText>
			</View>

			{notifications && notifications.length > 0 && notifications.some((n) => !n?.read) ? (
				notifications
					.filter((notification) => !notification?.read)
					.slice(0, 2)
					.map((notification, index) => (
						<NotificationItem
							key={index}
							notification={notification}
							darkMode={darkMode}
							onPress={() => handlePress(notification.riskId!)}
							showChevron
							compact
						/>
					))
			) : (
				<ThemedText style={styles.notificationText}>Henüz bildirim yok.</ThemedText>
			)}

			{notifications && notifications.length > 0 && notifications.some((n) => !n?.read) && (
				<TouchableOpacity
					style={styles.seeMoreButton}
					onPress={() => navigation.navigate("NotificationsScreen")}
				>
					<ThemedText style={styles.seeMore}>Tüm Bildirimler</ThemedText>
					<ThemedIcon
						name="chevron-right"
						size={21}
						style={{ marginTop: 2 }}
					/>
				</TouchableOpacity>
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
			paddingBottom: 10,
			gap: 8,
		},
		notificationHeader: {
			flexDirection: "row",
			alignItems: "center",
			gap: 8,
			marginBottom: 8,
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
		seeMoreButton: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "flex-end",
			marginTop: 5,
		},
		seeMore: {
			fontSize: 14,
			fontWeight: "700",
		},
	})
}
