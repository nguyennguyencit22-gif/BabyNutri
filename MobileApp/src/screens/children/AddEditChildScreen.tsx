import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, ScrollView, Alert } from 'react-native';
import { childService } from '../../services/childService';
import { Child } from '../../types/child';

export const AddEditChildScreen = ({ route, navigation }: any) => {
  const { childId } = route.params || {};
  const isEditing = !!childId;
  
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [allergies, setAllergies] = useState('');

  useEffect(() => {
    if (isEditing) {
      loadChild();
    }
  }, [childId]);

  const loadChild = async () => {
    const data = await childService.getChildById(childId);
    if (data) {
      setName(data.name);
      setAge(data.age.toString());
      setGender(data.gender);
      setHeight(data.height.toString());
      setWeight(data.weight.toString());
      if (data.allergies) {
        setAllergies(data.allergies.join(', '));
      }
    }
  };

  const handleSave = async () => {
    if (!name || !age || !height || !weight) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const childData = {
      name,
      age: parseInt(age, 10),
      gender: gender as 'Male' | 'Female' | 'Other',
      height: parseFloat(height),
      weight: parseFloat(weight),
      allergies: allergies ? allergies.split(',').map(a => a.trim()) : [],
    };

    try {
      if (isEditing) {
        await childService.updateChild(childId, childData);
      } else {
        await childService.createChild(childData);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save child profile');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Name *</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Child's Name" />

      <Text style={styles.label}>Age (years) *</Text>
      <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="numeric" placeholder="Age" />

      <Text style={styles.label}>Gender *</Text>
      <TextInput style={styles.input} value={gender} onChangeText={setGender} placeholder="Male / Female / Other" />

      <Text style={styles.label}>Height (cm) *</Text>
      <TextInput style={styles.input} value={height} onChangeText={setHeight} keyboardType="numeric" placeholder="Height in cm" />

      <Text style={styles.label}>Weight (kg) *</Text>
      <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="numeric" placeholder="Weight in kg" />

      <Text style={styles.label}>Allergies (comma separated)</Text>
      <TextInput style={styles.input} value={allergies} onChangeText={setAllergies} placeholder="e.g. Peanuts, Milk" />

      <View style={styles.btnContainer}>
        <Button title={isEditing ? "Update Child" : "Add Child"} onPress={handleSave} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  btnContainer: {
    marginTop: 20,
  }
});
