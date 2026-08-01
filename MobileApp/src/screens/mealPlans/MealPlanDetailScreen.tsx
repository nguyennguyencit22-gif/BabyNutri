import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { mealPlanService } from '../../services/mealPlanService';
import { MealPlan } from '../../types/meal-plan';

export const MealPlanDetailScreen = ({ route }: any) => {
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
        <ActivityIndicator size="large" color="#FF5F70" />
      </View>
    );
  }

  if (!mealPlan) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFoundText}>Không tìm thấy chi tiết thực đơn</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.title}>📅 Ngày áp dụng: {mealPlan.date}</Text>
        <Text style={styles.totalCalories}>🔥 Tổng calo: {mealPlan.totalCalories} kcal</Text>
      </View>
      
      <Text style={styles.mealsTitle}>🍲 Các bữa ăn trong ngày</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFDF9',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFDF9',
  },
  notFoundText: {
    fontSize: 16,
    color: '#8E7377',
  },
  headerCard: {
    backgroundColor: '#FF5F70',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#FF5F70',
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
    color: '#FFE4E6',
  },
  mealsTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#4B3034',
    marginBottom: 12,
    marginLeft: 4,
  },
  listPadding: {
    paddingBottom: 20,
  },
  mealCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFEFEA',
    elevation: 2,
    shadowColor: '#FF5F70',
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
    color: '#4B3034',
    flex: 1,
  },
  timeTag: {
    backgroundColor: '#FFF0F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  mealTime: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF5F70',
  },
  mealDescription: {
    fontSize: 14,
    color: '#60646C',
    marginBottom: 8,
    lineHeight: 20,
  },
  mealCalories: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF5F70',
  },
});
