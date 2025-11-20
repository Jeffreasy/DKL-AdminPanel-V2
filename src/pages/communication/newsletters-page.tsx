import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { newsletterService } from '@/services/communication/newsletter.service';
import { Newsletter, CreateNewsletterRequest } from '@/types';
import { Modal } from '@/components/ui/modal';

type ApiError = { error: string };
import {
  EnvelopeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const initialFormState: CreateNewsletterRequest = {
  subject: '',
  content: ''
};

export const NewslettersPage: React.FC = () => {
  const queryClient = useQueryClient();

  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateNewsletterRequest>(initialFormState);
  const [sendingId, setSendingId] = useState<string | null>(null);

  // Queries
  const { data: newsletters, isLoading } = useQuery({
    queryKey: ['newsletters'],
    queryFn: () => newsletterService.getAll(50, 0)
  });

  // Mutations
  const createMutation = useMutation<Newsletter, AxiosError, CreateNewsletterRequest>({
    mutationFn: newsletterService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletters'] });
      handleClose();
    }
  });

  const updateMutation = useMutation<Newsletter, AxiosError, { id: string, data: Partial<CreateNewsletterRequest> }>({
    mutationFn: ({ id, data }: { id: string, data: Partial<CreateNewsletterRequest> }) =>
      newsletterService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletters'] });
      handleClose();
    },
    onError: (err: AxiosError) => {
      alert((err.response?.data as ApiError)?.error || "Fout bij bijwerken");
    }
  });

  const deleteMutation = useMutation<void, AxiosError, string>({
    mutationFn: newsletterService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletters'] });
    },
    onError: (err: AxiosError) => {
      alert((err.response?.data as ApiError)?.error || "Kan niet verwijderen (mogelijk al verzonden)");
    }
  });

  const sendMutation = useMutation<void, AxiosError, string>({
    mutationFn: newsletterService.sendNow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletters'] });
      setSendingId(null);
      alert("Nieuwsbrief succesvol in de verzendrij geplaatst!");
    },
    onError: (err: AxiosError) => {
      setSendingId(null);
      alert((err.response?.data as ApiError)?.error || "Fout bij verzenden");
    }
  });

  // Handlers
  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Newsletter) => {
    setEditingId(item.id);
    setFormData({
      subject: item.subject,
      content: item.content
    });
    setIsModalOpen(true);
  };

  const handleSendClick = (item: Newsletter) => {
    if (window.confirm(`Weet je zeker dat je "${item.subject}" naar alle abonnees wilt sturen? Dit kan niet ongedaan worden gemaakt.`)) {
      setSendingId(item.id);
      sendMutation.mutate(item.id);
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nieuwsbrieven</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Beheer en verstuur emails naar alle abonnees.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Nieuw Concept
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="text-center py-10 text-gray-500">Laden...</div>
      ) : (
        <div className="grid gap-4">
          {newsletters?.map((newsletter: Newsletter) => {
            const isSent = !!newsletter.sent_at;
            const isSending = sendingId === newsletter.id;

            return (
              <div key={newsletter.id} className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border ${isSent ? 'border-green-200 dark:border-green-900/30' : 'border-gray-200 dark:border-gray-700'} flex flex-col sm:flex-row justify-between gap-4`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {newsletter.subject}
                    </h3>
                    {isSent ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <CheckCircleIcon className="w-3 h-3 mr-1" /> Verzonden
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        <DocumentTextIcon className="w-3 h-3 mr-1" /> Concept
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-2 font-mono bg-gray-50 dark:bg-gray-900/50 p-2 rounded border border-gray-100 dark:border-gray-800">
                    {newsletter.content}
                  </p>
                  <div className="text-xs text-gray-400 flex flex-wrap gap-4">
                    <span>Aangemaakt: {new Date(newsletter.created_at).toLocaleDateString('nl-NL')}</span>
                    {isSent && <span>Verzonden: {new Date(newsletter.sent_at!).toLocaleString('nl-NL')}</span>}
                    {newsletter.batch_id && <span className="font-mono">Batch: {newsletter.batch_id}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 border-l pl-4 dark:border-gray-700">
                  {!isSent ? (
                    <>
                        <button
                            onClick={() => handleSendClick(newsletter)}
                            disabled={isSending}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors flex flex-col items-center gap-1 min-w-[80px]"
                            title="Verstuur Nu"
                        >
                            {isSending ? (
                                <span className="animate-spin text-xl">↻</span>
                            ) : (
                                <PaperAirplaneIcon className="w-5 h-5" />
                            )}
                            <span className="text-xs font-medium">Versturen</span>
                        </button>

                        <button
                            onClick={() => handleOpenEdit(newsletter)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                            title="Bewerken"
                        >
                            <PencilIcon className="w-5 h-5" />
                        </button>

                        <button
                            onClick={() => deleteMutation.mutate(newsletter.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                            title="Verwijderen"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </>
                  ) : (
                    <div className="text-sm text-gray-400 italic pr-2">
                        Geen acties<br/>mogelijk
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {newsletters?.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
              <EnvelopeIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Geen nieuwsbrieven</h3>
              <p className="text-gray-500 text-sm">Maak een concept aan om te beginnen.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingId ? "Concept Bewerken" : "Nieuw Concept"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Onderwerp</label>
            <input
              className="w-full border rounded-md p-2 dark:bg-gray-800 dark:border-gray-600"
              required
              value={formData.subject}
              onChange={e => setFormData({...formData, subject: e.target.value})}
              placeholder="Bijv: De loop start morgen!"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Inhoud (HTML ondersteund)</label>
            <textarea
              className="w-full border rounded-md p-2 dark:bg-gray-800 dark:border-gray-600 font-mono text-sm"
              rows={12}
              required
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
              placeholder="<p>Beste deelnemer,</p>..."
            />
            <p className="text-xs text-gray-500 mt-1">
                De backend ondersteunt HTML. Je kunt tags zoals p, strong en meer gebruiken.
            </p>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t dark:border-gray-700">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">Annuleren</button>
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