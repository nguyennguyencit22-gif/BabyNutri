import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, StatusBar, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '../../components/common/AppIcon';
import { recipeService } from '../../services/recipe.service';
import type { MyRecipeItem } from '../../services/recipe.service';
import { articleService } from '../../services/article.service';
import { ArticleListItem } from '../../types/article';
import { getRecipeImage } from '../../constants/recipeImages';
import { getArticleImage } from '../../constants/articleImages';
import { useAppTheme } from '../../theme/useAppTheme';

// Expert's own content ("Create & Manage Content"): recipes and articles
// they authored, with quick Edit / Delete actions. Reached from the Expert
// home dashboard.
const MyContentScreen = ({ route, navigation }: any) => {
  const { colors, isDark } = useAppTheme();
  const [activeTab, setActiveTab] = useState<'recipes' | 'articles'>(route?.params?.initialTab || 'recipes');

  useEffect(() => {
    if (route?.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route?.params?.initialTab]);
  const [recipes, setRecipes] = useState<MyRecipeItem[]>([]);
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadContent = useCallback(async () => {
    setLoading(true);
    try {
      const [myRecipes, myArticles] = await Promise.all([
        recipeService.getMine().catch(() => []),
        articleService.getMine().catch(() => []),
      ]);
      setRecipes(myRecipes);
      setArticles(myArticles);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadContent();
    }, [loadContent])
  );

  const handleDeleteRecipe = (id: number, name: string) => {
    Alert.alert('Delete Recipe', `Delete "${name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await recipeService.remove(id);
            loadContent();
          } catch (e) {
            console.error('Delete recipe error:', e);
            Alert.alert('Error', 'Unable to delete this recipe right now.');
          }
        },
      },
    ]);
  };

  const handleDeleteArticle = (id: number, title: string) => {
    Alert.alert('Delete Article', `Delete "${title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await articleService.remove(id);
            loadContent();
          } catch (e) {
            console.error('Delete article error:', e);
            Alert.alert('Error', 'Unable to delete this article right now.');
          }
        },
      },
    ]);
  };

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
          <Text style={[styles.title, { color: colors.text }]}>My Content</Text>
        </View>

        <View style={[styles.tabBar, { backgroundColor: isDark ? '#3A2E31' : '#FFE8DF' }]}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'recipes' && styles.activeTabBtn]}
            onPress={() => setActiveTab('recipes')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, { color: colors.textSoft }, activeTab === 'recipes' && styles.activeTabText]}>
              Recipes ({recipes.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'articles' && styles.activeTabBtn]}
            onPress={() => setActiveTab('articles')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, { color: colors.textSoft }, activeTab === 'articles' && styles.activeTabText]}>
              Articles ({articles.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => navigation.navigate(activeTab === 'recipes' ? 'AddRecipe' : 'AddArticle')}
        activeOpacity={0.88}
      >
        <Icon source="plus" size={18} color="#FFFFFF" />
        <Text style={styles.addBtnText}>{activeTab === 'recipes' ? 'Add New Recipe' : 'Add New Article'}</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF7A59" />
        </View>
      ) : activeTab === 'recipes' ? (
        <FlatList
          key="my-recipes-list"
          data={recipes}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TouchableOpacity
                style={styles.cardMain}
                onPress={() => navigation.navigate('RecipeDetail', { id: item.id })}
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
              </TouchableOpacity>
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('EditRecipe', { id: item.id })}>
                  <Icon source="pencil" size={18} color="#FF7A59" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={() => handleDeleteRecipe(item.id, item.name)}>
                  <Icon source="delete-outline" size={18} color="#DC2626" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Icon source="bowl-mix-outline" size={40} color={colors.textSoft} />
              <Text style={[styles.emptyText, { color: colors.text }]}>You haven't created any recipes yet.</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          key="my-articles-list"
          data={articles}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const badges = [item.category, item.target_age, item.reading_time].filter(Boolean) as string[];
            const createdLabel = item.published_date
              ? new Date(item.published_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : null;
            return (
              <View style={[styles.card, styles.articleCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.articleTopRow}>
                  <TouchableOpacity
                    style={styles.cardMain}
                    onPress={() => navigation.navigate('ArticleDetail', { id: item.id })}
                    activeOpacity={0.85}
                  >
                    <Image source={getArticleImage(item.id, item.image_url)} style={styles.thumb} />
                    <View style={styles.cardInfo}>
                      <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
                      {!!item.summary && (
                        <Text style={[styles.cardSummary, { color: colors.textSoft }]} numberOfLines={2}>{item.summary}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                  <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('EditArticle', { id: item.id })}>
                      <Icon source="pencil" size={18} color="#FF7A59" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => handleDeleteArticle(item.id, item.title)}>
                      <Icon source="delete-outline" size={18} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                </View>

                {badges.length > 0 && (
                  <View style={styles.articleBadgeRow}>
                    {badges.map((b) => (
                      <View key={b} style={[styles.articleBadge, { backgroundColor: isDark ? '#3A2E31' : '#FFF0F2' }]}>
                        <Text style={[styles.articleBadgeText, { color: colors.textSoft }]} numberOfLines={1}>{b}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.articleFooterRow}>
                  {!!createdLabel && (
                    <Text style={[styles.articleCreatedText, { color: colors.textSoft }]}>Created: {createdLabel}</Text>
                  )}
                  <View style={styles.statusPill}>
                    <Text style={styles.statusPillText}>Published</Text>
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Icon source="text-box-outline" size={40} color={colors.textSoft} />
              <Text style={[styles.emptyText, { color: colors.text }]}>You haven't published any articles yet.</Text>
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
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
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
  tabBar: { flexDirection: 'row', borderRadius: 14, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTabBtn: { backgroundColor: '#FF6B4A', shadowColor: '#FF6B4A', shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
  tabText: { fontSize: 12, fontWeight: '600' },
  activeTabText: { color: '#FFFFFF', fontWeight: '700' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF5F70',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#FF5F70',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  addBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  cardMain: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  thumb: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#EEE', marginRight: 12 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  cardSummary: { fontSize: 12, lineHeight: 16 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statsText: { fontSize: 12, marginRight: 8 },
  cardActions: { flexDirection: 'row', gap: 4 },
  iconBtn: { padding: 8 },
  articleCard: { flexDirection: 'column', alignItems: 'stretch' },
  articleTopRow: { flexDirection: 'row', alignItems: 'center' },
  articleBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8, paddingLeft: 68 },
  articleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  articleBadgeText: { fontSize: 11, fontWeight: '600' },
  articleFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingLeft: 68,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  articleCreatedText: { fontSize: 11, fontWeight: '600' },
  statusPill: { backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  statusPillText: { fontSize: 11, fontWeight: '700', color: '#16A34A' },
  emptyBox: { alignItems: 'center', marginTop: 60, gap: 8, paddingHorizontal: 20 },
  emptyText: { fontSize: 15, fontWeight: '700', textAlign: 'center' },
});

export default MyContentScreen;
