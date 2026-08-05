import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { mealPlanService } from '../../services/mealPlanService';
import { MealPlan, Meal } from '../../types/meal-plan';

export const MealPlanListScreen = ({ route, navigation }: any) => {
  const { childId } = route.params || {};
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState<Date[]>([]);

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
    
    // Reset selected date to today if we just mounted
    setSelectedDate(new Date());
    
    loadMealPlans();
  }, [childId]);

  const loadMealPlans = async () => {
    setLoading(true);
    try {
      // Get all meal plans. The backend should ideally return the current week's plans
      const data = await mealPlanService.getMealPlans(childId);
      setMealPlans(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedDayMealPlan = () => {
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    return mealPlans.find(plan => plan.date === selectedDateStr);
  };

  const selectedPlan = getSelectedDayMealPlan();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thực Đơn Tuần</Text>
        <Text style={styles.headerSubtitle}>Lịch ăn dinh dưỡng cho bé</Text>
      </View>

      <View style={styles.calendarWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.calendarContainer}>
          {weekDays.map((d, index) => {
            const isSelected = selectedDate.toDateString() === d.toDateString();
            const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
            return (
              <TouchableOpacity 
                key={index} 
                style={[styles.dayButton, isSelected && styles.dayButtonSelected]}
                onPress={() => setSelectedDate(d)}
                activeOpacity={0.8}
              >
                <Text style={[styles.dayName, isSelected && styles.dayTextSelected]}>
                  {dayNames[d.getDay()]}
                </Text>
                <View style={[styles.dayNumberCircle, isSelected && styles.dayNumberCircleSelected]}>
                  <Text style={[styles.dayNumber, isSelected && styles.dayTextSelected]}>
                    {d.getDate()}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.mealsContainer}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#FF6B6B" />
          </View>
        ) : selectedPlan ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.planSummary}>
              <Text style={styles.caloriesText}>Tổng Calories: <Text style={styles.caloriesHighlight}>{selectedPlan.totalCalories} kcal</Text></Text>
            </View>
            
            {selectedPlan.meals.map((meal, index) => (
              <TouchableOpacity 
                key={meal.id || index} 
                style={styles.mealCard}
                onPress={() => navigation.navigate('MealPlanDetail', { mealPlanId: selectedPlan.id })}
                activeOpacity={0.9}
              >
                <View style={styles.mealTimeContainer}>
                  <Text style={styles.mealTime}>{meal.time}</Text>
                  <View style={styles.timeLine} />
                </View>
                <View style={styles.mealContent}>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <Text style={styles.mealDesc} numberOfLines={2}>{meal.description}</Text>
                  <View style={styles.mealFooter}>
                    <Text style={styles.mealCalories}>🔥 {meal.calories} kcal</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            <View style={{height: 40}} />
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🍽️</Text>
            <Text style={styles.emptyText}>Chưa có thực đơn cho ngày này.</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => navigation.navigate('Recipes', { 
                action: 'select_meal',
                date: selectedDate.toISOString() 
              })}
            >
              <Text style={styles.addButtonText}>+ Thêm món (Sáng, Trưa, Tối)</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  calendarWrapper: {
    backgroundColor: '#fff',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  calendarContainer: {
    paddingHorizontal: 15,
  },
  dayButton: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    minWidth: 55,
  },
  dayButtonSelected: {
    backgroundColor: '#FF6B6B',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    marginBottom: 8,
  },
  dayNumberCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  dayNumberCircleSelected: {
    backgroundColor: 'transparent',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  dayTextSelected: {
    color: '#FFF',
  },
  mealsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planSummary: {
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  caloriesText: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  caloriesHighlight: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  mealCard: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  mealTimeContainer: {
    width: 70,
    alignItems: 'center',
  },
  mealTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  timeLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#FFD8D8',
    marginTop: 8,
    borderRadius: 1,
  },
  mealContent: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  mealDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  mealFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  mealCalories: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF9F43',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginBottom: 25,
  },
  addButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
