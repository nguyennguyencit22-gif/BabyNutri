import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import Icon from '../common/AppIcon';
import { useAppTheme } from '../../theme/useAppTheme';

type Props = {
  visible: boolean;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

// Matches the reference "Warning" confirmation pattern: a plain-language
// explanation of what gets deleted, an explicit "cannot be undone" notice,
// and a checkbox that must be ticked before Delete becomes pressable — a
// deliberate extra step for an irreversible action.
const DeleteAccountModal: React.FC<Props> = ({ visible, deleting, onCancel, onConfirm }) => {
  const { colors } = useAppTheme();
  const [confirmed, setConfirmed] = useState(false);

  const handleCancel = () => {
    setConfirmed(false);
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <Pressable style={styles.overlay} onPress={handleCancel}>
        <Pressable style={[styles.box, { backgroundColor: colors.surface }]}>
          <Text style={styles.warningTitle}>Warning</Text>
          <Text style={[styles.heading, { color: colors.text }]}>You are going to delete your account</Text>

          <Text style={[styles.body, { color: colors.textSoft }]}>
            This action will permanently delete your account and every piece of data tied to it in this app —
            your baby profiles, meal plans, favorites, ratings, comments, and chat history.
          </Text>

          <Text style={[styles.warningLine, { color: colors.text }]}>
            This cannot be undone. Please confirm with the checkbox below.
          </Text>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setConfirmed((v) => !v)}
            activeOpacity={0.8}
            disabled={deleting}
          >
            <Icon
              source={confirmed ? 'check-circle' : 'check-circle-outline'}
              size={22}
              color={confirmed ? '#DC2626' : colors.textSoft}
            />
            <Text style={[styles.checkboxLabel, { color: colors.text }]}>
              Delete my account and all related data
            </Text>
          </TouchableOpacity>

          <View style={styles.btnRow}>
            <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: colors.surfaceAlt }]} onPress={handleCancel} disabled={deleting}>
              <Text style={[styles.cancelText, { color: colors.textSoft }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.deleteBtn, !confirmed && styles.deleteBtnDisabled]}
              onPress={onConfirm}
              disabled={!confirmed || deleting}
            >
              <Text style={styles.deleteText}>{deleting ? 'Deleting...' : 'Delete'}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 22 },
  box: { borderRadius: 20, padding: 22 },
  warningTitle: { fontSize: 13, fontWeight: '800', color: '#DC2626', textAlign: 'center', marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' },
  heading: { fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 14, lineHeight: 24 },
  body: { fontSize: 13, lineHeight: 19, marginBottom: 14 },
  warningLine: { fontSize: 13, fontWeight: '700', lineHeight: 19, marginBottom: 16 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 22 },
  checkboxLabel: { flex: 1, fontSize: 14, fontWeight: '700' },
  btnRow: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  cancelText: { fontWeight: '700', fontSize: 14 },
  deleteBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center', backgroundColor: '#DC2626' },
  deleteBtnDisabled: { opacity: 0.4 },
  deleteText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});

export default DeleteAccountModal;
