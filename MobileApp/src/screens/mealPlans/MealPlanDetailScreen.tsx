import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, StatusBar, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { mealPlanService } from '../../services/mealPlanService';
import { MealPlan, Meal } from '../../types/meal-plan';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';

const BackIcon = ({ size = 20, color = '#333' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M15 19l-7-7 7-7" />
  </Svg>
);

const DEFAULT_MEALS = [
  { id: '1', name: 'Bữa Sáng', recipeName: 'Chưa có món', calories: 0, time: '' },
  { id: '2', name: 'Bữa Trưa', recipeName: 'Chưa có món', calories: 0, time: '' },
  { id: '3', name: 'Bữa Chiều', recipeName: 'Chưa có món', calories: 0, time: '' },
  { id: '4', name: 'Bữa Tối', recipeName: 'Chưa có món', calories: 0, time: '' },
];

export const MealPlanDetailScreen = ({ route, navigation }: any) => {
  const { dateStr, dayName } = route.params || {};
  
  const babies = useSelector((state: RootState) => state.baby.babies);
  const selectedBabyIdFromRedux = useSelector((state: RootState) => state.baby.selectedBabyId);
  const activeChildId = String(selectedBabyIdFromRedux || babies[0]?.id || '1');

  const [loading, setLoading] = useState(true);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [meals, setMeals] = useState<any[]>(DEFAULT_MEALS);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [editRecipeName, setEditRecipeName] = useState('');
  const [editTime, setEditTime] = useState('');

  useEffect(() => {
    loadMealPlan();
  }, [dateStr, activeChildId]);

  const loadMealPlan = async () => {
    setLoading(true);
    try {
      if (dateStr) {
        const plan = await mealPlanService.getMealPlanByDate(activeChildId, dateStr);
        if (plan && plan.meals && plan.meals.length > 0) {
          setMealPlan(plan);
          // Map to 4 standard meals
          const mappedMeals = DEFAULT_MEALS.map(defaultMeal => {
            const found = plan.meals.find((m: any) => m.name === defaultMeal.name);
            if (found) {
              return { ...defaultMeal, recipeName: found.description || 'Đã thêm món', calories: found.calories || 0, time: found.time || '' };
            }
            return defaultMeal;
          });
          setMeals(mappedMeals);
        } else {
          setMeals(DEFAULT_MEALS);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (meal: any) => {
    setSelectedMeal(meal);
    setEditRecipeName(meal.recipeName === 'Chưa có món' ? '' : meal.recipeName);
    setEditTime(meal.time || '');
    setModalVisible(true);
  };

  const handleSaveMeal = async () => {
    if (!selectedMeal) return;

    const updatedMeals = meals.map(m => {
      if (m.id === selectedMeal.id) {
        return { ...m, recipeName: editRecipeName || 'Chưa có món', time: editTime, calories: editRecipeName ? 300 : 0 };
      }
      return m;
    });

    setMeals(updatedMeals);
    setModalVisible(false);

    // Save to service
    const apiMeals = updatedMeals.filter(m => m.recipeName !== 'Chưa có món').map(m => ({
      id: m.id,
      name: m.name,
      description: m.recipeName,
      calories: m.calories,
      time: m.time
    }));

    await mealPlanService.createMealPlan({
      childId: activeChildId,
      date: dateStr,
      meals: apiMeals as any,
      totalCalories: apiMeals.reduce((acc, curr) => acc + curr.calories, 0),
      totalProtein: 0,
      totalFat: 0,
      totalCarbs: 0,
    });

    Alert.alert('Thành công', 'Đã lưu thay đổi bữa ăn!');
  };

  const displayDate = dateStr ? dateStr.split('-').reverse().join('/') : '7/9/2026';
  const displayDayName = dayName || 'T2';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDFDFD" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meal Plan Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>{displayDayName}</Text>
          <Text style={styles.bannerSubtitle}>{displayDate}</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#FF7482" style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.mealsContainer}>
            {meals.map((meal) => (
              <View key={meal.id} style={styles.mealCard}>
                <View style={styles.mealHeader}>
                  <Text style={styles.mealHeaderText}>{meal.name}</Text>
                </View>
                <View style={styles.mealBody}>
                  <View style={styles.mealInfo}>
                    <Text style={styles.recipeName}>{meal.recipeName}</Text>
                    <Text style={styles.caloriesText}>
                      {meal.calories > 0 ? `${meal.calories} kcal` : ''} 
                      {meal.time ? ` • ${meal.time}` : ''}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.changeBtn}
                    onPress={() => handleOpenEdit(meal)}
                  >
                    <Text style={styles.changeBtnText}>Thay đổi (+)</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cập nhật {selectedMeal?.name}</Text>
            
            <Text style={styles.label}>Tên món ăn (Recipe)</Text>
            <TextInput 
              style={styles.input}
              placeholder="VD: Cháo yến mạch thịt băm"
              value={editRecipeName}
              onChangeText={setEditRecipeName}
            />

            <Text style={styles.label}>Thời gian ăn</Text>
            <TextInput 
              style={styles.input}
              placeholder="VD: 08:00 AM"
              value={editTime}
              onChangeText={setEditTime}
            />

            <View style={styles.noteBox}>
              <Text style={styles.noteText}>
                ⚠️ Lưu ý: Ứng dụng sẽ báo trước mỗi 2 tiếng. Người dùng có thể bỏ trống thời gian nếu muốn.
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveMeal}>
                <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContent: {
    padding: 16,
  },
  banner: {
    backgroundColor: '#FF7482',
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#FF7482',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  bannerTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },
  mealsContainer: {
    gap: 16,
  },
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFF0F2',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  mealHeader: {
    backgroundColor: '#FFA751',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  mealHeaderText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  mealBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  mealInfo: {
    flex: 1,
    paddingRight: 10,
  },
  recipeName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  caloriesText: {
    fontSize: 13,
    color: '#888',
  },
  changeBtn: {
    backgroundColor: '#FFEBED',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  changeBtnText: {
    color: '#FF7482',
    fontWeight: '700',
    fontSize: 12,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 15,
    color: '#333',
  },
  noteBox: {
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  noteText: {
    fontSize: 13,
    color: '#F57F17',
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#555',
    fontWeight: 'bold',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FF7482',
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
