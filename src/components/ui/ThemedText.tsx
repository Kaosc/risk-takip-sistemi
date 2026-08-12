import { memo } from "react"
import { StyleSheet, Text, TextProps } from "react-native"
import { useSelector } from "react-redux"

interface ThemedTextProps extends TextProps {
	color?: string
	disableDeviceFontScaling?: boolean
}

function ThemedText(props: ThemedTextProps) {
	const { darkMode } = useSelector((state: RootState) => state.settings)

	// Flatten the style array to get the actual fontSize value
	const flattenedStyle = StyleSheet.flatten(props?.style)
	const originalFontSize = flattenedStyle?.fontSize

	return (
		<Text
			{...props}
			style={[
				{ fontFamily: "InterDisplay-Regular", color: props?.color || darkMode ? "#ffffff" : "#000000" },
				props?.style,
				props?.color && { color: props?.color },
				{
					fontSize: originalFontSize ? originalFontSize : 14,
				},
			]}
			adjustsFontSizeToFit={props?.ellipsizeMode ? false : true}
			allowFontScaling={!props?.disableDeviceFontScaling}
		>
			{props?.children}
		</Text>
	)
}

export default memo(ThemedText)
