import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
  FlatList,
  Modal,
  Pressable,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import TopHeaderBar from '../../components/common/TopHeaderBar';
import { mealPlanService } from '../../services/mealPlanService';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { useRecipeStore } from '../../stores/useRecipeStore';
import { calculateBabyAgeInMonths } from '../../utils/calculateBabyAge';

const ChevronLeftIcon = ({ size = 20, color = '#FF5F70' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M15 19l-7-7 7-7" />
  </Svg>
);

const PlusIcon = ({ size = 16, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 5v14M5 12h14" />
  </Svg>
);

const MinusIcon = ({ size = 16, color = '#FF5F70' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M5 12h14" />
  </Svg>
);

const TrashIcon = ({ size = 14, color = '#FF5F70' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
  </Svg>
);

const ClockIcon = ({ size = 20, color = '#FF5F70' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </Svg>
);

const DAYS_OF_WEEK = [
  { day: 'Mon', date: 'Day 1' },
  { day: 'Tue', date: 'Day 2' },
  { day: 'Wed', date: 'Day 3' },
  { day: 'Thu', date: 'Day 4' },
  { day: 'Fri', date: 'Day 5' },
  { day: 'Sat', date: 'Day 6' },
  { day: 'Sun', date: 'Day 7' },
];

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

export const MealSchedulerScreen = ({ navigation }: any) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  const babies = useSelector((state: RootState) => state.baby.babies);
  const selectedBabyId = useSelector((state: RootState) => state.baby.selectedBabyId);
  const selectedBaby = useMemo(() => babies.find(b => String(b.id) === String(selectedBabyId)) || babies[0], [babies, selectedBabyId]);

  const babyAgeMonths = useMemo(() => calculateBabyAgeInMonths(selectedBaby?.dateOfBirth || ''), [selectedBaby]);
  const babyAllergies = useMemo(() => selectedBaby?.allergies || [], [selectedBaby]);

  const { recipes, fetchRecipes } = useRecipeStore();

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  // Dynamic Personalized Weaning Recipe Recommendations based on active babyprofile
  const recommendedRecipes = useMemo(() => {
    if (!recipes || recipes.length === 0) return [];
    
    return recipes.filter(r => {
      if (!babyAllergies || babyAllergies.length === 0) return true;
      const text = `${r.name || ''} ${(r as any).description || ''} ${JSON.stringify((r as any).ingredients || '')}`.toLowerCase();
      const hasAllergen = babyAllergies.some(allergen => allergen && text.includes(allergen.toLowerCase()));
      return !hasAllergen;
    }).slice(0, 6);
  }, [recipes, babyAllergies]);

  const [meals, setMeals] = useState<{ [key: string]: Array<any> }>({
    'Breakfast': [
      { id: 101, name: 'Pumpkin & Pork Porridge', monthAge: '6+ months', kcal: 220, protein: 8.5, fat: 4.2, carbs: 32.0, time: '08:00 AM', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500' }
    ],
    'Lunch': [
      { id: 102, name: 'Fresh Shrimp & Carrot Soup', monthAge: '7+ months', kcal: 180, protein: 10.2, fat: 3.1, carbs: 24.0, time: '11:30 AM', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500' }
    ],
    'Snack': [
      { id: 103, name: 'Banana Avocado Smoothie', monthAge: '8+ months', kcal: 140, protein: 3.5, fat: 5.0, carbs: 20.0, time: '03:00 PM', image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500' }
    ],
    'Dinner': [
      { id: 104, name: 'Salmon Potato Oatmeal Porridge', monthAge: '9+ months', kcal: 260, protein: 12.0, fat: 6.8, carbs: 35.0, time: '06:00 PM', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500' }
    ],
  });

  const [slotModalVisible, setSlotModalVisible] = useState(false);
  const [targetRecipe, setTargetRecipe] = useState<any>(null);

  // 100% Freely Selectable Hour & Minute State (00 to 59)
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

  const totalKcal = useMemo(() => {
    let sum = 0;
    Object.values(meals).forEach(mealList => {
      mealList.forEach(item => { sum += (item.kcal || item.calories || 200); });
    });
    return sum;
  }, [meals]);

  const totalProtein = useMemo(() => {
    let sum = 0;
    Object.values(meals).forEach(mealList => {
      mealList.forEach(item => { sum += (item.protein || 8.0); });
    });
    return sum.toFixed(1);
  }, [meals]);

  const openAddSlotModal = (recipe: any) => {
    setTargetRecipe(recipe);
    setHour(8);
    setMinuteNum(0);
    setPeriod('AM');
    setSlotModalVisible(true);
  };

  const handleConfirmAddDishToSlot = async () => {
    if (!targetRecipe) return;

    const recipeToAdd = {
      ...targetRecipe,
      kcal: targetRecipe.kcal || targetRecipe.calories || 200,
      protein: targetRecipe.protein || 8.0,
      time: selectedTimeStr,
    };

    setMeals(prev => ({
      ...prev,
      [targetSlot]: [...(prev[targetSlot] || []), recipeToAdd],
    }));

    const today = new Date();
    const currentDay = today.getDay();
    const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    const targetDate = new Date(monday);
    targetDate.setDate(monday.getDate() + selectedDayIndex);
    const dateStr = targetDate.toISOString().split('T')[0];

    try {
      await mealPlanService.addRecipeToMealPlan({
        childId: String(selectedBaby?.id || '1'),
        dateStr,
        mealType: targetSlot,
        recipe: {
          id: targetRecipe.id,
          name: targetRecipe.name,
          calories: recipeToAdd.kcal,
          image_url: targetRecipe.image_url || (targetRecipe as any).image,
          protein: recipeToAdd.protein,
          fat: 4.0,
          carbohydrate: 25.0,
          description: `Scheduled for ${selectedBaby?.name || 'baby'} at ${selectedTimeStr}`,
        },
      });

      setSlotModalVisible(false);

      Alert.alert(
        'Added to Schedule',
        `Scheduled "${targetRecipe.name}" at ${selectedTimeStr} (${targetSlot} slot) for ${selectedBaby?.name || 'baby'}!`,
        [
          { text: 'OK' },
          {
            text: 'View Weaning Meal Plan',
            onPress: () => {
              navigation.navigate('MealPlanList', { childId: String(selectedBaby?.id || '1'), dateStr });
            },
          },
        ]
      );
    } catch (e) {
      console.error(e);
      setSlotModalVisible(false);
    }
  };

  const handleRemoveDish = (mealType: string, index: number) => {
    setMeals(prev => {
      const updated = [...(prev[mealType] || [])];
      updated.splice(index, 1);
      return { ...prev, [mealType]: updated };
    });
  };

  const handleViewRecipeDetail = (recipeId: string | number) => {
    navigation.navigate('RecipeDetail', { id: Number(recipeId) || 1 });
  };

  const handleSaveToMealPlan = async () => {
    setSaving(true);
    try {
      const today = new Date();
      const currentDay = today.getDay();
      const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
      const monday = new Date(today.setDate(diff));
      const targetDate = new Date(monday);
      targetDate.setDate(monday.getDate() + selectedDayIndex);

      const dateStr = targetDate.toISOString().split('T')[0];
      const formattedMeals: any[] = [];

      Object.entries(meals).forEach(([type, dishList]) => {
        dishList.forEach((dish, idx) => {
          formattedMeals.push({
            id: `m-${selectedDayIndex}-${type}-${idx}`,
            name: `${type}: ${dish.name}`,
            time: dish.time || '08:00 AM',
            description: `Weaning recipe (${dish.kcal || 200} kcal)`,
            calories: dish.kcal || 200,
            recipeId: Number(dish.id) || 1,
            protein: dish.protein || 8.0,
            fat: 4.0,
            carbs: 25.0,
          });
        });
      });

      await mealPlanService.createMealPlan({
        childId: String(selectedBaby?.id || '1'),
        date: dateStr,
        meals: formattedMeals,
        totalCalories: totalKcal,
        totalProtein: Number(totalProtein),
        totalFat: 12.3,
        totalCarbs: 76.0,
      });

      Alert.alert(
        'Schedule Applied',
        `Successfully saved nutrition schedule for ${selectedBaby?.name || 'baby'} on ${DAYS_OF_WEEK[selectedDayIndex].day}!`,
        [
          {
            text: 'View Weaning Meal Plan',
            onPress: () => {
              navigation.navigate('MealPlanList', { childId: String(selectedBaby?.id || '1') });
            },
          },
        ]
      );
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Unable to apply schedule right now');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <TopHeaderBar />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header Title with Back Button */}
        <View style={styles.headerRow}>
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <ChevronLeftIcon size={22} color="#FF5F70" />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#FF5F70" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18" />
              </Svg>
              <Text style={styles.title}>
                Schedule for {selectedBaby?.name || 'Baby'} ({babyAgeMonths}m)
              </Text>
            </View>
            <Text style={styles.subTitle}>Smart nutrition planner & allergen-safe menu logic</Text>
          </View>
        </View>

        {/* Horizontal Days Selector */}
        <View style={styles.daysWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysScroll}>
            {DAYS_OF_WEEK.map((item, idx) => {
              const isSelected = idx === selectedDayIndex;
              return (
                <TouchableOpacity
                  key={item.day}
                  style={[styles.dayCard, isSelected && styles.activeDayCard]}
                  onPress={() => setSelectedDayIndex(idx)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dayText, isSelected && styles.activeDayText]}>{item.day}</Text>
                  <Text style={[styles.dateText, isSelected && styles.activeDateText]}>{item.date}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Total Nutrition Analysis Banner */}
        <View style={styles.macroCard}>
          <Text style={styles.macroTitle}>Daily Energy Target for {selectedBaby?.name}</Text>
          <View style={styles.macroGrid}>
            <View style={styles.macroItem}>
              <Text style={styles.macroVal}>{totalKcal} <Text style={styles.macroUnit}>kcal</Text></Text>
              <Text style={styles.macroLabel}>Energy</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroVal}>{totalProtein}g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroVal}>12.3g</Text>
              <Text style={styles.macroLabel}>Fat</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroVal}>76.0g</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
          </View>
        </View>

        {/* Recommended Weaning Dishes Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            💡 Recommended for {selectedBaby?.name} ({babyAgeMonths}m)
          </Text>
          {babyAllergies.length > 0 && (
            <Text style={styles.sectionSub}>🛡️ Excluded allergens: {babyAllergies.join(', ')}</Text>
          )}
        </View>

        <View style={{ marginBottom: 16 }}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={recommendedRecipes}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderItem={({ item }) => (
              <View style={styles.recCard}>
                <TouchableOpacity onPress={() => handleViewRecipeDetail(item.id)} activeOpacity={0.88}>
                  <Image source={{ uri: item.image_url || (item as any).image }} style={styles.recImg} />
                  <Text style={styles.recName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.recCategory}>{item.month_age ? `${item.month_age}+ months` : 'Safe dish'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => openAddSlotModal(item)}
                  activeOpacity={0.8}
                >
                  <PlusIcon size={14} color="#FFFFFF" />
                  <Text style={styles.addBtnText}>Add to schedule</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>

        {/* Meal Schedule Slots (Breakfast, Lunch, Snack, Dinner) */}
        <View style={styles.menuHeaderRow}>
          <Text style={styles.sectionMainTitle}>🍽️ Menu Slots for {DAYS_OF_WEEK[selectedDayIndex].day}</Text>
          <TouchableOpacity 
            style={styles.savePlanBtn}
            onPress={handleSaveToMealPlan}
            disabled={saving}
            activeOpacity={0.8}
          >
            <Text style={styles.savePlanBtnText}>{saving ? 'Saving...' : '💾 Apply to Meal Plan'}</Text>
          </TouchableOpacity>
        </View>

        {['Breakfast', 'Lunch', 'Snack', 'Dinner'].map((mealName) => {
          const slotDishes = meals[mealName] || [];
          const slotTimeRanges: { [key: string]: string } = {
            'Breakfast': '05:00 AM - 10:59 AM',
            'Lunch': '11:00 AM - 01:59 PM',
            'Snack': '02:00 PM - 04:59 PM',
            'Dinner': '05:00 PM onwards',
          };
          return (
            <View key={mealName} style={styles.slotCard}>
              <View style={styles.slotHeader}>
                <View>
                  <Text style={styles.slotTitle}>{mealName}</Text>
                  <Text style={styles.slotTime}>{slotTimeRanges[mealName]}</Text>
                </View>

                <TouchableOpacity 
                  style={styles.addMoreBtn}
                  onPress={() => navigation.navigate('SearchRecipe')}
                  activeOpacity={0.8}
                >
                  <PlusIcon size={12} color="#FF5F70" />
                  <Text style={styles.addMoreText}>Select from library</Text>
                </TouchableOpacity>
              </View>

              {slotDishes.length === 0 ? (
                <Text style={styles.emptySlotText}>No dishes scheduled. Tap "Add to schedule" or "Select from library"!</Text>
              ) : (
                slotDishes.map((dish, idx) => (
                  <View key={idx} style={styles.dishRow}>
                    <Image source={{ uri: dish.image_url || dish.image }} style={styles.dishThumb} />
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.dishTimeBadge}>⏰ {dish.time || '08:00 AM'}</Text>
                        <Text style={styles.dishName}>{dish.name}</Text>
                      </View>
                      <Text style={styles.dishKcal}>{dish.kcal || dish.calories || 200} kcal · Protein: {dish.protein || 8.0}g</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.removeBtn}
                      onPress={() => handleRemoveDish(mealName, idx)}
                      activeOpacity={0.7}
                    >
                      <TrashIcon size={14} color="#FF5F70" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* 100% FREELY ADJUSTABLE CLOCK TIME PICKER MODAL (ANY HOUR & ANY MINUTE 00-59) */}
      <Modal visible={slotModalVisible} transparent animationType="fade" onRequestClose={() => setSlotModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setSlotModalVisible(false)}>
          <View style={styles.modalBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
              <ClockIcon size={22} color="#FF5F70" />
              <Text style={styles.modalTitle}>Set Any Exact Meal Time</Text>
            </View>
            {!!targetRecipe && (
              <Text style={styles.modalSubTitle}>Dish: "{targetRecipe.name}" ({targetRecipe.kcal || targetRecipe.calories || 200} kcal)</Text>
            )}

            {/* Live Clock Display & Auto-Slot Preview */}
            <View style={styles.liveClockBox}>
              <Text style={styles.liveClockText}>⏰ {selectedTimeStr}</Text>
              <Text style={styles.liveSlotText}>
                Auto maps to: <Text style={{ fontWeight: '800', color: '#FF5F70' }}>{targetSlot}</Text> slot
              </Text>
            </View>

            {/* Interactive Steppers to pick ANY Exact Hour & Minute (00-59) */}
            <View style={styles.stepperContainer}>
              {/* Hour Control */}
              <View style={styles.stepperBox}>
                <Text style={styles.stepperLabel}>HOUR</Text>
                <View style={styles.stepperControls}>
                  <TouchableOpacity 
                    style={styles.stepBtn} 
                    onPress={() => setHour(prev => (prev <= 1 ? 12 : prev - 1))}
                  >
                    <MinusIcon size={16} color="#FF5F70" />
                  </TouchableOpacity>
                  <Text style={styles.stepVal}>{String(hour).padStart(2, '0')}</Text>
                  <TouchableOpacity 
                    style={styles.stepBtn} 
                    onPress={() => setHour(prev => (prev >= 12 ? 1 : prev + 1))}
                  >
                    <PlusIcon size={16} color="#FF5F70" />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.colonSeparator}>:</Text>

              {/* Minute Control (00 to 59 freely!) */}
              <View style={styles.stepperBox}>
                <Text style={styles.stepperLabel}>MINUTE (00-59)</Text>
                <View style={styles.stepperControls}>
                  <TouchableOpacity 
                    style={styles.stepBtn} 
                    onPress={() => setMinuteNum(prev => (prev <= 0 ? 59 : prev - 1))}
                  >
                    <MinusIcon size={16} color="#FF5F70" />
                  </TouchableOpacity>
                  <Text style={styles.stepVal}>{String(minuteNum).padStart(2, '0')}</Text>
                  <TouchableOpacity 
                    style={styles.stepBtn} 
                    onPress={() => setMinuteNum(prev => (prev >= 59 ? 0 : prev + 1))}
                  >
                    <PlusIcon size={16} color="#FF5F70" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Quick Minute Jump Chips */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 14 }}>
              {[0, 15, 30, 45].map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.quickChip, minuteNum === m && styles.activeQuickChip]}
                  onPress={() => setMinuteNum(m)}
                >
                  <Text style={[styles.quickChipText, minuteNum === m && styles.activeQuickChipText]}>
                    :{String(m).padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* AM / PM Switcher */}
            <View style={styles.periodRow}>
              <TouchableOpacity
                style={[styles.periodBtn, period === 'AM' && styles.activePeriodBtn]}
                onPress={() => setPeriod('AM')}
              >
                <Text style={[styles.periodText, period === 'AM' && styles.activePeriodText]}>🌅 AM (Morning)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodBtn, period === 'PM' && styles.activePeriodBtn]}
                onPress={() => setPeriod('PM')}
              >
                <Text style={[styles.periodText, period === 'PM' && styles.activePeriodText]}>🌙 PM (Afternoon / Night)</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setSlotModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalApplyBtn} onPress={handleConfirmAddDishToSlot}>
                <Text style={styles.modalApplyText}>Confirm & Place in Schedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F2' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  title: { fontSize: 18, fontWeight: '800', color: '#4B3034' },
  subTitle: { fontSize: 12, color: '#8E7377', marginTop: 2 },
  daysWrapper: { marginBottom: 16 },
  daysScroll: { gap: 8 },
  dayCard: { width: 60, height: 62, borderRadius: 16, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FFE4E6' },
  activeDayCard: { backgroundColor: '#FF5F70', borderColor: '#FF5F70' },
  dayText: { fontSize: 13, fontWeight: '700', color: '#4B3034', marginBottom: 2 },
  activeDayText: { color: '#FFFFFF' },
  dateText: { fontSize: 11, color: '#8E7377' },
  activeDateText: { color: 'rgba(255, 255, 255, 0.9)' },
  macroCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#FFE4E6', shadowColor: '#FF5F70', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  macroTitle: { fontSize: 14, fontWeight: '800', color: '#4B3034', marginBottom: 10 },
  macroGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  macroItem: { alignItems: 'center', flex: 1 },
  macroVal: { fontSize: 14, fontWeight: '800', color: '#FF5F70' },
  macroUnit: { fontSize: 10, fontWeight: '600' },
  macroLabel: { fontSize: 11, color: '#8E7377', marginTop: 2 },
  sectionHeader: { marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#4B3034' },
  sectionSub: { fontSize: 11, color: '#FF5F70', fontWeight: '600', marginTop: 2 },
  recCard: { width: 160, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 8, marginRight: 12, borderWidth: 1, borderColor: '#FFE4E6' },
  recImg: { width: '100%', height: 95, borderRadius: 12, marginBottom: 8, backgroundColor: '#FFF0F2' },
  recName: { fontSize: 13, fontWeight: '700', color: '#4B3034', marginBottom: 4, height: 34 },
  recCategory: { fontSize: 11, color: '#FF5F70', fontWeight: '600', marginBottom: 8 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: '#FF5F70', paddingVertical: 8, borderRadius: 10 },
  addBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  menuHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionMainTitle: { fontSize: 16, fontWeight: '800', color: '#4B3034' },
  savePlanBtn: { backgroundColor: '#FF5F70', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  savePlanBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  slotCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#FFE4E6' },
  slotHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  slotTitle: { fontSize: 15, fontWeight: '800', color: '#4B3034' },
  slotTime: { fontSize: 11, color: '#8E7377', fontWeight: '600' },
  addMoreBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF0F2', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  addMoreText: { fontSize: 11, color: '#FF5F70', fontWeight: '700' },
  emptySlotText: { fontSize: 12, color: '#8E7377', fontStyle: 'italic', paddingVertical: 6 },
  dishRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF0F2', borderRadius: 12, padding: 8, marginTop: 6 },
  dishThumb: { width: 42, height: 42, borderRadius: 8, marginRight: 10 },
  dishTimeBadge: { fontSize: 11, fontWeight: '700', color: '#FF5F70', backgroundColor: '#FFFFFF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#FFE4E6' },
  dishName: { fontSize: 13, fontWeight: '700', color: '#4B3034', flex: 1 },
  dishKcal: { fontSize: 11, color: '#8E7377', marginTop: 2 },
  removeBtn: { padding: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalBox: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, elevation: 5 },
  modalTitle: { fontSize: 17, fontWeight: '800', color: '#4B3034', textAlign: 'center' },
  modalSubTitle: { fontSize: 13, color: '#FF5F70', fontWeight: '600', textAlign: 'center', marginBottom: 12 },
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
});

export default MealSchedulerScreen;
