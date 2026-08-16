import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import Icon from '../../components/common/AppIcon';
import { useAppTheme } from '../../theme/useAppTheme';
import { fetchAdminReports, AdminReports } from '../../services/admin.service';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export const AdminReportsModal: React.FC<Props> = ({ visible, onClose }) => {
  const { colors, isDark } = useAppTheme();
  const [reports, setReports] = useState<AdminReports | null>(null);
  const [loading, setLoading] = useState(false);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminReports();
      setReports(data);
    } catch (e) {
      console.error('Fetch reports error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadReports();
    }
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>System Reports & Statistics</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Icon source="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {loading || !reports ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#8B5CF6" />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={[styles.sectionHeading, { color: colors.text }]}>User & Community Overview</Text>

            <View style={styles.grid}>
              <View style={[styles.card, { backgroundColor: isDark ? '#2E2836' : '#F3E8FF' }]}>
                <Icon source="account-group-outline" size={24} color="#8B5CF6" />
                <Text style={styles.num}>{reports.totalUsers}</Text>
                <Text style={styles.label}>Total Users</Text>
              </View>

              <View style={[styles.card, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF' }]}>
                <Icon source="account-outline" size={24} color="#3B82F6" />
                <Text style={styles.num}>{reports.totalParents}</Text>
                <Text style={styles.label}>Parents</Text>
              </View>

              <View style={[styles.card, { backgroundColor: isDark ? '#3A2E31' : '#FFF0F2' }]}>
                <Icon source="account-plus-outline" size={24} color="#FF5F70" />
                <Text style={styles.num}>{reports.totalExperts}</Text>
                <Text style={styles.label}>Experts</Text>
              </View>

              <View style={[styles.card, { backgroundColor: isDark ? '#2B3830' : '#ECFDF5' }]}>
                <Icon source="heart" size={24} color="#10B981" />
                <Text style={styles.num}>{reports.totalFollowers}</Text>
                <Text style={styles.label}>Expert Follows</Text>
              </View>
            </View>

            <Text style={[styles.sectionHeading, { color: colors.text, marginTop: 24 }]}>
              Content & Q&A Statistics
            </Text>

            <View style={styles.grid}>
              <View style={[styles.card, { backgroundColor: isDark ? '#3A2E31' : '#FFF0F2' }]}>
                <Icon source="bowl-mix-outline" size={24} color="#FF5F70" />
                <Text style={styles.num}>{reports.totalRecipes}</Text>
                <Text style={styles.label}>Recipes Published</Text>
              </View>

              <View style={[styles.card, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF' }]}>
                <Icon source="newspaper-plus" size={24} color="#3B82F6" />
                <Text style={styles.num}>{reports.totalArticles}</Text>
                <Text style={styles.label}>Articles Published</Text>
              </View>

              <View style={[styles.card, { backgroundColor: isDark ? '#372E1B' : '#FEF3C7' }]}>
                <Icon source="help-circle-outline" size={24} color="#F59E0B" />
                <Text style={styles.num}>{reports.totalQuestions}</Text>
                <Text style={styles.label}>Questions Asked</Text>
              </View>

              <View style={[styles.card, { backgroundColor: isDark ? '#2B3830' : '#ECFDF5' }]}>
                <Icon source="check-circle-outline" size={24} color="#10B981" />
                <Text style={styles.num}>{reports.totalAnswered}</Text>
                <Text style={styles.label}>Questions Answered</Text>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  closeBtn: { padding: 4 },
  content: { padding: 18, paddingBottom: 60 },
  sectionHeading: { fontSize: 16, fontWeight: '800', marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  num: { fontSize: 24, fontWeight: '800', marginTop: 8, marginBottom: 2 },
  label: { fontSize: 12, fontWeight: '600', color: '#4B3034', textAlign: 'center' },
});

export default AdminReportsModal;
