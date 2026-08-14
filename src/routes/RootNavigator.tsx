import { useSelector } from "react-redux"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import AuthStack from "./stacks/AuthStack"
import TabNavigator from "./TabNavigatior"

import RiskFormScreen from "../screens/RiskFormScreen"
import SettingsScreen from "../screens/SettingsScreen"
import RiskDetailsScreen from "../screens/RiskDetailsScreen"

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
				name="RiskDetailsScreen"
				component={RiskDetailsScreen as any}
			/>
			<Stack.Screen
				name="SettingsScreen"
				component={SettingsScreen}
			/>
			<Stack.Screen
				name="RiskFormScreen"
				component={RiskFormScreen}
			/>
			<Stack.Screen
				name="AuthStack"
				component={AuthStack}
			/>
		</Stack.Navigator>
	)
}
