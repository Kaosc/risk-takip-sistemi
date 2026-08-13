import { useCallback, useEffect, useMemo, useState } from "react"
import { FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native"
import { useSelector } from "react-redux"
import { useNavigation, NavigationProp, useFocusEffect } from "@react-navigation/native"
import { useTranslation } from "react-i18next"

import ThemedText from "../components/ui/ThemedText"
import ThemedIcon from "../components/ui/ThemedIcon"
import ThemedActivityIndicator from "../components/ui/ThemedActivityIndicator"
import CustomHeader from "../components/CustomHeader"

import { getAllRisks, getRisksAssignedToStaff, getRisksByUserId } from "../lib/firebase/firestore/risks"
import { Theme } from "../utils/theme"
import { BOTTOM_TAB_HEIGHT } from "../lib/constants"

export default function RisksScreen({
	route,
}: {
	route: {
		params: {
			status: RiskStatus
		}
	}
}) {
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const { role, uid } = useSelector((state: RootState) => state.auth)
	const navigation = useNavigation() as NavigationProp<any>
	const { t } = useTranslation()

	const styles = createStyles(darkMode)

	const [risks, setRisks] = useState<Risk[]>([])
	const [loading, setLoading] = useState(true)
	const [statusFilter, setStatusFilter] = useState<RiskStatus | null>(route.params?.status || null)

	const filteredRisks = useMemo(() => {
		if (statusFilter) {
			return risks.filter((risk) => risk.status === statusFilter)
		}
		return risks
	}, [risks, statusFilter])

	useFocusEffect(
		useCallback(() => {
			navigation.setParams({ status: undefined })
		}, []),
	)

	useEffect(() => {
		fetchRisks()
	}, [])

	const fetchRisks = async () => {
		setLoading(true)

		if (role === "MEMBER" && uid) {
			const data = await getRisksByUserId(uid)
			setRisks(data)
		}

		if (role === "STAFF" && uid) {
			const data = await getRisksAssignedToStaff(uid)
			setRisks(data)
		}

		if (role === "ADMIN") {
			const data = await getAllRisks()
			setRisks(data)
		}

		setLoading(false)
	}

	const theme = Theme[darkMode ? "dark" : "light"]

	const severityBadgeColor: Record<RiskSeverity, { bg: string; txt: string }> = {
		low: {
			bg: theme.primary.bg,
			txt: theme.primary.fg,
		},
		medium: {
			bg: theme.green.bg,
			txt: theme.green.fg,
		},
		high: {
			bg: theme.orange.bg,
			txt: theme.orange.fg,
		},
		critical: {
			bg: theme.red.bg,
			txt: theme.red.fg,
		},
	}

	const statusBadgeColor: Record<RiskStatus, { bg: string; txt: string }> = {
		new: {
			bg: theme.primary.bg,
			txt: theme.primary.fg,
		},
		inprogress: {
			bg: theme.blue.bg,
			txt: theme.blue.fg,
		},
		pending: {
			bg: theme.orange.bg,
			txt: theme.orange.fg,
		},
		completed: {
			bg: theme.green.bg,
			txt: theme.green.fg,
		},
	}

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ThemedActivityIndicator size="large" />
			</View>
		)
	}

	const renderItem = ({ item }: { item: Risk }) => (
		<TouchableOpacity
			style={styles.cardWrapper}
			activeOpacity={0.7}
			onPress={() => navigation.navigate("RiskDetailsScreen", { risk: item })}
		>
			<View style={styles.card}>
				<View style={styles.cardHeader}>
					<ThemedIcon
						name="clipboard-text-outline"
						size={22}
					/>
					<ThemedText style={styles.cardType}>{t(item.type)}</ThemedText>
				</View>

				<View style={styles.metaRow}>
					<ThemedIcon
						name="tag-outline"
						size={18}
					/>
					<ThemedText style={styles.metaText}>{t(item.category)}</ThemedText>
				</View>

				<View style={styles.metaRow}>
					<ThemedIcon
						name="map-marker-outline"
						size={18}
					/>
					<ThemedText style={styles.metaText}>{t(item.location)}</ThemedText>
				</View>

				<View style={styles.badgeRow}>
					<View
						style={[
							styles.badge,
							{ backgroundColor: severityBadgeColor[item.severity].bg, borderColor: severityBadgeColor[item.severity].txt },
						]}
					>
						<ThemedText style={[styles.badgeText, { color: severityBadgeColor[item.severity].txt }]}>
							<ThemedText>Önem: </ThemedText> {t(item.severity)}
						</ThemedText>
					</View>
					<View
						style={[
							styles.badge,
							{ backgroundColor: statusBadgeColor[item.status].bg, borderColor: statusBadgeColor[item.status].txt },
						]}
					>
						<ThemedText style={[styles.badgeText, { color: statusBadgeColor[item.status].txt }]}>
							<ThemedText>Durum: </ThemedText> {t(item.status)}
						</ThemedText>
					</View>
				</View>
			</View>
		</TouchableOpacity>
	)

	const TabButtons = () => (
		<ScrollView
			horizontal
			style={styles.tabRow}
			contentContainerStyle={{ flexGrow: 1, justifyContent: "space-around", paddingHorizontal: 5, gap: 8 }}
		>
			{(["new", "inprogress", "pending", "completed"] as RiskStatus[]).map((status) => (
				<TouchableOpacity
					key={status}
					style={[
						styles.badge,
						{
							minHeight: 34,
							paddingHorizontal: 14,
							paddingVertical: 6,
							backgroundColor: statusBadgeColor[status].bg,
							borderColor: statusBadgeColor[status].txt,
							opacity: statusFilter === status ? 1 : 0.55,
						},
					]}
					onPress={() => {
						if (statusFilter === status) {
							setStatusFilter(null)
						} else {
							setStatusFilter(status)
						}
					}}
				>
					<ThemedText style={[styles.badgeLabel, { color: statusBadgeColor[status].txt, fontSize: 14 }]}>{t(status)}</ThemedText>
				</TouchableOpacity>
			))}
		</ScrollView>
	)

	return (
		<View style={styles.container}>
			<CustomHeader title={role === "ADMIN" ? "Raporlar" : "Raporlarım"} />
			<TabButtons />
			<FlatList
				data={filteredRisks}
				keyExtractor={(item) => item.id}
				renderItem={renderItem}
				contentContainerStyle={styles.listContent}
				showsVerticalScrollIndicator={false}
				ListEmptyComponent={
					<View style={styles.emptyContainer}>
						<ThemedIcon
							name="alert-circle-outline"
							size={50}
							style={{ opacity: 0.6 }}
						/>
						<ThemedText style={styles.emptyText}>Kayıtlı risk raporunuz yok</ThemedText>
					</View>
				}
			/>
		</View>
	)
}

