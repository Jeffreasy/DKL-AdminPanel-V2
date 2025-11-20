import React, { useState } from 'react';
import { Event, CreateEventRequest, Geofence, EventStatus } from '@/api/types/event.types';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface EventFormProps {
  initialData?: Event | null; // Als dit er is, zijn we aan het bewerken
  onSubmit: (data: CreateEventRequest) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export const EventForm: React.FC<EventFormProps> = ({ initialData, onSubmit, onCancel, isLoading }) => {
  // Form State
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [status, setStatus] = useState<EventStatus>(initialData?.status || 'upcoming');
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  
  // Datums converteren voor input[type="datetime-local"]
  // "2025-06-01T10:00:00Z" -> "2025-06-01T10:00"
  const formatDateTime = (isoString?: string) => isoString ? new Date(isoString).toISOString().slice(0, 16) : '';
  
  const [startTime, setStartTime] = useState(formatDateTime(initialData?.start_time));
  const [endTime, setEndTime] = useState(formatDateTime(initialData?.end_time));

  // Geofences State (Minimaal 1 verplicht volgens backend)
  const [geofences, setGeofences] = useState<Geofence[]>(initialData?.geofences || [
    { type: 'start', name: 'Start', lat: 52.370216, long: 4.895168, radius: 50 }
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Converteer local datetime terug naar ISO string voor backend
    const payload: CreateEventRequest = {
      name,
      description,
      status,
      is_active: isActive,
      start_time: new Date(startTime).toISOString(),
      end_time: endTime ? new Date(endTime).toISOString() : undefined,
      geofences,
      event_config: initialData?.event_config || {} // Behoud config bij edit
    };

    await onSubmit(payload);
  };

  // Geofence helpers
  const updateGeofence = (index: number, field: keyof Geofence, value: any) => {
    const newGeofences = [...geofences];
    newGeofences[index] = { ...newGeofences[index], [field]: value };
    setGeofences(newGeofences);
  };

  const addGeofence = () => {
    setGeofences([...geofences, { type: 'checkpoint', name: 'Checkpoint', lat: 52.37, long: 4.90, radius: 30 }]);
  };

  const removeGeofence = (index: number) => {
    if (geofences.length <= 1) return; // Minimaal 1 verplicht
    setGeofences(geofences.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        {/* Naam */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium leading-6 text-gray-900">Naam Evenement</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
          />
        </div>

        {/* Beschrijving */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium leading-6 text-gray-900">Beschrijving</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
          />
        </div>

        {/* Start Tijd */}
        <div>
          <label className="block text-sm font-medium leading-6 text-gray-900">Start Tijd</label>
          <input
            type="datetime-local"
            required
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
          />
        </div>

        {/* Eind Tijd */}
        <div>
          <label className="block text-sm font-medium leading-6 text-gray-900">Eind Tijd (Optioneel)</label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium leading-6 text-gray-900">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as EventStatus)}
            className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
          >
            <option value="upcoming">Upcoming</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Is Active Checkbox */}
        <div className="flex items-center pt-6">
          <input
            id="is_active"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
            Event zichtbaar in app
          </label>
        </div>
      </div>

      {/* Geofences Sectie */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-900">Locatie Zones (Geofences)</h4>
          <button
            type="button"
            onClick={addGeofence}
            className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-500"
          >
            <PlusIcon className="h-3 w-3" /> Toevoegen
          </button>
        </div>
        
        <div className="space-y-3">
          {geofences.map((geo, index) => (
            <div key={index} className="flex gap-2 items-start bg-gray-50 p-3 rounded-md">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 flex-1">
                <select
                  value={geo.type}
                  onChange={(e) => updateGeofence(index, 'type', e.target.value)}
                  className="rounded-md border-0 py-1 text-xs text-gray-900 ring-1 ring-inset ring-gray-300"
                >
                  <option value="start">Start</option>
                  <option value="checkpoint">Checkpoint</option>
                  <option value="finish">Finish</option>
                </select>
                <input
                  type="text"
                  placeholder="Naam"
                  value={geo.name || ''}
                  onChange={(e) => updateGeofence(index, 'name', e.target.value)}
                  className="rounded-md border-0 py-1 text-xs text-gray-900 ring-1 ring-inset ring-gray-300"
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Lat"
                  value={geo.lat}
                  onChange={(e) => updateGeofence(index, 'lat', parseFloat(e.target.value))}
                  className="rounded-md border-0 py-1 text-xs text-gray-900 ring-1 ring-inset ring-gray-300"
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Long"
                  value={geo.long}
                  onChange={(e) => updateGeofence(index, 'long', parseFloat(e.target.value))}
                  className="rounded-md border-0 py-1 text-xs text-gray-900 ring-1 ring-inset ring-gray-300"
                />
                <input
                  type="number"
                  placeholder="Radius (m)"
                  value={geo.radius}
                  onChange={(e) => updateGeofence(index, 'radius', parseFloat(e.target.value))}
                  className="rounded-md border-0 py-1 text-xs text-gray-900 ring-1 ring-inset ring-gray-300"
                />
              </div>
              {geofences.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeGeofence(index)}
                  className="text-red-400 hover:text-red-600 p-1"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-end gap-x-6 border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-semibold leading-6 text-gray-900"
          disabled={isLoading}
        >
          Annuleren
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Opslaan...' : (initialData ? 'Bijwerken' : 'Aanmaken')}
        </button>
      </div>
    </form>
  );
};