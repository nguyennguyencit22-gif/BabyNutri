import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import TopHeaderBar from '../../components/common/TopHeaderBar';
import ArticleCard from '../../components/articles/ArticleCard';
import RecipeCard from '../../components/recipes/RecipeCard';
import { useBookmarkStore } from '../../stores/useBookmarkStore';
import { articleService } from '../../services/article.service';
import { recipeService } from '../../services/recipe.service';
import { ArticleListItem } from '../../types/article';
import { RecipeListItem } from '../../types/recipe';

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

const SavedItemsScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState<'articles' | 'recipes'>('articles');
  const [savedArticles, setSavedArticles] = useState<ArticleListItem[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<RecipeListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { savedArticleIds = [], savedRecipeIds = [] } = useBookmarkStore();

  useEffect(() => {
    loadSavedData();
  }, [savedArticleIds, savedRecipeIds]);

  const loadSavedData = async () => {
    setLoading(true);
    try {
      const [allArticles, allRecipes] = await Promise.all([
        articleService.getAll().catch(() => []),
        recipeService.getAll().catch(() => []),
      ]);

      const validArticles = Array.isArray(allArticles) ? allArticles : [];
      const validRecipes = Array.isArray(allRecipes) ? allRecipes : [];

      setSavedArticles(validArticles.filter((a) => a && savedArticleIds.includes(Number(a.id))));
      setSavedRecipes(validRecipes.filter((r) => r && savedRecipeIds.includes(Number(r.id))));
    } catch (e) {
      console.error('Load saved items error:', e);
    } finally {
      setLoading(false);
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
    <View style={styles.container}>
      <TopHeaderBar />

      <View style={styles.headerBox}>
        <View style={styles.titleRow}>
          <BookmarkIcon size={22} color="#FF6B4A" />
          <Text style={styles.title}>Saved & Favorite Items</Text>
        </View>

        {/* Tab Switcher: Bài viết đã lưu vs Công thức đã lưu */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'articles' && styles.activeTabBtn]}
            onPress={() => setActiveTab('articles')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'articles' && styles.activeTabText]}>
              Saved Articles ({savedArticleIds.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'recipes' && styles.activeTabBtn]}
            onPress={() => setActiveTab('recipes')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'recipes' && styles.activeTabText]}>
              Favorite Recipes ({savedRecipeIds.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF7A59" />
        </View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBox: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  tabBar: { flexDirection: 'row', backgroundColor: '#FFE8DF', borderRadius: 14, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTabBtn: { backgroundColor: '#FF6B4A', shadowColor: '#FF6B4A', shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
  tabText: { fontSize: 13, fontWeight: '600', color: '#8A5A44' },
  activeTabText: { color: '#FFFFFF', fontWeight: '700' },
  listContent: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 8 },
  row: { justifyContent: 'space-between' },
  emptyBox: { alignItems: 'center', marginTop: 60, gap: 8 },
  emptyText: { color: '#9CA3AF', fontSize: 14, fontWeight: '500' },
});

export default SavedItemsScreen;
