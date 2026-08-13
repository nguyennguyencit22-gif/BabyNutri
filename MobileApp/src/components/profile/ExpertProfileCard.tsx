import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, Pressable, ScrollView } from 'react-native';
import Icon from '../common/AppIcon';
import { expertService, ExpertProfile } from '../../services/expert.service';
import { useAppTheme } from '../../theme/useAppTheme';
import { appAlert } from '../../utils/appAlert';

// Professional info card shown instead of the baby-profiles section for
// Expert/Admin accounts — real data from expert_profiles (specialization,
// years of experience, certificate, bio), editable in place. Deliberately
// doesn't include the reference design's phone/address/tax-number fields
// since this app has no data source for them.
const ExpertProfileCard: React.FC = () => {
  const { colors, isDark } = useAppTheme();
  const [profile, setProfile] = useState<ExpertProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [editVisible, setEditVisible] = useState(false);
  const [specialization, setSpecialization] = useState('');
  const [experienceYear, setExperienceYear] = useState('');
  const [certificate, setCertificate] = useState('');
  const [information, setInformation] = useState('');
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(() => {
    setLoading(true);
    expertService.getMyProfile()
      .then((p) => {
        setProfile(p);
        setSpecialization(p.specialization || '');
        setExperienceYear(p.experienceYear ? String(p.experienceYear) : '');
        setCertificate(p.certificate || '');
        setInformation(p.information || '');
      })
      .catch((e) => console.error('Load expert profile error:', e))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await expertService.updateMyProfile({
        specialization: specialization.trim(),
        experienceYear: experienceYear.trim() ? Number(experienceYear.trim()) : undefined,
        certificate: certificate.trim(),
        information: information.trim(),
      });
      setEditVisible(false);
      loadProfile();
      appAlert.show('Saved', 'Your professional profile has been updated.', undefined, 'success');
    } catch (e) {
      console.error('Update expert profile error:', e);
      appAlert.show('Error', 'Unable to save your profile right now.', undefined, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <View style={[styles.card, styles.loadingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <ActivityIndicator size="small" color="#FF7A59" />
      </View>
    );
  }

  const inputStyle = [styles.input, { backgroundColor: colors.surfaceAlt, color: colors.text }];

  return (
    <>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Professional Information</Text>
          {profile.isVerified && (
            <View style={[styles.verifiedBadge, { backgroundColor: isDark ? '#143823' : '#F0FDF4' }]}>
              <Icon source="check-circle-outline" size={13} color="#16A34A" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>

        {!!profile.information && (
          <Text style={[styles.bio, { color: colors.textSoft }]}>{profile.information}</Text>
        )}

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.textSoft }]}>Specialization</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{profile.specialization || 'Not set'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.textSoft }]}>Experience</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {profile.experienceYear ? `${profile.experienceYear} years` : 'Not set'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.textSoft }]}>Certificate</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{profile.certificate || 'Not set'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.textSoft }]}>Email</Text>
            <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>{profile.email}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.editBtn} onPress={() => setEditVisible(true)} activeOpacity={0.85}>
          <Icon source="pencil-outline" size={16} color="#FF7A59" />
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={editVisible} transparent animationType="fade" onRequestClose={() => setEditVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setEditVisible(false)}>
          <Pressable style={[styles.modalBox, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Professional Info</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalLabel, { color: colors.textSoft }]}>Specialization</Text>
              <TextInput style={inputStyle} value={specialization} onChangeText={setSpecialization} placeholder="e.g. Child Nutrition" placeholderTextColor={colors.textSoft} />

              <Text style={[styles.modalLabel, { color: colors.textSoft }]}>Years of Experience</Text>
              <TextInput style={inputStyle} value={experienceYear} onChangeText={setExperienceYear} keyboardType="numeric" placeholder="e.g. 8" placeholderTextColor={colors.textSoft} />

              <Text style={[styles.modalLabel, { color: colors.textSoft }]}>Certificate</Text>
              <TextInput style={inputStyle} value={certificate} onChangeText={setCertificate} placeholder="e.g. Certified Nutritionist" placeholderTextColor={colors.textSoft} />

              <Text style={[styles.modalLabel, { color: colors.textSoft }]}>Bio</Text>
              <TextInput
                style={[inputStyle, styles.modalBioInput]}
                value={information}
                onChangeText={setInformation}
                placeholder="Tell parents about your background..."
                placeholderTextColor={colors.textSoft}
                multiline
              />
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={[styles.modalCancelBtn, { backgroundColor: colors.surfaceAlt }]} onPress={() => setEditVisible(false)}>
                <Text style={[styles.modalCancelText, { color: colors.textSoft }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSave} disabled={saving}>
                <Text style={styles.modalSaveText}>{saving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 8,
  },
  loadingCard: { alignItems: 'center', paddingVertical: 30 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  cardTitle: { fontSize: 15, fontWeight: '800' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  verifiedText: { fontSize: 11, fontWeight: '700', color: '#16A34A' },
  bio: { fontSize: 13, lineHeight: 19, marginBottom: 12 },
  divider: { height: 1, marginBottom: 14 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 16 },
  infoItem: { width: '45%' },
  infoLabel: { fontSize: 11, fontWeight: '600', marginBottom: 3 },
  infoValue: { fontSize: 14, fontWeight: '700' },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFF0ED',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE2DB',
  },
  editBtnText: { color: '#FF7A59', fontWeight: '700', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 22 },
  modalBox: { borderRadius: 20, padding: 20, maxHeight: '85%' },
  modalTitle: { fontSize: 17, fontWeight: '800', marginBottom: 14 },
  modalLabel: { fontSize: 12, fontWeight: '700', marginBottom: 6, marginTop: 10 },
  input: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
  modalBioInput: { minHeight: 80, textAlignVertical: 'top' },
  modalBtnRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  modalCancelBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  modalCancelText: { fontWeight: '700', fontSize: 14 },
  modalSaveBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center', backgroundColor: '#FF5F70' },
  modalSaveText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});

export default ExpertProfileCard;
