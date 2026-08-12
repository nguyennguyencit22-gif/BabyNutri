import React, { useCallback, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { recipeService } from '../../services/recipe.service';
import type { RootState } from '../../store/store';
import { addActivity } from '../../store/historySlice';
import RatingReviewSection from '../../components/common/RatingReviewSection';
import { useAppTheme } from '../../theme/useAppTheme';
import { appAlert } from '../../utils/appAlert';

type RatingBreakdown = { 5: number; 4: number; 3: number; 2: number; 1: number };
const EMPTY_BREAKDOWN: RatingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

// Full "Ratings & Reviews" page for a recipe — reached by tapping the
// compact RatingSummaryPreview on RecipeDetailScreen. Owns the rate/comment
// read-write logic that used to live inline on the detail screen.
const RecipeReviewsScreen = ({ route, navigation }: any) => {
  const { colors } = useAppTheme();
  const id = Number(route?.params?.id);
  const recipeName = route?.params?.name || 'Recipe';

  const authMode = useSelector((state: RootState) => state.auth.mode);
  const user = useSelector((state: RootState) => state.auth.user);
  const currentUserName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Parent');
  const dispatch = useDispatch();

  const [userRating, setUserRating] = useState<number>(0);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [ratingCount, setRatingCount] = useState<number>(0);
  const [ratingBreakdown, setRatingBreakdown] = useState<RatingBreakdown>(EMPTY_BREAKDOWN);
  const [comments, setComments] = useState<Awaited<ReturnType<typeof recipeService.getComments>>>([]);
  const [commentInput, setCommentInput] = useState('');

  const loadRatingData = useCallback(async () => {
    try {
      const summary = await recipeService.getRatingSummary(id);
      setAvgRating(Number(summary.averageRating) || 0);
      setRatingCount(Number(summary.totalRatings) || 0);
      setRatingBreakdown(summary.breakdown || EMPTY_BREAKDOWN);

      if (authMode === 'authenticated') {
        const mine = await recipeService.getMyRating(id);
        setUserRating(mine.rating || 0);
      } else {
        setUserRating(0);
      }
    } catch (e) {
      console.error('Load recipe rating error:', e);
      setUserRating(0);
      setAvgRating(0);
      setRatingCount(0);
      setRatingBreakdown(EMPTY_BREAKDOWN);
    }
  }, [id, authMode]);

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

  const saveRatingData = async (newScore: number) => {
    if (authMode === 'guest') {
      navigation.navigate('Login');
      return;
    }

    try {
      await recipeService.submitRating(id, newScore);
      const summary = await recipeService.getRatingSummary(id);

      setUserRating(newScore);
      setAvgRating(Number(summary.averageRating) || 0);
      setRatingCount(Number(summary.totalRatings) || 0);
      setRatingBreakdown(summary.breakdown || EMPTY_BREAKDOWN);

      dispatch(addActivity({
        type: 'rate',
        title: `Rated recipe ${newScore}⭐: ${recipeName}`,
        details: `Average rating: ${summary.averageRating}⭐ (${summary.totalRatings} rating${summary.totalRatings > 1 ? 's' : ''})`,
        icon: '⭐',
      }));

      appAlert.show(
        'Evaluation Saved',
        `You rated "${recipeName}" ${newScore} out of 5 stars!\nAverage score: ${summary.averageRating} ⭐ (${summary.totalRatings} rating${summary.totalRatings > 1 ? 's' : ''})`,
        undefined,
        'star',
      );
    } catch (e) {
      console.error('Save recipe rating error:', e);
      Alert.alert('Error', 'Unable to save your rating right now.');
    }
  };

  // Comments require an account, same gate as rating — guests are sent
  // straight to Login rather than shown a popup.
  const handleAddComment = async () => {
    const text = commentInput.trim();
    if (!text) return;

    if (authMode === 'guest') {
      navigation.navigate('Login');
      return;
    }

    try {
      await recipeService.addComment(id, text);
      setCommentInput('');
      await loadComments();

      dispatch(addActivity({
        type: 'action',
        title: `Commented on recipe: ${recipeName}`,
        details: text,
        icon: '💬',
      }));
    } catch (e) {
      console.error('Add recipe comment error:', e);
      Alert.alert('Error', 'Unable to post your comment right now.');
    }
  };

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
          userRating={userRating}
          onRate={saveRatingData}
          comments={comments.map((item) => ({
            id: item.id,
            userName: item.userName,
            avatar: item.avatar,
            content: item.content,
            time: new Date(item.createdAt).toLocaleDateString(),
            canEdit: false,
            canDelete: item.userName === currentUserName,
          }))}
          commentInput={commentInput}
          onChangeCommentInput={setCommentInput}
          onSendComment={handleAddComment}
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
