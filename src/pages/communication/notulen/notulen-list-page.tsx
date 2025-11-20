import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { notulenService } from '@/services/communication/notulen.service';
import { Modal } from '@/components/ui/modal';
import { CreateNotulenRequest, Notulen } from '@/api/types/notulen.types';
import {
  PlusIcon,
  CalendarIcon,
  UserIcon,
  CheckBadgeIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';

export const NotulenListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));

  const { data, isLoading } = useQuery({
    queryKey: ['notulen-list'],
    queryFn: () => notulenService.getAll({ limit: 20 })
  });

  const createMutation = useMutation({
    mutationFn: (req: CreateNotulenRequest) => notulenService.create(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notulen-list'] });
      setIsCreateOpen(false);
      setNewTitle('');
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      titel: newTitle,
      vergadering_datum: newDate,
      // Default lege agenda
      agenda_items: []
    });
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'finalized': return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1"><CheckBadgeIcon className="w-3 h-3"/> Definitief</span>;
      case 'archived': return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full flex items-center gap-1"><ArchiveBoxIcon className="w-3 h-3"/> Gearchiveerd</span>;
      default: return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Concept</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vergaderingen & Notulen</h1>
          <p className="text-sm text-gray-500">Beheer agenda's, besluiten en actiepunten.</p>
        </div>
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Nieuwe Vergadering
        </button>
      </div>

      {isLoading ? <div className="text-center py-10">Laden...</div> : (
        <div className="grid gap-4">
          {data?.notulen?.map((item: Notulen) => (
            <Link
              key={item.id}
              to={`/communication/notulen/${item.id}`}
              className="block bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-500 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{item.titel}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><CalendarIcon className="w-4 h-4"/> {new Date(item.vergadering_datum).toLocaleDateString('nl-NL')}</span>
                    {item.voorzitter && <span className="flex items-center gap-1"><UserIcon className="w-4 h-4"/> {item.voorzitter}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(item.status)}
                  <span className="text-xs text-gray-400">Versie {item.versie}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Nieuwe Vergadering">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Titel</label>
            <input 
              className="w-full border rounded p-2 dark:bg-gray-800 dark:border-gray-600" 
              required 
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Bijv. Bestuursvergadering Q1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Datum</label>
            <input 
              type="date"
              className="w-full border rounded p-2 dark:bg-gray-800 dark:border-gray-600" 
              required 
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 text-gray-600">Annuleren</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Aanmaken</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};