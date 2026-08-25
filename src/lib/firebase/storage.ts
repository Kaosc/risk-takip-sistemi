import { getDownloadURL, getStorage, putFile, ref, deleteObject } from "@react-native-firebase/storage"

const storage = getStorage()

/**
 * Yerel görsel dosyalarını Firebase Cloud Storage'a yükler.
 * @param images Yerel dosya URI'lerini içeren dizi (örn. expo-image-picker sonucu)
 * @param folderPath HEDEF klasör yolu (örn. `risks/<riskId>`). Boşsa `uploads` kullanılır.
 * @returns Başarılıysa yüklenen dosyaların indirme URL'lerini döner.
 */
export const uploadImages = async (
	images: string[],
	folderPath?: string,
): Promise<{ success: boolean; urls?: string[]; error?: string }> => {
	try {
		if (!images || images.length === 0) {
			return { success: true, urls: [] }
		}

		const folder = folderPath?.replace(/^\/+|\/+$/g, "") || "uploads"
		const urls: string[] = []

		for (let i = 0; i < images.length; i++) {
			const uri = images[i]
			const extension = (uri.split(".").pop() || "jpg").split("?")[0].toLowerCase()
			const fileName = `${Date.now()}-${i}.${extension}`
			const reference = ref(storage, `${folder}/${fileName}`)

			await putFile(reference, uri)
			const url = await getDownloadURL(reference)
			urls.push(url)
		}

		return { success: true, urls }
	} catch (error: any) {
		console.error("uploadImages hatası:", error?.message || error)
		return { success: false, error: error?.message || "Görseller yüklenirken bir hata oluştu." }
	}
}

export const deleteImagesByRiskId = async (urls: string[]): Promise<{ success: boolean; error?: string }> => {
	try {
		if (!urls || urls.length === 0) {
			return { success: true }
		}
		for (const url of urls) {
			const reference = ref(storage, url)
			await deleteObject(reference)
			console.info(`Görsel silindi: ${url}`)
		}
		return { success: true }
	} catch (error: any) {
		console.error("deleteImagesByRiskId hatası:", error?.message || error)
		return { success: false, error: error?.message || "Görseller silinirken bir hata oluştu." }
	}
}
