import { useSelector } from "react-redux"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import AuthStack from "./stacks/AuthStack"

import HomeStack from "./stacks/HomeStack"
import SettingsScreen from "../screens/SettingsScreen"

const Stack = createNativeStackNavigator()

export default function RootNavigator() {
	const { isAuthenticated } = useSelector((state: RootState) => state.auth)

	return (
		<Stack.Navigator
			initialRouteName={isAuthenticated ? "HomeStack" : "AuthStack"}
			screenOptions={{
				headerShown: false,
			}}
		>
			<Stack.Screen
				name="HomeStack"
				component={HomeStack}
			/>
			<Stack.Screen
				name="SettingsScreen"
				component={SettingsScreen}
			/>
			<Stack.Screen
				name="AuthStack"
				component={AuthStack}
			/>
		</Stack.Navigator>
	)
}
