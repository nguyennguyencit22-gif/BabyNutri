import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../../theme/useAppTheme';

interface Props {
  label: string;
  active?: boolean;
  onPress?: () => void;
}

const CategoryChip: React.FC<Props> = ({ label, active, onPress }) => {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        {
          backgroundColor: active ? '#FF6B4A' : colors.surface,
          borderColor: active ? '#FF6B4A' : colors.border,
        },
        active && styles.chipActive,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, { color: active ? '#FFFFFF' : colors.textSoft }, active && styles.textActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 22,
    borderWidth: 1,
    marginRight: 8,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  chipActive: {
    backgroundColor: '#FF6B4A',
    borderColor: '#FF6B4A',
    shadowColor: '#FF6B4A',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  text: { fontWeight: '600', fontSize: 13 },
  textActive: { color: '#FFFFFF', fontWeight: '700' },
});

export default CategoryChip;