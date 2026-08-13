import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/common/AppIcon';
import { recipeService } from '../../services/recipe.service';
import { articleService } from '../../services/article.service';
import type { RootState } from '../../store/store';
import { useAppTheme } from '../../theme/useAppTheme';

import AdminManageExpertsModal from '../admin/AdminManageExpertsModal';
import AdminReportsModal from '../admin/AdminReportsModal';

// Dashboard shown instead of the Parent HomeScreen for Expert/Admin users.
// Expert accounts don't track a baby, so the journey/recipe-browsing home
// doesn't apply to them — this is their entry point into "Create & Manage
// Content" and "View Feedback / Ratings" instead.
const ExpertHomeScreen = ({ navigation }: any) => {
  const { colors, isDark } = useAppTheme();
  const user = useSelector((state: RootState) => state.auth.user);
  const displayName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'User');
  const isAdmin = (user?.role || '').toLowerCase() === 'admin';

  const [recipeCount, setRecipeCount] = useState(0);
  const [articleCount, setArticleCount] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [adminModalVisible, setAdminModalVisible] = useState(false);
  const [reportsModalVisible, setReportsModalVisible] = useState(false);

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
          <View style={[styles.avatarCircle, { backgroundColor: isAdmin ? '#8B5CF6' : '#FF5F70' }]}>
            <Text style={styles.avatarLetter}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={[styles.greeting, { color: colors.textSoft }]}>
              {isAdmin ? 'System Administrator' : 'Welcome back,'}
            </Text>
            <Text style={[styles.name, { color: colors.text }]}>{displayName}</Text>
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

        {isAdmin ? (
          <>
            {/* ADMIN SYSTEM DASHBOARD - ACCOUNT & USER MANAGEMENT ONLY */}
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 10 }]}>Account & User Management</Text>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setAdminModalVisible(true)}
              activeOpacity={0.85}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: isDark ? '#2E2836' : '#F3E8FF' }]}>
                <Icon source="account-supervisor" size={22} color="#8B5CF6" />
              </View>
              <View style={styles.actionTextGroup}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>Manage User & Expert Accounts</Text>
                <Text style={[styles.actionSubtitle, { color: colors.textSoft }]}>View, elevate, edit roles & manage user profiles</Text>
              </View>
              <Icon source="chevron-right" size={20} color={colors.textSoft} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setReportsModalVisible(true)}
              activeOpacity={0.85}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF' }]}>
                <Icon source="chart-line" size={22} color="#3B82F6" />
              </View>
              <View style={styles.actionTextGroup}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>System Reports & Statistics</Text>
                <Text style={[styles.actionSubtitle, { color: colors.textSoft }]}>View system-wide user counts, role distribution & metrics</Text>
              </View>
              <Icon source="chevron-right" size={20} color={colors.textSoft} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* EXPERT DASHBOARD - CONTENT & CONSULTATION TOOLS ONLY */}
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 10 }]}>Content Tools</Text>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => navigation.navigate('MyContent')}
              activeOpacity={0.85}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: isDark ? '#3A2E31' : '#FFF0F2' }]}>
                <Icon source="pencil" size={22} color="#FF5F70" />
              </View>
              <View style={styles.actionTextGroup}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>Manage Content</Text>
                <Text style={[styles.actionSubtitle, { color: colors.textSoft }]}>Create, edit and remove recipes & articles</Text>
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
                <Text style={[styles.actionSubtitle, { color: colors.textSoft }]}>View parent reviews & reply to comments</Text>
              </View>
              <Icon source="chevron-right" size={20} color={colors.textSoft} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => navigation.navigate('ExpertQuestions')}
              activeOpacity={0.85}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: isDark ? '#3A2E31' : '#FFF0F2' }]}>
                <Icon source="help-circle" size={22} color="#10B981" />
              </View>
              <View style={styles.actionTextGroup}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>Q&A & FAQ Management</Text>
                <Text style={[styles.actionSubtitle, { color: colors.textSoft }]}>Answer parent questions & publish FAQs</Text>
              </View>
              <Icon source="chevron-right" size={20} color={colors.textSoft} />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <AdminManageExpertsModal
        visible={adminModalVisible}
        onClose={() => setAdminModalVisible(false)}
      />

      <AdminReportsModal
        visible={reportsModalVisible}
        onClose={() => setReportsModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 10;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 18, paddingTop: statusBarHeight ? 8 : 18, paddingBottom: 100 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  avatarCircle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  greeting: { fontSize: 13, fontWeight: '600' },
  name: { fontSize: 20, fontWeight: '800' },
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
