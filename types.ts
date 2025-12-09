
export interface Member {
  id: string;
  name: string;
  nickname: string; // Added nickname field
  email: string;
  password?: string; // Added password field for authentication
  joinDate: string;
  accountStatus: 'Active' | 'Inactive';
  phone: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  beneficiary: string;
  totalContribution: number;
  activeLoanId: string | null;
  lastLoanPaidDate: string | null;
  autoPay?: boolean;
}

export interface Loan {
  id: string;
  borrowerId: string;
  cosignerId?: string;
  originalAmount: number;
  remainingBalance: number;
  termMonths: number;
  status: 'ACTIVE' | 'PAID' | 'DEFAULTED';
  startDate: string;
  nextPaymentDue: string;
  issuedBy?: string; // Added to track which board member authorized the loan
  borrowerSignature?: string;
  signedDate?: string;
}

export interface LoanApplication {
  id: string;
  memberId: string;
  amount: number;
  term: number;
  purpose: string;
  proposedCosignerId: string; // Changed from name to ID for accuracy
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface Transaction {
  id: string;
  memberId: string;
  type: 'CONTRIBUTION' | 'LOAN_DISBURSAL' | 'LOAN_REPAYMENT' | 'FEE' | 'DISTRIBUTION';
  amount: number;
  date: string;
  description: string;
  paymentMethod?: string;
  receivedBy?: string;
  status?: 'completed' | 'pending' | 'failed';
}

export interface CommunicationLog {
  id: string;
  memberId: string;
  type: 'System' | 'Note' | 'Email' | 'SMS';
  content: string;
  date: string;
  direction: 'Inbound' | 'Outbound';
  adminId?: string;
}

export interface YearlyContribution {
  [year: number]: number;
}
