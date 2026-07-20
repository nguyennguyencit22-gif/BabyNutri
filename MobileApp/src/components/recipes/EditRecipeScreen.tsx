import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { recipeService } from '../../services/recipe.service';

const EditRecipeScreen = ({ route, navigation }: any) => {
  const { id } = route.params;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [calories, setCalories] = useState('');
  const [monthAge, setMonthAge] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [prepTime, setPrepTime] = useState('');

  useEffect(() => {
    recipeService.getById(id).then((r) => {
      setName(r.name);
      setDescription(r.description);
      setImageUrl(r.image_url);
      setCalories(String(r.calories));
      setMonthAge(String(r.month_age));
      setCookingTime(String(r.cooking_time));
      setPrepTime(String(r.prep_time));
    }).catch((e) => console.error(e)).finally(() => setLoading(false));
  }, [id]);

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
      });
      Alert.alert('Thành công', 'Đã cập nhật công thức', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) {
      console.error('Update recipe error:', e);
      Alert.alert('Lỗi', 'Không thể cập nhật, thử lại sau');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#FF7A59" /></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Tên món</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Mô tả</Text>
      <TextInput style={[styles.input, styles.multiline]} value={description} onChangeText={setDescription} multiline />

      <Text style={styles.label}>Ảnh (URL)</Text>
      <TextInput style={styles.input} value={imageUrl} onChangeText={setImageUrl} />

      <Text style={styles.label}>Calories</Text>
      <TextInput style={styles.input} value={calories} onChangeText={setCalories} keyboardType="numeric" />

      <Text style={styles.label}>Độ tuổi (tháng)</Text>
      <TextInput style={styles.input} value={monthAge} onChangeText={setMonthAge} keyboardType="numeric" />

      <Text style={styles.label}>Thời gian chuẩn bị (phút)</Text>
      <TextInput style={styles.input} value={prepTime} onChangeText={setPrepTime} keyboardType="numeric" />

      <Text style={styles.label}>Thời gian nấu (phút)</Text>
      <TextInput style={styles.input} value={cookingTime} onChangeText={setCookingTime} keyboardType="numeric" />

      <TouchableOpacity style={styles.submitBtn} onPress={handleSave} disabled={submitting}>
        <Text style={styles.submitText}>{submitting ? 'Đang lưu...' : 'Lưu thay đổi'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 18, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '600', color: '#6B6B6B', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, borderWidth: 1, borderColor: '#EEE' },
  multiline: { height: 80, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: '#FF7A59', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 28 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

export default EditRecipeScreen;