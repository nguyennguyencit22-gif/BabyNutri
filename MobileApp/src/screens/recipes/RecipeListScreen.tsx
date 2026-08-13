import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, FlatList, RefreshControl, ActivityIndicator, StyleSheet, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '../../components/common/AppIcon';
import { useSelector } from 'react-redux';
import RecipeCard from '../../components/recipes/RecipeCard';
import TopHeaderBar from '../../components/common/TopHeaderBar';
import type { RootState } from '../../store/store';
import { useRecipeStore } from '../../stores/useRecipeStore';
import { useAppTheme } from '../../theme/useAppTheme';
import { recipeService, RecipeMetadata } from '../../services/recipe.service';
import { RECIPE_MEAL_TYPES, RECIPE_WEANING_METHODS, RECIPE_DIETARY_NEEDS, RECIPE_OCCASIONS, toOptionNames } from '../../components/recipes/RecipeFieldChips';

const CATEGORIES = ['All', '6-12 months', '12-24 months', '24+ months'];

interface RecipeListScreenProps {
  navigation: any;
  hideTopHeader?: boolean;
}

const RecipeListScreen: React.FC<RecipeListScreenProps> = ({ navigation, hideTopHeader = false }) => {
  const { colors, isDark } = useAppTheme();
  const { recipes, loading, selectedCategory, setSelectedCategory, fetchRecipes } = useRecipeStore();
  const [refreshing, setRefreshing] = useState(false);

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('');
  const [selectedWeaning, setSelectedWeaning] = useState('');
  const [selectedDiet, setSelectedDiet] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState('');

  const [mealTypes, setMealTypes] = useState(RECIPE_MEAL_TYPES);
  const [weaningMethods, setWeaningMethods] = useState(RECIPE_WEANING_METHODS);
  const [dietaryNeedsList, setDietaryNeedsList] = useState(RECIPE_DIETARY_NEEDS);
  const [occasionsList, setOccasionsList] = useState(RECIPE_OCCASIONS);

  useEffect(() => {
    recipeService.getMeta().then((meta: RecipeMetadata) => {
      if (meta.mealTypes?.length) setMealTypes(meta.mealTypes);
      if (meta.weaningMethods?.length) setWeaningMethods(meta.weaningMethods);
      if (meta.dietaryNeeds?.length) setDietaryNeedsList(meta.dietaryNeeds);
      if (meta.occasions?.length) setOccasionsList(meta.occasions);
    }).catch((e) => console.warn('Could not load recipe filter meta:', e));
  }, []);

  const authMode = useSelector((state: RootState) => state.auth.mode);
  const user = useSelector((state: RootState) => state.auth.user);
  const isExpert = authMode === 'authenticated' && user?.role === 'expert';
  const isExpertOrAdmin = authMode === 'authenticated' && (user?.role === 'expert' || user?.role === 'admin');

  const babies = useSelector((state: RootState) => state.baby.babies);
  const selectedBabyId = useSelector((state: RootState) => state.baby.selectedBabyId);
  const selectedBaby = useMemo(() => babies.find(b => String(b.id) === String(selectedBabyId)) || babies[0], [babies, selectedBabyId]);

  // Baby-allergy personalization is a Parent concept — Experts/Admins
  // aren't managing a specific baby, so it shouldn't apply to their view.
  const babyAllergies = useMemo(() => (isExpertOrAdmin ? [] : selectedBaby?.allergies || []), [isExpertOrAdmin, selectedBaby]);

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

  const isFilterActive = Boolean(selectedMealType || selectedWeaning || selectedDiet || selectedOccasion);

  const handleResetFilters = () => {
    setSelectedMealType('');
    setSelectedWeaning('');
    setSelectedDiet('');
    setSelectedOccasion('');
    setShowFilterModal(false);
  };

  const filteredRecipes = useMemo(() => {
    let result = [...recipes];

    // 1. Age Category Filter
    if (selectedCategory === '6-12 months') result = result.filter(r => r.month_age >= 6 && r.month_age <= 12);
    else if (selectedCategory === '12-24 months') result = result.filter(r => r.month_age > 12 && r.month_age <= 24);
    else if (selectedCategory === '24+ months') result = result.filter(r => r.month_age > 24);

    // 2. Extra Category Filters
    if (selectedMealType) {
      result = result.filter(r => (r.mealType && r.mealType.toLowerCase() === selectedMealType.toLowerCase()) || (r.meal_type_id && mealTypes.find(m => m.id === r.meal_type_id)?.name.toLowerCase() === selectedMealType.toLowerCase()));
    }
    if (selectedWeaning) {
      result = result.filter(r => r.weaning_method && r.weaning_method.toLowerCase() === selectedWeaning.toLowerCase());
    }
    if (selectedDiet) {
      result = result.filter(r => r.dietary_needs && r.dietary_needs.toLowerCase() === selectedDiet.toLowerCase());
    }
    if (selectedOccasion) {
      result = result.filter(r => r.occasion && r.occasion.toLowerCase() === selectedOccasion.toLowerCase());
    }

    // 3. Personalized Smart Ranking:
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
  }, [recipes, selectedCategory, selectedMealType, selectedWeaning, selectedDiet, selectedOccasion, babyAllergies, mealTypes]);

  const renderModalFilterGroup = (title: string, options: string[], selectedVal: string, onSelect: (v: string) => void) => (
    <View style={styles.modalSection}>
      <Text style={[styles.modalSectionTitle, { color: colors.text }]}>{title}</Text>
      <View style={styles.modalChipWrap}>
        {options.map((opt) => {
          const isSelected = opt === selectedVal;
          return (
            <TouchableOpacity
              key={opt}
              style={[
                styles.modalChip,
                {
                  backgroundColor: isSelected ? '#FF5F70' : isDark ? '#3A2E31' : '#FFF0F2',
                  borderColor: isSelected ? '#FF5F70' : isDark ? '#4A3236' : '#FFE2E6',
                },
              ]}
              onPress={() => onSelect(isSelected ? '' : opt)}
              activeOpacity={0.8}
            >
              <Text style={[styles.modalChipText, { color: isSelected ? '#FFFFFF' : colors.text }]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  if (loading) return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color="#FF5F70" /></View>;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {!hideTopHeader && <TopHeaderBar />}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Weaning Recipes</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: isFilterActive ? '#FF5F70' : isDark ? '#3A2E31' : '#FFF0F2', borderColor: isFilterActive ? '#FF5F70' : colors.border },
            ]}
            onPress={() => setShowFilterModal(true)}
            activeOpacity={0.75}
          >
            <Icon source="filter-variant" size={18} color={isFilterActive ? '#FFFFFF' : '#FF5F70'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: isDark ? '#3A2E31' : '#FFF0F2', borderColor: colors.border }]}
            onPress={() => navigation.navigate('SearchRecipe')}
            activeOpacity={0.75}
          >
            <Icon source="magnify" size={18} color="#FF5F70" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Personalized Smart Recommendation Banner — Parent-only */}
      {selectedBaby && !isExpertOrAdmin && (
        <View style={[styles.allergyBanner, { backgroundColor: isDark ? '#4A2A30' : '#FFF0F2', borderColor: isDark ? '#8A4550' : '#FFE4E6' }]}>
          <Text style={styles.allergyBannerText}>
            Personalized for {selectedBaby.name}: Safe recipes recommended first.
            {babyAllergies.length > 0 ? ` Recipes with (${babyAllergies.join(', ')}) moved to bottom.` : ''}
          </Text>
        </View>
      )}

      {/* Active Filter summary pill */}
      {isFilterActive && (
        <View style={styles.activeFilterRow}>
          <Text style={[styles.activeFilterLabel, { color: colors.textSoft }]}>Filtered by:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {!!selectedMealType && <View style={styles.filterPill}><Text style={styles.filterPillText}>{selectedMealType}</Text></View>}
            {!!selectedWeaning && <View style={styles.filterPill}><Text style={styles.filterPillText}>{selectedWeaning}</Text></View>}
            {!!selectedDiet && <View style={styles.filterPill}><Text style={styles.filterPillText}>{selectedDiet}</Text></View>}
            {!!selectedOccasion && <View style={styles.filterPill}><Text style={styles.filterPillText}>{selectedOccasion}</Text></View>}
            <TouchableOpacity onPress={handleResetFilters} style={styles.clearFilterPill}>
              <Text style={styles.clearFilterText}>Clear</Text>
            </TouchableOpacity>
          </ScrollView>
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

      {/* Filter Modal */}
      <Modal visible={showFilterModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Filter Recipes</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Icon source="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
              {renderModalFilterGroup('Recipe Type', toOptionNames(mealTypes), selectedMealType, setSelectedMealType)}
              {renderModalFilterGroup('Weaning Method', toOptionNames(weaningMethods), selectedWeaning, setSelectedWeaning)}
              {renderModalFilterGroup('Dietary Needs', toOptionNames(dietaryNeedsList), selectedDiet, setSelectedDiet)}
              {renderModalFilterGroup('Occasion', toOptionNames(occasionsList), selectedOccasion, setSelectedOccasion)}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={[styles.modalResetBtn, { borderColor: colors.border }]} onPress={handleResetFilters}>
                <Text style={[styles.modalResetText, { color: colors.textSoft }]}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalApplyBtn} onPress={() => setShowFilterModal(false)}>
                <Text style={styles.modalApplyText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingTop: 14, paddingBottom: 10 },
  headerTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionBtn: {
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
  activeFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
    gap: 8,
  },
  activeFilterLabel: { fontSize: 12, fontWeight: '700' },
  filterPill: {
    backgroundColor: '#FF5F70',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  filterPillText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  clearFilterPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearFilterText: { color: '#FF5F70', fontSize: 11, fontWeight: '700', textDecorationLine: 'underline' },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  modalBody: { paddingHorizontal: 20, paddingTop: 12 },
  modalSection: { marginBottom: 16 },
  modalSectionTitle: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  modalChipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  modalChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
  },
  modalChipText: { fontSize: 12, fontWeight: '700' },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalResetBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalResetText: { fontSize: 14, fontWeight: '700' },
  modalApplyBtn: {
    flex: 1,
    backgroundColor: '#FF5F70',
    paddingVertical: 12,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF5F70',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  modalApplyText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});

export default RecipeListScreen;