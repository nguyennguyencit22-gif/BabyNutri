import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from './AppIcon';
import StarRating from './StarRating';
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
    userRating: number;
    onRate: (score: number) => void;
    comments: ReviewPreviewComment[];
    commentInput: string;
    onChangeCommentInput: (text: string) => void;
    onSendComment: () => void;
    onPress: () => void;
};

// Compact "Ratings & Reviews" teaser for the bottom of a recipe/article
// detail page — headline score, the interactive tap-to-rate control, a
// "write a comment" box, and up to 2 comments. Tapping the header, a
// comment, or "See all reviews" opens the full breakdown + comment thread
// on the dedicated Reviews screen (RatingReviewSection); rating and posting
// a comment both happen in place without leaving the page.
const RatingSummaryPreview: React.FC<Props> = ({
    avgRating,
    ratingCount,
    userRating,
    onRate,
    comments,
    commentInput,
    onChangeCommentInput,
    onSendComment,
    onPress,
}) => {
    const { colors } = useAppTheme();
    const styles = React.useMemo(() => createStyles(colors), [colors]);
    const preview = comments.slice(0, 2);

    return (
        <View style={styles.card}>
            <TouchableOpacity style={styles.headerRow} onPress={onPress} activeOpacity={0.7}>
                <Text style={styles.sectionTitle}>Ratings & Reviews</Text>
                <View style={styles.scoreRow}>
                    <Icon source="star" size={16} color="#F59E0B" />
                    <Text style={styles.scoreText}>{avgRating > 0 ? avgRating.toFixed(1) : '—'}</Text>
                    <Text style={styles.countText}>({ratingCount})</Text>
                    <Icon source="chevron-right" size={18} color={colors.textSoft} />
                </View>
            </TouchableOpacity>

            <View style={styles.rateRow}>
                <Text style={styles.rateLabel}>
                    {userRating > 0 ? 'Your rating' : 'Tap a star to rate'}
                </Text>
                <StarRating
                    rating={avgRating}
                    userRating={userRating}
                    interactive
                    onRate={onRate}
                    showScoreText={false}
                    starSize={22}
                />
            </View>

            <View style={styles.divider} />

            <View style={styles.inputRow}>
                <TextInput
                    style={styles.commentInput}
                    placeholder="Write a comment..."
                    placeholderTextColor={colors.textSoft}
                    value={commentInput}
                    onChangeText={onChangeCommentInput}
                />
                <TouchableOpacity style={styles.sendBtn} onPress={onSendComment} activeOpacity={0.85}>
                    <Text style={styles.sendBtnText}>Send</Text>
                </TouchableOpacity>
            </View>

            {preview.length === 0 ? (
                <Text style={styles.emptyText}>No reviews yet. Be the first to share your thoughts!</Text>
            ) : (
                <View style={styles.commentsList}>
                    {preview.map((item) => (
                        <TouchableOpacity key={item.id} style={styles.commentRow} onPress={onPress} activeOpacity={0.7}>
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
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {ratingCount > 0 && (
                <TouchableOpacity style={styles.seeAllRow} onPress={onPress} activeOpacity={0.7}>
                    <Text style={styles.seeAllText}>See all {ratingCount} {ratingCount === 1 ? 'review' : 'reviews'}</Text>
                    <Icon source="chevron-right" size={16} color={colors.primary} />
                </TouchableOpacity>
            )}
        </View>
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
    },
    rateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 14,
    },
    rateLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.text,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginTop: 14,
        marginBottom: 14,
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
    inputRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 14,
    },
    commentInput: {
        flex: 1,
        backgroundColor: colors.surfaceAlt,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 14,
        color: colors.text,
    },
    sendBtn: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendBtnText: {
        color: colors.onPrimary,
        fontWeight: '700',
        fontSize: 14,
    },
    emptyText: {
        fontSize: 13,
        color: colors.textSoft,
        fontStyle: 'italic',
    },
    commentsList: {
        gap: 12,
    },
    commentRow: {
        flexDirection: 'row',
        gap: 12,
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
