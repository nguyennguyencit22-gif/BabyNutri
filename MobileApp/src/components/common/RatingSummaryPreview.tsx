import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from './AppIcon';
import { useAppTheme } from '../../theme/useAppTheme';
import type { AppColors } from '../../theme/colors';

export type ReviewPreviewComment = {
    id: number | string;
    userName: string;
    avatar?: string | null;
    content: string;
    time: string;
};

type Props = {
    avgRating: number;
    ratingCount: number;
    comments: ReviewPreviewComment[];
    onPress: () => void;
};

// Compact "Ratings & Reviews" teaser for the bottom of a recipe/article
// detail page — just the headline score + up to 2 comments. Tapping it
// (or "See all reviews") opens the full breakdown + comment thread on the
// dedicated Reviews screen (RatingReviewSection).
const RatingSummaryPreview: React.FC<Props> = ({ avgRating, ratingCount, comments, onPress }) => {
    const { colors } = useAppTheme();
    const styles = React.useMemo(() => createStyles(colors), [colors]);
    const preview = comments.slice(0, 2);

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
            <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>Ratings & Reviews</Text>
                <View style={styles.scoreRow}>
                    <Icon source="star" size={16} color="#F59E0B" />
                    <Text style={styles.scoreText}>{avgRating > 0 ? avgRating.toFixed(1) : '—'}</Text>
                    <Text style={styles.countText}>({ratingCount})</Text>
                    <Icon source="chevron-right" size={18} color={colors.textSoft} />
                </View>
            </View>

            {preview.length === 0 ? (
                <Text style={styles.emptyText}>No reviews yet. Be the first to share your thoughts!</Text>
            ) : (
                preview.map((item) => (
                    <View key={item.id} style={styles.commentRow}>
                        {item.avatar ? (
                            <Image source={{ uri: item.avatar }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.avatarFallback]}>
                                <Text style={styles.avatarLetter}>{item.userName.charAt(0).toUpperCase()}</Text>
                            </View>
                        )}
                        <View style={styles.commentBody}>
                            <View style={styles.commentHeaderRow}>
                                <Text style={styles.commentUser}>{item.userName}</Text>
                                <Text style={styles.commentTime}>{item.time}</Text>
                            </View>
                            <Text style={styles.commentText} numberOfLines={2}>{item.content}</Text>
                        </View>
                    </View>
                ))
            )}

            {ratingCount > 0 && (
                <View style={styles.seeAllRow}>
                    <Text style={styles.seeAllText}>See all {ratingCount} {ratingCount === 1 ? 'review' : 'reviews'}</Text>
                    <Icon source="chevron-right" size={16} color={colors.primary} />
                </View>
            )}
        </TouchableOpacity>
    );
};

const createStyles = (colors: AppColors) => StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 18,
        marginTop: 8,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: colors.text,
    },
    scoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    scoreText: {
        fontSize: 15,
        fontWeight: '800',
        color: colors.text,
    },
    countText: {
        fontSize: 13,
        color: colors.textSoft,
        marginRight: 2,
    },
    emptyText: {
        fontSize: 13,
        color: colors.textSoft,
        fontStyle: 'italic',
    },
    commentRow: {
        flexDirection: 'row',
        gap: 12,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    avatarFallback: {
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarLetter: {
        color: colors.onPrimary,
        fontWeight: '700',
        fontSize: 13,
    },
    commentBody: {
        flex: 1,
    },
    commentHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    commentUser: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.text,
    },
    commentTime: {
        fontSize: 11,
        color: colors.textSoft,
    },
    commentText: {
        fontSize: 13,
        color: colors.textSoft,
        lineHeight: 18,
    },
    seeAllRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    seeAllText: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.primary,
    },
});

export default RatingSummaryPreview;
