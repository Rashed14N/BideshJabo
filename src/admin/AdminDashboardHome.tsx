import React, { useEffect, useState } from 'react';
import { 
  Users, 
  GraduationCap, 
  Award, 
  ClipboardList, 
  TrendingUp, 
  Plus,
  Bell,
  Eye,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, limit, writeBatch, doc, getDocs, addDoc, serverTimestamp, collectionGroup } from 'firebase/firestore';
import { X, Send } from 'lucide-react';
import { cn } from '../lib/utils';

import { Link } from 'react-router-dom';

const UNIVERSITIES = [
  {
    name: "University of Toronto", shortName: "UofT", country: "Canada", city: "Toronto",
    qsRank: 21, acceptanceRate: 43, tuitionPerYear: 35000, livingCost: 15000,
    minCGPA: 3.5, minIELTS: 6.5, minTOEFL: 93, greRequired: false, workExpRequired: false,
    programs: ["Computer Science", "Engineering", "Business", "Life Sciences"],
    degreeLevel: ["Bachelor", "Master", "PhD"],
    scholarships: ["Lester B. Pearson International Scholarship"],
    scholarshipAmount: 40000, postStudyVisa: true, postStudyYears: 3,
    employmentRate: 92, avgSalary: 75000, bangladeshiCommunity: "Large",
    partTimeAllowed: true, partTimeHours: 20, logo: "🍁", tier: 1,
    intakes: ["Fall"], fallDeadline: "2025-01-15", springDeadline: null,
    tags: ["Research", "Tech Hub", "Prestige"], status: "Active"
  },
  {
    name: "University of Melbourne", shortName: "Unimelb", country: "Australia", city: "Melbourne",
    qsRank: 33, acceptanceRate: 70, tuitionPerYear: 28000, livingCost: 18000,
    minCGPA: 3.0, minIELTS: 6.5, minTOEFL: 79, greRequired: false, workExpRequired: false,
    programs: ["Architecture", "Arts", "Biomedicine", "Commerce"],
    degreeLevel: ["Bachelor", "Master", "PhD"],
    scholarships: ["Melbourne International Undergraduate Scholarship"],
    scholarshipAmount: 10000, postStudyVisa: true, postStudyYears: 2,
    employmentRate: 88, avgSalary: 68000, bangladeshiCommunity: "Medium",
    partTimeAllowed: true, partTimeHours: 24, logo: "🦘", tier: 1,
    intakes: ["Fall", "Spring"], fallDeadline: "2025-05-31", springDeadline: "2024-10-31",
    tags: ["Global", "Culture", "Innovation"], status: "Active"
  },
  {
    name: "TU Munich", shortName: "TUM", country: "Germany", city: "Munich",
    qsRank: 37, acceptanceRate: 8, tuitionPerYear: 500, livingCost: 12000,
    minCGPA: 3.3, minIELTS: 7.0, minTOEFL: 88, greRequired: true, workExpRequired: false,
    programs: ["Informatics", "Mechanical Engineering", "Physics", "Management"],
    degreeLevel: ["Master", "PhD"],
    scholarships: ["DAAD Scholarship"],
    scholarshipAmount: 12000, postStudyVisa: true, postStudyYears: 1.5,
    employmentRate: 95, avgSalary: 62000, bangladeshiCommunity: "Medium",
    partTimeAllowed: true, partTimeHours: 20, logo: "🇩🇪", tier: 1,
    intakes: ["Fall", "Spring"], fallDeadline: "2025-05-31", springDeadline: "2024-11-30",
    tags: ["Engineering", "Low Tuition", "Industry"], status: "Active"
  },
  {
    name: "University of British Columbia", shortName: "UBC", country: "Canada", city: "Vancouver",
    qsRank: 46, acceptanceRate: 52, tuitionPerYear: 32000, livingCost: 16000,
    minCGPA: 3.2, minIELTS: 6.5, minTOEFL: 90, greRequired: false, workExpRequired: false,
    programs: ["Sustainability", "Forestry", "Computer Science", "Economics"],
    degreeLevel: ["Bachelor", "Master", "PhD"],
    scholarships: ["International Major Entrance Scholarship"],
    scholarshipAmount: 20000, postStudyVisa: true, postStudyYears: 3,
    employmentRate: 89, avgSalary: 70000, bangladeshiCommunity: "Large",
    partTimeAllowed: true, partTimeHours: 20, logo: "🌲", tier: 1,
    intakes: ["Fall"], fallDeadline: "2025-01-15", springDeadline: null,
    tags: ["Nature", "Research", "Diverse"], status: "Active"
  },
  {
    name: "University of Manchester", shortName: "Manchester", country: "UK", city: "Manchester",
    qsRank: 32, acceptanceRate: 56, tuitionPerYear: 27000, livingCost: 14000,
    minCGPA: 3.0, minIELTS: 6.5, minTOEFL: 90, greRequired: false, workExpRequired: false,
    programs: ["Engineering", "Humanities", "Social Sciences", "Business"],
    degreeLevel: ["Bachelor", "Master", "PhD"],
    scholarships: ["Global Futures Scholarship"],
    scholarshipAmount: 5000, postStudyVisa: true, postStudyYears: 2,
    employmentRate: 91, avgSalary: 55000, bangladeshiCommunity: "Large",
    partTimeAllowed: true, partTimeHours: 20, logo: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", tier: 1,
    intakes: ["Fall"], fallDeadline: "2025-06-30", springDeadline: null,
    tags: ["Heritage", "Urban", "Science"], status: "Active"
  },
  {
    name: "NUS Singapore", shortName: "NUS", country: "Singapore", city: "Singapore",
    qsRank: 8, acceptanceRate: 5, tuitionPerYear: 18000, livingCost: 14000,
    minCGPA: 3.6, minIELTS: 6.5, minTOEFL: 92, greRequired: true, workExpRequired: true,
    programs: ["Computing", "Engineering", "Medicine", "Public Policy"],
    degreeLevel: ["Bachelor", "Master", "PhD"],
    scholarships: ["ASEAN Undergraduate Scholarship", "NUS Research Scholarship"],
    scholarshipAmount: 20000, postStudyVisa: true, postStudyYears: 1,
    employmentRate: 94, avgSalary: 60000, bangladeshiCommunity: "Small",
    partTimeAllowed: true, partTimeHours: 16, logo: "🦁", tier: 1,
    intakes: ["Fall", "Spring"], fallDeadline: "2025-02-21", springDeadline: "2024-09-30",
    tags: ["Elite", "Asia Hub", "Tech"], status: "Active"
  }
];

