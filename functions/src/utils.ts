
import { getFirestore } from "firebase-admin/firestore"
import { COLLECTIONS } from "./contants"

export async function getAdminTokens(): Promise<string[]> {
   const db = getFirestore()

	const snapshot = await db
		.collection(COLLECTIONS.USERS)
		.where("role", "==", "ADMIN")
		.get()

	const tokens = snapshot.docs
		.map((doc) => {
			const data = doc.data() as {fcmToken?: string}
			return normalizeToken(data.fcmToken)
		})
		.filter((token): token is string => Boolean(token))

	return Array.from(new Set(tokens))
}

export async function getUserTokenByUid(uid?: string): Promise<string | null> {
   const db = getFirestore()

   const normalizedUid = uid?.trim()
   if (!normalizedUid) {
      return null
   }

   const userById = await db.collection(COLLECTIONS.USERS).doc(normalizedUid).get()
   if (userById.exists) {
      const token = normalizeToken((userById.data() as {fcmToken?: string}).fcmToken)
      if (token) {
         return token
      }
   }

   // Fallback when uid is stored as a field and not used as document id.
   const byUidSnapshot = await db
      .collection(COLLECTIONS.USERS)
      .where("uid", "==", normalizedUid)
      .limit(1)
      .get()

   if (byUidSnapshot.empty) {
      return null
   }

   const fallbackToken = normalizeToken(
      (byUidSnapshot.docs[0].data() as {fcmToken?: string}).fcmToken,
   )

   return fallbackToken
}

function normalizeToken(token?: string): string | null {
	if (!token) {
		return null
	}

	const trimmed = token.trim()
	return trimmed.length > 0 ? trimmed : null
}
