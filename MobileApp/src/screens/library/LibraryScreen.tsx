import React from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { useAppTheme } from '@/theme/useAppTheme';
import type { AppColors } from '@/theme/colors';

function LibraryScreen() {
    const { colors } = useAppTheme();
    const styles = React.useMemo(
        () => createStyles(colors),
        [colors],
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Library
            </Text>
        </View>
    );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
    },
    title: {
        color: colors.text,
        fontSize: 24,
        fontWeight: '700',
    },
});

export default LibraryScreen;
