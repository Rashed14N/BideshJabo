import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Eye, 
  Edit2, 
  Trash2, 
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  User,
  GraduationCap
} from 'lucide-react';
import { db } from '../firebase';
import { collectionGroup, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { cn } from '../lib/utils';

export default function ApplicationManagement() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    // Note: This requires a composite index in Firestore for collection group 'applications'
    // If it fails, it will provide a link in the console to create the index.
    const q = query(collectionGroup(db, "applications"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ 
        id: d.id, 
        ...d.data(),
        // To delete/update, we need the full path: users/{uid}/applications/{id}
        ref: d.ref 
      }));
      setApplications(data);
      setLoading(false);
    }, (err) => {
      console.error("Firestore error (likely missing index):", err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredApps = applications.filter(app => {
    const matchesSearch = app.university?.toLowerCase().includes(search.toLowerCase()) || 
                         app.program?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (appRef: any, newStatus: string) => {
    try {
      await updateDoc(appRef, { status: newStatus });
    } catch (err) {
      console.error("Error updating application status:", err);
    }
  };

  const handleDelete = async (appRef: any) => {
    if (window.confirm("Are you sure you want to delete this application record?")) {
      try {
        await deleteDoc(appRef);
      } catch (err) {
        console.error("Error deleting application:", err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold tracking-tight">Application Tracker (Admin)</h1>
          <p className="text-slate-500 text-sm font-medium">Monitor and manage all student applications across the platform.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 border border-[#141414] rounded-xl flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by university or program..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#141414]"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-[#141414]"
        >
          <option value="all">All Statuses</option>
          <option value="researching">Researching</option>
          <option value="applying">Applying</option>
          <option value="submitted">Submitted</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#141414] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-[#141414]">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">University & Program</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest hidden sm:table-cell">Student ID</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest hidden md:table-cell">Deadline</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => (
                <tr key={app.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 text-blue-primary rounded-lg flex items-center justify-center font-bold shrink-0">
                        <GraduationCap size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{app.university}</p>
                        <p className="text-[10px] text-slate-400 font-medium truncate">{app.program}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-xs font-mono hidden sm:table-cell text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <User size={12} /> {app.userId?.slice(0, 8)}...
                    </div>
                  </td>
                  <td className="p-4 text-sm font-mono hidden md:table-cell">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Clock size={14} /> {app.deadline || "N/A"}
                    </div>
                  </td>
                  <td className="p-4">
                    <select 
                      value={app.status}
                      onChange={(e) => handleUpdateStatus(app.ref, e.target.value)}
                      className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border-none outline-none cursor-pointer",
                        app.status === 'accepted' ? "bg-green-100 text-green-700" :
                        app.status === 'rejected' ? "bg-red-100 text-red-700" :
                        app.status === 'submitted' ? "bg-blue-100 text-blue-700" :
                        "bg-slate-100 text-slate-600"
                      )}
                    >
                      <option value="researching">Researching</option>
                      <option value="applying">Applying</option>
                      <option value="submitted">Submitted</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => handleDelete(app.ref)}
                        className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-red-600 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredApps.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-bold">No applications found.</td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-bold">Loading applications...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
