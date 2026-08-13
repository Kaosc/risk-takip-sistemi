import { useRef, useState } from "react"
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native"
import { useSelector } from "react-redux"
import { useForm, Controller } from "react-hook-form"
import { Image } from "expo-image"
import * as ImagePicker from "expo-image-picker"
import BottomSheet from "@gorhom/bottom-sheet"
import { useNavigation, NavigationProp } from "@react-navigation/native"

import { Theme } from "../../utils/theme"
import { AllIconNames } from "../../types/icon"

import ThemedText from "../../components/ui/ThemedText"
import ThemedButton from "../../components/ui/ThemedButton"
import ThemedBottomSheet from "../../components/ui/ThemedBottomSheet"
import GradientCard from "../../components/ui/GradientCard"
import ThemedIcon from "../../components/ui/ThemedIcon"
import { addRisk, deleteRisk, updateRisk } from "../../lib/firebase/firestore/risks"
import { uploadImages } from "../../lib/firebase/storage"

// --- TİPLER VE OPSİYONLAR ---

type OptionType = { label: string; value: string }

type SelectFieldName = "type" | "category" | "location" | "severity"

const selectOptions: Record<SelectFieldName, OptionType[]> = {
	type: [
		{ label: "Risk Bildirimi", value: "Risk" },
		{ label: "İş Kazası", value: "Accident" },
		{ label: "Ramak Kala", value: "Near Miss" },
	],
	category: [
		{ label: "Makine/Ekipman", value: "Machinery" },
		{ label: "Elektrik", value: "Electrical" },
		{ label: "Yangın", value: "Fire" },
		{ label: "Kimyasal", value: "Chemical" },
		{ label: "Diğer", value: "Other" },
	],
	location: [
		{ label: "Üretim Alanı", value: "Production" },
		{ label: "Depo", value: "Warehouse" },
		{ label: "A Blok", value: "Block A" },
		{ label: "Dış Alan", value: "Outdoor" },
	],
	severity: [
		{ label: "Düşük", value: "Low" },
		{ label: "Orta", value: "Medium" },
		{ label: "Yüksek", value: "High" },
		{ label: "Kritik", value: "Critical" },
	],
}

// Seçili İngilizce 'value' değerine karşılık gelen Türkçe 'label'ı bulmak için yardımcı
const getDisplayLabel = (field: SelectFieldName, value: string) => {
	const option = selectOptions[field].find((opt) => opt.value === value)
	return option ? option.label : value
}

type SelectFieldProps = {
	label: string
	value?: string
	error?: string
	onPress: () => void
	fieldName: SelectFieldName
}

function SelectField({ label, value, error, onPress, fieldName }: SelectFieldProps) {
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const styles = createStyles(darkMode)

	const displayValue = value ? getDisplayLabel(fieldName, value) : ""

	return (
		<View style={styles.fieldContainer}>
			<ThemedText style={styles.fieldLabel}>{label}</ThemedText>
			<TouchableOpacity
				style={[styles.selectField, error && styles.selectFieldError]}
				onPress={onPress}
				activeOpacity={0.7}
			>
				<ThemedText
					style={[styles.selectValue, !displayValue && styles.selectPlaceholder]}
					numberOfLines={1}
				>
					{displayValue || "Seçiniz"}
				</ThemedText>
				<ThemedIcon
					name="chevron-down"
					size={22}
				/>
			</TouchableOpacity>
			{error ? <Text style={styles.fieldError}>{error}</Text> : null}
		</View>
	)
}

