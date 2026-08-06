import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { mealPlanService } from '../../services/mealPlanService';
import { MealPlan } from '../../types/meal-plan';
import { useAppTheme } from '../../theme/useAppTheme';
import type { AppColors } from '../../theme/colors';

const BackIcon = ({ size = 20, color = '#FF5F70' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M15 19l-7-7 7-7" />
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
    } else {
      setLoading(false);
    }
  }, [mealPlanId]);

  const loadMealPlan = async () => {
    try {
      const data = await mealPlanService.getMealPlanById(mealPlanId);
      if (data) setMealPlan(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
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
      </View>

      <View style={styles.headerCard}>
        <Text style={styles.title}>📅 Date: {mealPlan.date}</Text>
        <Text style={styles.totalCalories}>🔥 Total Calories: {mealPlan.totalCalories} kcal</Text>
      </View>
      
      <Text style={styles.mealsTitle}>🍲 Daily Meals</Text>
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
            <Text style={styles.mealCalories}>🔥 {item.calories} kcal</Text>
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
  headerCard: {
    backgroundColor: colors.primary,
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.borderDashedPrimary,
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  totalCalories: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primarySoft,
  },
  mealsTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
    marginLeft: 4,
  },
  listPadding: {
    paddingBottom: 20,
  },
  mealCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.borderDashedPrimary,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealName: {
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
    borderStyle: 'solid',
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
    marginBottom: 8,
    lineHeight: 20,
  },
  mealCalories: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  headerRow: {
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.borderDashedPrimary,
    shadowColor: colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
