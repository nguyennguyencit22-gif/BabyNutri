import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from './AppIcon';
import { useAppTheme } from '../../theme/useAppTheme';
import type { AppColors } from '../../theme/colors';

export type ReviewComment = {
    id: number | string;
    userName: string;
    avatar?: string | null;
    content: string;
    time: string;
    canEdit?: boolean;
    canDelete?: boolean;
};

type Props = {
    avgRating: number;
    ratingCount: number;
    breakdown: { 5: number; 4: number; 3: number; 2: number; 1: number };
    comments: ReviewComment[];
    commentInput: string;
    onChangeCommentInput: (text: string) => void;
    onSendComment: () => void;
    onEditComment?: (id: number | string, currentText: string) => void;
    onDeleteComment?: (id: number | string) => void;
};

// Shared "Rating & Reviews" detail block — a summary card (big score + star
// breakdown bars) followed by the full comment thread. The interactive
// tap-to-rate control lives on the compact RatingSummaryPreview instead, so
// this component is read-only display + comments.
const RatingReviewSection: React.FC<Props> = ({
    avgRating,
    ratingCount,
    breakdown,
    comments,
    commentInput,
    onChangeCommentInput,
    onSendComment,
    onEditComment,
    onDeleteComment,
}) => {
    const { colors } = useAppTheme();
    const styles = React.useMemo(() => createStyles(colors), [colors]);

    const maxCount = Math.max(1, breakdown[5], breakdown[4], breakdown[3], breakdown[2], breakdown[1]);

    return (
        <View style={styles.card}>
            <Text style={styles.sectionTitle}>Ratings & Reviews</Text>

            <View style={styles.summaryRow}>
                <View style={styles.summaryLeft}>
                    <Text style={styles.bigScore}>{avgRating > 0 ? avgRating.toFixed(1) : '—'}</Text>
                    <View style={styles.bigStarsRow}>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Icon
                                key={i}
                                source={i < Math.round(avgRating) ? 'star' : 'star-outline'}
                                size={16}
                                color="#F59E0B"
                            />
                        ))}
                    </View>
                    <Text style={styles.reviewCountText}>{ratingCount} {ratingCount === 1 ? 'review' : 'reviews'}</Text>
                </View>

                <View style={styles.summaryRight}>
                    {([5, 4, 3, 2, 1] as const).map((star) => {
                        const count = breakdown[star] || 0;
                        const pct = Math.round((count / maxCount) * 100);
                        return (
                            <View key={star} style={styles.breakdownRow}>
                                <Text style={styles.breakdownLabel}>{star}</Text>
                                <Icon source="star" size={11} color="#F59E0B" />
                                <View style={styles.barTrack}>
                                    <View style={[styles.barFill, { width: `${pct}%` }]} />
                                </View>
                                <Text style={styles.breakdownCount}>{count}</Text>
                            </View>
                        );
                    })}
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.commentTitleBox}>
                <Icon source="comment-outline" size={18} color={colors.text} />
                <Text style={styles.commentHeader}>Comments ({comments.length})</Text>
            </View>

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

            {comments.length === 0 ? (
                <Text style={styles.emptyCommentText}>No comments yet. Be the first to share your thoughts!</Text>
            ) : (
                comments.map((item) => (
                    <View key={item.id} style={styles.commentBox}>
                        {item.avatar ? (
                            <Image source={{ uri: item.avatar }} style={styles.commentAvatar} />
                        ) : (
                            <View style={[styles.commentAvatar, styles.commentAvatarFallback]}>
                                <Text style={styles.commentAvatarLetter}>{item.userName.charAt(0).toUpperCase()}</Text>
                            </View>
                        )}
                        <View style={styles.commentContentBox}>
                            <View style={styles.commentHeaderRow}>
                                <Text style={styles.commentUser}>{item.userName}</Text>
                                <Text style={styles.commentTime}>{item.time}</Text>
                            </View>
                            <Text style={styles.commentText}>{item.content}</Text>

                            {(item.canEdit || item.canDelete) && (
                                <View style={styles.commentOwnerControls}>
                                    {item.canEdit && onEditComment && (
                                        <TouchableOpacity onPress={() => onEditComment(item.id, item.content)}>
                                            <Text style={styles.controlEditText}>Edit</Text>
                                        </TouchableOpacity>
                                    )}
                                    {item.canEdit && item.canDelete && <Text style={styles.controlDot}>·</Text>}
                                    {item.canDelete && onDeleteComment && (
                                        <TouchableOpacity onPress={() => onDeleteComment(item.id)}>
                                            <Text style={styles.controlDeleteText}>Delete</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                        </View>
                    </View>
                ))
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
    sectionTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: colors.text,
        marginBottom: 14,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 18,
    },
    summaryLeft: {
        alignItems: 'center',
        width: 84,
    },
    bigScore: {
        fontSize: 36,
        fontWeight: '800',
        color: colors.primary,
    },
    bigStarsRow: {
        flexDirection: 'row',
        gap: 2,
        marginTop: 4,
    },
    reviewCountText: {
        fontSize: 12,
        color: colors.textSoft,
        marginTop: 6,
        textAlign: 'center',
    },
    summaryRight: {
        flex: 1,
        gap: 6,
    },
    breakdownRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    breakdownLabel: {
        fontSize: 12,
        color: colors.textSoft,
        width: 10,
    },
    barTrack: {
        flex: 1,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.surfaceAlt,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 3,
        backgroundColor: colors.primary,
    },
    breakdownCount: {
        fontSize: 12,
        color: colors.textSoft,
        width: 22,
        textAlign: 'right',
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 16,
    },
    commentTitleBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    commentHeader: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.text,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
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
    emptyCommentText: {
        fontSize: 13,
        color: colors.textSoft,
        fontStyle: 'italic',
        marginVertical: 6,
    },
    commentBox: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
        backgroundColor: colors.surfaceAlt,
        padding: 12,
        borderRadius: 14,
    },
    commentAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    commentAvatarFallback: {
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    commentAvatarLetter: {
        color: colors.onPrimary,
        fontWeight: '700',
        fontSize: 14,
    },
    commentContentBox: {
        flex: 1,
    },
    commentHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
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
        fontSize: 14,
        color: colors.text,
        lineHeight: 20,
    },
    commentOwnerControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 6,
    },
    controlEditText: {
        fontSize: 12,
        color: colors.primary,
        fontWeight: '600',
    },
    controlDeleteText: {
        fontSize: 12,
        color: colors.danger,
        fontWeight: '600',
    },
    controlDot: {
        fontSize: 12,
        color: colors.textSoft,
    },
});

export default RatingReviewSection;
