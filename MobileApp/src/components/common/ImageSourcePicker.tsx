import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import Icon from './AppIcon';
import { imagePickerService } from '../../services/upload.service';

type Props = {
  onUploaded: (url: string) => void;
  isDark: boolean;
};

// Lets an Expert pick a cover/step photo from their camera or gallery,
// uploads it to the backend, and hands the resulting URL back to the
// caller — an alternative to manually pasting an image link.
const ImageSourcePicker: React.FC<Props> = ({ onUploaded, isDark }) => {
  const [uploading, setUploading] = useState(false);

  const handlePick = async (source: 'camera' | 'gallery') => {
    try {
      const image = source === 'camera'
        ? await imagePickerService.pickFromCamera()
        : await imagePickerService.pickFromGallery();
      if (!image) return;

      setUploading(true);
      const url = await imagePickerService.upload(image);
      onUploaded(url);
    } catch (e) {
      console.error('Image upload error:', e);
      if (e instanceof Error && e.message === 'CAMERA_PERMISSION_DENIED') {
        Alert.alert('Camera Access Needed', 'Please allow camera access for BabyNutri in your device settings to take a photo.');
      } else {
        Alert.alert('Upload Failed', 'Unable to upload this photo right now. You can also paste an image link below.');
      }
    } finally {
      setUploading(false);
    }
  };

  const btnStyle = [styles.btn, { backgroundColor: isDark ? '#3A2E31' : '#FFF0F2', borderColor: isDark ? '#4A3236' : '#FFE2E6' }];

  return (
    <View style={styles.row}>
      <TouchableOpacity style={btnStyle} onPress={() => handlePick('camera')} disabled={uploading} activeOpacity={0.85}>
        <Icon source="camera" size={16} color="#FF5F70" />
        <Text style={styles.btnText}>Take Photo</Text>
      </TouchableOpacity>
      <TouchableOpacity style={btnStyle} onPress={() => handlePick('gallery')} disabled={uploading} activeOpacity={0.85}>
        <Icon source="book-open-outline" size={16} color="#FF5F70" />
        <Text style={styles.btnText}>Choose from Gallery</Text>
      </TouchableOpacity>
      {uploading && <ActivityIndicator size="small" color="#FF5F70" style={styles.spinner} />}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  btnText: { color: '#FF5F70', fontWeight: '700', fontSize: 12 },
  spinner: { marginLeft: 4 },
});

export default ImageSourcePicker;
