import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../../theme/useAppTheme';

interface Props {
  name: string;
}

const IngredientItem: React.FC<Props> = ({ name }) => {
  const { colors } = useAppTheme();

  return (
    <View style={styles.row}>
      <View style={styles.dot} />
      <Text style={[styles.text, { color: colors.text }]}>{name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF7A59', marginRight: 10 },
  text: { fontSize: 15 },
});

export default IngredientItem;