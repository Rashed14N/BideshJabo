import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  ExternalLink,
  Download,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { cn } from '../lib/utils';

const MOCK_UNIS = [
  { id: 1, name: "Harvard University", country: "USA", rank: 1, status: "Active", programs: 124, score: 98 },
  { id: 2, name: "Oxford University", country: "UK", rank: 2, status: "Active", programs: 98, score: 97 },
  { id: 3, name: "MIT", country: "USA", rank: 3, status: "Active", programs: 156, score: 99 },
  { id: 4, name: "University of Toronto", country: "Canada", rank: 25, status: "Draft", programs: 84, score: 88 },
  { id: 5, name: "National University of Singapore", country: "Singapore", rank: 11, status: "Active", programs: 72, score: 92 },
];

export default function UniversityManagement() {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold tracking-tight">University Management</h1>
          <p className="text-slate-500 text-sm font-medium">Manage the database of global universities and their requirements.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-[#141414] px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Download size={18} /> Export CSV
          </button>
          <button className="bg-[#141414] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-2">
            <Plus size={18} /> Add University
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 border border-[#141414] rounded-xl flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, country or ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#141414]"
          />
        </div>
        <div className="flex items-center gap-2">
          <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-[#141414]">
            <option>All Countries</option>
            <option>USA</option>
            <option>UK</option>
            <option>Canada</option>
          </select>
          <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-[#141414]">
            <option>All Status</option>
            <option>Active</option>
            <option>Draft</option>
            <option>Hidden</option>
          </select>
          <button className="p-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#141414] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-[#141414]">
                <th className="p-4 w-12 hidden sm:table-cell"><input type="checkbox" className="rounded" /></th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">University</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest hidden sm:table-cell">Country</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest hidden md:table-cell">QS Rank</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest hidden lg:table-cell">Reputation</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest hidden xl:table-cell">Programs</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_UNIS.map((uni) => (
                <tr key={uni.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                  <td className="p-4 hidden sm:table-cell"><input type="checkbox" className="rounded" /></td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-400 shrink-0">
                        {uni.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{uni.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono uppercase truncate">ID: UN-{uni.id.toString().padStart(4, '0')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-medium hidden sm:table-cell">{uni.country}</td>
                  <td className="p-4 text-sm font-mono hidden md:table-cell">#{uni.rank}</td>
                  <td className="p-4 hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 h-1.5 rounded-full max-w-[60px]">
                        <div className="bg-blue-primary h-full" style={{ width: `${uni.score}%` }} />
                      </div>
                      <span className="text-xs font-bold">{uni.score}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-bold text-slate-600 hidden xl:table-cell">{uni.programs}</td>
                  <td className="p-4">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 w-fit",
                      uni.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    )}>
                      {uni.status === 'Active' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                      <span className="hidden xs:inline">{uni.status}</span>
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-blue-primary transition-all">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-red-600 transition-all hidden sm:block">
                        <Trash2 size={16} />
                      </button>
                      <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-[#141414] transition-all">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50 border-t border-[#141414] flex items-center justify-between">
          <p className="text-xs font-bold text-slate-500">Showing 1-5 of 85 universities</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 bg-white border border-slate-200 rounded text-xs font-bold disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 bg-[#141414] text-white rounded text-xs font-bold">1</button>
            <button className="px-3 py-1 bg-white border border-slate-200 rounded text-xs font-bold">2</button>
            <button className="px-3 py-1 bg-white border border-slate-200 rounded text-xs font-bold">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
