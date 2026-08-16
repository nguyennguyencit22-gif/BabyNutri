import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import Icon from '../../components/common/AppIcon';

import TopHeaderBar from '../../components/common/TopHeaderBar';
import RecipeCard from '../../components/recipes/RecipeCard';
import { useBookmarkStore } from '../../stores/useBookmarkStore';
import { recipeService } from '../../services/recipe.service';
import { RecipeListItem } from '../../types/recipe';
import { useAppTheme } from '../../theme/useAppTheme';
import type { RootState } from '../../store/store';

const FavoriteRecipesScreen = ({ navigation }: any) => {
  const { colors } = useAppTheme();
  const [favoriteRecipes, setFavoriteRecipes] = useState<RecipeListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const authMode = useSelector((state: RootState) => state.auth.mode);
  const { savedRecipeIds = [], setSavedRecipeIds } = useBookmarkStore();

  // Signed-in users' favorites live in the database, not just on this
  // device — pull the current list down before rendering so it reflects
  // what was saved from any device/after a reinstall.
  useEffect(() => {
    if (authMode === 'authenticated') {
      recipeService.getMyFavorites()
        .then(setSavedRecipeIds)
        .catch((e) => console.error('Load favorites from server error:', e));
    }
  }, [authMode, setSavedRecipeIds]);

  useEffect(() => {
    loadFavoriteRecipes();
  }, [savedRecipeIds]);

  const loadFavoriteRecipes = async () => {
    setLoading(true);
    try {
      const allRecipes = await recipeService.getAll().catch(() => []);
      const validRecipes = Array.isArray(allRecipes) ? allRecipes : [];
      const safeRecipeIds = Array.isArray(savedRecipeIds) ? savedRecipeIds : [];

      setFavoriteRecipes(validRecipes.filter((r) => r && safeRecipeIds.includes(Number(r.id))));
    } catch (e) {
      console.error('Load favorite recipes error:', e);
    } finally {
      setLoading(false);
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopHeaderBar />

      <View style={styles.headerBox}>
        <View style={styles.titleRow}>
          <TouchableOpacity 
            style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Icon source="arrow-left" size={20} color="#FF5F70" />
          </TouchableOpacity>
          <Icon source="heart" size={22} color="#FF5F70" />
          <Text style={[styles.title, { color: colors.text }]}>Favorite Recipes</Text>
        </View>
        <Text style={[styles.subtitle, { color: colors.textSoft }]}>
          All weaning recipes you have liked and saved for your baby.
        </Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF5F70" />
        </View>
      ) : (
        <FlatList
          data={favoriteRecipes}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <RecipeCard recipe={item} onPress={() => handleRecipePress(item.id)} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Icon source="heart-outline" size={44} color="#FFD1D6" />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Favorite Recipes Saved</Text>
              <Text style={[styles.emptySub, { color: colors.textSoft }]}>
                Tap the heart icon on any recipe to save it to your favorites list!
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBox: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  title: { fontSize: 22, fontWeight: '800' },
  subtitle: { fontSize: 13, marginLeft: 44, marginTop: -2 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 12 },
  row: { justifyContent: 'space-between' },
  emptyBox: { alignItems: 'center', marginTop: 80, paddingHorizontal: 30, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptySub: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
});

export default FavoriteRecipesScreen;
