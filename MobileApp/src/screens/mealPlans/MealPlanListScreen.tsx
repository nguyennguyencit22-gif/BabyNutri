import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { mealPlanService } from '../../services/mealPlanService';
import { MealPlan } from '../../types/meal-plan';

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
    setSelectedDate(new Date());
    
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

      <View style={styles.mealsContainer}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#FF5F70" />
          </View>
        ) : selectedPlan ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.planSummary}>
              <Text style={styles.caloriesText}>
                Tổng Calories: <Text style={styles.caloriesHighlight}>{selectedPlan.totalCalories} kcal</Text>
              </Text>
            </View>
            
            {selectedPlan.meals.map((meal, index) => (
              <TouchableOpacity 
                key={meal.id || index} 
                style={styles.mealCard}
                onPress={() => navigation.navigate('MealPlanDetail', { mealPlanId: selectedPlan.id })}
                activeOpacity={0.88}
              >
                <View style={styles.mealTimeContainer}>
                  <Text style={styles.mealTime}>{meal.time}</Text>
                  <View style={styles.timeLine} />
                </View>
                <View style={styles.mealContent}>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  {!!meal.description && (
                    <Text style={styles.mealDesc} numberOfLines={2}>{meal.description}</Text>
                  )}
                  <View style={styles.mealFooter}>
                    <Text style={styles.mealCalories}>🔥 {meal.calories} kcal</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            <View style={{ height: 40 }} />
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
              activeOpacity={0.88}
            >
              <Text style={styles.addButtonText}>+ Thêm món ăn</Text>
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
    backgroundColor: '#FFFDF9',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFDF9',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4B3034',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E7377',
    marginTop: 2,
    fontWeight: '500',
  },
  calendarWrapper: {
    backgroundColor: '#FFFDF9',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderBottomColor: '#FFD5CC',
  },
  calendarContainer: {
    paddingHorizontal: 16,
  },
  dayButton: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#FFD5CC',
    minWidth: 54,
  },
  dayButtonSelected: {
    backgroundColor: '#FF5F70',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#FF5F70',
    shadowColor: '#FF5F70',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E7377',
    marginBottom: 6,
  },
  dayNumberCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF0F2',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#FFD5CC',
  },
  dayNumberCircleSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderColor: 'transparent',
  },
  dayNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4B3034',
  },
  dayNumberSelectedText: {
    color: '#FFFFFF',
  },
  dayTextSelected: {
    color: '#FFFFFF',
  },
  mealsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planSummary: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  caloriesText: {
    fontSize: 15,
    color: '#8E7377',
    fontWeight: '600',
  },
  caloriesHighlight: {
    color: '#FF5F70',
    fontWeight: '800',
  },
  mealCard: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  mealTimeContainer: {
    width: 65,
    alignItems: 'center',
  },
  mealTime: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FF5F70',
  },
  timeLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#FFE4E6',
    marginTop: 8,
    borderRadius: 1,
  },
  mealContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#FF9EAA',
    shadowColor: '#FF5F70',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  mealName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#4B3034',
    marginBottom: 6,
  },
  mealDesc: {
    fontSize: 14,
    color: '#8E7377',
    lineHeight: 20,
    marginBottom: 10,
  },
  mealFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  mealCalories: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF5F70',
    backgroundColor: '#FFF0F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#FFD5CC',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4B3034',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#FF5F70',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#FF9EAA',
    shadowColor: '#FF5F70',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
