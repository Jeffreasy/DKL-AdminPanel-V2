import React, { useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { cmsService } from '@/services/content/cms.service';
import { mediaService } from '@/services/content/media.service';
import { Photo } from '@/api/types/content.types';
import { ArrowLeftIcon, PlusIcon, TrashIcon, StarIcon } from '@heroicons/react/24/outline';

export const AlbumDetailPage: React.FC = () => {
  const { albumId } = useParams<{ albumId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Queries
  const { data: album, isLoading: loadAlbum } = useQuery({
    queryKey: ['album', albumId],
    queryFn: () => cmsService.getAlbumById(albumId!),
    enabled: !!albumId
  });

  const { data: photos, isLoading: loadPhotos } = useQuery({
    queryKey: ['album-photos', albumId],
    queryFn: () => cmsService.getAlbumPhotos(albumId!),
    enabled: !!albumId
  });

  // Mutations
  const uploadMutation = useMutation({
    mutationFn: mediaService.uploadImage,
    onSuccess: (uploadResponse) => {
      createPhotoMutation.mutate(uploadResponse);
    }
  });

  const createPhotoMutation = useMutation({
    mutationFn: cmsService.createPhotoEntity,
    onSuccess: (photo) => {
      addToAlbumMutation.mutate({ album_id: albumId!, photo_id: photo.id });
    }
  });

  const addToAlbumMutation = useMutation({
    mutationFn: cmsService.addPhotoToAlbum,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['album-photos', albumId] });
      queryClient.invalidateQueries({ queryKey: ['album', albumId] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: ({ photoId }: { photoId: string }) => cmsService.removePhotoFromAlbum(albumId!, photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['album-photos', albumId] });
      queryClient.invalidateQueries({ queryKey: ['album', albumId] });
    }
  });

  const setCoverMutation = useMutation({
    mutationFn: ({ photoId }: { photoId: string }) => cmsService.setCoverPhoto(albumId!, photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['album', albumId] });
    }
  });

  // Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    if (window.confirm('Weet je zeker dat je deze foto wilt verwijderen?')) {
      deleteMutation.mutate({ photoId });
    }
  };

  const handleSetCover = (photoId: string) => {
    setCoverMutation.mutate({ photoId });
  };

  const isLoading = loadAlbum || loadPhotos;
  const isUploading = uploadMutation.isPending || createPhotoMutation.isPending || addToAlbumMutation.isPending;

  if (isLoading) {
    return <div className="text-center py-10 text-gray-500">Laden...</div>;
  }

  if (!album) {
    return <div className="text-center py-10 text-gray-500">Album niet gevonden.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/cms/albums')}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{album.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{album.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            multiple
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            {isUploading ? 'Uploaden...' : 'Foto Toevoegen'}
          </button>
        </div>
      </div>

      {/* Photos Grid */}
      {photos?.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          Geen foto's in dit album. Klik op "Foto Toevoegen" om te beginnen.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {photos?.map((photo: Photo) => (
            <div
              key={photo.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden group relative"
            >
              <div className="aspect-square bg-gray-100 dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                <img
                  src={photo.url}
                  alt={photo.original_filename}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{photo.original_filename}</p>
                <div className="flex justify-between items-center mt-2">
                  <button
                    onClick={() => handleSetCover(photo.id)}
                    disabled={album.cover_photo_id === photo.id || setCoverMutation.isPending}
                    className={`p-1 rounded-full ${
                      album.cover_photo_id === photo.id
                        ? 'text-yellow-500'
                        : 'text-gray-400 hover:text-yellow-500'
                    }`}
                    title="Als cover foto instellen"
                  >
                    <StarIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    disabled={deleteMutation.isPending}
                    className="p-1 text-red-600 hover:bg-red-50 rounded-full"
                    title="Foto verwijderen"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};