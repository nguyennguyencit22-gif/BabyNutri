import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { mealPlanService } from '../../services/mealPlanService';
import { MealPlan } from '../../types/meal-plan';

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
        <ActivityIndicator size="large" color="#FF5F70" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={mealPlans}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => navigation.navigate('MealPlanDetail', { mealPlanId: item.id })}
            activeOpacity={0.88}
          >
            <Text style={styles.planDate}>📅 Ngày: {item.date}</Text>
            <Text style={styles.planCalories}>🔥 Tổng calo: {item.totalCalories} kcal</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có thực đơn nào cho bé.</Text>
            <Text style={styles.emptySubText}>Các thực đơn dinh dưỡng gợi ý sẽ hiển thị tại đây!</Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF9',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFDF9',
  },
  listContainer: {
    paddingVertical: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFEFEA',
    elevation: 2,
    shadowColor: '#FF5F70',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  planDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4B3034',
    marginBottom: 4,
  },
  planCalories: {
    fontSize: 13,
    color: '#FF5F70',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4B3034',
    marginBottom: 6,
  },
  emptySubText: {
    fontSize: 14,
    color: '#8E7377',
    textAlign: 'center',
  },
});
