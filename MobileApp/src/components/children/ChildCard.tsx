import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Child } from '../../types/child';

interface ChildCardProps {
  child: Child;
  onPress: () => void;
}

export const ChildCard = ({ child, onPress }: ChildCardProps) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.name}>{child.name}</Text>
      <Text style={styles.info}>Age: {child.age} | Gender: {child.gender}</Text>
      <Text style={styles.info}>Weight: {child.weight}kg | Height: {child.height}cm</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  info: {
    fontSize: 14,
    color: '#666',
  },
});
