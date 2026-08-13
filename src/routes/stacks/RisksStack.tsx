import { createNativeStackNavigator } from "@react-navigation/native-stack"

import RisksScreen from "../../screens/RisksScreen"

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
      </Stack.Navigator>
   )
}
