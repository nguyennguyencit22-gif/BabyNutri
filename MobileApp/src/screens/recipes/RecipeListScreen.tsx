import React, { useState, useCallback, useMemo } from 'react';
import { View, FlatList, RefreshControl, ActivityIndicator, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import RecipeCard from '../../components/recipes/RecipeCard';
import TopHeaderBar from '../../components/common/TopHeaderBar';

const SearchIcon = ({ size = 18, color = '#FF7A59' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z" />
  </Svg>
);

import { useRecipeStore } from '../../stores/useRecipeStore';

const CATEGORIES = ['Tất cả', '6-12 tháng', '12-24 tháng', '24+ tháng'];

interface RecipeListScreenProps {
  navigation: any;
  hideTopHeader?: boolean;
}

const RecipeListScreen: React.FC<RecipeListScreenProps> = ({ navigation, hideTopHeader = false }) => {
  const { recipes, loading, selectedCategory, setSelectedCategory, fetchRecipes } = useRecipeStore();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchRecipes();
    }, [fetchRecipes])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRecipes();
    setRefreshing(false);
  };

  const filteredRecipes = useMemo(() => {
    if (selectedCategory === 'Tất cả') return recipes;
    if (selectedCategory === '6-12 tháng') return recipes.filter(r => r.month_age >= 6 && r.month_age <= 12);
    if (selectedCategory === '12-24 tháng') return recipes.filter(r => r.month_age > 12 && r.month_age <= 24);
    if (selectedCategory === '24+ tháng') return recipes.filter(r => r.month_age > 24);
    return recipes;
  }, [recipes, selectedCategory]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#FF5F70" /></View>;

  return (
    <View style={styles.container}>
      {!hideTopHeader && <TopHeaderBar />}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Công thức ăn dặm</Text>
        <TouchableOpacity
          style={styles.searchBtnContainer}
          onPress={() => navigation.navigate('SearchRecipe')}
          activeOpacity={0.75}
        >
          <SearchIcon size={18} color="#FF5F70" />
        </TouchableOpacity>
      </View>

      {/* Thanh chọn danh mục / độ tuổi (Category Chips Scroll) */}
      <View style={styles.categoryWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map((cat) => {
            const isSelected = cat === selectedCategory;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, isSelected && styles.activeChip]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, isSelected && styles.activeChipText]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filteredRecipes}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF7A59']} />}
        renderItem={({ item }) => (
          <RecipeCard recipe={item} onPress={() => navigation.navigate('RecipeDetail', { id: item.id })} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🥑</Text>
            <Text style={styles.empty}>Không tìm thấy công thức phù hợp</Text>
          </View>
        }
      />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddRecipe')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F2' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF5F2' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingTop: 14, paddingBottom: 10 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#4B3034', letterSpacing: -0.3 },
  searchBtnContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0F2',
    borderWidth: 1,
    borderColor: '#FFE4E6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF5F70',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  categoryWrapper: { marginBottom: 12 },
  categoryScroll: { paddingHorizontal: 16, gap: 10 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFE4E6',
    shadowColor: '#FF5F70',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  activeChip: {
    backgroundColor: '#FF5F70',
    borderColor: '#FF5F70',
    shadowColor: '#FF5F70',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E7377',
  },
  activeChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  list: { paddingHorizontal: 16, paddingBottom: 90 },
  row: { justifyContent: 'space-between' },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  empty: { textAlign: 'center', color: '#8E7377', fontSize: 14, fontWeight: '500' },
  fab: { position: 'absolute', right: 20, bottom: 80, width: 56, height: 56, borderRadius: 28, backgroundColor: '#FF5F70', justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#FF5F70', shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  fabText: { color: '#fff', fontSize: 30, lineHeight: 32, fontWeight: '300' },
});

export default RecipeListScreen;