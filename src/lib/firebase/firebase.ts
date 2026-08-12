import { getApp } from "@react-native-firebase/app"
import { initializeAppCheck } from "@react-native-firebase/app-check"
import { getInstallations, getToken } from "@react-native-firebase/installations"

export default class FirebaseHandler {
	static app = getApp()

	static async initAppCheck() {
		const installations = getInstallations()
		const provider = this.app.appCheck().newReactNativeFirebaseAppCheckProvider()

		provider.configure({
			android: {
				provider: __DEV__ ? "debug" : "playIntegrity",
				debugToken: "AAE0A50C-5A0B-46C1-B6A2-2ADA34BD4D69",
			},
			apple: {
				provider: __DEV__ ? "debug" : "appAttestWithDeviceCheckFallback",
				debugToken: "648EAA8D-EEA2-4B91-8566-9667E5B1CA18",
			},
		})

		try {
			await initializeAppCheck(this.app, {
				provider: provider,
				isTokenAutoRefreshEnabled: true,
			})
				.then(async () => {
					try {
						const token = await getToken(installations, true)
						if (token?.length > 0) {
							console.debug("[FIREBASE]: AppCheck verification passed")
						}
					} catch (e) {
						console.warn("[FIREBASE_ERR]: AppCheck token request failed", e)
					}
				})
				.catch((e) => console.warn("FirebaseHandler.ts:43", e))
		} catch (e) {
			console.warn("[FIREBASE_ERR]: AppCheck verification failed", e)
		}
	}
}