const SCHOLARSHIPS = [
  {
    name: "DAAD Scholarship", country: "Germany",
    degreeLevel: ["Master", "PhD"], amount: 18000,
    coverage: ["Full Tuition", "Monthly Stipend", "Travel Allowance"],
    minCGPA: 3.2, minIELTS: 6.5, deadline: "2024-12-31",
    type: "Government", renewable: true, subjects: ["Engineering", "Development", "Economics"],
    description: "One of the most prestigious scholarships for international students to study in Germany.",
    link: "https://www.daad.de", featured: true
  },
  {
    name: "Lester B. Pearson Scholarship", country: "Canada",
    degreeLevel: ["Bachelor"], amount: 30000,
    coverage: ["Full Tuition", "Books", "Incidental Fees", "Full Residence Support"],
    minCGPA: 3.7, minIELTS: 7.0, deadline: "2025-01-15",
    type: "University", renewable: true, subjects: ["All Subjects"],
    description: "The University of Toronto's most prestigious and competitive scholarship for international students.",
    link: "https://future.utoronto.ca", featured: true
  },
  {
    name: "Chevening Scholarship", country: "UK",
    degreeLevel: ["Master"], amount: 25000,
    coverage: ["Full Tuition", "Monthly Stipend", "Travel Costs"],
    minCGPA: 3.0, minIELTS: 6.5, deadline: "2024-11-05",
    type: "Government", renewable: false, subjects: ["Leadership", "Policy", "Business"],
    description: "UK government's global scholarship program, funded by the Foreign, Commonwealth and Development Office.",
    link: "https://www.chevening.org", featured: true
  }
];

const COLORS = ['#141414', '#F27D26', '#3b82f6', '#10b981', '#f59e0b'];

