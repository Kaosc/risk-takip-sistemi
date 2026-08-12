import {
	AntDesign,
	Feather,
	FontAwesome5,
	FontAwesome6,
	Fontisto,
	Ionicons,
	MaterialCommunityIcons,
	MaterialIcons,
} from "@expo/vector-icons"

// Extract icon name types from each icon library
export type MaterialCommunityIconNames = React.ComponentProps<typeof MaterialCommunityIcons>["name"]
export type AntDesignIconNames = React.ComponentProps<typeof AntDesign>["name"]
export type FeatherIconNames = React.ComponentProps<typeof Feather>["name"]
export type FontAwesome5IconNames = React.ComponentProps<typeof FontAwesome5>["name"]
export type FontAwesome6IconNames = React.ComponentProps<typeof FontAwesome6>["name"]
export type IoniconsIconNames = React.ComponentProps<typeof Ionicons>["name"]
export type MaterialIconNames = React.ComponentProps<typeof MaterialIcons>["name"]

// Custom icon mappings for non-MaterialCommunity icons
export const iconComponents = {
	plus: FontAwesome5,
	male: Fontisto,
	female: Fontisto,
} as const

export type CustomIconNames = keyof typeof iconComponents
export type AllIconNames = CustomIconNames | MaterialCommunityIconNames
