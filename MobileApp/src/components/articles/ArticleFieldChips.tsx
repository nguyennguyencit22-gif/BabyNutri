import React from 'react';
import { Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import type { AppColors } from '../../theme/colors';

export const ARTICLE_CATEGORIES = ['Nutrition Tips', 'Weaning Guide', 'Recipes & Meals', 'Health & Safety', 'Development'];
export const ARTICLE_AGE_RANGES = ['0-6 months', '6-12 months', '12-24 months', '24+ months'];
export const ARTICLE_READING_TIMES = ['2 min read', '5 min read', '10 min read'];

type Props = {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  colors: AppColors;
  isDark: boolean;
};

// Mobile stand-in for a <select> dropdown — a horizontal row of tappable
// chips, tapping the active one clears the selection. Used for Category /
// Target Baby Age / Reading Time on both Add and Edit Article.
export const ChipSelectRow: React.FC<Props> = ({ options, value, onChange, colors, isDark }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
    {options.map((opt) => {
      const selected = opt === value;
      const chipStyle = {
        backgroundColor: selected ? '#FF5F70' : (isDark ? '#3A2E31' : '#FFF0F2'),
        borderColor: selected ? '#FF5F70' : (isDark ? '#4A3236' : '#FFE2E6'),
      };
      return (
        <TouchableOpacity
          key={opt}
          onPress={() => onChange(selected ? '' : opt)}
          activeOpacity={0.85}
          style={[styles.chip, chipStyle]}
        >
          <Text style={[styles.chipText, { color: selected ? '#FFFFFF' : colors.text }]}>{opt}</Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({
  chipRow: { gap: 8, paddingVertical: 2 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: '700' },
});
