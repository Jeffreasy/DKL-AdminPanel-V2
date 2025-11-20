// src/services/content/cms.service.ts
import apiClient from '../../api/axios.client';
import { Partner, Sponsor, Album, Photo, AlbumPhoto, CreateAlbumRequest, AddPhotoToAlbumRequest, Video, RadioRecording, CreateVideoRequest, CreateRadioRecordingRequest } from '../../api/types/content.types';

export const cmsService = {
  // --- Sponsors ---
  getSponsors: async () => {
    // Backend: GET /api/sponsors/admin
    const { data } = await apiClient.get<Sponsor[]>('/sponsors/admin');
    return data;
  },

  createSponsor: async (sponsor: Partial<Sponsor>) => {
    const { data } = await apiClient.post<Sponsor>('/sponsors', sponsor);
    return data;
  },

  updateSponsor: async (id: string, sponsor: Partial<Sponsor>) => {
    const { data } = await apiClient.put<Sponsor>(`/sponsors/${id}`, sponsor);
    return data;
  },

  deleteSponsor: async (id: string) => {
    return apiClient.delete(`/sponsors/${id}`);
  },

  // --- Partners ---
  getPartners: async () => {
    // Backend: GET /api/partners/admin
    const { data } = await apiClient.get<Partner[]>('/partners/admin');
    return data;
  },

  createPartner: async (partner: Partial<Partner>) => {
    const { data } = await apiClient.post<Partner>('/partners', partner);
    return data;
  },

  updatePartner: async (id: string, partner: Partial<Partner>) => {
    const { data } = await apiClient.put<Partner>(`/partners/${id}`, partner);
    return data;
  },

  deletePartner: async (id: string) => {
    return apiClient.delete(`/partners/${id}`);
  },

  // --- Albums ---
  getAlbums: async () => {
    // Backend: GET /api/albums/admin
    const { data } = await apiClient.get<Album[]>('/albums/admin');
    return data;
  },

  getAlbumById: async (id: string) => {
    // Backend: GET /api/albums/:id
    const { data } = await apiClient.get<Album>(`/albums/${id}`);
    return data;
  },

  createAlbum: async (album: CreateAlbumRequest) => {
    const { data } = await apiClient.post<Album>('/albums', album);
    return data;
  },

  updateAlbum: async (id: string, album: Partial<Album>) => {
    const { data } = await apiClient.put<Album>(`/albums/${id}`, album);
    return data;
  },

  deleteAlbum: async (id: string) => {
    return apiClient.delete(`/albums/${id}`);
  },

  // --- Photos ---
  getAlbumPhotos: async (albumId: string) => {
    // Backend: GET /api/albums/:id/photos
    const { data } = await apiClient.get<Photo[]>(`/albums/${albumId}/photos`);
    return data;
  },

  createPhotoEntity: async (photo: { url: string; public_id: string; original_filename: string }) => {
    const { data } = await apiClient.post<Photo>('/photos', photo);
    return data;
  },

  addPhotoToAlbum: async (request: AddPhotoToAlbumRequest) => {
    const { data } = await apiClient.post<AlbumPhoto>(`/albums/${request.album_id}/photos`, {
      photo_id: request.photo_id,
      order: request.order
    });
    return data;
  },

  removePhotoFromAlbum: async (albumId: string, photoId: string) => {
    return apiClient.delete(`/albums/${albumId}/photos/${photoId}`);
  },

  setCoverPhoto: async (albumId: string, photoId: string) => {
    const { data } = await apiClient.put<Album>(`/albums/${albumId}`, { cover_photo_id: photoId });
    return data;
  },

  // --- Videos ---
  getVideos: async () => {
    // Backend: GET /api/videos/admin
    const { data } = await apiClient.get<Video[]>('/videos/admin');
    return data;
  },

  createVideo: async (video: CreateVideoRequest) => {
    const { data } = await apiClient.post<Video>('/videos', video);
    return data;
  },

  updateVideo: async (id: string, video: Partial<Video>) => {
    const { data } = await apiClient.put<Video>(`/videos/${id}`, video);
    return data;
  },

  deleteVideo: async (id: string) => {
    return apiClient.delete(`/videos/${id}`);
  },

  // --- Radio Recordings ---
  getRadioRecordings: async () => {
    // Backend: GET /api/radio-recordings/admin
    const { data } = await apiClient.get<RadioRecording[]>('/radio-recordings/admin');
    return data;
  },

  createRadioRecording: async (recording: CreateRadioRecordingRequest) => {
    const { data } = await apiClient.post<RadioRecording>('/radio-recordings', recording);
    return data;
  },

  updateRadioRecording: async (id: string, recording: Partial<RadioRecording>) => {
    const { data } = await apiClient.put<RadioRecording>(`/radio-recordings/${id}`, recording);
    return data;
  },

  deleteRadioRecording: async (id: string) => {
    return apiClient.delete(`/radio-recordings/${id}`);
  }
};