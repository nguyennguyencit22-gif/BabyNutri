import React, { useState, useCallback, useMemo } from 'react';
import { View, FlatList, RefreshControl, ActivityIndicator, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '../../components/common/AppIcon';
import { useSelector } from 'react-redux';
import RecipeCard from '../../components/recipes/RecipeCard';
import TopHeaderBar from '../../components/common/TopHeaderBar';
import type { RootState } from '../../store/store';
import { useRecipeStore } from '../../stores/useRecipeStore';
import { useAppTheme } from '../../theme/useAppTheme';

const CATEGORIES = ['All', '6-12 months', '12-24 months', '24+ months'];

interface RecipeListScreenProps {
  navigation: any;
  hideTopHeader?: boolean;
}

const RecipeListScreen: React.FC<RecipeListScreenProps> = ({ navigation, hideTopHeader = false }) => {
  const { colors, isDark } = useAppTheme();
  const { recipes, loading, selectedCategory, setSelectedCategory, fetchRecipes } = useRecipeStore();
  const [refreshing, setRefreshing] = useState(false);

  const authMode = useSelector((state: RootState) => state.auth.mode);
  const user = useSelector((state: RootState) => state.auth.user);
  const isExpert = authMode === 'authenticated' && user?.role === 'expert';

  const babies = useSelector((state: RootState) => state.baby.babies);
  const selectedBabyId = useSelector((state: RootState) => state.baby.selectedBabyId);
  const selectedBaby = useMemo(() => babies.find(b => String(b.id) === String(selectedBabyId)) || babies[0], [babies, selectedBabyId]);

  const babyAllergies = useMemo(() => selectedBaby?.allergies || [], [selectedBaby]);

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
    let result = [...recipes];

    // 1. Age Category Filter
    if (selectedCategory === '6-12 months') result = result.filter(r => r.month_age >= 6 && r.month_age <= 12);
    else if (selectedCategory === '12-24 months') result = result.filter(r => r.month_age > 12 && r.month_age <= 24);
    else if (selectedCategory === '24+ months') result = result.filter(r => r.month_age > 24);

    // 2. Personalized Smart Ranking:
    if (babyAllergies && babyAllergies.length > 0) {
      result.sort((a, b) => {
        const fullA = `${a.name || ''} ${(a as any).description || ''} ${JSON.stringify((a as any).ingredients || '')}`.toLowerCase();
        const fullB = `${b.name || ''} ${(b as any).description || ''} ${JSON.stringify((b as any).ingredients || '')}`.toLowerCase();

        const hasAllergenA = babyAllergies.some(allergen => allergen && fullA.includes(allergen.toLowerCase()));
        const hasAllergenB = babyAllergies.some(allergen => allergen && fullB.includes(allergen.toLowerCase()));

        if (hasAllergenA && !hasAllergenB) return 1;
        if (!hasAllergenA && hasAllergenB) return -1;
        return 0;
      });
    }

    return result;
  }, [recipes, selectedCategory, babyAllergies]);

  if (loading) return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color="#FF5F70" /></View>;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {!hideTopHeader && <TopHeaderBar />}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Weaning Recipes</Text>
        <TouchableOpacity
          style={[styles.searchBtnContainer, { backgroundColor: isDark ? '#3A2E31' : '#FFF0F2', borderColor: colors.border }]}
          onPress={() => navigation.navigate('SearchRecipe')}
          activeOpacity={0.75}
        >
          <Icon source="magnify" size={18} color="#FF5F70" />
        </TouchableOpacity>
      </View>

      {/* Personalized Smart Recommendation Banner */}
      {selectedBaby && (
        <View style={[styles.allergyBanner, { backgroundColor: isDark ? '#4A2A30' : '#FFF0F2', borderColor: isDark ? '#8A4550' : '#FFE4E6' }]}>
          <Text style={styles.allergyBannerText}>
            Personalized for {selectedBaby.name}: Safe recipes recommended first.
            {babyAllergies.length > 0 ? ` Recipes with (${babyAllergies.join(', ')}) moved to bottom.` : ''}
          </Text>
        </View>
      )}

      {/* Category Chips Scroll */}
      <View style={styles.categoryWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map((cat) => {
            const isSelected = cat === selectedCategory;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.chip,
                  { backgroundColor: isSelected ? '#FF5F70' : colors.surface, borderColor: isSelected ? '#FF5F70' : colors.border },
                  isSelected && styles.activeChip,
                ]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, { color: isSelected ? '#FFFFFF' : colors.textSoft }, isSelected && styles.activeChipText]}>{cat}</Text>
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
            <Icon source="food-apple-outline" size={40} color={colors.textSoft} />
            <Text style={[styles.empty, { color: colors.textSoft }]}>No matching recipes found</Text>
          </View>
        }
      />
      {isExpert && (
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddRecipe')}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingTop: 14, paddingBottom: 10 },
  headerTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  searchBtnContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF5F70',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  allergyBanner: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  allergyBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF5F70',
    lineHeight: 16,
  },
  categoryWrapper: { marginBottom: 12 },
  categoryScroll: { paddingHorizontal: 16, gap: 10 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 22,
    borderWidth: 1,
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
  },
  activeChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  list: { paddingHorizontal: 16, paddingBottom: 90 },
  row: { justifyContent: 'space-between' },
  emptyContainer: { alignItems: 'center', marginTop: 50, gap: 8 },
  empty: { textAlign: 'center', fontSize: 14, fontWeight: '500' },
  fab: { position: 'absolute', right: 20, bottom: 80, width: 56, height: 56, borderRadius: 28, backgroundColor: '#FF5F70', justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#FF5F70', shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  fabText: { color: '#fff', fontSize: 30, lineHeight: 32, fontWeight: '300' },
});

export default RecipeListScreen;