import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { recipeService } from '../../services/recipe.service';
import { RecipeListItem } from '../../types/recipe';
import RecipeItem from '../../components/recipes/RecipeItem';
import CategoryChip from '../../components/recipes/CategoryChip';

const SearchIcon = ({ size = 18, color = '#6B7280' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z" />
  </Svg>
);

const AGE_PRESETS: { label: string; min?: number; max?: number; type?: string }[] = [
  { label: 'Tất cả' },
  { label: '6-12 tháng', min: 6, max: 12 },
  { label: '12-24 tháng', min: 12, max: 24 },
  { label: '24+ tháng', min: 24 },
];

const SearchRecipeScreen = ({ navigation }: any) => {
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
    <View style={styles.container}>
      <View style={styles.searchBarBox}>
        <SearchIcon size={18} color="#FF6B4A" />
        <TextInput
          style={styles.searchInput}
          placeholder="Nhập tên món ăn hoặc thành phần..."
          placeholderTextColor="#9CA3AF"
          defaultValue={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>

      <Text style={styles.filterLabel}>Phân loại & Độ tuổi</Text>
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
        <Text style={styles.searchBtnText}>Tìm kiếm công thức</Text>
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
              <Text style={styles.emptyText}>Không tìm thấy công thức món ăn nào phù hợp</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F5', padding: 18 },
  searchBarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#FFE0D6',
    marginBottom: 16,
    shadowColor: '#FF7A59',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: { flex: 1, paddingVertical: 10, paddingHorizontal: 8, fontSize: 14, color: '#111827' },
  filterLabel: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 10 },
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
  emptyText: { textAlign: 'center', color: '#9CA3AF', fontSize: 14, fontWeight: '500' },
});

export default SearchRecipeScreen;