import React, { useCallback, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity, Text, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from '../../components/common/AppIcon';
import { recipeService } from '../../services/recipe.service';
import type { RootState } from '../../store/store';
import RatingReviewSection from '../../components/common/RatingReviewSection';
import { useAppTheme } from '../../theme/useAppTheme';
import { appAlert } from '../../utils/appAlert';

type RatingBreakdown = { 5: number; 4: number; 3: number; 2: number; 1: number };
const EMPTY_BREAKDOWN: RatingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

// Full "Ratings & Reviews" page for a recipe — reached by tapping the
// compact RatingSummaryPreview on RecipeDetailScreen.
const RecipeReviewsScreen = ({ route, navigation }: any) => {
  const { colors, isDark } = useAppTheme();
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <View style={[styles.headerBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon source="arrow-left" size={20} color="#FF6B4A" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Recipe Reviews</Text>
        <View style={{ width: 36 }} />
      </View>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  content: { padding: 18 },
});

export default RecipeReviewsScreen;
