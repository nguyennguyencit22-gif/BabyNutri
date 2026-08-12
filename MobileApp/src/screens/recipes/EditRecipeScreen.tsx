import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { recipeService } from '../../services/recipe.service';
import { useAppTheme } from '../../theme/useAppTheme';

const EditRecipeScreen = ({ route, navigation }: any) => {
  const { colors, isDark } = useAppTheme();
  const id = Number(route?.params?.id);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [calories, setCalories] = useState('');
  const [monthAge, setMonthAge] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');
  const [carbohydrate, setCarbohydrate] = useState('');

  const fetchRecipeDetail = useCallback(() => {
    setLoading(true);
    recipeService.getById(id)
      .then((r) => {
        setName(r.name);
        setDescription(r.description || '');
        setImageUrl(r.image_url || '');
        setCalories(String(r.calories || ''));
        setMonthAge(String(r.month_age || ''));
        setCookingTime(String(r.cooking_time || ''));
        setPrepTime(String(r.prep_time || ''));
        setProtein(String(r.protein || ''));
        setFat(String(r.fat || ''));
        setCarbohydrate(String(r.carbohydrate || ''));
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchRecipeDetail();
  }, [fetchRecipeDetail]);

  const handleSave = async () => {
    setSubmitting(true);
    try {
      await recipeService.update(id, {
        name,
        description,
        imageUrl,
        calories: Number(calories),
        monthAge: Number(monthAge),
        cookingTime: Number(cookingTime),
        prepTime: Number(prepTime),
        protein: Number(protein),
        fat: Number(fat),
        carbohydrate: Number(carbohydrate),
      });
      Alert.alert('Success', 'Recipe updated', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) {
      console.error('Update recipe error:', e);
      Alert.alert('Error', 'Unable to update recipe right now');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color="#FF7A59" /></View>;

  const inputStyle = [styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.label, { color: colors.textSoft }]}>Recipe Name</Text>
      <TextInput style={inputStyle} defaultValue={name} onChangeText={setName} placeholderTextColor={colors.textSoft} />

      <Text style={[styles.label, { color: colors.textSoft }]}>Description</Text>
      <TextInput style={[inputStyle, styles.multiline]} defaultValue={description} onChangeText={setDescription} multiline placeholderTextColor={colors.textSoft} />

      <Text style={[styles.label, { color: colors.textSoft }]}>Image (URL)</Text>
      <TextInput style={inputStyle} defaultValue={imageUrl} onChangeText={setImageUrl} placeholderTextColor={colors.textSoft} />

      <View style={styles.rowInputs}>
        <View style={styles.half}>
          <Text style={[styles.label, { color: colors.textSoft }]}>Calories (kcal)</Text>
          <TextInput style={inputStyle} defaultValue={calories} onChangeText={setCalories} keyboardType="numeric" placeholderTextColor={colors.textSoft} />
        </View>
        <View style={styles.half}>
          <Text style={[styles.label, { color: colors.textSoft }]}>Age (months)</Text>
          <TextInput style={inputStyle} defaultValue={monthAge} onChangeText={setMonthAge} keyboardType="numeric" placeholderTextColor={colors.textSoft} />
        </View>
      </View>

      <View style={styles.rowInputs}>
        <View style={styles.third}>
          <Text style={[styles.label, { color: colors.textSoft }]}>Protein (g)</Text>
          <TextInput style={inputStyle} defaultValue={protein} onChangeText={setProtein} keyboardType="numeric" placeholderTextColor={colors.textSoft} />
        </View>
        <View style={styles.third}>
          <Text style={[styles.label, { color: colors.textSoft }]}>Fat (g)</Text>
          <TextInput style={inputStyle} defaultValue={fat} onChangeText={setFat} keyboardType="numeric" placeholderTextColor={colors.textSoft} />
        </View>
        <View style={styles.third}>
          <Text style={[styles.label, { color: colors.textSoft }]}>Carb (g)</Text>
          <TextInput style={inputStyle} defaultValue={carbohydrate} onChangeText={setCarbohydrate} keyboardType="numeric" placeholderTextColor={colors.textSoft} />
        </View>
      </View>

      <View style={styles.rowInputs}>
        <View style={styles.half}>
          <Text style={[styles.label, { color: colors.textSoft }]}>Prep Time (min)</Text>
          <TextInput style={inputStyle} defaultValue={prepTime} onChangeText={setPrepTime} keyboardType="numeric" placeholderTextColor={colors.textSoft} />
        </View>
        <View style={styles.half}>
          <Text style={[styles.label, { color: colors.textSoft }]}>Cooking Time (min)</Text>
          <TextInput style={inputStyle} defaultValue={cookingTime} onChangeText={setCookingTime} keyboardType="numeric" placeholderTextColor={colors.textSoft} />
        </View>
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={handleSave} disabled={submitting}>
        <Text style={styles.submitText}>{submitting ? 'Saving...' : 'Save Changes'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 18, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, borderWidth: 1 },
  multiline: { height: 80, textAlignVertical: 'top' },
  rowInputs: { flexDirection: 'row', justifyContent: 'space-between' },
  half: { width: '48%' },
  third: { width: '31%' },
  submitBtn: { backgroundColor: '#FF7A59', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 28 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

export default EditRecipeScreen;