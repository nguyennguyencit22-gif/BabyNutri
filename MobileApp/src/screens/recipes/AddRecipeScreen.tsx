import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/common/AppIcon';
import ImageSourcePicker from '../../components/common/ImageSourcePicker';
import { imagePickerService } from '../../services/upload.service';
import { recipeService, RecipeMetadata } from '../../services/recipe.service';
import { IngredientInput, RecipeStepItem } from '../../types/recipe';
import { useAppTheme } from '../../theme/useAppTheme';
import { ChipSelectRow, RECIPE_MEAL_TYPES, RECIPE_WEANING_METHODS, RECIPE_DIETARY_NEEDS, RECIPE_OCCASIONS, toOptionNames } from '../../components/recipes/RecipeFieldChips';

const DEFAULT_FOOD_IMAGE = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600';

const AddRecipeScreen = ({ navigation }: any) => {
  const { colors, isDark } = useAppTheme();
  const formData = useRef({
    name: '',
    description: '',
    calories: '',
    monthAge: '',
    cookingTime: '',
    prepTime: '',
    serves: '1',
    protein: '',
    fat: '',
    carbohydrate: '',
  });

  const [imageUrl, setImageUrl] = useState('');
  const [ingredients, setIngredients] = useState<IngredientInput[]>([{ name: '', quantity: '' }]);
  const [steps, setSteps] = useState<RecipeStepItem[]>([{ description: '', imageUrl: '' }]);
  const [submitting, setSubmitting] = useState(false);

  const [mealTypes, setMealTypes] = useState(RECIPE_MEAL_TYPES);
  const [weaningMethods, setWeaningMethods] = useState(RECIPE_WEANING_METHODS);
  const [dietaryNeedsList, setDietaryNeedsList] = useState(RECIPE_DIETARY_NEEDS);
  const [occasionsList, setOccasionsList] = useState(RECIPE_OCCASIONS);

  const [mealTypeName, setMealTypeName] = useState('');
  const [weaningMethod, setWeaningMethod] = useState('');
  const [dietaryNeeds, setDietaryNeeds] = useState('');
  const [occasion, setOccasion] = useState('');

  useEffect(() => {
    recipeService.getMeta().then((meta: RecipeMetadata) => {
      if (meta.mealTypes?.length) setMealTypes(meta.mealTypes);
      if (meta.weaningMethods?.length) setWeaningMethods(meta.weaningMethods);
      if (meta.dietaryNeeds?.length) setDietaryNeedsList(meta.dietaryNeeds);
      if (meta.occasions?.length) setOccasionsList(meta.occasions);
    }).catch((e) => console.warn('Could not load recipe meta:', e));
  }, []);

  const updateIngredient = (index: number, field: 'name' | 'quantity', value: string) => {
    ingredients[index][field] = value;
  };
  const addIngredient = () => setIngredients([...ingredients, { name: '', quantity: '' }]);
  const removeIngredient = (index: number) => setIngredients(ingredients.filter((_, i) => i !== index));

  const updateStepDescription = (index: number, value: string) => {
    steps[index].description = value;
  };
  const updateStepImage = (index: number, value: string) => {
    const next = [...steps];
    next[index] = { ...next[index], imageUrl: value };
    setSteps(next);
  };
  const handleStepPhotoPick = async (index: number, source: 'camera' | 'gallery') => {
    try {
      const img = source === 'camera'
        ? await imagePickerService.pickFromCamera()
        : await imagePickerService.pickFromGallery();
      if (!img) return;
      const url = await imagePickerService.upload(img);
      const updated = [...steps];
      updated[index] = { ...updated[index], imageUrl: url };
      setSteps(updated);
    } catch (e) {
      console.warn('Step photo pick error:', e);
    }
  };
  const addStep = () => setSteps([...steps, { description: '', imageUrl: '' }]);
  const removeStep = (index: number) => setSteps(steps.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    const { name, calories, monthAge, cookingTime, prepTime, serves, protein, fat, carbohydrate } = formData.current;
    if (!name.trim() || !calories || !monthAge) {
      Alert.alert('Missing Fields', 'Please fill in Name, Calories, and Target Age.');
      return;
    }

    const validIngredients = ingredients
      .map((i) => i.name.trim())
      .filter((n) => n.length > 0);

    const validSteps = steps
      .map((s, idx) => ({ step_number: idx + 1, description: s.description.trim(), imageUrl: s.imageUrl?.trim() || undefined }))
      .filter((s) => s.description.length > 0);

    if (validIngredients.length === 0) {
      Alert.alert('Missing Ingredients', 'Please add at least one ingredient.');
      return;
    }

    if (validSteps.length === 0) {
      Alert.alert('Missing Steps', 'Please add at least one cooking step.');
      return;
    }

    const selectedMealObj = mealTypes.find((m) => m.name === mealTypeName);
    const selectedWeaningObj = weaningMethods.find((w) => w.name === weaningMethod);
    const selectedDietObj = dietaryNeedsList.find((d) => d.name === dietaryNeeds);
    const selectedOccasionObj = occasionsList.find((o) => o.name === occasion);

    setSubmitting(true);
    try {
      await recipeService.create({
        name: name.trim(),
        description: formData.current.description.trim() || 'Nutritious recipe for babies.',
        imageUrl: imageUrl.trim() || DEFAULT_FOOD_IMAGE,
        calories: Number(calories) || 0,
        monthAge: Number(monthAge) || 6,
        mealTypeId: selectedMealObj?.id,
        weaningMethodId: selectedWeaningObj?.id,
        dietaryNeedsId: selectedDietObj?.id,
        occasionId: selectedOccasionObj?.id,
        weaningMethod: weaningMethod || undefined,
        dietaryNeeds: dietaryNeeds || undefined,
        occasion: occasion || undefined,
        cookingTime: Number(cookingTime) || 0,
        prepTime: Number(prepTime) || 0,
        serves: Number(serves) || 1,
        protein: Number(protein) || 0,
        fat: Number(fat) || 0,
        carbohydrate: Number(carbohydrate) || 0,
        ingredients: ingredients.filter((i) => i.name.trim()),
        steps: steps
          .filter((s) => s.description.trim())
          .map((s) => ({ description: s.description.trim(), imageUrl: s.imageUrl?.trim() || undefined })),
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <View style={[styles.headerBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon source="arrow-left" size={20} color="#FF6B4A" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Add New Recipe</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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

      <Text style={[styles.label, { color: colors.textSoft }]}>Cover Photo</Text>
      {!!imageUrl && (
        <Image source={{ uri: imageUrl }} style={styles.coverPreview} resizeMode="cover" />
      )}
      <ImageSourcePicker onUploaded={setImageUrl} isDark={isDark} />
      <TextInput
        style={inputStyle}
        value={imageUrl}
        onChangeText={setImageUrl}
        placeholder="...or paste an image link"
        placeholderTextColor={colors.textSoft}
      />

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

      <Text style={[styles.label, { color: colors.textSoft }]}>Recipe Type</Text>
      <ChipSelectRow options={toOptionNames(mealTypes)} value={mealTypeName} onChange={setMealTypeName} colors={colors} isDark={isDark} />

      <Text style={[styles.label, { color: colors.textSoft }]}>Weaning Method</Text>
      <ChipSelectRow options={toOptionNames(weaningMethods)} value={weaningMethod} onChange={setWeaningMethod} colors={colors} isDark={isDark} />

      <Text style={[styles.label, { color: colors.textSoft }]}>Dietary Needs</Text>
      <ChipSelectRow options={toOptionNames(dietaryNeedsList)} value={dietaryNeeds} onChange={setDietaryNeeds} colors={colors} isDark={isDark} />

      <Text style={[styles.label, { color: colors.textSoft }]}>Occasion</Text>
      <ChipSelectRow options={toOptionNames(occasionsList)} value={occasion} onChange={setOccasion} colors={colors} isDark={isDark} />

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
            <Icon source="close-circle-outline" size={22} color="#FF5F70" />
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity onPress={addIngredient}>
        <Text style={styles.addBtn}>+ Add Ingredient</Text>
      </TouchableOpacity>

      <Text style={[styles.section, { color: colors.text }]}>Cooking Steps</Text>
      {steps.map((step, i) => (
        <View key={i} style={[styles.stepCard, { backgroundColor: isDark ? '#3A2E31' : '#FFF6F3', borderColor: colors.border }]}>
          <View style={styles.dynamicRow}>
            <View style={styles.stepNumberBadge}>
              <Text style={styles.stepNumberText}>{i + 1}</Text>
            </View>
            <TextInput
              style={[inputStyle, styles.flex1, { marginRight: 8 }]}
              defaultValue={step.description}
              onChangeText={(v) => updateStepDescription(i, v)}
              placeholder={`Describe step ${i + 1}`}
              placeholderTextColor={colors.textSoft}
              multiline
            />
            <TouchableOpacity onPress={() => removeStep(i)}>
              <Icon source="close-circle-outline" size={22} color="#FF5F70" />
            </TouchableOpacity>
          </View>

          {!!step.imageUrl && (
            <Image source={{ uri: step.imageUrl }} style={styles.stepImagePreview} resizeMode="cover" />
          )}
          <View style={styles.stepPhotoRow}>
            <TouchableOpacity
              onPress={() => handleStepPhotoPick(i, 'camera')}
              style={[styles.stepMiniBtn, { backgroundColor: isDark ? '#4A3236' : '#FFF0F2', borderColor: isDark ? '#5A3D42' : '#FFE4E6' }]}
              activeOpacity={0.8}
            >
              <Icon source="camera" size={14} color="#FF5F70" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleStepPhotoPick(i, 'gallery')}
              style={[styles.stepMiniBtn, { backgroundColor: isDark ? '#4A3236' : '#FFF0F2', borderColor: isDark ? '#5A3D42' : '#FFE4E6' }]}
              activeOpacity={0.8}
            >
              <Icon source="book-open-outline" size={14} color="#FF5F70" />
            </TouchableOpacity>
            <TextInput
              style={[styles.stepPhotoInput, { color: colors.text }]}
              value={step.imageUrl || ''}
              onChangeText={(v) => updateStepImage(i, v)}
              placeholder="Take/pick a photo, or paste a link"
              placeholderTextColor={colors.textSoft}
            />
          </View>
        </View>
      ))}
      <TouchableOpacity onPress={addStep}>
        <Text style={styles.addBtn}>+ Add Step</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.submitText}>{submitting ? 'Saving...' : 'Save Recipe'}</Text>
      </TouchableOpacity>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  content: { padding: 18, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, borderWidth: 1 },
  multiline: { height: 80, textAlignVertical: 'top' },
  coverPreview: { width: '100%', height: 160, borderRadius: 12, marginBottom: 8, backgroundColor: '#EEE' },
  rowInputs: { flexDirection: 'row', justifyContent: 'space-between' },
  half: { width: '48%' },
  third: { width: '31%' },
  section: { fontSize: 16, fontWeight: '700', marginTop: 20, marginBottom: 8 },
  dynamicRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  removeBtn: { color: '#FF3B30', fontSize: 16, marginLeft: 10, paddingHorizontal: 4 },
  addBtn: { color: '#FF7A59', fontWeight: '600', marginTop: 4 },
  stepCard: { borderRadius: 14, borderWidth: 1, padding: 10, marginBottom: 10 },
  stepNumberBadge: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#FF7A59', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  stepNumberText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  stepImagePreview: { width: '100%', height: 120, borderRadius: 10, marginBottom: 8 },
  stepPhotoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 2 },
  stepMiniBtn: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  stepPhotoInput: { flex: 1, fontSize: 12, paddingVertical: 4 },
  submitBtn: { backgroundColor: '#FF7A59', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 28 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

export default AddRecipeScreen;