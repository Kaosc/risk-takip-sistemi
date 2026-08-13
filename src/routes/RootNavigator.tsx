import { useSelector } from "react-redux"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import AuthStack from "./stacks/AuthStack"

import SettingsScreen from "../screens/SettingsScreen"
import TabNavigator from "./TabNavigatior"
import MemberFormScreen from "../screens/MemberFormScreen"

const Stack = createNativeStackNavigator()

export default function RootNavigator() {
	const { isAuthenticated } = useSelector((state: RootState) => state.auth)

	return (
		<Stack.Navigator
			initialRouteName={isAuthenticated ? "TabNavigator" : "AuthStack"}
			screenOptions={{
				headerShown: false,
			}}
		>
			<Stack.Screen
				name="TabNavigator"
				component={TabNavigator}
			/>
			<Stack.Screen
				name="SettingsScreen"
				component={SettingsScreen}
			/>
			<Stack.Screen
				name="MemberFormScreen"
				component={MemberFormScreen}
			/>
			<Stack.Screen
				name="AuthStack"
				component={AuthStack}
			/>
		</Stack.Navigator>
	)
}
