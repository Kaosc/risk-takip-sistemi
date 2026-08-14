import { createNativeStackNavigator } from "@react-navigation/native-stack"

import HomeScreen from "../../screens/HomeScreen"
import NotificationsScreen from "../../screens/NotificationsScreen"

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
				name="NotificationsScreen"
				component={NotificationsScreen}
				options={{
					headerShown: false,
				}}
			/>
		</Stack.Navigator>
	)
}
