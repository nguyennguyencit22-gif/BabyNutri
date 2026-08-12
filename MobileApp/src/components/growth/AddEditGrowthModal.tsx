import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    ScrollView,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { GrowthRecord, GrowthRecordInput } from '../../services/growth.service';
import { useAppTheme } from '../../theme/useAppTheme';

interface AddEditGrowthModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (input: GrowthRecordInput) => Promise<void>;
    initialData?: GrowthRecord | null;
    loading?: boolean;
}

export const AddEditGrowthModal: React.FC<AddEditGrowthModalProps> = ({
    visible,
    onClose,
    onSave,
    initialData,
    loading = false,
}) => {
    const today = new Date().toISOString().slice(0, 10);
    const [recordDate, setRecordDate] = useState(today);
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [headCircumference, setHeadCircumference] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setRecordDate(initialData.recordDate || today);
            setWeight(String(initialData.weight || ''));
            setHeight(String(initialData.height || ''));
            setHeadCircumference(initialData.headCircumference ? String(initialData.headCircumference) : '');
            setNotes(initialData.notes || '');
        } else {
            setRecordDate(today);
            setWeight('');
            setHeight('');
            setHeadCircumference('');
            setNotes('');
        }
    }, [initialData, visible]);

    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    const liveBmi =
        !isNaN(weightNum) && !isNaN(heightNum) && heightNum > 0
            ? Number((weightNum / ((heightNum / 100) * (heightNum / 100))).toFixed(1))
            : null;

    const handleSubmit = async () => {
        if (!recordDate.trim()) {
            Alert.alert('Missing Information', 'Please select a measurement date.');
            return;
        }

        if (isNaN(weightNum) || weightNum <= 0 || weightNum > 50) {
            Alert.alert('Invalid Input', 'Please enter a valid weight (0.5 - 50 kg).');
            return;
        }

        if (isNaN(heightNum) || heightNum <= 0 || heightNum > 150) {
            Alert.alert('Invalid Input', 'Please enter a valid height (30 - 150 cm).');
            return;
        }

        try {
            setSubmitting(true);
            await onSave({
                recordDate: recordDate.trim(),
                weight: weightNum,
                height: heightNum,
                headCircumference: headCircumference ? parseFloat(headCircumference) : null,
                notes: notes.trim() || null,
            });
            onClose();
        } catch (err) {
            Alert.alert('Error', 'Could not save growth record. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const { colors, isDark } = useAppTheme();
    const inputBg = isDark ? '#3A2E31' : '#F8FAFC';
    const inputTextColor = colors.text;

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={[styles.sheetContainer, { backgroundColor: colors.surface }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                        <View style={styles.headerTitleRow}>
                            <Icon
                                source={initialData ? 'pencil-outline' : 'plus'}
                                size={22}
                                color="#FF3B70"
                            />
                            <Text style={[styles.modalTitle, { color: colors.text }]}>
                                {initialData ? 'Edit Growth Record' : 'Add Growth Record'}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose} disabled={submitting}>
                            <Icon source="close" size={20} color={colors.textSoft} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} style={styles.formScroll}>
                        {/* Record Date */}
                        <View style={styles.labelRow}>
                            <Icon source="calendar-month-outline" size={16} color={colors.textSoft} />
                            <Text style={[styles.label, { color: colors.textSoft }]}>Measurement Date (YYYY-MM-DD)</Text>
                        </View>
                        <View style={styles.dateRow}>
                            <TextInput
                                style={[styles.input, { flex: 1, backgroundColor: inputBg, color: inputTextColor, borderColor: colors.border }]}
                                value={recordDate}
                                onChangeText={setRecordDate}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={colors.textSoft}
                            />
                            <TouchableOpacity
                                style={styles.todayBtn}
                                onPress={() => setRecordDate(today)}
                            >
                                <Text style={styles.todayBtnText}>Today</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Weight & Height */}
                        <View style={styles.twoColRow}>
                            <View style={styles.col}>
                                <View style={styles.labelRow}>
                                    <Icon source="scale-bathroom" size={16} color={colors.textSoft} />
                                    <Text style={[styles.label, { color: colors.textSoft }]}>Weight (kg) *</Text>
                                </View>
                                <TextInput
                                    style={[styles.input, { backgroundColor: inputBg, color: inputTextColor, borderColor: colors.border }]}
                                    value={weight}
                                    onChangeText={setWeight}
                                    placeholder="e.g. 8.5"
                                    placeholderTextColor={colors.textSoft}
                                    keyboardType="decimal-pad"
                                />
                            </View>
                            <View style={styles.col}>
                                <View style={styles.labelRow}>
                                    <Icon source="ruler" size={16} color={colors.textSoft} />
                                    <Text style={[styles.label, { color: colors.textSoft }]}>Height (cm) *</Text>
                                </View>
                                <TextInput
                                    style={[styles.input, { backgroundColor: inputBg, color: inputTextColor, borderColor: colors.border }]}
                                    value={height}
                                    onChangeText={setHeight}
                                    placeholder="e.g. 72.0"
                                    placeholderTextColor={colors.textSoft}
                                    keyboardType="decimal-pad"
                                />
                            </View>
                        </View>

                        {/* Head Circumference */}
                        <View style={styles.labelRow}>
                            <Icon source="head-outline" size={16} color={colors.textSoft} />
                            <Text style={[styles.label, { color: colors.textSoft }]}>Head Circumference (cm) - Optional</Text>
                        </View>
                        <TextInput
                            style={[styles.input, { backgroundColor: inputBg, color: inputTextColor, borderColor: colors.border }]}
                            value={headCircumference}
                            onChangeText={setHeadCircumference}
                            placeholder="e.g. 44.0"
                            placeholderTextColor={colors.textSoft}
                            keyboardType="decimal-pad"
                        />

                        {/* Live BMI Preview Card */}
                        {liveBmi !== null && (
                            <View style={styles.bmiPreviewCard}>
                                <View style={styles.labelRow}>
                                    <Icon source="calculator" size={18} color="#FF3B70" />
                                    <Text style={styles.bmiPreviewTitle}>Estimated BMI:</Text>
                                </View>
                                <Text style={styles.bmiPreviewVal}>{liveBmi} kg/m²</Text>
                            </View>
                        )}

                        {/* Notes */}
                        <View style={styles.labelRow}>
                            <Icon source="notebook-outline" size={16} color={colors.textSoft} />
                            <Text style={[styles.label, { color: colors.textSoft }]}>Notes</Text>
                        </View>
                        <TextInput
                            style={[styles.input, styles.textArea, { backgroundColor: inputBg, color: inputTextColor, borderColor: colors.border }]}
                            value={notes}
                            onChangeText={setNotes}
                            placeholder="Enter notes (e.g. measured in the morning, healthy...)"
                            placeholderTextColor={colors.textSoft}
                            multiline
                            numberOfLines={3}
                        />

                        {/* Action Buttons */}
                        <View style={styles.btnRow}>
                            <TouchableOpacity
                                style={[styles.cancelBtn, { backgroundColor: isDark ? '#3A2E31' : '#F1F5F9' }]}
                                onPress={onClose}
                                disabled={submitting}
                            >
                                <Text style={[styles.cancelBtnText, { color: colors.textSoft }]}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.saveBtn}
                                onPress={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                    <Text style={styles.saveBtnText}>Save Record</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        justifyContent: 'flex-end',
    },
    sheetContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1E293B',
    },
    formScroll: {
        marginBottom: 10,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 10,
        marginBottom: 6,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        color: '#475569',
    },
    input: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 14,
        color: '#0F172A',
    },
    dateRow: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    todayBtn: {
        backgroundColor: '#FFF0F2',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FFE4E6',
    },
    todayBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FF3B70',
    },
    twoColRow: {
        flexDirection: 'row',
        gap: 12,
    },
    col: {
        flex: 1,
    },
    textArea: {
        height: 70,
        textAlignVertical: 'top',
    },
    bmiPreviewCard: {
        backgroundColor: '#FFF0F2',
        borderRadius: 12,
        padding: 12,
        marginTop: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFE4E6',
    },
    bmiPreviewTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FF3B70',
    },
    bmiPreviewVal: {
        fontSize: 15,
        fontWeight: '800',
        color: '#FF3B70',
    },
    btnRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
        marginBottom: 10,
    },
    cancelBtn: {
        flex: 1,
        backgroundColor: '#F1F5F9',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    cancelBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748B',
    },
    saveBtn: {
        flex: 1.5,
        backgroundColor: '#FF3B70',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        shadowColor: '#FF3B70',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 3,
    },
    saveBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
