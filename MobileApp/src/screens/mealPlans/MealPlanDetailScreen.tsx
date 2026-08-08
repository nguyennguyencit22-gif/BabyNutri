import React, { useEffect, useState } from 'react';

import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, StatusBar, Alert } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { mealPlanService } from '../../services/mealPlanService';
import { MealPlan, Meal } from '../../types/meal-plan';
import { useAppTheme } from '../../theme/useAppTheme';
import type { AppColors } from '../../theme/colors';

const BackIcon = ({ size = 20, color = '#FF5F70' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M15 19l-7-7 7-7" />
  </Svg>
);

const CalendarIcon = ({ size = 18, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
  </Svg>
);

export const MealPlanDetailScreen = ({ route, navigation }: any) => {
  const { colors, isDark } = useAppTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const { mealPlanId } = route.params || {};

  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (mealPlanId) {
      loadMealPlan();
    }
  }, [mealPlanId]);

  const loadMealPlan = async () => {
    setLoading(true);
    try {
      const plan = await mealPlanService.getMealPlanById(mealPlanId);
      if (plan) {
        setMealPlan(plan);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  const handleOpenRecipeDetail = (meal: Meal) => {
    const recipeId = meal.recipeId || 1;
    navigation.navigate('RecipeDetail', { id: recipeId });
  };

  const handleOpenScheduler = () => {
    navigation.navigate('MealScheduler');
  };

  const handleRemoveDish = (meal: Meal) => {
    if (!mealPlan) return;
    const cleanName = meal.name.replace(/^(Breakfast|Lunch|Snack|Dinner):\s*/i, '');

    Alert.alert(
      'Remove Dish',
      `Are you sure you want to remove "${cleanName}" from this meal plan?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await mealPlanService.removeDishFromMealPlan({
              childId: mealPlan.childId || '1',
              dateStr: mealPlan.date,
              mealId: meal.id,
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
        <Text style={styles.notFoundText}>Meal plan details not found</Text>

      </View>
    );
  }

  return (

    <View style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      
      <View style={styles.headerRow}>
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <BackIcon size={20} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Daily Meal Plan Details</Text>
      </View>

      {/* Main Card with Date, Calories & Scheduler Action Button */}
      <View style={styles.headerCard}>
        <View style={styles.headerCardTop}>
          <View>
            <Text style={styles.title}>📅 Date: {mealPlan.date}</Text>
            <Text style={styles.totalCalories}>🔥 Total Calories: {mealPlan.totalCalories} kcal</Text>
          </View>

          <TouchableOpacity 
            style={styles.scheduleHeaderActionBtn}
            onPress={handleOpenScheduler}
            activeOpacity={0.8}
          >
            <CalendarIcon size={16} color="#FFFFFF" />
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
      
      <Text style={styles.mealsTitle}>🍲 Today's Planned Meals</Text>
      <FlatList
        data={mealPlan.meals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <Text style={styles.mealName}>{item.name}</Text>
              <View style={styles.timeTag}>
                <Text style={styles.mealTime}>{item.time}</Text>
              </View>
            </View>

            {!!item.description && (
              <Text style={styles.mealDescription}>{item.description}</Text>
            )}

            <View style={styles.mealMetaRow}>
              <Text style={styles.mealCalories}>🔥 {item.calories} kcal</Text>
              {!!item.protein && <Text style={styles.macroPill}>🥩 Protein {item.protein}g</Text>}
              {!!item.carbs && <Text style={styles.macroPill}>🌾 Carbs {item.carbs}g</Text>}
            </View>

            {/* Interactive Action Buttons linking to Weaning Recipe, Schedule & Remove */}
            <View style={styles.itemActionsRow}>
              <TouchableOpacity 
                style={styles.recipeDetailBtn}
                onPress={() => handleOpenRecipeDetail(item)}
                activeOpacity={0.8}
              >
                <Text style={styles.recipeDetailBtnText}>📖 View Recipe</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.scheduleItemBtn}
                onPress={handleOpenScheduler}
                activeOpacity={0.8}
              >
                <Text style={styles.scheduleItemBtnText}>🗓️ Custom Schedule</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.deleteDetailBtn}
                onPress={() => handleRemoveDish(item)}
                activeOpacity={0.8}
              >
                <Text style={styles.deleteDetailBtnText}>🗑️ Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listPadding}
      />
    </View>

  );
};

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1,

    padding: 16,
    backgroundColor: colors.background,

  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: colors.background,
  },
  notFoundText: {
    fontSize: 16,
    color: colors.textSoft,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDashedPrimary,
    shadowColor: colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  headerCard: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.borderDashedPrimary,
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  headerCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  totalCalories: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primarySoft,
  },
  scheduleHeaderActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  scheduleHeaderActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  nutritionSummaryBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryNutItem: {
    alignItems: 'center',
  },
  summaryNutVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  summaryNutLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  mealsTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
    marginLeft: 4,
  },
  listPadding: {
    paddingBottom: 24,
  },
  mealCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.borderDashedPrimary,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,

  },
  mealHeader: {
    backgroundColor: '#FF9F43',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  foodInfo: {
    flex: 1,
    paddingRight: 10,
  },
  foodName: {
    fontSize: 16,

    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  timeTag: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderDashedPrimary,
  },
  mealTime: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  mealDescription: {
    fontSize: 14,
    color: colors.textSoft,
    marginBottom: 10,
    lineHeight: 20,
  },
  mealMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  mealCalories: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  macroPill: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSoft,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  itemActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  recipeDetailBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  recipeDetailBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  scheduleItemBtn: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDashedPrimary,
  },
  scheduleItemBtnText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  deleteDetailBtn: {
    backgroundColor: '#FFF0F2',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF5F70',
  },
  deleteDetailBtnText: {
    color: '#FF5F70',
    fontSize: 12,
    fontWeight: '700',

  },
});
