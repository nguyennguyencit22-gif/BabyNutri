import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Switch } from 'react-native-paper';
import Svg, { Path } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

const CheckIcon = ({ size = 14, color = '#FFFFFF' }: { size?: number; color?: string }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M20 6L9 17l-5-5" />
    </Svg>
);

import ProfileHeader from '../../components/profile/ProfileHeader';

import type { AppDispatch, RootState } from '../../store/Store';
import {
    loadMeasurementSettings,
    updateMeasurementSettings,
} from '../../store/settings/measurementSlice';

import type {
    LengthUnit,
    MeasurementSettings,
    TemperatureUnit,
    VolumeUnit,
    WeightUnit,
} from '../../services/measurement.service';

import createStyles from '../../styles/settings/measurementSettingsStyles';
import { useAppTheme } from '../../theme/useAppTheme';

const METRIC_UNITS = {
    weightUnit: 'kg' as WeightUnit,
    volumeUnit: 'ml' as VolumeUnit,
    lengthUnit: 'cm' as LengthUnit,
    temperatureUnit: 'C' as TemperatureUnit,
};

const IMPERIAL_UNITS = {
    weightUnit: 'lb' as WeightUnit,
    volumeUnit: 'us_fl_oz' as VolumeUnit,
    lengthUnit: 'in' as LengthUnit,
    temperatureUnit: 'F' as TemperatureUnit,
};

function OptionRow<T extends string>({
    label,
    value,
    current,
    onSelect,
    colors,
    styles,
}: {
    label: string;
    value: T;
    current: T;
    onSelect: (value: T) => void;
    colors: ReturnType<typeof useAppTheme>['colors'];
    styles: ReturnType<typeof createStyles>;
}) {
    const isSelected = value === current;

    return (
        <Pressable
            onPress={() => onSelect(value)}
            style={({ pressed }) => [
                styles.optionRow,
                pressed && styles.optionPressed,
            ]}>
            <View style={[styles.radio, isSelected && styles.radioSelected]}>
                {isSelected ? (
                    <CheckIcon size={14} color={colors.onPrimary} />
                ) : null}
            </View>
            <Text style={styles.optionText}>{label}</Text>
        </Pressable>
    );
}

function MeasurementSettingsScreen({ navigation }: any) {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();

    const { colors } = useAppTheme();
    const styles = React.useMemo(() => createStyles(colors), [colors]);

    const settings = useSelector((state: RootState) => state.measurement);

    React.useEffect(() => {
        dispatch(loadMeasurementSettings());
    }, [dispatch]);

    const save = (partial: Partial<MeasurementSettings>) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructured only to exclude them from `current`
        const { status, error, ...current } = settings;

        dispatch(
            updateMeasurementSettings({
                ...current,
                ...partial,
            }),
        );
    };

    const handleToggleMetric = (value: boolean) => {
        save({
            useMetric: value,
            ...(value ? METRIC_UNITS : IMPERIAL_UNITS),
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ProfileHeader
                title={t('measurement.title')}
                onBack={() => navigation.goBack()}
            />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}>

                <View style={styles.metricRow}>
                    <Text style={styles.metricRowText}>
                        {t('measurement.useMetric')}
                    </Text>
                    <Switch
                        value={settings.useMetric}
                        onValueChange={handleToggleMetric}
                        color={colors.primary}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {t('measurement.weight')}
                    </Text>
                    <OptionRow
                        label="kg"
                        value="kg"
                        current={settings.weightUnit}
                        onSelect={(weightUnit) => save({ weightUnit })}
                        colors={colors}
                        styles={styles}
                    />
                    <OptionRow
                        label="lb"
                        value="lb"
                        current={settings.weightUnit}
                        onSelect={(weightUnit) => save({ weightUnit })}
                        colors={colors}
                        styles={styles}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {t('measurement.volume')}
                    </Text>
                    <OptionRow
                        label="ml"
                        value="ml"
                        current={settings.volumeUnit}
                        onSelect={(volumeUnit) => save({ volumeUnit })}
                        colors={colors}
                        styles={styles}
                    />
                    <OptionRow
                        label="us fl oz"
                        value="us_fl_oz"
                        current={settings.volumeUnit}
                        onSelect={(volumeUnit) => save({ volumeUnit })}
                        colors={colors}
                        styles={styles}
                    />
                    <OptionRow
                        label="uk fl oz"
                        value="uk_fl_oz"
                        current={settings.volumeUnit}
                        onSelect={(volumeUnit) => save({ volumeUnit })}
                        colors={colors}
                        styles={styles}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {t('measurement.length')}
                    </Text>
                    <OptionRow
                        label="cm"
                        value="cm"
                        current={settings.lengthUnit}
                        onSelect={(lengthUnit) => save({ lengthUnit })}
                        colors={colors}
                        styles={styles}
                    />
                    <OptionRow
                        label="in"
                        value="in"
                        current={settings.lengthUnit}
                        onSelect={(lengthUnit) => save({ lengthUnit })}
                        colors={colors}
                        styles={styles}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {t('measurement.temperature')}
                    </Text>
                    <OptionRow
                        label="°C"
                        value="C"
                        current={settings.temperatureUnit}
                        onSelect={(temperatureUnit) => save({ temperatureUnit })}
                        colors={colors}
                        styles={styles}
                    />
                    <OptionRow
                        label="°F"
                        value="F"
                        current={settings.temperatureUnit}
                        onSelect={(temperatureUnit) => save({ temperatureUnit })}
                        colors={colors}
                        styles={styles}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

export default MeasurementSettingsScreen;
