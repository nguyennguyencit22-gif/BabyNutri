import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, Alert, Image } from 'react-native';
import Icon from '../../components/common/AppIcon';
import { recipeService } from '../../services/recipe.service';
import { useAppTheme } from '../../theme/useAppTheme';

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
      <TextInput style={inputStyle} value={imageUrl} onChangeText={setImageUrl} placeholderTextColor={colors.textSoft} />

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