import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Download,
  CheckCircle2,
  Clock,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function UniversityManagement() {
  const [search, setSearch] = useState("");
  const [unis, setUnis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUni, setEditingUni] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "", country: "", city: "", qsRank: "", tuitionPerYear: "", minCGPA: "", minIELTS: "", status: "Active",
    logo: "🎓", intake: "Fall", deadline: "", programs: "", description: "",
    degreeLevel: [] as string[], livingCost: ""
  });

  useEffect(() => {
    const q = query(collection(db, "universities"), orderBy("name", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUnis(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleOpenModal = (uni: any = null) => {
    if (uni) {
      setEditingUni(uni);
      setFormData({
        name: uni.name || "",
        country: uni.country || "",
        city: uni.city || "",
        qsRank: uni.qsRank?.toString() || "",
        tuitionPerYear: uni.tuitionPerYear?.toString() || "",
        minCGPA: uni.minCGPA?.toString() || "",
        minIELTS: uni.minIELTS?.toString() || "",
        status: uni.status || "Active",
        logo: uni.logo || "🎓",
        intake: uni.intakes?.[0] || "Fall",
        deadline: uni.fallDeadline || "",
        programs: uni.programs?.join(", ") || "",
        description: uni.description || "",
        degreeLevel: uni.degreeLevel || [],
        livingCost: uni.livingCost?.toString() || ""
      });
    } else {
      setEditingUni(null);
      setFormData({
        name: "", country: "", city: "", qsRank: "", tuitionPerYear: "", minCGPA: "", minIELTS: "", status: "Active",
        logo: "🎓", intake: "Fall", deadline: "", programs: "", description: "",
        degreeLevel: [], livingCost: ""
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
        city: formData.city,
        qsRank: parseInt(formData.qsRank) || 0,
        tuitionPerYear: parseInt(formData.tuitionPerYear) || 0,
        minCGPA: parseFloat(formData.minCGPA) || 0,
        minIELTS: parseFloat(formData.minIELTS) || 0,
        status: formData.status,
        logo: formData.logo,
        intakes: [formData.intake],
        fallDeadline: formData.deadline,
        programs: formData.programs.split(",").map(p => p.trim()).filter(p => p),
        description: formData.description,
        degreeLevel: formData.degreeLevel,
        livingCost: parseInt(formData.livingCost) || 0,
        updatedAt: serverTimestamp()
      };

      if (editingUni) {
        await updateDoc(doc(db, "universities", editingUni.id), data);
      } else {
        await addDoc(collection(db, "universities"), {
          ...data,
          createdAt: serverTimestamp(),
          scholarships: []
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving university:", err);
    }
  };

  const filteredUnis = unis.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.country.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "universities", id));
    } catch (err) {
      console.error("Error deleting university:", err);
    }
  };

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
          <button 
            onClick={() => handleOpenModal()}
            className="bg-[#141414] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
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
              {filteredUnis.map((uni) => (
                <tr key={uni.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                  <td className="p-4 hidden sm:table-cell"><input type="checkbox" className="rounded" /></td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 bg-[#141414] text-white rounded-lg flex items-center justify-center font-bold shrink-0">
                        {uni.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{uni.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono uppercase truncate">ID: {uni.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-medium hidden sm:table-cell">{uni.country}</td>
                  <td className="p-4 text-sm font-mono hidden md:table-cell">#{uni.qsRank || uni.rank || "N/A"}</td>
                  <td className="p-4 hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 h-1.5 rounded-full max-w-[60px]">
                        <div className="bg-blue-primary h-full" style={{ width: `${uni.score || 80}%` }} />
                      </div>
                      <span className="text-xs font-bold">{uni.score || 80}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-bold text-slate-600 hidden xl:table-cell">{uni.programs?.length || 0}</td>
                  <td className="p-4">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 w-fit",
                      uni.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    )}>
                      {uni.status === 'Active' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                      <span className="hidden xs:inline">{uni.status || 'Active'}</span>
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => handleOpenModal(uni)}
                        className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-blue-primary transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(uni.id)}
                        className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-red-600 transition-all hidden sm:block"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-[#141414] transition-all">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUnis.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-bold">No universities found.</td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-bold">Loading...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50 border-t border-[#141414] flex items-center justify-between">
          <p className="text-xs font-bold text-slate-500">Showing {filteredUnis.length} universities</p>
        </div>
      </div>
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-display font-extrabold">{editingUni ? "Edit University" : "Add New University"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-[80px_1fr] gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Logo</label>
                  <input type="text" value={formData.logo} onChange={e => setFormData({...formData, logo: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-center text-xl" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">University Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#141414]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Country</label>
                  <input required type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#141414]" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">City</label>
                  <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#141414]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">QS Rank</label>
                  <input type="number" value={formData.qsRank} onChange={e => setFormData({...formData, qsRank: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#141414]" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Tuition/Year ($)</label>
                  <input type="number" value={formData.tuitionPerYear} onChange={e => setFormData({...formData, tuitionPerYear: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#141414]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Min CGPA</label>
                  <input type="number" step="0.01" value={formData.minCGPA} onChange={e => setFormData({...formData, minCGPA: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#141414]" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Min IELTS</label>
                  <input type="number" step="0.5" value={formData.minIELTS} onChange={e => setFormData({...formData, minIELTS: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#141414]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Intake</label>
                  <select value={formData.intake} onChange={e => setFormData({...formData, intake: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#141414]">
                    <option value="Fall">Fall</option>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Living Cost/Year ($)</label>
                  <input type="number" value={formData.livingCost} onChange={e => setFormData({...formData, livingCost: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#141414]" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Degree Levels</label>
                <div className="flex flex-wrap gap-2">
                  {["Bachelor", "Master", "PhD"].map(l => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => {
                        const current = [...formData.degreeLevel];
                        if (current.includes(l)) {
                          setFormData({ ...formData, degreeLevel: current.filter(lvl => lvl !== l) });
                        } else {
                          setFormData({ ...formData, degreeLevel: [...current, l] });
                        }
                      }}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold border transition-all",
                        formData.degreeLevel.includes(l) ? "bg-[#141414] border-[#141414] text-white" : "border-slate-200 text-slate-500"
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Deadline</label>
                <input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#141414]" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Programs (Comma separated)</label>
                <input type="text" value={formData.programs} onChange={e => setFormData({...formData, programs: e.target.value})} placeholder="Computer Science, Engineering, Business" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#141414]" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#141414]">
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Hidden">Hidden</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-[#141414] text-white rounded-xl font-bold hover:bg-slate-800 transition-all">Save University</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
