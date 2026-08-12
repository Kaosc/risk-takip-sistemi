import { View, TouchableOpacity, StyleSheet } from "react-native"
import React from "react"
import { useSelector } from "react-redux"

import ThemedIcon from "./ThemedIcon"
import { moderateScale } from "../../utils/responsive"

type Props = {
	value: boolean
	onChange: (v?: any) => void
	size?: number
}

export default function ThemedCheckBox({ value, onChange, size }: Props) {
	const { darkMode } = useSelector((state: RootState) => state.settings)
	const styles = createStyles(darkMode, size)

	return (
		<View style={{ alignSelf: "center" }}>
			<TouchableOpacity
				style={styles.checkboxContainer}
				onPress={() => onChange()}
				activeOpacity={0.7}
			>
				<View style={[styles.checkbox, value && styles.checkboxChecked]}>
					{value && (
						<ThemedIcon
							name="check"
							size={size ? size / 1.5 : 20}
							style={{ alignSelf: "center" }}
						/>
					)}
				</View>
			</TouchableOpacity>
		</View>
	)
}

const createStyles = (darkMode: boolean, size?: number) => {
	return StyleSheet.create({
		checkboxContainer: {
			flexDirection: "row",
			alignItems: "center",
			gap: 10,
		},
		checkbox: {
			width: moderateScale(size || 30),
			height: moderateScale(size || 30),
			borderRadius: 99,
			borderWidth: 2,
			borderColor: darkMode ? "#5f5f5f" : "#b1b1b1",
			alignItems: "center",
			justifyContent: "center",
			backgroundColor: "#000",
		},
		checkboxChecked: {
			backgroundColor: darkMode ? "#383838" : "#ffffff",
			borderColor: darkMode ? "#a8a8a8" : "#7e7e7e",
		},
		checkboxLabel: {
			flex: 1,
			fontSize: 14,
			fontFamily: "InterMedium",
		},
	})
}
