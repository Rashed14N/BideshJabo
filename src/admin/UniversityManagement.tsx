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
  X,
  Eye,
  Globe,
  DollarSign,
  GraduationCap,
  BookOpen,
  Award,
  FileText
} from 'lucide-react';
import { cn } from '../lib/utils';
import { db } from '../firebase';
import { useOutletContext } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function UniversityManagement() {
  const { isDarkMode } = useOutletContext<{ isDarkMode: boolean }>();
  const [search, setSearch] = useState("");
  const [unis, setUnis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUniForView, setSelectedUniForView] = useState<any>(null);
  const [editingUni, setEditingUni] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "", country: "", city: "", qsRank: "", tuitionPerYear: "", minCGPA: "", minIELTS: "", status: "Active",
    logo: "🎓", intakes: [{ type: "Fall", deadline: "" }] as { type: string, deadline: string }[], 
    programs: "", description: "",
    degreeLevel: [] as string[], livingCost: "", deadline: ""
  });

  const validateField = (name: string, value: string) => {
    let error = "";
    if (name === "qsRank") {
      if (value && (isNaN(Number(value)) || Number(value) < 1)) error = "Must be a positive number";
    } else if (name === "tuitionPerYear" || name === "livingCost") {
      if (value && (isNaN(Number(value)) || Number(value) < 0)) error = "Must be a valid amount";
    } else if (name === "minCGPA") {
      if (value && (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 10)) error = "Must be between 0 and 10";
    } else if (name === "minIELTS") {
      if (value && (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 9)) error = "Must be between 0 and 9";
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

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
    setErrors({});
    if (uni) {
      setEditingUni(uni);
      
      // Handle legacy data format or new format
      let intakes = [{ type: "Fall", deadline: "" }];
      if (uni.intakeData && Array.isArray(uni.intakeData)) {
        intakes = uni.intakeData;
      } else if (uni.intakes && Array.isArray(uni.intakes)) {
        intakes = uni.intakes.map((type: string) => ({
          type,
          deadline: type === "Fall" ? (uni.fallDeadline || "") : (uni.springDeadline || "")
        }));
      }

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
        intakes: intakes,
        programs: uni.programs?.join(", ") || "",
        description: uni.description || "",
        degreeLevel: uni.degreeLevel || [],
        livingCost: uni.livingCost?.toString() || "",
        deadline: ""
      });
    } else {
      setEditingUni(null);
      setFormData({
        name: "", country: "", city: "", qsRank: "", tuitionPerYear: "", minCGPA: "", minIELTS: "", status: "Active",
        logo: "🎓", intakes: [{ type: "Fall", deadline: "" }], programs: "", description: "",
        degreeLevel: [], livingCost: "", deadline: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation check
    const newErrors: Record<string, string> = {};
    ["qsRank", "tuitionPerYear", "minCGPA", "minIELTS", "livingCost"].forEach(field => {
      const err = validateField(field, (formData as any)[field]);
      if (err) newErrors[field] = err;
    });

    if (Object.values(newErrors).some(err => err)) {
      setErrors(newErrors);
      return;
    }

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
        intakes: formData.intakes.map(i => i.type),
        intakeData: formData.intakes,
        fallDeadline: formData.intakes.find(i => i.type === "Fall")?.deadline || "",
        springDeadline: formData.intakes.find(i => i.type === "Spring")?.deadline || "",
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

  const filteredUnis = unis.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                         u.country.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    const matchesCountry = countryFilter === "all" || u.country === countryFilter;
    return matchesSearch && matchesStatus && matchesCountry;
  });

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
          <h1 className="text-3xl font-display font-extrabold tracking-tight dark:text-white">University Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Manage the database of global universities and their requirements.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white transition-all flex items-center gap-2 shadow-sm">
            <Download size={18} /> Export CSV
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-navy dark:bg-gold dark:text-navy text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 dark:hover:bg-gold-hover transition-all flex items-center gap-2 shadow-lg shadow-navy/10 dark:shadow-gold/10"
          >
            <Plus size={18} /> Add University
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
            placeholder="Search by name, country or ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy/5 dark:focus:ring-gold/5 focus:border-navy dark:focus:border-gold dark:text-white transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-navy dark:focus:border-gold dark:text-white transition-all"
          >
            <option value="all" className="dark:bg-[#161B22]">All Countries</option>
            <option value="USA" className="dark:bg-[#161B22]">USA</option>
            <option value="UK" className="dark:bg-[#161B22]">UK</option>
            <option value="Canada" className="dark:bg-[#161B22]">Canada</option>
            <option value="Australia" className="dark:bg-[#161B22]">Australia</option>
            <option value="Germany" className="dark:bg-[#161B22]">Germany</option>
            <option value="Netherlands" className="dark:bg-[#161B22]">Netherlands</option>
            <option value="Singapore" className="dark:bg-[#161B22]">Singapore</option>
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-navy dark:focus:border-gold dark:text-white transition-all"
          >
            <option value="all" className="dark:bg-[#161B22]">All Status</option>
            <option value="Active" className="dark:bg-[#161B22]">Active</option>
            <option value="Draft" className="dark:bg-[#161B22]">Draft</option>
            <option value="Hidden" className="dark:bg-[#161B22]">Hidden</option>
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
                <th className="p-4 w-12 hidden sm:table-cell"><input type="checkbox" className="rounded border-slate-300 dark:border-slate-700 dark:bg-slate-800" /></th>
                <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">University</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:table-cell">Country</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden md:table-cell">QS Rank</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden lg:table-cell">Reputation</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden xl:table-cell">Programs</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Status</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUnis.map((uni) => (
                <tr key={uni.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="p-4 hidden sm:table-cell"><input type="checkbox" className="rounded border-slate-300 dark:border-slate-700 dark:bg-slate-800" /></td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-navy dark:bg-gold dark:text-navy text-white rounded-xl flex items-center justify-center font-bold shrink-0 shadow-sm">
                        {uni.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate dark:text-white group-hover:text-blue-primary dark:group-hover:text-gold transition-colors">{uni.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase truncate tracking-tight">ID: {uni.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-bold hidden sm:table-cell dark:text-slate-300">{uni.country}</td>
                  <td className="p-4 text-sm font-mono hidden md:table-cell dark:text-slate-300">#{uni.qsRank || uni.rank || "N/A"}</td>
                  <td className="p-4 hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2 rounded-full max-w-[60px] shadow-inner">
                        <div className="bg-blue-primary dark:bg-gold h-full rounded-full" style={{ width: `${uni.score || 80}%` }} />
                      </div>
                      <span className="text-xs font-bold dark:text-slate-300">{uni.score || 80}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-bold text-slate-600 dark:text-slate-400 hidden xl:table-cell">{uni.programs?.length || 0}</td>
                  <td className="p-4">
                    <span className={cn(
                      "text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1.5 w-fit",
                      uni.status === 'Active' ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400'
                    )}>
                      {uni.status === 'Active' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      <span className="hidden xs:inline">{uni.status || 'Active'}</span>
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => setSelectedUniForView(uni)}
                        className="p-2 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm rounded-xl text-slate-400 hover:text-navy dark:hover:text-gold transition-all"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => handleOpenModal(uni)}
                        className="p-2 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm rounded-xl text-slate-400 hover:text-navy dark:hover:text-gold transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(uni.id)}
                        className="p-2 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm rounded-xl text-slate-400 hover:text-red-600 transition-all hidden sm:block"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button className="p-2 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm rounded-xl text-slate-400 hover:text-navy dark:hover:text-gold transition-all">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUnis.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400 font-bold">No universities found matching your filters.</td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400 font-bold">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-navy dark:border-gold border-t-transparent rounded-full animate-spin" />
                      Loading Universities...
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-[#0F1115] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Total: {filteredUnis.length} universities</p>
        </div>
      </div>
      {/* Detail Modal */}
      {selectedUniForView && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border dark:border-slate-700">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-display font-extrabold dark:text-white">University Details</h3>
              <button onClick={() => setSelectedUniForView(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-8">
              {/* Header Info */}
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-navy dark:bg-gold dark:text-navy text-white rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg">
                  {selectedUniForView.logo || selectedUniForView.name[0]}
                </div>
                <div>
                  <h4 className="text-2xl font-display font-extrabold text-navy dark:text-white">{selectedUniForView.name}</h4>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
                      <Globe size={14} className="text-gold" /> {selectedUniForView.city}, {selectedUniForView.country}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
                      <Award size={14} className="text-gold" /> QS Rank: #{selectedUniForView.qsRank || "N/A"}
                    </div>
                    <div className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1",
                      selectedUniForView.status === 'Active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                    )}>
                      {selectedUniForView.status === 'Active' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                      {selectedUniForView.status || 'Active'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Financials & Requirements */}
                <div className="space-y-4">
                  <h5 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <DollarSign size={14} /> Financials & Requirements
                  </h5>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl space-y-3 border dark:border-slate-800">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Tuition / Year</p>
                        <p className="text-sm font-bold dark:text-white">${selectedUniForView.tuitionPerYear?.toLocaleString() || "0"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Living Cost / Year</p>
                        <p className="text-sm font-bold dark:text-white">${selectedUniForView.livingCost?.toLocaleString() || "0"}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Min CGPA</p>
                        <p className="text-sm font-bold dark:text-white">{selectedUniForView.minCGPA || "0.0"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Min IELTS</p>
                        <p className="text-sm font-bold dark:text-white">{selectedUniForView.minIELTS || "0.0"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Academic Info */}
                <div className="space-y-4">
                  <h5 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <GraduationCap size={14} /> Academic Info
                  </h5>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl space-y-3 border dark:border-slate-800">
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Degree Levels</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedUniForView.degreeLevel?.map((l: string) => (
                          <span key={l} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold dark:text-slate-300">{l}</span>
                        ))}
                        {(!selectedUniForView.degreeLevel || selectedUniForView.degreeLevel.length === 0) && <span className="text-xs text-slate-400">N/A</span>}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Intakes & Deadlines</p>
                      <div className="space-y-1 mt-1">
                        {(selectedUniForView.intakeData || selectedUniForView.intakes)?.map((i: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="font-bold dark:text-slate-300">{typeof i === 'string' ? i : i.type}</span>
                            <span className="text-slate-500 dark:text-slate-400">{typeof i === 'string' ? 'N/A' : (i.deadline || 'No deadline')}</span>
                          </div>
                        ))}
                        {(!selectedUniForView.intakes || selectedUniForView.intakes.length === 0) && <p className="text-sm text-slate-400">N/A</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Programs */}
                <div className="md:col-span-2 space-y-4">
                  <h5 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <BookOpen size={14} /> Available Programs
                  </h5>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border dark:border-slate-800">
                    <div className="flex flex-wrap gap-2">
                      {selectedUniForView.programs?.map((p: string) => (
                        <span key={p} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-lg text-xs font-medium dark:text-slate-300">{p}</span>
                      ))}
                      {(!selectedUniForView.programs || selectedUniForView.programs.length === 0) && <p className="text-sm text-slate-400">No programs listed.</p>}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2 space-y-4">
                  <h5 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <FileText size={14} /> About University
                  </h5>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border dark:border-slate-800">
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {selectedUniForView.description || "No description available for this university."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
              <button onClick={() => setSelectedUniForView(null)} className="px-6 py-2 bg-navy dark:bg-gold dark:text-navy text-white rounded-xl font-bold text-sm hover:bg-slate-800 dark:hover:bg-gold-hover transition-all">Close Details</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border dark:border-slate-700">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-display font-extrabold dark:text-white">{editingUni ? "Edit University" : "Add New University"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-[80px_1fr] gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Logo</label>
                  <input type="text" value={formData.logo} onChange={e => setFormData({...formData, logo: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-center text-xl dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">University Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-navy dark:focus:border-gold dark:text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Country</label>
                  <input required type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-navy dark:focus:border-gold dark:text-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">City</label>
                  <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-navy dark:focus:border-gold dark:text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">QS Rank</label>
                  <input 
                    type="number" 
                    value={formData.qsRank} 
                    onChange={e => handleInputChange("qsRank", e.target.value)} 
                    className={cn(
                      "w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-lg outline-none focus:border-navy dark:focus:border-gold dark:text-white",
                      errors.qsRank ? "border-red-500" : "border-slate-200 dark:border-slate-700"
                    )} 
                  />
                  {errors.qsRank && <p className="text-[10px] text-red-500 font-bold">{errors.qsRank}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Tuition/Year ($)</label>
                  <input 
                    type="number" 
                    value={formData.tuitionPerYear} 
                    onChange={e => handleInputChange("tuitionPerYear", e.target.value)} 
                    className={cn(
                      "w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-lg outline-none focus:border-navy dark:focus:border-gold dark:text-white",
                      errors.tuitionPerYear ? "border-red-500" : "border-slate-200 dark:border-slate-700"
                    )} 
                  />
                  {errors.tuitionPerYear && <p className="text-[10px] text-red-500 font-bold">{errors.tuitionPerYear}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Min CGPA</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={formData.minCGPA} 
                    onChange={e => handleInputChange("minCGPA", e.target.value)} 
                    className={cn(
                      "w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-lg outline-none focus:border-navy dark:focus:border-gold dark:text-white",
                      errors.minCGPA ? "border-red-500" : "border-slate-200 dark:border-slate-700"
                    )} 
                  />
                  {errors.minCGPA && <p className="text-[10px] text-red-500 font-bold">{errors.minCGPA}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Min IELTS</label>
                  <input 
                    type="number" 
                    step="0.5" 
                    value={formData.minIELTS} 
                    onChange={e => handleInputChange("minIELTS", e.target.value)} 
                    className={cn(
                      "w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-lg outline-none focus:border-navy dark:focus:border-gold dark:text-white",
                      errors.minIELTS ? "border-red-500" : "border-slate-200 dark:border-slate-700"
                    )} 
                  />
                  {errors.minIELTS && <p className="text-[10px] text-red-500 font-bold">{errors.minIELTS}</p>}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Living Cost/Year ($)</label>
                <input 
                  type="number" 
                  value={formData.livingCost} 
                  onChange={e => handleInputChange("livingCost", e.target.value)} 
                  className={cn(
                    "w-full p-2.5 bg-slate-50 dark:bg-slate-900 border rounded-lg outline-none focus:border-navy dark:focus:border-gold dark:text-white",
                    errors.livingCost ? "border-red-500" : "border-slate-200 dark:border-slate-700"
                  )} 
                />
                {errors.livingCost && <p className="text-[10px] text-red-500 font-bold">{errors.livingCost}</p>}
              </div>

              <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase">Intakes & Deadlines</label>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, intakes: [...formData.intakes, { type: "Fall", deadline: "" }]})}
                    className="text-[10px] font-bold text-blue-primary dark:text-gold flex items-center gap-1 hover:underline"
                  >
                    <Plus size={12} /> Add Intake
                  </button>
                </div>
                {formData.intakes.map((intake, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_1fr_40px] gap-3 items-end">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Season</label>
                      <select 
                        value={intake.type} 
                        onChange={e => {
                          const newIntakes = [...formData.intakes];
                          newIntakes[idx].type = e.target.value;
                          setFormData({...formData, intakes: newIntakes});
                        }}
                        className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-navy dark:focus:border-gold dark:text-white"
                      >
                        <option value="Fall">Fall</option>
                        <option value="Spring">Spring</option>
                        <option value="Summer">Summer</option>
                        <option value="Winter">Winter</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Deadline</label>
                      <input 
                        type="date" 
                        value={intake.deadline} 
                        onChange={e => {
                          const newIntakes = [...formData.intakes];
                          newIntakes[idx].deadline = e.target.value;
                          setFormData({...formData, intakes: newIntakes});
                        }}
                        className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-navy dark:focus:border-gold dark:text-white" 
                      />
                    </div>
                    <button 
                      type="button"
                      disabled={formData.intakes.length === 1}
                      onClick={() => {
                        const newIntakes = formData.intakes.filter((_, i) => i !== idx);
                        setFormData({...formData, intakes: newIntakes});
                      }}
                      className="p-2 text-slate-400 hover:text-red-500 disabled:opacity-30 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
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
                        formData.degreeLevel.includes(l) ? "bg-navy dark:bg-gold border-navy dark:border-gold text-white dark:text-navy" : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Deadline</label>
                <input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-navy dark:focus:border-gold dark:text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Programs (Comma separated)</label>
                <input type="text" value={formData.programs} onChange={e => setFormData({...formData, programs: e.target.value})} placeholder="Computer Science, Engineering, Business" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-navy dark:focus:border-gold dark:text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">About University</label>
                <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe the university..." className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-navy dark:focus:border-gold dark:text-white resize-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-navy dark:focus:border-gold dark:text-white">
                  <option value="Active" className="dark:bg-[#1A1A1A]">Active</option>
                  <option value="Draft" className="dark:bg-[#1A1A1A]">Draft</option>
                  <option value="Hidden" className="dark:bg-[#1A1A1A]">Hidden</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-navy dark:bg-gold dark:text-navy text-white rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-gold-hover transition-all">Save University</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
