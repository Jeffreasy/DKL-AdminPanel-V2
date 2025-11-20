// src/services/types/index.ts

// ==========================================
// 1. AUTHENTICATION & USERS
// ==========================================

export interface Gebruiker {
    id: string;
    naam: string;
    email: string;
    is_actief: boolean;
    newsletter_subscribed: boolean;
    laatste_login: string | null;
    created_at: string;
    updated_at: string;
    role_id?: string; // Backward compatibility
    roles?: RBACRole[]; // Many-to-many relation
}

export interface GebruikerLogin {
    email: string;
    wachtwoord: string;
}

export interface Role {
    id: string;
    name: string;
    permissions: Record<string, string>[];
}

export interface AuthUserResponse {
    id: string;
    email: string;
    naam: string;
    permissions: Record<string, string>[];
    roles: Role[];
    is_actief: boolean;
}

export interface AuthLoginResponse {
    success: boolean;
    token: string;
    refresh_token: string;
    user: AuthUserResponse;
}

export interface AuthProfileResponse {
    id: string;
    naam: string;
    email: string;
    permissions: Record<string, string>[];
    roles: Role[];
    is_actief: boolean;
    laatste_login: string | null;
    created_at: string;
}

export interface Session {
    id: string;
    owner_id: string;
    access_token: string;
    device_info: {
        browser: string;
        browser_version: string;
        os: string;
        os_version: string;
        device_type: string;
        platform: string;
    };
    ip_address: string;
    user_agent: string;
    login_time: string;
    last_activity: string;
    expires_at: string;
    is_active: boolean;
    is_current: boolean;
}

export interface RefreshToken {
    id: string;
    owner_id: string;
    token: string;
    expires_at: string;
    created_at: string;
    revoked_at?: string | null;
    is_revoked: boolean;
}

export interface PasswordResetToken {
    id: string;
    email: string;
    token: string;
    expires_at: string;
    used_at?: string | null;
    is_used: boolean;
    created_at: string;
}

// ==========================================
// 2. RBAC (ROLES & PERMISSIONS)
// ==========================================

export interface RBACRole {
    id: string;
    name: string;
    description: string;
    is_system_role: boolean;
    created_at: string;
    updated_at: string;
    created_by?: string | null;
    permissions?: Permission[];
    users?: Gebruiker[];
}

export interface Permission {
    id: string;
    resource: string;
    action: string;
    description: string;
    is_system_permission: boolean;
    created_at: string;
    updated_at: string;
    roles?: RBACRole[];
}

export interface UserRole {
    id: string;
    user_id: string;
    role_id: string;
    assigned_at: string;
    assigned_by?: string | null;
    expires_at?: string | null;
    is_active: boolean;
    user?: Gebruiker;
    role?: RBACRole;
}

export interface RoleAssignment {
    user_id: string;
    role_id: string;
    assigned_by?: string;
    expires_at?: string;
}

// ==========================================
// 3. PARTICIPANTS & REGISTRATIONS
// ==========================================

export type AccountType = 'full' | 'temporary';

export interface Participant {
    id: string;
    created_at: string;
    updated_at: string;
    naam: string;
    email: string;
    telefoon: string;
    terms: boolean;
    gebruiker_id?: string | null;
    test_mode: boolean;
    
    // Dual Registration Fields
    account_type: AccountType;
    registration_year?: number | null;
    has_app_access: boolean;
    upgraded_to_gebruiker_id?: string | null;
    upgraded_at?: string | null;

    // Relations
    antwoorden?: ParticipantAntwoord[];
    event_registrations?: EventRegistration[];
}

export interface ParticipantAntwoord {
    id: string;
    participant_id: string;
    tekst: string;
    verzonden_op: string;
    verzonden_door: string;
    email_verzonden: boolean;
}

// Public Registration DTO (Form Input)
export interface PublicRegistrationRequest {
    naam: string;
    email: string;
    telefoon?: string;
    rol: string;
    afstand: string;
    ondersteuning: string;
    bijzonderheden?: string;
    heeft_vervoer: boolean;
    want_account: boolean;
    wachtwoord?: string;
    terms: boolean;
    event_id?: string;
    test_mode?: boolean;
}

export interface PublicRegistrationResponse {
    success: boolean;
    message: string;
    participant_id: string;
    registration_id?: string;
    account_type: AccountType;
    has_app_access: boolean;
    gebruiker_id?: string;
    event_name?: string;
    event_date?: string;
}

export interface EventRegistration {
    // Let op: Deze structuur kwam in de vorige prompt voorbij, 
    // ik voeg de belangrijkste velden hier toe voor volledigheid op basis van context.
    id: string;
    event_id: string;
    participant_id: string;
    status: string; 
    steps: number;
    total_distance: number;
    registered_at: string;
    check_in_time?: string | null;
    start_time?: string | null;
    finish_time?: string | null;
    tracking_status?: string | null;
}

// ==========================================
// 4. CONTENT (CMS: Partner, Sponsor, Photo, etc)
// ==========================================

export interface Partner {
    id: string;
    name: string;
    description: string;
    logo: string;
    website: string;
    tier: string;
    since: string;
    visible: boolean;
    order_number: number;
    created_at: string;
    updated_at: string;
}

export interface Sponsor {
    id: string;
    name: string;
    description: string;
    logo_url: string;
    website_url: string;
    order_number: number;
    is_active: boolean;
    visible: boolean;
    created_at: string;
    updated_at: string;
}

export interface Photo {
    id: string;
    url: string;
    alt_text: string;
    visible: boolean;
    thumbnail_url: string;
    title: string;
    description: string;
    year: number;
    cloudinary_folder: string;
    created_at: string;
    updated_at: string;
}

