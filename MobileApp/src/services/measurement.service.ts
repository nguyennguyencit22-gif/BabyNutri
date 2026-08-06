import { apiGet, apiPut } from './api';

export type WeightUnit = 'kg' | 'lb';
export type VolumeUnit = 'ml' | 'us_fl_oz' | 'uk_fl_oz';
export type LengthUnit = 'cm' | 'in';
export type TemperatureUnit = 'C' | 'F';

export type MeasurementSettings = {
    useMetric: boolean;
    weightUnit: WeightUnit;
    volumeUnit: VolumeUnit;
    lengthUnit: LengthUnit;
    temperatureUnit: TemperatureUnit;
};

export const fetchMeasurementSettings = (): Promise<MeasurementSettings> =>
    apiGet<MeasurementSettings>('/measurement-settings');

export const saveMeasurementSettings = (
    settings: MeasurementSettings,
): Promise<MeasurementSettings> =>
    apiPut<MeasurementSettings>('/measurement-settings', settings);
