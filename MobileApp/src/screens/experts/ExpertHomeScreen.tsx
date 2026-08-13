import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import Icon from '../../components/common/AppIcon';
import { recipeService } from '../../services/recipe.service';
import { articleService } from '../../services/article.service';
import type { RootState } from '../../store/store';
import { useAppTheme } from '../../theme/useAppTheme';

// Dashboard shown instead of the Parent HomeScreen for Expert/Admin users.
// Expert accounts don't track a baby, so the journey/recipe-browsing home
// doesn't apply to them — this is their entry point into "Create & Manage
// Content" and "View Feedback / Ratings" instead.
const ExpertHomeScreen = ({ navigation }: any) => {
  const { colors, isDark } = useAppTheme();
  const user = useSelector((state: RootState) => state.auth.user);
  const displayName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Expert');

  const [recipeCount, setRecipeCount] = useState(0);
  const [articleCount, setArticleCount] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [bannerSize, setBannerSize] = useState({ width: 0, height: 0 });

  const loadStats = useCallback(async () => {
    try {
      const [recipes, articles] = await Promise.all([
        recipeService.getMine().catch(() => []),
        articleService.getMine().catch(() => []),
      ]);
      setRecipeCount(recipes.length);
      setArticleCount(articles.length);
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroShadowWrap}>
          <View
            style={styles.heroBanner}
            onLayout={(e) => {
              const { width, height } = e.nativeEvent.layout;
              setBannerSize({ width, height });
            }}
          >
            {bannerSize.width > 0 && bannerSize.height > 0 && (
              <Svg width={bannerSize.width} height={bannerSize.height} style={StyleSheet.absoluteFill}>
                <Defs>
                  <LinearGradient id="expertHeroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#FF6B8A" />
                    <Stop offset="55%" stopColor="#E23F72" />
                    <Stop offset="100%" stopColor="#8E1E52" />
                  </LinearGradient>
                </Defs>
                <Rect width={bannerSize.width} height={bannerSize.height} fill="url(#expertHeroGradient)" />
              </Svg>
            )}

            <Text style={styles.heroGreeting}>Welcome back, {displayName}</Text>
            <Text style={styles.heroDescription}>
              Help parents build healthy eating habits for their babies with personalized nutrition guidance, balanced meal plans, and expert feeding support for every stage of growth.
            </Text>
          </View>
        </View>

        <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{recipeCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textSoft }]}>Recipes</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{articleCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textSoft }]}>Articles</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{avgRating > 0 ? avgRating.toFixed(1) : '—'}</Text>
            <Text style={[styles.statLabel, { color: colors.textSoft }]}>Avg Rating</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Expert Tools</Text>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.navigate('MyContent')}
          activeOpacity={0.85}
        >
          <View style={[styles.actionIconCircle, { backgroundColor: isDark ? '#3A2E31' : '#FFF0F2' }]}>
            <Icon source="pencil" size={22} color="#FF5F70" />
          </View>
          <View style={styles.actionTextGroup}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Manage My Content</Text>
            <Text style={[styles.actionSubtitle, { color: colors.textSoft }]}>Create, edit and remove your recipes & articles</Text>
          </View>
          <Icon source="chevron-right" size={20} color={colors.textSoft} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.navigate('ExpertFeedback')}
          activeOpacity={0.85}
        >
          <View style={[styles.actionIconCircle, { backgroundColor: isDark ? '#3A2E31' : '#FFF0F2' }]}>
            <Icon source="star" size={22} color="#F59E0B" />
          </View>
          <View style={styles.actionTextGroup}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Feedback & Ratings</Text>
            <Text style={[styles.actionSubtitle, { color: colors.textSoft }]}>See how parents are rating your recipes</Text>
          </View>
          <Icon source="chevron-right" size={20} color={colors.textSoft} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 10;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 18, paddingTop: statusBarHeight ? 8 : 18, paddingBottom: 100 },
  heroShadowWrap: {
    borderRadius: 22,
    marginBottom: 20,
    shadowColor: '#8E1E52',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  heroBanner: {
    borderRadius: 22,
    padding: 20,
    overflow: 'hidden',
  },
  heroGreeting: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255, 255, 255, 0.92)',
  },
  statsCard: {
    flexDirection: 'row',
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 16,
    marginBottom: 24,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1 },
  statValue: { fontSize: 20, fontWeight: '800', color: '#FF5F70' },
  statLabel: { fontSize: 11, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12 },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    gap: 14,
  },
  actionIconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  actionTextGroup: { flex: 1 },
  actionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  actionSubtitle: { fontSize: 12 },
});

export default ExpertHomeScreen;
