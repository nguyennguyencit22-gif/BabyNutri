import {
    StyleSheet,
} from 'react-native';
import type { AppColors } from '../../theme/colors';

const createStyles = (colors: AppColors) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },

    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 40,
    },
});

export default createStyles;
