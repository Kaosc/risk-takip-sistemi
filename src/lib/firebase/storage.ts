import { getDownloadURL, getStorage, putFile, ref } from "@react-native-firebase/storage"

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

