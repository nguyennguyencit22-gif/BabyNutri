import React, { useCallback, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, StatusBar, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '../../components/common/AppIcon';
import { recipeService } from '../../services/recipe.service';
import type { MyRecipeItem } from '../../services/recipe.service';
import { getRecipeImage } from '../../constants/recipeImages';
import { useAppTheme } from '../../theme/useAppTheme';

// "View Feedback / Ratings": an Expert's own recipes ranked by rating, with
// an overall rollup at the top. Article feedback isn't included — article
// ratings/comments are stored locally per-device (AsyncStorage), so there's
// no central data to aggregate here yet.
const ExpertFeedbackScreen = ({ navigation }: any) => {
  const { colors, isDark } = useAppTheme();
  const [recipes, setRecipes] = useState<MyRecipeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFeedback = useCallback(async () => {
    setLoading(true);
    try {
      const mine = await recipeService.getMine();
      const sorted = [...mine].sort((a, b) => b.ratingCount - a.ratingCount || b.avgRating - a.avgRating);
      setRecipes(sorted);
    } catch (e) {
      console.error('Load expert feedback error:', e);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFeedback();
    }, [loadFeedback])
  );

  const totalRatings = recipes.reduce((sum, r) => sum + r.ratingCount, 0);
  const totalComments = recipes.reduce((sum, r) => sum + r.commentCount, 0);
  const ratedRecipes = recipes.filter((r) => r.ratingCount > 0);
  const overallAvg = ratedRecipes.length > 0
    ? ratedRecipes.reduce((sum, r) => sum + r.avgRating * r.ratingCount, 0) / totalRatings
    : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <View style={styles.headerBox}>
        <View style={styles.titleRow}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Icon source="arrow-left" size={20} color="#FF6B4A" />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Feedback & Ratings</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF7A59" />
        </View>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryValue}>{overallAvg > 0 ? overallAvg.toFixed(1) : '—'}</Text>
                <Text style={[styles.summaryLabel, { color: colors.textSoft }]}>Avg Rating</Text>
              </View>
              <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
              <View style={styles.summaryStat}>
                <Text style={styles.summaryValue}>{totalRatings}</Text>
                <Text style={[styles.summaryLabel, { color: colors.textSoft }]}>Total Ratings</Text>
              </View>
              <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
              <View style={styles.summaryStat}>
                <Text style={styles.summaryValue}>{totalComments}</Text>
                <Text style={[styles.summaryLabel, { color: colors.textSoft }]}>Comments</Text>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => navigation.navigate('RecipeReviews', { id: item.id, name: item.name })}
              activeOpacity={0.85}
            >
              <Image source={getRecipeImage(item.id, item.image_url)} style={styles.thumb} />
              <View style={styles.cardInfo}>
                <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>{item.name}</Text>
                <View style={styles.statsRow}>
                  <Icon source="star" size={13} color="#F59E0B" />
                  <Text style={[styles.statsText, { color: colors.textSoft }]}>
                    {item.avgRating > 0 ? item.avgRating.toFixed(1) : '—'} ({item.ratingCount})
                  </Text>
                  <Icon source="comment-outline" size={13} color={colors.textSoft} />
                  <Text style={[styles.statsText, { color: colors.textSoft }]}>{item.commentCount}</Text>
                </View>
              </View>
              <Icon source="chevron-right" size={20} color={colors.textSoft} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Icon source="star-outline" size={40} color={colors.textSoft} />
              <Text style={[styles.emptyText, { color: colors.text }]}>No feedback yet — create a recipe to start collecting ratings.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 10;

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBox: { paddingHorizontal: 16, paddingTop: statusBarHeight + 10, paddingBottom: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 22, fontWeight: '800' },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  summaryCard: {
    flexDirection: 'row',
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 16,
    marginBottom: 16,
  },
  summaryStat: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1 },
  summaryValue: { fontSize: 20, fontWeight: '800', color: '#FF5F70' },
  summaryLabel: { fontSize: 11, marginTop: 4 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  thumb: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#EEE', marginRight: 12 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statsText: { fontSize: 12, marginRight: 8 },
  emptyBox: { alignItems: 'center', marginTop: 60, gap: 8, paddingHorizontal: 20 },
  emptyText: { fontSize: 15, fontWeight: '700', textAlign: 'center' },
});

export default ExpertFeedbackScreen;
