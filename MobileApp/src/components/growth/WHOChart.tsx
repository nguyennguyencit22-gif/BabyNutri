import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Icon } from 'react-native-paper';
import { GrowthRecord, WHOStandardPoint } from '../../services/growth.service';
import { useAppTheme } from '../../theme/useAppTheme';

interface WHOChartProps {
    records: GrowthRecord[];
    whoPoints: WHOStandardPoint[];
    metric: 'weight' | 'height' | 'bmi';
    unit: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 48;
const CHART_HEIGHT = 220;
const PADDING_LEFT = 35;
const PADDING_RIGHT = 20;
const PADDING_TOP = 20;
const PADDING_BOTTOM = 30;

export const WHOChart: React.FC<WHOChartProps> = ({ records, whoPoints, metric, unit }) => {
    const { colors, isDark } = useAppTheme();
    const [selectedNode, setSelectedNode] = useState<GrowthRecord | null>(null);

    if (!whoPoints || whoPoints.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No WHO chart standards available</Text>
            </View>
        );
    }

    const maxMonth = Math.max(
        12,
        ...whoPoints.map(p => p.month),
        ...records.map(r => r.ageMonths)
    );

    const allValues = [
        ...whoPoints.map(p => p.p3),
        ...whoPoints.map(p => p.p97),
        ...records.map(r => (metric === 'weight' ? r.weight : metric === 'height' ? r.height : r.bmi)),
    ].filter(v => v !== undefined && v !== null && !isNaN(v));

    const minY = Math.max(0, Math.floor(Math.min(...allValues) * 0.9));
    const maxY = Math.ceil(Math.max(...allValues) * 1.1) || 20;

    const scaleX = (month: number) => {
        const plotWidth = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
        return PADDING_LEFT + (month / maxMonth) * plotWidth;
    };

    const scaleY = (val: number) => {
        const plotHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
        return CHART_HEIGHT - PADDING_BOTTOM - ((val - minY) / (maxY - minY)) * plotHeight;
    };

