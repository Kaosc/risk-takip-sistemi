import { StyleSheet, TouchableOpacity, ViewStyle, StyleProp, ColorValue } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useSelector } from "react-redux"

import { Theme } from "../../utils/theme"

interface GradientCardProps {
	children: React.ReactNode
	style?: StyleProp<ViewStyle>
	onPress?: () => void
	activeOpacity?: number
	colors?: [ColorValue, ColorValue]
}

export default function GradientCard({ children, style, onPress, activeOpacity = 0.7, colors }: GradientCardProps) {
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const theme = Theme[darkMode ? "dark" : "light"]

	const gradientColors = colors ?? theme.gradient

	// Touchable cards need the gradient clipped to their rounded corners.
	if (onPress) {
		return (
			<TouchableOpacity
				style={[style, { overflow: "hidden" }]}
				activeOpacity={activeOpacity}
				onPress={onPress}
			>
				<LinearGradient
					start={{ x: 0, y: 0 }}
					end={{ x: 0, y: 1 }}
					colors={gradientColors}
					style={StyleSheet.absoluteFill}
				/>
				{children}
			</TouchableOpacity>
		)
	}

	return (
		<LinearGradient
			colors={gradientColors}
			style={style}
		>
			{children}
		</LinearGradient>
	)
}
