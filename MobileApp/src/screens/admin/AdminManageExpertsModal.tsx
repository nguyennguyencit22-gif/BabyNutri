import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import Icon from '../../components/common/AppIcon';
import { useAppTheme } from '../../theme/useAppTheme';
import {
  fetchAdminExperts,
  createAdminExpert,
  demoteAdminExpert,
  AdminExpertItem
} from '../../services/admin.service';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export const AdminManageExpertsModal: React.FC<Props> = ({ visible, onClose }) => {
  const { colors } = useAppTheme();

  const [experts, setExperts] = useState<AdminExpertItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [specialization, setSpecialization] = useState('Child Nutrition');
  const [certificate, setCertificate] = useState('Certified Nutritionist');
  const [experienceYear, setExperienceYear] = useState('5');
  const [information, setInformation] = useState('Pediatric Nutrition Specialist');

  const loadExperts = async () => {
    setLoading(true);
    try {
      const list = await fetchAdminExperts();
      setExperts(list);
    } catch (err: any) {
      console.error('Fetch experts error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadExperts();
      setShowAddForm(false);
      resetForm();
    }
  }, [visible]);

  const resetForm = () => {
    setEmail('');
    setFullName('');
    setSpecialization('Child Nutrition');
    setCertificate('Certified Nutritionist');
    setExperienceYear('5');
    setInformation('Pediatric Nutrition Specialist');
  };

  const handleCreateExpert = async () => {
    if (!email.trim() || !fullName.trim()) {
      Alert.alert('Validation', 'Please enter both Email and Full Name.');
      return;
    }

    setSubmitting(true);
    try {
      await createAdminExpert({
        email: email.trim(),
        fullName: fullName.trim(),
        specialization: specialization.trim(),
        certificate: certificate.trim(),
        experienceYear: Number(experienceYear) || 5,
        information: information.trim(),
      });
      Alert.alert('Success', `Expert account for ${fullName} created/updated!`);
      resetForm();
      setShowAddForm(false);
      loadExperts();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create expert');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoteExpert = (expert: AdminExpertItem) => {
    Alert.alert(
      'Demote Expert',
      `Are you sure you want to demote ${expert.fullName} back to Parent role?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Demote',
          style: 'destructive',
          onPress: async () => {
            try {
              await demoteAdminExpert(expert.id);
              loadExperts();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to demote expert');
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Admin Expert Management</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Icon source="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Top Actions */}
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: '#FF5F70' }]}
            onPress={() => setShowAddForm(!showAddForm)}
            activeOpacity={0.85}
          >
            <Icon source={showAddForm ? 'close' : 'plus'} size={20} color="#FFF" />
            <Text style={styles.primaryBtnText}>
              {showAddForm ? 'Cancel Add Form' : 'Add / Promote Expert Account'}
            </Text>
          </TouchableOpacity>

          {/* Form */}
          {showAddForm && (
            <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.formTitle, { color: colors.text }]}>Create / Assign Expert Role</Text>

              <Text style={[styles.label, { color: colors.textSoft }]}>Email Address *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g. expert@babynutri.com"
                placeholderTextColor={colors.textSoft}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={[styles.label, { color: colors.textSoft }]}>Full Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g. Dr. Jane Smith"
                placeholderTextColor={colors.textSoft}
                value={fullName}
                onChangeText={setFullName}
              />

              <Text style={[styles.label, { color: colors.textSoft }]}>Specialization</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g. Child Nutrition / Pediatrician"
                placeholderTextColor={colors.textSoft}
                value={specialization}
                onChangeText={setSpecialization}
              />

              <Text style={[styles.label, { color: colors.textSoft }]}>Certificate</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g. Certified Nutritionist"
                placeholderTextColor={colors.textSoft}
                value={certificate}
                onChangeText={setCertificate}
              />

              <Text style={[styles.label, { color: colors.textSoft }]}>Years of Experience</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g. 5"
                placeholderTextColor={colors.textSoft}
                value={experienceYear}
                onChangeText={setExperienceYear}
                keyboardType="number-pad"
              />

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: '#FF5F70' }]}
                onPress={handleCreateExpert}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Save Expert Account</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Expert List */}
          <Text style={[styles.sectionHeading, { color: colors.text }]}>
            Current Expert Accounts ({experts.length})
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color="#FF5F70" style={{ marginTop: 20 }} />
          ) : experts.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSoft }]}>No expert accounts found.</Text>
          ) : (
            experts.map((item) => (
              <View
                key={item.id}
                style={[styles.expertItemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={styles.expertRow}>
                  <View style={[styles.avatarCircle, { backgroundColor: '#FF5F70' }]}>
                    <Text style={styles.avatarText}>
                      {(item.fullName || item.email).charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.expertInfo}>
                    <Text style={[styles.expertName, { color: colors.text }]}>{item.fullName}</Text>
                    <Text style={[styles.expertEmail, { color: colors.textSoft }]}>{item.email}</Text>
                    <Text style={[styles.expertMeta, { color: '#FF5F70' }]}>
                      {item.specialization || 'Nutrition Expert'} • {item.experienceYear || 0} yrs exp
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.demoteBtn}
                    onPress={() => handleDemoteExpert(item)}
                  >
                    <Icon source="trash-can-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: { flex: 1, paddingTop: 50 },
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
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 16,
  },
  primaryBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  formCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  formTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 4, marginTop: 8 },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  submitBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
  },
  submitBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  sectionHeading: { fontSize: 16, fontWeight: '800', marginVertical: 12 },
  emptyText: { textAlign: 'center', marginVertical: 20, fontSize: 14 },
  expertItemCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  expertRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontWeight: '800', fontSize: 18 },
  expertInfo: { flex: 1 },
  expertName: { fontSize: 15, fontWeight: '700' },
  expertEmail: { fontSize: 12, marginTop: 1 },
  expertMeta: { fontSize: 12, fontWeight: '600', marginTop: 3 },
  demoteBtn: { padding: 8 },
});

export default AdminManageExpertsModal;