export interface Video {
    id: string;
    video_id: string; // YouTube ID usually
    url: string;
    title: string;
    description: string;
    thumbnail_url: string;
    visible: boolean;
    order_number: number;
    created_at: string;
    updated_at: string;
}

export interface NewsItem {
    title: string;
    description: string;
    link: string;
    pub_date: string;
    category: string;
}

export interface Newsletter {
    id: string;
    subject: string;
    content: string;
    sent_at?: string | null;
    batch_id?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateNewsletterRequest {
    subject: string;
    content: string;
}

export interface ProgramSchedule {
    id: string;
    time: string;
    event_description: string;
    category: string;
    icon_name: string;
    order_number: number;
    visible: boolean;
    latitude?: number | null;
    longitude?: number | null;
    created_at: string;
    updated_at: string;
}

export interface RadioRecording {
    id: string;
    title: string;
    description: string;
    date: string;
    audio_url: string;
    thumbnail_url: string;
    visible: boolean;
    order_number: number;
    created_at: string;
    updated_at: string;
}

export interface SocialEmbed {
    id: string;
    platform: string;
    embed_code: string;
    order_number: number;
    visible: boolean;
    created_at: string;
    updated_at: string;
}

export interface SocialLink {
    id: string;
    platform: string;
    url: string;
    bg_color_class?: string | null;
    icon_color_class?: string | null;
    order_number: number;
    visible: boolean;
    created_at: string;
    updated_at: string;
}

export interface TitleSection {
    id: string;
    event_title: string;
    event_subtitle: string;
    image_url: string;
    image_alt: string;
    detail_1_title: string;
    detail_1_description: string;
    detail_2_title: string;
    detail_2_description: string;
    detail_3_title: string;
    detail_3_description: string;
    participant_count: number;
    created_at: string;
    updated_at: string;
}

export interface UnderConstruction {
    id: number;
    is_active: boolean;
    title: string;
    message: string;
    footer_text: string;
    logo_url: string;
    expected_date?: string | null;
    social_links: string; // JSON string
    progress_percentage: number;
    contact_email: string;
    newsletter_enabled: boolean;
    created_at: string;
    updated_at: string;
}

// ==========================================
// 5. NOTULEN (MEETING MINUTES)
// ==========================================

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
    vergadering_datum: string; // Date string
    locatie?: string;
    voorzitter?: string;
    notulist?: string;
    aanwezigen?: string[];
    afwezigen?: string[];
    aanwezigen_gebruiker_ids?: string[]; // UUID[]
    afwezigen_gebruiker_ids?: string[];  // UUID[]
    aanwezigen_gasten?: string[];
    afwezigen_gasten?: string[];
    
    agenda_items?: AgendaItem[];
    besluiten?: Besluit[];
    actiepunten?: Actiepunt[];
    
    notities?: string;
    status: string; // 'draft', etc.
    versie: number;
    created_by: string;
    created_at: string;
    updated_at: string;
    updated_by_id?: string;
    finalized_at?: string | null;
    finalized_by?: string | null;
}

export interface NotulenResponse extends Notulen {
    created_by_name?: string;
    updated_by_name?: string;
    finalized_by_name?: string;
}

export interface NotulenCreateRequest {
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

// ==========================================
// 6. LEADERBOARD & GAMIFICATION
// ==========================================

export interface LeaderboardEntry {
    id: string;
    naam: string;
    route: string;
    steps: number;
    achievement_points: number;
    total_score: number;
    rank: number;
    badge_count: number;
    joined_at: string;
}

export interface LeaderboardResponse {
    entries: LeaderboardEntry[];
    total_entries: number;
    current_page?: number;
    total_pages?: number;
    limit?: number;
}

export interface ParticipantRankInfo {
    participant_id: string;
    naam: string;
    rank: number;
    total_score: number;
    steps: number;
    achievement_points: number;
    badge_count: number;
    above_me?: LeaderboardEntry;
    below_me?: LeaderboardEntry;
}

export interface RouteFund {
    id: string;
    route: string;
    amount: number;
    created_at: string;
    updated_at: string;
}

// ==========================================
// 7. COMMUNICATION (EMAIL, NOTIFICATIONS, WFC)
// ==========================================

export interface IncomingEmail {
    id: string;
    message_id: string;
    sender: string; // Mapped from 'From'
    to: string;
    subject: string;
    body: string;
    content_type: string;
    received_at: string;
    uid: string;
    account_type: string;
    read: boolean; // Mapped from 'IsProcessed'
    processed_at?: string | null;
}

export interface VerzondEmail {
    id: string;
    ontvanger: string;
    onderwerp: string;
    inhoud: string;
    verzonden_op: string;
    status: string;
    fout_bericht: string;
    contact_id?: string;
    participant_id?: string;
    template_id?: string;
}

export interface Notification {
    id: string;
    type: string;
    priority: string;
    title: string;
    message: string;
    sent: boolean;
    sent_at?: string | null;
    created_at: string;
    updated_at: string;
}

// WFC (Whisky For Charity)
export interface WFCOrderItem {
    id: string;
    order_id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
}

export interface WFCOrder {
    id: string;
    customer_name: string;
    customer_email: string;
    customer_address: string;
    customer_city: string;
    customer_postal: string;
    customer_country: string;
    total_amount: number;
    status: string;
    payment_reference?: string;
    items: WFCOrderItem[];
    created_at: string;
    updated_at?: string;
}

// ==========================================
// 8. UTILS
// ==========================================

export interface UploadedImage {
    id: string;
    user_id: string;
    public_id: string;
    url: string;
    secure_url: string;
    filename: string;
    size: number;
    mime_type: string;
    width: number;
    height: number;
    folder: string;
    thumbnail_url?: string | null;
    created_at: string;
    updated_at: string;
}