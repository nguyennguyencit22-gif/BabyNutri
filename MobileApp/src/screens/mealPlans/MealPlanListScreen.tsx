import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Alert, Modal, TextInput, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { mealPlanService } from '../../services/mealPlanService';
import { MealPlan, Meal } from '../../types/meal-plan';
import { useAppTheme } from '../../theme/useAppTheme';
import type { AppColors } from '../../theme/colors';

import { Icon } from 'react-native-paper';

const toLocalIso = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const MealPlanListScreen = ({ route, navigation }: any) => {
  const { colors, isDark } = useAppTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const babies = useSelector((state: RootState) => state.baby.babies);
  const selectedBabyIdFromRedux = useSelector((state: RootState) => state.baby.selectedBabyId);
  const activeChildId = String(route.params?.childId || selectedBabyIdFromRedux || '1');
  const selectedBaby = babies.find(b => String(b.id) === activeChildId) || babies[0];

  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState<Date[]>([]);

  const todayDateFormatted = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  useEffect(() => {
    // Generate current week (Mon - Sun)
    const today = new Date();
    const currentDay = today.getDay();
    const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    setWeekDays(days);
  }, [activeChildId]);

  const loadMealPlans = useCallback(async () => {
    setLoading(true);
    try {
      const data = await mealPlanService.getMealPlans(activeChildId);
      setMealPlans(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [activeChildId]);

  useFocusEffect(
    useCallback(() => {
      loadMealPlans();
      if (route?.params?.dateStr) {
        const parts = route.params.dateStr.split('-');
        if (parts.length === 3) {
          const target = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
          setSelectedDate(target);
        }
      }
    }, [loadMealPlans, route?.params?.dateStr])
  );

  const getSelectedDayMealPlan = () => {
    const selectedDateStr = toLocalIso(selectedDate);
    return mealPlans.find(plan => plan.date === selectedDateStr);
  };

  const selectedPlan = getSelectedDayMealPlan();

  const handleOpenRecipeDetail = (meal: Meal) => {
    const recipeId = meal.recipeId || 1;
    navigation.navigate('RecipeDetail', { id: recipeId });
  };

  const handleOpenScheduler = () => {
    const dateStr = toLocalIso(selectedDate);
    navigation.navigate('MealScheduler', { childId: activeChildId, dateStr });
  };

  // Interactive Remind Me Toggle State (ON / OFF)
  const [reminderEnabled, setReminderEnabled] = useState(true);

  // Live ticking clock state for real-time countdown (updates every 1000ms)
  const [nowDate, setNowDate] = useState<Date>(new Date());
  const alertedMealRef = React.useRef<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setNowDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper to parse meal time into the next future Date instance (Today or Tomorrow)
  const getNextMealTargetDate = (timeStr?: string, referenceNow: Date = new Date()): Date => {
    const year = referenceNow.getFullYear();
    const month = referenceNow.getMonth();
    const date = referenceNow.getDate();

    let h = 8;
    let m = 0;

    if (timeStr) {
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (match) {
        h = parseInt(match[1], 10);
        m = parseInt(match[2], 10);
        const ampm = match[3] ? match[3].toUpperCase() : null;
        if (ampm === 'PM' && h < 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
      }
    }

    let target = new Date(year, month, date, h, m, 0, 0);
    if (target.getTime() <= referenceNow.getTime()) {
      target = new Date(year, month, date + 1, h, m, 0, 0);
    }
    return target;
  };

  // Helper to parse time string e.g. "16:00" or "04:00 PM" into Date object for today/selected day
  const getMealDateTime = (timeStr?: string, targetDate?: Date): Date => {
    const baseDate = targetDate ? new Date(targetDate) : new Date();
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const date = baseDate.getDate();

    let h = 8;
    let m = 0;

    if (timeStr) {
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (match) {
        h = parseInt(match[1], 10);
        m = parseInt(match[2], 10);
        const ampm = match[3] ? match[3].toUpperCase() : null;
        if (ampm === 'PM' && h < 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
      }
    }

    return new Date(year, month, date, h, m, 0, 0);
  };

  // Helper to parse time string e.g. "08:30 AM" into minutes from midnight
  const parseTimeInMinutes = (timeStr?: string): number => {
    if (!timeStr) return 8 * 60;
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) return 8 * 60;
    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const ampm = match[3] ? match[3].toUpperCase() : null;
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  };

  // Helper to get meal slot category rank (Breakfast=1, Lunch=2, Snack=3, Dinner=4)
  const getMealRank = (meal: Meal): number => {
    const name = meal.name || '';
    if (name.startsWith('Breakfast:')) return 1;
    if (name.startsWith('Lunch:')) return 2;
    if (name.startsWith('Snack:')) return 3;
    if (name.startsWith('Dinner:')) return 4;

    const mins = parseTimeInMinutes(meal.time);
    if (mins >= 5 * 60 && mins < 11 * 60) return 1;
    if (mins >= 11 * 60 && mins < 14 * 60) return 2;
    if (mins >= 14 * 60 && mins < 17 * 60) return 3;
    return 4;
  };

  // Sort meals strictly in order: Breakfast (Sáng) -> Lunch (Trưa) -> Snack (Phụ) -> Dinner (Tối), and chronologically
  const sortedPlanMeals = React.useMemo(() => {
    if (!selectedPlan || !selectedPlan.meals) return [];
    return [...selectedPlan.meals].sort((a, b) => {
      const rankA = getMealRank(a);
      const rankB = getMealRank(b);
      if (rankA !== rankB) return rankA - rankB;
      return parseTimeInMinutes(a.time) - parseTimeInMinutes(b.time);
    });
  }, [selectedPlan]);

  // Calculate live ticking upcoming meal countdown strictly from current time to closest next meal
  const upcomingMealInfo = React.useMemo(() => {
    if (!sortedPlanMeals || sortedPlanMeals.length === 0) return null;

    const isTodaySelected = toLocalIso(selectedDate) === toLocalIso(nowDate);
    const nowTime = nowDate.getTime();

    // Calculate exact target future Date for each meal
    const timedMeals = sortedPlanMeals.filter(m => !!m.time && m.time.trim() !== '');
    if (timedMeals.length === 0) return null;

    const mealsWithFutureTarget = timedMeals.map((meal) => {
      let mealTargetDate: Date;
      if (isTodaySelected) {
        mealTargetDate = getNextMealTargetDate(meal.time, nowDate);
      } else {
        mealTargetDate = getMealDateTime(meal.time, selectedDate);
      }
      const diffMs = mealTargetDate.getTime() - nowTime;
      return {
        meal: meal,
        mealTargetDate,
        diffMs,
        totalSecs: Math.max(0, Math.floor(diffMs / 1000)),
      };
    });

    // Sort by smallest remaining seconds (closest future meal)
    mealsWithFutureTarget.sort((a, b) => a.totalSecs - b.totalSecs);

    const closestItem = mealsWithFutureTarget[0];
    if (!closestItem) return null;

    const nextMeal = closestItem.meal;
    const totalSecs = closestItem.totalSecs;

    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;

    const formattedHH = String(hours).padStart(2, '0');
    const formattedMM = String(minutes).padStart(2, '0');
    const formattedSS = String(seconds).padStart(2, '0');

    // Always format as 3-part HH:MM:SS digital clock ticker (e.g. 03:00:00)
    const countdownTicker = `${formattedHH}:${formattedMM}:${formattedSS}`;

    const cleanName = nextMeal.name.replace(/^(Breakfast|Lunch|Snack|Dinner):\s*/i, '');
    const isWithin1Hour = isTodaySelected && totalSecs > 0 && totalSecs <= 3600; // <= 1 hour (3600 seconds)

    const isTomorrowMeal = closestItem.mealTargetDate.getDate() !== nowDate.getDate();

    return {
      meal: nextMeal,
      cleanName,
      countdownTicker,
      totalSecs,
      isWithin1Hour,
      isTodaySelected,
      isTomorrowMeal,
    };
  }, [sortedPlanMeals, selectedDate, nowDate, selectedBaby]);

  // Trigger floating 1-hour prep alert when reminderEnabled is ON
  useEffect(() => {
    if (reminderEnabled && upcomingMealInfo?.isWithin1Hour && upcomingMealInfo.meal) {
      const mealKey = `${upcomingMealInfo.meal.id}-${toLocalIso(selectedDate)}`;
      if (alertedMealRef.current !== mealKey) {
        alertedMealRef.current = mealKey;
        Alert.alert(
          '🔔 MEAL PREPARATION REMINDER',
          `Only ${upcomingMealInfo.countdownTicker} remaining until ${selectedBaby?.name || 'baby'}'s ${upcomingMealInfo.cleanName} (${upcomingMealInfo.meal.time || '08:00 AM'})! Please start preparing food for your baby now.`,
          [
            { text: 'Start Preparing' },
            { text: 'Mute Reminders', onPress: () => setReminderEnabled(false) },
          ]
        );
      }
    }
  }, [reminderEnabled, upcomingMealInfo?.isWithin1Hour, upcomingMealInfo?.meal, selectedDate, selectedBaby]);

  // State for 3-Dots Meal Action Modal
  const [selectedMealForAction, setSelectedMealForAction] = useState<Meal | null>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [editTimeModalVisible, setEditTimeModalVisible] = useState(false);
  const [editNotesModalVisible, setEditNotesModalVisible] = useState(false);

  // Edit Time Steppers (Hour, Minute, AM/PM)
  const [editHour, setEditHour] = useState(8);
  const [editMinute, setEditMinute] = useState(0);
  const [editAmpm, setEditAmpm] = useState<'AM' | 'PM'>('AM');

  // Edit Notes text
  const [editNoteText, setEditNoteText] = useState('');

  // Open 3-Dots Action Menu Modal
  const handleOpenMealActionMenu = (meal: Meal) => {
    setSelectedMealForAction(meal);
    if (meal.time) {
      const match = meal.time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (match) {
        let h = parseInt(match[1], 10);
        const m = parseInt(match[2], 10);
        const ampm = (match[3] || 'AM').toUpperCase() as 'AM' | 'PM';
        setEditHour(h);
        setEditMinute(m);
        setEditAmpm(ampm);
      }
    }
    setEditNoteText(meal.description || '');
    setActionModalVisible(true);
  };

  // Confirm Meal Time Edit
  const handleSaveMealTime = async () => {
    if (!selectedMealForAction || !selectedPlan) return;
    const formattedTime = `${String(editHour).padStart(2, '0')}:${String(editMinute).padStart(2, '0')} ${editAmpm}`;
    const dateStr = toLocalIso(selectedDate);

    const updatedMeals = selectedPlan.meals.map(m => {
      if (String(m.id) === String(selectedMealForAction.id)) {
        return { ...m, time: formattedTime };
      }
      return m;
    });

    await mealPlanService.createMealPlan({
      childId: activeChildId,
      date: dateStr,
      meals: updatedMeals,
      totalCalories: selectedPlan.totalCalories,
      totalProtein: selectedPlan.totalProtein,
      totalFat: selectedPlan.totalFat,
      totalCarbs: selectedPlan.totalCarbs,
    });

    setEditTimeModalVisible(false);
    setActionModalVisible(false);
    loadMealPlans();
    Alert.alert('⏰ Time Updated', `Meal time updated to ${formattedTime}!`);
  };

  // Confirm Meal Note Edit
  const handleSaveMealNotes = async () => {
    if (!selectedMealForAction || !selectedPlan) return;
    const dateStr = toLocalIso(selectedDate);

    const updatedMeals = selectedPlan.meals.map(m => {
      if (String(m.id) === String(selectedMealForAction.id)) {
        return { ...m, description: editNoteText };
      }
      return m;
    });

    await mealPlanService.createMealPlan({
      childId: activeChildId,
      date: dateStr,
      meals: updatedMeals,
      totalCalories: selectedPlan.totalCalories,
      totalProtein: selectedPlan.totalProtein,
      totalFat: selectedPlan.totalFat,
      totalCarbs: selectedPlan.totalCarbs,
    });

    setEditNotesModalVisible(false);
    setActionModalVisible(false);
    loadMealPlans();
    Alert.alert('📝 Notes Updated', 'Parent notes updated successfully!');
  };

  // Confirm Delete Dish from Action Menu
  const handleConfirmDeleteFromMenu = async () => {
    if (!selectedMealForAction) return;
    const dateStr = toLocalIso(selectedDate);
    const cleanName = selectedMealForAction.name.replace(/^(Breakfast|Lunch|Snack|Dinner):\s*/i, '');

    Alert.alert(
      'Delete Dish',
      `Are you sure you want to remove "${cleanName}" from the meal plan for ${dateStr}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setActionModalVisible(false);
            await mealPlanService.removeDishFromMealPlan({
              childId: activeChildId,
              dateStr,
              mealId: selectedMealForAction.id,
            });
            loadMealPlans();
          },
        },
      ]
    );
  };

  const getMealIcon = (meal: Meal) => {
    const rank = getMealRank(meal);
    if (rank === 1) return '🍳';
    if (rank === 2) return '🍲';
    if (rank === 3) return '🥛';
    return '🥣';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      
      {/* Header section with Calendar Icon & Real Today Date */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Weaning Meal Plan</Text>
            <Text style={styles.headerSubtitle}>
              {selectedBaby ? `Weekly plan for ${selectedBaby.name}` : 'Weekly nutrition planner for your baby'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.schedulerHeaderBtn}
            onPress={handleOpenScheduler}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon source="calendar" size={16} color={colors.primary} />
              <Text style={styles.schedulerHeaderBtnText}>
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Dynamic Nutrition Schedule Link Banner with SVG Icon & Real Date */}
      <TouchableOpacity 
        style={styles.bannerCard}
        onPress={handleOpenScheduler}
        activeOpacity={0.9}
      >
        <View style={styles.bannerContent}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <Icon source="calendar" size={16} color={colors.primarySoft || '#FFF0F2'} />
            <Text style={styles.bannerBadge}>Nutrition Schedule · {todayDateFormatted}</Text>
          </View>
          <Text style={styles.bannerTitle}>Smart Nutrition Analysis & Planning</Text>
          <Text style={styles.bannerDesc}>
            Automatically track calories, protein & nutrients for every meal
          </Text>
        </View>
        <View style={styles.bannerArrow}>
          <Text style={styles.bannerArrowText}>➔</Text>
        </View>
      </TouchableOpacity>

      {/* Calendar horizontal days strip */}
      <View style={styles.calendarWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.calendarContainer}>
          {weekDays.map((d, index) => {
            const isSelected = toLocalIso(selectedDate) === toLocalIso(d);
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            return (
              <TouchableOpacity 
                key={index} 
                style={[styles.dayButton, isSelected && styles.dayButtonSelected]}
                onPress={() => setSelectedDate(d)}
                activeOpacity={0.85}
              >
                <Text style={[styles.dayName, isSelected && styles.dayTextSelected]}>
                  {dayNames[d.getDay()]}
                </Text>
                <View style={[styles.dayNumberCircle, isSelected && styles.dayNumberCircleSelected]}>
                  <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelectedText]}>
                    {d.getDate()}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Meals list */}
      <View style={styles.mealsContainer}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : selectedPlan ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Clean Live Ticking Countdown & Interactive Remind Me Toggle Banner */}
            {upcomingMealInfo && (
              <View style={[styles.countdownCard, upcomingMealInfo.isWithin1Hour && styles.countdownCardUrgent]}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <Text style={{ fontSize: 16 }}>{upcomingMealInfo.isWithin1Hour ? '🔔' : '⏳'}</Text>
                    <Text style={styles.countdownTitle}>
                      Next Meal ({upcomingMealInfo.meal?.time && upcomingMealInfo.meal?.time.trim() !== '' ? upcomingMealInfo.meal?.time : 'Set Time'}): <Text style={{ color: colors.primary, fontWeight: '900' }}>{upcomingMealInfo.countdownTicker}</Text>
                    </Text>
                  </View>
                  <Text style={styles.countdownSub}>
                    {upcomingMealInfo.isTomorrowMeal ? '🗓️ Tomorrow · ' : ''}{upcomingMealInfo.cleanName} ({upcomingMealInfo.meal?.calories} kcal)
                  </Text>
                </View>

                {upcomingMealInfo.meal && (
                  <TouchableOpacity
                    style={[styles.reminderToggleBtn, reminderEnabled ? styles.reminderToggleBtnOn : styles.reminderToggleBtnOff]}
                    onPress={() => {
                      const nextState = !reminderEnabled;
                      setReminderEnabled(nextState);
                      Alert.alert(
                        nextState ? '🔔 Reminders Turned ON' : '🔕 Reminders Muted',
                        nextState 
                          ? `Floating reminder enabled! You will be notified 1 hour before ${selectedBaby?.name || 'baby'}'s next meal.`
                          : 'Meal preparation reminders are now muted.',
                        [{ text: 'OK' }]
                      );
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.reminderToggleText, reminderEnabled ? styles.reminderToggleTextOn : styles.reminderToggleTextOff]}>
                      {reminderEnabled ? '🔔 Remind: ON' : '🔕 Remind: OFF'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Plan summary info with Real Selected Date */}
            <View style={styles.planSummaryRow}>
              <View style={styles.summaryBadge}>
                <Text style={styles.caloriesText}>
                  Total Energy: <Text style={styles.caloriesHighlight}>{selectedPlan.totalCalories} kcal</Text>
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.detailLinkBtn}
                onPress={() => navigation.navigate('MealPlanDetail', { mealPlanId: selectedPlan.id })}
              >
                <Text style={styles.detailLinkText}>📋 Daily Details</Text>
              </TouchableOpacity>
            </View>
            
            {/* Meals items ordered strictly by Sáng -> Trưa -> Phụ -> Tối with exact times */}
            {sortedPlanMeals.map((meal, index) => (
              <View key={meal.id || index} style={styles.mealCard}>
                <TouchableOpacity 
                  style={styles.mealTimeContainer}
                  onPress={() => {
                    setSelectedMealForAction(meal);
                    const match = (meal.time || '08:00 AM').match(/(\d+):(\d+)\s*(AM|PM)/i);
                    if (match) {
                      let h = parseInt(match[1], 10);
                      const m = parseInt(match[2], 10);
                      const p = match[3].toUpperCase() as 'AM' | 'PM';
                      setEditHour(h);
                      setEditMinute(m);
                      setEditAmpm(p);
                    }
                    setEditTimeModalVisible(true);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.mealTime}>{meal.time && meal.time.trim() !== '' ? ` ${meal.time}` : ' Set Time'}</Text>
                  <View style={styles.timeLine} />
                </TouchableOpacity>

                <View style={styles.mealContent}>
                  <View style={styles.mealHeaderRow}>
                    <Text style={styles.mealName}>
                      {getMealIcon(meal)} {meal.name}
                    </Text>
                    <Text style={styles.mealCalories}>🔥 {meal.calories} kcal</Text>
                  </View>

                  {!!meal.description && (
                    <Text style={styles.mealDesc} numberOfLines={2}>{meal.description}</Text>
                  )}

                  {/* Macros info tags if available */}
                  {(meal.protein || meal.carbs || meal.fat) && (
                    <View style={styles.macroRow}>
                      {!!meal.protein && <Text style={styles.macroTag}>🥩 Protein: {meal.protein}g</Text>}
                      {!!meal.carbs && <Text style={styles.macroTag}>🌾 Carbs: {meal.carbs}g</Text>}
                      {!!meal.fat && <Text style={styles.macroTag}>🥑 Fat: {meal.fat}g</Text>}
                    </View>
                  )}

                  {/* Clean Action Row with View Recipe & 3-Dots Options Menu */}
                  <View style={styles.interactiveActionRow}>
                    <TouchableOpacity 
                      style={styles.recipeBtn}
                      onPress={() => handleOpenRecipeDetail(meal)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.recipeBtnText}>📖 View Recipe</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.threeDotsBtn}
                      onPress={() => handleOpenMealActionMenu(meal)}
                      activeOpacity={0.7}
                    >
                      <Icon source="dots-vertical" size={20} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
            <View style={{ height: 40 }} />
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🥣</Text>
            <Text style={styles.emptyText}>No plan scheduled for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
            <Text style={styles.emptySubText}>Set up a nutrition schedule or discover weaning recipes for your baby!</Text>
            
            <View style={styles.emptyActionsRow}>
              <TouchableOpacity 
                style={styles.addButtonPrimary}
                onPress={handleOpenScheduler}
                activeOpacity={0.88}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                  <Icon source="calendar" size={18} color={colors.onPrimary} />
                  <Text style={styles.addButtonText}>Open Scheduler ({todayDateFormatted})</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.addButtonSecondary}
                onPress={() => navigation.navigate('SearchRecipe')}
                activeOpacity={0.88}
              >
                <Text style={styles.addButtonSecondaryText}>🍲 Explore Weaning Recipes</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
      {/* 3-Dots Meal Options Menu Modal */}
      <Modal
        visible={actionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setActionModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setActionModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Dish Options</Text>
            <Text style={styles.modalSubtitle}>
              {selectedMealForAction?.name.replace(/^(Breakfast|Lunch|Snack|Dinner):\s*/i, '')} ({selectedMealForAction?.time})
            </Text>

            <View style={styles.menuOptionsList}>
              {/* Option 1: Edit Scheduled Time */}
              <TouchableOpacity
                style={styles.menuOptionItem}
                onPress={() => {
                  setActionModalVisible(false);
                  setEditTimeModalVisible(true);
                }}
              >
                <Text style={styles.menuOptionIcon}>⏰</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuOptionTitle}>Edit Scheduled Time</Text>
                  <Text style={styles.menuOptionDesc}>Select custom meal time (e.g. 08:00 AM ➔ 09:15 AM)</Text>
                </View>
              </TouchableOpacity>

              {/* Option 2: Add / Edit Note */}
              <TouchableOpacity
                style={styles.menuOptionItem}
                onPress={() => {
                  setActionModalVisible(false);
                  setEditNotesModalVisible(true);
                }}
              >
                <Text style={styles.menuOptionIcon}>📝</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuOptionTitle}>Add / Edit Parent Note</Text>
                  <Text style={styles.menuOptionDesc}>Write custom feeding instructions or notes</Text>
                </View>
              </TouchableOpacity>

              {/* Option 3: Delete Dish */}
              <TouchableOpacity
                style={[styles.menuOptionItem, styles.menuOptionDestructive]}
                onPress={handleConfirmDeleteFromMenu}
              >
                <Text style={styles.menuOptionIcon}>🗑️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.menuOptionTitle, { color: '#FF5F70' }]}>Delete Dish</Text>
                  <Text style={styles.menuOptionDesc}>Remove recipe from this meal plan</Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setActionModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Edit Time Clock Picker Sub-Modal (Identical Centered Card UI to Add to Schedule) */}
      <Modal
        visible={editTimeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditTimeModalVisible(false)}
      >
        <Pressable style={styles.modalOverlayCentered} onPress={() => setEditTimeModalVisible(false)}>
          <Pressable style={styles.scheduleModalBox} onPress={(e) => e.stopPropagation()}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
              <Icon source="clock-outline" size={20} color="#FF5F70" />
              <Text style={styles.scheduleModalTitle}>Set Meal Time</Text>
            </View>
            <Text style={styles.scheduleModalSubTitle}>
              Dish: "{selectedMealForAction?.name.replace(/^(Breakfast|Lunch|Snack|Dinner):\s*/i, '')}"
            </Text>

            {/* Live Clock Display & Auto-Slot Preview */}
            <View style={styles.liveClockBox}>
              <Text style={styles.liveClockText}>⏰ {String(editHour).padStart(2, '0')}:{String(editMinute).padStart(2, '0')} {editAmpm}</Text>
              <Text style={styles.liveSlotText}>
                Auto maps to: <Text style={{ fontWeight: '800', color: '#FF5F70' }}>
                  {(() => {
                    const h24 = editAmpm === 'PM' ? (editHour === 12 ? 12 : editHour + 12) : (editHour === 12 ? 0 : editHour);
                    if (h24 >= 5 && h24 < 10) return 'Breakfast (Morning)';
                    if (h24 >= 10 && h24 < 14) return 'Lunch (Midday)';
                    if (h24 >= 14 && h24 < 17) return 'Snack (Afternoon)';
                    return 'Dinner (Evening)';
                  })()}
                </Text> slot
              </Text>
            </View>

            {/* Steppers for Hour & Minute */}
            <View style={styles.stepperContainer}>
              {/* Hour Control */}
              <View style={styles.stepperBox}>
                <Text style={styles.stepperLabel}>HOUR</Text>
                <View style={styles.stepperControls}>
                  <TouchableOpacity 
                    style={styles.stepBtn} 
                    onPress={() => setEditHour(prev => (prev <= 1 ? 12 : prev - 1))}
                  >
                    <Icon source="minus" size={18} color="#FF5F70" />
                  </TouchableOpacity>
                  <Text style={styles.stepVal}>{String(editHour).padStart(2, '0')}</Text>
                  <TouchableOpacity 
                    style={styles.stepBtn} 
                    onPress={() => setEditHour(prev => (prev >= 12 ? 1 : prev + 1))}
                  >
                    <Icon source="plus" size={18} color="#FF5F70" />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.colonSeparator}>:</Text>

              {/* Minute Control */}
              <View style={styles.stepperBox}>
                <Text style={styles.stepperLabel}>MINUTE (00-59)</Text>
                <View style={styles.stepperControls}>
                  <TouchableOpacity 
                    style={styles.stepBtn} 
                    onPress={() => setEditMinute(prev => (prev <= 0 ? 59 : prev - 1))}
                  >
                    <Icon source="minus" size={18} color="#FF5F70" />
                  </TouchableOpacity>
                  <Text style={styles.stepVal}>{String(editMinute).padStart(2, '0')}</Text>
                  <TouchableOpacity 
                    style={styles.stepBtn} 
                    onPress={() => setEditMinute(prev => (prev >= 59 ? 0 : prev + 1))}
                  >
                    <Icon source="plus" size={18} color="#FF5F70" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Quick Minute Jump Chips */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
              {[0, 15, 30, 45].map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.quickChip, editMinute === m && styles.activeQuickChip]}
                  onPress={() => setEditMinute(m)}
                >
                  <Text style={[styles.quickChipText, editMinute === m && styles.activeQuickChipText]}>
                    :{String(m).padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* AM / PM Switcher */}
            <View style={styles.periodRow}>
              <TouchableOpacity
                style={[styles.periodBtn, editAmpm === 'AM' && styles.activePeriodBtn]}
                onPress={() => setEditAmpm('AM')}
              >
                <Text style={[styles.periodText, editAmpm === 'AM' && styles.activePeriodText]}>🌅 AM (Morning)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodBtn, editAmpm === 'PM' && styles.activePeriodBtn]}
                onPress={() => setEditAmpm('PM')}
              >
                <Text style={[styles.periodText, editAmpm === 'PM' && styles.activePeriodText]}>🌙 PM (Afternoon/Night)</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Actions */}
            <View style={styles.modalBtnRowCentered}>
              <TouchableOpacity style={styles.modalCancelBtnCentered} onPress={() => setEditTimeModalVisible(false)}>
                <Text style={styles.modalCancelTextCentered}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalApplyBtnCentered} onPress={handleSaveMealTime}>
                <Text style={styles.modalApplyTextCentered}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Edit Notes Sub-Modal */}
      <Modal
        visible={editNotesModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditNotesModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setEditNotesModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📝 Parent Note</Text>

            <TextInput
              style={styles.notesInput}
              value={editNoteText}
              onChangeText={setEditNoteText}
              placeholder="Add custom notes or instructions..."
              placeholderTextColor={colors.textSoft}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalActionsRow}>
              <TouchableOpacity style={styles.modalCancelBtnHalf} onPress={() => setEditNotesModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtnHalf} onPress={handleSaveMealNotes}>
                <Text style={styles.modalSaveText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textSoft,
    marginTop: 2,
    fontWeight: '500',
  },
  schedulerHeaderBtn: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderDashedPrimary,
  },
  schedulerHeaderBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  bannerCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: colors.primary,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  bannerContent: {
    flex: 1,
  },
  bannerBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primarySoft,
    textTransform: 'uppercase',
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  bannerDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  bannerArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  bannerArrowText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  calendarWrapper: {
    backgroundColor: colors.background,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderBottomColor: colors.borderDashed,
  },
  calendarContainer: {
    paddingHorizontal: 16,
  },
  dayButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.borderDashed,
    minWidth: 54,
  },
  dayButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSoft,
    marginBottom: 4,
  },
  dayNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderDashedPrimary,
  },
  dayNumberCircleSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderColor: 'transparent',
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  dayNumberSelectedText: {
    color: colors.onPrimary,
  },
  dayTextSelected: {
    color: colors.onPrimary,
  },
  mealsContainer: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  summaryBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderDashedPrimary,
  },
  caloriesText: {
    fontSize: 13,
    color: colors.textSoft,
    fontWeight: '600',
  },
  caloriesHighlight: {
    color: colors.primary,
    fontWeight: '800',
  },
  detailLinkBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  detailLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  mealCard: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  mealTimeContainer: {
    width: 60,
    alignItems: 'center',
  },
  mealTime: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  timeLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.borderDashedPrimary,
    marginTop: 8,
    borderRadius: 1,
  },
  mealContent: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderDashedPrimary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  mealHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  mealCalories: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  mealDesc: {
    fontSize: 13,
    color: colors.textSoft,
    lineHeight: 18,
    marginBottom: 8,
  },
  macroRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  macroTag: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSoft,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  interactiveActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  recipeBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  recipeBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  scheduleBtn: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDashedPrimary,
  },
  scheduleBtnText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 13,
    color: colors.textSoft,
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyActionsRow: {
    flexDirection: 'column',
    gap: 10,
    width: '100%',
    paddingHorizontal: 20,
  },
  addButtonPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  addButtonSecondary: {
    backgroundColor: colors.surfaceAlt,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDashedPrimary,
  },
  addButtonSecondaryText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  countdownCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  countdownCardUrgent: {
    backgroundColor: '#FFF0F2',
    borderColor: '#FF5F70',
  },
  countdownBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  countdownBadgeUrgent: {
    color: '#FF5F70',
  },
  countdownTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },
  countdownSub: {
    fontSize: 12,
    color: colors.textSoft,
    marginTop: 2,
  },
  reminderBellBtn: {
    backgroundColor: '#FF5F70',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    marginLeft: 8,
  },
  reminderBellText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  reminderToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    marginLeft: 8,
    borderWidth: 1,
  },
  reminderToggleBtnOn: {
    backgroundColor: '#FF5F70',
    borderColor: '#FF5F70',
  },
  reminderToggleBtnOff: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.borderDashedPrimary,
  },
  reminderToggleText: {
    fontSize: 12,
    fontWeight: '800',
  },
  reminderToggleTextOn: {
    color: '#FFFFFF',
  },
  reminderToggleTextOff: {
    color: colors.textSoft,
  },
  threeDotsBtn: {
    backgroundColor: colors.surfaceAlt,
    width: 38,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDashedPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.textSoft,
    marginTop: 2,
    marginBottom: 16,
  },
  menuOptionsList: {
    gap: 10,
    marginBottom: 16,
  },
  menuOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surfaceAlt,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderDashedPrimary,
  },
  menuOptionDestructive: {
    backgroundColor: '#FFF0F2',
    borderColor: '#FF5F70',
  },
  menuOptionIcon: {
    fontSize: 22,
  },
  menuOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  menuOptionDesc: {
    fontSize: 12,
    color: colors.textSoft,
    marginTop: 2,
  },
  modalCancelBtn: {
    backgroundColor: colors.surfaceAlt,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDashedPrimary,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 16,
  },
  liveClockBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.borderDashedPrimary,
  },
  liveClockText: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 2,
  },
  liveSlotText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  stepperBox: {
    alignItems: 'center',
  },
  stepperLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSoft,
    marginBottom: 4,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderDashedPrimary,
    padding: 4,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  stepVal: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    paddingHorizontal: 12,
  },
  colonSeparator: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 12,
  },
  stepperCol: {
    alignItems: 'center',
  },
  stepperBtn: {
    backgroundColor: colors.surfaceAlt,
    width: 44,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDashedPrimary,
  },
  stepperBtnText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '800',
  },
  stepperValue: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.primary,
    marginVertical: 6,
  },
  colonText: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text,
    marginTop: 14,
  },
  ampmCol: {
    gap: 8,
    marginTop: 14,
  },
  ampmBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderDashedPrimary,
  },
  ampmBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  ampmText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSoft,
  },
  ampmTextActive: {
    color: '#FFFFFF',
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  modalCancelBtnHalf: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDashedPrimary,
  },
  modalSaveBtnHalf: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  notesInput: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 16,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.borderDashedPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
    marginVertical: 14,
  },
  quickChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderDashedPrimary,
  },
  activeQuickChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSoft,
  },
  activeQuickChipText: {
    color: '#FFFFFF',
  },
  periodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDashedPrimary,
  },
  activePeriodBtn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  periodText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSoft,
  },
  activePeriodText: {
    color: '#FFFFFF',
  },
  modalOverlayCentered: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scheduleModalBox: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  scheduleModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  scheduleModalSubTitle: {
    fontSize: 12,
    color: colors.textSoft,
    textAlign: 'center',
    marginBottom: 12,
  },
  modalBtnRowCentered: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 6,
  },
  modalCancelBtnCentered: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderDashedPrimary,
  },
  modalCancelTextCentered: {
    color: colors.textSoft,
    fontWeight: '600',
  },
  modalApplyBtnCentered: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  modalApplyTextCentered: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
