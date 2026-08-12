import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  "SafeAreaView has been deprecated and will be removed in a future release. Please use 'react-native-safe-area-context' instead. See https://github.com/AppAndFlow/react-native-safe-area-context",
]);

import { registerRootComponent } from "expo"

import { I18nextProvider } from "react-i18next"
import { Provider } from "react-redux"

import ToastNotification from "./src/components/ToastNotification"
import { store } from "./src/store/store"
import i18n from "./i18n"
import App from "./App"

const IndexApp = () => {
	return (
		<I18nextProvider
			i18n={i18n}
			defaultNS={"translation"}
		>
			<Provider store={store}>
				<App />
			</Provider>
			<ToastNotification />
		</I18nextProvider>
	)
}

registerRootComponent(IndexApp)
