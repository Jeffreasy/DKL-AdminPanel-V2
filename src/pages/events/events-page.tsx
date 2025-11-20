import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from '@/api/events/event.service';
import { Event, EventStatus, CreateEventRequest } from '@/api/types/event.types';
import { PlusIcon, CalendarIcon, MapPinIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Modal } from '@/components/ui/modal';
import { EventForm } from '@/components/forms/events/event-form';

// --- Status Badge Helper ---
const StatusBadge = ({ status }: { status: EventStatus | string }) => {
  const styles: Record<string, string> = {
    upcoming: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ring-opacity-10 ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export const EventsPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // --- Data Fetching ---
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventService.getAll(),
  });

  // --- Mutations ---
  // Create Event
  const createMutation = useMutation({
    mutationFn: (data: CreateEventRequest) => eventService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setIsModalOpen(false);
    },
  });

  // Update Event
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateEventRequest }) => eventService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setIsModalOpen(false);
      setEditingEvent(null);
    },
  });

  // Delete Event
  const deleteMutation = useMutation({
    mutationFn: (id: string) => eventService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  // --- Handlers ---
  const handleOpenCreate = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (event: Event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: CreateEventRequest) => {
    if (editingEvent) {
      await updateMutation.mutateAsync({ id: editingEvent.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Weet je zeker dat je dit evenement wilt verwijderen? Dit kan niet ongedaan worden gemaakt.')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  // --- Render ---
  if (isLoading) return <div className="p-8 text-center">Laden...</div>;
  if (error) return <div className="p-8 text-red-600">Fout bij laden events.</div>;

  return (
    <div>
      {/* Header */}
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">Evenementen</h1>
          <p className="mt-2 text-sm text-gray-700">Beheer hier al je evenementen.</p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            <PlusIcon className="h-4 w-4" /> Nieuw Event
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Naam</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Datum</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Locatie</th>
              <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Acties</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {events?.map((event: Event) => (
              <tr key={event.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {event.name}
                  <div className="text-xs font-normal text-gray-500">{event.description}</div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    {new Date(event.start_time).toLocaleDateString('nl-NL')}
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <StatusBadge status={event.status} />
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1" title="Aantal geofences">
                    <MapPinIcon className="h-4 w-4 text-gray-400" />
                    <span>{event.geofences?.length || 0} zones</span>
                  </div>
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => handleOpenEdit(event)} className="text-blue-600 hover:text-blue-900">
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDelete(event.id)} className="text-red-600 hover:text-red-900">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {(!events || events.length === 0) && (
              <tr><td colSpan={5} className="py-10 text-center text-gray-500">Geen events gevonden.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEvent ? 'Event Bewerken' : 'Nieuw Event Aanmaken'}
      >
        <EventForm
          initialData={editingEvent}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>
    </div>
  );
};