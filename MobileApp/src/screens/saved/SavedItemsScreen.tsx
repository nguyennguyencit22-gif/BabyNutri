import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, StatusBar, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import TopHeaderBar from '../../components/common/TopHeaderBar';
import ArticleCard from '../../components/articles/ArticleCard';
import RecipeCard from '../../components/recipes/RecipeCard';
import { useBookmarkStore } from '../../stores/useBookmarkStore';
import { articleService } from '../../services/article.service';
import { recipeService } from '../../services/recipe.service';
import { ArticleListItem } from '../../types/article';
import { RecipeListItem } from '../../types/recipe';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store/store';
import { clearHistory } from '../../store/historySlice';
import { formatRealTimeAgo } from '../../utils/formatRealTime';

const BookmarkIcon = ({ size = 20, color = '#FF6B4A' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
  </Svg>
);

const BowlIcon = ({ size = 36, color = '#9CA3AF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 21a9 9 0 009-9H3a9 9 0 009 9z" />
    <Path d="M12 3v9M7 6v6M17 6v6" />
  </Svg>
);

const BackIcon = ({ size = 20, color = '#FF6B4A' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M15 19l-7-7 7-7" />
  </Svg>
);

const HistoryIcon = ({ size = 20, color = '#FF6B4A' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </Svg>
);

const SavedItemsScreen = ({ route, navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const initialTab = route?.params?.initialTab || 'history';
  const [activeTab, setActiveTab] = useState<'history' | 'articles' | 'recipes'>(initialTab);
  const [savedArticles, setSavedArticles] = useState<ArticleListItem[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<RecipeListItem[]>([]);
  const [loading, setLoading] = useState(false);

  const activities = useSelector((state: RootState) => state.history.activities);
  const { savedArticleIds = [], savedRecipeIds = [] } = useBookmarkStore();

  useEffect(() => {
    if (route?.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route?.params?.initialTab]);

  useEffect(() => {
    loadSavedData();
  }, [savedArticleIds, savedRecipeIds]);

  const loadSavedData = async () => {
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
    } catch (e) {
      console.error('Load saved items error:', e);
    }
  };

  const handleArticlePress = (articleId: number) => {
    try {
      navigation.navigate('ArticleDetail', { id: articleId });
    } catch (e) {
      navigation.navigate('Articles', { screen: 'ArticleDetail', params: { id: articleId } });
    }
  };

  const handleRecipePress = (recipeId: number) => {
    try {
      navigation.navigate('RecipeDetail', { id: recipeId });
    } catch (e) {
      navigation.navigate('Recipes', { screen: 'RecipeDetail', params: { id: recipeId } });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBox}>
        <View style={styles.titleRow}>
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <BackIcon size={20} color="#FF6B4A" />
          </TouchableOpacity>
          <HistoryIcon size={22} color="#FF6B4A" />
          <Text style={styles.title}>App Activity & History</Text>
        </View>

        {/* Tab Switcher: App Activity History vs Saved Articles vs Favorite Recipes */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'history' && styles.activeTabBtn]}
            onPress={() => setActiveTab('history')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
              App Log ({activities.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'articles' && styles.activeTabBtn]}
            onPress={() => setActiveTab('articles')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'articles' && styles.activeTabText]}>
              Saved ({savedArticleIds.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'recipes' && styles.activeTabBtn]}
            onPress={() => setActiveTab('recipes')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'recipes' && styles.activeTabText]}>
              Favorites ({savedRecipeIds.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

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
            <View style={styles.activityCard}>
              <View style={styles.activityIconCircle}>
                <Text style={{ fontSize: 18 }}>{item.icon || '📌'}</Text>
              </View>

              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>{item.title}</Text>
                {!!item.details && (
                  <Text style={styles.activityDetails}>{item.details}</Text>
                )}
                <Text style={styles.activityTime}>{formatRealTimeAgo(item.timestamp)}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <HistoryIcon size={40} color="#D1D5DB" />
              <Text style={styles.emptyText}>No activity recorded yet.</Text>
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
              <BookmarkIcon size={40} color="#D1D5DB" />
              <Text style={styles.emptyText}>You haven't saved any articles yet.</Text>
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
              <BowlIcon size={40} color="#D1D5DB" />
              <Text style={styles.emptyText}>You haven't saved any recipes yet.</Text>
            </View>
          }
        />
      )}
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
  emptyBox: { alignItems: 'center', marginTop: 60, gap: 8 },
  emptyText: { color: '#9CA3AF', fontSize: 14, fontWeight: '500' },
});

export default SavedItemsScreen;
