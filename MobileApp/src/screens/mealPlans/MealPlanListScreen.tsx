import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';

export const MealPlanListScreen = ({ route, navigation }: any) => {
  const { childId } = route.params || {};
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [weekDays, setWeekDays] = useState<Date[]>([]);

  useEffect(() => {
    // Khởi tạo tuần hiện tại (bắt đầu từ Thứ 2)
    const today = new Date();
    const currentDay = today.getDay();
    const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    setCurrentWeekStart(monday);
  }, []);

  useEffect(() => {
    if (currentWeekStart) {
      const days = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(currentWeekStart);
        d.setDate(currentWeekStart.getDate() + i);
        days.push(d);
      }
      setWeekDays(days);
    }
  }, [currentWeekStart]);

  const goToPreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  const monthYearStr = currentWeekStart.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Điều Hướng Lịch */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousWeek} style={styles.navButton}>
          <Text style={styles.navButtonText}>{"<"}</Text>
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Thực Đơn Tuần</Text>
          <Text style={styles.headerSubtitle}>{monthYearStr}</Text>
        </View>

        <TouchableOpacity onPress={goToNextWeek} style={styles.navButton}>
          <Text style={styles.navButtonText}>{">"}</Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách các ngày trong tuần */}
      <ScrollView contentContainerStyle={styles.listContainer}>
        {weekDays.map((d, index) => {
          const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
          const dayName = dayNames[d.getDay()];
          const dateStr = d.toLocaleDateString('vi-VN');
          
          const isToday = d.toDateString() === new Date().toDateString();

          return (
            <TouchableOpacity 
              key={index} 
              style={[styles.dayCard, isToday && styles.dayCardToday]}
              onPress={() => navigation.navigate('MealPlanDetail', { 
                date: d.toISOString(), 
                dayName, 
                dateStr 
              })}
              activeOpacity={0.8}
            >
              <View style={styles.dayInfo}>
                <Text style={[styles.dayName, isToday && styles.textToday]}>{dayName}</Text>
                <Text style={styles.dateStr}>{dateStr}</Text>
              </View>
              
              <View style={styles.addButtonCircle}>
                <Text style={styles.addButtonIcon}>+</Text>
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF2EC', // Nền hồng nhạt
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: '#FF6B6B', // Đỏ san hô
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    marginBottom: 15,
  },
  navButton: {
    padding: 10,
  },
  navButtonText: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFE0E0',
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  dayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9F43',
  },
  dayCardToday: {
    borderLeftColor: '#FF6B6B',
    backgroundColor: '#FFF9F9',
  },
  dayInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  dayName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    width: 40,
  },
  textToday: {
    color: '#FF6B6B',
  },
  dateStr: {
    fontSize: 14,
    color: '#888',
    marginLeft: 10,
  },
  addButtonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFD3D8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
});
