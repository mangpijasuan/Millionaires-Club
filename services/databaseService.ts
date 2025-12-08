import { supabase } from './supabaseClient';
import { Member, Loan, Transaction, CommunicationLog, YearlyContribution } from '../types';

// ==========================================
// MEMBERS
// ==========================================

export const memberDB = {
  async getAll(): Promise<Member[]> {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data.map(transformMemberFromDB);
  },

  async getById(id: string): Promise<Member | null> {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data ? transformMemberFromDB(data) : null;
  },

  async create(member: Omit<Member, 'totalContribution' | 'activeLoanId' | 'lastLoanPaidDate'>): Promise<Member> {
    const dbMember = transformMemberToDB(member as Member);
    const { data, error } = await supabase
      .from('members')
      .insert([dbMember])
      .select()
      .single();
    
    if (error) throw error;
    return transformMemberFromDB(data);
  },

  async update(id: string, updates: Partial<Member>): Promise<Member> {
    const dbUpdates = transformMemberToDB(updates as Member, true);
    const { data, error } = await supabase
      .from('members')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return transformMemberFromDB(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async search(query: string): Promise<Member[]> {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,id.ilike.%${query}%`)
      .order('name');
    
    if (error) throw error;
    return data.map(transformMemberFromDB);
  }
};

// ==========================================
// LOANS
// ==========================================

export const loanDB = {
  async getAll(): Promise<Loan[]> {
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data.map(transformLoanFromDB);
  },

  async getById(id: string): Promise<Loan | null> {
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data ? transformLoanFromDB(data) : null;
  },

  async getByMemberId(memberId: string): Promise<Loan[]> {
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .or(`borrower_id.eq.${memberId},cosigner_id.eq.${memberId}`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data.map(transformLoanFromDB);
  },

  async getActiveLoans(): Promise<Loan[]> {
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .eq('status', 'ACTIVE')
      .order('next_payment_due');
    
    if (error) throw error;
    return data.map(transformLoanFromDB);
  },

  async create(loan: Loan): Promise<Loan> {
    const dbLoan = transformLoanToDB(loan);
    const { data, error } = await supabase
      .from('loans')
      .insert([dbLoan])
      .select()
      .single();
    
    if (error) throw error;
    return transformLoanFromDB(data);
  },

  async update(id: string, updates: Partial<Loan>): Promise<Loan> {
    const dbUpdates = transformLoanToDB(updates as Loan, true);
    const { data, error } = await supabase
      .from('loans')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return transformLoanFromDB(data);
  }
};

// ==========================================
// TRANSACTIONS
// ==========================================

export const transactionDB = {
  async getAll(filters?: { startDate?: string; endDate?: string; memberId?: string }): Promise<Transaction[]> {
    let query = supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (filters?.memberId) {
      query = query.eq('member_id', filters.memberId);
    }
    if (filters?.startDate) {
      query = query.gte('date', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('date', filters.endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data.map(transformTransactionFromDB);
  },

  async getById(id: string): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data ? transformTransactionFromDB(data) : null;
  },

  async getByMemberId(memberId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('member_id', memberId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data.map(transformTransactionFromDB);
  },

  async create(transaction: Transaction): Promise<Transaction> {
    const dbTransaction = transformTransactionToDB(transaction);
    const { data, error } = await supabase
      .from('transactions')
      .insert([dbTransaction])
      .select()
      .single();
    
    if (error) throw error;
    return transformTransactionFromDB(data);
  }
};

// ==========================================
// COMMUNICATION LOGS
// ==========================================

export const communicationDB = {
  async getAll(memberId?: string): Promise<CommunicationLog[]> {
    let query = supabase
      .from('communication_logs')
      .select('*')
      .order('date', { ascending: false });

    if (memberId) {
      query = query.eq('member_id', memberId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data.map(transformCommunicationFromDB);
  },

  async create(log: CommunicationLog): Promise<CommunicationLog> {
    const dbLog = transformCommunicationToDB(log);
    const { data, error } = await supabase
      .from('communication_logs')
      .insert([dbLog])
      .select()
      .single();
    
    if (error) throw error;
    return transformCommunicationFromDB(data);
  }
};

// ==========================================
// CONTRIBUTION HISTORY
// ==========================================

export const contributionHistoryDB = {
  async getByMemberId(memberId: string): Promise<YearlyContribution> {
    const { data, error } = await supabase
      .from('contribution_history')
      .select('*')
      .eq('member_id', memberId)
      .order('year');
    
    if (error) throw error;
    
    const result: YearlyContribution = {};
    data.forEach(row => {
      result[row.year] = row.amount;
    });
    return result;
  },

  async upsert(memberId: string, year: number, amount: number): Promise<void> {
    const { error } = await supabase
      .from('contribution_history')
      .upsert({
        id: `${memberId}-${year}`,
        member_id: memberId,
        year,
        amount
      });
    
    if (error) throw error;
  },

  async delete(memberId: string, year: number): Promise<void> {
    const { error } = await supabase
      .from('contribution_history')
      .delete()
      .eq('member_id', memberId)
      .eq('year', year);
    
    if (error) throw error;
  }
};

// ==========================================
// DATA TRANSFORMERS (DB <-> App format)
// ==========================================

function transformMemberFromDB(dbMember: any): Member {
  return {
    id: dbMember.id,
    name: dbMember.name,
    email: dbMember.email || '',
    joinDate: dbMember.join_date,
    accountStatus: dbMember.account_status,
    phone: dbMember.phone || '',
    address: dbMember.address || '',
    beneficiary: dbMember.beneficiary || '',
    totalContribution: parseFloat(dbMember.total_contribution) || 0,
    activeLoanId: dbMember.active_loan_id,
    lastLoanPaidDate: dbMember.last_loan_paid_date
  };
}

function transformMemberToDB(member: Member, partial = false): any {
  const dbMember: any = {};
  if (!partial || member.id !== undefined) dbMember.id = member.id;
  if (!partial || member.name !== undefined) dbMember.name = member.name;
  if (!partial || member.email !== undefined) dbMember.email = member.email;
  if (!partial || member.joinDate !== undefined) dbMember.join_date = member.joinDate;
  if (!partial || member.accountStatus !== undefined) dbMember.account_status = member.accountStatus;
  if (!partial || member.phone !== undefined) dbMember.phone = member.phone;
  if (!partial || member.address !== undefined) dbMember.address = member.address;
  if (!partial || member.beneficiary !== undefined) dbMember.beneficiary = member.beneficiary;
  if (!partial || member.totalContribution !== undefined) dbMember.total_contribution = member.totalContribution;
  if (!partial || member.activeLoanId !== undefined) dbMember.active_loan_id = member.activeLoanId;
  if (!partial || member.lastLoanPaidDate !== undefined) dbMember.last_loan_paid_date = member.lastLoanPaidDate;
  return dbMember;
}

function transformLoanFromDB(dbLoan: any): Loan {
  return {
    id: dbLoan.id,
    borrowerId: dbLoan.borrower_id,
    cosignerId: dbLoan.cosigner_id,
    originalAmount: parseFloat(dbLoan.original_amount),
    remainingBalance: parseFloat(dbLoan.remaining_balance),
    termMonths: dbLoan.term_months,
    status: dbLoan.status,
    startDate: dbLoan.start_date,
    nextPaymentDue: dbLoan.next_payment_due
  };
}

function transformLoanToDB(loan: Loan, partial = false): any {
  const dbLoan: any = {};
  if (!partial || loan.id !== undefined) dbLoan.id = loan.id;
  if (!partial || loan.borrowerId !== undefined) dbLoan.borrower_id = loan.borrowerId;
  if (!partial || loan.cosignerId !== undefined) dbLoan.cosigner_id = loan.cosignerId;
  if (!partial || loan.originalAmount !== undefined) dbLoan.original_amount = loan.originalAmount;
  if (!partial || loan.remainingBalance !== undefined) dbLoan.remaining_balance = loan.remainingBalance;
  if (!partial || loan.termMonths !== undefined) dbLoan.term_months = loan.termMonths;
  if (!partial || loan.status !== undefined) dbLoan.status = loan.status;
  if (!partial || loan.startDate !== undefined) dbLoan.start_date = loan.startDate;
  if (!partial || loan.nextPaymentDue !== undefined) dbLoan.next_payment_due = loan.nextPaymentDue;
  return dbLoan;
}

function transformTransactionFromDB(dbTxn: any): Transaction {
  return {
    id: dbTxn.id,
    memberId: dbTxn.member_id,
    type: dbTxn.type,
    amount: parseFloat(dbTxn.amount),
    date: dbTxn.date,
    description: dbTxn.description || '',
    paymentMethod: dbTxn.payment_method,
    receivedBy: dbTxn.received_by
  };
}

function transformTransactionToDB(txn: Transaction): any {
  return {
    id: txn.id,
    member_id: txn.memberId,
    type: txn.type,
    amount: txn.amount,
    date: txn.date,
    description: txn.description,
    payment_method: txn.paymentMethod,
    received_by: txn.receivedBy
  };
}

function transformCommunicationFromDB(dbLog: any): CommunicationLog {
  return {
    id: dbLog.id,
    memberId: dbLog.member_id,
    type: dbLog.type,
    content: dbLog.content,
    date: dbLog.date,
    direction: dbLog.direction,
    adminId: dbLog.admin_id
  };
}

function transformCommunicationToDB(log: CommunicationLog): any {
  return {
    id: log.id,
    member_id: log.memberId,
    type: log.type,
    content: log.content,
    date: log.date,
    direction: log.direction,
    admin_id: log.adminId
  };
}
