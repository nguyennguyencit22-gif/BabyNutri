import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, RefreshControl, ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { recipeService } from '../../services/recipe.service';
import { RecipeListItem } from '../../types/recipe';
import RecipeCard from '../../components/recipes/RecipeCard';

const RecipeListScreen = ({ navigation }: any) => {
  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRecipes = useCallback(async () => {
    try {
      const data = await recipeService.getAll();
      setRecipes(data);
    } catch (e) {
      console.error('Load recipes error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadRecipes(); }, [loadRecipes]);

  const onRefresh = () => { setRefreshing(true); loadRecipes(); };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#FF7A59" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Công thức dinh dưỡng</Text>
        <TouchableOpacity onPress={() => navigation.navigate('SearchRecipe')}>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={recipes}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF7A59']} />}
        renderItem={({ item }) => (
          <RecipeCard recipe={item} onPress={() => navigation.navigate('RecipeDetail', { id: item.id })} />
        )}
        ListEmptyComponent={<Text style={styles.empty}>Chưa có công thức nào</Text>}
      />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddRecipe')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#2E2E2E' },
  searchIcon: { fontSize: 20 },
  list: { paddingHorizontal: 16, paddingBottom: 90 },
  row: { justifyContent: 'space-between' },
  empty: { textAlign: 'center', marginTop: 40, color: '#999' },
  fab: { position: 'absolute', right: 20, bottom: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#FF7A59', justifyContent: 'center', alignItems: 'center', elevation: 4 },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 30 },
});

export default RecipeListScreen;