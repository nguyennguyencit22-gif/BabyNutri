import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { mealPlanService } from '../../services/mealPlanService';
import { MealPlan, Meal } from '../../types/meal-plan';

export const MealPlanDetailScreen = ({ route, navigation }: any) => {
  // Nhận tham số từ màn hình trước
  const { date, dayName, dateStr } = route.params || {};
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMealPlan();
  }, [date]);

  const loadMealPlan = async () => {
    setLoading(true);
    try {
      const plan = await mealPlanService.getMealPlanForDate(dateStr, dayName);
      if (plan) {
        setMealPlan(plan);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToRecipes = (mealType: string) => {
    // Gọi màn hình Recipes của Member B (hiện tại hiển thị Alert vì chưa có trang)
    Alert.alert(
      "Chuyển sang trang Công thức", 
      `Bạn đang muốn chọn món cho bữa [${mealType}].\nTính năng này sẽ gọi sang trang Recipes của Member B.`
    );
  };

  const renderMealSection = (mealType: string) => {
    // Lọc ra món ăn thuộc bữa này
    const mealsForType = mealPlan?.meals.filter(m => m.type === mealType) || [];

    return (
      <View style={styles.mealSection}>
        <View style={styles.mealHeader}>
          <Text style={styles.mealTitle}>Bữa {mealType}</Text>
        </View>

        {mealsForType.length > 0 ? (
          mealsForType.map(meal => (
            <View key={meal.id} style={styles.foodItem}>
              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>{meal.name}</Text>
                <Text style={styles.foodCalories}>{meal.calories} kcal</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.changeButton} 
                onPress={() => navigateToRecipes(mealType)}
              >
                <Text style={styles.changeButtonText}>Thay đổi (+)</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyFoodItem}>
            <Text style={styles.emptyText}>Chưa có món ăn</Text>
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={() => navigateToRecipes(mealType)}
            >
              <Text style={styles.addButtonText}>Thêm món (+)</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{dayName}</Text>
        <Text style={styles.headerSubtitle}>{dateStr}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderMealSection('Sáng')}
        {renderMealSection('Trưa')}
        {renderMealSection('Chiều')}
        {renderMealSection('Tối')}
        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF2EC',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF2EC',
  },
  header: {
    padding: 20,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFE0E0',
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  mealSection: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  foodCalories: {
    fontSize: 14,
    color: '#888',
  },
  changeButton: {
    backgroundColor: '#FFD3D8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  changeButtonText: {
    color: '#FF6B6B',
    fontWeight: 'bold',
    fontSize: 12,
  },
  emptyFoodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  emptyText: {
    fontSize: 14,
    color: '#AAA',
    fontStyle: 'italic',
  },
  addButton: {
    backgroundColor: '#FFF2EC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  addButtonText: {
    color: '#FF6B6B',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
