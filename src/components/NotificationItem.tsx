import { StyleSheet, TouchableOpacity, View } from "react-native"

import ThemedIcon from "./ui/ThemedIcon"
import ThemedText from "./ui/ThemedText"
import { Theme } from "../utils/theme"
import { safeTimestampToDateTimeString } from "../utils/date"

type NotificationItemProps = {
	notification: NotificationData
	darkMode: boolean
	onPress?: () => void
	showChevron?: boolean
	compact?: boolean
}

export default function NotificationItem({
	notification,
	darkMode,
	onPress,
	showChevron = false,
	compact = false,
}: NotificationItemProps) {
	const styles = createStyles(darkMode, compact)

	return (
		<TouchableOpacity
			onPress={onPress}
			style={[styles.item, !notification.read && styles.unreadItem]}
		>
			<View style={styles.contentWrapper}>
				<View style={styles.headerRow}>
					{!notification.read && <View style={styles.unreadDot} />}
					<ThemedText style={styles.title}>{notification.title}</ThemedText>
				</View>

				<ThemedText style={styles.date}>{safeTimestampToDateTimeString(new Date(notification.date))}</ThemedText>
				<ThemedText style={styles.body}>{notification.body}</ThemedText>
			</View>

			{showChevron && (
				<ThemedIcon
					name="chevron-right"
					size={25}
				/>
			)}
		</TouchableOpacity>
	)
}

const createStyles = (darkMode: boolean, compact: boolean) => {
	const theme = Theme[darkMode ? "dark" : "light"]

	return StyleSheet.create({
		item: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			backgroundColor: theme.cardBackground,
			borderWidth: 1,
			borderColor: theme.border,
			borderRadius: compact ? 12 : 14,
			padding: compact ? 10 : 14,
			gap: compact ? 8 : 10,
		},
		unreadItem: {
			borderColor: darkMode ? "#7aa2ff" : "#4a7cff",
			backgroundColor: darkMode ? "#141b2e" : "#edf4ff",
		},
		contentWrapper: {
			flex: 1,
			gap: compact ? 3 : 6,
		},
		headerRow: {
			flexDirection: "row",
			alignItems: "center",
			gap: 8,
		},
		unreadDot: {
			width: 8,
			height: 8,
			borderRadius: 4,
			backgroundColor: darkMode ? "#7aa2ff" : "#4a7cff",
		},
		title: {
			fontSize: compact ? 14 : 15,
			fontWeight: "700",
			flex: 1,
		},
		date: {
			fontSize: 12,
			color: darkMode ? "#b5b5b5" : "#5f5f5f",
		},
		body: {
			fontSize: compact ? 13 : 14,
			lineHeight: compact ? 18 : 20,
		},
	})
}
