import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/common/AppIcon';

import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';

import {
    fetchGrowthData,
    addGrowthRecord,
    updateGrowthRecord,
    deleteGrowthRecord,
    GrowthDataResponse,
    GrowthRecord,
    GrowthRecordInput,
} from '../../services/growth.service';
import { WHOChart } from '../../components/growth/WHOChart';
import { AddEditGrowthModal } from '../../components/growth/AddEditGrowthModal';
import { BabyGrowthReportModal } from './BabyGrowthReportModal';
import { useAppTheme } from '../../theme/useAppTheme';

export const GrowthTrackingScreen = ({ route, navigation }: any) => {
    const { colors, isDark } = useAppTheme();
    const reduxSelectedBabyId = useSelector(
        (state: RootState) => state.baby.selectedBabyId,
    );
    const babies = useSelector(
        (state: RootState) => state.baby.babies,
    );
    const activeChildId = route.params?.childId || reduxSelectedBabyId || (babies[0] ? babies[0].id : 1);

    const [data, setData] = useState<GrowthDataResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeMetric, setActiveMetric] = useState<'weight' | 'height' | 'bmi'>('weight');

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState<GrowthRecord | null>(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetchGrowthData(Number(activeChildId));
            setData(res);
        } catch (err) {
            console.error('fetchGrowthData error:', err);
            Alert.alert('Error', 'Could not load growth data for baby.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [activeChildId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const handleOpenAddModal = () => {
        setEditingRecord(null);
        setModalVisible(true);
    };

    const handleOpenEditModal = (record: GrowthRecord) => {
        setEditingRecord(record);
        setModalVisible(true);
    };

    const handleSaveRecord = async (input: GrowthRecordInput) => {
        if (editingRecord) {
            await updateGrowthRecord(Number(activeChildId), editingRecord.id, input);
        } else {
            await addGrowthRecord(Number(activeChildId), input);
        }
        loadData();
    };

    const handleDeleteRecord = (recordId: number) => {
        Alert.alert(
            'Delete Record',
            'Are you sure you want to delete this growth measurement record?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteGrowthRecord(Number(activeChildId), recordId);
                            loadData();
                        } catch (err) {
                            Alert.alert('Error', 'Could not delete growth record.');
                        }
                    },
                },
            ]
        );
    };

    if (loading && !refreshing) {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#FF3B70" />
                <Text style={styles.loadingText}>Loading growth chart...</Text>
            </SafeAreaView>
        );
    }

    const child = data?.child;
    const records = data?.records || [];
    const whoPoints = data?.whoStandards
        ? data.whoStandards[activeMetric] || []
        : [];

    const getStatusStyle = (status?: string) => {
        const s = String(status || '').toLowerCase();
        if (s.includes('underweight')) {
            return { bg: '#FEF3C7', text: '#D97706', label: 'Underweight' };
        }
        if (s.includes('overweight')) {
            return { bg: '#FEE2E2', text: '#DC2626', label: 'Overweight' };
        }
        return { bg: '#DCFCE7', text: '#166534', label: 'Healthy Growth' };
    };

    const statusInfo = getStatusStyle(child?.growthStatus);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Navigation Header */}
            <View style={styles.navHeader}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Icon source="arrow-left" size={20} color="#FF3B70" />
                </TouchableOpacity>
                <Text style={[styles.navTitle, { color: colors.text }]}>WHO Growth Chart</Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TouchableOpacity
                        style={[styles.addNavBtn, { backgroundColor: '#8B5CF6' }]}
                        onPress={() => setReportModalVisible(true)}
                    >
                        <Icon source="file-document-outline" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addNavBtn} onPress={handleOpenAddModal}>
                        <Icon source="plus" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF3B70']} />
                }
            >
                {/* Child Summary Header Card */}
                {child && (
                    <View style={[styles.childCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={styles.childHeaderRow}>
                            <View style={styles.avatarCircle}>
                                <Icon source="baby-face-outline" size={28} color="#FF3B70" />
                            </View>
                            <View style={styles.childInfoText}>
                                <Text style={[styles.childName, { color: colors.text }]}>{child.name}</Text>
                                <Text style={[styles.childAge, { color: colors.textSoft }]}>
                                    {child.currentAgeMonths} months old · {String(child.gender).toLowerCase().includes('boy') || String(child.gender).toLowerCase().includes('nam') ? 'Boy' : 'Girl'}
                                </Text>
                            </View>
                        </View>

                        {/* Status Banner */}
                        <View style={[styles.statusPillBanner, { backgroundColor: statusInfo.bg }]}>
                            <Text style={[styles.statusPillText, { color: statusInfo.text }]}>
                                {statusInfo.label}
                            </Text>
                        </View>

                        {/* Key Stats Row */}
                        <View style={styles.statsRow}>
                            <View style={styles.statCol}>
                                <Text style={[styles.statSubLabel, { color: colors.textSoft }]}>Weight</Text>
                                <Text style={[styles.statVal, { color: colors.text }]}>
                                    {child.currentWeight || '--'} <Text style={styles.unitText}>kg</Text>
                                </Text>
                            </View>
                            <View style={[styles.divider, { backgroundColor: colors.border }]} />
                            <View style={styles.statCol}>
                                <Text style={[styles.statSubLabel, { color: colors.textSoft }]}>Height</Text>
                                <Text style={[styles.statVal, { color: colors.text }]}>
                                    {child.currentHeight || '--'} <Text style={styles.unitText}>cm</Text>
                                </Text>
                            </View>
                            <View style={[styles.divider, { backgroundColor: colors.border }]} />
                            <View style={styles.statCol}>
                                <Text style={[styles.statSubLabel, { color: colors.textSoft }]}>BMI Index</Text>
                                <Text style={[styles.statVal, { color: colors.text }]}>
                                    {child.currentBMI || '--'} <Text style={styles.unitText}>kg/m²</Text>
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Metric Selector Tabs */}
                <View style={styles.metricTabRow}>
                    <TouchableOpacity
                        style={[styles.metricTab, activeMetric === 'weight' && styles.metricTabActive]}
                        onPress={() => setActiveMetric('weight')}
                    >
                        <Icon source="scale-bathroom" size={16} color={activeMetric === 'weight' ? '#FFFFFF' : '#64748B'} />
                        <Text style={[styles.metricTabText, activeMetric === 'weight' && styles.metricTabTextActive]}>
                            Weight
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.metricTab, activeMetric === 'height' && styles.metricTabActive]}
                        onPress={() => setActiveMetric('height')}
                    >
                        <Icon source="ruler" size={16} color={activeMetric === 'height' ? '#FFFFFF' : '#64748B'} />
                        <Text style={[styles.metricTabText, activeMetric === 'height' && styles.metricTabTextActive]}>
                            Height
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.metricTab, activeMetric === 'bmi' && styles.metricTabActive]}
                        onPress={() => setActiveMetric('bmi')}
                    >
                        <Icon source="calculator" size={16} color={activeMetric === 'bmi' ? '#FFFFFF' : '#64748B'} />
                        <Text style={[styles.metricTabText, activeMetric === 'bmi' && styles.metricTabTextActive]}>
                            BMI
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Interactive WHO Chart */}
                <WHOChart
                    records={records}
                    whoPoints={whoPoints}
                    metric={activeMetric}
                    unit={activeMetric === 'weight' ? 'kg' : activeMetric === 'height' ? 'cm' : 'kg/m²'}
                />

                {/* Measurement History Section */}
                <View style={styles.historySection}>
                    <View style={styles.historyHeader}>
                        <View style={styles.historyTitleRow}>
                            <Icon source="format-list-bulleted" size={20} color={colors.text} />
                            <Text style={[styles.historyTitle, { color: colors.text }]}>Measurement History ({records.length})</Text>
                        </View>
                        <TouchableOpacity style={styles.addRecordBtn} onPress={handleOpenAddModal}>
                            <Text style={styles.addRecordBtnText}>+ Add Record</Text>
                        </TouchableOpacity>
                    </View>

                    {records.length === 0 ? (
                        <View style={[styles.emptyHistoryBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Text style={[styles.emptyHistoryText, { color: colors.textSoft }]}>No growth measurement records added yet. Tap "+ Add Record" to start tracking!</Text>
                        </View>
                    ) : (
                        records.slice().reverse().map(rec => (
                            <View key={rec.id} style={[styles.historyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <View style={styles.historyMainRow}>
                                    <View>
                                        <View style={styles.dateIconRow}>
                                            <Icon source="calendar-month-outline" size={16} color={colors.text} />
                                            <Text style={[styles.historyDate, { color: colors.text }]}>{rec.recordDate}</Text>
                                        </View>
                                        <Text style={[styles.historyAge, { color: colors.textSoft }]}>{rec.ageMonths} months old</Text>
                                    </View>
                                    <View style={styles.historyBadgeRow}>
                                        <Text style={[styles.historyMetricVal, { color: colors.text }]}>Weight: {rec.weight} kg</Text>
                                        <Text style={[styles.historyMetricVal, { color: colors.text }]}>Height: {rec.height} cm</Text>
                                        <Text style={[styles.historyMetricVal, { color: colors.text }]}>BMI: {rec.bmi}</Text>
                                    </View>
                                </View>

                                {rec.notes ? (
                                    <Text style={styles.historyNotes}>Note: {rec.notes}</Text>
                                ) : null}

                                <View style={styles.historyActionsRow}>
                                    <TouchableOpacity
                                        style={styles.actionBtnEdit}
                                        onPress={() => handleOpenEditModal(rec)}
                                    >
                                        <Icon source="pencil-outline" size={16} color="#2563EB" />
                                        <Text style={styles.actionTextEdit}>Edit</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.actionBtnDelete}
                                        onPress={() => handleDeleteRecord(rec.id)}
                                    >
                                        <Icon source="delete-outline" size={16} color="#DC2626" />
                                        <Text style={styles.actionTextDelete}>Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Add / Edit Growth Record Modal */}
            <AddEditGrowthModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleSaveRecord}
                initialData={editingRecord}
            />

            <BabyGrowthReportModal
                visible={reportModalVisible}
                onClose={() => setReportModalVisible(false)}
                baby={child}
                growthLogs={records}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFDF9',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFDF9',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#64748B',
        fontWeight: '600',
    },
    navHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#FFEFEA',
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#FFF0F2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    navTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#334155',
    },
    addNavBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#FF3B70',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 18,
    },
    childCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#FFEFEA',
        elevation: 2,
        shadowColor: '#FF3B70',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
    },
    childHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    avatarCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFF0F2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    childInfoText: {
        flex: 1,
    },
    childName: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1E293B',
    },
    childAge: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
        marginTop: 2,
    },
    statusPillBanner: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 14,
    },
    statusPillText: {
        fontSize: 13,
        fontWeight: '700',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: '#FFF8F6',
        borderRadius: 14,
        paddingVertical: 10,
    },
    statCol: {
        alignItems: 'center',
    },
    statSubLabel: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '600',
        marginBottom: 2,
    },
    statVal: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FF3B70',
    },
    unitText: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '600',
    },
    divider: {
        width: 1,
        height: 24,
        backgroundColor: '#FFE4E6',
    },
    metricTabRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    metricTab: {
        flex: 1,
        flexDirection: 'row',
        gap: 6,
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    metricTabActive: {
        backgroundColor: '#FF3B70',
        borderColor: '#FF3B70',
    },
    metricTabText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B',
    },
    metricTabTextActive: {
        color: '#FFFFFF',
    },
    historySection: {
        marginTop: 16,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    historyTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    historyTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1E293B',
    },
    addRecordBtn: {
        backgroundColor: '#FFF0F2',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#FFE4E6',
    },
    addRecordBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FF3B70',
    },
    emptyHistoryBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFEFEA',
    },
    emptyHistoryText: {
        fontSize: 13,
        color: '#94A3B8',
        textAlign: 'center',
    },
    historyCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#FFEFEA',
    },
    historyMainRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    dateIconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    historyDate: {
        fontSize: 14,
        fontWeight: '800',
        color: '#1E293B',
    },
    historyAge: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    historyBadgeRow: {
        alignItems: 'flex-end',
        gap: 2,
    },
    historyMetricVal: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FF3B70',
    },
    historyNotes: {
        fontSize: 12,
        color: '#64748B',
        fontStyle: 'italic',
        marginTop: 8,
        backgroundColor: '#F8FAFC',
        padding: 8,
        borderRadius: 8,
    },
    historyActionsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 16,
        marginTop: 10,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    actionBtnEdit: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 4,
        paddingVertical: 4,
    },
    actionTextEdit: {
        fontSize: 12,
        fontWeight: '700',
        color: '#2563EB',
    },
    actionBtnDelete: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 4,
        paddingVertical: 4,
    },
    actionTextDelete: {
        fontSize: 12,
        fontWeight: '700',
        color: '#DC2626',
    },
});

export default GrowthTrackingScreen;
