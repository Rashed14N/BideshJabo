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
          <h1 className="text-2xl font-display font-extrabold tracking-tight dark:text-white">Student Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">View and manage registered student profiles and their progress.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white dark:bg-[#1A1A1A] border border-[#141414] dark:border-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white transition-colors flex items-center gap-2">
            <Download size={18} /> Export Students
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
            placeholder="Search by name, email or phone..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-[#141414] dark:focus:border-gold dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <select className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-[#141414] dark:focus:border-gold dark:text-white">
            <option className="dark:bg-[#1A1A1A]">All Levels</option>
            <option className="dark:bg-[#1A1A1A]">SSC</option>
            <option className="dark:bg-[#1A1A1A]">HSC</option>
            <option className="dark:bg-[#1A1A1A]">Bachelor</option>
            <option className="dark:bg-[#1A1A1A]">Master</option>
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
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Student</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:table-cell">Education</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden md:table-cell">CGPA</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden lg:table-cell">Target</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Profile %</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                const fields = ["fullName", "cgpa", "ielts", "targetDegree"];
                const filled = fields.filter(f => student[f]).length;
                const pct = Math.round((filled / fields.length) * 100);

                return (
                  <tr key={student.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#141414] dark:bg-gold dark:text-[#141414] text-white rounded-full flex items-center justify-center font-bold shrink-0">
                          {student.fullName?.[0] || student.email?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate dark:text-white">{student.fullName || "Unnamed Student"}</p>
                          <p className="text-[10px] text-slate-400 font-mono truncate dark:text-slate-500">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium hidden sm:table-cell dark:text-slate-300">
                      {student.educationLevel || "N/A"}
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">{student.institution || "N/A"}</p>
                    </td>
                    <td className="p-4 text-sm font-mono hidden md:table-cell dark:text-slate-300">{student.cgpa || "0.0"} / {student.cgpaScale || "4.0"}</td>
                    <td className="p-4 hidden lg:table-cell">
                      <p className="text-sm font-bold dark:text-white">{student.targetDegree || "N/A"}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">{student.targetCountries?.join(', ') || "N/A"}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full max-w-[60px]">
                          <div className={cn(
                            "h-full rounded-full transition-all",
                            pct > 70 ? "bg-green-500" : pct > 30 ? "bg-gold" : "bg-red-500"
                          )} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-bold dark:text-slate-400">{pct}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => setSelectedStudent(student)}
                          className="p-2 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm rounded-lg text-slate-400 hover:text-blue-primary dark:hover:text-gold transition-all"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(student.id)}
                          className="p-2 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm rounded-lg text-slate-400 hover:text-red-600 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredStudents.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">No students found.</td>
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

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border dark:border-slate-700">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-display font-extrabold dark:text-white">Student Profile Details</h3>
              <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-8">
              {/* Header Info */}
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-[#141414] dark:bg-gold dark:text-[#141414] text-white rounded-full flex items-center justify-center text-3xl font-bold">
                  {selectedStudent.fullName?.[0] || selectedStudent.email?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h4 className="text-2xl font-display font-extrabold text-navy dark:text-white">{selectedStudent.fullName || "Unnamed Student"}</h4>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                      <Mail size={14} /> {selectedStudent.email}
                    </div>
                    {selectedStudent.phone && (
                      <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                        <Phone size={14} /> {selectedStudent.phone}
                      </div>
                    )}
                    {selectedStudent.city && (
                      <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                        <MapPin size={14} /> {selectedStudent.city}, {selectedStudent.country}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Academic */}
                <div className="space-y-4">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <GraduationCap size={14} /> Academic Background
                  </h5>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl space-y-3">
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Education Level</p>
                      <p className="text-sm font-bold dark:text-white">{selectedStudent.educationLevel || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Institution</p>
                      <p className="text-sm font-bold dark:text-white">{selectedStudent.institution || "N/A"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">CGPA</p>
                        <p className="text-sm font-bold dark:text-white">{selectedStudent.cgpa || "0.0"} / {selectedStudent.cgpaScale || "4.0"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Grad Year</p>
                        <p className="text-sm font-bold dark:text-white">{selectedStudent.graduationYear || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Test Scores */}
                <div className="space-y-4">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 size={14} /> Test Scores
                  </h5>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">IELTS</p>
                        <p className="text-sm font-bold dark:text-white">{selectedStudent.ielts || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">TOEFL</p>
                        <p className="text-sm font-bold dark:text-white">{selectedStudent.toefl || "N/A"}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">GRE</p>
                        <p className="text-sm font-bold dark:text-white">{selectedStudent.gre || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">GMAT</p>
                        <p className="text-sm font-bold dark:text-white">{selectedStudent.gmat || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                <div className="space-y-4">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={14} /> Study Preferences
                  </h5>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl space-y-3">
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Target Degree & Subject</p>
                      <p className="text-sm font-bold dark:text-white">{selectedStudent.targetDegree} in {selectedStudent.targetSubject || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Target Countries</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedStudent.targetCountries?.map((c: string) => (
                          <span key={c} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold dark:text-slate-300">{c}</span>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Intake</p>
                        <p className="text-sm font-bold dark:text-white">{selectedStudent.intake || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Budget (Max)</p>
                        <p className="text-sm font-bold dark:text-white">${selectedStudent.budgetMax || "0"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Career Goals */}
                <div className="space-y-4">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <X size={14} /> Goals & Plans
                  </h5>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl space-y-3">
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Career Goal</p>
                      <p className="text-xs font-medium line-clamp-2 dark:text-slate-300">{selectedStudent.careerGoal || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Post-Study Plan</p>
                      <p className="text-sm font-bold dark:text-white">{selectedStudent.postStudyPlan || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
              <button onClick={() => setSelectedStudent(null)} className="px-6 py-2 bg-[#141414] dark:bg-gold dark:text-[#141414] text-white rounded-xl font-bold text-sm">Close Details</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
