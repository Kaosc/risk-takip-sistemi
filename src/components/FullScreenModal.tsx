import { Modal, StyleSheet, TouchableOpacity, View } from "react-native"
import { Image } from "expo-image"
import { useSelector } from "react-redux"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import ThemedIcon from "./ui/ThemedIcon"

type FullScreenModalProps = {
	visible: boolean
	image?: string | null
	onClose: () => void
}

function FullScreenModal({ visible, image, onClose }: FullScreenModalProps) {
	const darkMode = useSelector((state: RootState) => state.settings.darkMode)
	const insets = useSafeAreaInsets()
	const styles = createStyles(darkMode)

	return (
		<Modal
			visible={visible}
			animationType="fade"
			transparent={false}
			statusBarTranslucent
			onRequestClose={onClose}
		>
			<View style={styles.container}>
				{image ? (
					<Image
						source={{ uri: image }}
						style={styles.image}
						contentFit="contain"
					/>
				) : null}

				<TouchableOpacity
					style={[styles.closeButton, { top: insets.top + 40 }]}
					onPress={onClose}
					activeOpacity={0.8}
				>
					<ThemedIcon
						name="close"
						size={26}
						color="#fff"
					/>
				</TouchableOpacity>
			</View>
		</Modal>
	)
}

export default FullScreenModal

const createStyles = (darkMode: boolean) => {
	return StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: "#000",
		},
		image: {
			flex: 1,
			width: "100%",
		},
		closeButton: {
			position: "absolute",
			right: 16,
			width: 44,
			height: 44,
			borderRadius: 22,
			alignItems: "center",
			justifyContent: "center",
			backgroundColor: darkMode ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.45)",
			borderWidth: 1,
			borderColor: "rgba(255,255,255,0.4)",
		},
	})
}
