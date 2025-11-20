import apiClient from '../../api/axios.client';
import { ImageUploadResponse } from '../../api/types/content.types';

export const mediaService = {
  uploadImage: async (file: File): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    // Backend verwacht vaak 'image' of 'file'.
    // Check even je ImageHandler als upload faalt.
    formData.append('image', file);

    const { data } = await apiClient.post<ImageUploadResponse>('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  uploadAudio: async (file: File): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    formData.append('audio', file);

    const { data } = await apiClient.post<ImageUploadResponse>('/audio/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  }
};