-- Supabase Database Schema Setup
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- Members Table
CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    join_date TEXT NOT NULL,
    account_status TEXT DEFAULT 'Active' CHECK (account_status IN ('Active', 'Inactive')),
    phone TEXT,
    address TEXT,
    beneficiary TEXT,
    total_contribution DECIMAL(10,2) DEFAULT 0,
    active_loan_id TEXT,
    last_loan_paid_date TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loans Table
CREATE TABLE IF NOT EXISTS loans (
    id TEXT PRIMARY KEY,
    borrower_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    cosigner_id TEXT REFERENCES members(id),
    original_amount DECIMAL(10,2) NOT NULL,
    remaining_balance DECIMAL(10,2) NOT NULL,
    term_months INTEGER NOT NULL,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAID', 'DEFAULTED')),
    start_date TEXT NOT NULL,
    next_payment_due TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('CONTRIBUTION', 'LOAN_DISBURSAL', 'LOAN_REPAYMENT', 'FEE')),
    amount DECIMAL(10,2) NOT NULL,
    date TEXT NOT NULL,
    description TEXT,
    payment_method TEXT,
    received_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Communication Logs Table
CREATE TABLE IF NOT EXISTS communication_logs (
    id TEXT PRIMARY KEY,
    member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('System', 'Note', 'Email', 'SMS')),
    content TEXT NOT NULL,
    date TEXT NOT NULL,
    direction TEXT CHECK (direction IN ('Inbound', 'Outbound')),
    admin_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contribution History Table
CREATE TABLE IF NOT EXISTS contribution_history (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(member_id, year)
);

-- Admin Users Table (for authentication)
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- INDEXES for better query performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(account_status);
CREATE INDEX IF NOT EXISTS idx_loans_borrower ON loans(borrower_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_transactions_member ON transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_contribution_history_member ON contribution_history(member_id);
CREATE INDEX IF NOT EXISTS idx_contribution_history_year ON contribution_history(year);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contribution_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Admin Users Policies
CREATE POLICY "Admin users can view all admin users"
    ON admin_users FOR SELECT
    TO authenticated
    USING (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Admin users can update their own profile"
    ON admin_users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Members Policies (Admin and Member access)
CREATE POLICY "Authenticated users can view all members"
    ON members FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can insert members"
    ON members FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Admins can update members"
    ON members FOR UPDATE
    TO authenticated
    USING (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Admins can delete members"
    ON members FOR DELETE
    TO authenticated
    USING (auth.uid() IN (SELECT id FROM admin_users));

-- Loans Policies
CREATE POLICY "Authenticated users can view loans"
    ON loans FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage loans"
    ON loans FOR ALL
    TO authenticated
    USING (auth.uid() IN (SELECT id FROM admin_users));

-- Transactions Policies
CREATE POLICY "Authenticated users can view transactions"
    ON transactions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage transactions"
    ON transactions FOR ALL
    TO authenticated
    USING (auth.uid() IN (SELECT id FROM admin_users));

-- Communication Logs Policies
CREATE POLICY "Authenticated users can view communication logs"
    ON communication_logs FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage communication logs"
    ON communication_logs FOR ALL
    TO authenticated
    USING (auth.uid() IN (SELECT id FROM admin_users));

-- Contribution History Policies
CREATE POLICY "Authenticated users can view contribution history"
    ON contribution_history FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage contribution history"
    ON contribution_history FOR ALL
    TO authenticated
    USING (auth.uid() IN (SELECT id FROM admin_users));

-- =====================================================
-- TRIGGERS for updated_at timestamps
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contribution_history_updated_at BEFORE UPDATE ON contribution_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTIONS for admin user creation
-- =====================================================

-- Function to automatically create admin_users entry on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.admin_users (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'role', 'admin')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function after user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- COMPLETED! Next steps:
-- 1. Add your admin email in Supabase Authentication
-- 2. Sign up through your app
-- 3. The admin_users entry will be created automatically
-- =====================================================