    const buildPath = (points: { x: number; y: number }[]) => {
        if (points.length === 0) return '';
        if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

        let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            const cp1x = p0.x + (p1.x - p0.x) / 3;
            const cp1y = p0.y;
            const cp2x = p0.x + (2 * (p1.x - p0.x)) / 3;
            const cp2y = p1.y;
            d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
        }
        return d;
    };

    const p3Points = whoPoints.map(p => ({ x: scaleX(p.month), y: scaleY(p.p3) }));
    const p50Points = whoPoints.map(p => ({ x: scaleX(p.month), y: scaleY(p.p50) }));
    const p97Points = whoPoints.map(p => ({ x: scaleX(p.month), y: scaleY(p.p97) }));

    const babyPoints = records.map(r => {
        const val = metric === 'weight' ? r.weight : metric === 'height' ? r.height : r.bmi;
        return {
            x: scaleX(r.ageMonths),
            y: scaleY(val),
            val,
            record: r,
        };
    });

    const pathP3 = buildPath(p3Points);
    const pathP50 = buildPath(p50Points);
    const pathP97 = buildPath(p97Points);
    const pathBaby = buildPath(babyPoints);

    const xTicks = [0, 3, 6, 9, 12, 18, 24, 36, 48, 60].filter(m => m <= maxMonth);
    const yTickCount = 5;
    const yStep = (maxY - minY) / yTickCount;
    const yTicks = Array.from({ length: yTickCount + 1 }, (_, i) => minY + i * yStep);

    const gridColor = isDark ? '#3A2E31' : '#F1F5F9';
    const gridTextColor = isDark ? '#C9B3B7' : '#64748B';

    return (
        <View style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.chartHeader}>
                <Icon
                    source={metric === 'weight' ? 'scale-bathroom' : metric === 'height' ? 'ruler' : 'calculator'}
                    size={20}
                    color="#FF3B70"
                />
                <Text style={[styles.chartTitle, { color: colors.text }]}>
                    {metric === 'weight' ? 'Weight by Month (kg)' : metric === 'height' ? 'Height by Month (cm)' : 'BMI by Month (kg/m²)'}
                </Text>
            </View>

            <View style={styles.svgWrapper}>
                <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
                    <Defs>
                        <LinearGradient id="pinkGradient" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0%" stopColor="#FF3B70" stopOpacity="0.25" />
                            <Stop offset="100%" stopColor="#FF3B70" stopOpacity="0.0" />
                        </LinearGradient>
                    </Defs>

                    {yTicks.map((yVal, idx) => {
                        const y = scaleY(yVal);
                        return (
                            <G key={`yGrid-${idx}`}>
                                <Line
                                    x1={PADDING_LEFT}
                                    y1={y}
                                    x2={CHART_WIDTH - PADDING_RIGHT}
                                    y2={y}
                                    stroke={gridColor}
                                    strokeWidth="1"
                                    strokeDasharray="4 4"
                                />
                                <SvgText
                                    x={PADDING_LEFT - 6}
                                    y={y + 4}
                                    fontSize="10"
                                    fill={gridTextColor}
                                    textAnchor="end"
                                    fontWeight="600"
                                >
                                    {yVal % 1 === 0 ? yVal.toFixed(0) : yVal.toFixed(1)}
                                </SvgText>
                            </G>
                        );
                    })}

                    {xTicks.map(month => {
                        const x = scaleX(month);
                        return (
                            <G key={`xGrid-${month}`}>
                                <Line
                                    x1={x}
                                    y1={PADDING_TOP}
                                    x2={x}
                                    y2={CHART_HEIGHT - PADDING_BOTTOM}
                                    stroke={gridColor}
                                    strokeWidth="1"
                                />
                                <SvgText
                                    x={x}
                                    y={CHART_HEIGHT - PADDING_BOTTOM + 16}
                                    fontSize="10"
                                    fill={gridTextColor}
                                    textAnchor="middle"
                                    fontWeight="600"
                                >
                                    {month}m
                                </SvgText>
                            </G>
                        );
                    })}

                    <Path d={pathP3} stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="5 5" fill="none" opacity={0.8} />
                    <Path d={pathP97} stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="5 5" fill="none" opacity={0.8} />
                    <Path d={pathP50} stroke="#10B981" strokeWidth="2" fill="none" />

                    {babyPoints.length > 0 && (
                        <>
                            <Path d={pathBaby} stroke="#FF3B70" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                            {babyPoints.map((pt, idx) => {
                                const isSelected = selectedNode?.id === pt.record.id;
                                return (
                                    <G key={`babyDot-${idx}`}>
                                        <Circle
                                            cx={pt.x}
                                            cy={pt.y}
                                            r={isSelected ? 10 : 7}
                                            fill="#FF3B70"
                                            opacity={0.3}
                                        />
                                        <Circle
                                            cx={pt.x}
                                            cy={pt.y}
                                            r={isSelected ? 6 : 4.5}
                                            fill="#FFFFFF"
                                            stroke="#FF3B70"
                                            strokeWidth="3"
                                        />
                                    </G>
                                );
                            })}
                        </>
                    )}
                </Svg>

                {babyPoints.map((pt, idx) => (
                    <TouchableOpacity
                        key={`touchDot-${idx}`}
                        style={{
                            position: 'absolute',
                            left: pt.x - 18,
                            top: pt.y - 18,
                            width: 36,
                            height: 36,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                        onPress={() => setSelectedNode(selectedNode?.id === pt.record.id ? null : pt.record)}
                        activeOpacity={0.7}
                    />
                ))}
            </View>

            {selectedNode && (
                <View style={styles.tooltipCard}>
                    <View style={styles.tooltipHeader}>
                        <View style={styles.iconRow}>
                            <Icon source="calendar-month-outline" size={16} color="#FF3B70" />
                            <Text style={styles.tooltipDate}>{selectedNode.recordDate} ({selectedNode.ageMonths} months old)</Text>
                        </View>
                        <TouchableOpacity onPress={() => setSelectedNode(null)}>
                            <Icon source="close" size={18} color="#94A3B8" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.tooltipValue}>
                        {metric === 'weight' ? 'Weight' : metric === 'height' ? 'Height' : 'BMI'}:{' '}
                        <Text style={styles.boldPink}>
                            {metric === 'weight' ? selectedNode.weight : metric === 'height' ? selectedNode.height : selectedNode.bmi} {unit}
                        </Text>
                    </Text>
                    <Text style={styles.tooltipStatus}>
                        Assessment: <Text style={styles.statusPill}>{selectedNode.status}</Text>
                    </Text>
                </View>
            )}

            <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#FF3B70' }]} />
                    <Text style={styles.legendTextBold}>Your Baby</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendLine, { backgroundColor: '#10B981' }]} />
                    <Text style={styles.legendText}>WHO Median (P50)</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDashed, { borderColor: '#F59E0B' }]} />
                    <Text style={styles.legendText}>WHO Standard (P3 - P97)</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    chartCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#FFEFEA',
        elevation: 3,
        shadowColor: '#FF5F70',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
    },
    chartHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    chartTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#334155',
    },
    svgWrapper: {
        position: 'relative',
        alignItems: 'center',
    },
    emptyContainer: {
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#94A3B8',
        fontSize: 14,
    },
    tooltipCard: {
        backgroundColor: '#FFF0F2',
        borderRadius: 12,
        padding: 10,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#FFE4E6',
    },
    tooltipHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    tooltipDate: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FF3B70',
    },
    tooltipValue: {
        fontSize: 13,
        color: '#334155',
    },
    boldPink: {
        fontWeight: '800',
        color: '#FF3B70',
    },
    tooltipStatus: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    statusPill: {
        fontWeight: '700',
        color: '#10B981',
    },
    legendRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendLine: {
        width: 14,
        height: 3,
        borderRadius: 1.5,
    },
    legendDashed: {
        width: 14,
        height: 0,
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    legendTextBold: {
        fontSize: 11,
        fontWeight: '800',
        color: '#FF3B70',
    },
    legendText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748B',
    },
});
