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