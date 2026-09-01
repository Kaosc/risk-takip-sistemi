import { useCallback, useMemo, useState } from "react"
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native"
import { useSelector } from "react-redux"
import { useFocusEffect } from "@react-navigation/native"
import { useTranslation } from "react-i18next"

import CustomHeader from "../components/CustomHeader"
import ThemedText from "../components/ui/ThemedText"
import ThemedIcon from "../components/ui/ThemedIcon"
import ThemedActivityIndicator from "../components/ui/ThemedActivityIndicator"

import { getAllRisks, getRisksAssignedToStaff, getRisksByUserId } from "../lib/firebase/firestore/risks"
import { getStaffs } from "../lib/firebase/firestore/users"
import { calculateRiskStatistics, getLastMonths } from "../lib/statistics"
import { BOTTOM_TAB_HEIGHT, typeIconMap } from "../lib/constants"
import { AllIconNames } from "../types/icon"
import { Theme } from "../utils/theme"

const statusOrder: RiskStatus[] = ["new", "inprogress", "pending", "completed"]
const severityOrder: RiskSeverity[] = ["low", "medium", "high", "critical"]
const typeOrder: RiskType[] = ["risk", "accident", "nearmiss"]

const statusMeta: Record<RiskStatus, { icon: AllIconNames }> = {
	new: { icon: "star" },
	inprogress: { icon: "refresh" },
	pending: { icon: "timer-sand" },
	completed: { icon: "check-circle-outline" },
}

const severityMeta: Record<RiskSeverity, { icon: AllIconNames }> = {
	low: { icon: "arrow-down-circle" },
	medium: { icon: "minus-circle" },
	high: { icon: "alert-circle" },
	critical: { icon: "alert-octagon" },
}

