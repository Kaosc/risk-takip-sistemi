import { View } from "react-native"
import React from "react"
import { useSelector } from "react-redux"

import ThemedText from "../components/ui/ThemedText"

export default function HomeScreen() {
	const auth = useSelector((state: RootState) => state.auth)
	return (
		<View>
			<ThemedText>{JSON.stringify(auth)}</ThemedText>
		</View>
	)
}
