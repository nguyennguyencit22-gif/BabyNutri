import React, { useEffect } from 'react';
import {
  StyleSheet,
} from 'react-native';

import {
  NavigationContainer,
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationLightTheme,
} from '@react-navigation/native';

import {
  MD3DarkTheme,
  MD3LightTheme,
  PaperProvider,
} from 'react-native-paper';

import {
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

import {
  Provider,
  useDispatch,
} from 'react-redux';

import './src/i18n';

import { store } from './src/store/store';
import type { AppDispatch } from './src/store/store';
import { restoreLanguage } from './src/store/settings/languageSlice';
import { restoreThemeMode } from './src/store/settings/themeSlice';
import { loadPersistedBabies } from './src/store/babySlice';
import { loadPersistedHistory } from './src/store/historySlice';

import AppNavigator from './src/navigation/AppNavigator';

import { useAppTheme } from './src/theme/useAppTheme';

function AppContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { isDark, colors } = useAppTheme();

  useEffect(() => {
    dispatch(restoreLanguage());
    dispatch(restoreThemeMode());
    dispatch(loadPersistedBabies());
    dispatch(loadPersistedHistory());
  }, [dispatch]);

  const paperTheme = {
    ...(isDark ? MD3DarkTheme : MD3LightTheme),
    colors: {
      ...(isDark
        ? MD3DarkTheme.colors
        : MD3LightTheme.colors),

      primary: colors.primary,
      secondary: colors.secondary,
      background: colors.background,
      surface: colors.surface,
      onSurface: colors.text,
    },
  };

  const navigationTheme = {
    ...(isDark
      ? NavigationDarkTheme
      : NavigationLightTheme),

    colors: {
      ...(isDark
        ? NavigationDarkTheme.colors
        : NavigationLightTheme.colors),

      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={navigationTheme}>
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}

function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <Provider store={store}>
        <AppContent />
      </Provider>
    </GestureHandlerRootView>
  );
}

export default App;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
