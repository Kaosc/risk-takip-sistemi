## Stack
- React Native
- TypeScript
- Redux
- React Navigation
- Firebase

## Code Style
- When creating styles
  ```ts
  const styles = createStyles(darkMode)

  const createStyles = (darkMode: boolean) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: darkMode ? "#000" : "#fff",
      },
    })
  ```
  this is the basic structure for creating styles. If you need to pass different props like premium, theme, etc. you can add them as parameters to the createStyles function.

- When creating components, use functional components and hooks instead of class components. This is the recommended way to write React components and allows for better performance and easier code reuse.
- When naming variables and functions, use camelCase. This is the standard convention in JavaScript
- When naming components, use PascalCase. This is the standard convention for React components.
- When creating a component file (.tsx) use PascalCase but for utility or function files use camelCase. This helps to easily distinguish between components and other code.
- Use less TypeScript types when possible. TypeScript is a powerful tool for catching errors and improving code quality, but it can also make the code more complex and harder to read. Use types only when necessary.
- When you need to use react-native-mmkv for states that needs to be saved to local storage use the hooks instead of creating a new instance of MMKV like below
- ```ts
  import { useMMKVString } from "react-native-mmkv"

  const [value, setValue] = useMMKVString("key")
  const [value, setValue] = useMMKVBoolean("key")
  const [value, setValue] = useMMKVNumber("key")
  const [value, setValue] = useMMKVObject("key")
  ```
  This is the recommended way to use react-native-mmkv and it will automatically handle the state and storage for you.
- You don't need to use SaveAreaView in any where in the app, because I already wrapped the whole app with SafeAreaProvider in the App.tsx file. So you can use View component instead of SafeAreaView component.
- Don't import `import React from "react"` in any file, because it's not needed in React 17 and above. It will be automatically imported by the compiler.
- use types.d.ts file for all types and interfaces. Don't create new types or interfaces in any file.

## Base Components
- Always use the base components from the `src/components` folder instead of creating new ones. Specially `src/components/ui` components. Which these are custome & themed componenets like ThemedText, ThemedIcon etc.

## Theme
- I only use tones of black and white for each light and dark mode. You can prefer bright black/white colors for important stuff like sumbit button or and important text. I don't use any other colors in the app. use darkMode variable that bounded to redux's settings state like below to get the current theme mode.
  ```ts
  const darkMode = useSelector((state: RootState) => state.settings.darkMode)
  ```
- when creating styleSheet, use the following structure to create styles based on the current theme mode.
  ```ts
  // Get the current theme mode from redux state will be in the component
  const styles = createStyles(darkMode)

  // Create a function that returns the styles based on the current theme mode
  const createStyles = (darkMode: boolean) => {
    const theme = Theme[darkMode ? "dark" : "light"]

    return StyleSheet.create({
      button: {
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        marginBottom: 16,
      },
    })
  }
  ```


## Behavior
- Don't explain obvious things
- Show only changed code when editing, not the whole file
- Ask before installing new packages
- If unsure about something, say so instead of guessing

## Restrictions
- Don't run npx expo prebuild in any circumstance, it can override my custom native code and cause issues
- Don't use moderateScale() function for padding and margin stylings only use it for height and width stylings.