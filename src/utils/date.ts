/**
 * Formats a Date to "YYYY-MM-DD" in the device's local timezone.
 */
const formatLocalDate = (date: Date): string => {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, "0")
	const day = String(date.getDate()).padStart(2, "0")
	return `${year}-${month}-${day}`
}

/**
 * Formats a Date to "YYYY-MM-DD HH:MM:SS" in the device's local timezone.
 */
const formatLocalDateTime = (date: Date): string => {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, "0")
	const day = String(date.getDate()).padStart(2, "0")
	const hours = String(date.getHours()).padStart(2, "0")
	const minutes = String(date.getMinutes()).padStart(2, "0")
	const seconds = String(date.getSeconds()).padStart(2, "0")
	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * Converts a timestamp to a date string in the format "YYYY-MM-DD" (device local timezone).
 * If the timestamp is invalid or cannot be converted, it returns an empty string.
 * @param timestamp
 * @returns
 */
export const safeTimestampToDateString = (timestamp: unknown): string => {
	try {
		if (!timestamp) return ""

		// Firestore Timestamp has toDate() method
		if (typeof (timestamp as any).toDate === "function") {
			const date = (timestamp as any).toDate()
			return isNaN(date.getTime()) ? "" : formatLocalDate(date)
		}

		// Already a Date object
		if (timestamp instanceof Date) {
			return isNaN(timestamp.getTime()) ? "" : formatLocalDate(timestamp)
		}

		return ""
	} catch {
		return ""
	}
}

/**
 * Converts a timestamp to a date-time string in the format "YYYY-MM-DD HH:MM:SS" (device local timezone).
 * If the timestamp is invalid or cannot be converted, it returns an empty string.
 * @param timestamp
 * @returns
 */
export const safeTimestampToDateTimeString = (timestamp: unknown): string => {
	try {
		if (!timestamp) return ""
		// Firestore Timestamp has toDate() method
		if (typeof (timestamp as any).toDate === "function") {
			const date = (timestamp as any).toDate()
			return isNaN(date.getTime()) ? "" : formatLocalDateTime(date)
		}
		// Already a Date object
		if (timestamp instanceof Date) {
			return isNaN(timestamp.getTime()) ? "" : formatLocalDateTime(timestamp)
		}
		return ""
	} catch {
		return ""
	}
}

export const calculateEndDateAsDays = (end: Date | FirebaseTimestamp, pausedAt?: Date | FirebaseTimestamp): number => {
	// Get the difference between todays date and the end date in milliseconds and return the difference in days
	const endDate = end instanceof Date ? end : end.toDate()
	const pausedDate = pausedAt instanceof Date ? pausedAt : pausedAt?.toDate()
	const today = new Date()

	let diffInMs = 0

	if (pausedDate) {
		// Paused duration is the difference between today and the paused date in milliseconds
		const pausedDurationMs = today.getTime() - pausedDate.getTime()
		// Maximum pause duration is the difference between the end date and the paused date
		const maximumPauseDurationMs = endDate.getTime() - pausedDate.getTime()
		// If the paused duration is more than the maximum pause duration, we set the new end date to now + remaining duration of the subscription. Otherwise, we set the new end date to end date + paused duration.
		if (pausedDurationMs > maximumPauseDurationMs) {
			diffInMs = maximumPauseDurationMs
		} else {
			// If the paused duration is less than or equal to the maximum pause duration, we set the new end date to end date + paused duration.
			diffInMs = endDate.getTime() - today.getTime() + pausedDurationMs
		}
	} else {
		diffInMs = endDate.getTime() - today.getTime()
	}

	return Math.ceil(diffInMs / (1000 * 60 * 60 * 24))
}

export function toDate(value: any): Date | null {
	if (!value) return null
	if (typeof value.toDate === "function") return value.toDate()
	if (value instanceof Date) return value
	return null
}

export function isThisMonth(value: any): boolean {
	const date = toDate(value)
	if (!date) return false
	const now = new Date()
	return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
}

export function daysUntil(date: Date): number {
	const now = new Date()
	const diff = date.getTime() - now.getTime()
	return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export const formatToYYYYMMDD = (firebaseTimestamp: any) => {
	if (!firebaseTimestamp) return null
	const date = firebaseTimestamp.toDate ? firebaseTimestamp.toDate() : new Date(firebaseTimestamp)
	return formatLocalDate(date)
}