import { PermissionsAndroid, Platform } from 'react-native';
import { launchCamera, launchImageLibrary, ImagePickerResponse, Asset } from 'react-native-image-picker';
import api from './api';

export type PickedImage = { uri: string; fileName: string; type: string };

const pickerOptions = { mediaType: 'photo' as const, quality: 0.8 as const, includeBase64: false };

function extractAsset(response: ImagePickerResponse): Asset | null {
  if (response.didCancel || response.errorCode) return null;
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

// react-native-image-picker's own automatic permission check doesn't
// reliably surface the system prompt on first use — request it ourselves
// first so the user actually gets asked instead of the camera silently
// doing nothing.
async function ensureCameraPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const already = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
  if (already) return true;
  const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

export const imagePickerService = {
  pickFromCamera: async (): Promise<PickedImage | null> => {
    const hasPermission = await ensureCameraPermission();
    if (!hasPermission) throw new Error('CAMERA_PERMISSION_DENIED');
    const response = await launchCamera(pickerOptions);
    return toPickedImage(extractAsset(response));
  },

  pickFromGallery: async (): Promise<PickedImage | null> => {
    const response = await launchImageLibrary(pickerOptions);
    return toPickedImage(extractAsset(response));
  },

  upload: async (image: PickedImage): Promise<string> => {
    const formData = new FormData();
    formData.append('image', {
      uri: image.uri,
      name: image.fileName,
      type: image.type,
    } as unknown as Blob);

    const res = await api.post<{ url: string }>('/uploads/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.url;
  },
};
