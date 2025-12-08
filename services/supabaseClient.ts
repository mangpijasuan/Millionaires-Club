import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Types for database tables
export type Database = {
  public: {
    Tables: {
      members: {
        Row: {
          id: string;
          name: string;
          email: string;
          join_date: string;
          account_status: 'Active' | 'Inactive';
          phone: string;
          address: string;
          beneficiary: string;
          total_contribution: number;
          active_loan_id: string | null;
          last_loan_paid_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['members']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['members']['Insert']>;
      };
      loans: {
        Row: {
          id: string;
          borrower_id: string;
          cosigner_id: string | null;
          original_amount: number;
          remaining_balance: number;
          term_months: number;
          status: 'ACTIVE' | 'PAID' | 'DEFAULTED';
          start_date: string;
          next_payment_due: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['loans']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['loans']['Insert']>;
      };
      transactions: {
        Row: {
          id: string;
          member_id: string;
          type: 'CONTRIBUTION' | 'LOAN_DISBURSAL' | 'LOAN_REPAYMENT' | 'FEE';
          amount: number;
          date: string;
          description: string;
          payment_method: string | null;
          received_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['transactions']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>;
      };
      communication_logs: {
        Row: {
          id: string;
          member_id: string;
          type: 'System' | 'Note' | 'Email' | 'SMS';
          content: string;
          date: string;
          direction: 'Inbound' | 'Outbound';
          admin_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['communication_logs']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['communication_logs']['Insert']>;
      };
      contribution_history: {
        Row: {
          id: string;
          member_id: string;
          year: number;
          amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['contribution_history']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['contribution_history']['Insert']>;
      };
      admin_users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: 'admin' | 'super_admin';
          created_at: string;
          last_login: string | null;
        };
        Insert: Omit<Database['public']['Tables']['admin_users']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['admin_users']['Insert']>;
      };
    };
  };
};
