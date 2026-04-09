import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Trash2, 
  Download,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Award,
  Calendar,
  CheckCircle2,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { db } from '../firebase';
import { useOutletContext } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';

export default function StudentManagement() {
  const { isDarkMode } = useOutletContext<{ isDarkMode: boolean }>();
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("fullName", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setStudents(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredStudents = students.filter(s => 
    s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.phone?.includes(search)
  );

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this student profile? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "users", id));
      } catch (err) {
        console.error("Error deleting student:", err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold tracking-tight dark:text-white">Student Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">View and manage registered student profiles and their progress.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white transition-all flex items-center gap-2 shadow-sm">
            <Download size={18} /> Export Students
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
            placeholder="Search by name, email or phone..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy/5 dark:focus:ring-gold/5 focus:border-navy dark:focus:border-gold dark:text-white transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <select className="bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-navy dark:focus:border-gold dark:text-white transition-all">
            <option className="dark:bg-[#161B22]">All Levels</option>
            <option className="dark:bg-[#161B22]">SSC</option>
            <option className="dark:bg-[#161B22]">HSC</option>
            <option className="dark:bg-[#161B22]">Bachelor</option>
            <option className="dark:bg-[#161B22]">Master</option>
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
                <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Student</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:table-cell">Education</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden md:table-cell">CGPA</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden lg:table-cell">Target</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Profile %</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                const fields = ["fullName", "cgpa", "ielts", "targetDegree"];
                const filled = fields.filter(f => student[f]).length;
                const pct = Math.round((filled / fields.length) * 100);

                return (
                  <tr key={student.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-navy dark:bg-gold dark:text-navy text-white rounded-full flex items-center justify-center font-bold shrink-0 shadow-sm">
                          {student.fullName?.[0] || student.email?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate dark:text-white group-hover:text-blue-primary dark:group-hover:text-gold transition-colors">{student.fullName || "Unnamed Student"}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase truncate tracking-tight">ID: {student.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-bold hidden sm:table-cell dark:text-slate-300">
                      {student.educationLevel || "N/A"}
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{student.institution || "N/A"}</p>
                    </td>
                    <td className="p-4 text-sm font-mono hidden md:table-cell dark:text-slate-300 font-bold">{student.cgpa || "0.0"} / {student.cgpaScale || "4.0"}</td>
                    <td className="p-4 hidden lg:table-cell">
                      <p className="text-sm font-bold dark:text-white">{student.targetDegree || "N/A"}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{student.targetCountries?.join(', ') || "N/A"}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full max-w-[60px]">
                          <div className={cn(
                            "h-full rounded-full transition-all",
                            pct > 70 ? "bg-green-500" : pct > 30 ? "bg-gold" : "bg-red-500"
                          )} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[10px] font-bold dark:text-slate-400">{pct}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => setSelectedStudent(student)}
                          className="p-2 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm rounded-xl text-slate-400 hover:text-navy dark:hover:text-gold transition-all"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(student.id)}
                          className="p-2 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm rounded-xl text-slate-400 hover:text-red-600 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredStudents.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 font-bold">No students found.</td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 font-bold">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-navy dark:border-gold border-t-transparent rounded-full animate-spin" />
                      Loading Students...
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#161B22] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-display font-extrabold dark:text-white">Student Profile Details</h3>
              <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-slate-400 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-8">
              {/* Header Info */}
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-navy dark:bg-gold dark:text-navy text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-xl shadow-navy/10 dark:shadow-gold/10">
                  {selectedStudent.fullName?.[0] || selectedStudent.email?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h4 className="text-2xl font-display font-extrabold text-navy dark:text-white">{selectedStudent.fullName || "Unnamed Student"}</h4>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
                      <Mail size={14} className="text-blue-primary dark:text-gold" /> {selectedStudent.email}
                    </div>
                    {selectedStudent.phone && (
                      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
                        <Phone size={14} className="text-blue-primary dark:text-gold" /> {selectedStudent.phone}
                      </div>
                    )}
                    {selectedStudent.city && (
                      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
                        <MapPin size={14} className="text-blue-primary dark:text-gold" /> {selectedStudent.city}, {selectedStudent.country}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Academic */}
                <div className="space-y-4">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <GraduationCap size={14} className="text-blue-primary dark:text-gold" /> Academic Background
                  </h5>
                  <div className="bg-slate-50 dark:bg-[#0F1115] p-5 rounded-2xl space-y-4 border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Education Level</p>
                      <p className="text-sm font-bold dark:text-white mt-0.5">{selectedStudent.educationLevel || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Institution</p>
                      <p className="text-sm font-bold dark:text-white mt-0.5">{selectedStudent.institution || "N/A"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">CGPA</p>
                        <p className="text-sm font-bold dark:text-white mt-0.5">{selectedStudent.cgpa || "0.0"} / {selectedStudent.cgpaScale || "4.0"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Grad Year</p>
                        <p className="text-sm font-bold dark:text-white mt-0.5">{selectedStudent.graduationYear || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Test Scores */}
                <div className="space-y-4">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-blue-primary dark:text-gold" /> Test Scores
                  </h5>
                  <div className="bg-slate-50 dark:bg-[#0F1115] p-5 rounded-2xl space-y-4 border border-slate-100 dark:border-slate-800">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">IELTS</p>
                        <p className="text-sm font-bold dark:text-white mt-0.5">{selectedStudent.ielts || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">TOEFL</p>
                        <p className="text-sm font-bold dark:text-white mt-0.5">{selectedStudent.toefl || "N/A"}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">GRE</p>
                        <p className="text-sm font-bold dark:text-white mt-0.5">{selectedStudent.gre || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">GMAT</p>
                        <p className="text-sm font-bold dark:text-white mt-0.5">{selectedStudent.gmat || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                <div className="space-y-4">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={14} className="text-blue-primary dark:text-gold" /> Study Preferences
                  </h5>
                  <div className="bg-slate-50 dark:bg-[#0F1115] p-5 rounded-2xl space-y-4 border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Target Degree & Subject</p>
                      <p className="text-sm font-bold dark:text-white mt-0.5">{selectedStudent.targetDegree} in {selectedStudent.targetSubject || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Target Countries</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {selectedStudent.targetCountries?.map((c: string) => (
                          <span key={c} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg text-[10px] font-bold dark:text-slate-300 shadow-sm">{c}</span>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Intake</p>
                        <p className="text-sm font-bold dark:text-white mt-0.5">{selectedStudent.intake || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Budget (Max)</p>
                        <p className="text-sm font-bold dark:text-white mt-0.5">${selectedStudent.budgetMax || "0"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Career Goals */}
                <div className="space-y-4">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Award size={14} className="text-blue-primary dark:text-gold" /> Goals & Plans
                  </h5>
                  <div className="bg-slate-50 dark:bg-[#0F1115] p-5 rounded-2xl space-y-4 border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Career Goal</p>
                      <p className="text-xs font-bold leading-relaxed dark:text-slate-300 mt-1">{selectedStudent.careerGoal || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Post-Study Plan</p>
                      <p className="text-sm font-bold dark:text-white mt-0.5">{selectedStudent.postStudyPlan || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0F1115] flex justify-end">
              <button onClick={() => setSelectedStudent(null)} className="px-8 py-2.5 bg-navy dark:bg-gold dark:text-navy text-white rounded-xl font-bold text-sm transition-all hover:bg-slate-800 dark:hover:bg-gold-hover shadow-lg shadow-navy/10 dark:shadow-gold/10">Close Details</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