export default function AdminDashboardHome() {
  const [students, setStudents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalApps: 0,
    universities: 0,
    scholarships: 0
  });
  const [countryStats, setCountryStats] = useState<any[]>([]);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [announcement, setAnnouncement] = useState({ title: "", message: "", type: "info" });
  const [isSending, setIsSending] = useState(false);

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await addDoc(collection(db, "announcements"), {
        ...announcement,
        createdAt: serverTimestamp(),
        active: true
      });
      setIsAnnouncementModalOpen(false);
      setAnnouncement({ title: "", message: "", type: "info" });
    } catch (err) {
      console.error("Error sending announcement:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    setSeedStatus('idle');
    try {
      const batch = writeBatch(db);
      
      // Seed Universities
      for (const uni of UNIVERSITIES) {
        const newDoc = doc(collection(db, "universities"));
        batch.set(newDoc, {
          ...uni,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      // Seed Scholarships
      for (const schol of SCHOLARSHIPS) {
        const newDoc = doc(collection(db, "scholarships"));
        batch.set(newDoc, {
          ...schol,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      await batch.commit();
      setSeedStatus('success');
      setTimeout(() => setSeedStatus('idle'), 3000);
    } catch (err) {
      console.error("Seeding error:", err);
      setSeedStatus('error');
      setTimeout(() => setSeedStatus('idle'), 3000);
    } finally {
      setIsSeeding(false);
    }
  };

  useEffect(() => {
    // Fetch latest students
    const q = query(collection(db, "users"), orderBy("updatedAt", "desc"), limit(5));
    const unsubStudents = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setStudents(data);
    });

    // Fetch total counts
    const unsubAllStudents = onSnapshot(collection(db, "users"), (snap) => {
      const total = snap.size;
      
      // Calculate country distribution
      const countries: Record<string, number> = {};
      snap.docs.forEach(doc => {
        const data = doc.data();
        if (data.targetCountries && Array.isArray(data.targetCountries)) {
          data.targetCountries.forEach((c: string) => {
            countries[c] = (countries[c] || 0) + 1;
          });
        }
      });
      
      const countryData = Object.entries(countries)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
      
      setCountryStats(countryData);
      setStats(prev => ({ ...prev, totalStudents: total }));
    });

    // Fetch Universities count
    const unsubUnis = onSnapshot(collection(db, "universities"), (snap) => {
      setStats(prev => ({ ...prev, universities: snap.size }));
    });

    // Fetch Scholarships count
    const unsubSchols = onSnapshot(collection(db, "scholarships"), (snap) => {
      setStats(prev => ({ ...prev, scholarships: snap.size }));
    });

    // Fetch Total Applications count
    const unsubApps = onSnapshot(collectionGroup(db, "applications"), (snap) => {
      setStats(prev => ({ ...prev, totalApps: snap.size }));
    });

    return () => {
      unsubStudents();
      unsubAllStudents();
      unsubUnis();
      unsubSchols();
      unsubApps();
    };
  }, []);

  const dashboardStats = [
    { label: "Total Students", value: stats.totalStudents.toLocaleString(), trend: "+100%", up: true, icon: <Users size={24} /> },
    { label: "Active Users (7d)", value: stats.totalStudents.toLocaleString(), trend: "0%", up: true, icon: <TrendingUp size={24} /> },
    { label: "Universities", value: stats.universities.toString(), trend: "Real", up: true, icon: <GraduationCap size={24} /> },
    { label: "Scholarships", value: stats.scholarships.toString(), trend: "Real", up: true, icon: <Award size={24} /> },
    { label: "Applications", value: stats.totalApps.toString(), trend: "Real", up: true, icon: <ClipboardList size={24} /> },
    { label: "New Signups", value: stats.totalStudents.toString(), trend: "Today", up: true, icon: <Users size={24} /> },
  ];

  const regData = [
    { name: 'Mar 10', users: 0 },
    { name: 'Apr 08', users: stats.totalStudents },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-extrabold tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 text-sm font-medium">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleSeedData}
            disabled={isSeeding}
            className={cn(
              "border px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-50",
              seedStatus === 'success' ? "bg-green-50 border-green-500 text-green-700" :
              seedStatus === 'error' ? "bg-red-50 border-red-500 text-red-700" :
              "bg-white border-[#141414] hover:bg-slate-50"
            )}
          >
            {isSeeding ? (
              <>
                <div className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                Seeding...
              </>
            ) : seedStatus === 'success' ? (
              <>
                <CheckCircle2 size={18} /> Data Seeded!
              </>
            ) : seedStatus === 'error' ? (
              <>
                <AlertCircle size={18} /> Error!
              </>
            ) : (
              <>
                <Plus size={18} /> Seed Initial Data
              </>
            )}
          </button>
          <button 
            onClick={() => setIsAnnouncementModalOpen(true)}
            className="bg-[#141414] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            <Bell size={18} /> Send Announcement
          </button>
        </div>
      </div>

      {/* Announcement Modal */}
      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-display font-extrabold">Send Global Announcement</h3>
              <button onClick={() => setIsAnnouncementModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleSendAnnouncement} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Title</label>
                <input 
                  required 
                  type="text" 
                  value={announcement.title} 
                  onChange={e => setAnnouncement({...announcement, title: e.target.value})} 
                  placeholder="e.g. New Scholarship Available!"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#141414]" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                <select 
                  value={announcement.type} 
                  onChange={e => setAnnouncement({...announcement, type: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#141414]"
                >
                  <option value="info">Information</option>
                  <option value="warning">Warning</option>
                  <option value="success">Success / Update</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Message</label>
                <textarea 
                  required 
                  rows={4} 
                  value={announcement.message} 
                  onChange={e => setAnnouncement({...announcement, message: e.target.value})} 
                  placeholder="Type your message here..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#141414] resize-none" 
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsAnnouncementModalOpen(false)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold hover:bg-slate-50">Cancel</button>
                <button 
                  type="submit" 
                  disabled={isSending}
                  className="flex-1 py-3 bg-[#141414] text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSending ? "Sending..." : <><Send size={18} /> Send Now</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6">
        {dashboardStats.map((stat, i) => (
          <div key={i} className="bg-white p-4 lg:p-6 border border-[#141414] rounded-xl shadow-[4px_4px_0px_0px_#141414]">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <div className="p-1.5 lg:p-2 bg-slate-50 rounded-lg">
                {React.cloneElement(stat.icon as React.ReactElement, { size: 18 })}
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${stat.up ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-lg lg:text-2xl font-display font-extrabold mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Registration Chart */}
        <div className="bg-white p-8 border border-[#141414] rounded-2xl">
          <h3 className="text-lg font-display font-extrabold mb-6">User Registrations (30 Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={regData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #141414', boxShadow: '4px 4px 0px 0px #141414' }}
                />
                <Line type="monotone" dataKey="users" stroke="#141414" strokeWidth={3} dot={{ r: 4, fill: '#141414' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Country Pie Chart */}
        <div className="bg-white p-8 border border-[#141414] rounded-2xl">
          <h3 className="text-lg font-display font-extrabold mb-6">Students by Target Country</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={countryStats.length > 0 ? countryStats : [{ name: 'No Data', value: 1 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {countryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                  {countryStats.length === 0 && <Cell fill="#e2e8f0" />}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {countryStats.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-xs font-bold text-slate-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Latest Students Table */}
      <div className="bg-white border border-[#141414] rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-[#141414] flex items-center justify-between">
          <h3 className="text-lg font-display font-extrabold">Latest Registered Students</h3>
          <Link to="/admin/students" className="text-sm font-bold text-blue-primary hover:underline">View All Students</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-[#141414]">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Student</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest hidden sm:table-cell">Target</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest hidden md:table-cell">CGPA</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Profile %</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest hidden lg:table-cell">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, i) => {
                const fields = ["fullName", "cgpa", "ielts", "targetDegree"];
                const filled = fields.filter(f => student[f]).length;
                const pct = Math.round((filled / fields.length) * 100);

                return (
                  <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#141414] text-white rounded-full shrink-0 flex items-center justify-center font-bold text-xs">
                          {student.fullName?.[0] || student.email?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate">{student.fullName || "Unnamed Student"}</p>
                          <p className="text-[10px] text-slate-500 truncate">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <p className="text-sm font-medium">{student.targetDegree || "N/A"}</p>
                      <p className="text-xs text-slate-500">{student.targetCountries?.join(', ') || "N/A"}</p>
                    </td>
                    <td className="p-4 text-sm font-mono hidden md:table-cell">{student.cgpa || "0.0"} / {student.cgpaScale || "4.0"}</td>
                    <td className="p-4">
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-gold h-full" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 mt-1">{pct}%</p>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Active</span>
                    </td>
                    <td className="p-4">
                      <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-[#141414]">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {students.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">No students registered yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
