import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/common/AppIcon';
import TopHeaderBar from '../../components/common/TopHeaderBar';
import { recipeService } from '../../services/recipe.service';
import { articleService } from '../../services/article.service';
import { useAppTheme } from '../../theme/useAppTheme';

const isThisMonth = (dateStr?: string | null) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
};

// Apple Health "Highlights"-style card — icon + title, a one-line summary,
// then an All Time vs This Month pair of numbers. Each card is tappable and
// jumps to the relevant detail list.
const HighlightCard = ({
  iconSource,
  iconColor,
  title,
  description,
  allTimeValue,
  monthValue,
  unit,
  onPress,
}: {
  iconSource: string;
  iconColor: string;
  title: string;
  description: string;
  allTimeValue: number | string;
  monthValue: number | string;
  unit: string;
  onPress: () => void;
}) => {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.cardHeader}>
        <Icon source={iconSource} size={16} color={iconColor} />
        <Text style={[styles.cardTitle, { color: iconColor }]}>{title}</Text>
        <View style={{ flex: 1 }} />
        <Icon source="chevron-right" size={18} color={colors.textSoft} />
      </View>

      <Text style={[styles.cardDescription, { color: colors.text }]}>{description}</Text>

      <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />

      <View style={styles.cardStatsRow}>
        <View style={styles.cardStatCol}>
          <View style={styles.cardStatLabelRow}>
            <View style={[styles.dot, { backgroundColor: iconColor }]} />
            <Text style={[styles.cardStatLabel, { color: colors.textSoft }]}>All Time</Text>
          </View>
          <Text style={[styles.cardStatValue, { color: colors.text }]}>
            {allTimeValue} <Text style={[styles.cardStatUnit, { color: colors.textSoft }]}>{unit}</Text>
          </Text>
        </View>
        <View style={styles.cardStatCol}>
          <View style={styles.cardStatLabelRow}>
            <View style={[styles.dot, { backgroundColor: colors.border }]} />
            <Text style={[styles.cardStatLabel, { color: colors.textSoft }]}>This Month</Text>
          </View>
          <Text style={[styles.cardStatValue, { color: colors.text }]}>
            {monthValue} <Text style={[styles.cardStatUnit, { color: colors.textSoft }]}>{unit}</Text>
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Dashboard shown for Expert users.
const ExpertHomeScreen = ({ navigation }: any) => {
  const { colors, isDark } = useAppTheme();

  const [recipeTotal, setRecipeTotal] = useState(0);
  const [recipeThisMonth, setRecipeThisMonth] = useState(0);
  const [articleTotal, setArticleTotal] = useState(0);
  const [articleThisMonth, setArticleThisMonth] = useState(0);
  const [ratingTotal, setRatingTotal] = useState(0);
  const [ratingThisMonth, setRatingThisMonth] = useState(0);
  const [avgRating, setAvgRating] = useState(0);

  const loadStats = useCallback(async () => {
    try {
      const [recipes, articles] = await Promise.all([
        recipeService.getMine().catch(() => []),
        articleService.getMine().catch(() => []),
      ]);

      setRecipeTotal(recipes.length);
      setRecipeThisMonth(recipes.filter((r) => isThisMonth(r.created_at)).length);

      setArticleTotal(articles.length);
      setArticleThisMonth(articles.filter((a) => isThisMonth(a.published_date)).length);

      setRatingTotal(recipes.reduce((sum, r) => sum + r.ratingCount, 0));
      setRatingThisMonth(recipes.reduce((sum, r) => sum + r.ratingCountThisMonth, 0));

      const rated = recipes.filter((r) => r.ratingCount > 0);
      const totalRatings = rated.reduce((sum, r) => sum + r.ratingCount, 0);
      setAvgRating(totalRatings > 0
        ? rated.reduce((sum, r) => sum + r.avgRating * r.ratingCount, 0) / totalRatings
        : 0);
    } catch (e) {
      console.error('Load expert stats error:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right', 'bottom']}>
      <TopHeaderBar />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.missionCard, { backgroundColor: isDark ? '#3A2E31' : '#FFF0F2', borderColor: isDark ? '#4A3236' : '#FFE2E6' }]}>
          <Icon source="sparkles" size={18} color="#FF5F70" />
          <Text style={[styles.missionText, { color: isDark ? '#F3D9DC' : '#B8465A' }]}>
            Help parents build healthy eating habits for their babies with personalized nutrition guidance, balanced meal plans, and expert feeding support for every stage of growth.
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Highlights</Text>

        <HighlightCard
          iconSource="bowl-mix-outline"
          iconColor="#FF5F70"
          title="Recipes"
          description={recipeTotal > 0
            ? `You've shared ${recipeTotal} recipe${recipeTotal === 1 ? '' : 's'} with parents so far.`
            : "You haven't published any recipes yet — create your first one!"}
          allTimeValue={recipeTotal}
          monthValue={recipeThisMonth}
          unit="recipes"
          onPress={() => navigation.navigate('MyContent', { initialTab: 'recipes' })}
        />

        <HighlightCard
          iconSource="text-box-outline"
          iconColor="#EC4899"
          title="Articles"
          description={articleTotal > 0
            ? `Your nutrition articles help parents make better choices.`
            : "You haven't published any articles yet — share your expertise!"}
          allTimeValue={articleTotal}
          monthValue={articleThisMonth}
          unit="articles"
          onPress={() => navigation.navigate('MyContent', { initialTab: 'articles' })}
        />

        <HighlightCard
          iconSource="star"
          iconColor="#F59E0B"
          title="Ratings"
          description={ratingTotal > 0
            ? `Parents rate your recipes ${avgRating.toFixed(1)} / 5 on average.`
            : 'No ratings yet — they\'ll show up here once parents rate your recipes.'}
          allTimeValue={ratingTotal}
          monthValue={ratingThisMonth}
          unit="ratings"
          onPress={() => navigation.navigate('ExpertFeedback')}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 18, paddingBottom: 100 },
  missionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
  },
  missionText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12 },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  cardTitle: { fontSize: 14, fontWeight: '800' },
  cardDescription: { fontSize: 13, lineHeight: 19, fontWeight: '500' },
  cardDivider: { height: 1, marginVertical: 14 },
  cardStatsRow: { flexDirection: 'row' },
  cardStatCol: { flex: 1 },
  cardStatLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  cardStatLabel: { fontSize: 12, fontWeight: '600' },
  cardStatValue: { fontSize: 20, fontWeight: '800' },
  cardStatUnit: { fontSize: 12, fontWeight: '600' },
});

export default ExpertHomeScreen;
