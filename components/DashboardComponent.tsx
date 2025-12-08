import React, { useState } from 'react';
import { Member, Loan, Transaction } from '../types';
import { Users, Wallet, CreditCard, TrendingUp, DollarSign, AlertCircle, Calendar, UserCheck, UserX, ChevronRight, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  members: Member[];
  loans: Loan[];
  transactions: Transaction[];
  setActiveTab: (tab: string) => void;
  isDark?: boolean;
}

const DashboardComponent: React.FC<DashboardProps> = ({ members, loans, transactions, setActiveTab, isDark = false }) => {
  const totalMembers = members.length;
  const activeMembersCount = members.filter(m => m.accountStatus === 'Active').length;
  const inactiveMembersCount = members.filter(m => m.accountStatus === 'Inactive').length;
  
  const totalFunds = members.reduce((sum, m) => sum + m.totalContribution, 0);
  const totalLoaned = loans.filter(l => l.status === 'ACTIVE').reduce((sum, l) => sum + l.originalAmount, 0);
  const activeLoanCount = loans.filter(l => l.status === 'ACTIVE').length;

  // --- Chart Data (Last 6 months contributions) ---
  const chartData = transactions
    .filter(t => t.type === 'CONTRIBUTION')
    .slice(0, 50) 
    .map(t => ({ date: new Date(t.date).toLocaleDateString(), amount: t.amount }));

  // --- Loan Dues Logic ---
  const activeLoans = loans
    .filter(l => l.status === 'ACTIVE')
    .sort((a, b) => new Date(a.nextPaymentDue).getTime() - new Date(b.nextPaymentDue).getTime());

  // --- Contribution Dues Logic ---
  const date = new Date();
  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();
  const currentMonthName = date.toLocaleString('default', { month: 'long' });

  // Get IDs of members who have paid at least once this month
  const paidMemberIds = new Set(transactions
    .filter(t => {
        const d = new Date(t.date);
        return t.type === 'CONTRIBUTION' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .map(t => t.memberId)
  );

  const unpaidMembers = members.filter(m => m.accountStatus === 'Active' && !paidMemberIds.has(m.id));

  // Card classes for dark mode
  const cardClass = isDark 
    ? 'bg-slate-800 border-slate-700' 
    : 'bg-white border-slate-200';
  const cardHoverBlue = isDark
    ? 'hover:border-blue-500 hover:shadow-lg'
    : 'hover:border-blue-300 hover:shadow-md';
  const cardHoverGreen = isDark
    ? 'hover:border-emerald-500 hover:shadow-lg'
    : 'hover:border-emerald-300 hover:shadow-md';
  const cardHoverRed = isDark
    ? 'hover:border-red-500 hover:shadow-lg'
    : 'hover:border-red-300 hover:shadow-md';
  const cardHoverAmber = isDark
    ? 'hover:border-amber-500 hover:shadow-lg'
    : 'hover:border-amber-300 hover:shadow-md';
  const textPrimary = isDark ? 'text-white' : 'text-slate-800';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';
  const textTertiary = isDark ? 'text-slate-500' : 'text-slate-400';
  const bgHeader = isDark ? 'bg-slate-900' : 'bg-slate-50';
  const borderColor = isDark ? 'border-slate-700' : 'border-slate-100';

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* 1. Top Stats / Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members */}
        <div 
            onClick={() => setActiveTab('members')}
            className={`p-5 rounded-2xl shadow-sm border cursor-pointer transition-all group ${cardClass} ${cardHoverBlue}`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className={`${textSecondary} text-xs font-bold uppercase mb-1`}>Total Members</p>
                    <h3 className={`text-2xl font-bold ${textPrimary} group-hover:text-blue-600 transition-colors`}>{totalMembers}</h3>
                </div>
                <div className={`p-2.5 rounded-xl transition-colors ${isDark ? 'bg-blue-900/50 text-blue-400 group-hover:bg-blue-800' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'}`}><Users size={20}/></div>
            </div>
        </div>

        {/* Active Members */}
        <div 
            className={`p-5 rounded-2xl shadow-sm border cursor-pointer transition-all group ${cardClass} ${cardHoverGreen}`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className={`${textSecondary} text-xs font-bold uppercase mb-1`}>Active Members</p>
                    <h3 className={`text-2xl font-bold ${textPrimary} group-hover:text-emerald-600 transition-colors`}>{activeMembersCount}</h3>
                </div>
                <div className={`p-2.5 rounded-xl transition-colors ${isDark ? 'bg-emerald-900/50 text-emerald-400 group-hover:bg-emerald-800' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'}`}><UserCheck size={20}/></div>
            </div>
        </div>

        {/* Inactive Members */}
        <div 
            className={`p-5 rounded-2xl shadow-sm border cursor-pointer transition-all group ${cardClass} ${cardHoverRed}`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className={`${textSecondary} text-xs font-bold uppercase mb-1`}>Inactive Members</p>
                    <h3 className={`text-2xl font-bold ${textPrimary} group-hover:text-red-600 transition-colors`}>{inactiveMembersCount}</h3>
                </div>
                <div className={`p-2.5 rounded-xl transition-colors ${isDark ? 'bg-red-900/50 text-red-400 group-hover:bg-red-800' : 'bg-red-50 text-red-600 group-hover:bg-red-100'}`}><UserX size={20}/></div>
            </div>
        </div>

        {/* Total Funds */}
        <div 
            onClick={() => setActiveTab('contributions')}
            className={`p-5 rounded-2xl shadow-sm border cursor-pointer transition-all group ${cardClass} ${cardHoverAmber}`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className={`${textSecondary} text-xs font-bold uppercase mb-1`}>Total Funds</p>
                    <h3 className={`text-2xl font-bold ${textPrimary} group-hover:text-amber-600 transition-colors`}>${totalFunds.toLocaleString()}</h3>
                </div>
                <div className={`p-2.5 rounded-xl transition-colors ${isDark ? 'bg-amber-900/50 text-amber-400 group-hover:bg-amber-800' : 'bg-amber-50 text-amber-600 group-hover:bg-amber-100'}`}><Wallet size={20}/></div>
            </div>
        </div>
      </div>

      {/* 2. Dues & Action Items Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left: Loan Payments Due */}
          <div className={`rounded-2xl shadow-sm border overflow-hidden flex flex-col h-96 ${cardClass}`}>
              <div className={`p-5 border-b ${borderColor} ${bgHeader} flex justify-between items-center`}>
                  <h3 className={`font-bold ${textPrimary} flex items-center gap-2`}>
                      <Calendar size={18} className="text-blue-600"/> Loan Payment Dues
                  </h3>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>{activeLoans.length} Active</span>
              </div>
              <div className="flex-1 overflow-y-auto p-0">
                  <table className="w-full text-sm text-left">
                      <thead className={`${textSecondary} font-semibold border-b ${borderColor} sticky top-0 z-10`}>
                          <tr>
                              <th className={`px-5 py-3 ${bgHeader}`}>Borrower</th>
                              <th className={`px-5 py-3 ${bgHeader}`}>Due Date</th>
                              <th className={`px-5 py-3 ${bgHeader} text-right`}>Min. Due</th>
                              <th className={`px-5 py-3 ${bgHeader} text-right`}>Balance</th>
                          </tr>
                      </thead>
                      <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-50'}`}>
                          {activeLoans.map(loan => {
                              const borrower = members.find(m => m.id === loan.borrowerId);
                              const dueDate = new Date(loan.nextPaymentDue);
                              const isOverdue = new Date() > dueDate;
                              const monthlyDue = loan.originalAmount / loan.termMonths;

                              return (
                                  <tr key={loan.id} className={`transition-colors ${isDark ? 'hover:bg-blue-900/20' : 'hover:bg-blue-50/50'}`}>
                                      <td className="px-5 py-3">
                                          <div className={`font-medium ${textPrimary}`}>{borrower?.name || loan.borrowerId}</div>
                                          <div className={`text-xs ${textTertiary}`}>{loan.id}</div>
                                      </td>
                                      <td className="px-5 py-3">
                                          <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-600 font-bold' : isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                              {isOverdue && <AlertCircle size={14}/>}
                                              {dueDate.toLocaleDateString()}
                                          </div>
                                          {isOverdue && <div className="text-[10px] text-red-500">Late Fee Applies</div>}
                                      </td>
                                      <td className={`px-5 py-3 text-right font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                          ${monthlyDue.toFixed(2)}
                                      </td>
                                      <td className="px-5 py-3 text-right font-bold text-blue-600">
                                          ${loan.remainingBalance.toLocaleString()}
                                      </td>
                                  </tr>
                              );
                          })}
                          {activeLoans.length === 0 && (
                              <tr><td colSpan={4} className={`p-8 text-center ${textTertiary} italic`}>No active loans pending.</td></tr>
                          )}
                      </tbody>
                  </table>
              </div>
              <div className={`p-3 border-t ${borderColor} ${bgHeader} text-center`}>
                  <button onClick={() => setActiveTab('loans')} className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1">
                      Manage Loans <ChevronRight size={14}/>
                  </button>
              </div>
          </div>

          {/* Right: Monthly Contribution Dues */}
          <div className={`rounded-2xl shadow-sm border overflow-hidden flex flex-col h-96 ${cardClass}`}>
              <div className={`p-5 border-b ${borderColor} ${bgHeader} flex justify-between items-center`}>
                  <h3 className={`font-bold ${textPrimary} flex items-center gap-2`}>
                      <AlertCircle size={18} className="text-amber-500"/> Pending Contributions
                  </h3>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${isDark ? 'bg-amber-900/50 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>{currentMonthName}</span>
              </div>
              
              <div className={`px-5 py-3 border-b ${borderColor} ${isDark ? 'bg-slate-800' : 'bg-white'} flex justify-between items-center text-xs ${textSecondary}`}>
                   <span><strong>{unpaidMembers.length}</strong> members have not paid this month.</span>
                   <div className="flex gap-2">
                       <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Paid</span>
                       <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Pending</span>
                   </div>
              </div>

              <div className="flex-1 overflow-y-auto p-0">
                  <table className="w-full text-sm text-left">
                      <thead className={`${textSecondary} font-semibold border-b ${borderColor} sticky top-0 z-10`}>
                           <tr>
                               <th className={`px-5 py-3 ${bgHeader}`}>Member Name</th>
                               <th className={`px-5 py-3 ${bgHeader}`}>ID</th>
                               <th className={`px-5 py-3 ${bgHeader} text-right`}>Action</th>
                           </tr>
                      </thead>
                      <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-50'}`}>
                          {unpaidMembers.slice(0, 50).map(member => (
                              <tr key={member.id} className={`transition-colors ${isDark ? 'hover:bg-amber-900/20' : 'hover:bg-amber-50/50'}`}>
                                  <td className={`px-5 py-2.5 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{member.name}</td>
                                  <td className={`px-5 py-2.5 font-mono text-xs ${textTertiary}`}>{member.id}</td>
                                  <td className="px-5 py-2.5 text-right">
                                      <button 
                                        onClick={() => setActiveTab('contributions')}
                                        className={`text-[10px] font-bold border px-2 py-1 rounded transition-colors ${isDark ? 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-emerald-900/50 hover:text-emerald-400 hover:border-emerald-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'}`}
                                      >
                                          Record Pay
                                      </button>
                                  </td>
                              </tr>
                          ))}
                          {unpaidMembers.length === 0 && (
                              <tr><td colSpan={3} className="p-8 text-center text-emerald-500 font-medium"><CheckCircle size={32} className="mx-auto mb-2"/> All active members have paid for {currentMonthName}!</td></tr>
                          )}
                      </tbody>
                  </table>
              </div>
              {unpaidMembers.length > 50 && (
                  <div className={`p-2 text-center text-xs ${textTertiary} ${bgHeader} border-t ${borderColor}`}>
                      Showing first 50 of {unpaidMembers.length} pending
                  </div>
              )}
          </div>

      </div>

      {/* 3. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 p-6 rounded-2xl shadow-sm border ${cardClass}`}>
          <h3 className={`font-bold ${textPrimary} mb-6 flex items-center gap-2`}>
            <TrendingUp size={20} className="text-emerald-500"/> Fund Growth (6 Months)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#f1f5f9'}/>
                <XAxis dataKey="date" hide />
                <YAxis stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={12} tickFormatter={(val) => `$${val}`}/>
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: isDark ? '#1e293b' : '#fff', color: isDark ? '#fff' : '#000'}}
                  formatter={(value: number) => [`$${value}`, 'Amount']}
                />
                <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Stats / Liquidity */}
        <div className={`p-6 rounded-2xl shadow-sm border ${cardClass}`}>
            <h3 className={`font-bold ${textPrimary} mb-4`}>Liquidity Overview</h3>
            <div className="space-y-6">
                <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                    <p className={`text-xs uppercase font-bold ${textSecondary} mb-1`}>Available to Lend</p>
                    <p className={`text-3xl font-bold ${textPrimary}`}>${(totalFunds - totalLoaned).toLocaleString()}</p>
                    <div className={`w-full h-1.5 rounded-full mt-3 overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${((totalFunds - totalLoaned) / totalFunds) * 100}%` }}></div>
                    </div>
                    <p className={`text-[10px] ${textTertiary} mt-1 text-right`}>{(((totalFunds - totalLoaned) / totalFunds) * 100).toFixed(1)}% of total funds</p>
                </div>

                <div className={`flex justify-between items-center py-3 border-b ${borderColor}`}>
                    <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Active Loans Value</span>
                    <span className="font-bold text-blue-600">${totalLoaned.toLocaleString()}</span>
                </div>
                <div className={`flex justify-between items-center py-3 border-b ${borderColor}`}>
                    <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Avg. Loan Size</span>
                    <span className={`font-bold ${textPrimary}`}>${activeLoanCount > 0 ? (totalLoaned / activeLoanCount).toLocaleString(undefined, {maximumFractionDigits:0}) : 0}</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardComponent;
