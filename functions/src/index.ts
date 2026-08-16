import { initializeApp } from "firebase-admin/app"
import { getMessaging } from "firebase-admin/messaging"
import { setGlobalOptions } from "firebase-functions/v2"
import { onDocumentWritten } from "firebase-functions/v2/firestore"

import * as logger from "firebase-functions/logger"
import { getAdminTokens, getUserTokenByUid } from "./utils"
import { COLLECTIONS } from "./contants"

initializeApp()

const messaging = getMessaging()

setGlobalOptions({ maxInstances: 10 })

const severityLabels: Record<string, string> = {
	low: "Düşük",
	medium: "Orta",
	high: "Yüksek",
	critical: "Kritik",
}

async function sendNotificationToTokens(
	tokens: string[],
	title: string,
	body: string,
	riskId: string,
	severity?: string,
): Promise<void> {
	if (tokens.length === 0) {
		logger.info("Skipping notification because no valid FCM tokens were found.", {
			riskId,
			title,
			severity,
		})
		return
	}

	// We can only send notifications to a maximum of 500 tokens at once
	const chunkSize = 500

	for (let i = 0; i < tokens.length; i += chunkSize) {
		const chunk = tokens.slice(i, i + chunkSize)
		const result = await messaging.sendEachForMulticast({
			tokens: chunk,
			notification: { title, body },
			data: {
				riskId: String(riskId || ""),
				severity: String(severity || "low"),
				title: String(title),
				body: String(body),
			},
			android: {
				priority: "high",
			},
			apns: {
				payload: {
					aps: {
						contentAvailable: true,
					},
				},
			},
		})

		logger.info("FCM notification batch sent.", {
			riskId,
			title,
			severity,
			totalInBatch: chunk.length,
			successCount: result.successCount,
			failureCount: result.failureCount,
		})
	}
}

export const onRiskWrite = onDocumentWritten(`${COLLECTIONS.RISKS}/{riskId}`, async (event) => {
	const riskId = event.params.riskId
	const beforeExists = event.data?.before.exists ?? false
	const afterExists = event.data?.after.exists ?? false

	// Ignore deletes and events with no resulting document.
	if (!afterExists) {
		return
	}

	const afterData = event.data?.after.data() as RiskDocument | undefined
	if (!afterData) {
		logger.warn("Risk document data is empty after write.", { riskId })
		return
	}

	const afterStatus = afterData.status
	const afterSeverity = afterData.severity || "medium"
	const severityText = severityLabels[afterSeverity] || "Belirtilmedi"

	// ===================================================================
	// 1) New risk created -> notify all admins.
	// ===================================================================
	if (!beforeExists) {
		if (afterStatus === "new") {
			const adminTokens = await getAdminTokens()
			await sendNotificationToTokens(
				adminTokens,
				"Sisteme yeni risk eklendi",
				"Risk Derecesi: " + severityText,
				riskId,
				afterSeverity,
			)
		}
		return
	}

	const beforeData = event.data?.before.data() as RiskDocument | undefined
	const beforeStatus = beforeData?.status

	// Only act when the status is changed to avoid duplicate notifications.
	if (beforeStatus === afterStatus) {
		return
	}

	// ===================================================================
	// 2) Admin assigned task to staff -> notify the assigned staff.
	// ===================================================================
	if (afterStatus === "inprogress") {
		const assignedToken = await getUserTokenByUid(afterData.assignedToId)
		if (!assignedToken) {
			logger.info("Assigned user has no valid FCM token; notification skipped.", {
				riskId,
				assignedToId: afterData.assignedToId,
			})
			return
		}

		await sendNotificationToTokens([assignedToken], "Yeni Görev Ataması", "Risk Derecesi: " + severityText, riskId, afterSeverity)
		return
	}

	// ===================================================================
	// 3) Staff completed task -> notify all admins for approval.
	// ===================================================================
	if (afterStatus === "pendingVerification") {
		const adminTokens = await getAdminTokens()
		await sendNotificationToTokens(
			adminTokens,
			"Görev Tamamlandı",
			"Bir personel görevini tamamladı ve onayınızı bekliyor.",
			riskId,
			afterSeverity,
		)
		return
	}

	// ===================================================================
	// 4) Admin closed/approved -> notify the original member.
	// ===================================================================
	if (afterStatus === "completed") {
		const creatorToken = await getUserTokenByUid(afterData.createdBy)
		if (!creatorToken) {
			logger.info("Risk creator has no valid FCM token; notification skipped.", {
				riskId,
				createdBy: afterData.createdBy,
			})
			return
		}

		await sendNotificationToTokens(
			[creatorToken],
			"Bildirim Kapatıldı",
			"Açtığınız risk bildirimi çözüldü ve onaylandı.",
			riskId,
			afterSeverity,
		)
	}
})
