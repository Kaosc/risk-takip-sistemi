// Saf istatistik hesaplama yardımcıları.
// Risk verileri (src/lib/firebase/firestore/risks.ts üzerinden) buraya verilir,
// hesaplamalar tamamen saf fonksiyonlarla yapılır.

const toDate = (value: FirebaseTimestamp | undefined): Date | null => {
	if (!value) {
		return null
	}
	try {
		return value.toDate()
	} catch {
		return null
	}
}

const pad = (value: number) => String(value).padStart(2, "0")

const monthKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`

// Pazartesi başlangıçlı haftanın ilk gününü (00:00) döner
const startOfWeek = (date: Date): Date => {
	const start = new Date(date.getFullYear(), date.getMonth(), date.getDate())
	const day = (start.getDay() + 6) % 7 // Pazartesi = 0, Pazar = 6
	start.setDate(start.getDate() - day)
	return start
}

export const getLastMonths = (count = 8): string[] => {
	const keys: string[] = []
	const now = new Date()

	for (let i = count - 1; i >= 0; i--) {
		const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
		keys.push(monthKey(date))
	}

	return keys
}

export const calculateRiskStatistics = (
	risks: Risk[],
	staffNameMap: Record<string, string> = {},
): RiskStatistics => {
	const now = new Date()

	const weekStart = startOfWeek(now)
	const lastWeekStart = new Date(weekStart)
	lastWeekStart.setDate(lastWeekStart.getDate() - 7)

	const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
	const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

	const stats: RiskStatistics = {
		total: risks.length,
		byStatus: { new: 0, inprogress: 0, pending: 0, completed: 0 },
		bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
		byType: { risk: 0, accident: 0, nearmiss: 0 },
		byCategory: {},
		byAssignedStaff: {},
		byMonth: {},
		unassignedCount: 0,
		thisWeek: 0,
		lastWeek: 0,
		thisMonth: 0,
		lastMonth: 0,
	}

	for (const risk of risks) {
		stats.byStatus[risk.status] += 1
		stats.bySeverity[risk.severity] += 1
		stats.byType[risk.type] += 1

		const category = risk.category || "other"
		stats.byCategory[category] = (stats.byCategory[category] || 0) + 1

		if (risk.assignedToId) {
			const staffName = staffNameMap[risk.assignedToId] || risk.assignedToId
			stats.byAssignedStaff[staffName] = (stats.byAssignedStaff[staffName] || 0) + 1
		} else {
			stats.unassignedCount += 1
		}

		const createdAt = toDate(risk.createdAt)
		if (createdAt) {
			const key = monthKey(createdAt)
			stats.byMonth[key] = (stats.byMonth[key] || 0) + 1

			if (createdAt >= weekStart) {
				stats.thisWeek += 1
			} else if (createdAt >= lastWeekStart) {
				stats.lastWeek += 1
			}

			if (createdAt >= monthStart) {
				stats.thisMonth += 1
			} else if (createdAt >= lastMonthStart) {
				stats.lastMonth += 1
			}
		}
	}

	return stats
}