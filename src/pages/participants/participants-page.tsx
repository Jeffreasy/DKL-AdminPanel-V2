import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { participantService } from '@/services/users/participant.service';
import { useDebounce } from '@/hooks/use-debounce';
import { PlusIcon, MagnifyingGlassIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { Participant } from '@/api/types/participant.types';
import { ParticipantModal } from '@/components/participants/participant-modal';

export const ParticipantsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page] = useState(0);
  const limit = 20;
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  const debouncedSearch = useDebounce(search, 500);
  const queryClient = useQueryClient();

  // 1. Fetch Data
  const { data: participants, isLoading, isError } = useQuery({
    queryKey: ['participants', { search: debouncedSearch, page }],
    queryFn: () => participantService.getAll({
      search: debouncedSearch,
      limit,
      offset: page * limit
    })
  });

  // 2. Create Mutation
  const createMutation = useMutation({
    mutationFn: participantService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] });
      setIsModalOpen(false);
      // Optioneel: Toon success toast
    },
  });

  // 3. Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Participant> }) => 
      participantService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] });
      setIsModalOpen(false);
      // Optioneel: Toon success toast
    },
  });

  // Handlers
  const handleOpenCreate = () => {
    setSelectedParticipant(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (participant: Participant) => {
    setSelectedParticipant(participant);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: Partial<Participant>) => {
    if (selectedParticipant) {
      await updateMutation.mutateAsync({ id: selectedParticipant.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Deelnemers</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Beheer registraties en accounts</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Nieuwe Deelnemer
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Zoek op naam of email..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Deelnemer</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type Account</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">App</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acties</span></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">Gegevens laden...</td></tr>
              ) : isError ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-red-500">Fout bij ophalen gegevens.</td></tr>
              ) : !participants || participants.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">Geen deelnemers gevonden.</td></tr>
              ) : (
                participants.map((participant: Participant) => (
                  <tr key={participant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-medium text-sm">
                          {participant.naam.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{participant.naam}</div>
                          <div className="text-xs text-gray-500">Sinds {new Date(participant.created_at).toLocaleDateString('nl-NL')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{participant.email}</div>
                      {participant.telefoon && <div className="text-xs text-gray-500">{participant.telefoon}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        participant.account_type === 'full' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {participant.account_type === 'full' ? 'Volledig' : 'Tijdelijk'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {participant.has_app_access ? (
                        <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
                          <DevicePhoneMobileIcon className="w-4 h-4 mr-1" />
                          <span>Ja</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleOpenEdit(participant)}
                        className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 transition-colors"
                      >
                        Bewerk
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Integration Modal */}
      <ParticipantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedParticipant}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};