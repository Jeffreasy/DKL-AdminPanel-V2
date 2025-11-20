import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notulenService } from '@/services/communication/notulen.service';
import { useNotulenSocket } from '@/hooks/use-notulen-socket';
import {
  Notulen,
  AgendaItem,
  Besluit,
  Actiepunt,
  NotulenStatus
} from '@/api/types/notulen.types';
import {
  ArrowLeftIcon,
  ArrowUpTrayIcon,
  CheckBadgeIcon,
  ArchiveBoxIcon,
  DocumentArrowDownIcon,
  PlusIcon,
  TrashIcon,
  UserGroupIcon,
  ClockIcon,
  ChatBubbleBottomCenterTextIcon,
  ClipboardDocumentCheckIcon,
  MapPinIcon,
  CalendarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// --- Helper Components ---

const SectionHeader: React.FC<{ title: string; icon: React.ReactNode; onAdd?: () => void }> = ({ title, icon, onAdd }) => (
  <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
      {icon} {title}
    </h2>
    {onAdd && (
      <button 
        onClick={onAdd}
        className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
      >
        <PlusIcon className="w-4 h-4" /> Toevoegen
      </button>
    )}
  </div>
);

const StatusBadge: React.FC<{ status: NotulenStatus }> = ({ status }) => {
  const styles: Record<string, string> = {
    draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    finalized: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    archived: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
  };
  
  const labels: Record<string, string> = {
    draft: "Concept",
    finalized: "Definitief",
    archived: "Gearchiveerd"
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.draft}`}>
      {labels[status] || status}
    </span>
  );
};

// --- Main Component ---

export const NotulenDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // 1. Activate WebSocket for this document
  useNotulenSocket();

  // 2. Local State for Editing
  // We maintain a local copy of the data to allow immediate typing without waiting for server roundtrips
  const [localData, setLocalData] = useState<Partial<Notulen>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'agenda' | 'minutes'>('general');

  // 3. Data Fetching
  const { data: notulen, isLoading, error } = useQuery({
    queryKey: ['notulen', id],
    queryFn: () => notulenService.getById(id!),
    enabled: !!id,
    refetchOnWindowFocus: false, // Prevent overwriting user input on window switch
    staleTime: Infinity, // We rely on WebSocket for updates, not polling
  });

  // 4. Sync Server State -> Local State (Conflict Resolution)
  useEffect(() => {
    if (notulen) {
      // We only update local state from server if:
      // A. We haven't typed anything yet (initial load)
      // B. The server version is higher than our local version (someone else updated it)
      const serverVer = notulen.versie || 0;
      const localVer = localData.versie || 0;

      if (!isDirty || serverVer > localVer) {
        setLocalData(JSON.parse(JSON.stringify(notulen))); // Deep copy to avoid ref issues
        if (serverVer > localVer) {
            setIsDirty(false); // Reset dirty state if we accepted a newer server version
        }
      }
    }
  }, [notulen, isDirty, localData.versie]);

  // 5. Mutations
  const updateMutation = useMutation({
    mutationFn: (data: Partial<Notulen>) => notulenService.update(id!, data),
    onSuccess: (updated) => {
      // Update React Query cache
      queryClient.setQueryData(['notulen', id], updated);
      setLocalData(updated); // Update local state to match server response (e.g. updated version number)
      setIsDirty(false);
    },
    onError: () => {
      alert("Opslaan mislukt. Probeer het opnieuw.");
    }
  });

  const finalizeMutation = useMutation({
    mutationFn: () => notulenService.finalize(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notulen', id] })
  });

  const archiveMutation = useMutation({
    mutationFn: () => notulenService.archive(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notulen', id] })
  });

  // 6. Handlers & Logic

  const handleSave = () => {
    // We send the entire localData object as the update payload
    // The backend service handles the JSONB serialization
    updateMutation.mutate(localData);
  };

  const handleExport = async () => {
    try {
      const markdown = await notulenService.getMarkdown(id!);
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notulen-${localData.vergadering_datum}-${(localData.titel || 'meeting').replace(/\s+/g, '_')}.md`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert("Export mislukt");
    }
  };

  // Generic Field Updater
  const updateField = (field: keyof Notulen, value: Notulen[keyof Notulen]) => {
    setLocalData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  // Array Item Updater (for nested objects like AgendaItem)
  const updateArrayItem = <T,>(field: keyof Notulen, index: number, itemField: keyof T, value: string) => {
    const list = [...(localData[field] as T[] || [])];
    list[index] = { ...list[index], [itemField]: value };
    setLocalData(prev => ({ ...prev, [field]: list }));
    setIsDirty(true);
  };

  // Simple String Array Updater (for Guests)
  const updateStringArray = (field: keyof Notulen, index: number, value: string) => {
    const list = [...(localData[field] as string[] || [])];
    list[index] = value;
    setLocalData(prev => ({ ...prev, [field]: list }));
    setIsDirty(true);
  };

  const addArrayItem = <T,>(field: keyof Notulen, initialItem: T) => {
    const list = [...(localData[field] as T[] || [])];
    list.push(initialItem);
    setLocalData(prev => ({ ...prev, [field]: list }));
    setIsDirty(true);
  };

  const removeArrayItem = <T,>(field: keyof Notulen, index: number) => {
    const list = [...(localData[field] as T[] || [])];
    list.splice(index, 1);
    setLocalData(prev => ({ ...prev, [field]: list }));
    setIsDirty(true);
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Notulen laden...</div>;
  if (error || !notulen) return <div className="p-8 text-center text-red-500">Fout bij laden notulen.</div>;

  const isReadOnly = localData.status !== 'draft';

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* --- Top Toolbar --- */}
      <div className="sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 py-4 px-4 -mx-4 sm:mx-0 sm:px-0 mb-6 flex flex-wrap gap-4 justify-between items-center">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate('/communication/notulen')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors flex-shrink-0">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-300"/>
          </button>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">
              {localData.titel}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={localData.status as NotulenStatus} />
              <span className="text-xs text-gray-500">v{localData.versie}</span>
              {isDirty && (
                <span className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded flex items-center gap-1">
                  <ExclamationTriangleIcon className="w-3 h-3" /> Niet opgeslagen
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-auto">
          <button 
            onClick={handleExport} 
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            title="Download Markdown"
          >
            <DocumentArrowDownIcon className="w-5 h-5" />
          </button>

          {!isReadOnly ? (
            <>
              <button 
                onClick={() => { if(confirm('Weet je zeker dat je de notulen definitief wilt maken? Dit kan niet ongedaan worden gemaakt.')) finalizeMutation.mutate() }}
                className="hidden sm:flex px-3 py-2 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 rounded-md border border-green-200 dark:border-green-900 transition-colors items-center gap-2"
              >
                <CheckBadgeIcon className="w-4 h-4" /> Finaliseren
              </button>
              <button
                onClick={handleSave}
                disabled={!isDirty || updateMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                <ArrowUpTrayIcon className="w-4 h-4" />
                {updateMutation.isPending ? 'Opslaan...' : 'Opslaan'}
              </button>
            </>
          ) : (
            localData.status === 'finalized' && (
              <button 
                onClick={() => { if(confirm('Archiveren?')) archiveMutation.mutate() }}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 rounded-md flex items-center gap-2"
              >
                <ArchiveBoxIcon className="w-4 h-4" /> Archiveren
              </button>
            )
          )}
        </div>
      </div>

      {/* --- Tabs Navigation --- */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'general' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
            Algemeen & Deelnemers
        </button>
        <button
            onClick={() => setActiveTab('agenda')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'agenda' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
            Agenda
        </button>
        <button
            onClick={() => setActiveTab('minutes')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'minutes' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
            Notulen & Acties
        </button>
      </div>

      {/* --- TAB 1: GENERAL --- */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Meta Info */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <SectionHeader title="Details" icon={<ClipboardDocumentCheckIcon className="w-5 h-5 text-blue-500"/>} />
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Titel</label>
                <input 
                    type="text"
                    disabled={isReadOnly}
                    value={localData.titel || ''}
                    onChange={e => updateField('titel', e.target.value)}
                    className="w-full p-2 text-sm border rounded-md dark:bg-gray-900 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                  />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Datum</label>
                <div className="relative">
                  <CalendarIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400"/>
                  <input 
                    type="date"
                    disabled={isReadOnly}
                    value={localData.vergadering_datum ? new Date(localData.vergadering_datum).toISOString().slice(0, 10) : ''}
                    onChange={e => updateField('vergadering_datum', e.target.value)}
                    className="w-full pl-9 p-2 text-sm border rounded-md dark:bg-gray-900 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Locatie</label>
                <div className="relative">
                  <MapPinIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400"/>
                  <input 
                    type="text"
                    disabled={isReadOnly}
                    value={localData.locatie || ''}
                    onChange={e => updateField('locatie', e.target.value)}
                    className="w-full pl-9 p-2 text-sm border rounded-md dark:bg-gray-900 dark:border-gray-600 focus:ring-blue-500"
                    placeholder="Bijv. Vergaderzaal A"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Voorzitter</label>
                  <input 
                    type="text"
                    disabled={isReadOnly}
                    value={localData.voorzitter || ''}
                    onChange={e => updateField('voorzitter', e.target.value)}
                    className="w-full p-2 text-sm border rounded-md dark:bg-gray-900 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Notulist</label>
                  <input 
                    type="text"
                    disabled={isReadOnly}
                    value={localData.notulist || ''}
                    onChange={e => updateField('notulist', e.target.value)}
                    className="w-full p-2 text-sm border rounded-md dark:bg-gray-900 dark:border-gray-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Attendees */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <SectionHeader 
              title="Aanwezige Gasten" 
              icon={<UserGroupIcon className="w-5 h-5 text-green-500"/>} 
              onAdd={!isReadOnly ? () => addArrayItem('aanwezigen_gasten', '') : undefined}
            />
            <div className="space-y-2 mb-6">
              {(localData.aanwezigen_gasten || []).map((name, idx) => (
                <div key={idx} className="flex items-center gap-2 group">
                  <div className="p-1 bg-green-50 rounded"><UserGroupIcon className="w-3 h-3 text-green-600"/></div>
                  <input 
                    className="flex-1 text-sm bg-transparent border-b border-gray-100 dark:border-gray-700 focus:border-blue-500 outline-none px-1 py-1"
                    value={name}
                    onChange={e => updateStringArray('aanwezigen_gasten', idx, e.target.value)}
                    disabled={isReadOnly}
                    placeholder="Naam gast"
                  />
                  {!isReadOnly && (
                    <button onClick={() => removeArrayItem('aanwezigen_gasten', idx)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity">
                      <TrashIcon className="w-4 h-4"/>
                    </button>
                  )}
                </div>
              ))}
              {(!localData.aanwezigen_gasten || localData.aanwezigen_gasten.length === 0) && (
                <p className="text-xs text-gray-400 italic">Geen gasten toegevoegd.</p>
              )}
            </div>
            
            {/* Read-only display for registered users who are present (fetched via UUIDs) */}
            {localData.aanwezigen && localData.aanwezigen.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Alle Deelnemers (Geregistreerd + Gasten)</h3>
                    <div className="flex flex-wrap gap-2">
                        {localData.aanwezigen.map((name, i) => (
                            <span key={i} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                                {name}
                            </span>
                        ))}
                    </div>
                </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 2: AGENDA --- */}
      {activeTab === 'agenda' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <SectionHeader 
              title="Agenda Punten" 
              icon={<ClockIcon className="w-5 h-5 text-purple-500"/>} 
              onAdd={!isReadOnly ? () => addArrayItem('agenda_items', { titel: '', beschrijving: '' }) : undefined}
            />
            
            <div className="space-y-4">
              {(localData.agenda_items || []).map((item, idx) => (
                <div key={idx} className="relative p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg group border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
                  {/* Controls */}
                  {!isReadOnly && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => removeArrayItem('agenda_items', idx)} className="p-1 text-gray-400 hover:text-red-500 bg-white dark:bg-gray-800 rounded shadow-sm">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Content Inputs */}
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-gray-400 text-sm pt-2 w-6">{idx + 1}.</span>
                      <input 
                        className="flex-1 font-semibold text-gray-900 dark:text-white bg-transparent border-b border-transparent focus:border-blue-500 outline-none p-1"
                        placeholder="Titel agendapunt"
                        value={item.titel}
                        onChange={e => updateArrayItem<AgendaItem>('agenda_items', idx, 'titel', e.target.value)}
                        disabled={isReadOnly}
                      />
                    </div>
                    <div className="pl-9">
                      <textarea 
                        className="w-full text-sm text-gray-600 dark:text-gray-300 bg-transparent border-b border-transparent focus:border-blue-500 outline-none resize-none p-1"
                        placeholder="Beschrijving of notities..."
                        rows={2}
                        value={item.beschrijving || ''}
                        onChange={e => updateArrayItem<AgendaItem>('agenda_items', idx, 'beschrijving', e.target.value)}
                        disabled={isReadOnly}
                      />
                    </div>
                    <div className="pl-9 flex gap-4 text-xs text-gray-500 mt-2">
                      <div className="flex items-center gap-1 bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-600">
                          <span className="font-medium">Spreker:</span>
                          <input 
                            placeholder="Naam" 
                            className="bg-transparent outline-none w-24"
                            value={item.spreker || ''}
                            onChange={e => updateArrayItem<AgendaItem>('agenda_items', idx, 'spreker', e.target.value)}
                            disabled={isReadOnly}
                          />
                      </div>
                      <div className="flex items-center gap-1 bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-600">
                          <span className="font-medium">Tijd:</span>
                          <input 
                            placeholder="10m" 
                            className="bg-transparent outline-none w-16"
                            value={item.tijdslot || ''}
                            onChange={e => updateArrayItem<AgendaItem>('agenda_items', idx, 'tijdslot', e.target.value)}
                            disabled={isReadOnly}
                          />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {(!localData.agenda_items || localData.agenda_items.length === 0) && (
                 <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                    Nog geen agendapunten toegevoegd.
                 </div>
              )}
            </div>
        </div>
      )}

      {/* --- TAB 3: MINUTES & ACTIONS --- */}
      {activeTab === 'minutes' && (
        <div className="space-y-6">
            {/* NOTES (The actual Minutes) */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <SectionHeader title="Verslag / Notulen" icon={<ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-gray-500"/>} />
                <textarea 
                className="w-full min-h-[300px] p-4 text-sm leading-relaxed border rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none resize-y font-mono"
                placeholder="Typ hier het volledige verslag van de vergadering..."
                value={localData.notities || ''}
                onChange={e => updateField('notities', e.target.value)}
                disabled={isReadOnly}
                />
            </div>

            {/* DECISIONS & ACTIONS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Decisions */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <SectionHeader 
                    title="Besluiten" 
                    icon={<CheckBadgeIcon className="w-5 h-5 text-blue-500"/>} 
                    onAdd={!isReadOnly ? () => addArrayItem('besluiten', { beschrijving: '' }) : undefined}
                />
                <div className="space-y-3">
                    {(localData.besluiten || []).map((besluit, idx) => (
                    <div key={idx} className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800 relative group">
                        {!isReadOnly && (
                        <button onClick={() => removeArrayItem('besluiten', idx)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity"><TrashIcon className="w-4 h-4"/></button>
                        )}
                        <textarea 
                        className="w-full text-sm bg-transparent border-none focus:ring-0 resize-none p-0 text-gray-800 dark:text-gray-200 font-medium placeholder-blue-300"
                        placeholder="Omschrijving van het besluit..."
                        value={besluit.beschrijving}
                        onChange={e => updateArrayItem<Besluit>('besluiten', idx, 'beschrijving', e.target.value)}
                        disabled={isReadOnly}
                        rows={2}
                        />
                    </div>
                    ))}
                    {(!localData.besluiten || localData.besluiten.length === 0) && <p className="text-sm text-gray-400 italic text-center py-4">Geen besluiten genomen.</p>}
                </div>
                </div>

                {/* Action Points */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <SectionHeader 
                    title="Actiepunten" 
                    icon={<ClipboardDocumentCheckIcon className="w-5 h-5 text-orange-500"/>} 
                    onAdd={!isReadOnly ? () => addArrayItem('actiepunten', { beschrijving: '', status: 'pending', verantwoordelijke: '' }) : undefined}
                />
                <div className="space-y-3">
                    {(localData.actiepunten || []).map((actie, idx) => (
                    <div key={idx} className="p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-800 relative group">
                        {!isReadOnly && (
                        <button onClick={() => removeArrayItem('actiepunten', idx)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity"><TrashIcon className="w-4 h-4"/></button>
                        )}
                        <div className="flex flex-wrap gap-2 mb-2">
                        <select 
                            className="text-xs rounded border-orange-200 bg-white dark:bg-gray-800 py-0.5 px-2 focus:border-orange-500 focus:ring-orange-500"
                            value={actie.status}
                            onChange={e => updateArrayItem<Actiepunt>('actiepunten', idx, 'status', e.target.value)}
                            disabled={isReadOnly}
                        >
                            <option value="pending">Open</option>
                            <option value="in_progress">Bezig</option>
                            <option value="completed">Gedaan</option>
                        </select>
                        <input 
                            className="flex-1 text-xs bg-transparent border-b border-orange-200 focus:border-orange-500 outline-none min-w-[100px]"
                            placeholder="Wie is verantwoordelijk?"
                            value={actie.verantwoordelijke || ''}
                            onChange={e => updateArrayItem<Actiepunt>('actiepunten', idx, 'verantwoordelijke', e.target.value)}
                            disabled={isReadOnly}
                        />
                        </div>
                        <textarea 
                        className="w-full text-sm bg-transparent border-none focus:ring-0 resize-none p-0 text-gray-800 dark:text-gray-200 placeholder-orange-300"
                        placeholder="Wat moet er gebeuren?"
                        value={actie.beschrijving}
                        onChange={e => updateArrayItem<Actiepunt>('actiepunten', idx, 'beschrijving', e.target.value)}
                        disabled={isReadOnly}
                        rows={2}
                        />
                    </div>
                    ))}
                    {(!localData.actiepunten || localData.actiepunten.length === 0) && <p className="text-sm text-gray-400 italic text-center py-4">Geen actiepunten.</p>}
                </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};