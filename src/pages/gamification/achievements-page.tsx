import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GamificationService } from '@/services/gamification/gamification.service';
import { mediaService } from '@/services/content/media.service';
import { Badge, BadgeRequest } from '@/api/types/gamification.types';
import { Modal } from '@/components/ui/modal';
import { 
  TrophyIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ChartBarIcon
} from '@heroicons/react/24/outline';

const initialFormState: BadgeRequest = {
  name: '',
  description: '',
  icon_url: '',
  points: 10,
  criteria: { min_steps: 1000 },
  is_active: true,
};

export const AchievementsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'badges' | 'leaderboard'>('badges');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BadgeRequest>(initialFormState);
  const [uploading, setUploading] = useState(false);

  // Queries
  const { data: badges, isLoading: loadBadges } = useQuery({
    queryKey: ['badges'],
    queryFn: () => GamificationService.getBadges(),
    enabled: activeTab === 'badges'
  });

  const { data: leaderboard, isLoading: loadLeaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => GamificationService.getLeaderboard({ limit: 50 }),
    enabled: activeTab === 'leaderboard'
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: GamificationService.createBadge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges'] });
      handleClose();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<BadgeRequest> }) =>
      GamificationService.updateBadge(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges'] });
      handleClose();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: GamificationService.deleteBadge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges'] });
    }
  });

  // Handlers
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const response = await mediaService.uploadImage(e.target.files[0]);
        setFormData(prev => ({ ...prev, image_url: response.url }));
      } catch (err) {
        alert("Fout bij uploaden afbeelding");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (badge: Badge) => {
    setEditingId(badge.id);
    setFormData({
      name: badge.name,
      description: badge.description,
      icon_url: badge.icon_url,
      points: badge.points,
      criteria: badge.criteria,
      is_active: badge.is_active
    });
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gamification</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Beheer badges en bekijk de ranglijst.</p>
        </div>
        {activeTab === 'badges' && (
            <button 
            onClick={handleOpenCreate}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
            <PlusIcon className="w-4 h-4 mr-2" />
            Nieuwe Badge
            </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('badges')}
            className={`${
              activeTab === 'badges'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <TrophyIcon className="w-4 h-4 mr-2" />
            Badges
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`${
              activeTab === 'leaderboard'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <ChartBarIcon className="w-4 h-4 mr-2" />
            Live Leaderboard
          </button>
        </nav>
      </div>

      {/* Content: Badges */}
      {activeTab === 'badges' && (
        <>
            {loadBadges ? <div className="text-center py-10 text-gray-500">Laden...</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {badges?.map((badge) => (
                        <div key={badge.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex items-start space-x-4 relative group">
                            <div className="flex-shrink-0">
                                {badge.icon_url ? (
                                    <img src={badge.icon_url} alt={badge.name} className="w-16 h-16 object-contain" />
                                ) : (
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-2xl">
                                        🏆
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                    {badge.name}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                    {badge.description}
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full">
                                        {badge.points} ptn
                                    </span>
                                    {badge.criteria.min_steps && (
                                        <span className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                                            Min steps: {badge.criteria.min_steps}
                                        </span>
                                    )}
                                    {!badge.is_active && (
                                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                            Inactief
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => handleOpenEdit(badge)}
                                    className="text-gray-400 hover:text-blue-600 p-1"
                                >
                                    <PencilIcon className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => deleteMutation.mutate(badge.id)}
                                    className="text-gray-400 hover:text-red-600 p-1"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {badges?.length === 0 && (
                        <p className="col-span-full text-center text-gray-500">Nog geen badges aangemaakt.</p>
                    )}
                </div>
            )}
        </>
      )}

      {/* Content: Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rank</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Deelnemer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stappen</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {loadLeaderboard ? (
                            <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">Laden...</td></tr>
                        ) : leaderboard?.entries.length === 0 ? (
                             <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">Geen data beschikbaar</td></tr>
                        ) : (
                            leaderboard?.entries.map((entry) => (
                                <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                                            ${entry.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                                              entry.rank === 2 ? 'bg-gray-100 text-gray-700' :
                                              entry.rank === 3 ? 'bg-orange-100 text-orange-700' : 'text-gray-500'}
                                        `}>
                                            {entry.rank}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {entry.naam}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {entry.steps.toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingId ? "Badge Bewerken" : "Nieuwe Badge"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Naam *</label>
                <input 
                    className="w-full border rounded-md p-2 dark:bg-gray-800 dark:border-gray-600"
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Beschrijving *</label>
                <textarea 
                    className="w-full border rounded-md p-2 dark:bg-gray-800 dark:border-gray-600"
                    rows={2}
                    required
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Punten *</label>
                    <input
                        type="number"
                        min="0"
                        required
                        className="w-full border rounded-md p-2 dark:bg-gray-800 dark:border-gray-600"
                        value={formData.points}
                        onChange={e => setFormData({...formData, points: parseInt(e.target.value)})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Min Stappen</label>
                    <input
                        type="number"
                        className="w-full border rounded-md p-2 dark:bg-gray-800 dark:border-gray-600"
                        value={formData.criteria.min_steps || ''}
                        onChange={e => setFormData({...formData, criteria: { ...formData.criteria, min_steps: parseInt(e.target.value) || undefined }})}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Afbeelding</label>
                <div className="flex items-center gap-4">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {formData.icon_url && (
                        <div className="border rounded p-1 bg-gray-50 dark:bg-gray-700">
                            <img src={formData.icon_url} alt="Preview" className="w-10 h-10 object-contain" />
                        </div>
                    )}
                </div>
                {uploading && <p className="text-xs text-blue-500 mt-1 animate-pulse">Uploaden...</p>}
            </div>

            <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                        type="checkbox"
                        className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                        checked={formData.is_active}
                        onChange={e => setFormData({...formData, is_active: e.target.checked})}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Badge is Actief</span>
                </label>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t dark:border-gray-700">
                <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                    Annuleren
                </button>
                <button 
                    type="submit" 
                    disabled={uploading || createMutation.isPending || updateMutation.isPending}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 shadow-sm"
                >
                    {(createMutation.isPending || updateMutation.isPending) ? 'Opslaan...' : 'Opslaan'}
                </button>
            </div>
        </form>
      </Modal>
    </div>
  );
};