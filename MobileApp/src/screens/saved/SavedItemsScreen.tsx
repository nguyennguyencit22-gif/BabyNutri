import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, StatusBar, Platform, Animated } from 'react-native';
import Icon from '../../components/common/AppIcon';
import ArticleCard from '../../components/articles/ArticleCard';
import RecipeCard from '../../components/recipes/RecipeCard';
import { useBookmarkStore } from '../../stores/useBookmarkStore';
import { articleService } from '../../services/article.service';
import { recipeService } from '../../services/recipe.service';
import { ArticleListItem } from '../../types/article';
import { RecipeListItem } from '../../types/recipe';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { formatRealTimeAgo } from '../../utils/formatRealTime';
import { useAppTheme } from '../../theme/useAppTheme';

const SavedItemsScreen = ({ route, navigation }: any) => {
  const { colors, isDark } = useAppTheme();
  const initialTab = route?.params?.initialTab || 'history';
  const [activeTab, setActiveTab] = useState<'history' | 'articles' | 'recipes'>(initialTab);
  const [savedArticles, setSavedArticles] = useState<ArticleListItem[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<RecipeListItem[]>([]);
  const [loading] = useState(false);

  const activities = useSelector((state: RootState) => state.history.activities);
  const { savedArticleIds = [], savedRecipeIds = [] } = useBookmarkStore();

  const tabFadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (route?.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route?.params?.initialTab]);

  const loadSavedData = useCallback(async () => {
    try {
      const [allArticles, allRecipes] = await Promise.all([
        articleService.getAll().catch(() => []),
        recipeService.getAll().catch(() => []),
      ]);

      const validArticles = Array.isArray(allArticles) ? allArticles : [];
      const validRecipes = Array.isArray(allRecipes) ? allRecipes : [];

      const safeArticleIds = Array.isArray(savedArticleIds) ? savedArticleIds : [];
      const safeRecipeIds = Array.isArray(savedRecipeIds) ? savedRecipeIds : [];

      setSavedArticles(validArticles.filter((a) => a && safeArticleIds.includes(Number(a.id))));
      setSavedRecipes(validRecipes.filter((r) => r && safeRecipeIds.includes(Number(r.id))));
    } catch {
      console.warn('Load saved items warning');
    }
  }, [savedArticleIds, savedRecipeIds]);

  useEffect(() => {
    loadSavedData();
  }, [loadSavedData]);

  const handleTabChange = (newTab: 'history' | 'articles' | 'recipes') => {
    Animated.sequence([
      Animated.timing(tabFadeAnim, { toValue: 0.7, duration: 100, useNativeDriver: true }),
      Animated.timing(tabFadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    setActiveTab(newTab);
  };

  const handleArticlePress = (articleId: number) => {
    try {
      navigation.navigate('ArticleDetail', { id: articleId });
    } catch {
      navigation.navigate('Articles', { screen: 'ArticleDetail', params: { id: articleId } });
    }
  };

  const handleRecipePress = (recipeId: number) => {
    try {
      navigation.navigate('RecipeDetail', { id: recipeId });
    } catch {
      navigation.navigate('Recipes', { screen: 'RecipeDetail', params: { id: recipeId } });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />

      <View style={styles.headerBox}>
        <View style={styles.titleRow}>
          <TouchableOpacity 
            style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Icon source="arrow-left" size={20} color="#FF6B4A" />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Saved & History</Text>
        </View>

        {/* 3 Tab Bar Options */}
        <View style={[styles.tabBar, { backgroundColor: isDark ? '#3A2E31' : '#FFE8DF' }]}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'history' && styles.activeTabBtn]}
            onPress={() => handleTabChange('history')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, { color: colors.textSoft }, activeTab === 'history' && styles.activeTabText]}>
              Activity ({activities.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'articles' && styles.activeTabBtn]}
            onPress={() => handleTabChange('articles')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, { color: colors.textSoft }, activeTab === 'articles' && styles.activeTabText]}>
              Favorite Article ({savedArticleIds.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'recipes' && styles.activeTabBtn]}
            onPress={() => handleTabChange('recipes')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, { color: colors.textSoft }, activeTab === 'recipes' && styles.activeTabText]}>
              Favorite Recipe ({savedRecipeIds.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Animated.View style={{ flex: 1, opacity: tabFadeAnim }}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#FF7A59" />
          </View>
        ) : activeTab === 'history' ? (
          <FlatList
            key="activity-history-log-list"
            data={activities}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={[styles.activityCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.activityIconCircle, { backgroundColor: isDark ? '#3A2E31' : '#FFF0F2' }]}>
                  <Text style={{ fontSize: 18 }}>{item.icon || '📌'}</Text>
                </View>

                <View style={styles.activityInfo}>
                  <Text style={[styles.activityTitle, { color: colors.text }]}>{item.title}</Text>
                  {!!item.details && (
                    <Text style={[styles.activityDetails, { color: colors.textSoft }]}>{item.details}</Text>
                  )}
                  <Text style={styles.activityTime}>{formatRealTimeAgo(item.timestamp)}</Text>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Icon source="history" size={40} color={colors.textSoft} />
                <Text style={[styles.emptyText, { color: colors.text }]}>No activity recorded yet.</Text>
              </View>
            }
          />
        ) : activeTab === 'articles' ? (
          <FlatList
            key="saved-articles-flatlist-1col"
            data={savedArticles}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <ArticleCard article={item} onPress={() => handleArticlePress(item.id)} />
            )}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Icon source="heart-outline" size={40} color={colors.textSoft} />
                <Text style={[styles.emptyText, { color: colors.text }]}>You haven't liked or saved any articles yet.</Text>
                <Text style={[styles.emptySubText, { color: colors.textSoft }]}>Tap the Heart button on articles to save them here!</Text>
              </View>
            }
          />
        ) : (
          <FlatList
            key="saved-recipes-flatlist-2col"
            data={savedRecipes}
            keyExtractor={(item) => String(item.id)}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <RecipeCard recipe={item} onPress={() => handleRecipePress(item.id)} />
            )}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Icon source="bowl-mix-outline" size={40} color={colors.textSoft} />
                <Text style={[styles.emptyText, { color: colors.text }]}>You haven't saved any recipes yet.</Text>
                <Text style={[styles.emptySubText, { color: colors.textSoft }]}>Tap the Save button on recipes to save them here!</Text>
              </View>
            }
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 10;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBox: { paddingHorizontal: 16, paddingTop: statusBarHeight + 10, paddingBottom: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFE0D6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  tabBar: { flexDirection: 'row', backgroundColor: '#FFE8DF', borderRadius: 14, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTabBtn: { backgroundColor: '#FF6B4A', shadowColor: '#FF6B4A', shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
  tabText: { fontSize: 12, fontWeight: '600', color: '#8A5A44' },
  activeTabText: { color: '#FFFFFF', fontWeight: '700' },
  listContent: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 8 },
  row: { justifyContent: 'space-between' },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFE4E6',
    elevation: 2,
    shadowColor: '#FF5F70',
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  activityIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF0F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B3034',
    marginBottom: 2,
  },
  activityDetails: {
    fontSize: 12,
    color: '#8E7377',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 11,
    color: '#FF5F70',
    fontWeight: '600',
  },
  emptyBox: { alignItems: 'center', marginTop: 60, gap: 8, paddingHorizontal: 20 },
  emptyText: { color: '#4B3034', fontSize: 15, fontWeight: '700' },
  emptySubText: { color: '#9CA3AF', fontSize: 12, textAlign: 'center', marginTop: 2, lineHeight: 18 },
});

export default SavedItemsScreen;
