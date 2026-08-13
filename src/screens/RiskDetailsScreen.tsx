import { useEffect, useRef, useState } from "react"
import { Alert, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native"
import { useSelector } from "react-redux"
import { useRoute } from "@react-navigation/native"
import { Image } from "expo-image"
import * as ImagePicker from "expo-image-picker"
import BottomSheet from "@gorhom/bottom-sheet"
import DateTimePicker from "@react-native-community/datetimepicker"

import ThemedText from "../components/ui/ThemedText"
import ThemedButton from "../components/ui/ThemedButton"
import ThemedIcon from "../components/ui/ThemedIcon"
import GradientCard from "../components/ui/GradientCard"
import ThemedBottomSheet from "../components/ui/ThemedBottomSheet"
import CustomHeader from "../components/CustomHeader"

import { safeTimestampToDateString } from "../utils/date"
import { AllIconNames } from "../types/icon"
import { Theme } from "../utils/theme"
import { getStaffs } from "../lib/firebase/firestore/users"
import { assignRiskToStaff, deleteRisk, updateRisk, updateStatus } from "../lib/firebase/firestore/risks"
import { uploadImages } from "../lib/firebase/storage"
import ThemedActivityIndicator from "../components/ui/ThemedActivityIndicator"

const fallbackRisk: Risk = {
	id: "",
	type: "Risk",
	category: "-",
	location: "-",
	description: "",
	severity: "Medium",
	images: [],
	createdBy: "",
	createdAt: undefined,
	updatedAt: undefined,
	status: "new",
} as unknown as Risk

type SelectFieldProps = {
	label: string
	value?: string
	placeholder?: string
	onPress: () => void
}

function SelectField({ label, value, placeholder, onPress }: SelectFieldProps) {
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const styles = createStyles(darkMode)

	return (
		<View style={styles.fieldContainer}>
			<ThemedText style={styles.fieldLabel}>{label}</ThemedText>
			<TouchableOpacity
				style={styles.selectField}
				onPress={onPress}
				activeOpacity={0.7}
			>
				<ThemedText
					style={[styles.selectValue, !value && styles.selectPlaceholder]}
					numberOfLines={1}
				>
					{value || placeholder || "Seçiniz"}
				</ThemedText>
				<ThemedIcon
					name="chevron-down"
					size={22}
				/>
			</TouchableOpacity>
		</View>
	)
}

function DetailRow({ icon, label, value }: { icon: AllIconNames; label: string; value?: string }) {
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const styles = createStyles(darkMode)

	return (
		<View style={styles.detailRow}>
			<ThemedIcon
				name={icon}
				size={18}
			/>
			<ThemedText style={styles.detailLabel}>{label}</ThemedText>
			<ThemedText style={styles.detailValue}>{value || "-"}</ThemedText>
		</View>
	)
}

function ThumbnailsRow({ images, onRemove }: { images: string[]; onRemove?: (index: number) => void }) {
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const styles = createStyles(darkMode)

	if (images.length === 0) return null

	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			style={styles.imageList}
		>
			{images.map((uri, index) => (
				<View
					key={`${index}-${uri}`}
					style={styles.thumbWrap}
				>
					<Image
						source={{ uri }}
						style={styles.thumbnail}
						contentFit="cover"
					/>
					{onRemove && (
						<TouchableOpacity
							style={styles.thumbRemove}
							onPress={() => onRemove(index)}
							activeOpacity={0.8}
						>
							<ThemedIcon
								name="close"
								size={14}
							/>
						</TouchableOpacity>
					)}
				</View>
			))}
		</ScrollView>
	)
}
export default function RiskDetailsScreen() {
	const route = useRoute() as any
	const riskParam = route.params?.risk as Risk | undefined
	const { role } = useSelector((state: RootState) => state.auth)

	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const styles = createStyles(darkMode)

	const [risk, setRisk] = useState<Risk>(riskParam ?? fallbackRisk)
	const [assignedStaff, setAssignedStaff] = useState("")
	const [taskDescription, setTaskDescription] = useState("")
	const [dueDate, setDueDate] = useState<Date | null>(null)
	const [showDatePicker, setShowDatePicker] = useState(false)
	const [isAssigning, setIsAssigning] = useState(false)
	const [completionNotes, setCompletionNotes] = useState("")
	const [afterImages, setAfterImages] = useState<string[]>([])
	const [pickerError, setPickerError] = useState("")
	const [isPicking, setIsPicking] = useState(false)
	const [sheetItems, setSheetItems] = useState<{ text: string; icon: AllIconNames; onPress: () => void }[]>([])
	const [loading, setLoading] = useState(false)

	const sheetRef = useRef<BottomSheet | null>(null)

	const setStatus = (status: RiskStatus) => setRisk((prev) => ({ ...prev, status }))

	const fetchStaffs = async () => {
		if (role === "ADMIN") {
			const fetchedStaffs = await getStaffs()
			if (fetchedStaffs.length > 0) {
				setSheetItems(
					fetchedStaffs.map((staff) => ({
						text: staff.name,
						icon: "account-check-outline" as AllIconNames,
						onPress: () => {
							setAssignedStaff(staff.name)
							sheetRef.current?.close()
						},
					})),
				)
			} else {
				toast.show("kayıtlı personel bulunamadı.", { type: "warning" })
			}
		}
	}

	useEffect(() => {
		fetchStaffs()
	}, [role])

	//////////////////////////// ADMIN ////////////////////////////

	const handleAssign = async () => {
		if (!assignedStaff) {
			Alert.alert("Uyarı", "Lütfen görev atanacak personeli seçin.")
			return
		}
		if (!taskDescription.trim()) {
			Alert.alert("Uyarı", "Lütfen görev açıklaması girin.")
			return
		}

		setIsAssigning(true)
		try {
			// 1) Önce riski personele ata (görev açıklaması + bitiş tarihi ile)
			const assignResult = await assignRiskToStaff(risk.id, taskDescription.trim(), dueDate, assignedStaff)

			if (!assignResult.success) {
				Alert.alert("Hata", "Görev atanamadı. Lütfen tekrar deneyin.")
				return
			}

			// 2) Atama başarılıysa riskin durumunu "pending" yap
			const statusResult = await updateStatus(risk.id, "pending")

			if (!statusResult.success) {
				Alert.alert("Hata", "Görev atandı fakat durum güncellenemedi. Durumu manuel kontrol edin.")
				return
			}

			// 3) Yerel state'i de güncelle
			setRisk((prev) => ({
				...prev,
				assignedTo: assignedStaff,
				taskDescription: taskDescription.trim(),
				dueDate: (dueDate ?? undefined) as FirebaseTimestamp | undefined,
				status: "pending",
			}))

			Alert.alert("Başarılı", "Görev atandı ve risk takibe alındı.")
		} catch (e: any) {
			Alert.alert("Hata", e?.message || "Beklenmeyen bir hata oluştu.")
		} finally {
			setIsAssigning(false)
		}
	}

	const handleClose = async () => {
		await updateStatus(risk.id, "closed")
		setStatus("closed")
	}

	//////////////////////////// STAFF ////////////////////////////

	const addAfterImages = (uris: string[]) => setAfterImages((prev) => [...prev, ...uris])

	const takeAfterPhoto = async () => {
		const permission = await ImagePicker.requestCameraPermissionsAsync()
		if (!permission.granted) {
			setPickerError("Kamera izni verilmedi. Ayarlardan izin verin.")
			return
		}
		setPickerError("")
		setIsPicking(true)
		try {
			const result = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.7 })
			if (!result.canceled && result.assets && result.assets.length > 0) {
				addAfterImages(result.assets.map((a) => a.uri))
			}
		} catch (e: any) {
			setPickerError(e?.message || "Fotoğraf çekilirken bir hata oluştu.")
		} finally {
			setIsPicking(false)
		}
	}

	const pickAfterGallery = async () => {
		const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
		if (!permission.granted) {
			setPickerError("Galeri izni verilmedi. Ayarlardan izin verin.")
			return
		}
		setPickerError("")
		setIsPicking(true)
		try {
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ["images"],
				allowsMultipleSelection: true,
				quality: 0.7,
			})
			if (!result.canceled && result.assets && result.assets.length > 0) {
				addAfterImages(result.assets.map((a) => a.uri))
			}
		} catch (e: any) {
			setPickerError(e?.message || "Görsel seçilirken bir hata oluştu.")
		} finally {
			setIsPicking(false)
		}
	}

	const handleCompleteTask = async () => {
		if (!completionNotes.trim()) {
			Alert.alert("Uyarı", "Lütfen tamamlanma notunu girin.")
			return
		}

		setLoading(true)

		try {
			const res = await updateRisk(risk.id, {
				status: "completed",
				completionNotes,
				afterImages,
			})

			// TODO: If the image load fails than what?
			if (afterImages.length > 0) {
				const uploadResult = await uploadImages(afterImages, `risks/${risk.id}`)

				if (!uploadResult.success || !uploadResult.urls) {
					Alert.alert("Kayıt Gönderilmedi", "Görseller yüklenemedi. Lütfen tekrar deneyin.")
					return
				}

				await updateRisk(risk.id, { afterImages: uploadResult.urls })
			}

			if (!res.success) {
				Alert.alert("Kayıt Gönderilmedi", "Risk kaydı oluşturulamadı. Lütfen tekrar deneyin.")
				return
			}

			setRisk((prev) => ({
				...prev,
				status: "completed",
				completionNotes,
				afterImages,
			}))
		} finally {
			setLoading(false)
		}
	}
	//////////////////////////// ROLE SECTION ////////////////////////////

	const renderRoleSection = () => {
		if (role === "ADMIN") {
			if (risk.status === "new") {
				return (
					<GradientCard style={styles.card}>
						<ThemedText style={styles.sectionTitle}>Görev Atama</ThemedText>
						<ThemedText style={styles.sectionHint}>Bu bildirimi değerlendirip bir personele görev atayın.</ThemedText>

						<SelectField
							label="Personel"
							value={assignedStaff}
							placeholder="Personel seçin"
							onPress={() => sheetRef.current?.expand()}
						/>

						<ThemedText style={styles.fieldLabel}>Görev Açıklaması</ThemedText>
						<TextInput
							style={styles.input}
							placeholder="Yapılacak işi kısaca açıklayın..."
							placeholderTextColor="#888"
							value={taskDescription}
							onChangeText={setTaskDescription}
						/>

						<ThemedText style={styles.fieldLabel}>Bitiş Tarihi (Termin)</ThemedText>
						<TouchableOpacity
							style={styles.selectField}
							onPress={() => setShowDatePicker(true)}
							activeOpacity={0.7}
						>
							<ThemedText
								style={[styles.selectValue, !dueDate && styles.selectPlaceholder]}
								numberOfLines={1}
							>
								{dueDate ? dueDate.toLocaleDateString("tr-TR") : "Tarih seçin"}
							</ThemedText>
							<ThemedIcon
								name="calendar-outline"
								size={22}
							/>
						</TouchableOpacity>

						{showDatePicker && (
							<DateTimePicker
								value={dueDate ?? new Date()}
								mode="date"
								display="default"
								minimumDate={new Date()}
								onChange={(event, selectedDate) => {
									if (Platform.OS === "android") setShowDatePicker(false)
									if (selectedDate) setDueDate(selectedDate)
								}}
							/>
						)}

						<ThemedButton
							text="Assign Task"
							icon="account-check-outline"
							onPress={handleAssign}
							disabled={isAssigning}
						/>
					</GradientCard>
				)
			}

			if (risk.status === "pending") {
				return (
					<GradientCard style={styles.card}>
						<ThemedText style={styles.sectionTitle}>Doğrulama</ThemedText>

						<ThemedText style={styles.fieldLabel}>Personelin Yüklediği Görseller</ThemedText>
						<ThumbnailsRow images={risk.afterImages || []} />

						<ThemedText style={styles.fieldLabel}>Tamamlanma Notu</ThemedText>
						<ThemedText style={styles.description}>{risk.completionNotes || "-"}</ThemedText>

						<ThemedButton
							text="Approve & Close"
							icon="check"
							onPress={() => setStatus("closed")}
						/>
						<ThemedButton
							text="Reject"
							icon="close"
							onPress={() => setStatus("new")}
							style={styles.secondaryButton}
						/>
					</GradientCard>
				)
			}

			// TODO: Add rejection button that will clear the assigned note and afterImages and re assign the task to the staff. This will be used when the admin rejects the task and wants to re assign it to the staff.
			if (risk.status === "completed") {
				return (
					<GradientCard style={styles.card}>
						<ThemedText style={styles.sectionTitle}>Doğrulama</ThemedText>
						<ThemedText style={styles.fieldLabel}>Personelin Yüklediği Görseller</ThemedText>
						<ThumbnailsRow images={risk.afterImages || []} />
						<ThemedText style={styles.fieldLabel}>Tamamlanma Notu</ThemedText>
						<ThemedText style={styles.description}>{risk.completionNotes || "-"}</ThemedText>

						<ThemedButton
							text="Approve & Close"
							icon="check"
							onPress={handleClose}
						/>
					</GradientCard>
				)
			}

			return null
		}

		if (role === "STAFF") {
			if (loading) {
				return <ThemedActivityIndicator />
			}

			if (risk.status === "pending") {
				return (
					<GradientCard style={styles.card}>
						<ThemedText style={styles.sectionTitle}>Görevi Tamamla</ThemedText>

						<ThemedText style={styles.fieldLabel}>Sonrası Görselleri</ThemedText>
						<View style={styles.imageButtonsRow}>
							<ThemedButton
								text="Kamera"
								icon="camera"
								iconSize={20}
								onPress={takeAfterPhoto}
								disabled={isPicking}
								style={styles.imageButton}
							/>
							<ThemedButton
								text="Galeri"
								icon="image-multiple-outline"
								iconSize={20}
								onPress={pickAfterGallery}
								disabled={isPicking}
								style={styles.imageButton}
							/>
						</View>

						{pickerError ? <ThemedText style={styles.errorText}>{pickerError}</ThemedText> : null}

						<ThumbnailsRow
							images={afterImages}
							onRemove={(index) => setAfterImages((prev) => prev.filter((_, i) => i !== index))}
						/>

						<ThemedText style={styles.fieldLabel}>Tamamlanma Notu</ThemedText>
						<TextInput
							style={styles.textArea}
							placeholder="Yapılan işlemleri açıklayın..."
							placeholderTextColor="#888"
							multiline
							numberOfLines={4}
							textAlignVertical="top"
							value={completionNotes}
							onChangeText={setCompletionNotes}
						/>

						<ThemedButton
							text="Complete Task"
							icon="check"
							onPress={handleCompleteTask}
						/>
					</GradientCard>
				)
			}

			return null
		}

		return (
			<GradientCard style={styles.card}>
				<ThemedText style={styles.sectionTitle}>Takip</ThemedText>
				<ThemedText style={styles.description}>Bu bildirimin güncel durumunu buradan takip edebilirsiniz.</ThemedText>
			</GradientCard>
		)
	}

	//////////////////////////// RENDER ////////////////////////////

	return (
		<View style={styles.container}>
			<CustomHeader title="Risk Detayı" />

			<ScrollView
				style={styles.scroll}
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
			>
				{/* ===== TOP: IMAGES ===== */}
				{risk.images.length > 0 && (
					<View style={styles.section}>
						<ThemedText style={styles.sectionTitle}>Görseller</ThemedText>
						<ThumbnailsRow images={risk.images} />
					</View>
				)}

				{/* ===== TOP: BASIC DETAILS ===== */}
				<GradientCard style={styles.card}>
					<View style={styles.headerRow}>
						<ThemedIcon
							name="clipboard-text-outline"
							size={24}
						/>
						<ThemedText style={styles.title}>{risk.type}</ThemedText>
					</View>

					<DetailRow
						icon="tag-outline"
						label="Kategori"
						value={risk.category}
					/>
					<DetailRow
						icon="map-marker-outline"
						label="Konum"
						value={risk.location}
					/>
					<DetailRow
						icon="shield-alert-outline"
						label="Önem"
						value={risk.severity}
					/>
					<DetailRow
						icon="progress-clock"
						label="Durum"
						value={risk.status}
					/>
					<DetailRow
						icon="calendar-outline"
						label="Oluşturulma"
						value={safeTimestampToDateString(risk.createdAt)}
					/>

					<ThemedText style={styles.fieldLabel}>Açıklama</ThemedText>
					<ThemedText style={styles.description}>{risk.description || "-"}</ThemedText>
				</GradientCard>

				{/* ===== BOTTOM: ROLE-BASED ACTIONS ===== */}
				{renderRoleSection()}
			</ScrollView>

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
		scroll: {
			flex: 1,
		},
		content: {
			padding: 16,
			paddingTop: 20,
			paddingBottom: 32,
			gap: 14,
		},
		card: {
			borderRadius: 16,
			padding: 16,
			gap: 10,
		},
		headerRow: {
			flexDirection: "row",
			alignItems: "center",
			gap: 10,
			marginBottom: 4,
		},
		title: {
			fontSize: 20,
			fontWeight: "800",
			flex: 1,
		},
		detailRow: {
			flexDirection: "row",
			alignItems: "center",
			gap: 8,
		},
		detailLabel: {
			fontSize: 14,
			opacity: 0.6,
			width: 90,
		},
		detailValue: {
			fontSize: 14,
			fontWeight: "600",
			flex: 1,
		},
		description: {
			fontSize: 14,
			lineHeight: 20,
			opacity: 0.9,
		},
		section: {
			gap: 8,
		},
		sectionTitle: {
			fontSize: 17,
			fontWeight: "700",
		},
		sectionHint: {
			fontSize: 13,
			opacity: 0.7,
		},
		fieldContainer: {
			width: "100%",
			gap: 6,
		},
		fieldLabel: {
			fontSize: 13,
			fontWeight: "600",
			opacity: 0.8,
		},
		selectField: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			borderWidth: 1,
			borderColor: theme.border,
			borderRadius: 12,
			paddingHorizontal: 14,
			paddingVertical: 12,
			backgroundColor: darkMode ? "#000" : "#fff",
		},
		selectValue: {
			fontSize: 16,
			flex: 1,
		},
		selectPlaceholder: {
			opacity: 0.5,
		},
		input: {
			borderWidth: 1,
			borderColor: theme.border,
			borderRadius: 12,
			paddingHorizontal: 14,
			paddingVertical: 12,
			fontSize: 16,
			color: darkMode ? "#fff" : "#000",
			backgroundColor: darkMode ? "#000" : "#fff",
		},
		imageButtonsRow: {
			flexDirection: "row",
			gap: 12,
		},
		imageButton: {
			flex: 1,
			paddingVertical: 12,
			paddingHorizontal: 10,
		},
		imageList: {
			flexDirection: "row",
			paddingVertical: 4,
		},
		thumbWrap: {
			marginRight: 12,
		},
		thumbnail: {
			width: 96,
			height: 96,
			borderRadius: 12,
			backgroundColor: darkMode ? "#2a2a2a" : "#e2e2e2",
		},
		thumbRemove: {
			position: "absolute",
			top: -6,
			right: -6,
			width: 24,
			height: 24,
			borderRadius: 12,
			alignItems: "center",
			justifyContent: "center",
			backgroundColor: theme.red.foreground,
			borderWidth: 2,
			borderColor: darkMode ? "#000" : "#fff",
		},
		textArea: {
			borderWidth: 1,
			borderColor: theme.border,
			borderRadius: 12,
			paddingHorizontal: 14,
			paddingVertical: 12,
			fontSize: 16,
			minHeight: 100,
			color: darkMode ? "#fff" : "#000",
			backgroundColor: darkMode ? "#000" : "#fff",
		},
		errorText: {
			fontSize: 12,
			color: theme.red.foreground,
		},
		secondaryButton: {
			backgroundColor: darkMode ? "#1c1c1c" : "#f2f2f2",
		},
	})
}
