import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/common/AppIcon';
import TopHeaderBar from '../../components/common/TopHeaderBar';
import { fetchAdminReports, AdminReports } from '../../services/admin.service';
import { useAppTheme } from '../../theme/useAppTheme';
import AdminManageExpertsModal from './AdminManageExpertsModal';
import AdminReportsModal from './AdminReportsModal';

export const AdminHomeScreen = () => {
  const { colors, isDark } = useAppTheme();

  const [reports, setReports] = useState<AdminReports | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [showManageExperts, setShowManageExperts] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await fetchAdminReports();
      setReports(data);
    } catch (e) {
      console.error('Failed to load admin stats:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [loadData])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['left', 'right', 'bottom']}
    >
      <TopHeaderBar />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#8B5CF6']}
            tintColor="#8B5CF6"
          />
        }
      >
        {/* Admin Header Card */}
        <View
          style={[
            styles.headerCard,
            {
              backgroundColor: isDark ? '#2D2235' : '#F5F3FF',
              borderColor: isDark ? '#4C3366' : '#DDD6FE',
            },
          ]}
        >
          <View style={styles.headerIconRow}>
            <View style={styles.shieldIconBadge}>
              <Icon source="shield-account" size={24} color="#8B5CF6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.headerCardTitle, { color: colors.text }]}>
                User Management Portal
              </Text>
              <Text style={[styles.headerCardSub, { color: colors.textSoft }]}>
                System Administration & Governance
              </Text>
            </View>
          </View>
          <Text style={[styles.headerCardDesc, { color: colors.text }]}>
            Manage verified nutrition experts, assign caregiver roles, and supervise user accounts across the platform.
          </Text>
        </View>

        {/* User Management Quick Actions */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Administration Actions
        </Text>

        <TouchableOpacity
          style={[
            styles.actionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setShowManageExperts(true)}
          activeOpacity={0.85}
        >
          <View style={[styles.actionIconBadge, { backgroundColor: '#EDE9FE' }]}>
            <Icon source="account-cog" size={24} color="#8B5CF6" />
          </View>
          <View style={styles.actionTextCol}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>
              Manage Nutrition Experts
            </Text>
            <Text style={[styles.actionDesc, { color: colors.textSoft }]}>
              Review verified experts, promote members, or adjust expert permissions.
            </Text>
          </View>
          <Icon source="chevron-right" size={20} color={colors.textSoft} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setShowReportsModal(true)}
          activeOpacity={0.85}
        >
          <View style={[styles.actionIconBadge, { backgroundColor: '#E0F2FE' }]}>
            <Icon source="chart-bar" size={24} color="#0284C7" />
          </View>
          <View style={styles.actionTextCol}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>
              System Reports & Analytics
            </Text>
            <Text style={[styles.actionDesc, { color: colors.textSoft }]}>
              View comprehensive statistics on platform users, parents, and community activity.
            </Text>
          </View>
          <Icon source="chevron-right" size={20} color={colors.textSoft} />
        </TouchableOpacity>

        {/* Live User Metrics Overview */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 22 }]}>
          User Statistics Overview
        </Text>

        {loading && !reports ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#8B5CF6" />
          </View>
        ) : (
          <View style={styles.statsGrid}>
            <View
              style={[
                styles.statBox,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Icon source="account-group" size={20} color="#8B5CF6" />
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {reports?.totalUsers ?? 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSoft }]}>
                Total Registered Users
              </Text>
            </View>

            <View
              style={[
                styles.statBox,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Icon source="account-heart" size={20} color="#EC4899" />
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {reports?.totalParents ?? 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSoft }]}>
                Active Parents
              </Text>
            </View>

            <View
              style={[
                styles.statBox,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Icon source="doctor" size={20} color="#10B981" />
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {reports?.totalExperts ?? 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSoft }]}>
                Verified Experts
              </Text>
            </View>

            <View
              style={[
                styles.statBox,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Icon source="account-star" size={20} color="#F59E0B" />
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {reports?.totalFollowers ?? 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSoft }]}>
                Follower Connections
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <AdminManageExpertsModal
        visible={showManageExperts}
        onClose={() => {
          setShowManageExperts(false);
          loadData();
        }}
      />
      <AdminReportsModal
        visible={showReportsModal}
        onClose={() => setShowReportsModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 18,
    paddingBottom: 100,
  },
  headerCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  headerIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  shieldIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCardTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  headerCardSub: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  headerCardDesc: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    gap: 12,
  },
  actionIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextCol: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
  },
  actionDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  loadingBox: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statBox: {
    flexBasis: '48%',
    flexGrow: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default AdminHomeScreen;
