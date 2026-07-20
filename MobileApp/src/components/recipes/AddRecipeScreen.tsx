import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { recipeService } from '../../services/recipe.service';
import { IngredientInput } from '../../types/recipe';

const AddRecipeScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [calories, setCalories] = useState('');
  const [monthAge, setMonthAge] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [serves, setServes] = useState('1');
  const [ingredients, setIngredients] = useState<IngredientInput[]>([{ name: '', quantity: '' }]);
  const [steps, setSteps] = useState<string[]>(['']);
  const [submitting, setSubmitting] = useState(false);

  const updateIngredient = (index: number, field: 'name' | 'quantity', value: string) => {
    const copy = [...ingredients];
    copy[index] = { ...copy[index], [field]: value };
    setIngredients(copy);
  };
  const addIngredient = () => setIngredients([...ingredients, { name: '', quantity: '' }]);
  const removeIngredient = (index: number) => setIngredients(ingredients.filter((_, i) => i !== index));

  const updateStep = (index: number, value: string) => {
    const copy = [...steps];
    copy[index] = value;
    setSteps(copy);
  };
  const addStep = () => setSteps([...steps, '']);
  const removeStep = (index: number) => setSteps(steps.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (!name.trim() || !calories.trim() || !monthAge.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên món, calories và độ tuổi (tháng)');
      return;
    }
    setSubmitting(true);
    try {
      await recipeService.create({
        name,
        description,
        imageUrl,
        calories: Number(calories),
        monthAge: Number(monthAge),
        cookingTime: Number(cookingTime) || 0,
        prepTime: Number(prepTime) || 0,
        serves: Number(serves) || 1,
        ingredients: ingredients.filter((i) => i.name.trim()),
        steps: steps.filter((s) => s.trim()),
      });
      Alert.alert('Thành công', 'Đã thêm công thức mới', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) {
      console.error('Create recipe error:', e);
      Alert.alert('Lỗi', 'Không thể tạo công thức, thử lại sau');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Tên món</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="VD: Cháo bí đỏ" />

      <Text style={styles.label}>Mô tả</Text>
      <TextInput style={[styles.input, styles.multiline]} value={description} onChangeText={setDescription} multiline placeholder="Mô tả ngắn về món ăn" />

      <Text style={styles.label}>Ảnh (URL)</Text>
      <TextInput style={styles.input} value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." />

      <View style={styles.rowInputs}>
        <View style={styles.third}>
          <Text style={styles.label}>Calories</Text>
          <TextInput style={styles.input} value={calories} onChangeText={setCalories} keyboardType="numeric" placeholder="120" />
        </View>
        <View style={styles.third}>
          <Text style={styles.label}>Độ tuổi (tháng)</Text>
          <TextInput style={styles.input} value={monthAge} onChangeText={setMonthAge} keyboardType="numeric" placeholder="7" />
        </View>
        <View style={styles.third}>
          <Text style={styles.label}>Khẩu phần</Text>
          <TextInput style={styles.input} value={serves} onChangeText={setServes} keyboardType="numeric" placeholder="1" />
        </View>
      </View>

      <View style={styles.rowInputs}>
        <View style={styles.half}>
          <Text style={styles.label}>Thời gian chuẩn bị (phút)</Text>
          <TextInput style={styles.input} value={prepTime} onChangeText={setPrepTime} keyboardType="numeric" placeholder="5" />
        </View>
        <View style={styles.half}>
          <Text style={styles.label}>Thời gian nấu (phút)</Text>
          <TextInput style={styles.input} value={cookingTime} onChangeText={setCookingTime} keyboardType="numeric" placeholder="10" />
        </View>
      </View>

      <Text style={styles.section}>Nguyên liệu</Text>
      {ingredients.map((ing, i) => (
        <View key={i} style={styles.dynamicRow}>
          <TextInput
            style={[styles.input, styles.flex2]}
            value={ing.name}
            onChangeText={(v) => updateIngredient(i, 'name', v)}
            placeholder="Tên nguyên liệu"
          />
          <TextInput
            style={[styles.input, styles.flex1, { marginLeft: 8 }]}
            value={ing.quantity}
            onChangeText={(v) => updateIngredient(i, 'quantity', v)}
            placeholder="Số lượng"
          />
          <TouchableOpacity onPress={() => removeIngredient(i)}>
            <Text style={styles.removeBtn}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity onPress={addIngredient}>
        <Text style={styles.addBtn}>+ Thêm nguyên liệu</Text>
      </TouchableOpacity>

      <Text style={styles.section}>Các bước nấu</Text>
      {steps.map((step, i) => (
        <View key={i} style={styles.dynamicRow}>
          <TextInput
            style={[styles.input, styles.flex1]}
            value={step}
            onChangeText={(v) => updateStep(i, v)}
            placeholder={`Bước ${i + 1}`}
          />
          <TouchableOpacity onPress={() => removeStep(i)}>
            <Text style={styles.removeBtn}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity onPress={addStep}>
        <Text style={styles.addBtn}>+ Thêm bước</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.submitText}>{submitting ? 'Đang lưu...' : 'Lưu công thức'}</Text>
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
  removeBtn: { color: '#FF3B30', fontSize: 16, marginLeft: 10 },
  addBtn: { color: '#FF7A59', fontWeight: '600', marginTop: 4 },
  submitBtn: { backgroundColor: '#FF7A59', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 28 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

export default AddRecipeScreen;