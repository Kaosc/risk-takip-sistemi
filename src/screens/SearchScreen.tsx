import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import { View, TextInput, TouchableOpacity, StyleSheet, BackHandler, FlatList } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useSelector } from "react-redux"
import Fuse from "fuse.js"

import ThemedIcon from "../components/ui/ThemedIcon"
import ThemedText from "../components/ui/ThemedText"

import { Theme } from "../utils/theme"
import RiskCard from "../components/RiskCard"
import { getAllRisks } from "../lib/firebase/firestore/risks"

export default function SearchScreen() {
	const navigation = useNavigation<any>()
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const route = useRoute<any>()

	const styles = createStyles(darkMode)

	const [members, setMembers] = useState<Risk[]>([])
	const [search, setSearch] = useState(route.params?.search || "")
	const [debouncedQuery, setDebouncedQuery] = useState("")

	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const searchRef = useRef<string | null>(null)

	useEffect(() => {
		const backAction = () => {
			goBack()
			return true
		}
		const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction)
		return () => backHandler.remove()
	}, [])

	const goBack = () => {
		navigation.navigate("RisksScreen")
	}

	const fetchMembers = useCallback(async () => {
		console.debug("[SearchScreen] fetchMembers")
		const fetchedMembers = await getAllRisks()
		setMembers(fetchedMembers)
	}, [])

	useEffect(() => {
		fetchMembers()
	}, [fetchMembers])

	useEffect(() => {
		if (timerRef.current) clearTimeout(timerRef.current)

		timerRef.current = setTimeout(() => setDebouncedQuery(search), 400)

		return () => {
			if (timerRef.current) clearTimeout(timerRef.current)
		}
	}, [search])

	const fuse = useMemo(() => {
		if (members) {
			return new Fuse(members, {
				keys: ["type", "severity", "status", "description", "createdBy", "location", "category"],
				threshold: 0.3,
			})
		} else {
			return new Fuse([], {})
		}
	}, [members])

	const filtered = useMemo(() => {
		if (!debouncedQuery.trim()) return []
		searchRef.current = search
		return fuse.search(debouncedQuery).map((r) => r.item)
	}, [debouncedQuery, fuse])

	const renderItem = useCallback(({ item }: { item: Risk }) => {
		return (
			<View style={{ marginBottom: 5, marginTop: 10 }}>
				<RiskCard item={item} />
			</View>
		)
	}, [])

	const keyExtractor = useCallback((item: Risk) => item.id, [])

	const EmptyComponent = useCallback(() => {
		return (
			<View style={styles.emptyPageContainer}>
				<ThemedIcon
					name={debouncedQuery && filtered.length === 0 ? "magnify-close" : "magnify"}
					size={100}
					style={{ opacity: 0.6 }}
				/>
				<ThemedText style={{ opacity: 0.6 }}>
					{debouncedQuery && filtered.length === 0 ? "Risk Bulunamadı" : "Risk Ara"}
				</ThemedText>
			</View>
		)
	}, [debouncedQuery, darkMode])

	return (
		<View style={styles.container}>
			<FlatList
				data={filtered}
				stickyHeaderIndices={[0]}
				stickyHeaderHiddenOnScroll
				renderItem={renderItem}
				keyExtractor={keyExtractor}
				contentContainerStyle={styles.list}
				ListHeaderComponent={
					<View style={styles.searchContainer}>
						<TouchableOpacity
							onPress={goBack}
							style={styles.backButtonContainer}
						>
							<ThemedIcon
								name="arrow-left"
								size={24}
								style={{ margin: 15 }}
							/>
						</TouchableOpacity>
						<TextInput
							style={styles.input}
							placeholder={"Tür, durum, açıklama, konum..."}
							placeholderTextColor={darkMode ? "#666" : "#999"}
							value={search}
							onChangeText={setSearch}
							autoFocus
							autoCapitalize="none"
						/>
					</View>
				}
				ListEmptyComponent={EmptyComponent}
			/>
		</View>
	)
}

const createStyles = (darkMode: boolean) => {
	const theme = Theme[darkMode ? "dark" : "light"]

	return StyleSheet.create({
		container: {
			flex: 1,
		},
		input: {
			flex: 1,
			paddingHorizontal: 16,
			paddingVertical: 12,
			backgroundColor: theme.cardBackground,
			borderColor: theme.border,
			borderWidth: StyleSheet.hairlineWidth,
			borderRadius: 12,
			fontSize: 15,
			height: 55,
			color: darkMode ? "#fff" : "#000",
		},
		list: {
			flexGrow: 1,
			paddingHorizontal: 5,
			paddingBottom: 15,
		},
		backButtonContainer: {
			justifyContent: "center",
			alignItems: "center",
			borderWidth: StyleSheet.hairlineWidth,
			borderColor: theme.border,
			backgroundColor: theme.cardBackground,
			borderRadius: 12,
		},
		searchContainer: {
			flexDirection: "row",
			alignItems: "center",
			gap: 10,
			marginHorizontal: 10,
			paddingTop: 5,
			paddingBottom: 10,
			backgroundColor: theme.background,
		},
		emptyPageContainer: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
			gap: 15,
		},
	})
}
