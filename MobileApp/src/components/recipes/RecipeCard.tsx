import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { RecipeListItem } from '../../types/recipe';

interface Props {
  recipe: RecipeListItem;
  onPress: () => void;
}

const RecipeCard: React.FC<Props> = ({ recipe, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
    <Image source={{ uri: recipe.image_url }} style={styles.image} />
    <View style={styles.info}>
      <Text style={styles.title} numberOfLines={2}>{recipe.name}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>{recipe.month_age}+ tháng</Text>
        <Text style={styles.dotSep}>•</Text>
        <Text style={styles.meta}>{recipe.calories} kcal</Text>
      </View>
      <Text style={styles.meta}>⏱ {recipe.cooking_time} phút</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: { width: '48%', backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  image: { width: '100%', height: 110, backgroundColor: '#EEE' },
  info: { padding: 10 },
  title: { fontSize: 14, fontWeight: '700', color: '#2E2E2E', marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  meta: { fontSize: 12, color: '#8A8A8A' },
  dotSep: { marginHorizontal: 4, color: '#8A8A8A' },
});

export default RecipeCard;