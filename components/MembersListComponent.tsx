import React, { useState } from 'react';
import { Member } from '../types';
import { Search, Plus, UserCheck, MoreVertical, Upload, Filter, X, Trash2 } from 'lucide-react';

interface MembersListProps {
  members: Member[];
  setEditingMember: (member: Member) => void;
  handleAddMember: (e: React.FormEvent) => void;
  handleDeleteMember: (id: string) => void;
  setShowBatchUpload: (show: boolean) => void;
  isDark?: boolean;
}

const MembersListComponent: React.FC<MembersListProps> = ({ members, setEditingMember, handleAddMember, handleDeleteMember, setShowBatchUpload, isDark = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Theme classes
  const cardClass = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const inputClass = isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400';
  const textPrimary = isDark ? 'text-white' : 'text-slate-800';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';
  const bgHeader = isDark ? 'bg-slate-900' : 'bg-slate-50';

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (m.nickname && m.nickname.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'All' || m.accountStatus === statusFilter;
    
    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && new Date(m.joinDate) >= new Date(startDate);
    }
    if (endDate) {
      matchesDate = matchesDate && new Date(m.joinDate) <= new Date(endDate);
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'All' || startDate || endDate;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col gap-4">
        {/* Top Controls: Search + Action Buttons */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className={`absolute left-3 top-3 ${textSecondary}`} size={18} />
            <input 
              type="text" 
              placeholder="Search by name or ID..." 
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm border ${inputClass}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={() => setShowBatchUpload(true)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border rounded-xl font-medium transition-colors shadow-sm ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
            >
              <Upload size={18} /> <span className="hidden sm:inline">Batch Upload</span>
            </button>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200"
            >
              <Plus size={18} /> Add Member
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className={`flex flex-wrap gap-4 items-center p-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <div className={`flex items-center gap-2 ${textSecondary}`}>
                <Filter size={16} />
                <span className="text-xs font-bold uppercase">Filters:</span>
            </div>
            
            <div className="flex items-center gap-2">
                <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className={`p-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer ${inputClass}`}
                >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
            </div>

            <div className={`flex items-center gap-2 px-2 py-1 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <span className={`text-xs ${textSecondary}`}>Joined:</span>
                <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={`text-xs p-1 focus:outline-none ${isDark ? 'bg-slate-800 text-white' : 'text-slate-700'}`}
                />
                <span className={isDark ? 'text-slate-600' : 'text-slate-300'}>-</span>
                <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={`text-xs p-1 focus:outline-none ${isDark ? 'bg-slate-800 text-white' : 'text-slate-700'}`}
                />
            </div>
            
            {hasActiveFilters && (
                <button 
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors ml-auto"
                >
                    <X size={14} /> Clear
                </button>
            )}
        </div>
      </div>

      {showAddForm && (
        <div className={`p-6 rounded-2xl border shadow-sm animate-in slide-in-from-top-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-emerald-100'}`}>
          <h3 className={`font-bold text-lg mb-4 ${textPrimary}`}>New Member Registration</h3>
          <form onSubmit={(e) => { handleAddMember(e); setShowAddForm(false); }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <input name="name" placeholder="Full Name" className={`p-3 border rounded-lg ${inputClass}`} required />
             <input name="mc_id" placeholder="Member ID (Optional)" className={`p-3 border rounded-lg ${inputClass}`} />
             <input name="email" type="email" placeholder="Email Address" className={`p-3 border rounded-lg ${inputClass}`} />
             <input name="phone" placeholder="Phone Number" className={`p-3 border rounded-lg ${inputClass}`} />
             <input name="beneficiary" placeholder="Beneficiary Name" className={`p-3 border rounded-lg ${inputClass}`} />
             <input name="address" placeholder="Address" className={`p-3 border rounded-lg ${inputClass}`} />
             <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddForm(false)} className={`px-4 py-2 rounded-lg ${isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`}>Cancel</button>
                <button type="submit" className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold">Register Member</button>
             </div>
          </form>
        </div>
      )}

      <div className={`border rounded-2xl shadow-sm overflow-hidden ${cardClass}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className={`border-b font-semibold uppercase tracking-wider ${isDark ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Legal Name</th>
                <th className="px-6 py-4">Nickname</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Total Contribution</th>
                <th className="px-6 py-4">Join Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-100'}`}>
              {filteredMembers.map((member) => (
                <tr key={member.id} className={`transition-colors ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50/50'}`}>
                  <td className={`px-6 py-4 font-mono ${textSecondary}`}>{member.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                        {member.name.charAt(0)}
                      </div>
                      <span className={`font-medium ${textPrimary}`}>{member.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`italic ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{member.nickname || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      member.accountStatus === 'Active' 
                        ? (isDark ? 'bg-emerald-900/50 text-emerald-400' : 'bg-emerald-100 text-emerald-700')
                        : (isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500')
                    }`}>
                      {member.accountStatus === 'Active' && <UserCheck size={12}/>}
                      {member.accountStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <div className={isDark ? 'text-slate-300' : 'text-slate-700'}>{member.email}</div>
                    <div className={textSecondary}>{member.phone || '-'}</div>
                  </td>
                  <td className={`px-6 py-4 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    ${member.totalContribution.toLocaleString()}
                  </td>
                  <td className={`px-6 py-4 ${textSecondary}`}>{member.joinDate}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setEditingMember(member)}
                          className={`p-2 rounded-full transition-colors ${isDark ? 'text-slate-500 hover:bg-slate-700 hover:text-slate-300' : 'text-slate-400 hover:bg-slate-200 hover:text-slate-700'}`}
                          title="Edit Member"
                        >
                          <MoreVertical size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteMember(member.id)}
                          className={`p-2 rounded-full transition-colors ${isDark ? 'text-slate-500 hover:bg-red-900/50 hover:text-red-400' : 'text-slate-400 hover:bg-red-50 hover:text-red-600'}`}
                          title="Delete Member"
                        >
                          <Trash2 size={18} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredMembers.length === 0 && (
          <div className={`p-8 text-center ${textSecondary}`}>No members found matching your criteria.</div>
        )}
      </div>
    </div>
  );
};

export default MembersListComponent;