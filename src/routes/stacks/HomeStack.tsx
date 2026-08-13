import { createNativeStackNavigator } from "@react-navigation/native-stack"

import HomeScreen from "../../screens/HomeScreen"

import AdminFormScreen from "../../screens/forms/AdminFormScreen"
import StaffFormScreen from "../../screens/forms/StaffFormScreen"
import MemberFormScreen from "../../screens/forms/MemberFormScreen"

const Stack = createNativeStackNavigator()

export default function HomeStack() {
	return (
		<Stack.Navigator>
			<Stack.Screen
				name="HomeScreen"
				component={HomeScreen}
				options={{
					headerShown: false,
				}}
			/>
			<Stack.Screen
				name="AdminFormScreen"
				component={AdminFormScreen}
				options={{
					headerShown: false,
				}}
			/>
			<Stack.Screen
				name="StaffFormScreen"
				component={StaffFormScreen}
				options={{
					headerShown: false,
				}}
			/>
			<Stack.Screen
				name="MemberFormScreen"
				component={MemberFormScreen}
				options={{
					headerShown: false,
				}}
			/>
		</Stack.Navigator>
	)
}
