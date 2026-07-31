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
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!mealPlan) {
    return (
      <View style={styles.center}>
        <Text>Meal Plan not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.title}>Date: {mealPlan.date}</Text>
        <Text style={styles.totalCalories}>Total: {mealPlan.totalCalories} kcal</Text>
      </View>
      
      <Text style={styles.mealsTitle}>Meals</Text>
      <FlatList
        data={mealPlan.meals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <Text style={styles.mealName}>{item.name}</Text>
              <Text style={styles.mealTime}>{item.time}</Text>
            </View>
            <Text style={styles.mealDescription}>{item.description}</Text>
            <Text style={styles.mealCalories}>{item.calories} kcal</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCard: {
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  totalCalories: {
    fontSize: 16,
    color: '#fff',
  },
  mealsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    marginLeft: 4,
  },
  mealCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  mealTime: {
    fontSize: 14,
    color: '#666',
  },
  mealDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  mealCalories: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E91E63',
  },
});
