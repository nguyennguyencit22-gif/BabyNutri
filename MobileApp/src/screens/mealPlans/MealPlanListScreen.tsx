import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { mealPlanService } from '../../services/mealPlanService';
import { MealPlan } from '../../types/meal-plan';
import { MealPlanCard } from '../../components/mealPlans/MealPlanCard';

export const MealPlanListScreen = ({ route, navigation }: any) => {
  const { childId } = route.params || {};
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMealPlans();
  }, [childId]);

  const loadMealPlans = async () => {
    setLoading(true);
    try {
      const data = await mealPlanService.getMealPlans(childId);
      setMealPlans(data);
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

  return (
    <View style={styles.container}>
      <FlatList
        data={mealPlans}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MealPlanCard 
            mealPlan={item} 
            onPress={() => navigation.navigate('MealPlanDetail', { mealPlanId: item.id })} 
          />
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No meal plans found.</Text>}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingVertical: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
});
