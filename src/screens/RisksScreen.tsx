import { useEffect, useState } from "react"
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native"
import { useSelector } from "react-redux"

import ThemedText from "../components/ui/ThemedText"
import ThemedIcon from "../components/ui/ThemedIcon"
import ThemedActivityIndicator from "../components/ui/ThemedActivityIndicator"
import GradientCard from "../components/ui/GradientCard"
import CustomHeader from "../components/CustomHeader"

import { getAllRisks } from "../lib/firebase/firestore/risks"
import { Theme } from "../utils/theme"

export default function RisksScreen() {
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const styles = createStyles(darkMode)

	const [risks, setRisks] = useState<Risk[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		fetchRisks()
	}, [])

	const fetchRisks = async () => {
		setLoading(true)
		const data = await getAllRisks()
		setRisks(data)
		setLoading(false)
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
			onPress={() => console.log("Navigating to details for:", item.id)}
		>
			<GradientCard style={styles.card}>
				<View style={styles.cardHeader}>
					<ThemedIcon
						name="clipboard-text-outline"
						size={22}
					/>
					<ThemedText style={styles.cardType}>{item.type}</ThemedText>
				</View>

				<View style={styles.metaRow}>
					<ThemedIcon
						name="tag-outline"
						size={18}
					/>
					<ThemedText style={styles.metaText}>{item.category}</ThemedText>
				</View>

				<View style={styles.metaRow}>
					<ThemedIcon
						name="map-marker-outline"
						size={18}
					/>
					<ThemedText style={styles.metaText}>{item.location}</ThemedText>
				</View>

				<View style={styles.badgeRow}>
					<View style={styles.badge}>
						<ThemedText style={styles.badgeText}>Önem: {item.severity}</ThemedText>
					</View>
					<View style={styles.badge}>
						<ThemedText style={styles.badgeText}>Durum: {item.status}</ThemedText>
					</View>
				</View>
			</GradientCard>
		</TouchableOpacity>
	)

	return (
		<View style={styles.container}>
			<CustomHeader title="Riskler" />
			<FlatList
				data={risks}
				keyExtractor={(item) => item.id}
				renderItem={renderItem}
				contentContainerStyle={styles.listContent}
				showsVerticalScrollIndicator={false}
				ListEmptyComponent={
					<View style={styles.emptyContainer}>
						<ThemedText style={styles.emptyText}>Henüz kayıtlı risk bulunmuyor.</ThemedText>
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
			flex: 1,
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
		},
		cardWrapper: {
			borderRadius: 16,
			overflow: "hidden",
		},
		card: {
			borderRadius: 16,
			padding: 16,
			gap: 8,
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
		badge: {
			paddingHorizontal: 10,
			paddingVertical: 4,
			borderRadius: 99,
			borderWidth: 1,
			borderColor: theme.border,
			backgroundColor: darkMode ? "#1f1f22" : "#ffffff",
		},
		badgeText: {
			fontSize: 12,
			fontWeight: "600",
		},
		emptyContainer: {
			alignItems: "center",
			paddingTop: 60,
		},
		emptyText: {
			fontSize: 15,
			opacity: 0.6,
		},
	})
}
