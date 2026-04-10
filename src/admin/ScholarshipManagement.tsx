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
  DollarSign,
  Sparkles
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

    // URL Validation
    if (formData.link && !formData.link.match(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/)) {
      alert("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

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
          <h1 className="text-3xl font-display font-extrabold tracking-tight dark:text-white">Scholarship Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Manage global scholarships, grants and financial aid opportunities.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white transition-all flex items-center gap-2 shadow-sm">
            <Download size={18} /> Export CSV
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-navy dark:bg-gold dark:text-navy text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 dark:hover:bg-gold-hover transition-all flex items-center gap-2 shadow-lg shadow-navy/10 dark:shadow-gold/10"
          >
            <Plus size={18} /> Add Scholarship
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className={cn(
        "bg-white dark:bg-[#161B22] p-4 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-wrap items-center gap-4 transition-all shadow-sm",
        isDarkMode && "shadow-none"
      )}>
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or country..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy/5 dark:focus:ring-gold/5 focus:border-navy dark:focus:border-gold dark:text-white transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <select className="bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-navy dark:focus:border-gold dark:text-white transition-all">
            <option className="dark:bg-[#161B22]">All Types</option>
            <option className="dark:bg-[#161B22]">Government</option>
            <option className="dark:bg-[#161B22]">University</option>
            <option className="dark:bg-[#161B22]">Private</option>
          </select>
          <button className="p-2 bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className={cn(
        "bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all shadow-sm",
        isDarkMode && "shadow-none"
      )}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0F1115] border-b border-slate-200 dark:border-slate-800">
                <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Scholarship</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:table-cell">Country</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden md:table-cell">Amount</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden lg:table-cell">Type</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Deadline</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchs.map((sch) => (
                <tr key={sch.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gold/10 dark:bg-gold/10 text-gold rounded-xl flex items-center justify-center font-bold shrink-0 shadow-sm">
                        <Award size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate dark:text-white group-hover:text-blue-primary dark:group-hover:text-gold transition-colors">{sch.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase truncate tracking-tight">ID: {sch.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-bold hidden sm:table-cell dark:text-slate-300">{sch.country}</td>
                  <td className="p-4 text-sm font-mono hidden md:table-cell text-navy dark:text-gold font-bold">${sch.amount?.toLocaleString() || "0"}</td>
                  <td className="p-4 hidden lg:table-cell">
                    <span className="bg-blue-50 dark:bg-gold/10 text-navy dark:text-gold text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">{sch.type}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      <Clock size={12} /> {sch.deadline || "N/A"}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => handleOpenModal(sch)}
                        className="p-2 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm rounded-xl text-slate-400 hover:text-navy dark:hover:text-gold transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(sch.id)}
                        className="p-2 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm rounded-xl text-slate-400 hover:text-red-600 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSchs.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 font-bold">No scholarships found.</td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 font-bold">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-navy dark:border-gold border-t-transparent rounded-full animate-spin" />
                      Loading Scholarships...
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#161B22] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-display font-extrabold dark:text-white">{editingSch ? "Edit Scholarship" : "Add New Scholarship"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-slate-400 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Scholarship Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-navy/5 dark:focus:ring-gold/5 focus:border-navy dark:focus:border-gold dark:text-white transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Country</label>
                  <input required type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-navy/5 dark:focus:ring-gold/5 focus:border-navy dark:focus:border-gold dark:text-white transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount ($)</label>
                  <input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-navy/5 dark:focus:ring-gold/5 focus:border-navy dark:focus:border-gold dark:text-white transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-navy/5 dark:focus:ring-gold/5 focus:border-navy dark:focus:border-gold dark:text-white transition-all">
                    <option value="Government" className="dark:bg-[#161B22]">Government</option>
                    <option value="University" className="dark:bg-[#161B22]">University</option>
                    <option value="Private" className="dark:bg-[#161B22]">Private</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Deadline</label>
                  <input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-navy/5 dark:focus:ring-gold/5 focus:border-navy dark:focus:border-gold dark:text-white transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Min CGPA</label>
                  <input type="number" step="0.01" value={formData.minCGPA} onChange={e => setFormData({...formData, minCGPA: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-navy/5 dark:focus:ring-gold/5 focus:border-navy dark:focus:border-gold dark:text-white transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Min IELTS</label>
                  <input type="number" step="0.5" value={formData.minIELTS} onChange={e => setFormData({...formData, minIELTS: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-navy/5 dark:focus:ring-gold/5 focus:border-navy dark:focus:border-gold dark:text-white transition-all" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Coverage (Comma separated)</label>
                <input type="text" value={formData.coverage} onChange={e => setFormData({...formData, coverage: e.target.value})} placeholder="Full Tuition, Monthly Stipend, Travel" className="w-full p-2.5 bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-navy/5 dark:focus:ring-gold/5 focus:border-navy dark:focus:border-gold dark:text-white transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Degree Levels</label>
                <div className="flex flex-wrap gap-2">
                  {["Bachelor", "Master", "PhD"].map(l => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => toggleLevel(l)}
                      className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all",
                        formData.degreeLevel.includes(l) ? "bg-navy dark:bg-gold border-navy dark:border-gold text-white dark:text-navy" : "border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400"
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full p-2.5 bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-navy/5 dark:focus:ring-gold/5 focus:border-navy dark:focus:border-gold dark:text-white resize-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Official Link</label>
                <input 
                  type="text" 
                  placeholder="https://example.com/apply"
                  value={formData.link} 
                  onChange={e => setFormData({...formData, link: e.target.value})} 
                  className="w-full p-2.5 bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-navy/5 dark:focus:ring-gold/5 focus:border-navy dark:focus:border-gold dark:text-white transition-all" 
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#0F1115] rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg transition-colors",
                    formData.featured ? "bg-gold/20 text-gold" : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                  )}>
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold dark:text-white uppercase tracking-wider">Featured Scholarship</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Showcase this on the student dashboard</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, featured: !formData.featured})}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative",
                    formData.featured ? "bg-gold" : "bg-slate-300 dark:bg-slate-700"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                    formData.featured ? "left-7" : "left-1"
                  )} />
                </button>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-slate-200 dark:border-slate-800 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-navy dark:bg-gold dark:text-navy text-white rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-gold-hover transition-all shadow-lg shadow-navy/10 dark:shadow-gold/10">Save Scholarship</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
