import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity, Alert, Share, Modal, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { useSelector } from 'react-redux';
import { recipeService } from '../../services/recipe.service';
import { articleService } from '../../services/article.service';
import { mealPlanService } from '../../services/mealPlanService';
import { useBookmarkStore } from '../../stores/useBookmarkStore';
import { Recipe } from '../../types/recipe';
import IngredientItem from '../../components/recipes/IngredientItem';
import type { RootState } from '../../store/store';

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

const CalendarPlusIcon = ({ size = 18, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18M12 13v6M9 16h6" />
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

  const authMode = useSelector((state: RootState) => state.auth.mode);
  const user = useSelector((state: RootState) => state.auth.user);
  const isExpert = authMode === 'authenticated' && user?.role === 'expert';
  const isStaffOrAdmin = authMode === 'authenticated' && (user?.role === 'expert' || user?.role === 'admin');

  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<'Breakfast' | 'Lunch' | 'Snack' | 'Dinner'>('Breakfast');
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const weekDays = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay();
    const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));

    const days = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push({
        label: dayNames[i],
        dateStr: d.toISOString().split('T')[0],
        dateNum: d.getDate(),
      });
    }
    return days;
  }, []);

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
    if (!isExpert) return;
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
    if (authMode === 'guest') {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Bạn cần có tài khoản để lưu công thức vào danh sách yêu thích.',
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    const isNowSaved = toggleBookmarkRecipe(id);
    if (isNowSaved) {
      Alert.alert('Recipe Saved', 'Added recipe to favorites');
    } else {
      Alert.alert('Unsaved', 'Removed recipe from favorites');
    }
  };

  const handleToggleLike = () => {
    if (authMode === 'guest') {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Bạn cần có tài khoản để yêu thích công thức.',
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }
    setLiked(!liked);
  };

  const handleOpenScheduleModal = () => {
    if (authMode === 'guest') {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Bạn cần có tài khoản để lên kế hoạch thực đơn cho bé.',
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }
    setScheduleModalVisible(true);
  };

  const handleApplyToSchedule = async () => {
    if (!recipe) return;
    const targetDay = weekDays[selectedDayIndex];
    try {
      await mealPlanService.addRecipeToMealPlan({
        childId: '1',
        dateStr: targetDay.dateStr,
        mealType: selectedMealType,
        recipe: {
          id: recipe.id,
          name: recipe.name,
          calories: recipe.calories,
          image_url: recipe.image_url,
          protein: recipe.protein,
          fat: recipe.fat,
          carbohydrate: recipe.carbohydrate,
          description: recipe.description,
        },
      });

      setScheduleModalVisible(false);

      Alert.alert(
        'Added to Schedule',
        `Added "${recipe.name}" to ${selectedMealType} for ${targetDay.label}!`,
        [
          { text: 'Stay Here' },
          {
            text: 'View Meal Plan',
            onPress: () => {
              navigation.navigate('MealPlanList', { childId: '1', dateStr: targetDay.dateStr });
            },
          },
        ]
      );
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Unable to add dish to schedule');
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
          
          {/* Primary Action: Add to Schedule Button (No duplicate icons!) */}
          <TouchableOpacity 
            style={styles.schedulePrimaryBtn}
            onPress={handleOpenScheduleModal}
            activeOpacity={0.88}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <CalendarPlusIcon size={18} color="#FFFFFF" />
              <Text style={styles.schedulePrimaryBtnText}>Add to Meal Schedule</Text>
            </View>
          </TouchableOpacity>

          {/* Edit & Delete Recipe Buttons (Only Expert or Admin) */}
          {isStaffOrAdmin && (
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
          )}

          {/* Social Bar */}
          <View style={styles.socialBar}>
            <TouchableOpacity style={styles.socialBtn} onPress={handleToggleLike}>
              <HeartIcon liked={liked} size={18} />
              <Text style={[styles.socialText, liked && { color: '#FF3B30' }]}>
                {liked ? 'Liked' : 'Like'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialBtn} onPress={handleShareRecipe}>
              <ShareIcon size={18} />
              <Text style={styles.socialText}>Share</Text>
            </TouchableOpacity>

            {isExpert && (
              <TouchableOpacity style={[styles.socialBtn, styles.postFeedHighlightBtn]} onPress={handlePostRecipeToFeed}>
                <PostFeedIcon size={18} color="#FF7A59" />
                <Text style={[styles.socialText, { color: '#FF7A59', fontWeight: '700' }]}>Post</Text>
              </TouchableOpacity>
            )}

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

      {/* Interactive Modal: Add Dish to Schedule */}
      <Modal visible={scheduleModalVisible} transparent animationType="fade" onRequestClose={() => setScheduleModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setScheduleModalVisible(false)}>
          <View style={styles.scheduleModalBox}>
            <Text style={styles.modalTitle}>Add "{recipe.name}" to Schedule</Text>

            {/* Select Day */}
            <Text style={styles.modalLabel}>1. Select Day of Week:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {weekDays.map((day, idx) => {
                const isSelected = idx === selectedDayIndex;
                return (
                  <TouchableOpacity
                    key={day.label}
                    style={[styles.dayChip, isSelected && styles.dayChipSelected]}
                    onPress={() => setSelectedDayIndex(idx)}
                  >
                    <Text style={[styles.dayChipText, isSelected && styles.dayChipTextSelected]}>{day.label}</Text>
                    <Text style={[styles.dayChipDate, isSelected && styles.dayChipTextSelected]}>{day.dateNum}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Select Meal Slot */}
            <Text style={styles.modalLabel}>2. Select Meal Time:</Text>
            <View style={styles.mealTypeRow}>
              {[
                { type: 'Breakfast', icon: '🍳', time: '08:00 AM' },
                { type: 'Lunch', icon: '🍲', time: '11:30 AM' },
                { type: 'Snack', icon: '🥛', time: '03:00 PM' },
                { type: 'Dinner', icon: '🥣', time: '06:00 PM' },
              ].map((m) => {
                const isSelected = selectedMealType === m.type;
                return (
                  <TouchableOpacity
                    key={m.type}
                    style={[styles.mealTypeBtn, isSelected && styles.mealTypeBtnSelected]}
                    onPress={() => setSelectedMealType(m.type as any)}
                  >
                    <Text style={styles.mealTypeIcon}>{m.icon}</Text>
                    <Text style={[styles.mealTypeText, isSelected && styles.mealTypeTextSelected]}>{m.type}</Text>
                    <Text style={[styles.mealTypeTime, isSelected && styles.mealTypeTimeSelected]}>{m.time}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Modal Actions */}
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setScheduleModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalApplyBtn} onPress={handleApplyToSchedule}>
                <Text style={styles.modalApplyText}>Apply & View Plan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
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
  image: { width: '100%', height: 230, backgroundColor: '#EEE' },
  content: { padding: 18 },
  title: { fontSize: 22, fontWeight: '800', color: '#2E2E2E', marginBottom: 4 },
  author: { fontSize: 13, color: '#FF7A59', fontWeight: '600', marginBottom: 12 },
  schedulePrimaryBtn: {
    backgroundColor: '#FF5F70',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#FF5F70',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  schedulePrimaryBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  editBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#FFF0ED', paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#FFE2DB' },
  editBtnText: { color: '#FF7A59', fontWeight: '700', fontSize: 13 },
  deleteBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#FEF2F2', paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#FEE2E2' },
  deleteBtnText: { color: '#DC2626', fontWeight: '700', fontSize: 13 },
  socialBar: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 12, marginBottom: 16, borderWidth: 1, borderColor: '#EAEAEA' },
  socialBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4 },
  postFeedHighlightBtn: { backgroundColor: '#FFF0F2', borderRadius: 12, paddingHorizontal: 12 },
  socialText: { fontSize: 13, color: '#65676B', fontWeight: '600' },
  desc: { fontSize: 14, color: '#555555', lineHeight: 22, marginBottom: 16 },
  nutritionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, gap: 8 },
  nutBox: { flex: 1, backgroundColor: '#FFFFFF', paddingVertical: 10, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#EAEAEA' },
  nutValue: { fontSize: 15, fontWeight: '800', color: '#FF7A59' },
  nutLabel: { fontSize: 11, color: '#888888', marginTop: 2 },
  meta: { fontSize: 12, color: '#888888', marginBottom: 12 },
  allergyTag: { fontSize: 12, color: '#DC2626', fontWeight: '600', marginBottom: 12, backgroundColor: '#FEF2F2', padding: 8, borderRadius: 8 },
  section: { fontSize: 17, fontWeight: '700', color: '#2E2E2E', marginTop: 14, marginBottom: 10 },
  stepRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-start' },
  stepNumber: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FF7A59', color: '#FFFFFF', textAlign: 'center', lineHeight: 24, fontWeight: '700', fontSize: 12, marginRight: 10 },
  stepText: { flex: 1, fontSize: 14, color: '#3A3A3A', lineHeight: 20 },
  floatingBackBtn: { position: 'absolute', top: 14, left: 14, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255, 255, 255, 0.95)', justifyContent: 'center', alignItems: 'center', elevation: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  scheduleModalBox: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, elevation: 5 },
  modalTitle: { fontSize: 17, fontWeight: '800', color: '#2E2E2E', marginBottom: 14, textAlign: 'center' },
  modalLabel: { fontSize: 13, fontWeight: '700', color: '#555555', marginBottom: 8 },
  dayChip: { width: 50, height: 50, borderRadius: 14, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  dayChipSelected: { backgroundColor: '#FF5F70', borderColor: '#FF5F70' },
  dayChipText: { fontSize: 12, fontWeight: '700', color: '#4B5563' },
  dayChipDate: { fontSize: 11, color: '#6B7280' },
  dayChipTextSelected: { color: '#FFFFFF' },
  mealTypeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  mealTypeBtn: { width: '48%', backgroundColor: '#F9FAFB', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' },
  mealTypeBtnSelected: { backgroundColor: '#FFF0F2', borderColor: '#FF5F70' },
  mealTypeIcon: { fontSize: 20, marginBottom: 2 },
  mealTypeText: { fontSize: 13, fontWeight: '700', color: '#374151' },
  mealTypeTextSelected: { color: '#FF5F70' },
  mealTypeTime: { fontSize: 11, color: '#9CA3AF' },
  mealTypeTimeSelected: { color: '#FF5F70' },
  modalBtnRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalCancelBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#F3F4F6' },
  modalCancelText: { color: '#6B7280', fontWeight: '600' },
  modalApplyBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#FF5F70' },
  modalApplyText: { color: '#FFFFFF', fontWeight: '700' },
});

export default RecipeDetailScreen;