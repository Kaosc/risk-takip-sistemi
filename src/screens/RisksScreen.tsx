import { useCallback, useMemo, useRef, useState } from "react"
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native"
import { useSelector } from "react-redux"
import { useNavigation, NavigationProp, useFocusEffect } from "@react-navigation/native"
import { useTranslation } from "react-i18next"
import { Image } from "expo-image"
import BottomSheet from "@gorhom/bottom-sheet"

import ThemedText from "../components/ui/ThemedText"
import ThemedIcon from "../components/ui/ThemedIcon"
import ThemedActivityIndicator from "../components/ui/ThemedActivityIndicator"
import ThemedBottomSheet from "../components/ui/ThemedBottomSheet"
import CustomHeader from "../components/CustomHeader"

import { getAllRisks, getRisksAssignedToStaff, getRisksByUserId } from "../lib/firebase/firestore/risks"
import { Theme } from "../utils/theme"
import { AllIconNames } from "../types/icon"
import { BOTTOM_TAB_HEIGHT } from "../lib/constants"

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
	const [activeFilter, setActiveFilter] = useState<"severity" | "type" | null>(null)
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

	const theme = Theme[darkMode ? "dark" : "light"]

	const severityBadgeColor: Record<RiskSeverity, string> = {
		low: theme.primary.fg,
		medium: theme.green.fg,
		high: theme.orange.fg,
		critical: theme.red.fg,
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

	const typeIconMap: Record<RiskType, AllIconNames> = {
		risk: "shield-alert-outline",
		accident: "ambulance",
		nearmiss: "alert-circle-outline",
	}

	const openSheet = (filter: "severity" | "type") => {
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
				: []

	const renderItem = ({ item }: { item: Risk }) => (
		<TouchableOpacity
			style={styles.card}
			activeOpacity={0.7}
			onPress={() => navigation.navigate("RiskDetailsScreen", { risk: item })}
		>
			{item.images?.[0] ? (
				<View>
					<Image
						source={{ uri: item.images[0] }}
						style={styles.cardImage}
						contentFit="cover"
						transition={200}
					/>
					{item.images.length > 1 && (
						<View style={styles.imageCountBadge}>
							<ThemedIcon
								name="image-multiple-outline"
								size={12}
								color="#ffffff"
							/>
							<ThemedText style={styles.imageCountText}>{item.images.length}</ThemedText>
						</View>
					)}
				</View>
			) : (
				<View style={[styles.cardImage, styles.cardImagePlaceholder]}>
					<ThemedIcon
						name={typeIconMap[item.type]}
						size={38}
					/>
					<ThemedText style={styles.noImageLabel}>{t(item.type)}</ThemedText>
				</View>
			)}

			<View style={styles.cardBody}>
				<View style={styles.headerRow}>
					<View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 10, minWidth: 0 }}>
						<View style={styles.typeBadge}>
							<ThemedIcon
								name={typeIconMap[item.type]}
								size={14}
							/>
							<ThemedText style={styles.badgeLabel}>{t(item.type)}</ThemedText>
						</View>
						<View style={styles.severityRow}>
							<ThemedIcon
								name="alert-circle-outline"
								size={15}
								color={severityBadgeColor[item.severity]}
							/>
							<ThemedText style={[styles.severityText, { color: severityBadgeColor[item.severity] }]}>
								{t(item.severity)}
							</ThemedText>
						</View>
					</View>

					<View style={[styles.statusBadge, { backgroundColor: statusBadgeColor[item.status].bg }]}>
						<View style={[styles.statusDot, { backgroundColor: statusBadgeColor[item.status].txt }]} />
						<ThemedText style={[styles.statusBadgeText, { color: statusBadgeColor[item.status].txt }]}>
							{t(item.status)}
						</ThemedText>
					</View>
				</View>

				<ThemedText
					style={styles.description}
					numberOfLines={2}
					ellipsizeMode="tail"
				>
					{item.description}
				</ThemedText>

				<View style={styles.metaRow}>
					<View style={styles.metaCell}>
						<ThemedIcon
							name="tag-outline"
							size={15}
						/>
						<ThemedText
							style={styles.metaText}
							numberOfLines={1}
						>
							{t(item.category)}
						</ThemedText>
					</View>
					<View style={styles.metaCell}>
						<ThemedIcon
							name="map-marker-outline"
							size={15}
						/>
						<ThemedText
							style={styles.metaText}
							numberOfLines={1}
						>
							{t(item.location)}
						</ThemedText>
					</View>
				</View>

				<ThemedText
					style={{
						fontSize: 12,
						fontWeight: "600",
						opacity: 0.5,
						textAlign: "right",
					}}
				>
					{item.id}
				</ThemedText>
			</View>
		</TouchableOpacity>
	)

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
							{severityFilter ? t(severityFilter) : t("severity")}
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
			<CustomHeader title={role === "ADMIN" ? "Riskler" : "Risklerim"} />
			<FlatList
				data={filteredRisks}
				keyExtractor={(item) => item.id}
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
		card: {
			borderRadius: 16,
			overflow: "hidden",
			marginHorizontal: 12,
			backgroundColor: theme.cardBackground,
			borderWidth: 1,
			borderColor: theme.border,
		},
		cardImage: {
			width: "100%",
			height: 150,
			backgroundColor: darkMode ? "#1c1c1c" : "#e8e8e8",
		},
		cardImagePlaceholder: {
			alignItems: "center",
			justifyContent: "center",
			gap: 8,
		},
		imageCountBadge: {
			position: "absolute",
			right: 10,
			bottom: 10,
			flexDirection: "row",
			alignItems: "center",
			gap: 4,
			paddingHorizontal: 9,
			paddingVertical: 4,
			borderRadius: 99,
			backgroundColor: "rgba(0,0,0,0.65)",
		},
		imageCountText: {
			fontSize: 12,
			fontWeight: "700",
			color: "#ffffff",
		},
		noImageLabel: {
			fontSize: 13,
			fontWeight: "600",
			opacity: 0.5,
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
		cardBody: {
			padding: 14,
			gap: 10,
		},
		headerRow: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			gap: 8,
		},
		typeBadge: {
			flexDirection: "row",
			alignItems: "center",
			gap: 6,
			paddingHorizontal: 10,
			paddingVertical: 5,
			borderRadius: 99,
			borderWidth: 1,
			borderColor: theme.border,
			backgroundColor: darkMode ? "#1e1e1e" : "#ffffff",
		},
		statusBadge: {
			flexDirection: "row",
			alignItems: "center",
			gap: 6,
			paddingHorizontal: 10,
			paddingVertical: 5,
			borderRadius: 99,
		},
		statusDot: {
			width: 7,
			height: 7,
			borderRadius: 99,
		},
		statusBadgeText: {
			fontSize: 12,
			fontWeight: "700",
		},
		description: {
			fontSize: 15,
			lineHeight: 19,
			opacity: 0.75,
			marginVertical: 5,
		},
		metaRow: {
			flex: 1,
			flexDirection: "row",
			alignItems: "center",
			gap: 10,
		},
		metaCell: {
			flexDirection: "row",
			alignItems: "center",
			gap: 6,
			minWidth: 0,
		},
		metaText: {
			fontSize: 13,
		},
		severityRow: {
			flexDirection: "row",
			alignItems: "center",
			gap: 6,
		},
		severityText: {
			fontSize: 13,
			fontWeight: "700",
		},
		badgeLabel: {
			fontSize: 12,
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
