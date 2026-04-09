import React, { useState, useEffect, useMemo } from 'react';
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
  GraduationCap,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { db } from '../firebase';
import { collectionGroup, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { useOutletContext } from 'react-router-dom';

export default function ApplicationManagement() {
  const { isDarkMode } = useOutletContext<{ isDarkMode: boolean }>();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

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

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedApps = useMemo(() => {
    const filtered = applications.filter(app => {
      const matchesSearch = app.university?.toLowerCase().includes(search.toLowerCase()) || 
                           app.program?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // Special handling for dates
      if (sortField === "deadline") {
        if (!valA || valA === "TBD") valA = "9999-12-31";
        if (!valB || valB === "TBD") valB = "9999-12-31";
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [applications, search, statusFilter, sortField, sortOrder]);

  const toggleSelectAll = () => {
    if (selectedIds.length === sortedApps.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedApps.map(app => app.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} applications?`)) return;
    
    setBulkActionLoading(true);
    try {
      const selectedApps = applications.filter(app => selectedIds.includes(app.id));
      await Promise.all(selectedApps.map(app => deleteDoc(app.ref)));
      setSelectedIds([]);
    } catch (err) {
      console.error("Error in bulk delete:", err);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (newStatus === "") return;
    setBulkActionLoading(true);
    try {
      const selectedApps = applications.filter(app => selectedIds.includes(app.id));
      await Promise.all(selectedApps.map(app => updateDoc(app.ref, { status: newStatus })));
      setSelectedIds([]);
    } catch (err) {
      console.error("Error in bulk status update:", err);
    } finally {
      setBulkActionLoading(false);
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
          <h1 className="text-3xl font-display font-extrabold tracking-tight dark:text-white">Application Tracker</h1>
          <p className="text-slate-500 text-sm font-medium dark:text-slate-400 mt-1">Monitor and manage all student applications across the platform.</p>
        </div>
      </div>

      {/* Filters */}
      <div className={cn(
        "bg-white dark:bg-[#161B22] p-4 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-wrap items-center gap-4 transition-all shadow-sm",
        isDarkMode && "shadow-none"
      )}>
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by university or program..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy/5 dark:focus:ring-gold/5 focus:border-navy dark:focus:border-gold dark:text-white transition-all"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-navy dark:focus:border-gold dark:text-white transition-all"
        >
          <option value="all">All Statuses</option>
          <option value="researching">Researching</option>
          <option value="applying">Applying</option>
          <option value="submitted">Submitted</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className={cn(
          "bg-navy dark:bg-gold text-white dark:text-navy p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300 transition-all shadow-xl",
          isDarkMode && "shadow-none"
        )}>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 dark:bg-navy/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
              {selectedIds.length} Selected
            </div>
            <p className="text-sm font-bold">Bulk actions for selected applications</p>
          </div>
          <div className="flex items-center gap-3">
            <select 
              disabled={bulkActionLoading}
              onChange={(e) => handleBulkStatusUpdate(e.target.value)}
              className="bg-white/10 dark:bg-navy/5 border border-white/20 dark:border-navy/10 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-white/40 cursor-pointer"
              defaultValue=""
            >
              <option value="" disabled className="text-slate-900">Update Status...</option>
              <option value="researching" className="text-slate-900">Researching</option>
              <option value="applying" className="text-slate-900">Applying</option>
              <option value="submitted" className="text-slate-900">Submitted</option>
              <option value="accepted" className="text-slate-900">Accepted</option>
              <option value="rejected" className="text-slate-900">Rejected</option>
            </select>
            <button 
              disabled={bulkActionLoading}
              onClick={handleBulkDelete}
              className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/40 text-red-100 dark:text-red-900 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors border border-red-500/30"
            >
              <Trash2 size={14} /> Delete Selected
            </button>
            <button 
              onClick={() => setSelectedIds([])}
              className="p-1.5 hover:bg-white/10 dark:hover:bg-navy/5 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className={cn(
        "bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all shadow-sm",
        isDarkMode && "shadow-none"
      )}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0F1115] border-b border-slate-200 dark:border-slate-800">
                <th className="p-4 w-10">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === sortedApps.length && sortedApps.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-navy dark:text-gold focus:ring-navy dark:focus:ring-gold bg-transparent"
                  />
                </th>
                <th 
                  className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                  onClick={() => handleSort("university")}
                >
                  <div className="flex items-center gap-2">
                    University & Program
                    {sortField === "university" ? (sortOrder === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} className="opacity-30" />}
                  </div>
                </th>
                <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:table-cell">Student ID</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:table-cell">User ID</th>
                <th 
                  className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:table-cell cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                  onClick={() => handleSort("deadline")}
                >
                  <div className="flex items-center gap-2">
                    Deadline
                    {sortField === "deadline" ? (sortOrder === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} className="opacity-30" />}
                  </div>
                </th>
                <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Status</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedApps.map((app) => (
                <tr key={app.id} className={cn(
                  "border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group",
                  selectedIds.includes(app.id) && "bg-blue-50/50 dark:bg-gold/5"
                )}>
                  <td className="p-4">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(app.id)}
                      onChange={() => toggleSelect(app.id)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-navy dark:text-gold focus:ring-navy dark:focus:ring-gold bg-transparent"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 dark:bg-gold/10 text-blue-primary dark:text-gold rounded-xl flex items-center justify-center font-bold shrink-0 shadow-sm">
                        <GraduationCap size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate dark:text-white group-hover:text-blue-primary dark:group-hover:text-gold transition-colors">{app.university}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase truncate tracking-tight">{app.program}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-xs font-mono hidden sm:table-cell text-slate-500 dark:text-slate-400 font-bold">
                    <div className="flex items-center gap-1.5">
                      <User size={12} /> {app.userId?.slice(0, 8)}...
                    </div>
                  </td>
                  <td className="p-4 text-[10px] font-mono hidden sm:table-cell text-slate-500 dark:text-slate-400 font-medium">
                    {app.userId}
                  </td>
                  <td className="p-4 text-sm font-mono hidden sm:table-cell">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold">
                      <Clock size={14} /> {app.deadline || "N/A"}
                    </div>
                  </td>
                  <td className="p-4">
                    <select 
                      value={app.status}
                      onChange={(e) => handleUpdateStatus(app.ref, e.target.value)}
                      className={cn(
                        "text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider border-none outline-none cursor-pointer bg-transparent transition-all",
                        app.status === 'accepted' ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
                        app.status === 'rejected' ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" :
                        app.status === 'submitted' ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" :
                        "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      )}
                    >
                      <option value="researching" className="dark:bg-[#161B22]">Researching</option>
                      <option value="applying" className="dark:bg-[#161B22]">Applying</option>
                      <option value="submitted" className="dark:bg-[#161B22]">Submitted</option>
                      <option value="accepted" className="dark:bg-[#161B22]">Accepted</option>
                      <option value="rejected" className="dark:bg-[#161B22]">Rejected</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => handleDelete(app.ref)}
                        className="p-2 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm rounded-xl text-slate-400 hover:text-red-600 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {sortedApps.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 font-bold">No applications found.</td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 font-bold">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-navy dark:border-gold border-t-transparent rounded-full animate-spin" />
                      Loading Applications...
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
