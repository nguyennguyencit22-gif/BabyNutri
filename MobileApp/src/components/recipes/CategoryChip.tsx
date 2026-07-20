import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
  label: string;
  active?: boolean;
  onPress?: () => void;
}

const CategoryChip: React.FC<Props> = ({ label, active, onPress }) => (
  <TouchableOpacity style={[styles.chip, active && styles.chipActive]} onPress={onPress}>
    <Text style={[styles.text, active && styles.textActive]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFF1E6', marginRight: 8 },
  chipActive: { backgroundColor: '#FF7A59' },
  text: { color: '#8A5A44', fontWeight: '600', fontSize: 13 },
  textActive: { color: '#FFFFFF' },
});

export default CategoryChip;