import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Icon } from 'react-native-paper';
import { recipeService } from '../../services/recipe.service';
import { RecipeListItem } from '../../types/recipe';
import RecipeItem from '../../components/recipes/RecipeItem';
import CategoryChip from '../../components/recipes/CategoryChip';
import { useAppTheme } from '../../theme/useAppTheme';

const AGE_PRESETS: { label: string; min?: number; max?: number; type?: string }[] = [
  { label: 'All' },
  { label: '6-12 months', min: 6, max: 12 },
  { label: '12-24 months', min: 12, max: 24 },
  { label: '24+ months', min: 24 },
];

const SearchRecipeScreen = ({ navigation }: any) => {
  const { colors, isDark } = useAppTheme();
  const [query, setQuery] = useState('');
  const [ageIndex, setAgeIndex] = useState(0);
  const [results, setResults] = useState<RecipeListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const preset = AGE_PRESETS[ageIndex];
      let data = await recipeService.search({
        query: query.trim() || (preset.type ? preset.type : undefined),
        minAge: preset.min,
        maxAge: preset.max,
      });
      if (preset.type && query.trim()) {
        data = data.filter(r => r.name.toLowerCase().includes(preset.type!));
      }
      setResults(data);
    } catch (e) {
      console.error('Search error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.searchBarBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Icon source="magnify" size={18} color="#FF6B4A" />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Enter recipe name or ingredient..."
          placeholderTextColor={colors.textSoft}
          defaultValue={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>

      <Text style={[styles.filterLabel, { color: colors.text }]}>Category & Age</Text>
      <FlatList
        horizontal
        data={AGE_PRESETS}
        keyExtractor={(item) => item.label}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <CategoryChip label={item.label} active={ageIndex === index} onPress={() => setAgeIndex(index)} />
        )}
        contentContainerStyle={styles.chipList}
      />

      <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} activeOpacity={0.85}>
        <Text style={styles.searchBtnText}>Search Recipes</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#FF6B4A" style={{ marginTop: 30 }} />}

      {!loading && searched && (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <RecipeItem recipe={item} onPress={() => navigation.navigate('RecipeDetail', { id: item.id })} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSoft }]}>No matching recipes found</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18 },
  searchBarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#FF7A59',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: { flex: 1, paddingVertical: 10, paddingHorizontal: 8, fontSize: 14 },
  filterLabel: { fontSize: 13, fontWeight: '700', marginBottom: 10 },
  chipList: { paddingBottom: 10, gap: 8 },
  searchBtn: {
    backgroundColor: '#FF6B4A',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#FF6B4A',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  searchBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { textAlign: 'center', fontSize: 14, fontWeight: '500' },
});

export default SearchRecipeScreen;