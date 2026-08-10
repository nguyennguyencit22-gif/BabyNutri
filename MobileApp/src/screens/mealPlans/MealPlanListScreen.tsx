import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const BackIcon = ({ size = 20, color = '#333' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M15 19l-7-7 7-7" />
  </Svg>
);

const PlusIcon = ({ size = 16, color = '#FF7482' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 5v14M5 12h14" />
  </Svg>
);

export const MealPlanListScreen = ({ navigation }: any) => {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [weekDays, setWeekDays] = useState<Date[]>([]);

  const monthYear = useMemo(() => {
    const today = new Date();
    return `tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;
  }, []);

  useEffect(() => {
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDay = firstOfMonth.getDay();
    const diffToMonday = firstOfMonth.getDate() - firstDay + (firstDay === 0 ? -6 : 1);
    const firstMonday = new Date(firstOfMonth.setDate(diffToMonday));

    const targetMonday = new Date(firstMonday);
    targetMonday.setDate(firstMonday.getDate() + (selectedWeek - 1) * 7);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(targetMonday);
      d.setDate(targetMonday.getDate() + i);
      days.push(d);
    }
    setWeekDays(days);
  }, [selectedWeek]);

  const handlePrevWeek = () => {
    if (selectedWeek > 1) setSelectedWeek(selectedWeek - 1);
  };

  const handleNextWeek = () => {
    if (selectedWeek < 4) setSelectedWeek(selectedWeek + 1);
  };

  const getDayName = (dayIndex: number) => {
    if (dayIndex === 0) return 'CN';
    return `T${dayIndex + 1}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDFDFD" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meal Plans</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner */}
        <View style={styles.banner}>
          <TouchableOpacity onPress={handlePrevWeek} style={styles.arrowBtn}>
            <Text style={styles.arrowText}>{'<'}</Text>
          </TouchableOpacity>
          <View style={styles.bannerCenter}>
            <Text style={styles.bannerTitle}>Thực Đơn Tuần {selectedWeek}</Text>
            <Text style={styles.bannerSubtitle}>{monthYear}</Text>
          </View>
          <TouchableOpacity onPress={handleNextWeek} style={styles.arrowBtn}>
            <Text style={styles.arrowText}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        {/* Days List */}
        <View style={styles.listContainer}>
          {weekDays.map((date, index) => {
            const dayName = getDayName(date.getDay());
            const dateStr = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
            const isoStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            
            return (
              <TouchableOpacity 
                key={index} 
                style={styles.dayItem}
                onPress={() => navigation.navigate('MealPlanDetail', { dateStr: isoStr, dayName })}
                activeOpacity={0.8}
              >
                <View style={styles.dayLeft}>
                  <Text style={styles.dayLabel}>{dayName}</Text>
                  <Text style={styles.dateLabel}>{dateStr}</Text>
                </View>
                <View style={styles.plusCircle}>
                  <PlusIcon />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
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
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#FF7482',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  arrowBtn: {
    padding: 10,
  },
  arrowText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  bannerCenter: {
    alignItems: 'center',
  },
  bannerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  listContainer: {
    gap: 12,
  },
  dayItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
    borderColor: '#FFF0F2',
  },
  dayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    width: 30,
  },
  dateLabel: {
    fontSize: 14,
    color: '#888',
  },
  plusCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFF0F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
