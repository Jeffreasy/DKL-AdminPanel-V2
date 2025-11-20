import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsService } from '@/services/content/cms.service';
import { mediaService } from '@/services/content/media.service';
import { Partner, Sponsor, PartnerType } from '@/api/types/content.types';
import { Modal } from '@/components/ui/modal';
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

// Hulp types voor het formulier
type FormData = {
  name: string;
  description: string;
  website: string; // We mappen dit naar website OR website_url bij submit
  logo: string;    // We mappen dit naar logo OR logo_url bij submit
  order_number: number;
  visible: boolean;
  // Sponsor specifiek
  is_active: boolean;
  // Partner specifiek
  tier: string;
  since: string;
};

const initialFormState: FormData = {
  name: '',
  description: '',
  website: '',
  logo: '',
  order_number: 0,
  visible: true,
  is_active: true,
  tier: '',
  since: ''
};

export const PartnersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<PartnerType>('sponsor'); // Tab switch
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [uploading, setUploading] = useState(false);

  // Queries
  const { data: sponsors, isLoading: loadSponsors } = useQuery({
    queryKey: ['sponsors'],
    queryFn: cmsService.getSponsors
  });

  const { data: partners, isLoading: loadPartners } = useQuery({
    queryKey: ['partners'],
    queryFn: cmsService.getPartners
  });

  // Mutations
  const createMutation = useMutation<Partner | Sponsor, any>({
    mutationFn: (data: any) =>
      activeTab === 'sponsor' ? cmsService.createSponsor(data) : cmsService.createPartner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
      handleClose();
    }
  });

  const updateMutation = useMutation<Partner | Sponsor, Error, { id: string, data: any }>({
    mutationFn: ({ id, data }: { id: string, data: any }) =>
      activeTab === 'sponsor' ? cmsService.updateSponsor(id, data) : cmsService.updatePartner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
      handleClose();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, type }: { id: string, type: PartnerType }) => 
      type === 'sponsor' ? cmsService.deleteSponsor(id) : cmsService.deletePartner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
    }
  });

  // Handlers
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const response = await mediaService.uploadImage(e.target.files[0]);
        setFormData(prev => ({ ...prev, logo: response.url }));
      } catch (error) {
        console.error("Upload failed", error);
        alert("Afbeelding uploaden mislukt");
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

  const handleOpenEdit = (item: Partner | Sponsor, type: PartnerType) => {
    setActiveTab(type); // Zorg dat we in de juiste modus zitten
    setEditingId(item.id);
    
    // Map data naar form state
    setFormData({
      name: item.name,
      description: item.description || '',
      website: type === 'sponsor' ? ((item as Sponsor).website_url || '') : ((item as Partner).website || ''),
      logo: type === 'sponsor' ? ((item as Sponsor).logo_url || '') : ((item as Partner).logo || ''),
      order_number: item.order_number || 0,
      visible: item.visible,
      is_active: (item as Sponsor).is_active ?? true,
      tier: (item as Partner).tier || '',
      since: (item as Partner).since || ''
    });
    
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Map form data terug naar API specific structure
    let payload: any = {
      name: formData.name,
      description: formData.description,
      order_number: typeof formData.order_number === 'string' ? parseInt(formData.order_number) : formData.order_number,
      visible: formData.visible,
    };

    if (activeTab === 'sponsor') {
      payload = {
        ...payload,
        website_url: formData.website,
        logo_url: formData.logo,
        is_active: formData.is_active
      };
    } else {
      payload = {
        ...payload,
        website: formData.website,
        logo: formData.logo,
        tier: formData.tier,
        since: formData.since
      };
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  // Render Helper
  // Fix: Explicitly type item using the imported interfaces
  const renderCard = (item: Partner | Sponsor, type: PartnerType) => {
    // Fix: Cast to specific type to access unique properties based on the 'type' flag
    const logoUrl = type === 'sponsor'
      ? (item as Sponsor).logo_url
      : (item as Partner).logo;

    const websiteUrl = type === 'sponsor'
      ? (item as Sponsor).website_url
      : (item as Partner).website;

    return (
      <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col relative group">
        <div className="h-32 bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4 relative">
          {logoUrl ? (
             <img src={logoUrl} alt={item.name} className="max-h-full max-w-full object-contain" />
          ) : (
             <span className="text-gray-400 text-xs">Geen logo</span>
          )}
          {!item.visible && (
            <span className="absolute top-2 right-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Verborgen</span>
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-bold text-gray-900 dark:text-white">{item.name}</h3>
          {/* Check if 'tier' exists (it's only on Partner) */}
          {type === 'partner' && (item as Partner).tier && (
            <span className="text-xs text-gray-500 uppercase font-semibold">{(item as Partner).tier}</span>
          )}
          <a href={websiteUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-500 hover:underline truncate mb-4 block h-6">
            {websiteUrl}
          </a>
          
          {/* Action Buttons (Show on Hover) */}
          <div className="mt-auto flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
             <button 
              onClick={() => handleOpenEdit(item, type)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={() => deleteMutation.mutate({ id: item.id, type })}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Partners & Sponsors</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Beheer de zichtbare partners en sponsors.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Toevoegen
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('sponsor')}
            className={`${
              activeTab === 'sponsor'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Sponsors
          </button>
          <button
            onClick={() => setActiveTab('partner')}
            className={`${
              activeTab === 'partner'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Partners
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'sponsor' ? (
        loadSponsors ? <div className="text-center py-10 text-gray-500">Laden...</div> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Fix: Explicitly type the map parameter */}
            {sponsors?.map((item: Sponsor) => renderCard(item, 'sponsor'))}
            {sponsors?.length === 0 && <p className="col-span-full text-center text-gray-500 py-10">Geen sponsors gevonden.</p>}
          </div>
        )
      ) : (
        loadPartners ? <div className="text-center py-10 text-gray-500">Laden...</div> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Fix: Explicitly type the map parameter */}
            {partners?.map((item: Partner) => renderCard(item, 'partner'))}
            {partners?.length === 0 && <p className="col-span-full text-center text-gray-500 py-10">Geen partners gevonden.</p>}
          </div>
        )
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingId ? `${activeTab === 'sponsor' ? 'Sponsor' : 'Partner'} Bewerken` : `Nieuwe ${activeTab === 'sponsor' ? 'Sponsor' : 'Partner'}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Selector (Only in Create mode) */}
          {!editingId && (
            <div>
               <label className="block text-sm font-medium mb-1 dark:text-gray-300">Type</label>
               <select 
                 className="w-full border rounded-md p-2 dark:bg-gray-800 dark:border-gray-600"
                 value={activeTab}
                 onChange={(e) => setActiveTab(e.target.value as PartnerType)}
               >
                 <option value="sponsor">Sponsor</option>
                 <option value="partner">Partner</option>
               </select>
            </div>
          )}

          {/* Shared Fields */}
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
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Website</label>
            <input 
              className="w-full border rounded-md p-2 dark:bg-gray-800 dark:border-gray-600"
              value={formData.website}
              onChange={e => setFormData({...formData, website: e.target.value})}
            />
          </div>

          {/* Dynamic Fields based on Tab */}
          {activeTab === 'partner' && (
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Tier</label>
                  <input 
                    className="w-full border rounded-md p-2 dark:bg-gray-800 dark:border-gray-600"
                    placeholder="Bijv. Goud"
                    value={formData.tier}
                    onChange={e => setFormData({...formData, tier: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Sinds</label>
                  <input 
                    className="w-full border rounded-md p-2 dark:bg-gray-800 dark:border-gray-600"
                    placeholder="2023"
                    value={formData.since}
                    onChange={e => setFormData({...formData, since: e.target.value})}
                  />
                </div>
             </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Volgorde Nummer</label>
            <input 
              type="number"
              className="w-full border rounded-md p-2 dark:bg-gray-800 dark:border-gray-600"
              value={formData.order_number}
              onChange={e => setFormData({...formData, order_number: parseInt(e.target.value)})}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Logo</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {uploading && <p className="text-xs text-blue-500 mt-1">Uploaden...</p>}
            {formData.logo && !uploading && (
              <div className="mt-2">
                <img src={formData.logo} alt="Preview" className="h-16 object-contain border rounded p-1 bg-gray-50" />
              </div>
            )}
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

            {activeTab === 'sponsor' && (
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Actief</span>
              </label>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              Annuleren
            </button>
            <button 
              type="submit" 
              disabled={uploading || createMutation.isPending || updateMutation.isPending}
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