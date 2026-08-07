import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, StatusBar, Platform } from 'react-native';

const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 10;
import Svg, { Path } from 'react-native-svg';
import TopHeaderBar from '../../components/common/TopHeaderBar';
import RecipeCard from '../../components/recipes/RecipeCard';
import { useBookmarkStore } from '../../stores/useBookmarkStore';
import { recipeService } from '../../services/recipe.service';
import { RecipeListItem } from '../../types/recipe';

const HeartIcon = ({ size = 22, color = '#FF5F70' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth={2}>
    <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </Svg>
);

const BackIcon = ({ size = 20, color = '#FF5F70' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M15 19l-7-7 7-7" />
  </Svg>
);

const FavoriteRecipesScreen = ({ navigation }: any) => {
  const [favoriteRecipes, setFavoriteRecipes] = useState<RecipeListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { savedRecipeIds = [] } = useBookmarkStore();

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
    } catch (e) {
      navigation.navigate('Recipes', { screen: 'RecipeDetail', params: { id: recipeId } });
    }
  };

  return (
    <View style={styles.container}>
      <TopHeaderBar />

      <View style={styles.headerBox}>
        <View style={styles.titleRow}>
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <BackIcon size={20} color="#FF5F70" />
          </TouchableOpacity>
          <HeartIcon size={22} color="#FF5F70" />
          <Text style={styles.title}>Favorite Recipes</Text>
        </View>
        <Text style={styles.subtitle}>
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
              <HeartIcon size={44} color="#FFD1D6" />
              <Text style={styles.emptyTitle}>No Favorite Recipes Saved</Text>
              <Text style={styles.emptySub}>
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
  container: { flex: 1, backgroundColor: '#FFF5F2' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBox: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  title: { fontSize: 22, fontWeight: '800', color: '#4B3034' },
  subtitle: { fontSize: 13, color: '#8E7377', marginLeft: 44, marginTop: -2 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFE4E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 12 },
  row: { justifyContent: 'space-between' },
  emptyBox: { alignItems: 'center', marginTop: 80, paddingHorizontal: 30, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#4B3034' },
  emptySub: { fontSize: 13, color: '#8E7377', textAlign: 'center', lineHeight: 18 },
});

export default FavoriteRecipesScreen;
