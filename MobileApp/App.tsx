import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';

import AppNavigator from './src/navigation/AppNavigator';
import HomeScreen from '@/screens/home/HomeScreen';

const babyNutriTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#FF5F70',
    secondary: '#B445E6',
    background: '#FFF5F2',
    surface: '#FFFFFF',
    onSurface: '#4B3034',
  }
};
function App() {
  return (
    <PaperProvider theme={babyNutriTheme}>
      <NavigationContainer>
        {/* <AppNavigator /> Khóa để chặn login kiểm tra home trước */}
        <HomeScreen />
      </NavigationContainer>
    </PaperProvider>
  );
}

export default App;