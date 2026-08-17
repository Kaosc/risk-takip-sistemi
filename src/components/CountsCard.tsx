import { View, StyleSheet, TouchableOpacity } from "react-native"
import { useEffect, useState } from "react"
import { useNavigation, NavigationProp } from "@react-navigation/native"
import { getMessaging, onMessage } from "@react-native-firebase/messaging"

import { getCountOfRisksByStatus } from "../lib/firebase/firestore/risks"
import { useTranslation } from "react-i18next"
import { Theme } from "../utils/theme"
import { useSelector } from "react-redux"

import ThemedText from "./ui/ThemedText"
import ThemedIcon from "./ui/ThemedIcon"
import ThemedActivityIndicator from "./ui/ThemedActivityIndicator"
import { AllIconNames } from "../types/icon"

type RiskStatus = "new" | "inprogress" | "pending" | "completed"

interface CountCard {
	status: RiskStatus
	count: number
	icon: AllIconNames
	color: string
	border: string
}

const messaging = getMessaging()

export const RiskStatusCounts = () => {
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const navigation = useNavigation() as NavigationProp<any>
	const { role } = useSelector((state: RootState) => state.auth)
	const { t } = useTranslation()

	const styles = createStyles(darkMode)

	const [counts, setCounts] = useState<Record<RiskStatus, number> | null>(null)
	const [loading, setLoading] = useState(true)

	const fetchCounts = async () => {
		const data = await getCountOfRisksByStatus()
		setCounts(data)
		setLoading(false)
	}

	useEffect(() => {
		fetchCounts()
	}, [])

	useEffect(() => {
		const unsubscribe = onMessage(messaging, async (m) => {
			await fetchCounts()
		})

		return unsubscribe
	}, [])

	const theme = Theme[darkMode ? "dark" : "light"]

	const cards: CountCard[] = [
		{ status: "new", icon: "star", count: counts?.new || 0, color: theme.primary.bg, border: theme.primary.fg },
		{ status: "inprogress", icon: "refresh", count: counts?.inprogress || 0, color: theme.blue.bg, border: theme.blue.fg },
		{ status: "pending", icon: "timer-sand", count: counts?.pending || 0, color: theme.orange.bg, border: theme.orange.fg },
		{
			status: "completed",
			icon: "check-circle-outline",
			count: counts?.completed || 0,
			color: theme.green.bg,
			border: theme.green.fg,
		},
	]

	const handleNavigateToStatus = (status: RiskStatus) => {
		navigation.navigate("RisksStack", { screen: "RisksScreen", params: { status } })
	}

	const Box = ({ card }: { card: CountCard }) => (
		<TouchableOpacity
			onPress={() => handleNavigateToStatus(card.status)}
			activeOpacity={0.7}
			key={card.status}
			style={[styles.card, { backgroundColor: card.color, borderColor: card.border + "88" }]}
		>
			<ThemedIcon
				name={card.icon}
				size={25}
				style={{ marginBottom: 6 }}
				color={card.border}
			/>
			<ThemedText style={styles.label}>{t(card.status)}</ThemedText>
			<ThemedText style={styles.count}>{card.count}</ThemedText>
		</TouchableOpacity>
	)

	const Container = ({ children }: { children: React.ReactNode }) => (
		<View style={styles.container}>
			<View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
				<ThemedIcon
					name="information-variant-circle-outline"
					size={18}
				/>
				<ThemedText style={{ fontSize: 16, fontWeight: "bold" }}>{t("Raporlarım")}</ThemedText>
			</View>
			{children}
		</View>
	)

	if (loading) {
		return (
			<Container>
				<View
					style={[
						styles.container,
						{
							minHeight: 190,
							alignItems: "center",
							justifyContent: "center",
							borderWidth: 0,
						},
					]}
				>
					<ThemedActivityIndicator size="large" />
				</View>
			</Container>
		)
	}

	if (role === "ADMIN") {
		return (
			<Container>
				<TouchableOpacity
					activeOpacity={0.7}
					onPress={() => handleNavigateToStatus("new")}
					style={[
						styles.row,
						styles.rowButton,
						{
							backgroundColor: theme.primary.bg,
							borderColor: theme.primary.fg,
						},
					]}
				>
					<View style={{ gap: 10, flex: 1 }}>
						<View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
							<ThemedIcon
								name="clipboard-text-outline"
								size={22}
							/>
							<ThemedText style={{ fontSize: 14, fontWeight: "bold" }}>İncelenmeyi Bekleyen Riskler</ThemedText>
						</View>
						<View style={{ flex: 1, justifyContent: "center" }}>
							{counts?.new ? (
								<ThemedText style={{ fontSize: 15 }}>İncelenmeyi bekleyen {counts?.new || 0} risk var</ThemedText>
							) : (
								<ThemedText style={{ fontSize: 15 }}>İncelenmeyi bekleyen hiç risk yok</ThemedText>
							)}
						</View>
					</View>

					{role === "ADMIN" && counts?.new ? (
						<ThemedText style={{ fontSize: 25, fontWeight: "bold" }}>{counts?.new}</ThemedText>
					) : (
						<ThemedIcon
							name="check-circle-outline"
							size={25}
							color={theme.primary.fg}
						/>
					)}
				</TouchableOpacity>

				<TouchableOpacity
					activeOpacity={0.7}
					onPress={() => handleNavigateToStatus("pending")}
					style={[
						styles.row,
						styles.rowButton,
						{
							backgroundColor: theme.orange.bg,
							borderColor: theme.orange.fg,
						},
					]}
				>
					<View style={{ gap: 10, flex: 1 }}>
						<View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
							<ThemedIcon
								name="clipboard-text-outline"
								size={22}
							/>
							<ThemedText style={{ fontSize: 14, fontWeight: "bold" }}>Onay Bekleyen Riskler</ThemedText>
						</View>
						<View style={{ flex: 1, justifyContent: "center" }}>
							{counts?.pending ? (
								<ThemedText style={{ fontSize: 15 }}>Onay bekleyen {counts?.pending || 0} risk var</ThemedText>
							) : (
								<ThemedText style={{ fontSize: 15 }}>Onay bekleyen hiç risk yok</ThemedText>
							)}
						</View>
					</View>

					{role === "ADMIN" && counts?.pending ? (
						<ThemedText style={{ fontSize: 25, fontWeight: "bold" }}>{counts?.pending}</ThemedText>
					) : (
						<ThemedIcon
							name="check-circle-outline"
							size={25}
							color={theme.orange.fg}
						/>
					)}
				</TouchableOpacity>

				<View style={styles.row}>
					<Box card={cards[1]} />
					<Box card={cards[3]} />
				</View>
			</Container>
		)
	}

	if (role === "STAFF") {
		return (
			<Container>
				<TouchableOpacity
					activeOpacity={0.7}
					onPress={() => handleNavigateToStatus("inprogress")}
					style={[
						styles.row,
						styles.rowButton,
						{
							backgroundColor: theme.blue.bg,
							borderColor: theme.blue.fg,
						},
					]}
				>
					<View style={{ gap: 10, flex: 1 }}>
						<View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
							<ThemedIcon
								name="clipboard-text-outline"
								size={22}
							/>
							<ThemedText style={{ fontSize: 14, fontWeight: "bold" }}>Atanan Görevler</ThemedText>
						</View>

						<View style={{ flex: 1, justifyContent: "center" }}>
							{counts?.inprogress ? (
								<ThemedText style={{ fontSize: 15 }}>İlgilenilmesi gereken {counts?.inprogress || 0} görev var</ThemedText>
							) : (
								<ThemedText style={{ fontSize: 15 }}>Atanamış hiç görev yok</ThemedText>
							)}
						</View>
					</View>

					{counts?.inprogress ? (
						<ThemedText style={{ fontSize: 25, fontWeight: "bold" }}>{counts?.inprogress}</ThemedText>
					) : (
						<ThemedIcon
							name="check-circle-outline"
							size={25}
							color={theme.blue.fg}
						/>
					)}
				</TouchableOpacity>

				<View style={styles.row}>
					<Box card={cards[2]} />
					<Box card={cards[3]} />
				</View>
			</Container>
		)
	}

	// For MEMBER & ADMIN
	return (
		<Container>
			<View style={styles.row}>
				<Box card={cards[0]} />
				<Box card={cards[1]} />
			</View>
			<View style={styles.row}>
				<Box card={cards[2]} />
				<Box card={cards[3]} />
			</View>
		</Container>
	)
}

const createStyles = (darkMode: boolean) => {
	const theme = Theme[darkMode ? "dark" : "light"]

	return StyleSheet.create({
		container: {
			gap: 16,
			backgroundColor: theme.cardBackground,
			borderWidth: 1,
			borderColor: theme.border,
			padding: 14,
			borderRadius: 12,
		},
		row: {
			flex: 1,
			flexDirection: "row",
			gap: 16,
		},
		card: {
			flex: 1,
			padding: 10,
			borderWidth: 1,
			alignItems: "center",
			justifyContent: "center",
			borderRadius: 12,
		},
		label: {
			textAlign: "center",
			fontSize: 12,
			fontWeight: "bold",
			letterSpacing: 1,
		},
		count: {
			fontSize: 23,
			fontWeight: "bold",
		},
		rowButton: {
			borderWidth: 1,
			padding: 10,
			borderRadius: 12,
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			paddingHorizontal: 14,
		},
	})
}
