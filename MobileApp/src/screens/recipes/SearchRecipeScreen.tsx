import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import Icon from '../../components/common/AppIcon';
import { recipeService, RecipeMetadata } from '../../services/recipe.service';
import { RecipeListItem } from '../../types/recipe';
import RecipeItem from '../../components/recipes/RecipeItem';
import { useAppTheme } from '../../theme/useAppTheme';
import { RECIPE_MEAL_TYPES, RECIPE_WEANING_METHODS, RECIPE_DIETARY_NEEDS, RECIPE_OCCASIONS, toOptionNames } from '../../components/recipes/RecipeFieldChips';

const AGE_PRESETS: { label: string; min?: number; max?: number }[] = [
  { label: 'All Ages' },
  { label: '6-12 mos', min: 6, max: 12 },
  { label: '12-24 mos', min: 12, max: 24 },
  { label: '24+ mos', min: 24 },
];

const SearchRecipeScreen = ({ navigation }: any) => {
  const { colors, isDark } = useAppTheme();
  const [query, setQuery] = useState('');
  const [ageIndex, setAgeIndex] = useState(0);
  const [selectedMealType, setSelectedMealType] = useState('');
  const [selectedWeaning, setSelectedWeaning] = useState('');
  const [selectedDiet, setSelectedDiet] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState('');

  const [mealTypes, setMealTypes] = useState(RECIPE_MEAL_TYPES);
  const [weaningMethods, setWeaningMethods] = useState(RECIPE_WEANING_METHODS);
  const [dietaryNeedsList, setDietaryNeedsList] = useState(RECIPE_DIETARY_NEEDS);
  const [occasionsList, setOccasionsList] = useState(RECIPE_OCCASIONS);

  const [results, setResults] = useState<RecipeListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    recipeService.getMeta().then((meta: RecipeMetadata) => {
      if (meta.mealTypes?.length) setMealTypes(meta.mealTypes);
      if (meta.weaningMethods?.length) setWeaningMethods(meta.weaningMethods);
      if (meta.dietaryNeeds?.length) setDietaryNeedsList(meta.dietaryNeeds);
      if (meta.occasions?.length) setOccasionsList(meta.occasions);
    }).catch((e) => console.warn('Could not load recipe search meta:', e));
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const preset = AGE_PRESETS[ageIndex];
      const selectedMealObj = mealTypes.find((m) => m.name === selectedMealType);

      const data = await recipeService.search({
        query: query.trim() || undefined,
        mealTypeId: selectedMealObj?.id,
        mealType: selectedMealType || undefined,
        weaningMethod: selectedWeaning || undefined,
        dietaryNeeds: selectedDiet || undefined,
        occasion: selectedOccasion || undefined,
        minAge: preset.min,
        maxAge: preset.max,
      });
      setResults(data);
    } catch (e) {
      console.error('Search error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setQuery('');
    setAgeIndex(0);
    setSelectedMealType('');
    setSelectedWeaning('');
    setSelectedDiet('');
    setSelectedOccasion('');
    setResults([]);
    setSearched(false);
  };

  const hasActiveFilters = Boolean(query || ageIndex !== 0 || selectedMealType || selectedWeaning || selectedDiet || selectedOccasion);

  const renderFilterChips = (title: string, options: string[], selectedValue: string, onSelect: (val: string) => void) => (
    <View style={styles.filterSection}>
      <Text style={[styles.filterLabel, { color: colors.text }]}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {options.map((opt) => {
          const isSelected = opt === selectedValue;
          return (
            <TouchableOpacity
              key={opt}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? '#FF5F70' : isDark ? '#3A2E31' : '#FFF0F2',
                  borderColor: isSelected ? '#FF5F70' : isDark ? '#4A3236' : '#FFE2E6',
                },
              ]}
              onPress={() => onSelect(isSelected ? '' : opt)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, { color: isSelected ? '#FFFFFF' : colors.text }]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.searchBarBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Icon source="magnify" size={20} color="#FF5F70" />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search by name, ingredient, keyword..."
          placeholderTextColor={colors.textSoft}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon source="close-circle" size={18} color={colors.textSoft} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.filtersScroll} showsVerticalScrollIndicator={false}>
        {/* Age Filter */}
        <View style={styles.filterSection}>
          <Text style={[styles.filterLabel, { color: colors.text }]}>Target Age</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {AGE_PRESETS.map((item, idx) => {
              const isSelected = ageIndex === idx;
              return (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? '#FF5F70' : isDark ? '#3A2E31' : '#FFF0F2',
                      borderColor: isSelected ? '#FF5F70' : isDark ? '#4A3236' : '#FFE2E6',
                    },
                  ]}
                  onPress={() => setAgeIndex(idx)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, { color: isSelected ? '#FFFFFF' : colors.text }]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Meal Type Filter */}
        {renderFilterChips('Recipe Type', toOptionNames(mealTypes), selectedMealType, setSelectedMealType)}

        {/* Weaning Method Filter */}
        {renderFilterChips('Weaning Method', toOptionNames(weaningMethods), selectedWeaning, setSelectedWeaning)}

        {/* Dietary Needs Filter */}
        {renderFilterChips('Dietary Needs', toOptionNames(dietaryNeedsList), selectedDiet, setSelectedDiet)}

        {/* Occasion Filter */}
        {renderFilterChips('Occasion', toOptionNames(occasionsList), selectedOccasion, setSelectedOccasion)}

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} activeOpacity={0.85}>
            <Icon source="magnify" size={18} color="#FFFFFF" />
            <Text style={styles.searchBtnText}>Search & Filter</Text>
          </TouchableOpacity>

          {hasActiveFilters && (
            <TouchableOpacity style={[styles.clearBtn, { borderColor: colors.border }]} onPress={handleClearFilters} activeOpacity={0.85}>
              <Text style={[styles.clearBtnText, { color: colors.textSoft }]}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading && <ActivityIndicator size="large" color="#FF5F70" style={{ marginTop: 24 }} />}

        {!loading && searched && (
          <View style={styles.resultsContainer}>
            <Text style={[styles.resultsHeader, { color: colors.text }]}>
              Results ({results.length})
            </Text>
            {results.length > 0 ? (
              results.map((item) => (
                <RecipeItem
                  key={String(item.id)}
                  recipe={item}
                  onPress={() => navigation.navigate('RecipeDetail', { id: item.id })}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Icon source="food-off" size={44} color={colors.textSoft} />
                <Text style={[styles.emptyText, { color: colors.textSoft }]}>No matching recipes found</Text>
                <Text style={[styles.emptySubText, { color: colors.textSoft }]}>Try adjusting your keywords or category filters</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  searchBarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderWidth: 1,
    marginBottom: 10,
    shadowColor: '#FF5F70',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput: { flex: 1, paddingVertical: 10, paddingHorizontal: 8, fontSize: 14 },
  filtersScroll: { flex: 1 },
  filterSection: { marginBottom: 12 },
  filterLabel: { fontSize: 13, fontWeight: '700', marginBottom: 6 },
  chipRow: { gap: 8, paddingVertical: 2 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: '700' },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 8, marginBottom: 16 },
  searchBtn: {
    flex: 1,
    backgroundColor: '#FF5F70',
    borderRadius: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#FF5F70',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  searchBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  clearBtn: {
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearBtnText: { fontWeight: '700', fontSize: 13 },
  resultsContainer: { paddingTop: 8, paddingBottom: 40 },
  resultsHeader: { fontSize: 16, fontWeight: '800', marginBottom: 12 },
  emptyContainer: { alignItems: 'center', marginTop: 30, gap: 6 },
  emptyText: { textAlign: 'center', fontSize: 15, fontWeight: '700' },
  emptySubText: { textAlign: 'center', fontSize: 13 },
});

export default SearchRecipeScreen;