import React from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView, } from 'react-native-safe-area-context';
import Icon from '../../components/common/AppIcon';
import { useAppTheme } from '@/theme/useAppTheme';
import type { AppColors } from '@/theme/colors';

function FeatureIntroScreen({
    navigation,
    route,
}: any) {
    const { colors } = useAppTheme();
    const styles = React.useMemo(
        () => createStyles(colors),
        [colors],
    );

    const userMode =
        route.params?.userMode ?? 'guest';

    const firebaseIdToken =
        route.params?.firebaseIdToken;

    const handleContinue = () => {
        navigation.navigate('Questionnaire', {
            userMode,
            firebaseIdToken,
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.title}>
                        Personalized nutrition for every child
                    </Text>

                    <Text style={styles.description}>
                        Discover age-appropriate recipes,
                        meal plans, nutrition guidance, and
                        helpful parenting resources.
                    </Text>

                    <View style={styles.preview}>
                        <Icon source="silverware-fork-knife" size={24} color="#FF5F70" style={{ marginRight: 10 }} />

                        <Text style={styles.previewText}>
                            Healthy meals made easier
                        </Text>
                    </View>
                </View>

                <Pressable
                    onPress={handleContinue}
                    style={styles.continueButton}>
                    <Text style={styles.continueText}>
                        Continue
                    </Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingVertical: 28,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        color: colors.text,
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
    },
    description: {
        marginTop: 16,
        color: colors.textSoft,
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
    },
    preview: {
        width: '80%',
        marginTop: 42,
        paddingVertical: 50,
        alignItems: 'center',
        borderRadius: 28,
        backgroundColor: colors.surface,
    },
    previewIcon: {
        fontSize: 74,
    },
    previewText: {
        marginTop: 18,
        color: colors.text,
        fontSize: 17,
        fontWeight: '600',
    },
    continueButton: {
        alignItems: 'center',
        borderRadius: 28,
        paddingVertical: 16,
        backgroundColor: colors.primary,
    },
    continueText: {
        color: colors.onPrimary,
        fontSize: 18,
        fontWeight: '700',
    },
});

export default FeatureIntroScreen;