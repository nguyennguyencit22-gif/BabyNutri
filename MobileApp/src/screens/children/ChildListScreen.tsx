import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/common/AppIcon';
import { childService } from '../../services/childService';
import { Child } from '../../types/child';
import { useAppTheme } from '../../theme/useAppTheme';

export const ChildListScreen = ({ navigation }: any) => {
  const { colors, isDark } = useAppTheme();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    setLoading(true);
    try {
      const data = await childService.getChildren();
      setChildren(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPress = () => {
    navigation.navigate('AddEditChild');
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#FF5F70" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <View style={[styles.headerBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon source="arrow-left" size={20} color="#FF6B4A" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Child Profiles</Text>
        <View style={{ width: 36 }} />
      </View>
      <FlatList
        data={children}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]} 
            onPress={() => navigation.navigate('ChildDetail', { childId: item.id })}
            activeOpacity={0.88}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Icon source="baby-face-outline" size={20} color="#FF5F70" />
              <Text style={[styles.childName, { color: colors.text }]}>{item.name}</Text>
            </View>
            <Text style={[styles.childDetails, { color: colors.textSoft }]}>{item.age} yrs old · {String(item.gender) === 'Male' || String(item.gender) === 'Nam' ? 'Boy' : 'Girl'}</Text>
            <Text style={[styles.childStats, { color: colors.textSoft }]}>Height: {item.height}cm · Weight: {item.weight}kg</Text>

            <TouchableOpacity 
              style={[styles.growthChartBtn, { flexDirection: 'row', justifyContent: 'center', gap: 6, backgroundColor: isDark ? '#3A2E31' : '#FFF0F2', borderColor: isDark ? '#5A3D42' : '#FFE4E6' }]}
              onPress={() => navigation.navigate('GrowthTracking', { childId: item.id })}
              activeOpacity={0.8}
            >
              <Icon source="chart-line" size={16} color="#FF3B70" />
              <Text style={styles.growthChartBtnText}>WHO Growth Chart</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.text }]}>No child profiles added yet.</Text>
            <Text style={[styles.emptySubText, { color: colors.textSoft }]}>Tap (+) button below to create a new profile!</Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />
      <TouchableOpacity style={styles.fab} onPress={handleAddPress} activeOpacity={0.9}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700' },
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
  childName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#4B3034',
    marginBottom: 4,
  },
  childDetails: {
    fontSize: 13,
    color: '#FF5F70',
    fontWeight: '600',
    marginBottom: 4,
  },
  childStats: {
    fontSize: 12,
    color: '#8E7377',
    marginBottom: 8,
  },
  growthChartBtn: {
    backgroundColor: '#FFF0F2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE4E6',
    marginTop: 4,
  },
  growthChartBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF3B70',
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    backgroundColor: '#FF5F70',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#FF5F70',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 30,
  },
});
