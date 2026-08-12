import { useNavigation } from "@react-navigation/native"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import { useSelector } from "react-redux"

import ThemedIcon from "./ui/ThemedIcon"
import ThemedText from "./ui/ThemedText"

import { moderateScale } from "../utils/responsive"

interface CustomHeaderProps {
	title?: string
	rightComponent?: React.ReactNode
	onBackPress?: () => void
	relative?: boolean
	fontSize?: number
	showBackButton?: boolean
}

export default function CustomHeader({ title, rightComponent, onBackPress, relative = true, fontSize, showBackButton = true }: CustomHeaderProps) {
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const navigation = useNavigation()
	const styles = createStyles(darkMode, relative)

	const handleBackPress = () => {
		if (onBackPress) {
			onBackPress()
		} else {
			navigation.goBack()
		}
	}

	return (
		<View style={styles.container}>
			<View style={styles.content}>
				{/* Left - Back Button */}
				{showBackButton && (
					<TouchableOpacity
						onPress={handleBackPress}
						style={styles.backButton}
					>
						<ThemedIcon
							name="arrow-left"
							size={26}
							style={{ marginTop: 2 }}
						/>
					</TouchableOpacity>
				)}

				{/* Center - Title */}
				{title ? (
					<View style={styles.titleContainer}>
						<ThemedText
							style={[styles.title, { fontSize: fontSize || 19 }]}
							numberOfLines={1}
						>
							{title}
						</ThemedText>
					</View>
				) : (
					<></>
				)}

				{/* Right - Optional Component */}
				{rightComponent ? <View style={styles.rightContainer}>{rightComponent}</View> : <></>}
			</View>
		</View>
	)
}

const createStyles = (darkMode: boolean, relative?: boolean) =>
	StyleSheet.create({
		container: {
			position: relative ? "relative" : "absolute",
			top: 0,
			left: 0,
			right: 0,
			height: moderateScale(56),
			zIndex: 1000,
			backgroundColor: darkMode ? "#000" : "#fff",
			borderBottomWidth: 1,
			borderBottomColor: darkMode ? "#222222" : "#dddddd",
		},
		content: {
			flex: 1,
			flexDirection: "row",
			alignItems: "center",
			paddingHorizontal: 16,
			paddingVertical: 12,
			height: 60,
		},
		backButton: {
			width: moderateScale(40),
			height: moderateScale(40),
			justifyContent: "center",
			borderRadius: 20,
		},
		titleContainer: {
			flex: 1,
		},
		title: {
			fontWeight: "700",
			letterSpacing: 0.5,
		},
		rightContainer: {
			width: moderateScale(40),
			alignItems: "center",
			justifyContent: "center",
		},
	})
