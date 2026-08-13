import { View, StyleSheet, TouchableOpacity } from "react-native"
import { useEffect, useState } from "react"
import { useNavigation, NavigationProp } from "@react-navigation/native"

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

export const RiskStatusCounts = () => {
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const navigation = useNavigation() as NavigationProp<any>
	const { role } = useSelector((state: RootState) => state.auth)
	const { t } = useTranslation()

	const styles = createStyles(darkMode)

	const [counts, setCounts] = useState<Record<RiskStatus, number> | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchCounts = async () => {
			const data = await getCountOfRisksByStatus()
			setCounts(data)
			setLoading(false)
		}

		fetchCounts()
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

	if (loading)
		return (
			<View style={styles.container}>
				<ThemedActivityIndicator size="large" />
			</View>
		)

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

	return (
		<View style={styles.container}>
			<View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
				<ThemedIcon
					name="information-variant-circle-outline"
					size={18}
				/>
				<ThemedText style={{ fontSize: 16, fontWeight: "bold" }}>{role === "ADMIN" ? "Risk Durumları" : "Raporlarım"}</ThemedText>
			</View>

			<View style={styles.row}>
				<Box card={cards[0]} />
				<Box card={cards[1]} />
			</View>
			<View style={styles.row}>
				<Box card={cards[2]} />
				<Box card={cards[3]} />
			</View>
		</View>
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
	})
}
