import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsService } from '@/services/content/cms.service';
import { mediaService } from '@/services/content/media.service';
import { Video, CreateVideoRequest } from '@/api/types/content.types';
import { Modal } from '@/components/ui/modal';
import {
  VideoCameraIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeSlashIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

// Initial state for the form
const initialFormState: Partial<Video> = {
  title: '',
  description: '',
  url: '',
  visible: true,
  thumbnail_url: '',
  video_id: '' // Optional: specific YouTube/Vimeo ID if needed manually
};

export const VideosPage: React.FC = () => {
  const queryClient = useQueryClient();

  // --- State Management ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Video>>(initialFormState);
  const [uploading, setUploading] = useState(false);

  // --- Queries ---
  const { data: videos, isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: cmsService.getVideos
  });

  // --- Mutations ---
  const createMutation = useMutation({
    mutationFn: cmsService.createVideo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      handleClose();
    },
    onError: (error: unknown) => {
      let message = 'Onbekende fout';
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'object' && error !== null && 'response' in error) {
        message = (error as { response?: { data?: { error?: string } } }).response?.data?.error || message;
      }
      alert(`Fout bij aanmaken: ${message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Video> }) =>
      cmsService.updateVideo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      handleClose();
    },
    onError: (error: unknown) => {
      let message = 'Onbekende fout';
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'object' && error !== null && 'response' in error) {
        message = (error as { response?: { data?: { error?: string } } }).response?.data?.error || message;
      }
      alert(`Fout bij bijwerken: ${message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: cmsService.deleteVideo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
    onError: (error: unknown) => {
      let message = 'Onbekende fout';
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'object' && error !== null && 'response' in error) {
        message = (error as { response?: { data?: { error?: string } } }).response?.data?.error || message;
      }
      alert(`Kan video niet verwijderen: ${message}`);
    }
  });

  // --- Handlers ---

  // Handle Image Upload for Thumbnail
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const response = await mediaService.uploadImage(e.target.files[0]);
        setFormData(prev => ({ ...prev, thumbnail_url: response.url }));
      } catch (error) {
        alert("Uploaden van afbeelding mislukt.");
      } finally {
        setUploading(false);
      }
    }
  };

  // Open Modal for New Video
  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  // Open Modal for Editing
  const handleOpenEdit = (video: Video) => {
    setEditingId(video.id);
    setFormData({
      title: video.title,
      description: video.description || '',
      url: video.url,
      visible: video.visible,
      thumbnail_url: video.thumbnail_url || '',
      video_id: video.video_id || ''
    });
    setIsModalOpen(true);
  };

  // Close Modal & Reset
  const handleClose = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  // Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData as CreateVideoRequest);
    }
  };

  // Delete Confirmation
  const handleDelete = (id: string) => {
    if (window.confirm('Weet je zeker dat je deze video wilt verwijderen?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* --- Header Section --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Video's</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Beheer externe videolinks en thumbnails.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Nieuwe Video
        </button>
      </div>

      {/* --- Content Grid --- */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Video's laden...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos?.map((video) => (
            <div key={video.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group flex flex-col">

              {/* Thumbnail Area */}
              <div className="aspect-video bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                    <VideoCameraIcon className="w-12 h-12" />
                  </div>
                )}

                {/* Visibility Badge */}
                {!video.visible && (
                  <div className="absolute top-2 right-2 bg-red-500/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <EyeSlashIcon className="w-3 h-3" /> Verborgen
                  </div>
                )}
              </div>

              {/* Content Area */}
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 dark:text-white truncate mb-1" title={video.title}>
                  {video.title}
                </h3>
                <a
                  href={video.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-500 hover:underline truncate block mb-3"
                >
                  {video.url}
                </a>

                {video.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
                    {video.description}
                  </p>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 mt-auto pt-3 border-t border-gray-100 dark:border-gray-700 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                   <button
                     onClick={() => handleOpenEdit(video)}
                     className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                     title="Bewerken"
                   >
                     <PencilIcon className="w-5 h-5"/>
                   </button>
                   <button
                     onClick={() => handleDelete(video.id)}
                     className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                     title="Verwijderen"
                   >
                     <TrashIcon className="w-5 h-5"/>
                   </button>
                </div>
              </div>
            </div>
          ))}

          {videos?.length === 0 && (
            <div className="col-span-full text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                <VideoCameraIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Geen video's gevonden</h3>
                <p className="text-gray-500 text-sm mt-1">Voeg een nieuwe video link toe om te beginnen.</p>
            </div>
          )}
        </div>
      )}

      {/* --- Create/Edit Modal --- */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingId ? "Video Bewerken" : "Nieuwe Video"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
           {/* Title */}
           <div>
             <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Titel *</label>
             <input
               className="w-full border rounded-md p-2 dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
               required
               value={formData.title}
               onChange={e => setFormData({...formData, title: e.target.value})}
               placeholder="Bijv. Aftermovie 2024"
             />
           </div>

           {/* URL */}
           <div>
             <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Video URL *</label>
             <input
               className="w-full border rounded-md p-2 dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
               required
               value={formData.url}
               onChange={e => setFormData({...formData, url: e.target.value})}
               placeholder="https://youtube.com/..."
             />
           </div>

           {/* Video ID (Optional) */}
           <div>
             <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Video ID (Optioneel)</label>
             <input
               className="w-full border rounded-md p-2 dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
               value={formData.video_id || ''}
               onChange={e => setFormData({...formData, video_id: e.target.value})}
               placeholder="Bijv. dQw4w9WgXcQ"
             />
             <p className="text-xs text-gray-500 mt-1">Meestal automatisch herkend, maar kan hier handmatig worden ingevuld.</p>
           </div>

           {/* Description */}
           <div>
             <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Beschrijving</label>
             <textarea
               className="w-full border rounded-md p-2 dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition-colors resize-none"
               rows={3}
               value={formData.description || ''}
               onChange={e => setFormData({...formData, description: e.target.value})}
             />
           </div>

           {/* Thumbnail Upload */}
           <div>
             <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Thumbnail</label>
             <div className="flex items-center gap-4">
               <label className="cursor-pointer flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                 <PhotoIcon className="w-5 h-5 mr-2 text-gray-400" />
                 <span>Kies afbeelding</span>
                 <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploading}
                 />
               </label>
               {uploading && <span className="text-xs text-blue-500 animate-pulse">Uploaden...</span>}
             </div>

             {formData.thumbnail_url && !uploading && (
               <div className="mt-3 relative w-full h-32 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                 <img src={formData.thumbnail_url} alt="Preview" className="w-full h-full object-contain" />
               </div>
             )}
           </div>

           {/* Visibility Toggle */}
           <div className="flex items-center gap-3 pt-2">
             <div className="relative inline-block w-10 h-6 align-middle select-none transition duration-200 ease-in">
                <input
                  type="checkbox"
                  name="toggle"
                  id="toggle"
                  checked={formData.visible}
                  onChange={e => setFormData({...formData, visible: e.target.checked})}
                  className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
             </div>
             <label htmlFor="toggle" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
               Zichtbaar op website
             </label>
           </div>

           {/* Modal Actions */}
           <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700 mt-4">
             <button
               type="button"
               onClick={handleClose}
               className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
             >
               Annuleren
             </button>
             <button
               type="submit"
               className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
               disabled={uploading || createMutation.isPending || updateMutation.isPending}
             >
               {(createMutation.isPending || updateMutation.isPending) ? 'Opslaan...' : 'Opslaan'}
             </button>
           </div>
        </form>
      </Modal>
    </div>
  );
};