import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button, Alert } from 'react-native';
import { childService } from '../../services/childService';
import { Child } from '../../types/child';

export const ChildDetailScreen = ({ route, navigation }: any) => {
  const { childId } = route.params || {};
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (childId) {
      loadChild();
    } else {
      setLoading(false);
    }
  }, [childId]);

  const loadChild = async () => {
    try {
      const data = await childService.getChildById(childId);
      if (data) setChild(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Child', 'Are you sure you want to delete this profile?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          await childService.deleteChild(childId);
          navigation.goBack();
        } 
      }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!child) {
    return (
      <View style={styles.center}>
        <Text>Child not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{child.name}</Text>
        <Text style={styles.detail}>Age: {child.age} years</Text>
        <Text style={styles.detail}>Gender: {child.gender}</Text>
        <Text style={styles.detail}>Height: {child.height} cm</Text>
        <Text style={styles.detail}>Weight: {child.weight} kg</Text>
        {child.allergies && child.allergies.length > 0 && (
          <Text style={styles.detail}>Allergies: {child.allergies.join(', ')}</Text>
        )}
      </View>
      <View style={styles.actions}>
        <Button title="Edit Profile" onPress={() => navigation.navigate('AddEditChild', { childId: child.id })} />
        <View style={{ height: 10 }} />
        <Button title="Delete Profile" color="red" onPress={handleDelete} />
        <View style={{ height: 10 }} />
        <Button title="View Meal Plans" color="green" onPress={() => navigation.navigate('MealPlanList', { childId: child.id })} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  detail: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  actions: {
    marginTop: 10,
  }
});
