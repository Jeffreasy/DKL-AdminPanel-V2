export type NotulenStatus = 'draft' | 'finalized' | 'archived';

export interface AgendaItem {
  titel: string;
  beschrijving?: string;
  spreker?: string;
  tijdslot?: string;
}

export interface Besluit {
  beschrijving: string;
  verantwoordelijke?: string;
  deadline?: string | null;
}

export interface Actiepunt {
  beschrijving: string;
  verantwoordelijke: string;
  deadline?: string | null;
  status: string;
}

export interface Notulen {
  id: string;
  titel: string;
  vergadering_datum: string;
  locatie?: string;
  voorzitter?: string;
  notulist?: string;
  aanwezigen?: string[];
  afwezigen?: string[];
  aanwezigen_gebruiker_ids?: string[];
  afwezigen_gebruiker_ids?: string[];
  aanwezigen_gasten?: string[];
  afwezigen_gasten?: string[];
  agenda_items?: AgendaItem[];
  besluiten?: Besluit[];
  actiepunten?: Actiepunt[];
  notities?: string;
  status: string;
  versie: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  updated_by_id?: string;
  finalized_at?: string | null;
  finalized_by?: string | null;
}

export interface CreateNotulenRequest {
  titel: string;
  vergadering_datum: string;
  locatie?: string;
  voorzitter?: string;
  notulist?: string;
  aanwezigen?: string[];
  afwezigen?: string[];
  aanwezigen_gebruiker_ids?: string[];
  afwezigen_gebruiker_ids?: string[];
  aanwezigen_gasten?: string[];
  afwezigen_gasten?: string[];
  agenda_items?: AgendaItem[];
  besluiten?: Besluit[];
  actiepunten?: Actiepunt[];
  notities?: string;
}

export interface NotulenSearchFilters {
  query?: string;
  date_from?: string | null;
  date_to?: string | null;
  status?: string;
  created_by?: string | null;
  limit?: number;
  offset?: number;
}

export interface NotulenListResponse {
  notulen: Notulen[];
  total: number;
  limit: number;
  offset: number;
}