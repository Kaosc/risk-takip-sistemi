import { useCallback, useMemo, useRef, useState } from "react"
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native"
import { useSelector } from "react-redux"
import { useNavigation, NavigationProp, useFocusEffect } from "@react-navigation/native"
import { useTranslation } from "react-i18next"
import BottomSheet from "@gorhom/bottom-sheet"

import ThemedText from "../components/ui/ThemedText"
import ThemedIcon from "../components/ui/ThemedIcon"
import ThemedActivityIndicator from "../components/ui/ThemedActivityIndicator"
import ThemedBottomSheet from "../components/ui/ThemedBottomSheet"
import CustomHeader from "../components/CustomHeader"
import RiskCard from "../components/RiskCard"

import { getAllRisks, getRisksAssignedToStaff, getRisksByUserId } from "../lib/firebase/firestore/risks"
import { Theme } from "../utils/theme"
import { BOTTOM_TAB_HEIGHT, typeIconMap } from "../lib/constants"

const statusOptions: RiskStatus[] = ["new", "inprogress", "pending", "completed"]
const severityOptions: RiskSeverity[] = ["low", "medium", "high", "critical"]
const typeOptions: RiskType[] = ["risk", "accident", "nearmiss"]

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
	const [statusFilter, setStatusFilter] = useState<RiskStatus | null>()
	const [severityFilter, setSeverityFilter] = useState<RiskSeverity | null>(null)
	const [typeFilter, setTypeFilter] = useState<RiskType | null>(null)
	const [activeFilter, setActiveFilter] = useState<"severity" | "type" | "status" | null>(null)
	const sheetRef = useRef<BottomSheet | null>(null)

	const filteredRisks = useMemo(() => {
		return risks.filter(
			(risk) =>
				(!statusFilter || risk.status === statusFilter) &&
				(!severityFilter || risk.severity === severityFilter) &&
				(!typeFilter || risk.type === typeFilter),
		)
	}, [risks, statusFilter, severityFilter, typeFilter])

	useFocusEffect(
		useCallback(() => {
			if (route.params?.status) {
				setStatusFilter(route.params.status)
			}

			return () => navigation.setParams({ status: undefined })
		}, [route.params?.status, navigation]),
	)

	useFocusEffect(
		useCallback(() => {
			fetchRisks()
		}, []),
	)

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

	const onRefresh = async () => {
		await fetchRisks()
	}

	const renderItem = useCallback(({ item }: { item: Risk }) => {
		return <RiskCard item={item} />
	}, [])

	const keyExtractor = useCallback((item: Risk) => item.id, [])

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ThemedActivityIndicator size="large" />
			</View>
		)
	}

	const openSheet = (filter: "severity" | "type" | "status") => {
		setActiveFilter(filter)
		sheetRef.current?.expand()
	}

	const handleSelectSeverity = (severity: RiskSeverity) => {
		setSeverityFilter(severity)
		sheetRef.current?.close()
	}

	const handleSelectType = (type: RiskType) => {
		setTypeFilter(type)
		sheetRef.current?.close()
	}

	const handleSelectStatus = (status: RiskStatus) => {
		setStatusFilter(status)
		sheetRef.current?.close()
	}

	const clearFilters = () => {
		setSeverityFilter(null)
		setTypeFilter(null)
		setStatusFilter(null)
	}

	const sheetItems =
		activeFilter === "severity"
			? severityOptions.map((option) => ({
					text: t(option),
					onPress: () => handleSelectSeverity(option),
				}))
			: activeFilter === "type"
				? typeOptions.map((option) => ({
						text: t(option),
						icon: typeIconMap[option],
						onPress: () => handleSelectType(option),
					}))
				: activeFilter === "status"
					? statusOptions.map((option) => ({
							text: t(option),
							onPress: () => handleSelectStatus(option),
						}))
					: []

	const FilterButtons = () => {
		const hasActiveFilter = Boolean(severityFilter || typeFilter || statusFilter)
		const activeColor = darkMode ? "#000000" : "#ffffff"

		return (
			<View>
				<View style={styles.filterRow}>
					<TouchableOpacity
						style={[styles.filterButton, severityFilter && styles.filterButtonActive]}
						activeOpacity={0.7}
						onPress={() => openSheet("severity")}
					>
						<ThemedIcon
							name="alert-circle-outline"
							size={16}
							color={severityFilter ? activeColor : undefined}
						/>
						<ThemedText style={[styles.filterButtonText, severityFilter && styles.filterButtonTextActive]}>
							{severityFilter ? t(severityFilter) : "Derece"}
						</ThemedText>
					</TouchableOpacity>

					<TouchableOpacity
						style={[styles.filterButton, typeFilter && styles.filterButtonActive]}
						activeOpacity={0.7}
						onPress={() => openSheet("type")}
					>
						<ThemedIcon
							name="shield-alert-outline"
							size={16}
							color={typeFilter ? activeColor : undefined}
						/>
						<ThemedText style={[styles.filterButtonText, typeFilter && styles.filterButtonTextActive]}>
							{typeFilter ? t(typeFilter) : t("type")}
						</ThemedText>
					</TouchableOpacity>

					<TouchableOpacity
						style={[styles.filterButton, typeFilter && styles.filterButtonActive]}
						activeOpacity={0.7}
						onPress={() => openSheet("status")}
					>
						<ThemedIcon
							name="information-outline"
							size={16}
							color={typeFilter ? activeColor : undefined}
						/>
						<ThemedText style={[styles.filterButtonText, typeFilter && styles.filterButtonTextActive]}>
							{typeFilter ? t(typeFilter) : "Durum"}
						</ThemedText>
					</TouchableOpacity>
				</View>

				{hasActiveFilter && (
					<TouchableOpacity
						style={styles.clearButton}
						activeOpacity={0.7}
						onPress={clearFilters}
					>
						<ThemedIcon
							name="close-circle-outline"
							size={16}
							color={activeColor}
						/>
						<ThemedText style={[styles.filterButtonText, styles.filterButtonTextActive]}>Filtreleri Temizle</ThemedText>
					</TouchableOpacity>
				)}
			</View>
		)
	}

	return (
		<View style={styles.container}>
			<CustomHeader
				title={role === "ADMIN" ? "Riskler" : "Risklerim"}
				rightComponent={
					<TouchableOpacity onPress={() => navigation.navigate("SearchScreen")}>
						<ThemedIcon
							name="magnify"
							size={24}
						/>
					</TouchableOpacity>
				}
			/>
			<FlatList
				data={filteredRisks}
				keyExtractor={keyExtractor}
				renderItem={renderItem}
				style={styles.list}
				contentContainerStyle={styles.listContent}
				ListHeaderComponent={<FilterButtons />}
				refreshing={loading}
				onRefresh={onRefresh}
				showsVerticalScrollIndicator={false}
				ListEmptyComponent={
					<View style={styles.emptyContainer}>
						<ThemedIcon
							name="alert-circle-outline"
							size={50}
							style={{ opacity: 0.6 }}
						/>
						<ThemedText style={styles.emptyText}>Kayıt bulunamadı.</ThemedText>
					</View>
				}
			/>

			<ThemedBottomSheet
				ref={sheetRef}
				snapPoints={["40%"]}
				items={sheetItems}
			/>
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
		list: {
			flex: 1,
		},
		loadingContainer: {
			flex: 1,
			alignItems: "center",
			justifyContent: "center",
			backgroundColor: theme.background,
		},
		listContent: {
			gap: 12,
			flexGrow: 1,
			paddingBottom: 20,
		},
		filterRow: {
			flexDirection: "row",
			gap: 10,
			marginHorizontal: 12,
			marginTop: 12,
		},
		filterButton: {
			flex: 1,
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			gap: 8,
			paddingVertical: 10,
			borderRadius: 12,
			borderWidth: 1,
			borderColor: theme.border,
			backgroundColor: theme.cardBackground,
		},
		filterButtonActive: {
			backgroundColor: theme.text,
			borderColor: theme.text,
		},
		filterButtonText: {
			fontSize: 14,
			fontWeight: "700",
		},
		filterButtonTextActive: {
			color: darkMode ? "#000000" : "#ffffff",
		},
		clearButton: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			gap: 8,
			marginTop: 10,
			marginHorizontal: 12,
			paddingVertical: 10,
			borderRadius: 12,
			backgroundColor: theme.text,
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
