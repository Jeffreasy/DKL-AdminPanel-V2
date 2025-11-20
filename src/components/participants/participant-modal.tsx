import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal'; // Pas pad aan als nodig
import { Participant, AccountType } from '@/api/types/participant.types';

interface ParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Participant>) => Promise<void>;
  initialData?: Participant | null;
  isLoading: boolean;
}

export const ParticipantModal: React.FC<ParticipantModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading
}) => {
  // Form state
  const [formData, setFormData] = useState<Partial<Participant>>({
    naam: '',
    email: '',
    telefoon: '',
    account_type: 'temporary',
    has_app_access: false,
  });

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        naam: initialData.naam,
        email: initialData.email,
        telefoon: initialData.telefoon || '',
        account_type: initialData.account_type,
        has_app_access: initialData.has_app_access,
      });
    } else {
      setFormData({
        naam: '',
        email: '',
        telefoon: '',
        account_type: 'temporary',
        has_app_access: false,
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Deelnemer Bewerken' : 'Nieuwe Deelnemer'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Naam */}
        <div>
          <label htmlFor="naam" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Naam
          </label>
          <input
            type="text"
            id="naam"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 sm:text-sm px-3 py-2 border"
            value={formData.naam}
            onChange={(e) => setFormData({ ...formData, naam: e.target.value })}
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            type="email"
            id="email"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 sm:text-sm px-3 py-2 border"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        {/* Telefoon */}
        <div>
          <label htmlFor="telefoon" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Telefoon
          </label>
          <input
            type="tel"
            id="telefoon"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 sm:text-sm px-3 py-2 border"
            value={formData.telefoon}
            onChange={(e) => setFormData({ ...formData, telefoon: e.target.value })}
          />
        </div>

        {/* Account Type & App Access Row */}
        <div className="flex gap-4">
          <div className="w-1/2">
            <label htmlFor="account_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Type Account
            </label>
            <select
              id="account_type"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 sm:text-sm px-3 py-2 border"
              value={formData.account_type}
              onChange={(e) => setFormData({ ...formData, account_type: e.target.value as AccountType })}
            >
              <option value="temporary">Tijdelijk</option>
              <option value="full">Volledig</option>
            </select>
          </div>

          <div className="w-1/2 flex items-end pb-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                checked={formData.has_app_access}
                onChange={(e) => setFormData({ ...formData, has_app_access: e.target.checked })}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">App Toegang</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            disabled={isLoading}
          >
            Annuleren
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Opslaan...' : initialData ? 'Wijzigen' : 'Aanmaken'}
          </button>
        </div>
      </form>
    </Modal>
  );
};