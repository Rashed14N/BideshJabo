import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  Download,
  CheckCircle2,
  Clock,
  X,
  Award,
  Globe,
  DollarSign
} from 'lucide-react';
import { cn } from '../lib/utils';
import { db } from '../firebase';
import { useOutletContext } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function ScholarshipManagement() {
  const { isDarkMode } = useOutletContext<{ isDarkMode: boolean }>();
  const [search, setSearch] = useState("");
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSch, setEditingSch] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "", country: "", amount: "", type: "Government", deadline: "", degreeLevel: [] as string[], subjects: [] as string[], description: "", link: "", featured: false,
    minCGPA: "", minIELTS: "", coverage: ""
  });

  useEffect(() => {
    const q = query(collection(db, "scholarships"), orderBy("name", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setScholarships(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredSchs = scholarships.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.country.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (sch: any = null) => {
    if (sch) {
      setEditingSch(sch);
      setFormData({
        name: sch.name || "",
        country: sch.country || "",
        amount: sch.amount?.toString() || "",
        type: sch.type || "Government",
        deadline: sch.deadline || "",
        degreeLevel: sch.degreeLevel || [],
        subjects: sch.subjects || [],
        description: sch.description || "",
        link: sch.link || "",
        featured: sch.featured || false,
        minCGPA: sch.minCGPA?.toString() || "",
        minIELTS: sch.minIELTS?.toString() || "",
        coverage: sch.coverage?.join(", ") || ""
      });
    } else {
      setEditingSch(null);
      setFormData({
        name: "", country: "", amount: "", type: "Government", deadline: "", degreeLevel: [], subjects: [], description: "", link: "", featured: false,
        minCGPA: "", minIELTS: "", coverage: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name: formData.name,
        country: formData.country,
        amount: parseInt(formData.amount) || 0,
        type: formData.type,
        deadline: formData.deadline,
        degreeLevel: formData.degreeLevel,
        subjects: formData.subjects,
        description: formData.description,
        link: formData.link,
        featured: formData.featured,
        minCGPA: parseFloat(formData.minCGPA) || 0,
        minIELTS: parseFloat(formData.minIELTS) || 0,
        coverage: formData.coverage.split(",").map(c => c.trim()).filter(c => c),
        updatedAt: serverTimestamp()
      };

      if (editingSch) {
        await updateDoc(doc(db, "scholarships", editingSch.id), data);
      } else {
        await addDoc(collection(db, "scholarships"), {
          ...data,
          createdAt: serverTimestamp()
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving scholarship:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this scholarship?")) {
      try {
        await deleteDoc(doc(db, "scholarships", id));
      } catch (err) {
        console.error("Error deleting scholarship:", err);
      }
    }
  };

  const toggleLevel = (level: string) => {
    const current = [...formData.degreeLevel];
    if (current.includes(level)) {
      setFormData({ ...formData, degreeLevel: current.filter(l => l !== level) });
    } else {
      setFormData({ ...formData, degreeLevel: [...current, level] });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold tracking-tight dark:text-white">Scholarship Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Manage global scholarships, grants and financial aid opportunities.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white dark:bg-[#1A1A1A] border border-[#141414] dark:border-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white transition-colors flex items-center gap-2">
            <Download size={18} /> Export CSV
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-[#141414] dark:bg-gold dark:text-[#141414] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 dark:hover:bg-gold-hover transition-colors flex items-center gap-2"
          >
            <Plus size={18} /> Add Scholarship
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className={cn(
        "bg-white dark:bg-[#1A1A1A] p-4 border border-[#141414] dark:border-slate-700 rounded-xl flex flex-wrap items-center gap-4 transition-all",
        isDarkMode ? "shadow-[4px_4px_0px_0px_#f59e0b]" : "shadow-sm"
      )}>
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or country..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-[#141414] dark:focus:border-gold dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <select className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-[#141414] dark:focus:border-gold dark:text-white">
            <option className="dark:bg-[#1A1A1A]">All Types</option>
            <option className="dark:bg-[#1A1A1A]">Government</option>
            <option className="dark:bg-[#1A1A1A]">University</option>
            <option className="dark:bg-[#1A1A1A]">Private</option>
          </select>
          <button className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-white">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className={cn(
        "bg-white dark:bg-[#1A1A1A] border border-[#141414] dark:border-slate-700 rounded-2xl overflow-hidden transition-all",
        isDarkMode ? "shadow-[4px_4px_0px_0px_#f59e0b]" : "shadow-sm"
      )}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-[#141414] dark:border-slate-700">
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Scholarship</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:table-cell">Country</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden md:table-cell">Amount</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden lg:table-cell">Type</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Deadline</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchs.map((sch) => (
                <tr key={sch.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gold/10 dark:bg-gold/20 text-gold rounded-lg flex items-center justify-center font-bold shrink-0">
                        <Award size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate dark:text-white">{sch.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono uppercase truncate">ID: {sch.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-medium hidden sm:table-cell dark:text-slate-300">{sch.country}</td>
                  <td className="p-4 text-sm font-mono hidden md:table-cell text-teal dark:text-gold font-bold">${sch.amount?.toLocaleString() || "0"}</td>
                  <td className="p-4 hidden lg:table-cell">
                    <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-primary dark:text-gold text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">{sch.type}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                      <Clock size={12} /> {sch.deadline || "N/A"}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => handleOpenModal(sch)}
                        className="p-2 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm rounded-lg text-slate-400 hover:text-blue-primary dark:hover:text-gold transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(sch.id)}
                        className="p-2 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm rounded-lg text-slate-400 hover:text-red-600 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSchs.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">No scholarships found.</td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">Loading...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border dark:border-slate-700">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-display font-extrabold dark:text-white">{editingSch ? "Edit Scholarship" : "Add New Scholarship"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Scholarship Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-[#141414] dark:focus:border-gold dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Country</label>
                  <input required type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-[#141414] dark:focus:border-gold dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Amount ($)</label>
                  <input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-[#141414] dark:focus:border-gold dark:text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-[#141414] dark:focus:border-gold dark:text-white">
                    <option value="Government" className="dark:bg-[#1A1A1A]">Government</option>
                    <option value="University" className="dark:bg-[#1A1A1A]">University</option>
                    <option value="Private" className="dark:bg-[#1A1A1A]">Private</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Deadline</label>
                  <input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-[#141414] dark:focus:border-gold dark:text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Min CGPA</label>
                  <input type="number" step="0.01" value={formData.minCGPA} onChange={e => setFormData({...formData, minCGPA: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-[#141414] dark:focus:border-gold dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Min IELTS</label>
                  <input type="number" step="0.5" value={formData.minIELTS} onChange={e => setFormData({...formData, minIELTS: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-[#141414] dark:focus:border-gold dark:text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Coverage (Comma separated)</label>
                <input type="text" value={formData.coverage} onChange={e => setFormData({...formData, coverage: e.target.value})} placeholder="Full Tuition, Monthly Stipend, Travel" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-[#141414] dark:focus:border-gold dark:text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Degree Levels</label>
                <div className="flex flex-wrap gap-2">
                  {["Bachelor", "Master", "PhD"].map(l => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => toggleLevel(l)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold border transition-all",
                        formData.degreeLevel.includes(l) ? "bg-blue-primary dark:bg-gold border-blue-primary dark:border-gold text-white dark:text-[#141414]" : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-[#141414] dark:focus:border-gold dark:text-white resize-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Official Link</label>
                <input type="text" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-[#141414] dark:focus:border-gold dark:text-white" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.featured} onChange={e => setFormData({...formData, featured: e.target.checked})} className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-primary dark:text-gold focus:ring-blue-primary dark:focus:ring-gold dark:bg-slate-900" />
                <span className="text-sm font-bold text-navy dark:text-white">Featured Scholarship</span>
              </label>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-[#141414] dark:bg-gold dark:text-[#141414] text-white rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-gold-hover transition-all">Save Scholarship</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
