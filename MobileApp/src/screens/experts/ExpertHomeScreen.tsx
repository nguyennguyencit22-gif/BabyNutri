import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import Icon from '../../components/common/AppIcon';
import { recipeService } from '../../services/recipe.service';
import { articleService } from '../../services/article.service';
import type { RootState } from '../../store/store';
import { useAppTheme } from '../../theme/useAppTheme';

const RING_SIZE = 88;
const RING_STROKE = 8;

// Fixed-size ring badge — Svg dimensions here are plain numbers (not "100%"
// inside an auto-height View), which is the safe pattern for this app; see
// GradientButton/BabyNutriBackground for the same rule.
const StatRing = ({ value, label, color, onPress }: { value: string; label: string; color: string; onPress: () => void }) => {
  const { colors } = useAppTheme();
  const radius = (RING_SIZE - RING_STROKE) / 2;

  return (
    <TouchableOpacity style={styles.ringCol} onPress={onPress} activeOpacity={0.8}>
      <View style={{ width: RING_SIZE, height: RING_SIZE }}>
        <Svg width={RING_SIZE} height={RING_SIZE}>
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={radius}
            stroke={color}
            strokeWidth={RING_STROKE}
            fill="none"
          />
        </Svg>
        <View style={styles.ringCenter}>
          <Text style={[styles.ringValue, { color }]}>{value}</Text>
        </View>
      </View>
      <Text style={[styles.ringLabel, { color: colors.textSoft }]}>{label}</Text>
    </TouchableOpacity>
  );
};

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
        <View style={styles.headerRow}>
          <View style={[styles.avatarCircle, { backgroundColor: '#FF5F70' }]}>
            <Text style={styles.avatarLetter}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={[styles.greeting, { color: colors.textSoft }]}>Welcome back,</Text>
            <Text style={[styles.name, { color: colors.text }]}>{displayName}</Text>
          </View>
        </View>

        <View style={[styles.missionCard, { backgroundColor: isDark ? '#3A2E31' : '#FFF0F2', borderColor: isDark ? '#4A3236' : '#FFE2E6' }]}>
          <Icon source="sparkles" size={18} color="#FF5F70" />
          <Text style={[styles.missionText, { color: isDark ? '#F3D9DC' : '#B8465A' }]}>
            Help parents build healthy eating habits for their babies with personalized nutrition guidance, balanced meal plans, and expert feeding support for every stage of growth.
          </Text>
        </View>

        <View style={styles.ringRow}>
          <StatRing
            value={String(recipeCount)}
            label="Recipes"
            color="#FF5F70"
            onPress={() => navigation.navigate('MyContent', { initialTab: 'recipes' })}
          />
          <StatRing
            value={String(articleCount)}
            label="Articles"
            color="#EC4899"
            onPress={() => navigation.navigate('MyContent', { initialTab: 'articles' })}
          />
          <StatRing
            value={avgRating > 0 ? avgRating.toFixed(1) : '—'}
            label="Avg Rating"
            color="#F59E0B"
            onPress={() => navigation.navigate('ExpertFeedback')}
          />
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
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  avatarCircle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  greeting: { fontSize: 13, fontWeight: '600' },
  name: { fontSize: 20, fontWeight: '800' },
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
  ringRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  ringCol: { alignItems: 'center' },
  ringCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringValue: { fontSize: 20, fontWeight: '800' },
  ringLabel: { fontSize: 12, fontWeight: '600', marginTop: 8 },
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
