import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Image } from 'react-native';
import Icon from '../../components/common/AppIcon';
import { recipeService } from '../../services/recipe.service';
import { IngredientInput } from '../../types/recipe';
import { useAppTheme } from '../../theme/useAppTheme';

const DEFAULT_FOOD_IMAGE = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600';

const PRESET_PUBLIC_IMAGES = [
  { label: 'Pumpkin Puree', url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600', icon: 'food-apple' },
  { label: 'Brekkie Bowl', url: 'https://images.unsplash.com/photo-1682622110332-d50f50b7146d?w=600', icon: 'bowl-mix' },
  { label: 'Yogurt Pots', url: 'https://images.unsplash.com/photo-1753173302910-8470505e6994?w=600', icon: 'cup-water' },
  { label: 'Scrambly Eggs', url: 'https://images.unsplash.com/photo-1687630433865-f86f07be989a?w=600', icon: 'egg' },
  { label: 'Cheesy Pasta', url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600', icon: 'pasta' },
  { label: 'Chicken Curry', url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600', icon: 'food-variant' },
  { label: 'Avocado Bowl', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600', icon: 'avocado' },
];

const AddRecipeScreen = ({ navigation }: any) => {
  const { colors, isDark } = useAppTheme();
  const [selectedImageUrl, setSelectedImageUrl] = useState(DEFAULT_FOOD_IMAGE);
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
      Alert.alert('Success', 'Recipe created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Unable to create recipe');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = [styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.label, { color: colors.textSoft }]}>Recipe Name *</Text>
      <TextInput
        style={inputStyle}
        onChangeText={(v) => (formData.current.name = v)}
        placeholder="e.g. Pumpkin Puree"
        placeholderTextColor={colors.textSoft}
      />

      <Text style={[styles.label, { color: colors.textSoft }]}>Description</Text>
      <TextInput
        style={[inputStyle, styles.multiline]}
        multiline
        onChangeText={(v) => (formData.current.description = v)}
        placeholder="Brief description"
        placeholderTextColor={colors.textSoft}
      />

      <Text style={[styles.label, { color: colors.textSoft }]}>Image URL</Text>
      <TextInput
        style={inputStyle}
        value={selectedImageUrl}
        onChangeText={(v) => {
          setSelectedImageUrl(v);
          formData.current.imageUrl = v;
        }}
        placeholder="Image URL"
        placeholderTextColor={colors.textSoft}
      />

      <Text style={[styles.label, { color: colors.textSoft, marginTop: 10 }]}>Select from Preset Photos:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {PRESET_PUBLIC_IMAGES.map((img) => {
            const isSelected = selectedImageUrl === img.url;
            return (
              <TouchableOpacity
                key={img.label}
                style={[
                  styles.presetChip,
                  { backgroundColor: isSelected ? '#FF5F70' : colors.surface, borderColor: isSelected ? '#FF5F70' : colors.border },
                ]}
                onPress={() => {
                  setSelectedImageUrl(img.url);
                  formData.current.imageUrl = img.url;
                }}
                activeOpacity={0.8}
              >
                <Icon source={img.icon} size={15} color={isSelected ? '#FFFFFF' : '#FF5F70'} />
                <Text style={[styles.presetChipText, { color: isSelected ? '#FFFFFF' : colors.text }]}>{img.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {selectedImageUrl ? (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: selectedImageUrl }} style={styles.imagePreview} />
        </View>
      ) : null}

      <View style={styles.rowInputs}>
        <View style={styles.half}>
          <Text style={[styles.label, { color: colors.textSoft }]}>Calories (kcal) *</Text>
          <TextInput
            style={inputStyle}
            keyboardType="numeric"
            onChangeText={(v) => (formData.current.calories = v)}
            placeholder="120"
            placeholderTextColor={colors.textSoft}
          />
        </View>
        <View style={styles.half}>
          <Text style={[styles.label, { color: colors.textSoft }]}>Target Age (Months) *</Text>
          <TextInput
            style={inputStyle}
            keyboardType="numeric"
            onChangeText={(v) => (formData.current.monthAge = v)}
            placeholder="6"
            placeholderTextColor={colors.textSoft}
          />
        </View>
      </View>

      <View style={styles.rowInputs}>
        <View style={styles.half}>
          <Text style={[styles.label, { color: colors.textSoft }]}>Prep Time (mins)</Text>
          <TextInput
            style={inputStyle}
            keyboardType="numeric"
            onChangeText={(v) => (formData.current.prepTime = v)}
            placeholder="10"
            placeholderTextColor={colors.textSoft}
          />
        </View>
        <View style={styles.half}>
          <Text style={[styles.label, { color: colors.textSoft }]}>Cook Time (mins)</Text>
          <TextInput
            style={inputStyle}
            keyboardType="numeric"
            onChangeText={(v) => (formData.current.cookingTime = v)}
            placeholder="15"
            placeholderTextColor={colors.textSoft}
          />
        </View>
      </View>

      <View style={styles.rowInputs}>
        <View style={styles.third}>
          <Text style={[styles.label, { color: colors.textSoft }]}>Protein (g)</Text>
          <TextInput
            style={inputStyle}
            keyboardType="numeric"
            onChangeText={(v) => (formData.current.protein = v)}
            placeholder="3"
            placeholderTextColor={colors.textSoft}
          />
        </View>
        <View style={styles.third}>
          <Text style={[styles.label, { color: colors.textSoft }]}>Fat (g)</Text>
          <TextInput
            style={inputStyle}
            keyboardType="numeric"
            onChangeText={(v) => (formData.current.fat = v)}
            placeholder="2"
            placeholderTextColor={colors.textSoft}
          />
        </View>
        <View style={styles.third}>
          <Text style={[styles.label, { color: colors.textSoft }]}>Carb (g)</Text>
          <TextInput
            style={inputStyle}
            keyboardType="numeric"
            onChangeText={(v) => (formData.current.carbohydrate = v)}
            placeholder="15"
            placeholderTextColor={colors.textSoft}
          />
        </View>
      </View>

      <Text style={[styles.section, { color: colors.text }]}>Ingredients</Text>
      {ingredients.map((ing, i) => (
        <View key={i} style={styles.dynamicRow}>
          <TextInput
            style={[inputStyle, styles.flex2, { marginRight: 8 }]}
            defaultValue={ing.name}
            onChangeText={(v) => updateIngredient(i, 'name', v)}
            placeholder={`Ingredient ${i + 1}`}
            placeholderTextColor={colors.textSoft}
          />
          <TextInput
            style={[inputStyle, styles.flex1]}
            defaultValue={ing.quantity}
            onChangeText={(v) => updateIngredient(i, 'quantity', v)}
            placeholder="Quantity"
            placeholderTextColor={colors.textSoft}
          />
          <TouchableOpacity onPress={() => removeIngredient(i)}>
            <Text style={styles.removeBtn}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity onPress={addIngredient}>
        <Text style={styles.addBtn}>+ Add Ingredient</Text>
      </TouchableOpacity>

      <Text style={[styles.section, { color: colors.text }]}>Cooking Steps</Text>
      {steps.map((step, i) => (
        <View key={i} style={styles.dynamicRow}>
          <TextInput
            style={[inputStyle, styles.flex1]}
            defaultValue={step}
            onChangeText={(v) => updateStep(i, v)}
            placeholder={`Step ${i + 1}`}
            placeholderTextColor={colors.textSoft}
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
  container: { flex: 1 },
  content: { padding: 18, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, borderWidth: 1 },
  multiline: { height: 80, textAlignVertical: 'top' },
  rowInputs: { flexDirection: 'row', justifyContent: 'space-between' },
  half: { width: '48%' },
  third: { width: '31%' },
  section: { fontSize: 16, fontWeight: '700', marginTop: 20, marginBottom: 8 },
  dynamicRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  removeBtn: { color: '#FF3B30', fontSize: 16, marginLeft: 10, paddingHorizontal: 4 },
  addBtn: { color: '#FF7A59', fontWeight: '600', marginTop: 4 },
  submitBtn: { backgroundColor: '#FF7A59', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 28 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

export default AddRecipeScreen;