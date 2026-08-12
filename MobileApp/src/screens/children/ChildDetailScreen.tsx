import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Icon } from 'react-native-paper';
import { childService } from '../../services/childService';
import { Child } from '../../types/child';
import { useAppTheme } from '../../theme/useAppTheme';

export const ChildDetailScreen = ({ route, navigation }: any) => {
  const { colors, isDark } = useAppTheme();
  const { childId } = route.params || {};
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (childId) {
      loadChild();
    } else {
      setLoading(false);
    }
  }, [childId]);

  const loadChild = async () => {
    try {
      const data = await childService.getChildById(childId);
      if (data) setChild(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Child Profile', 'Are you sure you want to delete this child profile?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          await childService.deleteChild(childId);
          navigation.goBack();
        } 
      }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF5F70" />
      </View>
    );
  }

  if (!child) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFoundText}>Child profile not found</Text>
      </View>
    );
  }

  const isMale = String(child.gender).toLowerCase() === 'male' || String(child.gender) === 'Nam';

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity 
          style={[styles.backBtn, { backgroundColor: colors.surface }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Icon source="arrow-left" size={20} color="#FF5F70" />
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.avatarCircle}>
          <Icon source="baby-face-outline" size={36} color="#FF5F70" />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{child.name}</Text>

        <View style={styles.badgeRow}>
          <View style={[styles.badge, isMale ? styles.maleBadge : styles.femaleBadge]}>
            <Text style={[styles.badgeText, isMale ? styles.maleText : styles.femaleText]}>
              {isMale ? 'Boy' : 'Girl'}
            </Text>
          </View>
          <View style={styles.ageBadge}>
            <Text style={styles.ageBadgeText}>{child.age} yrs old</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { backgroundColor: isDark ? '#3A2E31' : '#FFF0EA', borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.textSoft }]}>Height</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{child.height} <Text style={styles.unit}>cm</Text></Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: isDark ? '#3A2E31' : '#FFF0EA', borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.textSoft }]}>Weight</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{child.weight} <Text style={styles.unit}>kg</Text></Text>
          </View>
        </View>

        {child.allergies && child.allergies.length > 0 && (
          <View style={[styles.allergyCard, { backgroundColor: isDark ? '#4A2A2A' : '#FEF2F2', borderColor: isDark ? '#8A4550' : '#FEE2E2' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Icon source="alert-circle-outline" size={18} color="#DC2626" />
              <Text style={styles.allergyTitle}>Allergy History</Text>
            </View>
            <Text style={[styles.allergyText, { color: colors.text }]}>{child.allergies.join(', ')}</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.primaryBtn, { backgroundColor: '#FF3B70', flexDirection: 'row', justifyContent: 'center', gap: 8 }]} 
          onPress={() => navigation.navigate('GrowthTracking', { childId: child.id })}
          activeOpacity={0.88}
        >
          <Icon source="chart-line" size={20} color="#FFFFFF" />
          <Text style={styles.primaryBtnText}>WHO Growth Chart</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.primaryBtn, { flexDirection: 'row', justifyContent: 'center', gap: 8 }]} 
          onPress={() => navigation.navigate('MealPlanList', { childId: child.id })}
          activeOpacity={0.88}
        >
          <Icon source="silverware-fork-knife" size={20} color="#FFFFFF" />
          <Text style={styles.primaryBtnText}>View Meal Plans</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.secondaryBtn, { flexDirection: 'row', justifyContent: 'center', gap: 8 }]} 
          onPress={() => navigation.navigate('AddEditChild', { childId: child.id })}
          activeOpacity={0.88}
        >
          <Icon source="pencil-outline" size={20} color="#FF5F70" />
          <Text style={styles.secondaryBtnText}>Edit Child Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.dangerBtn, { flexDirection: 'row', justifyContent: 'center', gap: 8 }]} 
          onPress={handleDelete}
          activeOpacity={0.88}
        >
          <Icon source="delete-outline" size={20} color="#DC2626" />
          <Text style={styles.dangerBtnText}>Delete Child Profile</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 18,
    backgroundColor: '#FFFDF9',
    flexGrow: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFDF9',
  },
  notFoundText: {
    fontSize: 16,
    color: '#8E7377',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#FFEFEA',
    elevation: 3,
    shadowColor: '#FF5F70',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF0F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarEmoji: {
    fontSize: 36,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    color: '#4B3034',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  maleBadge: {
    backgroundColor: '#E0F2FE',
  },
  femaleBadge: {
    backgroundColor: '#FFE4E6',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  maleText: {
    color: '#0284C7',
  },
  femaleText: {
    color: '#FF5F70',
  },
  ageBadge: {
    backgroundColor: '#FFF0F2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ageBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF5F70',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFF8F6',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E7377',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FF5F70',
  },
  unit: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E7377',
  },
  allergyCard: {
    marginTop: 16,
    width: '100%',
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  allergyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 4,
  },
  allergyText: {
    fontSize: 13,
    color: '#991B1B',
  },
  actions: {
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: '#FF5F70',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#FF5F70',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: '#FFF0F2',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },
  secondaryBtnText: {
    color: '#FF5F70',
    fontSize: 15,
    fontWeight: '700',
  },
  dangerBtn: {
    backgroundColor: '#FEF2F2',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  dangerBtnText: {
    color: '#DC2626',
    fontSize: 15,
    fontWeight: '700',
  },
  headerRow: {
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE4E6',
    shadowColor: '#FF5F70',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
