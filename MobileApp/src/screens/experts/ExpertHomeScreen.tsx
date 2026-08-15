import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import Icon from '../../components/common/AppIcon';
import TopHeaderBar from '../../components/common/TopHeaderBar';
import { recipeService } from '../../services/recipe.service';
import { articleService } from '../../services/article.service';
import { useAppTheme } from '../../theme/useAppTheme';
import type { RootState } from '../../store/store';
import AdminManageExpertsModal from '../admin/AdminManageExpertsModal';
import AdminReportsModal from '../admin/AdminReportsModal';

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

// Dashboard shown instead of the Parent HomeScreen for Expert/Admin users.
const ExpertHomeScreen = ({ navigation }: any) => {
  const { colors, isDark } = useAppTheme();
  const user = useSelector((state: RootState) => state.auth.user);
  const sessionMode = useSelector((state: RootState) => state.auth.mode);
  const userRole = (user?.role || '').toLowerCase();
  const isAdmin = sessionMode === 'authenticated' && userRole === 'admin';

  const [showAdminExperts, setShowAdminExperts] = useState(false);
  const [showAdminReports, setShowAdminReports] = useState(false);

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
        {isAdmin ? (
          <View style={[styles.adminCard, { backgroundColor: isDark ? '#2D2235' : '#F5F3FF', borderColor: isDark ? '#4C3366' : '#DDD6FE' }]}>
            <View style={styles.adminCardHeader}>
              <Icon source="shield-account" size={20} color="#8B5CF6" />
              <Text style={[styles.adminCardTitle, { color: '#8B5CF6' }]}>Admin Control Center</Text>
            </View>
            <Text style={[styles.adminCardSub, { color: colors.textSoft }]}>
              Manage verified nutrition experts, assign roles, and inspect real-time platform statistics.
            </Text>
            <View style={styles.adminActionRow}>
              <TouchableOpacity
                style={[styles.adminBtn, { backgroundColor: '#8B5CF6' }]}
                onPress={() => setShowAdminExperts(true)}
                activeOpacity={0.85}
              >
                <Icon source="account-cog" size={16} color="#FFFFFF" />
                <Text style={styles.adminBtnText}>Manage Experts</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.adminBtn, { backgroundColor: isDark ? '#3D2F4E' : '#EDE9FE', borderWidth: 1, borderColor: '#8B5CF6' }]}
                onPress={() => setShowAdminReports(true)}
                activeOpacity={0.85}
              >
                <Icon source="chart-bar" size={16} color="#8B5CF6" />
                <Text style={[styles.adminBtnText, { color: '#8B5CF6' }]}>System Reports</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={[styles.missionCard, { backgroundColor: isDark ? '#3A2E31' : '#FFF0F2', borderColor: isDark ? '#4A3236' : '#FFE2E6' }]}>
            <Icon source="sparkles" size={18} color="#FF5F70" />
            <Text style={[styles.missionText, { color: isDark ? '#F3D9DC' : '#B8465A' }]}>
              Help parents build healthy eating habits for their babies with personalized nutrition guidance, balanced meal plans, and expert feeding support for every stage of growth.
            </Text>
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {isAdmin ? 'Platform Content & Highlights' : 'Highlights'}
        </Text>

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

      {isAdmin && (
        <>
          <AdminManageExpertsModal
            visible={showAdminExperts}
            onClose={() => setShowAdminExperts(false)}
          />
          <AdminReportsModal
            visible={showAdminReports}
            onClose={() => setShowAdminReports(false)}
          />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 18, paddingBottom: 100 },
  adminCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  adminCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  adminCardTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  adminCardSub: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  adminActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  adminBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
  },
  adminBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
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
