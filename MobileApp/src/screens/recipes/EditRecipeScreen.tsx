import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, Alert, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/common/AppIcon';
import ImageSourcePicker from '../../components/common/ImageSourcePicker';
import { recipeService, RecipeMetadata } from '../../services/recipe.service';
import { useAppTheme } from '../../theme/useAppTheme';
import { ChipSelectRow, RECIPE_MEAL_TYPES, RECIPE_WEANING_METHODS, RECIPE_DIETARY_NEEDS, RECIPE_OCCASIONS, toOptionNames } from '../../components/recipes/RecipeFieldChips';

const PRESET_PUBLIC_IMAGES = [
  { label: 'Pumpkin Puree', url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600', icon: 'food-apple' },
  { label: 'Brekkie Bowl', url: 'https://images.unsplash.com/photo-1682622110332-d50f50b7146d?w=600', icon: 'bowl-mix' },
  { label: 'Yogurt Pots', url: 'https://images.unsplash.com/photo-1753173302910-8470505e6994?w=600', icon: 'cup-water' },
  { label: 'Scrambly Eggs', url: 'https://images.unsplash.com/photo-1687630433865-f86f07be989a?w=600', icon: 'egg' },
  { label: 'Cheesy Pasta', url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600', icon: 'pasta' },
  { label: 'Chicken Curry', url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600', icon: 'food-variant' },
  { label: 'Avocado Bowl', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600', icon: 'avocado' },
];

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
  const [mealTypeName, setMealTypeName] = useState('');
  const [weaningMethod, setWeaningMethod] = useState('');
  const [dietaryNeeds, setDietaryNeeds] = useState('');
  const [occasion, setOccasion] = useState('');

  const [mealTypes, setMealTypes] = useState(RECIPE_MEAL_TYPES);
  const [weaningMethods, setWeaningMethods] = useState(RECIPE_WEANING_METHODS);
  const [dietaryNeedsList, setDietaryNeedsList] = useState(RECIPE_DIETARY_NEEDS);
  const [occasionsList, setOccasionsList] = useState(RECIPE_OCCASIONS);

  const fetchRecipeDetail = useCallback(() => {
    setLoading(true);
    Promise.all([
      recipeService.getById(id),
      recipeService.getMeta().catch(() => null),
    ])
      .then(([r, meta]) => {
        if (meta) {
          if (meta.mealTypes?.length) setMealTypes(meta.mealTypes);
          if (meta.weaningMethods?.length) setWeaningMethods(meta.weaningMethods);
          if (meta.dietaryNeeds?.length) setDietaryNeedsList(meta.dietaryNeeds);
          if (meta.occasions?.length) setOccasionsList(meta.occasions);
        }
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
        setMealTypeName(r.mealType || '');
        setWeaningMethod(r.weaning_method || '');
        setDietaryNeeds(r.dietary_needs || '');
        setOccasion(r.occasion || '');
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
      const selectedMealType = mealTypes.find((m) => m.name === mealTypeName);
      const selectedWeaning = weaningMethods.find((w) => w.name === weaningMethod);
      const selectedDiet = dietaryNeedsList.find((d) => d.name === dietaryNeeds);
      const selectedOccasion = occasionsList.find((o) => o.name === occasion);

      await recipeService.update(id, {
        name,
        description,
        imageUrl,
        calories: Number(calories),
        monthAge: Number(monthAge),
        mealTypeId: selectedMealType?.id,
        weaningMethodId: selectedWeaning?.id,
        dietaryNeedsId: selectedDiet?.id,
        occasionId: selectedOccasion?.id,
        cookingTime: Number(cookingTime),
        prepTime: Number(prepTime),
        protein: Number(protein),
        fat: Number(fat),
        carbohydrate: Number(carbohydrate),
        weaningMethod: weaningMethod || undefined,
        dietaryNeeds: dietaryNeeds || undefined,
        occasion: occasion || undefined,
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <View style={[styles.headerBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon source="arrow-left" size={20} color="#FF6B4A" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Recipe</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
        <Text style={[styles.label, { color: colors.textSoft }]}>Recipe Name</Text>
        <TextInput style={inputStyle} defaultValue={name} onChangeText={setName} placeholderTextColor={colors.textSoft} />

        <Text style={[styles.label, { color: colors.textSoft }]}>Description</Text>
        <TextInput style={[inputStyle, styles.multiline]} defaultValue={description} onChangeText={setDescription} multiline placeholderTextColor={colors.textSoft} />

        <Text style={[styles.label, { color: colors.textSoft }]}>Cover Image</Text>
        <ImageSourcePicker onUploaded={setImageUrl} isDark={isDark} />
        <TextInput style={inputStyle} value={imageUrl} onChangeText={setImageUrl} placeholder="...or paste an image URL" placeholderTextColor={colors.textSoft} />

        <Text style={[styles.label, { color: colors.textSoft, marginTop: 10 }]}>Select from Preset Photos:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {PRESET_PUBLIC_IMAGES.map((img) => {
              const isSelected = imageUrl === img.url;
              return (
                <TouchableOpacity
                  key={img.label}
                  style={[
                    styles.presetChip,
                    { backgroundColor: isSelected ? '#FF5F70' : colors.surface, borderColor: isSelected ? '#FF5F70' : colors.border },
                  ]}
                  onPress={() => setImageUrl(img.url)}
                  activeOpacity={0.8}
                >
                  <Icon source={img.icon} size={15} color={isSelected ? '#FFFFFF' : '#FF5F70'} />
                  <Text style={[styles.presetChipText, { color: isSelected ? '#FFFFFF' : colors.text }]}>{img.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {imageUrl ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: imageUrl }} style={styles.imagePreview} />
          </View>
        ) : null}

        <View style={styles.rowInputs}>
          <View style={styles.half}>
            <Text style={[styles.label, { color: colors.textSoft }]}>Calories (kcal)</Text>
            <TextInput style={inputStyle} defaultValue={calories} onChangeText={setCalories} keyboardType="numeric" placeholderTextColor={colors.textSoft} />
          </View>
          <View style={styles.half}>
            <Text style={[styles.label, { color: colors.textSoft }]}>Target Age (mos)</Text>
            <TextInput style={inputStyle} defaultValue={monthAge} onChangeText={setMonthAge} keyboardType="numeric" placeholderTextColor={colors.textSoft} />
          </View>
        </View>

        <View style={styles.rowInputs}>
          <View style={styles.half}>
            <Text style={[styles.label, { color: colors.textSoft }]}>Prep Time (mins)</Text>
            <TextInput style={inputStyle} defaultValue={prepTime} onChangeText={setPrepTime} keyboardType="numeric" placeholderTextColor={colors.textSoft} />
          </View>
          <View style={styles.half}>
            <Text style={[styles.label, { color: colors.textSoft }]}>Cook Time (mins)</Text>
            <TextInput style={inputStyle} defaultValue={cookingTime} onChangeText={setCookingTime} keyboardType="numeric" placeholderTextColor={colors.textSoft} />
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
            <Text style={[styles.label, { color: colors.textSoft }]}>Carbs (g)</Text>
            <TextInput style={inputStyle} defaultValue={carbohydrate} onChangeText={setCarbohydrate} keyboardType="numeric" placeholderTextColor={colors.textSoft} />
          </View>
        </View>

        <Text style={[styles.label, { color: colors.textSoft }]}>Meal Type</Text>
        <ChipSelectRow options={toOptionNames(mealTypes)} value={mealTypeName} onChange={setMealTypeName} colors={colors} isDark={isDark} />

        <Text style={[styles.label, { color: colors.textSoft }]}>Weaning Method</Text>
        <ChipSelectRow options={toOptionNames(weaningMethods)} value={weaningMethod} onChange={setWeaningMethod} colors={colors} isDark={isDark} />

        <Text style={[styles.label, { color: colors.textSoft }]}>Dietary Needs</Text>
        <ChipSelectRow options={toOptionNames(dietaryNeedsList)} value={dietaryNeeds} onChange={setDietaryNeeds} colors={colors} isDark={isDark} />

        <Text style={[styles.label, { color: colors.textSoft }]}>Occasion</Text>
        <ChipSelectRow options={toOptionNames(occasionsList)} value={occasion} onChange={setOccasion} colors={colors} isDark={isDark} />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSave} disabled={submitting}>
          <Text style={styles.submitText}>{submitting ? 'Saving...' : 'Save Changes'}</Text>
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

export default EditRecipeScreen;