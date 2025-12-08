import React from 'react';
import { Member, Transaction } from '../types';
import { FileText } from 'lucide-react';

interface Props {
  members: Member[];
  transactions: Transaction[];
  isDark?: boolean;
}

const TransactionHistoryComponent: React.FC<Props> = ({ members, transactions, isDark = false }) => {
  // Theme classes
  const cardClass = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const textPrimary = isDark ? 'text-white' : 'text-slate-800';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';
  const bgHeader = isDark ? 'bg-slate-900' : 'bg-slate-50';
  const borderColor = isDark ? 'border-slate-700' : 'border-slate-100';

  return (
    <div className={`p-6 rounded-2xl shadow-sm border animate-in fade-in ${cardClass}`}>
      <div className="flex items-center gap-2 mb-6">
         <FileText className={textSecondary} />
         <h3 className={`font-bold text-lg ${textPrimary}`}>Global Transaction Ledger</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className={`${bgHeader} ${textSecondary} font-semibold border-b ${borderColor} uppercase tracking-wider text-xs`}>
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Transaction ID</th>
              <th className="px-6 py-4">Member</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Method</th>
              <th className="px-6 py-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${borderColor}`}>
            {transactions.map(t => {
              const member = members.find(m => m.id === t.memberId);
              const isCredit = t.type === 'CONTRIBUTION' || t.type === 'LOAN_REPAYMENT';
              return (
                <tr key={t.id} className={`transition-colors ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}`}>
                  <td className={`px-6 py-4 ${textSecondary} whitespace-nowrap`}>{new Date(t.date).toLocaleString()}</td>
                  <td className={`px-6 py-4 font-mono text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t.id}</td>
                  <td className={`px-6 py-4 font-medium ${textPrimary}`}>{member?.name || t.memberId}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${
                       t.type === 'CONTRIBUTION' 
                         ? (isDark ? 'bg-emerald-900/50 text-emerald-400 border-emerald-800' : 'bg-emerald-50 text-emerald-700 border-emerald-100')
                         : t.type === 'LOAN_DISBURSAL' 
                           ? (isDark ? 'bg-blue-900/50 text-blue-400 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-100')
                           : (isDark ? 'bg-slate-700 text-slate-400 border-slate-600' : 'bg-slate-50 text-slate-700 border-slate-200')
                    }`}>
                      {t.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className={`px-6 py-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.description}</td>
                  <td className={`px-6 py-4 text-xs ${textSecondary}`}>
                      {t.paymentMethod && (
                          <div className="flex flex-col">
                              <span>{t.paymentMethod}</span>
                              {t.receivedBy && <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Rec: {t.receivedBy}</span>}
                          </div>
                      )}
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${isCredit ? 'text-emerald-600' : (isDark ? 'text-slate-300' : 'text-slate-700')}`}>
                    {isCredit ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {transactions.length === 0 && (
         <div className={`text-center py-12 ${textSecondary}`}>No transactions found in ledger.</div>
      )}
    </div>
  );
};

export default TransactionHistoryComponent;