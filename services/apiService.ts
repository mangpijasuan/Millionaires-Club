import { Member, Loan, Transaction, CommunicationLog } from '../types';

// Configuration
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000/api';

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('auth_token');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// ============= MEMBER ENDPOINTS =============
export const memberAPI = {
  getAll: () => apiCall<Member[]>('/members'),
  
  getById: (id: string) => apiCall<Member>(`/members/${id}`),
  
  create: (member: Omit<Member, 'id'>) => 
    apiCall<Member>('/members', {
      method: 'POST',
      body: JSON.stringify(member),
    }),
  
  update: (id: string, member: Partial<Member>) =>
    apiCall<Member>(`/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(member),
    }),
  
  delete: (id: string) =>
    apiCall<void>(`/members/${id}`, { method: 'DELETE' }),
};

// ============= LOAN ENDPOINTS =============
export const loanAPI = {
  getAll: () => apiCall<Loan[]>('/loans'),
  
  getById: (id: string) => apiCall<Loan>(`/loans/${id}`),
  
  getByMemberId: (memberId: string) => 
    apiCall<Loan[]>(`/loans/member/${memberId}`),
  
  create: (loan: Omit<Loan, 'id'>) =>
    apiCall<Loan>('/loans', {
      method: 'POST',
      body: JSON.stringify(loan),
    }),
  
  update: (id: string, loan: Partial<Loan>) =>
    apiCall<Loan>(`/loans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(loan),
    }),
  
  makePayment: (loanId: string, amount: number) =>
    apiCall<Loan>(`/loans/${loanId}/payment`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),
};

// ============= TRANSACTION ENDPOINTS =============
export const transactionAPI = {
  getAll: (params?: { startDate?: string; endDate?: string; memberId?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiCall<Transaction[]>(`/transactions${query ? `?${query}` : ''}`);
  },
  
  getById: (id: string) => apiCall<Transaction>(`/transactions/${id}`),
  
  getByMemberId: (memberId: string) =>
    apiCall<Transaction[]>(`/transactions/member/${memberId}`),
  
  create: (transaction: Omit<Transaction, 'id'>) =>
    apiCall<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    }),
};

// ============= CONTRIBUTION ENDPOINTS =============
export const contributionAPI = {
  recordContribution: (memberId: string, amount: number, date: string) =>
    apiCall('/contributions', {
      method: 'POST',
      body: JSON.stringify({ memberId, amount, date }),
    }),
  
  getHistory: (memberId: string) =>
    apiCall(`/contributions/member/${memberId}`),
  
  getYearlyReport: (year: number) =>
    apiCall(`/contributions/report/${year}`),
};

// ============= COMMUNICATION ENDPOINTS =============
export const communicationAPI = {
  getAll: (memberId?: string) => {
    const query = memberId ? `?memberId=${memberId}` : '';
    return apiCall<CommunicationLog[]>(`/communications${query}`);
  },
  
  create: (log: Omit<CommunicationLog, 'id'>) =>
    apiCall<CommunicationLog>('/communications', {
      method: 'POST',
      body: JSON.stringify(log),
    }),
};

// ============= STATISTICS ENDPOINTS =============
export const statsAPI = {
  getDashboard: () => apiCall<{
    totalFund: number;
    activeMembers: number;
    activeLoans: number;
    totalDisbursed: number;
    monthlyContributions: number;
  }>('/stats/dashboard'),
  
  getFinancialReport: (startDate: string, endDate: string) =>
    apiCall(`/stats/report?start=${startDate}&end=${endDate}`),
};

// ============= AUTHENTICATION ENDPOINTS =============
export const authAPI = {
  login: (username: string, password: string, role: 'admin' | 'member') =>
    apiCall<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password, role }),
    }),
  
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  },
  
  verifyToken: () => apiCall('/auth/verify'),
};

// Export all APIs
export const API = {
  members: memberAPI,
  loans: loanAPI,
  transactions: transactionAPI,
  contributions: contributionAPI,
  communications: communicationAPI,
  stats: statsAPI,
  auth: authAPI,
};
