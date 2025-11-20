export interface EmailTemplate {
  id: string;
  naam: string;
  onderwerp: string;
  inhoud: string; // HTML content
  beschrijving?: string;
  is_actief: boolean;
  updated_at: string;
}

export interface IncomingEmail {
  id: string;
  sender: string; // Mapped from 'from'
  subject: string;
  body: string;
  received_at: string;
  is_processed: boolean;
  account_type: string; // 'info' of 'inschrijving'
}

export interface SentEmail {
  id: string;
  ontvanger: string;
  onderwerp: string;
  inhoud: string;
  verzonden_op: string;
  status: string;
  fout_bericht?: string;
}

export interface UpdateTemplateRequest {
  onderwerp: string;
  inhoud: string;
  beschrijving?: string;
}