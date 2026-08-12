import { memo } from "react"
import { StyleSheet } from "react-native"
import Toast from "react-native-toast-notifications"

function ToastNotification() {
	return (
		<Toast
			ref={(ref) => {
				if (ref) {
					global["toast"] = ref
				}
			}}
			offset={120}
			duration={2000}
			placement="top"
			textStyle={styles.text}
			normalColor="#2d8f2dff"
		/>
	)
}

const styles = StyleSheet.create({
	text: {
		fontSize: 17,
	},
})

export default memo(ToastNotification)