const createStyles = (darkMode: boolean) => {
	const theme = Theme[darkMode ? "dark" : "light"]

	return StyleSheet.create({
		container: {
			backgroundColor: theme.background,
		},
		loadingContainer: {
			flex: 1,
			alignItems: "center",
			justifyContent: "center",
			backgroundColor: theme.background,
		},
		listContent: {
			padding: 16,
			paddingBottom: 24,
			gap: 12,
			flexGrow: 1,
			height: "100%",
		},
		cardWrapper: {
			borderRadius: 16,
			overflow: "hidden",
		},
		tabRow: {
			paddingVertical: 12,
			borderRadius: 12,
			marginHorizontal: 10,
			marginTop: 10,
		},
		card: {
			borderRadius: 16,
			padding: 16,
			gap: 8,
			backgroundColor: theme.cardBackground,
			borderWidth: 1,
			borderColor: theme.border,
		},
		cardHeader: {
			flexDirection: "row",
			alignItems: "center",
			gap: 10,
			marginBottom: 4,
		},
		cardType: {
			fontSize: 18,
			fontWeight: "700",
			flex: 1,
		},
		metaRow: {
			flexDirection: "row",
			alignItems: "center",
			gap: 8,
		},
		metaText: {
			fontSize: 14,
			flex: 1,
		},
		badgeRow: {
			flexDirection: "row",
			gap: 8,
			marginTop: 8,
		},
		row: {
			alignItems: "center",
			gap: 8,
		},
		badge: {
			paddingHorizontal: 10,
			paddingVertical: 4,
			borderRadius: 99,
			borderWidth: 1,
			borderColor: theme.border,
			backgroundColor: darkMode ? "#1f1f22" : "#ffffff",
		},
		badgeLabel: {
			fontSize: 12,
			fontWeight: "600",
		},
		badgeText: {
			fontSize: 14,
			fontWeight: "600",
		},
		emptyContainer: {
			alignItems: "center",
			justifyContent: "center",
			flex: 1,
			gap: 12,
			paddingBottom: BOTTOM_TAB_HEIGHT,
		},
		emptyText: {
			fontSize: 15,
			opacity: 0.6,
			textAlign: "center",
		},
	})
}
