import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from "react-native"
import { NavigationProp, useNavigation } from "@react-navigation/native"
import { useSelector } from "react-redux"
import { useMMKVObject } from "react-native-mmkv"

import ThemedText from "../components/ui/ThemedText"
import ThemedIcon from "../components/ui/ThemedIcon"
import NotificationItem from "../components/NotificationItem"
import CustomHeader from "../components/CustomHeader"

import { Theme } from "../utils/theme"

export default function NotificationsScreen() {
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const navigation = useNavigation() as NavigationProp<any>
	const styles = createStyles(darkMode)

	const [notifications, setNotifications] = useMMKVObject<NotificationData[] | undefined>("notifications")

	const sortedNotifications = [...(notifications || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

	const handleOpenNotification = (notification: NotificationData) => {
		if (notification.riskId) {
			navigation.navigate("RiskDetailsScreen", { riskId: notification.riskId })
		}

		setNotifications((prev) => (prev || []).map((item) => (item.id === notification.id ? { ...item, read: true } : item)))
	}

	const renderItem = ({ item }: { item: NotificationData }) => (
		<NotificationItem
			notification={item}
			darkMode={darkMode}
			onPress={() => handleOpenNotification(item)}
		/>
	)

	const emptyNotifications = () => {
		Alert.alert(
			"Bildirimleri Temizle",
			"Tüm bildirimleri silmek istediğinizden emin misiniz?",
			[
				{
					text: "İptal",
					style: "cancel",
				},
				{
					text: "Sil",
					style: "destructive",
					onPress: () => setNotifications([]),
				},
			],
			{ cancelable: true },
		)
	}

	const RightComponent = () => (
		<View
			style={{
				flex: 1,
				flexDirection: "row",
				alignItems: "center",
				gap: 8,
				width: "100%",
				justifyContent: "flex-end",
			}}
		>
			<ThemedText style={styles.totalCount}>{sortedNotifications.length}</ThemedText>
			<TouchableOpacity
				onPress={emptyNotifications}
				style={styles.backButton}
			>
				<ThemedIcon
					name="trash-can-outline"
					size={20}
				/>
			</TouchableOpacity>
		</View>
	)

	return (
		<View style={styles.container}>
			<CustomHeader
				title="Bildirimler"
				onBackPress={() => navigation.goBack()}
				rightComponent={<RightComponent />}
			/>

			{sortedNotifications.length > 0 ? (
				<FlatList
					data={sortedNotifications}
					keyExtractor={(item) => item.id ?? `${item.date}-${item.title}`}
					renderItem={renderItem}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.listContent}
				/>
			) : (
				<View style={styles.emptyState}>
					<ThemedIcon
						name="bell-off-outline"
						size={32}
					/>
					<ThemedText style={styles.emptyText}>Henüz bildirim yok.</ThemedText>
				</View>
			)}
		</View>
	)
}

const createStyles = (darkMode: boolean) => {
	const theme = Theme[darkMode ? "dark" : "light"]

	return StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: theme.background,
		},
		header: {
			flexDirection: "row",
			alignItems: "center",
			paddingHorizontal: 16,
			paddingTop: 18,
			paddingBottom: 12,
			borderBottomWidth: 1,
			borderBottomColor: theme.border,
			gap: 12,
		},
		backButton: {
			width: 36,
			height: 36,
			borderRadius: 18,
			alignItems: "center",
			justifyContent: "center",
			backgroundColor: theme.cardBackground,
			borderWidth: 1,
			borderColor: theme.border,
		},
		headerTitle: {
			fontSize: 20,
			fontWeight: "700",
			flex: 1,
		},
		totalCount: {
			fontSize: 16,
			fontWeight: "700",
			paddingHorizontal: 10,
			paddingVertical: 4,
			borderRadius: 99,
			backgroundColor: theme.cardBackground,
			borderWidth: 1,
			borderColor: theme.border,
		},
		listContent: {
			padding: 16,
			gap: 12,
		},
		emptyState: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
			padding: 32,
			gap: 12,
		},
		emptyText: {
			fontSize: 15,
			textAlign: "center",
		},
	})
}
