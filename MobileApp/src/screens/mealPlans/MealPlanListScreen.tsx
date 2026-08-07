import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { mealPlanService } from '../../services/mealPlanService';
import { MealPlan, Meal } from '../../types/meal-plan';
import { useAppTheme } from '../../theme/useAppTheme';
import type { AppColors } from '../../theme/colors';

const CalendarIcon = ({ size = 16, color = '#FF5F70' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18" />
  </Svg>
);

const toLocalIso = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const MealPlanListScreen = ({ route, navigation }: any) => {
  const { colors, isDark } = useAppTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const { childId } = route.params || {};
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
  }, [childId]);

  const loadMealPlans = useCallback(async () => {
    setLoading(true);
    try {
      const data = await mealPlanService.getMealPlans(childId);
      setMealPlans(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [childId]);

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
    navigation.navigate('MealScheduler');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      
      {/* Header section with Calendar Icon & Real Today Date */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Weaning Meal Plan</Text>
            <Text style={styles.headerSubtitle}>Weekly nutrition planner for your baby</Text>
          </View>
          <TouchableOpacity 
            style={styles.schedulerHeaderBtn}
            onPress={handleOpenScheduler}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <CalendarIcon size={14} color={colors.primary} />
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
            <CalendarIcon size={14} color={colors.primarySoft || '#FFF0F2'} />
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
            
            {/* Meals items */}
            {selectedPlan.meals.map((meal, index) => (
              <View key={meal.id || index} style={styles.mealCard}>
                <View style={styles.mealTimeContainer}>
                  <Text style={styles.mealTime}>{meal.time}</Text>
                  <View style={styles.timeLine} />
                </View>

                <View style={styles.mealContent}>
                  <View style={styles.mealHeaderRow}>
                    <Text style={styles.mealName}>{meal.name}</Text>
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

                  {/* Interactive Buttons Row linking to Weaning Recipe & Nutrition Schedule */}
                  <View style={styles.interactiveActionRow}>
                    <TouchableOpacity 
                      style={styles.recipeBtn}
                      onPress={() => handleOpenRecipeDetail(meal)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.recipeBtnText}>📖 View Recipe</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.scheduleBtn}
                      onPress={handleOpenScheduler}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.scheduleBtnText}>🗓️ Custom Schedule</Text>
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
                  <CalendarIcon size={16} color={colors.onPrimary} />
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
});
