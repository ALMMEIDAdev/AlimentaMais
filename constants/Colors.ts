/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#FF6B35'; // Laranja caloroso para solidariedade
const tintColorDark = '#FF8A65'; // Laranja mais claro para modo escuro

export const Colors = {
  light: {
    text: '#2D2D2D',
    background: '#FAFAFA',
    tint: tintColorLight,
    icon: '#FF6B35',
    tabIconDefault: '#FFAB91',
    tabIconSelected: tintColorLight,
    primary: '#FF6B35', // Laranja principal
    secondary: '#4CAF50', // Verde para esperança
    accent: '#FFC107', // Amarelo para destaque
  },
  dark: {
    text: '#F5F5F5',
    background: '#1A1A1A',
    tint: tintColorDark,
    icon: '#FF8A65',
    tabIconDefault: '#FFAB91',
    tabIconSelected: tintColorDark,
    primary: '#FF8A65', // Laranja suave para modo escuro
    secondary: '#81C784', // Verde suave
    accent: '#FFD54F', // Amarelo suave
  },
};
