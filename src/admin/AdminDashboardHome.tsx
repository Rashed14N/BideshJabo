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
import { collection, onSnapshot, query, orderBy, limit, writeBatch, doc, getDocs, addDoc, serverTimestamp, collectionGroup, setDoc } from 'firebase/firestore';
import { X, Send } from 'lucide-react';
import { cn } from '../lib/utils';

import { Link, useOutletContext } from 'react-router-dom';

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
    tags: ["Research", "Tech Hub", "Prestige"], status: "Active", score: 95
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
    tags: ["Global", "Culture", "Innovation"], status: "Active", score: 92
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
  }
];

export default function AdminDashboardHome() {
  const { isDarkMode } = useOutletContext<{ isDarkMode: boolean }>();
  
  const COLORS = isDarkMode 
    ? ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'] 
    : ['#141414', '#F27D26', '#3b82f6', '#10b981', '#f59e0b'];

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
      
      // Seed Universities with fixed IDs to prevent duplicates
      for (const uni of UNIVERSITIES) {
        const uniId = uni.name.toLowerCase().replace(/\s+/g, '-');
        const docRef = doc(db, "universities", uniId);
        batch.set(docRef, {
          ...uni,
          id: uniId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      // Seed Scholarships with fixed IDs
      for (const schol of SCHOLARSHIPS) {
        const scholId = schol.name.toLowerCase().replace(/\s+/g, '-');
        const docRef = doc(db, "scholarships", scholId);
        batch.set(docRef, {
          ...schol,
          id: scholId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      await batch.commit();

      // Seed Initial Blog Posts
      const blog1Id = "how-to-apply-by-yourself";
      await setDoc(doc(db, "blogs", blog1Id), {
        title: "How to Apply by Yourself: A Step-by-Step Guide",
        content: `Applying to universities abroad can seem like a daunting task, but with the right guidance, you can successfully navigate the process on your own. Here is a step-by-step guide:

1. Research & Shortlisting: Start by identifying countries and universities that match your academic background and budget. Use our University Match tool to simplify this!

2. Standardized Tests: Prepare for and take necessary tests like IELTS, TOEFL, GRE, or GMAT. Most universities require these to prove your proficiency.

3. Prepare Documents: Gather transcripts, write your Statement of Purpose (SOP), and request Letters of Recommendation (LOR). Your SOP is your chance to shine!

4. Submit Applications: Apply through the official university portals before the deadlines. Keep track of every date in our App Tracker.

5. Visa Process: Once accepted, apply for your student visa with the required financial documentation.

How Bidesh Jabo Helps:
- University Match: We analyze your profile to find universities where you have the best chance of admission.
- Scholarship Finder: Discover financial aid opportunities tailored to your profile.
- Application Tracker: Keep all your deadlines and statuses in one organized place.
- Expert Guides: Access our library of articles to stay informed.`,
        author: "Bidesh Jabo Team",
        image: "https://images.unsplash.com/photo-1523050335392-93851179ae22?auto=format&fit=crop&q=80&w=1000",
        tags: ["Guide", "Self-Apply", "Basics"],
        status: "Published",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const blog2Id = "top-countries-2026";
      await setDoc(doc(db, "blogs", blog2Id), {
        title: "Top 5 Countries for Bangladeshi Students in 2026",
        content: `Choosing the right destination is the first step in your study abroad journey. Based on visa success rates, part-time work opportunities, and post-study work permits, here are the top 5 countries for 2026:

1. Germany: With zero tuition fees at public universities and a strong economy, Germany remains a top choice for engineering and science students.

2. United Kingdom: The Graduate Route visa allows students to stay for 2 years after graduation, making it highly attractive for career growth.

3. Canada: Known for its welcoming immigration policies, Canada offers excellent PR prospects for international graduates.

4. Australia: High-quality education and beautiful lifestyle, with extended post-study work rights in regional areas.

5. USA: The land of opportunity continues to lead in research and innovation, with STEM OPT extensions providing up to 3 years of work authorization.

Start your journey today by checking your eligibility for these countries on Bidesh Jabo!`,
        author: "Bidesh Jabo Team",
        image: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&q=80&w=1000",
        tags: ["Destinations", "2026", "Trends"],
        status: "Published",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

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

  const handleClearData = async () => {
    if (!window.confirm("Are you sure you want to clear all University and Scholarship data? This cannot be undone.")) return;
    
    setIsSeeding(true);
    try {
      const uniSnap = await getDocs(collection(db, "universities"));
      const scholSnap = await getDocs(collection(db, "scholarships"));
      
      const batch = writeBatch(db);
      uniSnap.forEach(d => batch.delete(d.ref));
      scholSnap.forEach(d => batch.delete(d.ref));
      
      await batch.commit();
      alert("Data cleared successfully!");
    } catch (err) {
      console.error("Error clearing data:", err);
      alert("Failed to clear data.");
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
    { label: "Universities", value: stats.universities.toString(), trend: "Active", up: true, icon: <GraduationCap size={24} /> },
    { label: "Scholarships", value: stats.scholarships.toString(), trend: "Active", up: true, icon: <Award size={24} /> },
    { label: "Applications", value: stats.totalApps.toString(), trend: "Total", up: true, icon: <ClipboardList size={24} /> },
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
          <h1 className="text-3xl font-display font-extrabold tracking-tight dark:text-white">Dashboard Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleClearData}
            disabled={isSeeding}
            className="border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <X size={18} /> Clear Data
          </button>
          <button 
            onClick={handleSeedData}
            disabled={isSeeding}
            className={cn(
              "border px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-50",
              seedStatus === 'success' ? "bg-green-50 dark:bg-green-500/10 border-green-500 text-green-700 dark:text-green-400" :
              seedStatus === 'error' ? "bg-red-50 dark:bg-red-500/10 border-red-500 text-red-700 dark:text-red-400" :
              "bg-white dark:bg-[#161B22] border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white shadow-sm"
            )}
          >
            {isSeeding ? (
              <>
                <div className="w-4 h-4 border-2 border-navy dark:border-gold border-t-transparent rounded-full animate-spin" />
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
            className="bg-navy dark:bg-gold dark:text-navy text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 dark:hover:bg-gold-hover transition-all flex items-center gap-2 shadow-lg shadow-navy/10 dark:shadow-gold/10"
          >
            <Bell size={18} /> Send Announcement
          </button>
        </div>
      </div>

      {/* Announcement Modal */}
      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#161B22] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-display font-extrabold dark:text-white">Send Global Announcement</h3>
              <button onClick={() => setIsAnnouncementModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-slate-400 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSendAnnouncement} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Title</label>
                <input 
                  required 
                  type="text" 
                  value={announcement.title} 
                  onChange={e => setAnnouncement({...announcement, title: e.target.value})} 
                  placeholder="e.g. New Scholarship Available!"
                  className="w-full p-2.5 bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-navy/5 dark:focus:ring-gold/5 focus:border-navy dark:focus:border-gold dark:text-white transition-all" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</label>
                <select 
                  value={announcement.type} 
                  onChange={e => setAnnouncement({...announcement, type: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-navy/5 dark:focus:ring-gold/5 focus:border-navy dark:focus:border-gold dark:text-white transition-all"
                >
                  <option value="info" className="dark:bg-[#161B22]">Information</option>
                  <option value="warning" className="dark:bg-[#161B22]">Warning</option>
                  <option value="success" className="dark:bg-[#161B22]">Success / Update</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Message</label>
                <textarea 
                  required 
                  rows={4} 
                  value={announcement.message} 
                  onChange={e => setAnnouncement({...announcement, message: e.target.value})} 
                  placeholder="Type your message here..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-navy/5 dark:focus:ring-gold/5 focus:border-navy dark:focus:border-gold dark:text-white resize-none transition-all" 
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsAnnouncementModalOpen(false)} className="flex-1 py-3 border border-slate-200 dark:border-slate-800 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white transition-colors">Cancel</button>
                <button 
                  type="submit" 
                  disabled={isSending}
                  className="flex-1 py-3 bg-navy dark:bg-gold dark:text-navy text-white rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-gold-hover transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-navy/10 dark:shadow-gold/10"
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
          <div key={i} className={cn(
            "bg-white dark:bg-[#161B22] p-4 lg:p-6 border border-slate-200 dark:border-slate-800 rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group",
            isDarkMode ? "hover:border-gold/50" : "hover:border-navy/50"
          )}>
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <div className="p-2 bg-slate-50 dark:bg-[#0F1115] rounded-xl group-hover:scale-110 transition-transform">
                {React.cloneElement(stat.icon as React.ReactElement, { 
                  size: 20, 
                  className: isDarkMode ? "text-gold" : "text-navy" 
                })}
              </div>
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                stat.up ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400'
              )}>
                {stat.trend}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-xl lg:text-2xl font-display font-extrabold mt-1 dark:text-white">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Registration Chart */}
        <div className="bg-white dark:bg-[#1A1A1A] p-8 border border-[#141414] dark:border-slate-700 rounded-2xl shadow-sm">
          <h3 className="text-lg font-display font-extrabold mb-6 dark:text-white">User Registrations (30 Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={regData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#f1f5f9'} opacity={isDarkMode ? 0.5 : 1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDarkMode ? '#94a3b8' : '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDarkMode ? '#94a3b8' : '#64748b' }} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: isDarkMode ? '1px solid #334155' : '1px solid #141414', 
                    boxShadow: isDarkMode ? '4px 4px 0px 0px #f59e0b' : '4px 4px 0px 0px #141414', 
                    backgroundColor: isDarkMode ? '#1A1A1A' : '#fff', 
                    color: isDarkMode ? '#fff' : '#141414' 
                  }}
                  itemStyle={{ color: isDarkMode ? '#fff' : '#141414' }}
                  cursor={{ stroke: isDarkMode ? '#334155' : '#f1f5f9', strokeWidth: 2 }}
                />
                <Line type="monotone" dataKey="users" stroke={isDarkMode ? '#f59e0b' : '#141414'} strokeWidth={3} dot={{ r: 4, fill: isDarkMode ? '#f59e0b' : '#141414' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Country Pie Chart */}
        <div className="bg-white dark:bg-[#1A1A1A] p-8 border border-[#141414] dark:border-slate-700 rounded-2xl shadow-sm">
          <h3 className="text-lg font-display font-extrabold mb-6 dark:text-white">Students by Target Country</h3>
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
                  stroke={isDarkMode ? '#1A1A1A' : '#fff'}
                >
                  {countryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={isDarkMode ? '#1A1A1A' : '#fff'} />
                  ))}
                  {countryStats.length === 0 && <Cell fill={isDarkMode ? '#334155' : '#e2e8f0'} />}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: isDarkMode ? '1px solid #334155' : '1px solid #141414', 
                    boxShadow: isDarkMode ? '4px 4px 0px 0px #f59e0b' : '4px 4px 0px 0px #141414', 
                    backgroundColor: isDarkMode ? '#1A1A1A' : '#fff', 
                    color: isDarkMode ? '#fff' : '#141414' 
                  }}
                  itemStyle={{ color: isDarkMode ? '#fff' : '#141414' }}
                  cursor={{ fill: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {countryStats.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{entry.name}</span>
              </div>
            ))}
            {countryStats.length === 0 && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700" />
                <span className="text-xs font-bold text-slate-400">No Data</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Latest Students Table */}
      <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-display font-extrabold dark:text-white">Latest Registered Students</h3>
          <Link to="/admin/students" className="text-sm font-bold text-blue-primary dark:text-gold hover:underline">View All Students</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0F1115] border-b border-slate-200 dark:border-slate-800">
                <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Student</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:table-cell">Target</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden md:table-cell">CGPA</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Profile %</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden lg:table-cell">Status</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, i) => {
                const fields = ["fullName", "cgpa", "ielts", "targetDegree"];
                const filled = fields.filter(f => student[f]).length;
                const pct = Math.round((filled / fields.length) * 100);

                return (
                  <tr key={student.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-navy dark:bg-gold dark:text-navy text-white rounded-xl shrink-0 flex items-center justify-center font-bold text-sm shadow-sm">
                          {student.fullName?.[0] || student.email?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate dark:text-white group-hover:text-blue-primary dark:group-hover:text-gold transition-colors">{student.fullName || "Unnamed Student"}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-medium">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <p className="text-sm font-bold dark:text-slate-200">{student.targetDegree || "N/A"}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight">{student.targetCountries?.join(', ') || "N/A"}</p>
                    </td>
                    <td className="p-4 text-sm font-mono hidden md:table-cell dark:text-slate-300">{student.cgpa || "0.0"} / {student.cgpaScale || "4.0"}</td>
                    <td className="p-4">
                      <div className="w-32 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden shadow-inner">
                        <div className="bg-gold h-full rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1.5 uppercase tracking-tighter">{pct}% Profile Complete</p>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <span className="bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">Active</span>
                    </td>
                    <td className="p-4">
                      <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-navy dark:hover:text-gold transition-all">
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
