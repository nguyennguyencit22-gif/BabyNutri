import React, { useState, useCallback } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity, Alert, Share } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { recipeService } from '../../services/recipe.service';
import { articleService } from '../../services/article.service';
import { useBookmarkStore } from '../../stores/useBookmarkStore';
import { Recipe } from '../../types/recipe';
import IngredientItem from '../../components/recipes/IngredientItem';

const EditIcon = ({ color = '#FF7A59', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </Svg>
);

const TrashIcon = ({ color = '#DC2626', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
  </Svg>
);

const HeartIcon = ({ liked, size = 18 }: { liked?: boolean; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={liked ? '#FF3B30' : 'none'} stroke={liked ? '#FF3B30' : '#65676B'} strokeWidth={2}>
    <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </Svg>
);

const ShareIcon = ({ size = 18 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#65676B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
  </Svg>
);

const PostFeedIcon = ({ size = 18, color = '#FF7A59' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
  </Svg>
);

const BookmarkIcon = ({ saved, size = 18 }: { saved?: boolean; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={saved ? '#FF7A59' : 'none'} stroke={saved ? '#FF7A59' : '#65676B'} strokeWidth={2}>
    <Path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
  </Svg>
);

const BackIcon = ({ size = 20, color = '#FF5F70' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M15 19l-7-7 7-7" />
  </Svg>
);

const RecipeDetailScreen = ({ route, navigation }: any) => {
  const id = Number(route?.params?.id);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [liked, setLiked] = useState(false);

  const fetchDetail = useCallback(() => {
    setLoading(true);
    recipeService.getById(id)
      .then(setRecipe)
      .catch((e) => console.error('Load detail error:', e))
      .finally(() => setLoading(false));
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchDetail();
    }, [fetchDetail])
  );

  const handleEdit = () => {
    navigation.navigate('EditRecipe', { id });
  };

  const handleShareRecipe = async () => {
    if (!recipe) return;
    try {
      await Share.share({
        message: `🥗 Baby recipe: ${recipe.name}\n\nIngredients: ${recipe.ingredients.join(', ')}\n\nSee more on BabyNutri app!`,
        title: recipe.name,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handlePostRecipeToFeed = async () => {
    if (!recipe) return;
    try {
      await articleService.create({
        title: `Recipe: ${recipe.name}`,
        summary: `Sharing baby recipe (${recipe.month_age}+ months) · ${recipe.calories} kcal`,
        content: `Description: ${recipe.description || 'Nutritious weaning recipe.'}\n\nIngredients:\n- ${recipe.ingredients.join('\n- ')}\n\nStep-by-step instructions:\n${recipe.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`,
        imageUrl: recipe.image_url,
      });
      Alert.alert(
        'Shared as Article',
        'Created a post sharing this recipe on Nutrition Feed!',
        [
          { text: 'Stay' },
          { text: 'View Feed', onPress: () => navigation.navigate('Articles') },
        ]
      );
    } catch (e) {
      console.error('Post recipe to feed error:', e);
      Alert.alert('Error', 'Unable to share post right now');
    }
  };

  const { savedRecipeIds, toggleBookmarkRecipe } = useBookmarkStore();
  const saved = savedRecipeIds.includes(id);

  const toggleSaveRecipe = () => {
    const isNowSaved = toggleBookmarkRecipe(id);
    if (isNowSaved) {
      Alert.alert('Recipe Saved', 'Added recipe to favorites');
    } else {
      Alert.alert('Unsaved', 'Removed recipe from favorites');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Recipe',
      'Are you sure you want to delete this recipe from system?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await recipeService.remove(id);
              Alert.alert('Success', 'Recipe deleted', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (e) {
              console.error('Delete recipe error:', e);
              Alert.alert('Error', 'Unable to delete this recipe');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#FF7A59" /></View>;
  if (!recipe) return <View style={styles.center}><Text>Recipe not found</Text></View>;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={{ position: 'relative' }}>
          <Image source={{ uri: recipe.image_url }} style={styles.image} />
          <TouchableOpacity 
            style={styles.floatingBackBtn} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <BackIcon size={20} color="#FF7A59" />
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{recipe.name}</Text>
        {!!recipe.expertName && <Text style={styles.author}>Expert: {recipe.expertName}</Text>}
        
        {/* Nút Sửa & Xóa công thức */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.editBtn} onPress={handleEdit}>
            <EditIcon color="#FF7A59" size={16} />
            <Text style={styles.editBtnText}>Edit Recipe</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} disabled={deleting}>
            <TrashIcon color="#DC2626" size={16} />
            <Text style={styles.deleteBtnText}>{deleting ? 'Deleting...' : 'Delete Recipe'}</Text>
          </TouchableOpacity>
        </View>

        {/* Thanh tương tác Chia sẻ / Đăng bài Feed / Thả tim / Lưu công thức */}
        <View style={styles.socialBar}>
          <TouchableOpacity style={styles.socialBtn} onPress={() => setLiked(!liked)}>
            <HeartIcon liked={liked} size={18} />
            <Text style={[styles.socialText, liked && { color: '#FF3B30' }]}>
              {liked ? 'Liked' : 'Like'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialBtn} onPress={handleShareRecipe}>
            <ShareIcon size={18} />
            <Text style={styles.socialText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.socialBtn, styles.postFeedHighlightBtn]} onPress={handlePostRecipeToFeed}>
            <PostFeedIcon size={18} color="#FF7A59" />
            <Text style={[styles.socialText, { color: '#FF7A59', fontWeight: '700' }]}>Post</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialBtn} onPress={toggleSaveRecipe}>
            <BookmarkIcon saved={saved} size={18} />
            <Text style={[styles.socialText, saved && { color: '#FF7A59' }]}>
              {saved ? 'Saved' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.desc}>{recipe.description}</Text>

        <View style={styles.nutritionRow}>
          <NutritionBox label="Calories" value={`${recipe.calories}`} />
          <NutritionBox label="Protein" value={`${recipe.protein}g`} />
          <NutritionBox label="Fat" value={`${recipe.fat}g`} />
          <NutritionBox label="Carb" value={`${recipe.carbohydrate}g`} />
        </View>

        <Text style={styles.meta}>
          Suitable Age: {recipe.month_age}+ months
          {recipe.mealType ? ` · ${recipe.mealType}` : ''}
          {'  '}· Prep {recipe.prep_time} min · Cook {recipe.cooking_time} min · {recipe.serves} servings
        </Text>

        {!!recipe.allergies?.length && (
          <Text style={styles.allergyTag}>Allergy Note: {recipe.allergies.join(', ')}</Text>
        )}

        <Text style={styles.section}>Ingredients</Text>
        {recipe.ingredients.map((ing, i) => <IngredientItem key={i} name={ing} />)}

        <Text style={styles.section}>Instructions</Text>
        {recipe.steps.map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <Text style={styles.stepNumber}>{i + 1}</Text>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
    </View>
  );
};

const NutritionBox = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.nutBox}>
    <Text style={styles.nutValue}>{value}</Text>
    <Text style={styles.nutLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 260, backgroundColor: '#EEE' },
  content: { padding: 18 },
  title: { fontSize: 22, fontWeight: '800', color: '#2E2E2E', marginBottom: 4 },
  author: { fontSize: 12, color: '#B0B0B0', marginBottom: 10 },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  editBtn: { flex: 1, flexDirection: 'row', backgroundColor: '#FFE8DF', borderRadius: 10, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', gap: 6 },
  editBtnText: { color: '#FF7A59', fontWeight: '700', fontSize: 13 },
  deleteBtn: { flex: 1, flexDirection: 'row', backgroundColor: '#FEE2E2', borderRadius: 10, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', gap: 6 },
  deleteBtnText: { color: '#DC2626', fontWeight: '700', fontSize: 13 },
  socialBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F2F5',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 6,
  },
  postFeedHighlightBtn: {
    backgroundColor: '#FFE8DF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  socialText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#65676B',
  },
  desc: { fontSize: 14, color: '#6B6B6B', marginBottom: 16, lineHeight: 20 },
  nutritionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  nutBox: { flex: 1, backgroundColor: '#FFE8DF', borderRadius: 10, padding: 10, alignItems: 'center', marginHorizontal: 3 },
  nutValue: { fontSize: 15, fontWeight: '700', color: '#FF7A59' },
  nutLabel: { fontSize: 11, color: '#6B6B6B', marginTop: 2 },
  meta: { fontSize: 12, color: '#8A8A8A', marginBottom: 10 },
  allergyTag: { fontSize: 12, color: '#D97706', backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 16, fontWeight: '600' },
  section: { fontSize: 17, fontWeight: '700', color: '#2E2E2E', marginTop: 14, marginBottom: 10 },
  stepRow: { flexDirection: 'row', marginBottom: 10, paddingRight: 10 },
  stepNumber: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FF7A59', color: '#fff', textAlign: 'center', lineHeight: 24, fontSize: 12, fontWeight: '700', marginRight: 10 },
  stepText: { flex: 1, fontSize: 14, color: '#4A4A4A', lineHeight: 20 },
  floatingBackBtn: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
});

export default RecipeDetailScreen;