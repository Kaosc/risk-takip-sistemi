import { StyleProp, StyleSheet, TextStyle, TouchableOpacity, TouchableOpacityProps } from "react-native"
import { useSelector } from "react-redux"

import ThemedText from "./ThemedText"
import ThemedIcon from "./ThemedIcon"

import { AllIconNames } from "../../types/icon"

interface ThemedButtonProps extends TouchableOpacityProps {
	text?: string
	icon?: AllIconNames
	iconSize?: number
	textStyle?: StyleProp<TextStyle>
}

export default function ThemedButton(props: ThemedButtonProps) {
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)

	const styles = createStyles(darkMode)

	return (
		<TouchableOpacity
			{...props}
			style={[styles.button, props.icon && { flexDirection: "row", alignItems: "center", gap: 5 }, props.style]}
			activeOpacity={0.6}
		>
			{props.icon && (
				<ThemedIcon
					name={props.icon}
					size={props.iconSize || 24}
				/>
			)}
			{props.children || <ThemedText style={styles.buttonText}>{props.text}</ThemedText>}
		</TouchableOpacity>
	)
}

const createStyles = (darkMode: boolean) => {
	return StyleSheet.create({
		button: {
			alignItems: "center",
			justifyContent: "center",
			backgroundColor: darkMode ? "#fff" : "#000",
			padding: 10,
			borderRadius: 16,
			paddingVertical: 14,
		},
		buttonText: {
			color: darkMode ? "#000" : "#fff",
			fontSize: 16,
			fontWeight: "bold",
		},
	})
}
