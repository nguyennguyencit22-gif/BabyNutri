import React, { useCallback, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { recipeService } from '../../services/recipe.service';
import type { RootState } from '../../store/store';
import RatingReviewSection from '../../components/common/RatingReviewSection';
import { useAppTheme } from '../../theme/useAppTheme';
import { appAlert } from '../../utils/appAlert';

type RatingBreakdown = { 5: number; 4: number; 3: number; 2: number; 1: number };
const EMPTY_BREAKDOWN: RatingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

// Full "Ratings & Reviews" page for a recipe — reached by tapping the
// compact RatingSummaryPreview on RecipeDetailScreen. Read-only breakdown +
// full comment thread (with delete); the interactive tap-to-rate control
// and "write a comment" input both live on the compact preview instead,
// alongside the 2-comment teaser.
const RecipeReviewsScreen = ({ route }: any) => {
  const { colors } = useAppTheme();
  const id = Number(route?.params?.id);

  const user = useSelector((state: RootState) => state.auth.user);
  const currentUserName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Parent');

  const [avgRating, setAvgRating] = useState<number>(0);
  const [ratingCount, setRatingCount] = useState<number>(0);
  const [ratingBreakdown, setRatingBreakdown] = useState<RatingBreakdown>(EMPTY_BREAKDOWN);
  const [comments, setComments] = useState<Awaited<ReturnType<typeof recipeService.getComments>>>([]);

  const loadRatingData = useCallback(async () => {
    try {
      const summary = await recipeService.getRatingSummary(id);
      setAvgRating(Number(summary.averageRating) || 0);
      setRatingCount(Number(summary.totalRatings) || 0);
      setRatingBreakdown(summary.breakdown || EMPTY_BREAKDOWN);
    } catch (e) {
      console.error('Load recipe rating error:', e);
      setAvgRating(0);
      setRatingCount(0);
      setRatingBreakdown(EMPTY_BREAKDOWN);
    }
  }, [id]);

  const loadComments = useCallback(async () => {
    try {
      const list = await recipeService.getComments(id);
      setComments(list);
    } catch (e) {
      console.error('Load recipe comments error:', e);
      setComments([]);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadRatingData();
      loadComments();
    }, [loadRatingData, loadComments])
  );

  const handleDeleteComment = (commentId: number) => {
    appAlert.show(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await recipeService.deleteComment(id, commentId);
              await loadComments();
            } catch (e) {
              console.error('Delete recipe comment error:', e);
              Alert.alert('Error', 'Unable to delete this comment right now.');
            }
          },
        },
      ],
      'warning',
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.content}>
        <RatingReviewSection
          avgRating={avgRating}
          ratingCount={ratingCount}
          breakdown={ratingBreakdown}
          comments={comments.map((item) => ({
            id: item.id,
            userName: item.userName,
            avatar: item.avatar,
            content: item.content,
            time: new Date(item.createdAt).toLocaleDateString(),
            canEdit: false,
            canDelete: item.userName === currentUserName,
          }))}
          onDeleteComment={(commentId) => handleDeleteComment(Number(commentId))}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: { padding: 18 },
});

export default RecipeReviewsScreen;
