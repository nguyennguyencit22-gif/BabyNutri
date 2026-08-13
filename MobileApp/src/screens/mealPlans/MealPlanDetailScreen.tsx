import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, StatusBar, Alert, Image } from 'react-native';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { mealPlanService } from '../../services/mealPlanService';
import { MealPlan, Meal } from '../../types/meal-plan';
import { useAppTheme } from '../../theme/useAppTheme';
import type { AppColors } from '../../theme/colors';
import Icon from '../../components/common/AppIcon';

export const MealPlanDetailScreen = ({ route, navigation }: any) => {
  const { colors, isDark } = useAppTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const { mealPlanId, childId: paramChildId, dateStr: paramDateStr, weekIndex: paramWeekIndex } = route.params || {};

  const babies = useSelector((state: RootState) => state.baby.babies);
  const selectedBabyIdFromRedux = useSelector((state: RootState) => state.baby.selectedBabyId);

  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);

  const activeChildId = String(paramChildId || mealPlan?.childId || selectedBabyIdFromRedux || '1');
  const selectedBaby = useMemo(() => babies.find(b => String(b.id) === activeChildId) || babies[0], [babies, activeChildId]);

  const babyAgeMonths = useMemo(() => {
    if (!selectedBaby?.dateOfBirth) return 8;
    const dob = new Date(selectedBaby.dateOfBirth);
    const now = new Date();
    let months = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
    return Math.max(1, months);
  }, [selectedBaby]);

  const loadMealPlan = async () => {
    setLoading(true);
    try {
      if (mealPlanId) {
        const data = await mealPlanService.getMealPlanById(mealPlanId);
        if (data) {
          setMealPlan(data);
          return;
        }
      }

      // Fallback query by childId & dateStr
      if (paramDateStr) {
        const plans = await mealPlanService.getMealPlans(activeChildId);
        const found = plans.find(p => p.date === paramDateStr);
        if (found) {
          setMealPlan(found);
        }
      }
    } catch (error) {
      console.error('Error loading meal plan details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMealPlan();
  }, [mealPlanId, paramDateStr, activeChildId]);

  const weekTitle = useMemo(() => {
    const wIndex = paramWeekIndex !== undefined ? Number(paramWeekIndex) : 0;
    return `Week ${wIndex + 1}`;
  }, [paramWeekIndex]);

  const formattedDisplayDate = useMemo(() => {
    if (!mealPlan?.date) return 'Planned Menu Day';
    const parts = mealPlan.date.split('-');
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    }
    return mealPlan.date;
  }, [mealPlan?.date]);

  // Group meals strictly into Breakfast, Lunch, Snack, Dinner slots
  const categorizedMeals = useMemo(() => {
    const slots: { [key: string]: Meal[] } = {
      'Breakfast': [],
      'Lunch': [],
      'Snack': [],
      'Dinner': [],
    };

    if (mealPlan && mealPlan.meals) {
      mealPlan.meals.forEach(m => {
        let slotName = 'Breakfast';
        if (m.name.startsWith('Breakfast:')) slotName = 'Breakfast';
        else if (m.name.startsWith('Lunch:')) slotName = 'Lunch';
        else if (m.name.startsWith('Snack:')) slotName = 'Snack';
        else if (m.name.startsWith('Dinner:')) slotName = 'Dinner';
        else {
          // Infer slot from time
          const match = (m.time || '').match(/(\d+):/);
          if (match) {
            const h = parseInt(match[1], 10);
            if (h >= 5 && h < 11) slotName = 'Breakfast';
            else if (h >= 11 && h < 14) slotName = 'Lunch';
            else if (h >= 14 && h < 17) slotName = 'Snack';
            else slotName = 'Dinner';
          }
        }
        slots[slotName].push(m);
      });
    }

    return slots;
  }, [mealPlan]);

  const handleOpenRecipeDetail = (meal: Meal) => {
    const recipeId = meal.recipeId || 1;
    navigation.navigate('RecipeDetail', { id: recipeId });
  };

  const handleOpenScheduler = () => {
    navigation.navigate('MealScheduler', {
      childId: activeChildId,
      dateStr: mealPlan?.date || paramDateStr,
      weekIndex: paramWeekIndex !== undefined ? Number(paramWeekIndex) : 0,
    });
  };

  const handleRemoveDish = (meal: Meal) => {
    if (!mealPlan) return;
    const cleanName = meal.name.replace(/^(Breakfast|Lunch|Snack|Dinner):\s*/i, '');

    Alert.alert(
      'Remove Dish',
      `Are you sure you want to remove "${cleanName}" from ${selectedBaby?.name || 'baby'}'s meal plan?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await mealPlanService.removeDishFromMealPlan({
              childId: activeChildId,
              dateStr: mealPlan.date,
              mealId: meal.id,
              dishName: cleanName,
            });
            loadMealPlan();
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!mealPlan) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFoundText}>No detailed meal plan found for this date.</Text>
        <TouchableOpacity style={styles.scheduleHeaderActionBtn} onPress={handleOpenScheduler} activeOpacity={0.88}>
          <Icon source="calendar-month-outline" size={16} color="#FFFFFF" />
          <Text style={styles.scheduleHeaderActionText}>Open Scheduler</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      
      {/* Navigation Top Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Icon source="chevron-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.navTitle}>Daily Weaning Plan Details</Text>
          <Text style={styles.navSubTitle}>{weekTitle} · {formattedDisplayDate}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Baby Profile Info Card */}
        <View style={styles.babyCard}>
          <View style={styles.babyAvatarBox}>
            <Icon source="baby-face-outline" size={24} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.babyNameText}>{selectedBaby?.name || 'Baby Profile'}</Text>
            <Text style={styles.babyAgeText}>{babyAgeMonths} Months Old · Stage {babyAgeMonths <= 7 ? '1 (Puree)' : babyAgeMonths <= 10 ? '2 (Mashed)' : '3 (Finger Food)'}</Text>
            {selectedBaby?.allergies && selectedBaby.allergies.length > 0 ? (
              <View style={styles.allergyTagRow}>
                <Icon source="shield-alert-outline" size={12} color="#FF5F70" />
                <Text style={styles.allergyTagText}>Allergies: {selectedBaby.allergies.join(', ')}</Text>
              </View>
            ) : (
              <View style={styles.safeTagRow}>
                <Icon source="shield-check-outline" size={12} color="#10B981" />
                <Text style={styles.safeTagText}>Allergen Safe · No known allergies</Text>
              </View>
            )}
          </View>
        </View>

        {/* Main Card with Date, Calories & Scheduler Action Button */}
        <View style={styles.headerCard}>
          <View style={styles.headerCardTop}>
            <View>
              <Text style={styles.title}>{formattedDisplayDate}</Text>
              <Text style={styles.totalCalories}>Energy Target: {mealPlan.totalCalories} kcal</Text>
            </View>

            <TouchableOpacity 
              style={styles.scheduleHeaderActionBtn}
              onPress={handleOpenScheduler}
              activeOpacity={0.8}
            >
              <Icon source="calendar-month-outline" size={16} color="#FFFFFF" />
              <Text style={styles.scheduleHeaderActionText}>Scheduler</Text>
            </TouchableOpacity>
          </View>

          {/* Nutrition macros summary */}
          <View style={styles.nutritionSummaryBox}>
            <View style={styles.summaryNutItem}>
              <Text style={styles.summaryNutVal}>{mealPlan.totalProtein || 22.2}g</Text>
              <Text style={styles.summaryNutLabel}>Protein</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryNutItem}>
              <Text style={styles.summaryNutVal}>{mealPlan.totalCarbs || 76}g</Text>
              <Text style={styles.summaryNutLabel}>Carbohydrates</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryNutItem}>
              <Text style={styles.summaryNutVal}>{mealPlan.totalFat || 12.3}g</Text>
              <Text style={styles.summaryNutLabel}>Fats</Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.mealsTitle}>Planned Meals Breakdown ({weekTitle})</Text>

        {/* List of Categorized Meal Slots (Breakfast, Lunch, Snack, Dinner) */}
        {['Breakfast', 'Lunch', 'Snack', 'Dinner'].map((slotName) => {
          const slotMeals = categorizedMeals[slotName] || [];
          return (
            <View key={slotName} style={styles.slotCard}>
              <View style={styles.slotHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.slotTitle}>{slotName}</Text>
                </View>
                <TouchableOpacity onPress={handleOpenScheduler} activeOpacity={0.8}>
                  <Text style={styles.addSlotBtnText}>+ Add Dish</Text>
                </TouchableOpacity>
              </View>

              {slotMeals.length === 0 ? (
                <Text style={styles.emptySlotText}>No dish scheduled for {slotName} slot yet.</Text>
              ) : (
                slotMeals.map((meal, index) => {
                  const cleanName = meal.name.replace(/^(Breakfast|Lunch|Snack|Dinner):\s*/i, '');
                  return (
                    <View key={meal.id || index} style={styles.mealCard}>
                      <View style={styles.mealHeader}>
                        <Text style={styles.mealName}>{cleanName}</Text>
                        <View style={styles.timeTag}>
                          <Text style={styles.mealTime}>
                            {meal.time && meal.time.trim() !== '' ? meal.time : 'Set Time'}
                          </Text>
                        </View>
                      </View>

                      {!!meal.description && (
                        <Text style={styles.mealDescription}>{meal.description}</Text>
                      )}

                      <View style={styles.mealMetaRow}>
                        <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
                        {!!meal.protein && <Text style={styles.macroPill}>Protein {meal.protein}g</Text>}
                        {!!meal.carbs && <Text style={styles.macroPill}>Carbs {meal.carbs}g</Text>}
                      </View>

                      {/* Interactive Action Buttons linking to Weaning Recipe, Schedule & Remove */}
                      <View style={styles.itemActionsRow}>
                        <TouchableOpacity 
                          style={styles.recipeDetailBtn}
                          onPress={() => handleOpenRecipeDetail(meal)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.recipeDetailBtnText}>View Recipe</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={styles.scheduleItemBtn}
                          onPress={handleOpenScheduler}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.scheduleItemBtnText}>Scheduler</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={styles.deleteDetailBtn}
                          onPress={() => handleRemoveDish(meal)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.deleteDetailBtnText}>Remove</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          );
        })}

        {/* Expert Weaning Nutrition Guidance Card */}
        <View style={styles.guidanceCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Icon source="lightbulb-on-outline" size={18} color="#D97706" />
            <Text style={styles.guidanceTitle}>Pediatric Weaning & Hydration Guidance</Text>
          </View>
          <Text style={styles.guidanceText}>
            Ensure meals are served warm and soft for {selectedBaby?.name || 'baby'} ({babyAgeMonths}m). Offer small sips of lukewarm water between meals and monitor allergen safety carefully.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  notFoundText: {
    fontSize: 15,
    color: colors.textSoft,
    marginBottom: 16,
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface || '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDashedPrimary || '#FFE4E6',
    elevation: 2,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  navSubTitle: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 1,
  },
  babyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface || '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border || '#FFE4E6',
    gap: 12,
  },
  babyAvatarBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFF0F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },
  babyNameText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  babyAgeText: {
    fontSize: 12,
    color: colors.textSoft,
    marginTop: 2,
  },
  allergyTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  allergyTagText: {
    fontSize: 11,
    color: '#FF5F70',
    fontWeight: '700',
  },
  safeTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  safeTagText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '700',
  },
  headerCard: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  headerCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  totalCalories: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '700',
    marginTop: 4,
  },
  scheduleHeaderActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  scheduleHeaderActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  nutritionSummaryBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryNutItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNutVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  summaryNutLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
    fontWeight: '600',
  },
  summaryDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  mealsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
  },
  slotCard: {
    backgroundColor: colors.surface || '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border || '#FFE4E6',
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDashedPrimary || '#FFF0F2',
    paddingBottom: 6,
  },
  slotTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  addSlotBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  emptySlotText: {
    fontSize: 12,
    color: colors.textSoft,
    fontStyle: 'italic',
    paddingVertical: 6,
  },
  mealCard: {
    backgroundColor: colors.surfaceAlt || '#FFF0F2',
    borderRadius: 14,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border || '#FFE4E6',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  mealName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  timeTag: {
    backgroundColor: colors.surface || '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border || '#FFE4E6',
  },
  mealTime: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  mealDescription: {
    fontSize: 12,
    color: colors.textSoft,
    marginBottom: 6,
  },
  mealMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  mealCalories: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  macroPill: {
    fontSize: 11,
    color: colors.textSoft,
    fontWeight: '600',
  },
  itemActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  recipeDetailBtn: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: colors.surface || '#FFFFFF',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border || '#FFE4E6',
  },
  recipeDetailBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  scheduleItemBtn: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: colors.surface || '#FFFFFF',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border || '#FFE4E6',
  },
  scheduleItemBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  deleteDetailBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#FFF0F2',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },
  deleteDetailBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
  },
  guidanceCard: {
    backgroundColor: colors.surface || '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border || '#FFE4E6',
  },
  guidanceTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  guidanceText: {
    fontSize: 11,
    color: colors.textSoft,
    lineHeight: 16,
  },
});

export default MealPlanDetailScreen;
