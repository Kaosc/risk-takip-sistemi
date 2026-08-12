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
				debugToken: "99E55F93-AF0F-4396-B7DF-B367498181C6",
			},
			apple: {
				provider: __DEV__ ? "debug" : "appAttestWithDeviceCheckFallback",
				debugToken: "",
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