export default function StatisticsScreen() {
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const { role, uid, name } = useSelector((state: RootState) => state.auth)
	const { t } = useTranslation()

	const styles = createStyles(darkMode)
	const theme = Theme[darkMode ? "dark" : "light"]

	const [risks, setRisks] = useState<Risk[]>([])
	const [staffNames, setStaffNames] = useState<Record<string, string>>({})
	const [loading, setLoading] = useState(true)

	const fetchData = useCallback(async () => {
		setLoading(true)

		if (role === "MEMBER" && uid) {
			setRisks(await getRisksByUserId(uid))
		} else if (role === "STAFF" && uid) {
			setRisks(await getRisksAssignedToStaff(uid))
			setStaffNames({ [uid]: name || uid })
		} else {
			setRisks(await getAllRisks())
			try {
				const staffs = await getStaffs()
				const map: Record<string, string> = {}
				staffs.forEach((s) => (map[s.uid] = s.name))
				if (uid && name) {
					map[uid] = name
				}
				setStaffNames(map)
			} catch (e) {
				console.debug("[STATISTICS] staff names fetch error:", e)
			}
		}

		setLoading(false)
	}, [role, uid, name])

	useFocusEffect(
		useCallback(() => {
			fetchData()
		}, [fetchData]),
	)

	const stats = useMemo(() => calculateRiskStatistics(risks, staffNames), [risks, staffNames])

	const categories = useMemo(
		() =>
			Object.entries(stats.byCategory)
				.map(([key, count]) => ({ key, count }))
				.sort((a, b) => b.count - a.count),
		[stats],
	)

	const assignedStaff = useMemo(() => {
		const list = Object.entries(stats.byAssignedStaff)
			.map(([key, count]) => ({ key, count }))
			.sort((a, b) => b.count - a.count)

		if (stats.unassignedCount > 0) {
			list.push({ key: "unassigned", count: stats.unassignedCount })
		}

		return list
	}, [stats])

	const monthKeys = getLastMonths(6)
	const monthData = monthKeys.map((key) => ({ key, count: stats.byMonth[key] || 0 }))

	const reportsMax = Math.max(stats.thisWeek, stats.lastWeek, stats.thisMonth, stats.lastMonth, 1)
	const maxCategory = categories[0]?.count || 1
	const maxStaff = Math.max(assignedStaff[0]?.count || 0, 1)
	const maxMonth = Math.max(...monthData.map((d) => d.count), 1)

	const statusColors: Record<RiskStatus, { bg: string; fg: string }> = {
		new: theme.primary,
		inprogress: theme.blue,
		pending: theme.orange,
		completed: theme.green,
	}

	const severityColors: Record<RiskSeverity, { bg: string; fg: string }> = {
		low: theme.green,
		medium: theme.blue,
		high: theme.orange,
		critical: theme.red,
	}

	const typeColors: Record<RiskType, { bg: string; fg: string }> = {
		risk: theme.primary,
		accident: theme.red,
		nearmiss: theme.violet,
	}

	const statusBoxes = statusOrder.map((status) => ({
		label: t(status),
		count: stats.byStatus[status],
		icon: statusMeta[status].icon,
		bg: statusColors[status].bg,
		fg: statusColors[status].fg,
	}))

	const priorityBoxes = severityOrder.map((severity) => ({
		label: t(severity),
		count: stats.bySeverity[severity],
		icon: severityMeta[severity].icon,
		bg: severityColors[severity].bg,
		fg: severityColors[severity].fg,
	}))

	const typeBoxes = typeOrder.map((type) => ({
		label: t(type),
		count: stats.byType[type],
		icon: typeIconMap[type],
		bg: typeColors[type].bg,
		fg: typeColors[type].fg,
	}))

	const Section = ({ title, icon, children }: { title: string; icon: AllIconNames; children: React.ReactNode }) => (
		<View style={styles.section}>
			<View style={styles.sectionHeader}>
				<ThemedIcon
					name={icon}
					size={18}
				/>
				<ThemedText style={styles.sectionTitle}>{title}</ThemedText>
			</View>
			{children}
		</View>
	)

	const BoxRow = ({ items }: { items: { label: string; count: number; icon: AllIconNames; bg: string; fg: string }[] }) => (
		<View style={styles.boxRow}>
			{items.map((item) => (
				<View
					key={item.label}
					style={[styles.statBox, { backgroundColor: item.bg, borderColor: item.fg + "88" }]}
				>
					<ThemedIcon
						name={item.icon}
						size={22}
						color={item.fg}
					/>
					<ThemedText
						style={styles.statBoxLabel}
						disableDeviceFontScaling
					>
						{item.label}
					</ThemedText>
					<ThemedText style={styles.statBoxCount}>{item.count}</ThemedText>
				</View>
			))}
		</View>
	)

	const BarRow = ({ label, count, max }: { label: string; count: number; max: number }) => {
		const percentage = max > 0 ? Math.round((count / max) * 100) : 0

		return (
			<View style={styles.barRow}>
				<View style={styles.barLabelRow}>
					<ThemedText
						style={styles.barLabel}
						numberOfLines={1}
					>
						{label}
					</ThemedText>
					<ThemedText style={styles.barCount}>{count}</ThemedText>
				</View>
				<View style={[styles.barTrack, { backgroundColor: theme.border }]}>
					<View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: theme.text }]} />
				</View>
			</View>
		)
	}

	const MonthlyChart = ({ data, max }: { data: { key: string; count: number }[]; max: number }) => (
		<View style={styles.chartContainer}>
			{data.map((d) => {
				const pct = max > 0 ? Math.round((d.count / max) * 100) : 0

				return (
					<View
						key={d.key}
						style={styles.chartCol}
					>
						<ThemedText style={styles.chartValue}>{d.count}</ThemedText>
						<View style={[styles.chartBarTrack, { backgroundColor: theme.border }]}>
							<View
								style={[
									styles.chartBarFill,
									{
										height: `${Math.max(pct, d.count ? 4 : 2)}%`,
										backgroundColor: theme.text,
									},
								]}
							/>
						</View>
						<ThemedText style={styles.chartLabel}>{d.key.split("-").reverse().join("/")}</ThemedText>
					</View>
				)
			})}
		</View>
	)

	if (loading && risks.length === 0) {
		return (
			<View style={styles.loadingContainer}>
				<ThemedActivityIndicator size="large" />
			</View>
		)
	}

	return (
		<View style={styles.container}>
			<CustomHeader
				title="İstatistikler"
				showBackButton={false}
			/>

			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={loading}
						onRefresh={fetchData}
						tintColor={theme.text}
						colors={[theme.text]}
					/>
				}
			>
				{/* Toplam riskler */}
				<View style={[styles.totalCard, { borderColor: theme.border }]}>
					<View style={[styles.totalIconWrap, { backgroundColor: theme.primary.bg }]}>
						<ThemedIcon
							name="chart-bar"
							size={26}
							color={theme.primary.fg}
						/>
					</View>
					<View style={styles.totalInfo}>
						<ThemedText style={styles.totalLabel}>Toplam Risk</ThemedText>
						<ThemedText
							style={styles.totalSub}
							disableDeviceFontScaling
						>
							Toplam kayıt sayısı
						</ThemedText>
					</View>
					<ThemedText style={styles.totalValue}>{stats.total}</ThemedText>
				</View>

				{/* Haftalık / Aylık raporlar */}
				<Section
					title="Haftalık / Aylık Raporlar"
					icon="calendar-range"
				>
					<View style={styles.rows}>
						<BarRow
							label="Bu Hafta"
							count={stats.thisWeek}
							max={reportsMax}
						/>
						<BarRow
							label="Geçen Hafta"
							count={stats.lastWeek}
							max={reportsMax}
						/>
						<BarRow
							label="Bu Ay"
							count={stats.thisMonth}
							max={reportsMax}
						/>
						<BarRow
							label="Geçen Ay"
							count={stats.lastMonth}
							max={reportsMax}
						/>
					</View>
				</Section>

				{/* Duruma göre */}
				<Section
					title={`Duruma Göre (${stats.total})`}
					icon="information-variant-circle-outline"
				>
					<BoxRow items={statusBoxes.slice(0, 2)} />
					<BoxRow items={statusBoxes.slice(2)} />
				</Section>

				{/* Önceliğe göre */}
				<Section
					title={`Önceliğe Göre (${stats.total})`}
					icon="alert-octagon-outline"
				>
					<BoxRow items={priorityBoxes.slice(0, 2)} />
					<BoxRow items={priorityBoxes.slice(2)} />
				</Section>

				{/* Türe göre */}
				<Section
					title={`Türe Göre (${stats.total})`}
					icon={typeIconMap.risk}
				>
					<BoxRow items={typeBoxes} />
				</Section>

				{/* Kategoriye göre */}
				{categories.length > 0 && (
					<Section
						title="Kategoriye Göre"
						icon="shape-outline"
					>
						<View style={styles.rows}>
							{categories.map((category) => (
								<BarRow
									key={category.key}
									label={t(category.key)}
									count={category.count}
									max={maxCategory}
								/>
							))}
						</View>
					</Section>
				)}

				{/* Personele göre */}
				{assignedStaff.length > 0 && (
					<Section
						title="Personele Göre"
						icon="account-group-outline"
					>
						<View style={styles.rows}>
							{assignedStaff.map((item) => (
								<BarRow
									key={item.key}
									label={item.key === "unassigned" ? "Atanmamış" : item.key}
									count={item.count}
									max={maxStaff}
								/>
							))}
						</View>
					</Section>
				)}

				{/* Aylara göre */}
				<Section
					title="Aylara Göre (Oluşturulma Tarihi)"
					icon="chart-line"
				>
					<MonthlyChart
						data={monthData}
						max={maxMonth}
					/>
				</Section>
			</ScrollView>
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
		loadingContainer: {
			flex: 1,
			alignItems: "center",
			justifyContent: "center",
			backgroundColor: theme.background,
		},
		content: {
			gap: 14,
			padding: 14,
			paddingBottom: BOTTOM_TAB_HEIGHT + 14,
		},
		totalCard: {
			flexDirection: "row",
			alignItems: "center",
			gap: 12,
			borderWidth: 1,
			borderRadius: 14,
			padding: 16,
			backgroundColor: theme.cardBackground,
		},
		totalIconWrap: {
			width: 52,
			height: 52,
			borderRadius: 26,
			alignItems: "center",
			justifyContent: "center",
		},
		totalInfo: {
			flex: 1,
			gap: 2,
		},
		totalLabel: {
			fontSize: 16,
			fontWeight: "700",
		},
		totalSub: {
			fontSize: 12,
			opacity: 0.6,
		},
		totalValue: {
			fontSize: 34,
			fontWeight: "800",
		},
		section: {
			borderWidth: 1,
			borderColor: theme.border,
			borderRadius: 14,
			padding: 14,
			backgroundColor: theme.cardBackground,
			gap: 12,
		},
		sectionHeader: {
			flexDirection: "row",
			alignItems: "center",
			gap: 8,
		},
		sectionTitle: {
			flex: 1,
			fontSize: 15,
			fontWeight: "700",
		},
		rows: {
			gap: 12,
		},
		boxRow: {
			flexDirection: "row",
			gap: 10,
		},
		statBox: {
			flex: 1,
			borderWidth: 1,
			borderRadius: 12,
			paddingVertical: 12,
			paddingHorizontal: 8,
			alignItems: "center",
			justifyContent: "center",
			gap: 4,
		},
		statBoxLabel: {
			fontSize: 12,
			fontWeight: "700",
			letterSpacing: 0.4,
			textAlign: "center",
		},
		statBoxCount: {
			fontSize: 22,
			fontWeight: "800",
		},
		barRow: {
			gap: 6,
		},
		barLabelRow: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			gap: 10,
		},
		barLabel: {
			flex: 1,
			fontSize: 13,
			fontWeight: "600",
		},
		barCount: {
			fontSize: 14,
			fontWeight: "800",
		},
		barTrack: {
			height: 8,
			borderRadius: 4,
			overflow: "hidden",
		},
		barFill: {
			height: "100%",
			borderRadius: 4,
		},
		chartContainer: {
			flexDirection: "row",
			alignItems: "flex-end",
			gap: 6,
		},
		chartCol: {
			flex: 1,
			alignItems: "center",
			gap: 4,
		},
		chartValue: {
			fontSize: 11,
			fontWeight: "700",
		},
		chartBarTrack: {
			width: "100%",
			height: 90,
			borderRadius: 6,
			overflow: "hidden",
			justifyContent: "flex-end",
		},
		chartBarFill: {
			width: "100%",
			borderRadius: 6,
		},
		chartLabel: {
			fontSize: 10,
			opacity: 0.7,
		},
	})
}
