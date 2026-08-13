import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import TopHeaderBar from '../../components/common/TopHeaderBar';
import FAQScreen from '../questions/FAQScreen';
import Icon from '../../components/common/AppIcon';
import { useAppTheme } from '../../theme/useAppTheme';
import type { AppColors } from '../../theme/colors';

function CommunityScreen({ navigation }: any) {
    const { colors } = useAppTheme();
    const styles = React.useMemo(
        () => createStyles(colors),
        [colors],
    );
    const [activeSubTab, setActiveSubTab] = useState<'faq' | 'discussion'>('faq');

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <TopHeaderBar />

            {/* Segmented Tab Switcher (Nutrition FAQ & Community Forum) */}
            <View style={styles.segmentedContainer}>
                <TouchableOpacity
                    style={[
                        styles.segmentBtn,
                        activeSubTab === 'faq' && styles.segmentBtnActive,
                    ]}
                    onPress={() => setActiveSubTab('faq')}
                    activeOpacity={0.8}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Icon source="comment-question-outline" size={16} color={activeSubTab === 'faq' ? '#FFFFFF' : colors.textSoft} />
                        <Text
                            style={[
                                styles.segmentText,
                                activeSubTab === 'faq' && styles.segmentTextActive,
                            ]}
                        >
                            Nutrition FAQ
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.segmentBtn,
                        activeSubTab === 'discussion' && styles.segmentBtnActive,
                    ]}
                    onPress={() => setActiveSubTab('discussion')}
                    activeOpacity={0.8}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Icon source="account-group-outline" size={16} color={activeSubTab === 'discussion' ? '#FFFFFF' : colors.textSoft} />
                        <Text
                            style={[
                                styles.segmentText,
                                activeSubTab === 'discussion' && styles.segmentTextActive,
                            ]}
                        >
                            Community Forum
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Sub-tab content */}
            <View style={styles.content}>
                {activeSubTab === 'faq' ? (
                    <FAQScreen navigation={navigation} />
                ) : (
                    <View style={styles.discussionPlaceholder}>
                        <Icon source="account-group-outline" size={48} color="#FF5F70" />
                        <Text style={styles.discussionTitle}>Weaning Experience Forum</Text>
                        <Text style={styles.discussionSubTitle}>
                            A community for parents to share recipes, exchange feeding tips, and consult with pediatric nutrition experts.
                        </Text>
                        <TouchableOpacity 
                            style={styles.askQuestionBtn}
                            onPress={() => setActiveSubTab('faq')}
                            activeOpacity={0.88}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Icon source="comment-question-outline" size={18} color="#FFFFFF" />
                                <Text style={styles.askQuestionBtnText}>View Frequently Asked Questions (FAQ)</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
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
        borderStyle: 'solid',
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
        borderStyle: 'solid',
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
        borderStyle: 'solid',
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
        borderStyle: 'solid',
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
