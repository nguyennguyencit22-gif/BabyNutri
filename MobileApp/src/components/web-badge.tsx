import { version } from 'react-native/package.json';
import { useColorScheme, StyleSheet, Image } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Spacing } from '@/constants/theme';

export function WebBadge() {
  return (
    <ThemedView style={styles.container}>
      <Image
        source={require('@/assets/images/react-logo.png')}
        style={styles.badgeImage}
      />
      <ThemedText type="code" themeColor="textSecondary" style={styles.versionText}>
        React Native v{version}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.five,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  versionText: {
    textAlign: 'center',
  },
  badgeImage: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});
