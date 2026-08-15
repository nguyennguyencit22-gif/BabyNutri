import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { launchCamera, launchImageLibrary, ImagePickerResponse, Asset } from 'react-native-image-picker';
import { API_BASE_URL, getAuthToken } from './api';

export type PickedImage = { uri: string; fileName: string; type: string };

const pickerOptions = {
  mediaType: 'photo' as const,
  quality: 0.8 as const,
  includeBase64: false,
  saveToPhotos: true,
};

async function ensureCameraPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  try {
    const already = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
    if (already) return true;
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'BabyNutri needs access to your camera to take food and article photos.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('Camera permission request error:', err);
    return false;
  }
}

async function requestGalleryPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  if (Platform.Version >= 33) {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        {
          title: 'Photo Library Permission',
          message: 'BabyNutri needs access to your photos to select recipe images.',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (e) {
      console.warn('Media permission error:', e);
      return true;
    }
  }
  return true;
}

function extractAsset(response: ImagePickerResponse): Asset | null {
  if (response.didCancel) return null;
  if (response.errorCode) {
    console.warn('ImagePicker errorCode:', response.errorCode, response.errorMessage);
    if (response.errorCode === 'camera_unavailable') {
      Alert.alert('Camera Unavailable', 'Camera is not available on this device.');
    } else if (response.errorCode === 'permission') {
      Alert.alert('Permission Required', 'Please grant Camera / Photo permissions in device settings.');
    } else {
      Alert.alert('Photo Error', response.errorMessage || 'Unable to open camera or gallery.');
    }
    return null;
  }
  return response.assets?.[0] || null;
}

function toPickedImage(asset: Asset | null): PickedImage | null {
  if (!asset?.uri) return null;
  return {
    uri: asset.uri,
    fileName: asset.fileName || `photo_${Date.now()}.jpg`,
    type: asset.type || 'image/jpeg',
  };
}

export const imagePickerService = {
  pickFromCamera: async (): Promise<PickedImage | null> => {
    const hasPermission = await ensureCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Please grant Camera permission to take photos.');
      return null;
    }
    const response = await launchCamera(pickerOptions);
    return toPickedImage(extractAsset(response));
  },

  pickFromGallery: async (): Promise<PickedImage | null> => {
    await requestGalleryPermission();
    const response = await launchImageLibrary(pickerOptions);
    return toPickedImage(extractAsset(response));
  },

  upload: async (image: PickedImage): Promise<string> => {
    try {
      const token = await getAuthToken();
      const formData = new FormData();
      const fileUri = Platform.OS === 'android' ? image.uri : image.uri.replace('file://', '');

      formData.append('image', {
        uri: fileUri,
        name: image.fileName || `photo_${Date.now()}.jpg`,
        type: image.type || 'image/jpeg',
      } as any);

      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/uploads/image`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.url) return data.url;
      }

      // Fallback: If server upload returned non-200, return local file uri directly so UI is never blocked
      return image.uri;
    } catch (err) {
      console.warn('Upload image network fallback to local uri:', err);
      return image.uri;
    }
  },
};
