import NetInfo from "@react-native-community/netinfo"
import { useEffect, useRef } from "react"
import { Appearance } from "react-native"
import { useDispatch, useSelector } from "react-redux"
import { SafeAreaView } from "react-native-safe-area-context"

import { setSettings } from "../store/features/settingsSlice"
import { setConfig } from "../store/features/configSlice"
import { getIsThemeAuto } from "../utils/storage"
import { setExternalTheme } from "../utils/toggleTheme"

import FirebaseHandler from "../lib/firebase/firebase"

export default function RootProvider({ children }: { children: React.ReactNode }) {
	const { darkMode } = useSelector((state: RootState) => state.settings)
	const config = useSelector((state: RootState) => state.config)
	const dispatch = useDispatch()

	const firebaseInit = useRef(false)

	/////////////////////////////////////////
	// #region FIREBASE INIT
	/////////////////////////////////////////

	const initFirebase = async () => {
		if (!firebaseInit.current) {
			await FirebaseHandler.initAppCheck().then(async () => {
				firebaseInit.current = true
			})
		}
	}

	useEffect(() => {
		initFirebase()
	}, [])

	//////////////////////////////////////////
	// #region NETWORK LISTENER
	//////////////////////////////////////////

	useEffect(() => {
		const unsubscribe = NetInfo.addEventListener((state) => {
			const isConnected = state.isConnected && state.isInternetReachable
			if (config.isConnected !== isConnected) {
				// Set connection if state changed
				dispatch(setConfig({ isConnected: isConnected }))
			}
		})

		return () => unsubscribe()
	}, [config.isConnected])

	////////////////////////////////////////
	// #region THEME LISTENER
	////////////////////////////////////////

	useEffect(() => {
		setExternalTheme(darkMode)
	}, [darkMode])

	useEffect(() => {
		const listener = Appearance.addChangeListener(async ({ colorScheme }) => {
			const newDarkMode = colorScheme === "dark" ? true : false
			const isThemeAuto = getIsThemeAuto()

			if (darkMode !== newDarkMode && isThemeAuto) {
				dispatch(
					setSettings({
						darkMode: newDarkMode,
					}),
				)
			}
		})

		return () => listener.remove()
	}, [darkMode, dispatch])

	return (
		<SafeAreaView
			style={{
				flex: 1,
				backgroundColor: darkMode ? "#000" : "#fff",
			}}
			edges={["top", "left", "right", "bottom"]}
		>
			{children}
		</SafeAreaView>
	)
}
