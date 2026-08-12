import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSelector } from 'react-redux';
import RecipeListScreen from '../recipes/RecipeListScreen';
import ArticleListScreen from '../articles/ArticleListScreen';
import TopHeaderBar from '../../components/common/TopHeaderBar';
import { useAppTheme } from '../../theme/useAppTheme';
import type { AppColors } from '../../theme/colors';
import type { RootState } from '../../store/store';

function LibraryScreen({ navigation }: any) {
  const { colors } = useAppTheme();
  const styles = React.useMemo(
    () => createStyles(colors),
    [colors],
  );
  const [activeSubTab, setActiveSubTab] = useState<'recipes' | 'articles'>('recipes');

  const authMode = useSelector((state: RootState) => state.auth.mode);
  const user = useSelector((state: RootState) => state.auth.user);
  const isExpertOrAdmin = authMode === 'authenticated' && (user?.role === 'expert' || user?.role === 'admin');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <TopHeaderBar />

      {/* Banner Nút mở Lịch Dinh Dưỡng & Đề Xuất Món Ăn — Parent-only, Experts don't track a baby */}
      {!isExpertOrAdmin && (
        <TouchableOpacity
          style={styles.schedulerBanner}
          onPress={() => navigation.navigate('MealScheduler')}
          activeOpacity={0.88}
        >
          <Text style={styles.schedulerBannerEmoji}>📅✨</Text>
          <View style={styles.schedulerBannerTextCol}>
            <Text style={styles.schedulerBannerTitle}>Nutrition Schedule & Meal Suggestions</Text>
            <Text style={styles.schedulerBannerSub}>Daily meal planner & expert-approved nutrition recommendations</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Segmented Tab Switcher (Thư viện: Công thức & Bài viết) */}
      <View style={styles.segmentedContainer}>
        <TouchableOpacity
          style={[
            styles.segmentBtn,
            activeSubTab === 'recipes' && styles.segmentBtnActive,
          ]}
          onPress={() => setActiveSubTab('recipes')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.segmentText,
              activeSubTab === 'recipes' && styles.segmentTextActive,
            ]}
          >
            🥣 Weaning Recipes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentBtn,
            activeSubTab === 'articles' && styles.segmentBtnActive,
          ]}
          onPress={() => setActiveSubTab('articles')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.segmentText,
              activeSubTab === 'articles' && styles.segmentTextActive,
            ]}
          >
            📚 Nutrition Articles
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sub-tab content */}
      <View style={styles.content}>
        {activeSubTab === 'recipes' ? (
          <RecipeListScreen navigation={navigation} hideTopHeader />
        ) : (
          <ArticleListScreen navigation={navigation} hideTopHeader />
        )}
      </View>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  schedulerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    marginHorizontal: 16,
    marginTop: 10,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.borderDashedPrimary,
    shadowColor: colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  schedulerBannerEmoji: {
    fontSize: 26,
    marginRight: 10,
  },
  schedulerBannerTextCol: {
    flex: 1,
  },
  schedulerBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 2,
  },
  schedulerBannerSub: {
    fontSize: 11,
    color: colors.textSoft,
    lineHeight: 15,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 24,
    padding: 4,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.borderDashedPrimary,
    shadowColor: colors.primary,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
  },
  segmentBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSoft,
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
});

export default LibraryScreen;
