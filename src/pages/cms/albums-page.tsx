import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { cmsService } from '@/services/content/cms.service';
import { Album, CreateAlbumRequest } from '@/api/types/content.types';
import { Modal } from '@/components/ui/modal';
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

// Hulp types voor het formulier
type FormData = {
  title: string;
  description: string;
  visible: boolean;
};

const initialFormState: FormData = {
  title: '',
  description: '',
  visible: true,
};

export const AlbumsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>(initialFormState);

  // Queries
  const { data: albums, isLoading: loadAlbums } = useQuery({
    queryKey: ['albums'],
    queryFn: cmsService.getAlbums
  });

  // Mutations
  const createMutation = useMutation<Album, Error, CreateAlbumRequest>({
    mutationFn: (data: CreateAlbumRequest) => cmsService.createAlbum(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
      handleClose();
    }
  });

  const updateMutation = useMutation<Album, Error, { id: string, data: Partial<CreateAlbumRequest> }>({
    mutationFn: ({ id, data }: { id: string, data: Partial<CreateAlbumRequest> }) => cmsService.updateAlbum(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
      handleClose();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => cmsService.deleteAlbum(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    }
  });

  // Handlers
  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (album: Album) => {
    setEditingId(album.id);

    // Map data naar form state
    setFormData({
      title: album.title,
      description: album.description || '',
      visible: album.visible,
    });

    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Map form data naar API specific structure
    let payload: CreateAlbumRequest = {
      title: formData.title,
      description: formData.description,
      visible: formData.visible,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  // Render Helper
  const renderCard = (album: Album) => {
    return (
      <div
        key={album.id}
        className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col relative group cursor-pointer"
        onClick={() => navigate(`/cms/albums/${album.id}`)}
      >
        <div className="h-32 bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4 relative">
          {album.cover_photo_id ? (
            <span className="text-gray-600 text-sm">Cover Photo</span> // Placeholder for cover photo
          ) : (
            <span className="text-gray-400 text-xs">Geen cover foto</span>
          )}
          {!album.visible && (
            <span className="absolute top-2 right-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Verborgen</span>
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-bold text-gray-900 dark:text-white">{album.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{album.description}</p>

          {/* Action Buttons (Show on Hover) */}
          <div className="mt-auto flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEdit(album);
              }}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteMutation.mutate({ id: album.id });
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Albums</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Beheer de albums.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Toevoegen
        </button>
      </div>

      {/* Content */}
      {loadAlbums ? <div className="text-center py-10 text-gray-500">Laden...</div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {albums?.map((album: Album) => renderCard(album))}
          {albums?.length === 0 && <p className="col-span-full text-center text-gray-500 py-10">Geen albums gevonden.</p>}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingId ? 'Album Bewerken' : 'Nieuw Album'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Shared Fields */}
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Titel *</label>
            <input
              className="w-full border rounded-md p-2 dark:bg-gray-800 dark:border-gray-600"
              required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Beschrijving</label>
            <textarea
              className="w-full border rounded-md p-2 dark:bg-gray-800 dark:border-gray-600"
              rows={3}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-4 mt-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                checked={formData.visible}
                onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Zichtbaar</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              Annuleren
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {(createMutation.isPending || updateMutation.isPending) ? 'Opslaan...' : 'Opslaan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};