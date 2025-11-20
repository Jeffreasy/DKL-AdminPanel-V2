// src/api/types/content.types.ts

export type PartnerType = 'partner' | 'sponsor';

export interface Sponsor {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;      // Let op: logo_url
  website_url?: string;   // Let op: website_url
  order_number?: number;
  is_active: boolean;
  visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface Partner {
  id: string;
  name: string;
  description?: string;
  logo?: string;          // Let op: logo
  website?: string;       // Let op: website
  tier?: string;          // Specifiek voor partners
  since?: string;         // Specifiek voor partners
  visible: boolean;
  order_number?: number;
  created_at: string;
  updated_at: string;
}

export interface ImageUploadResponse {
  url: string;
  public_id: string;
  original_filename: string;
}
export interface Album {
  id: string;
  title: string;
  description?: string;
  visible: boolean;
  cover_photo_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  url: string;
  public_id: string;
  original_filename: string;
  created_at: string;
  updated_at: string;
}

export interface AlbumPhoto {
  id: string;
  album_id: string;
  photo_id: string;
  order?: number;
  created_at: string;
}

export interface CreateAlbumRequest {
  title: string;
  description?: string;
  visible?: boolean;
}

export interface AddPhotoToAlbumRequest {
  album_id: string;
  photo_id: string;
  order?: number;
}

export interface Video {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnail_url?: string;
  video_id?: string;
  public_id?: string;
  original_filename?: string;
  duration?: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface RadioRecording {
  id: string;
  title: string;
  description?: string;
  url: string;
  public_id: string;
  original_filename: string;
  duration?: number;
  date?: string;
  visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateVideoRequest {
  title: string;
  description?: string;
  url: string;
  thumbnail_url?: string;
  video_id?: string;
  visible?: boolean;
}

export interface CreateRadioRecordingRequest {
  title: string;
  description?: string;
  url: string;
  date?: string;
  visible?: boolean;
}