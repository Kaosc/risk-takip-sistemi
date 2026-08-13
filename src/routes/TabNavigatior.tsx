import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { useSelector } from "react-redux"

import ThemedIcon from "../components/ui/ThemedIcon"

import HomeStack from "./stacks/HomeStack"
import RisksStack from "./stacks/RisksStack"

import { BOTTOM_TAB_HEIGHT } from "../lib/constants"
import SettingsScreen from "../screens/SettingsScreen"

const Tabs = createBottomTabNavigator()

export default function TabNavigator() {
	const { darkMode } = useSelector((state: RootState) => state.settings)
	const { role } = useSelector((state: RootState) => state.auth)

	return (
		<Tabs.Navigator
			initialRouteName="HomeStack"
			backBehavior="initialRoute"
			screenOptions={{
				headerStyle: {
					elevation: 0,
				},
				tabBarStyle: {
					height: BOTTOM_TAB_HEIGHT,
					paddingBottom: 4,
					paddingTop: 2,
				},
				tabBarIconStyle: {
					width: 29,
					height: 29,
					marginBottom: 4,
				},
				tabBarActiveTintColor: darkMode ? "#ffffff" : "#000000",
				tabBarLabelStyle: {
					fontSize: 11,
				},
				headerShown: false,
				freezeOnBlur: true,
				lazy: true,
				animation: "shift",
			}}
		>
			<Tabs.Screen
				name="HomeStack"
				component={HomeStack}
				options={{
					tabBarIcon: (v) => (
						<ThemedIcon
							name={v.focused ? "home" : "home-outline"}
							size={31}
							color={v.color}
						/>
					),
					tabBarLabel: "Anasayfa",
				}}
			/>
			<Tabs.Screen
				name="RisksStack"
				component={RisksStack}
				options={{
					tabBarIcon: (v) => (
						<ThemedIcon
							name={v.focused ? "shield-alert" : "shield-alert-outline"}
							size={29}
							color={v.color}
						/>
					),
					tabBarLabel: role === "MEMBER" ? "Raporlarım" : "Raporlar",
				}}
			/>
			<Tabs.Screen
				name="SettingsScreen"
				component={SettingsScreen}
				options={{
					tabBarIcon: (v) => (
						<ThemedIcon
							name={v.focused ? "cog" : "cog-outline"}
							size={29}
							color={v.color}
						/>
					),
					tabBarLabel: "Ayarlar",
				}}
			/>
		</Tabs.Navigator>
	)
}
