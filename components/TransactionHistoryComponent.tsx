
import React from 'react';
import { Member, Transaction } from '../types';
import { FileText } from 'lucide-react';

interface Props {
  members: Member[];
  transactions: Transaction[];
}

const TransactionHistoryComponent: React.FC<Props> = ({ members, transactions }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 animate-in fade-in">
      <div className="flex items-center gap-2 mb-6">
         <FileText className="text-slate-400" />
         <h3 className="font-bold text-lg text-slate-800 dark:text-white">Global Transaction Ledger</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-700 uppercase tracking-wider text-xs">
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
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {transactions.map(t => {
              const member = members.find(m => m.id === t.memberId);
              const isCredit = t.type === 'CONTRIBUTION' || t.type === 'LOAN_REPAYMENT';
              return (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">{new Date(t.date).toLocaleString()}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">{t.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{member?.name || t.memberId}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${
                       t.type === 'CONTRIBUTION' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' :
                       t.type === 'LOAN_DISBURSAL' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800' :
                       'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                    }`}>
                      {t.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{t.description}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-500 text-xs">
                      {t.paymentMethod && (
                          <div className="flex flex-col">
                              <span>{t.paymentMethod}</span>
                              {t.receivedBy && <span className="text-slate-400">Rec: {t.receivedBy}</span>}
                          </div>
                      )}
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {isCredit ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {transactions.length === 0 && (
         <div className="text-center py-12 text-slate-400">No transactions found in ledger.</div>
      )}
    </div>
  );
};

export default TransactionHistoryComponent;
