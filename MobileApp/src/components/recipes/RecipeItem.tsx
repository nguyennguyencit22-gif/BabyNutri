import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { RecipeListItem } from '../../types/recipe';
import { useAppTheme } from '../../theme/useAppTheme';

interface Props {
  recipe: RecipeListItem;
  onPress: () => void;
}

const RecipeItem: React.FC<Props> = ({ recipe, onPress }) => {
  const { colors, isDark } = useAppTheme();

  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image source={{ uri: recipe.image_url }} style={[styles.thumb, { backgroundColor: isDark ? '#3A2E31' : '#EEE' }]} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{recipe.name}</Text>
        <Text style={[styles.meta, { color: colors.textSoft }]}>{recipe.month_age}+ months • {recipe.calories} kcal • {recipe.cooking_time} mins</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 8,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  thumb: { width: 64, height: 64, borderRadius: 10, marginRight: 12 },
  content: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  meta: { fontSize: 12 },
});

export default RecipeItem;