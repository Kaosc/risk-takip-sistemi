import { memo } from "react"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useSelector } from "react-redux"
import { StyleProp, TextStyle } from "react-native"

import { AllIconNames, iconComponents } from "../../types/icon"
import { moderateScale } from "../../utils/responsive"

interface ThemedIconProps {
	name: AllIconNames
	size: number
	style?: StyleProp<TextStyle>
	color?: string
}

function ThemedIcon(props: ThemedIconProps) {
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const IconComponent = iconComponents[props.name as keyof typeof iconComponents] || MaterialCommunityIcons

	return (
		<IconComponent
			{...props}
			name={props?.name as any}
			size={moderateScale(props?.size || 24)}
			style={[
				props?.style,
				{
					color: darkMode ? "#fff" : "#000",
				},
				props?.color && { color: props?.color },
			]}
		/>
	)
}

export default memo(ThemedIcon)
