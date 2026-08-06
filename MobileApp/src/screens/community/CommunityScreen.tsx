import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import TopHeaderBar from '../../components/common/TopHeaderBar';
import { FAQScreen } from '../questions/FAQScreen';
import { useAppTheme } from '../../theme/useAppTheme';
import type { AppColors } from '../../theme/colors';

function CommunityScreen({ navigation }: any) {
    const { colors } = useAppTheme();
    const styles = React.useMemo(
        () => createStyles(colors),
        [colors],
    );
    const [activeSubTab, setActiveSubTab] = useState<'discussion' | 'faq'>('discussion');

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <TopHeaderBar />

            {/* Segmented Tab Switcher (Cộng đồng: Diễn đàn & FAQ Hỏi đáp) */}
            <View style={styles.segmentedContainer}>
                <TouchableOpacity
                    style={[
                        styles.segmentBtn,
                        activeSubTab === 'discussion' && styles.segmentBtnActive,
                    ]}
                    onPress={() => setActiveSubTab('discussion')}
                    activeOpacity={0.8}
                >
                    <Text
                        style={[
                            styles.segmentText,
                            activeSubTab === 'discussion' && styles.segmentTextActive,
                        ]}
                    >
                        💬 Community Forum
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.segmentBtn,
                        activeSubTab === 'faq' && styles.segmentBtnActive,
                    ]}
                    onPress={() => setActiveSubTab('faq')}
                    activeOpacity={0.8}
                >
                    <Text
                        style={[
                            styles.segmentText,
                            activeSubTab === 'faq' && styles.segmentTextActive,
                        ]}
                    >
                        ❓ Nutrition FAQ
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Sub-tab content */}
            <View style={styles.content}>
                {activeSubTab === 'discussion' ? (
                    <View style={styles.discussionPlaceholder}>
                        <Text style={styles.emojiText}>💬</Text>
                        <Text style={styles.discussionTitle}>Weaning Experience Forum</Text>
                        <Text style={styles.discussionSubTitle}>
                            A community for parents to share recipes, exchange feeding tips, and consult with nutrition experts.
                        </Text>
                        <TouchableOpacity 
                            style={styles.askQuestionBtn}
                            onPress={() => setActiveSubTab('faq')}
                            activeOpacity={0.88}
                        >
                            <Text style={styles.askQuestionBtnText}>❓ View Frequently Asked Questions (FAQ)</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FAQScreen />
                )}
            </View>
        </View>
    );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    segmentedContainer: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 8,
        borderRadius: 24,
        padding: 4,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: colors.borderDashedPrimary,
        shadowColor: colors.primary,
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    segmentBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: 'transparent',
    },
    segmentBtnActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
        shadowColor: colors.primary,
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 3,
    },
    segmentText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textSoft,
    },
    segmentTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    content: {
        flex: 1,
    },
    discussionPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 28,
        marginHorizontal: 16,
        marginVertical: 12,
        borderRadius: 20,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: colors.borderDashed,
    },
    emojiText: {
        fontSize: 48,
        marginBottom: 12,
    },
    discussionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    discussionSubTitle: {
        fontSize: 14,
        color: colors.textSoft,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    askQuestionBtn: {
        backgroundColor: colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 14,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: colors.borderDashedPrimary,
        shadowColor: colors.primary,
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 3,
    },
    askQuestionBtnText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
});

export default CommunityScreen;
