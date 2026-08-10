import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity, Alert, Share, Modal, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { useSelector } from 'react-redux';
import { recipeService } from '../../services/recipe.service';
import { articleService } from '../../services/article.service';
import { mealPlanService } from '../../services/mealPlanService';
import { useBookmarkStore } from '../../stores/useBookmarkStore';
import { Recipe } from '../../types/recipe';
import IngredientItem from '../../components/recipes/IngredientItem';
import type { RootState } from '../../store/store';

import { Icon } from 'react-native-paper';

function getSlotFromTime(timeStr: string): 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner' {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 'Breakfast';
  let hour = parseInt(match[1], 10);
  const ampm = match[3].toUpperCase();

  if (ampm === 'PM' && hour < 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;

  if (hour >= 5 && hour < 11) return 'Breakfast';
  if (hour >= 11 && hour < 14) return 'Lunch';
  if (hour >= 14 && hour < 17) return 'Snack';
  return 'Dinner';
}

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

  const selectedBabyIdFromRedux = useSelector((state: RootState) => state.baby.selectedBabyId);
  const babies = useSelector((state: RootState) => state.baby.babies);
  const activeBabyId = String(selectedBabyIdFromRedux || '1');
  const selectedBaby = useMemo(() => babies.find(b => String(b.id) === activeBabyId) || babies[0], [babies, activeBabyId]);

  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // Freely Selectable Hour & Minute State (00 to 59)
  const [hour, setHour] = useState<number>(8);
  const [minuteNum, setMinuteNum] = useState<number>(0);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

  const selectedTimeStr = useMemo(() => {
    const formattedHour = String(hour).padStart(2, '0');
    const formattedMinute = String(minuteNum).padStart(2, '0');
    return `${formattedHour}:${formattedMinute} ${period}`;
  }, [hour, minuteNum, period]);

  const targetSlot = useMemo(() => {
    return getSlotFromTime(selectedTimeStr);
  }, [selectedTimeStr]);

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
        'Login Required',
        'Please log in to save recipes to your favorites.',
        [
          { text: 'Later', style: 'cancel' },
          { text: 'Log In', onPress: () => navigation.navigate('Login') },
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
        'Login Required',
        'Please log in to save recipes to your favorites.',
        [
          { text: 'Later', style: 'cancel' },
          { text: 'Log In', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }
    setLiked(!liked);
  };

  const handleOpenScheduleModal = () => {
    if (authMode === 'guest') {
      Alert.alert(
        'Login Required',
        'Please log in to schedule meal plans for your baby.',
        [
          { text: 'Later', style: 'cancel' },
          { text: 'Log In', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }
    setScheduleModalVisible(true);
  };

  const [selectedMealSlot, setSelectedMealSlot] = useState<'Breakfast' | 'Lunch' | 'Snack' | 'Dinner'>('Breakfast');

  const handleApplyToSchedule = async () => {
    if (!recipe) return;
    const targetDay = weekDays[selectedDayIndex];

    try {
      await mealPlanService.addRecipeToMealPlan({
        childId: activeBabyId,
        dateStr: targetDay.dateStr,
        mealType: selectedMealSlot,
        recipe: {
          id: recipe.id,
          name: recipe.name,
          calories: recipe.calories,
          image_url: recipe.image_url,
          protein: recipe.protein,
          fat: recipe.fat,
          carbohydrate: recipe.carbohydrate,
          description: `Scheduled for ${selectedBaby?.name || 'baby'} in ${selectedMealSlot} slot`,
        },
      });

      setScheduleModalVisible(false);

      Alert.alert(
        'Added to Schedule',
        `Scheduled "${recipe.name}" in ${selectedMealSlot} slot for ${selectedBaby?.name || 'baby'} on ${targetDay.label}!`,
        [
          { text: 'OK' },
          {
            text: 'View Meal Plan',
            onPress: () => {
              navigation.navigate('MealPlanList', { childId: activeBabyId, dateStr: targetDay.dateStr });
            },
          },
        ]
      );
    } catch (e: any) {
      console.error(e);
      setScheduleModalVisible(false);
      Alert.alert('Duplicate Recipe Warning', e?.message || `"${recipe.name}" is already in schedule for this date!`);
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
            <Icon source="chevron-left" size={24} color="#FF7A59" />
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
              <Icon source="calendar-plus" size={20} color="#FFFFFF" />
              <Text style={styles.schedulePrimaryBtnText}>Add to Meal Schedule</Text>
            </View>
          </TouchableOpacity>

          {/* Edit & Delete Recipe Buttons (Only Expert or Admin) */}
          {isStaffOrAdmin && (
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.editBtn} onPress={handleEdit}>
                <Icon source="pencil" size={18} color="#FF7A59" />
                <Text style={styles.editBtnText}>Edit Recipe</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} disabled={deleting}>
                <Icon source="delete-outline" size={18} color="#DC2626" />
                <Text style={styles.deleteBtnText}>{deleting ? 'Deleting...' : 'Delete Recipe'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Social Bar */}
          <View style={styles.socialBar}>
            <TouchableOpacity style={styles.socialBtn} onPress={handleToggleLike}>
              <Icon source={liked ? 'heart' : 'heart-outline'} size={20} color={liked ? '#FF3B30' : '#65676B'} />
              <Text style={[styles.socialText, liked && { color: '#FF3B30' }]}>
                {liked ? 'Liked' : 'Like'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialBtn} onPress={handleShareRecipe}>
              <Icon source="share-variant" size={20} color="#65676B" />
              <Text style={styles.socialText}>Share</Text>
            </TouchableOpacity>

            {isExpert && (
              <TouchableOpacity style={[styles.socialBtn, styles.postFeedHighlightBtn]} onPress={handlePostRecipeToFeed}>
                <Icon source="newspaper-plus" size={20} color="#FF7A59" />
                <Text style={[styles.socialText, { color: '#FF7A59', fontWeight: '700' }]}>Post</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.socialBtn} onPress={toggleSaveRecipe}>
              <Icon source={saved ? 'bookmark' : 'bookmark-outline'} size={20} color={saved ? '#FF7A59' : '#65676B'} />
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

      {/* Fast & Easy Modal: Add Dish to Schedule (Select Day & Meal Slot Sáng/Trưa/Phụ/Tối) */}
      <Modal visible={scheduleModalVisible} transparent animationType="fade" onRequestClose={() => setScheduleModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setScheduleModalVisible(false)}>
          <View style={styles.scheduleModalBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
              <Icon source="clock-outline" size={20} color="#FF5F70" />
              <Text style={styles.modalTitle}>Add to Meal Schedule</Text>
            </View>
            <Text style={styles.modalSubTitle}>Dish: "{recipe?.name}" ({recipe?.calories} kcal)</Text>

            {/* Step 1: Select Day of Week */}
            <Text style={styles.modalLabel}>1. Select Day of Week:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
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

            {/* Step 2: Select Meal Slot (Sáng, Trưa, Phụ, Tối) */}
            <Text style={styles.modalLabel}>2. Select Meal Slot:</Text>
            <View style={styles.slotSelectGrid}>
              {[
                { key: 'Breakfast', label: '🌅 Breakfast' },
                { key: 'Lunch', label: '☀️ Lunch' },
                { key: 'Snack', label: '🍎 Snack' },
                { key: 'Dinner', label: '🌙 Dinner' },
              ].map(slot => {
                const isSelected = selectedMealSlot === slot.key;
                return (
                  <TouchableOpacity
                    key={slot.key}
                    style={[styles.slotSelectCard, isSelected && styles.slotSelectCardActive]}
                    onPress={() => setSelectedMealSlot(slot.key as any)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.slotSelectText, isSelected && styles.slotSelectTextActive]}>{slot.label}</Text>
                    {isSelected && <Text style={{ fontSize: 16, color: '#FF5F70', fontWeight: '800' }}>✓</Text>}
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
                <Text style={styles.modalApplyText}>Confirm</Text>
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
  scheduleModalBox: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, elevation: 5 },
  modalTitle: { fontSize: 17, fontWeight: '800', color: '#4B3034', textAlign: 'center' },
  modalSubTitle: { fontSize: 13, color: '#FF5F70', fontWeight: '600', textAlign: 'center', marginBottom: 12 },
  modalLabel: { fontSize: 13, fontWeight: '700', color: '#555555', marginBottom: 6 },
  dayChip: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  dayChipSelected: { backgroundColor: '#FF5F70', borderColor: '#FF5F70' },
  dayChipText: { fontSize: 12, fontWeight: '700', color: '#4B5563' },
  dayChipDate: { fontSize: 11, color: '#6B7280' },
  dayChipTextSelected: { color: '#FFFFFF' },
  liveClockBox: { backgroundColor: '#FFF0F2', borderRadius: 14, padding: 12, alignItems: 'center', marginBottom: 14, borderWidth: 1, borderColor: '#FFE4E6' },
  liveClockText: { fontSize: 26, fontWeight: '800', color: '#FF5F70', marginBottom: 2 },
  liveSlotText: { fontSize: 12, color: '#4B3034', fontWeight: '600' },
  stepperContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 14, marginBottom: 12 },
  stepperBox: { alignItems: 'center' },
  stepperLabel: { fontSize: 10, fontWeight: '700', color: '#8E7377', marginBottom: 4 },
  stepperControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF0F2', borderRadius: 14, borderWidth: 1, borderColor: '#FFE4E6', padding: 4 },
  stepBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', elevation: 1 },
  stepVal: { fontSize: 18, fontWeight: '800', color: '#4B3034', paddingHorizontal: 12 },
  colonSeparator: { fontSize: 24, fontWeight: '800', color: '#FF5F70', marginTop: 12 },
  quickChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: '#FFF0F2', borderWidth: 1, borderColor: '#FFE4E6' },
  activeQuickChip: { backgroundColor: '#FF5F70', borderColor: '#FF5F70' },
  quickChipText: { fontSize: 11, fontWeight: '700', color: '#4B3034' },
  activeQuickChipText: { color: '#FFFFFF' },
  periodRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  periodBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: '#FFF0F2', alignItems: 'center', borderWidth: 1, borderColor: '#FFE4E6' },
  activePeriodBtn: { backgroundColor: '#FF5F70', borderColor: '#FF5F70' },
  periodText: { fontSize: 12, fontWeight: '700', color: '#4B3034' },
  activePeriodText: { color: '#FFFFFF' },
  modalBtnRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalCancelBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#F3F4F6' },
  modalCancelText: { color: '#6B7280', fontWeight: '600' },
  modalApplyBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#FF5F70' },
  modalApplyText: { color: '#FFFFFF', fontWeight: '700' },
  slotSelectGrid: { gap: 8, marginBottom: 16 },
  slotSelectCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFF0F2', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: '#FFE4E6' },
  slotSelectCardActive: { backgroundColor: '#FFFFFF', borderColor: '#FF5F70', elevation: 2 },
  slotSelectText: { fontSize: 13, fontWeight: '700', color: '#4B3034' },
  slotSelectTextActive: { color: '#FF5F70' },
  slotTimeText: { fontSize: 11, color: '#8E7377', marginTop: 2 },
  slotTimeTextActive: { color: '#FF5F70' },
});

export default RecipeDetailScreen;