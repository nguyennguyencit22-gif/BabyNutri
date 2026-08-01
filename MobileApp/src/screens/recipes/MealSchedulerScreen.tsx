import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  StatusBar,
} from 'react-native';
import { 
  CalendarIcon, 
  SparklesIcon, 
  PlusIcon, 
  TrashIcon, 
  FireIcon, 
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from 'react-native-heroicons/outline';
import TopHeaderBar from '../../components/common/TopHeaderBar';

// Design theme matching Member B pastel theme
const THEME = {
  primary: '#FF5F70',
  primaryLight: '#FFF0F2',
  background: '#FFFDF9',
  surface: '#FFFFFF',
  textDark: '#4B3034',
  textMuted: '#8E7377',
  borderColor: '#FFE4E6',
  accentGreen: '#10B981',
  accentOrange: '#F59E0B',
};

// Sample recipes for smart recommendations
const SAMPLE_RECOMMENDED_RECIPES = [
  { id: '1', name: 'Cháo rạm thịt lợn bí đỏ', category: 'Bữa sáng', monthAge: '6-12 tháng', kcal: 220, protein: 8.5, fat: 4.2, carbs: 32, icon: '🥣' },
  { id: '2', name: 'Súp cà rốt tôm tươi', category: 'Bữa trưa', monthAge: '6-12 tháng', kcal: 180, protein: 10.2, fat: 3.1, carbs: 24, icon: '🍲' },
  { id: '3', name: 'Sinh tố bơ chuối sữa chua', category: 'Bữa xế', monthAge: '6-12 tháng', kcal: 140, protein: 3.5, fat: 5.0, carbs: 20, icon: '🥑' },
  { id: '4', name: 'Cháo yến mạch cá hồi khoai tây', category: 'Bữa tối', monthAge: '12-24 tháng', kcal: 260, protein: 12.0, fat: 6.8, carbs: 35, icon: '🐟' },
];

const DAYS_OF_WEEK = [
  { day: 'Thứ 2', date: '31/07' },
  { day: 'Thứ 3', date: '01/08' },
  { day: 'Thứ 4', date: '02/08' },
  { day: 'Thứ 5', date: '03/08' },
  { day: 'Thứ 6', date: '04/08' },
  { day: 'Thứ 7', date: '05/08' },
  { day: 'Chủ Nhật', date: '06/08' },
];

export const MealSchedulerScreen = ({ navigation }: any) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  
  // State for daily meal plan
  const [meals, setMeals] = useState<{ [key: string]: typeof SAMPLE_RECOMMENDED_RECIPES }>({
    'Bữa Sáng': [SAMPLE_RECOMMENDED_RECIPES[0]],
    'Bữa Trưa': [SAMPLE_RECOMMENDED_RECIPES[1]],
    'Bữa Xế': [SAMPLE_RECOMMENDED_RECIPES[2]],
    'Bữa Tối': [],
  });

  // Calculate total daily nutrition
  const totalKcal = useMemo(() => {
    let sum = 0;
    Object.values(meals).forEach(mealList => {
      mealList.forEach(item => { sum += item.kcal; });
    });
    return sum;
  }, [meals]);

  const totalProtein = useMemo(() => {
    let sum = 0;
    Object.values(meals).forEach(mealList => {
      mealList.forEach(item => { sum += item.protein; });
    });
    return sum.toFixed(1);
  }, [meals]);

  // Add recommended item to meal schedule
  const handleAddDish = (mealType: string, recipe: typeof SAMPLE_RECOMMENDED_RECIPES[0]) => {
    setMeals(prev => ({
      ...prev,
      [mealType]: [...(prev[mealType] || []), recipe],
    }));
    Alert.alert('Thành công', `Đã thêm món "${recipe.name}" vào ${mealType}!`);
  };

  // Remove dish from meal schedule
  const handleRemoveDish = (mealType: string, index: number) => {
    setMeals(prev => {
      const updated = [...prev[mealType]];
      updated.splice(index, 1);
      return { ...prev, [mealType]: updated };
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <TopHeaderBar />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header Title with Back Button */}
        <View style={styles.headerRow}>
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <ChevronLeftIcon size={22} color="#FF5F70" />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Lịch Dinh Dưỡng Cho Bé 📅</Text>
            <Text style={styles.subTitle}>Lên thực đơn & Đề xuất món ăn chuẩn chuyên gia</Text>
          </View>
        </View>

        {/* Horizontal Days Selector */}
        <View style={styles.daysWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysScroll}>
            {DAYS_OF_WEEK.map((item, idx) => {
              const isSelected = idx === selectedDayIndex;
              return (
                <TouchableOpacity
                  key={item.day}
                  style={[styles.dayCard, isSelected && styles.activeDayCard]}
                  onPress={() => setSelectedDayIndex(idx)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dayText, isSelected && styles.activeDayText]}>{item.day}</Text>
                  <Text style={[styles.dateText, isSelected && styles.activeDateText]}>{item.date}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Daily Nutrition Summary Card */}
        <View style={styles.nutritionCard}>
          <View style={styles.nutritionHeader}>
            <Text style={styles.nutritionCardTitle}>📊 Tổng Quan Dinh Dưỡng Hôm Nay</Text>
            <View style={styles.badgeSuccess}>
              <CheckCircleIcon size={14} color="#10B981" />
              <Text style={styles.badgeText}>Đạt tiêu chuẩn</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <FireIcon size={20} color="#FF5F70" />
              <Text style={styles.statVal}>{totalKcal} kcal</Text>
              <Text style={styles.statLabel}>Mục tiêu: 550 kcal</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <Text style={styles.statEmoji}>🥩</Text>
              <Text style={styles.statVal}>{totalProtein}g</Text>
              <Text style={styles.statLabel}>Chất đạm</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <Text style={styles.statEmoji}>🌾</Text>
              <Text style={styles.statVal}>76g</Text>
              <Text style={styles.statLabel}>Tinh bột</Text>
            </View>
          </View>
        </View>

        {/* Smart Recommendations Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <SparklesIcon size={20} color="#FF5F70" />
            <Text style={styles.sectionTitle}>Gợi Ý Thông Minh Cho Bữa Tiếp Theo</Text>
          </View>

          <FlatList
            horizontal
            data={SAMPLE_RECOMMENDED_RECIPES}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recommendScroll}
            renderItem={({ item }) => (
              <View style={styles.recommendCard}>
                <Text style={styles.recEmoji}>{item.icon}</Text>
                <Text style={styles.recName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.recCategory}>{item.category} · {item.monthAge}</Text>

                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => handleAddDish(item.category, item)}
                  activeOpacity={0.8}
                >
                  <PlusIcon size={14} color="#FFFFFF" />
                  <Text style={styles.addBtnText}>Thêm vào lịch</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>

        {/* Meal Schedule Slots (Sáng, Trưa, Xế, Tối) */}
        <Text style={styles.sectionMainTitle}>🍽️ Thực Đơn Chi Tiết Ngày {DAYS_OF_WEEK[selectedDayIndex].date}</Text>

        {['Bữa Sáng', 'Bữa Trưa', 'Bữa Xế', 'Bữa Tối'].map((mealName) => {
          const dishList = meals[mealName] || [];
          return (
            <View key={mealName} style={styles.mealSlotCard}>
              <View style={styles.mealSlotHeader}>
                <Text style={styles.mealSlotTitle}>{mealName}</Text>
                <TouchableOpacity 
                  style={styles.addMoreBtn}
                  onPress={() => navigation.navigate('LibraryTab')}
                  activeOpacity={0.7}
                >
                  <PlusIcon size={14} color="#FF5F70" />
                  <Text style={styles.addMoreText}>Chọn món từ thư viện</Text>
                </TouchableOpacity>
              </View>

              {dishList.length === 0 ? (
                <Text style={styles.emptySlotText}>Chưa có món ăn nào. Bấm (+) để thêm món nhé!</Text>
              ) : (
                dishList.map((dish, idx) => (
                  <View key={idx} style={styles.dishRow}>
                    <Text style={styles.dishEmoji}>{dish.icon}</Text>
                    <View style={styles.dishInfo}>
                      <Text style={styles.dishName}>{dish.name}</Text>
                      <Text style={styles.dishMeta}>{dish.kcal} kcal · Đạm {dish.protein}g</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleRemoveDish(mealName, idx)}>
                      <TrashIcon size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF0F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.textDark,
    marginBottom: 2,
  },
  subTitle: {
    fontSize: 13,
    color: THEME.textMuted,
  },
  daysWrapper: {
    marginBottom: 16,
  },
  daysScroll: {
    gap: 8,
  },
  dayCard: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.borderColor,
    alignItems: 'center',
    minWidth: 70,
  },
  activeDayCard: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
    elevation: 3,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.textMuted,
    marginBottom: 2,
  },
  activeDayText: {
    color: '#FFFFFF',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.textDark,
  },
  activeDateText: {
    color: '#FFFFFF',
  },
  nutritionCard: {
    backgroundColor: THEME.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.borderColor,
    marginBottom: 20,
    elevation: 2,
  },
  nutritionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  nutritionCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.textDark,
  },
  badgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.textDark,
    marginTop: 4,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: THEME.textMuted,
  },
  statEmoji: {
    fontSize: 18,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#F3E8E2',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.textDark,
  },
  recommendScroll: {
    gap: 12,
  },
  recommendCard: {
    width: 160,
    backgroundColor: THEME.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.borderColor,
  },
  recEmoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  recName: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.textDark,
    height: 36,
    marginBottom: 4,
  },
  recCategory: {
    fontSize: 11,
    color: THEME.textMuted,
    marginBottom: 10,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.primary,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionMainTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.textDark,
    marginBottom: 12,
  },
  mealSlotCard: {
    backgroundColor: THEME.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.borderColor,
    marginBottom: 12,
  },
  mealSlotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  mealSlotTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.textDark,
  },
  addMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  addMoreText: {
    fontSize: 12,
    color: THEME.primary,
    fontWeight: '700',
  },
  emptySlotText: {
    fontSize: 12,
    color: THEME.textMuted,
    fontStyle: 'italic',
    paddingVertical: 6,
  },
  dishRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.primaryLight,
    padding: 10,
    borderRadius: 12,
    marginBottom: 6,
  },
  dishEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  dishInfo: {
    flex: 1,
  },
  dishName: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.textDark,
  },
  dishMeta: {
    fontSize: 11,
    color: THEME.primary,
    fontWeight: '600',
  },
});

export default MealSchedulerScreen;