export default function MemberFormScreen() {
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const styles = createStyles(darkMode)
	const navigation = useNavigation() as NavigationProp<any>

	const [activeSelect, setActiveSelect] = useState<SelectFieldName | null>(null)
	const sheetRef = useRef<BottomSheet | null>(null)

	// BİRDEN FAZLA FOTOĞRAF İÇİN ARRAY (DİZİ) KULLANIYORUZ
	const [images, setImages] = useState<string[]>([])
	const [isPicking, setIsPicking] = useState(false)
	const [pickerError, setPickerError] = useState("")
	const [isSubmitting, setIsSubmitting] = useState(false)

	const {
		control,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = useForm<MemberFormData>({
		defaultValues: {
			type: "Risk",
			category: "",
			location: "",
			description: "",
			severity: "Medium",
			accidentDetails: {
				involvedPersons: "",
				injuryStatus: "",
				firstAidProvided: false,
			},
		},
	})

	// Dinamik alanları göstermek için anlık olarak 'type' değerini izliyoruz
	const selectedType = watch("type")

	//////////////////////////// SELECTION ////////////////////////////

	const openSelect = (field: SelectFieldName) => {
		setPickerError("")
		setActiveSelect(field)
		sheetRef.current?.expand()
	}

	const handleSelect = (optionValue: string) => {
		if (!activeSelect) return
		// value olarak İngilizce değeri (opt.value) set ediyoruz
		setValue(activeSelect, optionValue as any, { shouldValidate: true })
		sheetRef.current?.close()
	}

	const sheetItems = activeSelect
		? selectOptions[activeSelect].map((opt) => ({
				text: opt.label, // Ekranda Türkçe göster
				icon: "check" as AllIconNames,
				onPress: () => handleSelect(opt.value), // Tıklanınca İngilizce değeri al
			}))
		: []

	//////////////////////////// IMAGE PICKING ////////////////////////////

	const takePhoto = async () => {
		const permission = await ImagePicker.requestCameraPermissionsAsync()
		if (!permission.granted) {
			setPickerError("Kamera izni verilmedi. Ayarlardan izin verin.")
			return
		}

		setPickerError("")
		setIsPicking(true)
		try {
			const result = await ImagePicker.launchCameraAsync({
				mediaTypes: ["images"],
				quality: 0.7,
			})
			if (!result.canceled && result.assets && result.assets.length > 0) {
				setImages((prev) => [...prev, result.assets[0].uri])
			}
		} catch (e: any) {
			setPickerError(e?.message || "Fotoğraf çekilirken bir hata oluştu.")
		} finally {
			setIsPicking(false)
		}
	}

	const pickFromGallery = async () => {
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
				allowsMultipleSelection: true, // Birden fazla seçime izin ver
				quality: 0.7,
			})
			if (!result.canceled && result.assets && result.assets.length > 0) {
				const newUris = result.assets.map((a) => a.uri)
				setImages((prev) => [...prev, ...newUris])
			}
		} catch (e: any) {
			setPickerError(e?.message || "Görsel seçilirken bir hata oluştu.")
		} finally {
			setIsPicking(false)
		}
	}

	const removeImage = (indexToRemove: number) => {
		setImages((prev) => prev.filter((_, index) => index !== indexToRemove))
	}

	//////////////////////////// SUBMIT ////////////////////////////

	const onSubmit = async (data: MemberFormData) => {
		if (isSubmitting) return
		setIsSubmitting(true)

		try {
			// Form verisini senin Risk interface'ine uygun hale getiriyoruz
			let formattedData: Partial<Risk> = {
				type: data.type,
				category: data.category,
				location: data.location,
				description: data.description,
				severity: data.severity,
				images: [],
				status: "New",
			}

			// Eğer tür "Accident" ise, kazaya özel alanları da ekliyoruz
			if (data.type === "Accident" && data.accidentDetails) {
				formattedData = {
					...formattedData,
					accidentDetails: {
						involvedPersons: data.accidentDetails.involvedPersons
							.split(",")
							.map((p) => p.trim())
							.filter(Boolean),
						injuryStatus: data.accidentDetails.injuryStatus,
						firstAidProvided: data.accidentDetails.firstAidProvided,
					},
				}
			}

			// 1) Önce risk dokümanını Firestore'a ekle
			const res = await addRisk(formattedData)
			if (!res.success || !res.id) {
				Alert.alert("Kayıt Gönderilmedi", "Risk kaydı oluşturulamadı. Lütfen tekrar deneyin.")
				return
			}

			// 2) Görsel varsa Firebase Storage'a yükle
			if (images.length > 0) {
				const uploadResult = await uploadImages(images, `risks/${res.id}`)

				// Yükleme başarısızsa eklediğimiz dokümanı geri sil ve kullanıcı tekrar denesin
				if (!uploadResult.success || !uploadResult.urls) {
					await deleteRisk(res.id)
					Alert.alert("Kayıt Gönderilmedi", "Görseller yüklenemedi. Lütfen tekrar deneyin.")
					return
				}

				// Yüklenen URL'leri dokümana kaydet
				await updateRisk(res.id, { images: uploadResult.urls })
			}

			// 3) Başarılı -> kullanıcıyı bilgilendir ve ana ekrana dön
			Alert.alert("Başarılı", "Kaydınız başarıyla gönderildi.", [
				{ text: "Tamam", onPress: () => navigation.navigate("HomeStack", { screen: "HomeScreen" }) },
			])
		} catch (error: any) {
			console.error("Kayıt gönderilirken hata oluştu:", error)
			Alert.alert("Kayıt Gönderilmedi", "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.")
		} finally {
			setIsSubmitting(false)
		}
	}

	//////////////////////////// RENDER ////////////////////////////

	return (
		<View style={styles.container}>
			<ScrollView
				style={styles.scroll}
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
			>
				<GradientCard style={styles.card}>
					<ThemedText style={styles.title}>Yeni Risk/Kaza Bildirimi</ThemedText>

					<Controller
						control={control}
						name="type"
						rules={{ required: "Tür zorunludur." }}
						render={({ field: { value }, fieldState: { error } }) => (
							<SelectField
								label="Tür"
								fieldName="type"
								value={value}
								error={error?.message}
								onPress={() => openSelect("type")}
							/>
						)}
					/>

					{/* SADECE "İŞ KAZASI (Accident)" SEÇİLİRSE GÖSTERİLECEK ALANLAR */}
					{selectedType === "Accident" && (
						<View style={styles.dynamicSection}>
							<ThemedText style={styles.sectionTitle}>Kaza Detayları</ThemedText>

							<Controller
								control={control}
								name="accidentDetails.involvedPersons"
								rules={{ required: "Kazaya karışan kişiler zorunludur." }}
								render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
									<View style={styles.fieldContainer}>
										<ThemedText style={styles.fieldLabel}>Kazaya Karışanlar (Virgülle ayırın)</ThemedText>
										<TextInput
											style={[styles.input, error && styles.selectFieldError]}
											placeholder="Örn: Ahmet Yılmaz, Mehmet Can"
											placeholderTextColor="#888"
											value={value}
											onBlur={onBlur}
											onChangeText={onChange}
										/>
										{error ? <Text style={styles.fieldError}>{error.message}</Text> : null}
									</View>
								)}
							/>

							<Controller
								control={control}
								name="accidentDetails.injuryStatus"
								rules={{ required: "Yaralanma durumu zorunludur." }}
								render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
									<View style={styles.fieldContainer}>
										<ThemedText style={styles.fieldLabel}>Yaralanma Durumu</ThemedText>
										<TextInput
											style={[styles.input, error && styles.selectFieldError]}
											placeholder="Örn: Hafif sıyrık, kırık vb."
											placeholderTextColor="#888"
											value={value}
											onBlur={onBlur}
											onChangeText={onChange}
										/>
										{error ? <Text style={styles.fieldError}>{error.message}</Text> : null}
									</View>
								)}
							/>

							<Controller
								control={control}
								name="accidentDetails.firstAidProvided"
								render={({ field: { onChange, value } }) => (
									<View style={styles.switchContainer}>
										<ThemedText style={styles.fieldLabel}>İlk Müdahale Yapıldı mı?</ThemedText>
										<Switch
											value={value}
											onValueChange={onChange}
											trackColor={{ false: "#767577", true: "#81b0ff" }}
											thumbColor={value ? "#2B6CB0" : "#f4f3f4"}
										/>
									</View>
								)}
							/>
						</View>
					)}

					<Controller
						control={control}
						name="category"
						rules={{ required: "Kategori zorunludur." }}
						render={({ field: { value }, fieldState: { error } }) => (
							<SelectField
								label="Kategori"
								fieldName="category"
								value={value}
								error={error?.message}
								onPress={() => openSelect("category")}
							/>
						)}
					/>

					<Controller
						control={control}
						name="location"
						rules={{ required: "Konum zorunludur." }}
						render={({ field: { value }, fieldState: { error } }) => (
							<SelectField
								label="Konum"
								fieldName="location"
								value={value}
								error={error?.message}
								onPress={() => openSelect("location")}
							/>
						)}
					/>

					<Controller
						control={control}
						name="description"
						rules={{ required: "Açıklama zorunludur." }}
						render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
							<View style={styles.fieldContainer}>
								<ThemedText style={styles.fieldLabel}>Açıklama</ThemedText>
								<TextInput
									style={[styles.textArea, error && styles.selectFieldError]}
									placeholder="Açıklamanızı girin..."
									placeholderTextColor="#888"
									multiline
									numberOfLines={4}
									textAlignVertical="top"
									value={value}
									onBlur={onBlur}
									onChangeText={onChange}
								/>
								{error ? <Text style={styles.fieldError}>{error.message}</Text> : null}
							</View>
						)}
					/>

					<Controller
						control={control}
						name="severity"
						rules={{ required: "Önem derecesi zorunludur." }}
						render={({ field: { value }, fieldState: { error } }) => (
							<SelectField
								label="Önem Derecesi"
								fieldName="severity"
								value={value}
								error={error?.message}
								onPress={() => openSelect("severity")}
							/>
						)}
					/>

					{/* ===== ÇOKLU FOTOĞRAF ALANI ===== */}
					<View style={styles.fieldContainer}>
						<ThemedText style={styles.fieldLabel}>Görseller ({images.length})</ThemedText>

						<View style={styles.imageButtonsRow}>
							<ThemedButton
								text="Kamera"
								icon="camera"
								iconSize={20}
								onPress={takePhoto}
								disabled={isPicking}
								style={styles.imageButton}
							/>
							<ThemedButton
								text="Galeri"
								icon="image-multiple-outline"
								iconSize={20}
								onPress={pickFromGallery}
								disabled={isPicking}
								style={styles.imageButton}
							/>
						</View>

						{pickerError ? <Text style={styles.fieldError}>{pickerError}</Text> : null}

						{images.length > 0 && (
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								style={styles.imageList}
							>
								{images.map((uri, index) => (
									<View
										key={index}
										style={styles.imagePreviewWrap}
									>
										<Image
											source={{ uri }}
											style={styles.imagePreview}
											contentFit="cover"
										/>
										<TouchableOpacity
											style={styles.removeImage}
											onPress={() => removeImage(index)}
											activeOpacity={0.8}
										>
											<ThemedIcon
												name="close"
												size={16}
											/>
										</TouchableOpacity>
									</View>
								))}
							</ScrollView>
						)}
					</View>

					<ThemedButton
						onPress={handleSubmit(onSubmit)}
						disabled={isSubmitting}
						style={styles.submitButton}
					>
						{isSubmitting ? (
							<ActivityIndicator color={darkMode ? "#000" : "#fff"} />
						) : (
							<View style={styles.submitContent}>
								<ThemedIcon
									name="send"
									size={20}
									color={darkMode ? "#000" : "#fff"}
								/>
								<ThemedText style={styles.submitText}>Gönder</ThemedText>
							</View>
						)}
					</ThemedButton>
				</GradientCard>
			</ScrollView>

			<ThemedBottomSheet
				ref={sheetRef}
				snapPoints={["45%"]}
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
		content: {},
		card: {
			padding: 20,
			gap: 14,
		},
		title: {
			fontSize: 22,
			fontWeight: "800",
			marginBottom: 6,
		},
		fieldContainer: {
			width: "100%",
			gap: 6,
		},
		fieldLabel: {
			fontSize: 14,
			fontWeight: "600",
			opacity: 0.8,
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
		selectFieldError: {
			borderColor: "red",
		},
		selectValue: {
			fontSize: 16,
			flex: 1,
		},
		selectPlaceholder: {
			opacity: 0.5,
		},
		textArea: {
			borderWidth: 1,
			borderColor: theme.border,
			borderRadius: 12,
			paddingHorizontal: 14,
			paddingVertical: 12,
			fontSize: 16,
			minHeight: 110,
			color: darkMode ? "#fff" : "#000",
			backgroundColor: darkMode ? "#000" : "#fff",
		},
		fieldError: {
			color: "red",
			fontSize: 12,
			marginLeft: 4,
		},
		dynamicSection: {
			backgroundColor: darkMode ? "#1a1a1a" : "#f5f5f5",
			padding: 14,
			borderRadius: 12,
			gap: 12,
			borderLeftWidth: 4,
			borderColor: "#2B6CB0",
		},
		sectionTitle: {
			fontSize: 16,
			fontWeight: "bold",
			color: "#2B6CB0",
		},
		switchContainer: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			marginTop: 4,
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
			marginTop: 8,
			paddingVertical: 4,
		},
		imagePreviewWrap: {
			marginRight: 12,
		},
		imagePreview: {
			width: 100,
			height: 100,
			borderRadius: 12,
			backgroundColor: darkMode ? "#2a2a2a" : "#e2e2e2",
		},
		removeImage: {
			position: "absolute",
			top: -6,
			right: -6,
			width: 24,
			height: 24,
			borderRadius: 12,
			alignItems: "center",
			justifyContent: "center",
			backgroundColor: "red",
			borderWidth: 2,
			borderColor: darkMode ? "#000" : "#fff",
		},
		submitContent: {
			flexDirection: "row",
			alignItems: "center",
			gap: 8,
		},
		submitText: {
			fontSize: 16,
			fontWeight: "bold",
			color: darkMode ? "#000" : "#fff",
		},
		submitButton: {
			marginTop: 6,
		},
	})
}
