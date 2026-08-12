import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { childService } from '../../services/childService';
import { useAppTheme } from '../../theme/useAppTheme';
import { Child } from '../../types/child';

export const AddEditChildScreen = ({ route, navigation }: any) => {
  const { colors, isDark } = useAppTheme();
  const { childId } = route.params || {};
  const isEditing = !!childId;
  
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
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
      setGender(data.gender?.toLowerCase() === 'female' ? 'Female' : 'Male');
      setHeight(data.height.toString());
      setWeight(data.weight.toString());
      if (data.allergies) {
        setAllergies(data.allergies.join(', '));
      }
    }
  };

  const handleSave = async () => {
    if (!name || !age || !gender || !height || !weight) {
      Alert.alert('Missing Fields', 'Please fill in all required fields');
      return;
    }

    if (parseInt(age, 10) > 5) {
      Alert.alert('Age Limit Exceeded', 'BabyNutri is designed for infants and children up to 5 years old (60 months). Please enter an age of 5 years or under.');
      return;
    }

    const childData = {
      name,
      age: parseInt(age, 10),
      gender: gender as 'Male' | 'Female',
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
      Alert.alert('Error', 'Unable to save child info right now');
    }
  };

  const inputBg = isDark ? '#3A2E31' : '#FFFFFF';

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.screenTitle, { color: colors.text }]}>{isEditing ? 'Edit Child Profile' : 'Create Child Profile'}</Text>

      <Text style={[styles.label, { color: colors.textSoft }]}>Child Name *</Text>
      <TextInput 
        style={[styles.input, { backgroundColor: inputBg, color: colors.text, borderColor: colors.border }]} 
        value={name} 
        onChangeText={setName} 
        placeholder="Enter child name (e.g. Leo)" 
        placeholderTextColor={colors.textSoft}
      />

      <Text style={[styles.label, { color: colors.textSoft }]}>Age (years) *</Text>
      <TextInput 
        style={[styles.input, { backgroundColor: inputBg, color: colors.text, borderColor: colors.border }]} 
        value={age} 
        onChangeText={setAge} 
        keyboardType="numeric" 
        placeholder="Enter age in years (e.g. 2)" 
        placeholderTextColor={colors.textSoft}
      />

      <Text style={[styles.label, { color: colors.textSoft }]}>Gender *</Text>
      <View style={styles.genderRow}>
        <TouchableOpacity 
          style={[styles.genderChip, { backgroundColor: inputBg, borderColor: colors.border }, gender === 'Male' && styles.genderChipActive]} 
          onPress={() => setGender('Male')}
          activeOpacity={0.88}
        >
          <Text style={[styles.genderChipText, { color: colors.text }, gender === 'Male' && styles.genderChipTextActive]}>
            Boy
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.genderChip, { backgroundColor: inputBg, borderColor: colors.border }, gender === 'Female' && styles.genderChipActive]} 
          onPress={() => setGender('Female')}
          activeOpacity={0.88}
        >
          <Text style={[styles.genderChipText, { color: colors.text }, gender === 'Female' && styles.genderChipTextActive]}>
            Girl
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.label, { color: colors.textSoft }]}>Height (cm) *</Text>
      <TextInput 
        style={[styles.input, { backgroundColor: inputBg, color: colors.text, borderColor: colors.border }]} 
        value={height} 
        onChangeText={setHeight} 
        keyboardType="numeric" 
        placeholder="Enter height (e.g. 85)" 
        placeholderTextColor={colors.textSoft}
      />

      <Text style={[styles.label, { color: colors.textSoft }]}>Weight (kg) *</Text>
      <TextInput 
        style={[styles.input, { backgroundColor: inputBg, color: colors.text, borderColor: colors.border }]} 
        value={weight} 
        onChangeText={setWeight} 
        keyboardType="numeric" 
        placeholder="Enter weight (e.g. 12)" 
        placeholderTextColor={colors.textSoft}
      />

      <Text style={[styles.label, { color: colors.textSoft }]}>Allergy History (comma separated)</Text>
      <TextInput 
        style={[styles.input, { backgroundColor: inputBg, color: colors.text, borderColor: colors.border }]} 
        value={allergies} 
        onChangeText={setAllergies} 
        placeholder="e.g. Peanuts, Seafood, Cow milk" 
        placeholderTextColor={colors.textSoft}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.88}>
        <Text style={styles.saveBtnText}>{isEditing ? 'Update Profile' : 'Save Child Profile'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFFDF9',
    flexGrow: 1,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4B3034',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    color: '#4B3034',
  },
  input: {
    borderWidth: 1,
    borderColor: '#FFE4E6',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    fontSize: 15,
    backgroundColor: '#FFFFFF',
    color: '#4B3034',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  genderChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFE4E6',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  genderChipActive: {
    backgroundColor: '#FF5F70',
    borderColor: '#FF5F70',
  },
  genderChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8E7377',
  },
  genderChipTextActive: {
    color: '#FFFFFF',
  },
  saveBtn: {
    marginTop: 10,
    backgroundColor: '#FF5F70',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#FF5F70',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
