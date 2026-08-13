import { createNativeStackNavigator } from "@react-navigation/native-stack"

import RisksScreen from "../../screens/RisksScreen"
import SearchScreen from "../../screens/SearchScreen"

const Stack = createNativeStackNavigator()

export default function RisksStack() {
	return (
		<Stack.Navigator>
			<Stack.Screen
				name="RisksScreen"
				component={RisksScreen}
				options={{
					headerShown: false,
				}}
			/>
			<Stack.Screen
				name="SearchScreen"
				component={SearchScreen}
				options={{
					headerShown: false,
				}}
			/>
		</Stack.Navigator>
	)
}
