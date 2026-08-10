import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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

import TopHeaderBar from '../../components/common/TopHeaderBar';
import { mealPlanService } from '../../services/mealPlanService';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { useRecipeStore } from '../../stores/useRecipeStore';
import { calculateBabyAgeInMonths } from '../../utils/calculateBabyAge';

import { Icon } from 'react-native-paper';

const getWeekDayDateStr = (dayIndex: number, weekOffsetIndex: number = 0): string => {
  const now = new Date();
  const currentDay = now.getDay();
  const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday + (weekOffsetIndex * 7));
  const targetDate = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + dayIndex);

  const y = targetDate.getFullYear();
  const m = String(targetDate.getMonth() + 1).padStart(2, '0');
  const d = String(targetDate.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const WEEK_OPTIONS = [
  { id: 0, title: 'Week 1', subtitle: 'Menu Week 1' },
  { id: 1, title: 'Week 2', subtitle: 'Menu Week 2' },
  { id: 2, title: 'Week 3', subtitle: 'Menu Week 3' },
  { id: 3, title: 'Week 4', subtitle: 'Menu Week 4' },
];

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

export const MealSchedulerScreen = ({ route, navigation }: any) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const [showRecommended, setShowRecommended] = useState(true);
  const [saving, setSaving] = useState(false);

  const babies = useSelector((state: RootState) => state.baby.babies);
  const selectedBabyIdFromRedux = useSelector((state: RootState) => state.baby.selectedBabyId);
  const activeBabyId = String(route?.params?.childId || selectedBabyIdFromRedux || '1');
  const selectedBaby = useMemo(() => babies.find(b => String(b.id) === activeBabyId) || babies[0], [babies, activeBabyId]);

  const babyAgeMonths = useMemo(() => calculateBabyAgeInMonths(selectedBaby?.dateOfBirth || ''), [selectedBaby]);
  const babyAllergies = useMemo(() => selectedBaby?.allergies || [], [selectedBaby]);

  const { recipes, fetchRecipes } = useRecipeStore();

  // Dynamic Real-Time Date Ranges for 4 Weeks (Week 1 to Week 4)
  const dynamicWeeks = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay();
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const currentMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
    const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return [0, 1, 2, 3].map((weekOffset) => {
      const startD = new Date(currentMonday.getFullYear(), currentMonday.getMonth(), currentMonday.getDate() + (weekOffset * 7));
      const endD = new Date(startD.getFullYear(), startD.getMonth(), startD.getDate() + 6);

      let dateRangeStr = '';
      if (startD.getMonth() === endD.getMonth()) {
        dateRangeStr = `${startD.getDate()} - ${endD.getDate()} ${monthsShort[startD.getMonth()]}`;
      } else {
        dateRangeStr = `${startD.getDate()} ${monthsShort[startD.getMonth()]} - ${endD.getDate()} ${monthsShort[endD.getMonth()]}`;
      }

      return {
        id: weekOffset,
        title: `Week ${weekOffset + 1}`,
        dateRange: dateRangeStr,
        isCurrentWeek: weekOffset === 0,
      };
    });
  }, []);

  // Dynamic Real-Time Mon to Sun Days for Selected Week
  const dynamicDaysOfWeek = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay();
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const currentMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return dayNames.map((name, idx) => {
      const d = new Date(currentMonday.getFullYear(), currentMonday.getMonth(), currentMonday.getDate() + (selectedWeekIndex * 7) + idx);
      const isToday = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
      const formattedDate = `${d.getDate()} ${monthsShort[d.getMonth()]}`;

      return {
        day: name,
        date: formattedDate,
        isToday,
        fullLabel: `${name} ${formattedDate}`,
      };
    });
  }, [selectedWeekIndex]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  // Sync weekIndex and dateStr parameter from route if passed
  useEffect(() => {
    if (route?.params?.weekIndex !== undefined) {
      setSelectedWeekIndex(Number(route.params.weekIndex));
    }
  }, [route?.params?.weekIndex]);

  useEffect(() => {
    if (route?.params?.dateStr) {
      const parts = route.params.dateStr.split('-');
      if (parts.length === 3) {
        const targetDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        const today = new Date();
        const currentDay = today.getDay();
        const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
        const monday = new Date(today.setDate(diff));
        
        const diffTime = targetDate.getTime() - monday.getTime();
        const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
        if (diffDays >= 0 && diffDays <= 6) {
          setSelectedDayIndex(diffDays);
        }
      }
    }
  }, [route?.params?.dateStr]);

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
    'Breakfast': [],
    'Lunch': [],
    'Snack': [],
    'Dinner': [],
  });

  const loadMealsForSelectedDay = useCallback(async () => {
    const dateStr = getWeekDayDateStr(selectedDayIndex, selectedWeekIndex);

    try {
      const plans = await mealPlanService.getMealPlans(activeBabyId);
      const dayPlan = plans.find(p => p.date === dateStr);

      const loadedSlots: { [key: string]: Array<any> } = {
        'Breakfast': [],
        'Lunch': [],
        'Snack': [],
        'Dinner': [],
      };

      if (dayPlan && dayPlan.meals) {
        dayPlan.meals.forEach(m => {
          let slotName: 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner' = 'Breakfast';
          if (m.name.startsWith('Breakfast:')) slotName = 'Breakfast';
          else if (m.name.startsWith('Lunch:')) slotName = 'Lunch';
          else if (m.name.startsWith('Snack:')) slotName = 'Snack';
          else if (m.name.startsWith('Dinner:')) slotName = 'Dinner';
          else slotName = getSlotFromTime(m.time || '08:00 AM');

          const cleanName = m.name.replace(/^(Breakfast|Lunch|Snack|Dinner):\s*/i, '');

          loadedSlots[slotName].push({
            id: m.recipeId || m.id,
            name: cleanName,
            kcal: m.calories,
            protein: m.protein || 8.0,
            fat: m.fat || 4.0,
            carbs: m.carbs || 25.0,
            time: m.time || '',
            image: m.recipeImage || 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500',
          });
        });
      }

      setMeals(loadedSlots);
    } catch (e) {
      console.error('Error loading schedule for selected day:', e);
    }
  }, [selectedDayIndex, selectedWeekIndex, activeBabyId]);

  useFocusEffect(
    useCallback(() => {
      loadMealsForSelectedDay();
    }, [loadMealsForSelectedDay])
  );

  const [addSlotModalVisible, setAddSlotModalVisible] = useState(false);
  const [clockModalVisible, setClockModalVisible] = useState(false);
  const [targetRecipe, setTargetRecipe] = useState<any>(null);
  const [selectedMealSlot, setSelectedMealSlot] = useState<'Breakfast' | 'Lunch' | 'Snack' | 'Dinner'>('Breakfast');

  // Clock Picker State
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
    setSelectedMealSlot('Breakfast');
    setAddSlotModalVisible(true);
  };

  const openEditTimeClockModal = (dish: any, mealType: string) => {
    setTargetRecipe(dish);
    const match = (dish.time || '08:00 AM').match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (match) {
      setHour(parseInt(match[1], 10));
      setMinuteNum(parseInt(match[2], 10));
      setPeriod(match[3].toUpperCase() as 'AM' | 'PM');
    }
    setClockModalVisible(true);
  };

  const handleConfirmAddDishToSlot = async () => {
    if (!targetRecipe) return;

    // Prevent duplicate dishes in any slot for this day
    const isAlreadyInDay = Object.values(meals).some(dishList =>
      dishList.some((d: any) => String(d.id) === String(targetRecipe.id) || d.name === targetRecipe.name)
    );

    if (isAlreadyInDay) {
      setAddSlotModalVisible(false);
      Alert.alert(
        'Duplicate Recipe Warning',
        `"${targetRecipe.name}" is already scheduled for ${selectedBaby?.name || 'baby'} on ${dynamicDaysOfWeek[selectedDayIndex]?.fullLabel || 'selected day'}! Please select a different recipe.`,
        [{ text: 'OK' }]
      );
      return;
    }

    const recipeToAdd = {
      ...targetRecipe,
      kcal: targetRecipe.kcal || targetRecipe.calories || 200,
      protein: targetRecipe.protein || 8.0,
      time: '',
    };

    setMeals(prev => ({
      ...prev,
      [selectedMealSlot]: [...(prev[selectedMealSlot] || []), recipeToAdd],
    }));

    const dateStr = getWeekDayDateStr(selectedDayIndex, selectedWeekIndex);

    try {
      await mealPlanService.addRecipeToMealPlan({
        childId: activeBabyId,
        dateStr,
        mealType: selectedMealSlot,
        recipe: {
          id: targetRecipe.id,
          name: targetRecipe.name,
          calories: recipeToAdd.kcal,
          image_url: targetRecipe.image_url || (targetRecipe as any).image,
          protein: recipeToAdd.protein,
          fat: 4.0,
          carbohydrate: 25.0,
          description: `Scheduled for ${selectedBaby?.name || 'baby'} in ${selectedMealSlot} slot`,
        },
      });

      setAddSlotModalVisible(false);

      Alert.alert(
        'Added to Schedule',
        `Scheduled "${targetRecipe.name}" in ${selectedMealSlot} slot for ${selectedBaby?.name || 'baby'}!`,
        [
          { text: 'OK' },
          {
            text: 'View Meal Plan',
            onPress: () => {
              navigation.navigate('MealPlanList', { childId: activeBabyId, dateStr, weekIndex: selectedWeekIndex });
            },
          },
        ]
      );
    } catch (e: any) {
      console.error(e);
      setAddSlotModalVisible(false);
      Alert.alert(
        'Duplicate Recipe Warning',
        e?.message || `"${targetRecipe.name}" is already in schedule!`
      );
    }
  };

  const handleSaveAdjustedClockTime = async () => {
    if (!targetRecipe) return;

    const updatedTime = selectedTimeStr;
    const dateStr = getWeekDayDateStr(selectedDayIndex, selectedWeekIndex);

    // Update in local state
    setMeals(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(slotKey => {
        updated[slotKey] = updated[slotKey].map((d: any) => {
          if (String(d.id) === String(targetRecipe.id) || d.name === targetRecipe.name) {
            return { ...d, time: updatedTime };
          }
          return d;
        });
      });
      return updated;
    });

    try {
      await mealPlanService.addRecipeToMealPlan({
        childId: activeBabyId,
        dateStr,
        mealType: targetSlot,
        customTime: updatedTime,
        recipe: {
          id: targetRecipe.id,
          name: targetRecipe.name,
          calories: targetRecipe.kcal || targetRecipe.calories || 200,
          image_url: targetRecipe.image_url || (targetRecipe as any).image,
          protein: targetRecipe.protein || 8.0,
          fat: 4.0,
          carbohydrate: 25.0,
          description: `Custom feeding time updated to ${updatedTime}`,
        },
      });
      setClockModalVisible(false);
      Alert.alert('Time Updated', `Updated "${targetRecipe.name}" feeding time to ${updatedTime}!`);
    } catch (e) {
      console.error(e);
      setClockModalVisible(false);
    }
  };

  const handleRemoveDish = async (mealType: string, index: number) => {
    const updatedMeals = { ...meals };
    const list = [...(updatedMeals[mealType] || [])];
    const removedDish = list.splice(index, 1)[0];
    updatedMeals[mealType] = list;
    setMeals(updatedMeals);

    const dateStr = getWeekDayDateStr(selectedDayIndex, selectedWeekIndex);

    if (removedDish) {
      await mealPlanService.removeDishFromMealPlan({
        childId: activeBabyId,
        dateStr,
        mealId: removedDish.id,
        dishName: removedDish.name,
      });
    }

    const formattedMeals: any[] = [];
    let calcTotalKcal = 0;
    let calcTotalProtein = 0;

    Object.entries(updatedMeals).forEach(([type, dishList]) => {
      dishList.forEach((dish, idx) => {
        const dishKcal = dish.kcal || dish.calories || 200;
        const dishProt = dish.protein || 8.0;
        calcTotalKcal += dishKcal;
        calcTotalProtein += dishProt;
        formattedMeals.push({
          id: `m-${selectedDayIndex}-${type}-${idx}`,
          name: `${type}: ${dish.name}`,
          time: dish.time || '',
          description: `Weaning recipe (${dishKcal} kcal)`,
          calories: dishKcal,
          recipeId: Number(dish.id) || 1,
          protein: dishProt,
          fat: 4.0,
          carbs: 25.0,
        });
      });
    });

    await mealPlanService.createMealPlan({
      childId: activeBabyId,
      date: dateStr,
      meals: formattedMeals,
      totalCalories: calcTotalKcal,
      totalProtein: Number(calcTotalProtein.toFixed(1)),
      totalFat: 12.3,
      totalCarbs: 76.0,
    });
  };

  const handleViewRecipeDetail = (recipeId: string | number) => {
    navigation.navigate('RecipeDetail', { id: Number(recipeId) || 1 });
  };

  const handleSaveToMealPlan = async () => {
    setSaving(true);
    try {
      const dateStr = getWeekDayDateStr(selectedDayIndex, selectedWeekIndex);
      const formattedMeals: any[] = [];

      Object.entries(meals).forEach(([type, dishList]) => {
        dishList.forEach((dish, idx) => {
          formattedMeals.push({
            id: `m-${selectedDayIndex}-${type}-${idx}`,
            name: `${type}: ${dish.name}`,
            time: dish.time || '',
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
        childId: activeBabyId,
        date: dateStr,
        meals: formattedMeals,
        totalCalories: totalKcal,
        totalProtein: Number(totalProtein),
        totalFat: 12.3,
        totalCarbs: 76.0,
      });

      Alert.alert(
        'Schedule Applied',
        `Successfully saved nutrition schedule for ${selectedBaby?.name || 'baby'} on ${dynamicDaysOfWeek[selectedDayIndex]?.fullLabel || 'selected day'}!`,
        [
          {
            text: 'View Weaning Meal Plan',
            onPress: () => {
              navigation.navigate('MealPlanList', { childId: activeBabyId, dateStr, weekIndex: selectedWeekIndex });
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
            <Icon source="chevron-left" size={24} color="#FF5F70" />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <Icon source="calendar-month-outline" size={20} color="#FF5F70" />
              <Text style={styles.title}>
                Schedule for {selectedBaby?.name || 'Baby'} ({babyAgeMonths}m)
              </Text>
            </View>
            <Text style={styles.subTitle}>Smart nutrition planner & allergen-safe menu logic</Text>
          </View>
        </View>

        {/* 4 Weekly Schedules Selection Bar (Real-Time Dates) */}
        <View style={styles.weekSectionContainer}>
          <View style={styles.weekHeaderRow}>
            <Text style={styles.weekSectionTitle}>🗓️ Select Weekly Schedule</Text>
          </View>
          <View style={styles.weekTabsRow}>
            {dynamicWeeks.map((week) => {
              const isWeekActive = week.id === selectedWeekIndex;
              return (
                <TouchableOpacity
                  key={week.id}
                  style={[styles.weekTabBtn, isWeekActive && styles.activeWeekTabBtn]}
                  onPress={() => setSelectedWeekIndex(week.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.weekTabText, isWeekActive && styles.activeWeekTabText]}>
                    {week.title}
                  </Text>
                  <Text style={[styles.weekSubDateText, isWeekActive && styles.activeWeekSubDateText]}>
                    {week.dateRange}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Horizontal Days Selector with Real Dates & TODAY Indicator */}
        <View style={styles.daysWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysScroll}>
            {dynamicDaysOfWeek.map((item, idx) => {
              const isSelected = idx === selectedDayIndex;
              return (
                <TouchableOpacity
                  key={item.day}
                  style={[styles.dayCard, isSelected && styles.activeDayCard]}
                  onPress={() => setSelectedDayIndex(idx)}
                  activeOpacity={0.8}
                >
                  {item.isToday && (
                    <View style={styles.todayBadge}>
                      <Text style={styles.todayBadgeText}>TODAY</Text>
                    </View>
                  )}
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

        {/* Recommended Weaning Dishes Section (Collapsible with Arrow Toggle) */}
        <TouchableOpacity 
          style={styles.sectionHeaderTouchable}
          onPress={() => setShowRecommended(prev => !prev)}
          activeOpacity={0.8}
        >
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon source="lightbulb-on-outline" size={18} color="#FF5F70" />
              <Text style={styles.sectionTitle}>
                Recommended for {selectedBaby?.name} ({babyAgeMonths}m)
              </Text>
            </View>
            {babyAllergies.length > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <Icon source="shield-check-outline" size={14} color="#FF5F70" />
                <Text style={styles.sectionSub}>Excluded allergens: {babyAllergies.join(', ')}</Text>
              </View>
            )}
          </View>

          {/* Toggle Arrow Icon */}
          <View style={styles.toggleArrowBox}>
            <Icon 
              source={showRecommended ? "chevron-up" : "chevron-down"} 
              size={22} 
              color="#FF5F70" 
            />
          </View>
        </TouchableOpacity>

        {showRecommended && (
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
                    <Icon source="plus" size={16} color="#FFFFFF" />
                    <Text style={styles.addBtnText}>Add to schedule</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        )}

        {/* Meal Schedule Slots (Breakfast, Lunch, Snack, Dinner) */}
        <View style={styles.menuHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon source="silverware-fork-knife" size={20} color="#FF5F70" />
            <Text style={styles.sectionMainTitle}>Menu Slots for {dynamicDaysOfWeek[selectedDayIndex]?.fullLabel || 'Selected Day'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.savePlanBtn}
            onPress={handleSaveToMealPlan}
            disabled={saving}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon source="content-save-outline" size={16} color="#FFFFFF" />
              <Text style={styles.savePlanBtnText}>{saving ? 'Saving...' : 'Apply to Meal Plan'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {['Breakfast', 'Lunch', 'Snack', 'Dinner'].map((mealName) => {
          const slotDishes = meals[mealName] || [];
          return (
            <View key={mealName} style={styles.slotCard}>
              <View style={styles.slotHeader}>
                <Text style={styles.slotTitle}>{mealName}</Text>

                <TouchableOpacity 
                  style={styles.addMoreBtn}
                  onPress={() => navigation.navigate('SearchRecipe')}
                  activeOpacity={0.8}
                >
                  <Icon source="plus" size={14} color="#FF5F70" />
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
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <Text style={styles.dishName}>{dish.name}</Text>
                        <TouchableOpacity 
                          style={styles.editTimeBtn}
                          onPress={() => openEditTimeClockModal(dish, mealName)}
                          activeOpacity={0.8}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                            <Icon source="clock-outline" size={12} color="#FF5F70" />
                            <Text style={styles.editTimeBtnText}>
                              {dish.time || 'Set Time'}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.dishKcal}>{dish.kcal || dish.calories || 200} kcal · Protein: {dish.protein || 8.0}g</Text>
                    </View>

                    <TouchableOpacity 
                      style={styles.removeBtn}
                      onPress={() => handleRemoveDish(mealName, idx)}
                      activeOpacity={0.7}
                    >
                      <Icon source="delete-outline" size={18} color="#FF5F70" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal 1: Fast Add Dish to Meal Schedule (Select Slot Sáng/Trưa/Phụ/Tối) */}
      <Modal visible={addSlotModalVisible} transparent animationType="fade" onRequestClose={() => setAddSlotModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setAddSlotModalVisible(false)}>
          <Pressable style={styles.modalBox} onPress={(e) => e.stopPropagation()}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
              <Icon source="clock-outline" size={22} color="#FF5F70" />
              <Text style={styles.modalTitle}>Add to Meal Schedule</Text>
            </View>
            {!!targetRecipe && (
              <Text style={styles.modalSubTitle}>Dish: "{targetRecipe.name}" ({targetRecipe.kcal || targetRecipe.calories || 200} kcal)</Text>
            )}

            <Text style={{ fontSize: 13, fontWeight: '700', color: '#4B3034', marginBottom: 8, marginTop: 4 }}>
              Select Meal Slot for {dynamicDaysOfWeek[selectedDayIndex]?.fullLabel || 'Selected Day'}:
            </Text>

            <View style={{ gap: 8, marginBottom: 16 }}>
              {[
                { key: 'Breakfast', label: 'Breakfast' },
                { key: 'Lunch', label: 'Lunch' },
                { key: 'Snack', label: 'Snack' },
                { key: 'Dinner', label: 'Dinner' },
              ].map(slot => {
                const isSelected = selectedMealSlot === slot.key;
                return (
                  <TouchableOpacity
                    key={slot.key}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: isSelected ? '#FFFFFF' : '#FFF0F2',
                      borderColor: isSelected ? '#FF5F70' : '#FFE4E6',
                      borderWidth: 1,
                      paddingVertical: 12,
                      paddingHorizontal: 14,
                      borderRadius: 14,
                      elevation: isSelected ? 2 : 0,
                    }}
                    onPress={() => setSelectedMealSlot(slot.key as any)}
                    activeOpacity={0.8}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '700', color: isSelected ? '#FF5F70' : '#4B3034' }}>{slot.label}</Text>
                    {isSelected && <Text style={{ fontSize: 16, color: '#FF5F70', fontWeight: '800' }}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setAddSlotModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalApplyBtn} onPress={handleConfirmAddDishToSlot}>
                <Text style={styles.modalApplyText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal 2: Optional Custom Set Time Clock Picker */}
      <Modal visible={clockModalVisible} transparent animationType="fade" onRequestClose={() => setClockModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setClockModalVisible(false)}>
          <Pressable style={styles.modalBox} onPress={(e) => e.stopPropagation()}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
              <Icon source="clock-outline" size={22} color="#FF5F70" />
              <Text style={styles.modalTitle}>Set Meal Time</Text>
            </View>
            {!!targetRecipe && (
              <Text style={styles.modalSubTitle}>Dish: "{targetRecipe.name}"</Text>
            )}

            {/* Live Clock Display & Auto-Slot Preview */}
            <View style={styles.liveClockBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <Icon source="clock-outline" size={24} color="#FF5F70" />
                <Text style={styles.liveClockText}>{selectedTimeStr}</Text>
              </View>
              <Text style={styles.liveSlotText}>
                Auto maps to: <Text style={{ fontWeight: '800', color: '#FF5F70' }}>{targetSlot}</Text> slot
              </Text>
            </View>

            {/* Steppers for Hour & Minute */}
            <View style={styles.stepperContainer}>
              <View style={styles.stepperBox}>
                <Text style={styles.stepperLabel}>HOUR</Text>
                <View style={styles.stepperControls}>
                  <TouchableOpacity 
                    style={styles.stepBtn} 
                    onPress={() => setHour(prev => (prev <= 1 ? 12 : prev - 1))}
                  >
                    <Icon source="minus" size={18} color="#FF5F70" />
                  </TouchableOpacity>
                  <Text style={styles.stepVal}>{String(hour).padStart(2, '0')}</Text>
                  <TouchableOpacity 
                    style={styles.stepBtn} 
                    onPress={() => setHour(prev => (prev >= 12 ? 1 : prev + 1))}
                  >
                    <Icon source="plus" size={18} color="#FF5F70" />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.colonSeparator}>:</Text>

              <View style={styles.stepperBox}>
                <Text style={styles.stepperLabel}>MINUTE (00-59)</Text>
                <View style={styles.stepperControls}>
                  <TouchableOpacity 
                    style={styles.stepBtn} 
                    onPress={() => setMinuteNum(prev => (prev <= 0 ? 59 : prev - 1))}
                  >
                    <Icon source="minus" size={18} color="#FF5F70" />
                  </TouchableOpacity>
                  <Text style={styles.stepVal}>{String(minuteNum).padStart(2, '0')}</Text>
                  <TouchableOpacity 
                    style={styles.stepBtn} 
                    onPress={() => setMinuteNum(prev => (prev >= 59 ? 0 : prev + 1))}
                  >
                    <Icon source="plus" size={18} color="#FF5F70" />
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
                <Text style={[styles.periodText, period === 'AM' && styles.activePeriodText]}>AM (Morning)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodBtn, period === 'PM' && styles.activePeriodBtn]}
                onPress={() => setPeriod('PM')}
              >
                <Text style={[styles.periodText, period === 'PM' && styles.activePeriodText]}>PM (Afternoon / Night)</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setClockModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalApplyBtn} onPress={handleSaveAdjustedClockTime}>
                <Text style={styles.modalApplyText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
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
  activeDayCard: {
    backgroundColor: '#FF5F70',
    borderColor: '#E03E50',
    borderWidth: 2,
    shadowColor: '#FF5F70',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 6,
  },
  dayText: { fontSize: 13, fontWeight: '700', color: '#4B3034', marginBottom: 2 },
  activeDayText: { color: '#FFFFFF', fontWeight: '900' },
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
  sectionHeaderTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingVertical: 4,
  },
  toggleArrowBox: {
    backgroundColor: '#FFF0F2',
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },
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
  editTimeBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },
  editTimeBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF5F70',
  },
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

  // 4 Weekly Schedule Selector Styles
  weekSectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },
  weekHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  weekSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4B3034',
  },
  maxMenuBadge: {
    backgroundColor: '#FFF0F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },
  maxMenuBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF5F70',
  },
  weekTabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  weekTabBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#FFF0F2',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },
  activeWeekTabBtn: {
    backgroundColor: '#FF5F70',
    borderColor: '#E03E50',
    borderWidth: 2,
    shadowColor: '#FF5F70',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 6,
  },
  weekTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B3034',
  },
  activeWeekTabText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },
  weekSubDateText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#8E7377',
    marginTop: 2,
  },
  activeWeekSubDateText: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '800',
  },
  todayBadge: {
    position: 'absolute',
    top: 3,
    backgroundColor: '#FFB800',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  todayBadgeText: {
    fontSize: 7,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});

export default MealSchedulerScreen;
