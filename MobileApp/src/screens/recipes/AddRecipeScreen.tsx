import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { recipeService } from '../../services/recipe.service';
import { IngredientInput } from '../../types/recipe';

const DEFAULT_FOOD_IMAGE = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600';

const AddRecipeScreen = ({ navigation }: any) => {
  const formData = useRef({
    name: '',
    description: '',
    imageUrl: DEFAULT_FOOD_IMAGE,
    calories: '',
    monthAge: '',
    cookingTime: '',
    prepTime: '',
    serves: '1',
    protein: '',
    fat: '',
    carbohydrate: '',
  });

  const [ingredients, setIngredients] = useState<IngredientInput[]>([{ name: '', quantity: '' }]);
  const [steps, setSteps] = useState<string[]>(['']);
  const [submitting, setSubmitting] = useState(false);

  const updateIngredient = (index: number, field: 'name' | 'quantity', value: string) => {
    ingredients[index][field] = value;
  };
  const addIngredient = () => setIngredients([...ingredients, { name: '', quantity: '' }]);
  const removeIngredient = (index: number) => setIngredients(ingredients.filter((_, i) => i !== index));

  const updateStep = (index: number, value: string) => {
    steps[index] = value;
  };
  const addStep = () => setSteps([...steps, '']);
  const removeStep = (index: number) => setSteps(steps.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    const data = formData.current;
    if (!data.name.trim() || !data.calories.trim() || !data.monthAge.trim()) {
      Alert.alert('Missing Info', 'Please enter recipe name, calories, and target age (months)');
      return;
    }
    setSubmitting(true);
    try {
      await recipeService.create({
        name: data.name.trim(),
        description: data.description.trim(),
        imageUrl: data.imageUrl.trim() || DEFAULT_FOOD_IMAGE,
        calories: Number(data.calories),
        monthAge: Number(data.monthAge),
        cookingTime: Number(data.cookingTime) || 0,
        prepTime: Number(data.prepTime) || 0,
        serves: Number(data.serves) || 1,
        protein: Number(data.protein) || 0,
        fat: Number(data.fat) || 0,
        carbohydrate: Number(data.carbohydrate) || 0,
        ingredients: ingredients.filter((i) => i.name.trim()),
        steps: steps.filter((s) => s.trim()),
      });
      Alert.alert('Success', 'New recipe added', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) {
      console.error('Create recipe error:', e);
      Alert.alert('Error', 'Unable to create recipe right now');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Recipe Name</Text>
      <TextInput style={styles.input} onChangeText={(v) => { formData.current.name = v; }} placeholder="e.g. Pumpkin Porridge" />

      <Text style={styles.label}>Description</Text>
      <TextInput style={[styles.input, styles.multiline]} onChangeText={(v) => { formData.current.description = v; }} multiline placeholder="Short description of the recipe" />

      <Text style={styles.label}>Image (URL)</Text>
      <TextInput
        style={styles.input}
        defaultValue={"DEFAULT_FOOD_IMAGE"}
        onChangeText={(v) => { formData.current.imageUrl = v; }}
        placeholder="https://..."
      />

      <View style={styles.rowInputs}>
        <View style={styles.third}>
          <Text style={styles.label}>Calories (kcal)</Text>
          <TextInput style={styles.input} onChangeText={(v) => { formData.current.calories = v; }} keyboardType="numeric" placeholder="120" />
        </View>
        <View style={styles.third}>
          <Text style={styles.label}>Age (months)</Text>
          <TextInput style={styles.input} onChangeText={(v) => { formData.current.monthAge = v; }} keyboardType="numeric" placeholder="7" />
        </View>
        <View style={styles.third}>
          <Text style={styles.label}>Servings</Text>
          <TextInput style={styles.input} onChangeText={(v) => { formData.current.serves = v; }} defaultValue="1" keyboardType="numeric" placeholder="1" />
        </View>
      </View>

      {/* Nhập Thông tin Dinh dưỡng: Protein, Fat, Carb */}
      <View style={styles.rowInputs}>
        <View style={styles.third}>
          <Text style={styles.label}>Protein (g)</Text>
          <TextInput style={styles.input} onChangeText={(v) => { formData.current.protein = v; }} keyboardType="numeric" placeholder="12.5" />
        </View>
        <View style={styles.third}>
          <Text style={styles.label}>Fat (g)</Text>
          <TextInput style={styles.input} onChangeText={(v) => { formData.current.fat = v; }} keyboardType="numeric" placeholder="4.2" />
        </View>
        <View style={styles.third}>
          <Text style={styles.label}>Carb (g)</Text>
          <TextInput style={styles.input} onChangeText={(v) => { formData.current.carbohydrate = v; }} keyboardType="numeric" placeholder="25.0" />
        </View>
      </View>

      <View style={styles.rowInputs}>
        <View style={styles.half}>
          <Text style={styles.label}>Prep Time (min)</Text>
          <TextInput style={styles.input} onChangeText={(v) => { formData.current.prepTime = v; }} keyboardType="numeric" placeholder="5" />
        </View>
        <View style={styles.half}>
          <Text style={styles.label}>Cooking Time (min)</Text>
          <TextInput style={styles.input} onChangeText={(v) => { formData.current.cookingTime = v; }} keyboardType="numeric" placeholder="10" />
        </View>
      </View>

      <Text style={styles.section}>Ingredients</Text>
      {ingredients.map((ing, i) => (
        <View key={i} style={styles.dynamicRow}>
          <TextInput
            style={[styles.input, styles.flex2]}
            defaultValue={ing.name}
            onChangeText={(v) => updateIngredient(i, 'name', v)}
            placeholder="Ingredient name"
          />
          <TextInput
            style={[styles.input, styles.flex1, { marginLeft: 8 }]}
            defaultValue={ing.quantity}
            onChangeText={(v) => updateIngredient(i, 'quantity', v)}
            placeholder="Quantity"
          />
          <TouchableOpacity onPress={() => removeIngredient(i)}>
            <Text style={styles.removeBtn}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity onPress={addIngredient}>
        <Text style={styles.addBtn}>+ Add Ingredient</Text>
      </TouchableOpacity>

      <Text style={styles.section}>Cooking Steps</Text>
      {steps.map((step, i) => (
        <View key={i} style={styles.dynamicRow}>
          <TextInput
            style={[styles.input, styles.flex1]}
            defaultValue={step}
            onChangeText={(v) => updateStep(i, v)}
            placeholder={`Step ${i + 1}`}
          />
          <TouchableOpacity onPress={() => removeStep(i)}>
            <Text style={styles.removeBtn}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity onPress={addStep}>
        <Text style={styles.addBtn}>+ Add Step</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.submitText}>{submitting ? 'Saving...' : 'Save Recipe'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF5' },
  content: { padding: 18, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '600', color: '#6B6B6B', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, borderWidth: 1, borderColor: '#EEE' },
  multiline: { height: 80, textAlignVertical: 'top' },
  rowInputs: { flexDirection: 'row', justifyContent: 'space-between' },
  half: { width: '48%' },
  third: { width: '31%' },
  section: { fontSize: 16, fontWeight: '700', color: '#2E2E2E', marginTop: 20, marginBottom: 8 },
  dynamicRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  removeBtn: { color: '#FF3B30', fontSize: 16, marginLeft: 10, paddingHorizontal: 4 },
  addBtn: { color: '#FF7A59', fontWeight: '600', marginTop: 4 },
  submitBtn: { backgroundColor: '#FF7A59', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 28 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

export default AddRecipeScreen;