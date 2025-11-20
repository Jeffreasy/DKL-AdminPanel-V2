import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emailService } from '@/services/communication/email.service';
import { EmailTemplate, UpdateTemplateRequest } from '@/api/types/email.types';
import { Modal } from '@/components/ui/modal';
import {
  InboxIcon,
  PaperAirplaneIcon,
  DocumentDuplicateIcon, // Voor templates
  PencilIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

export const EmailDashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'templates'>('inbox');

  // Template Edit State
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState<UpdateTemplateRequest>({ onderwerp: '', inhoud: '' });

  // Queries
  const { data: incoming, isLoading: loadIncoming } = useQuery({
    queryKey: ['email-incoming'],
    queryFn: () => emailService.getIncoming(50),
    enabled: activeTab === 'inbox'
  });

  const { data: sent, isLoading: loadSent } = useQuery({
    queryKey: ['email-sent'],
    queryFn: () => emailService.getSent(50),
    enabled: activeTab === 'sent'
  });

  const { data: templates, isLoading: loadTemplates } = useQuery({
    queryKey: ['email-templates'],
    queryFn: emailService.getTemplates,
    enabled: activeTab === 'templates'
  });

  // Mutations
  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTemplateRequest }) =>
      emailService.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      setEditingTemplate(null);
    }
  });

  // Handlers
  const handleEditTemplate = (tpl: EmailTemplate) => {
    setEditingTemplate(tpl);
    setTemplateForm({
      onderwerp: tpl.onderwerp,
      inhoud: tpl.inhoud,
      beschrijving: tpl.beschrijving
    });
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTemplate) {
      updateTemplateMutation.mutate({ id: editingTemplate.id, data: templateForm });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Email Beheer</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Beheer templates en bekijk inkomende/uitgaande mail.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`${activeTab === 'inbox' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            <InboxIcon className="w-5 h-5"/> Inbox
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`${activeTab === 'sent' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            <PaperAirplaneIcon className="w-5 h-5"/> Verzonden
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`${activeTab === 'templates' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
          >
            <DocumentDuplicateIcon className="w-5 h-5"/> Templates
          </button>
        </nav>
      </div>

      {/* --- INBOX CONTENT --- */}
      {activeTab === 'inbox' && (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loadIncoming ? <div className="p-8 text-center">Laden...</div> : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Van</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Onderwerp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ontvangen</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {incoming?.map((mail) => (
                  <tr key={mail.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">{mail.sender}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="font-medium text-gray-900 dark:text-white">{mail.subject}</div>
                      <div className="truncate max-w-xs text-xs mt-1">{mail.body.substring(0, 100)}...</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(mail.received_at).toLocaleString('nl-NL')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                       {mail.is_processed ? (
                         <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs">Verwerkt</span>
                       ) : (
                         <span className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full text-xs">Nieuw</span>
                       )}
                    </td>
                  </tr>
                ))}
                {incoming?.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-500">Geen inkomende berichten.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* --- SENT CONTENT --- */}
      {activeTab === 'sent' && (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
           {loadSent ? <div className="p-8 text-center">Laden...</div> : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Naar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Onderwerp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verzonden</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {sent?.map((mail) => (
                  <tr key={mail.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{mail.ontvanger}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{mail.onderwerp}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(mail.verzonden_op).toLocaleString('nl-NL')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                       {mail.status === 'verzonden' || mail.status === 'sent' ? (
                         <span className="text-green-600 flex items-center gap-1"><CheckCircleIcon className="w-4 h-4"/> Succes</span>
                       ) : (
                         <span className="text-red-600 flex items-center gap-1" title={mail.fout_bericht}>
                            <ExclamationCircleIcon className="w-4 h-4"/> Fout
                         </span>
                       )}
                    </td>
                  </tr>
                ))}
                 {sent?.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-500">Nog geen emails verzonden.</td></tr>}
              </tbody>
            </table>
           )}
        </div>
      )}

      {/* --- TEMPLATES CONTENT --- */}
      {activeTab === 'templates' && (
         <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
           {loadTemplates ? <div className="col-span-2 text-center">Laden...</div> : templates?.map((tpl) => (
             <div key={tpl.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{tpl.naam}</h3>
                        <p className="text-sm text-gray-500">{tpl.beschrijving || 'Geen beschrijving'}</p>
                    </div>
                    <button
                        onClick={() => handleEditTemplate(tpl)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    >
                        <PencilIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400">
                    Onderwerp: <span className="font-medium text-gray-700 dark:text-gray-300">{tpl.onderwerp}</span>
                </div>
             </div>
           ))}
         </div>
      )}

      {/* Template Edit Modal */}
      <Modal
        isOpen={!!editingTemplate}
        onClose={() => setEditingTemplate(null)}
        title={`Template Bewerken: ${editingTemplate?.naam}`}
      >
        <form onSubmit={handleSaveTemplate} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">Onderwerp</label>
                <input
                    className="w-full border rounded p-2 dark:bg-gray-800 dark:border-gray-600"
                    value={templateForm.onderwerp}
                    onChange={e => setTemplateForm({...templateForm, onderwerp: e.target.value})}
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Beschrijving (Intern)</label>
                <input
                    className="w-full border rounded p-2 dark:bg-gray-800 dark:border-gray-600"
                    value={templateForm.beschrijving || ''}
                    onChange={e => setTemplateForm({...templateForm, beschrijving: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Inhoud (HTML)</label>
                <textarea
                    className="w-full border rounded p-2 dark:bg-gray-800 dark:border-gray-600 font-mono text-sm h-64"
                    value={templateForm.inhoud}
                    onChange={e => setTemplateForm({...templateForm, inhoud: e.target.value})}
                    required
                />
                <p className="text-xs text-gray-500 mt-1">Gebruik {'{{.Naam}}'} etc. voor placeholders.</p>
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setEditingTemplate(null)} className="px-4 py-2 text-gray-600">Annuleren</button>
                <button
                    type="submit"
                    disabled={updateTemplateMutation.isPending}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Opslaan
                </button>
            </div>
        </form>
      </Modal>
    </div>
  );
};