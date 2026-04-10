import React, { useState, useEffect, useMemo, useCallback, Component } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  LayoutDashboard, 
  UserCircle, 
  GraduationCap, 
  Award, 
  ClipboardList, 
  Calculator, 
  Menu, 
  X, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Globe,
  DollarSign,
  Calendar,
  ExternalLink,
  Trash2,
  Plus,
  Search,
  TrendingUp,
  Briefcase,
  BookOpen,
  LogOut,
  LogIn,
  Sparkles,
  Send,
  Loader2,
  HelpCircle,
  ArrowRight,
  Clock,
  Image as ImageIcon,
  User as UserIcon
} from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import AdminLayout from './admin/AdminLayout';
import AdminDashboardHome from './admin/AdminDashboardHome';
import AdminLogin from './admin/AdminLogin';
import UniversityManagement from './admin/UniversityManagement';
import StudentManagement from './admin/StudentManagement';
import ScholarshipManagement from './admin/ScholarshipManagement';
import AnnouncementManagement from './admin/AnnouncementManagement';
import ApplicationManagement from './admin/ApplicationManagement';
import BlogManagement from './admin/BlogManagement';
import { auth, db, loginWithGoogle, logout, onAuthStateChanged, User, OperationType, handleFirestoreError } from './firebase';
import { doc, onSnapshot, setDoc, collection, addDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import Logo from './components/Logo';
// --- DATA CONSTANTS ---

const UNIVERSITIES = [
  {
    id: 1, name: "University of Toronto", shortName: "UofT", country: "Canada", city: "Toronto",
    qsRank: 21, acceptanceRate: 43, tuitionPerYear: 35000, livingCost: 15000,
    minCGPA: 3.5, minIELTS: 6.5, minTOEFL: 93, greRequired: false, workExpRequired: false,
    programs: ["Computer Science", "Engineering", "Business", "Life Sciences"],
    degreeLevel: ["Bachelor", "Master", "PhD"],
    scholarships: ["Lester B. Pearson International Scholarship"],
    scholarshipAmount: 40000, postStudyVisa: true, postStudyYears: 3,
    employmentRate: 92, avgSalary: 75000, bangladeshiCommunity: "Large",
    partTimeAllowed: true, partTimeHours: 20, logo: "🍁", tier: 1,
    intakes: ["Fall"], fallDeadline: "2025-01-15", springDeadline: null,
    tags: ["Research", "Tech Hub", "Prestige"]
  },
  {
    id: 2, name: "University of Melbourne", shortName: "Unimelb", country: "Australia", city: "Melbourne",
    qsRank: 33, acceptanceRate: 70, tuitionPerYear: 28000, livingCost: 18000,
    minCGPA: 3.0, minIELTS: 6.5, minTOEFL: 79, greRequired: false, workExpRequired: false,
    programs: ["Architecture", "Arts", "Biomedicine", "Commerce"],
    degreeLevel: ["Bachelor", "Master", "PhD"],
    scholarships: ["Melbourne International Undergraduate Scholarship"],
    scholarshipAmount: 10000, postStudyVisa: true, postStudyYears: 2,
    employmentRate: 88, avgSalary: 68000, bangladeshiCommunity: "Medium",
    partTimeAllowed: true, partTimeHours: 24, logo: "🦘", tier: 1,
    intakes: ["Fall", "Spring"], fallDeadline: "2025-05-31", springDeadline: "2024-10-31",
    tags: ["Global", "Culture", "Innovation"]
  },
  {
    id: 3, name: "TU Munich", shortName: "TUM", country: "Germany", city: "Munich",
    qsRank: 37, acceptanceRate: 8, tuitionPerYear: 500, livingCost: 12000,
    minCGPA: 3.3, minIELTS: 7.0, minTOEFL: 88, greRequired: true, workExpRequired: false,
    programs: ["Informatics", "Mechanical Engineering", "Physics", "Management"],
    degreeLevel: ["Master", "PhD"],
    scholarships: ["DAAD Scholarship"],
    scholarshipAmount: 12000, postStudyVisa: true, postStudyYears: 1.5,
    employmentRate: 95, avgSalary: 62000, bangladeshiCommunity: "Medium",
    partTimeAllowed: true, partTimeHours: 20, logo: "🇩🇪", tier: 1,
    intakes: ["Fall", "Spring"], fallDeadline: "2025-05-31", springDeadline: "2024-11-30",
    tags: ["Engineering", "Low Tuition", "Industry"]
  },
  {
    id: 4, name: "University of British Columbia", shortName: "UBC", country: "Canada", city: "Vancouver",
    qsRank: 46, acceptanceRate: 52, tuitionPerYear: 32000, livingCost: 16000,
    minCGPA: 3.2, minIELTS: 6.5, minTOEFL: 90, greRequired: false, workExpRequired: false,
    programs: ["Sustainability", "Forestry", "Computer Science", "Economics"],
    degreeLevel: ["Bachelor", "Master", "PhD"],
    scholarships: ["International Major Entrance Scholarship"],
    scholarshipAmount: 20000, postStudyVisa: true, postStudyYears: 3,
    employmentRate: 89, avgSalary: 70000, bangladeshiCommunity: "Large",
    partTimeAllowed: true, partTimeHours: 20, logo: "🌲", tier: 1,
    intakes: ["Fall"], fallDeadline: "2025-01-15", springDeadline: null,
    tags: ["Nature", "Research", "Diverse"]
  },
  {
    id: 5, name: "University of Manchester", shortName: "Manchester", country: "UK", city: "Manchester",
    qsRank: 32, acceptanceRate: 56, tuitionPerYear: 27000, livingCost: 14000,
    minCGPA: 3.0, minIELTS: 6.5, minTOEFL: 90, greRequired: false, workExpRequired: false,
    programs: ["Engineering", "Humanities", "Social Sciences", "Business"],
    degreeLevel: ["Bachelor", "Master", "PhD"],
    scholarships: ["Global Futures Scholarship"],
    scholarshipAmount: 5000, postStudyVisa: true, postStudyYears: 2,
    employmentRate: 91, avgSalary: 55000, bangladeshiCommunity: "Large",
    partTimeAllowed: true, partTimeHours: 20, logo: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", tier: 1,
    intakes: ["Fall"], fallDeadline: "2025-06-30", springDeadline: null,
    tags: ["Heritage", "Urban", "Science"]
  },
  {
    id: 6, name: "NUS Singapore", shortName: "NUS", country: "Singapore", city: "Singapore",
    qsRank: 8, acceptanceRate: 5, tuitionPerYear: 18000, livingCost: 14000,
    minCGPA: 3.6, minIELTS: 6.5, minTOEFL: 92, greRequired: true, workExpRequired: true,
    programs: ["Computing", "Engineering", "Medicine", "Public Policy"],
    degreeLevel: ["Bachelor", "Master", "PhD"],
    scholarships: ["ASEAN Undergraduate Scholarship", "NUS Research Scholarship"],
    scholarshipAmount: 20000, postStudyVisa: true, postStudyYears: 1,
    employmentRate: 94, avgSalary: 60000, bangladeshiCommunity: "Small",
    partTimeAllowed: true, partTimeHours: 16, logo: "🦁", tier: 1,
    intakes: ["Fall", "Spring"], fallDeadline: "2025-02-21", springDeadline: "2024-09-30",
    tags: ["Elite", "Asia Hub", "Tech"]
  },
  {
    id: 7, name: "University of Amsterdam", shortName: "UvA", country: "Netherlands", city: "Amsterdam",
    qsRank: 53, acceptanceRate: 4, tuitionPerYear: 14000, livingCost: 13000,
    minCGPA: 3.0, minIELTS: 6.5, minTOEFL: 92, greRequired: false, workExpRequired: false,
    programs: ["Psychology", "Communication Science", "Economics", "Law"],
    degreeLevel: ["Bachelor", "Master"],
    scholarships: ["Holland Scholarship"],
    scholarshipAmount: 5000, postStudyVisa: true, postStudyYears: 1,
    employmentRate: 87, avgSalary: 52000, bangladeshiCommunity: "Small",
    partTimeAllowed: true, partTimeHours: 16, logo: "🌷", tier: 2,
    intakes: ["Fall"], fallDeadline: "2025-04-01", springDeadline: null,
    tags: ["Creative", "International", "Liberal"]
  },
  {
    id: 8, name: "Monash University", shortName: "Monash", country: "Australia", city: "Melbourne",
    qsRank: 57, acceptanceRate: 40, tuitionPerYear: 24000, livingCost: 17000,
    minCGPA: 2.8, minIELTS: 6.0, minTOEFL: 79, greRequired: false, workExpRequired: false,
    programs: ["Nursing", "Pharmacy", "Education", "Engineering"],
    degreeLevel: ["Bachelor", "Master", "PhD"],
    scholarships: ["Monash International Merit Scholarship"],
    scholarshipAmount: 10000, postStudyVisa: true, postStudyYears: 2,
    employmentRate: 85, avgSalary: 64000, bangladeshiCommunity: "Medium",
    partTimeAllowed: true, partTimeHours: 24, logo: "🌏", tier: 2,
    intakes: ["Fall", "Spring"], fallDeadline: "2025-05-31", springDeadline: "2024-10-31",
    tags: ["Modern", "Research", "Global"]
  }
];

const SCHOLARSHIPS = [
  {
    id: 1, name: "DAAD Scholarship", country: "Germany",
    degreeLevel: ["Master", "PhD"], amount: 18000,
    coverage: ["Full Tuition", "Monthly Stipend", "Travel Allowance"],
    minCGPA: 3.2, minIELTS: 6.5, deadline: "2024-12-31",
    type: "Government", renewable: true, subjects: ["Engineering", "Development", "Economics"],
    description: "One of the most prestigious scholarships for international students to study in Germany.",
    link: "https://www.daad.de", featured: true
  },
  {
    id: 2, name: "Lester B. Pearson Scholarship", country: "Canada",
    degreeLevel: ["Bachelor"], amount: 30000,
    coverage: ["Full Tuition", "Books", "Incidental Fees", "Full Residence Support"],
    minCGPA: 3.7, minIELTS: 7.0, deadline: "2025-01-15",
    type: "University", renewable: true, subjects: ["All Subjects"],
    description: "The University of Toronto's most prestigious and competitive scholarship for international students.",
    link: "https://future.utoronto.ca", featured: true
  },
  {
    id: 3, name: "Chevening Scholarship", country: "UK",
    degreeLevel: ["Master"], amount: 25000,
    coverage: ["Full Tuition", "Monthly Stipend", "Travel Costs"],
    minCGPA: 3.0, minIELTS: 6.5, deadline: "2024-11-05",
    type: "Government", renewable: false, subjects: ["Leadership", "Policy", "Business"],
    description: "UK government's global scholarship program, funded by the Foreign, Commonwealth and Development Office.",
    link: "https://www.chevening.org", featured: true
  },
  {
    id: 4, name: "Australian Government RTP", country: "Australia",
    degreeLevel: ["Master", "PhD"], amount: 32000,
    coverage: ["Tuition Fees", "Stipend", "Health Cover"],
    minCGPA: 3.3, minIELTS: 6.5, deadline: "2024-09-30",
    type: "Government", renewable: true, subjects: ["Research"],
    description: "Research Training Program (RTP) provides block grants to higher education providers to support research students.",
    link: "https://www.education.gov.au", featured: false
  },
  {
    id: 5, name: "Holland Scholarship", country: "Netherlands",
    degreeLevel: ["Bachelor", "Master"], amount: 5000,
    coverage: ["One-time Grant"],
    minCGPA: 3.0, minIELTS: 6.5, deadline: "2025-05-01",
    type: "Government", renewable: false, subjects: ["All Subjects"],
    description: "Financed by the Dutch Ministry of Education, Culture and Science for international students from outside the EEA.",
    link: "https://www.studyinnl.org", featured: false
  },
  {
    id: 6, name: "NUS Research Scholarship", country: "Singapore",
    degreeLevel: ["PhD"], amount: 24000,
    coverage: ["Full Tuition", "Monthly Stipend"],
    minCGPA: 3.5, minIELTS: 7.0, deadline: "2024-12-15",
    type: "University", renewable: true, subjects: ["Research", "STEM"],
    description: "Awarded to outstanding graduates for research leading to a higher degree at the National University of Singapore.",
    link: "https://nus.edu.sg", featured: false
  },
  {
    id: 7, name: "ASEAN Undergraduate Scholarship", country: "Singapore",
    degreeLevel: ["Bachelor"], amount: 20000,
    coverage: ["Tuition Fees", "Living Allowance"],
    minCGPA: 3.5, minIELTS: 6.5, deadline: "2025-03-15",
    type: "University", renewable: true, subjects: ["All Subjects"],
    description: "A freshman scholarship offered to support outstanding students from ASEAN member countries.",
    link: "https://nus.edu.sg", featured: true
  }
];

// --- UTILS ---

function calculateMatchScore(profile: any, university: any) {
  let score = 0;
  const matched: string[] = [];
  const missing: string[] = [];
  const tips: string[] = [];

  const cgpa = parseFloat(profile.cgpa) || 0;
  const ielts = parseFloat(profile.ielts) || 0;
  const cgpa4 = profile.cgpaScale === "5.0" ? (cgpa / 5) * 4 : cgpa;

  // 1. CGPA Match (20 pts)
  if (cgpa4 >= university.minCGPA + 0.5) {
    score += 20;
    matched.push("CGPA exceeds requirement");
  } else if (cgpa4 >= university.minCGPA) {
    score += 14;
    matched.push("CGPA meets requirement");
  } else if (cgpa4 >= university.minCGPA - 0.3) {
    score += 6;
    tips.push("CGPA slightly below — strong SOP may help");
  } else {
    missing.push(`CGPA needs improvement (need ${university.minCGPA})`);
  }

  // 2. IELTS Match (15 pts)
  if (ielts >= university.minIELTS + 0.5) {
    score += 15;
    matched.push(`IELTS ${ielts} exceeds requirement`);
  } else if (ielts >= university.minIELTS) {
    score += 10;
    matched.push("IELTS meets requirement");
  } else if (ielts >= university.minIELTS - 0.5) {
    score += 4;
    tips.push("Retake IELTS to improve score by 0.5");
  } else {
    missing.push(`IELTS ${ielts} below required ${university.minIELTS}`);
  }

  // 3. Country Preference (15 pts)
  if (profile.targetCountries?.includes(university.country)) {
    score += 15;
    matched.push(`${university.country} is in your preferred countries`);
  }

  // 4. Degree Level (10 pts)
  if (university.degreeLevel?.includes(profile.targetDegree)) {
    score += 10;
    matched.push(`${profile.targetDegree} degree offered here`);
  } else if (profile.targetDegree) {
    missing.push(`${profile.targetDegree} not offered here`);
  }

  // 5. Subject Match (10 pts)
  const subjectMatch = university.programs?.some((p: string) => 
    p.toLowerCase().includes(profile.targetSubject?.toLowerCase() || "")
  );
  if (subjectMatch && profile.targetSubject) {
    score += 10;
    matched.push(`${profile.targetSubject} matches your interest`);
  } else if (profile.targetSubject) {
    tips.push(`Check if ${profile.targetSubject} falls under a related program`);
  }

  // 6. Budget Match (15 pts)
  const totalCost = (university.tuitionPerYear || 0) + (university.livingCost || 0);
  const budgetMax = parseFloat(profile.budgetMax) || 100000;
  if (totalCost <= budgetMax) {
    score += 15;
    matched.push(`Total cost $${totalCost.toLocaleString()} fits your budget`);
  } else if (totalCost <= budgetMax * 1.2) {
    score += 7;
    tips.push("Cost slightly over — check scholarships");
  } else {
    missing.push(`Cost $${totalCost.toLocaleString()} exceeds budget`);
  }

  // 7. Scholarship (10 pts)
  if (profile.scholarshipRequired === "yes" && university.scholarships?.length > 0) {
    score += 10;
    matched.push("Scholarships available");
  } else if (profile.scholarshipRequired !== "yes") {
    score += 10;
  } else {
    tips.push("No scholarships currently listed");
  }

  // 8. Work Experience (5 pts)
  const workExp = parseFloat(profile.workExp) || 0;
  if (!university.workExpRequired) {
    score += 5;
  } else if (workExp >= 1) {
    score += 5;
    matched.push("Work experience requirement met");
  } else {
    missing.push("Work experience required");
  }

  let category = "low";
  if (score >= 75) category = "safety";
  else if (score >= 50) category = "target";
  else if (score >= 30) category = "reach";

  return { score, category, matched, missing, tips };
}

function calculateScholarshipMatch(profile: any, scholarship: any) {
  let score = 0;
  const reasons: string[] = [];
  
  const cgpa = parseFloat(profile.cgpa) || 0;
  const ielts = parseFloat(profile.ielts) || 0;
  const cgpa4 = profile.cgpaScale === "5.0" ? (cgpa / 5) * 4 : cgpa;

  if (cgpa4 >= scholarship.minCGPA) {
    score += 35;
    reasons.push("CGPA qualifies");
  }
  if (ielts >= scholarship.minIELTS) {
    score += 25;
    reasons.push("IELTS qualifies");
  }
  if (scholarship.degreeLevel.includes(profile.targetDegree)) {
    score += 25;
    reasons.push("Degree level matches");
  }
  if (profile.targetCountries.includes(scholarship.country)) {
    score += 15;
    reasons.push("Country matches preference");
  }

  return { score, reasons, eligible: score >= 60 };
}

// --- SHARED COMPONENTS ---

function ScoreRing({ score, size = 56 }: { score: number, size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  const getColor = () => {
    if (score >= 75) return "#10b981";
    if (score >= 50) return "#1a56db";
    if (score >= 30) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e2e8f0"
          strokeWidth="4"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <span className="absolute font-display font-extrabold text-navy" style={{ fontSize: size * 0.25 }}>
        {score}%
      </span>
    </div>
  );
}

function MatchBadge({ category }: { category: string }) {
  const styles: any = {
    safety: "bg-green-100 text-green-700 border-green-200",
    target: "bg-blue-100 text-blue-700 border-blue-200",
    reach: "bg-yellow-100 text-yellow-700 border-yellow-200",
    low: "bg-red-100 text-red-700 border-red-200"
  };
  const labels: any = {
    safety: "✅ Safety",
    target: "🎯 Target",
    reach: "🚀 Reach",
    low: "❌ Low"
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[category]}`}>
      {labels[category]}
    </span>
  );
}

const DEFAULT_POSTS = [
  {
    id: "default-1",
    title: "How to Apply by Yourself: A Step-by-Step Guide",
    content: "Applying to universities abroad can seem like a daunting task, but with the right guidance, you can successfully navigate the process on your own. Learn about researching, standardized tests, and document preparation.",
    author: "Bidesh Jabo Team",
    image: "https://images.unsplash.com/photo-1523050335392-93851179ae22?auto=format&fit=crop&q=80&w=1000",
    tags: ["Guide", "Self-Apply"],
    createdAt: { toDate: () => new Date() }
  },
  {
    id: "default-2",
    title: "Top 5 Countries for Bangladeshi Students in 2026",
    content: "Choosing the right destination is the first step. Based on visa success rates and work opportunities, we've ranked Germany, UK, Canada, Australia, and USA for the upcoming year.",
    author: "Bidesh Jabo Team",
    image: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&q=80&w=1000",
    tags: ["Destinations", "2026"],
    createdAt: { toDate: () => new Date() }
  }
];

// --- PAGE COMPONENTS ---

function DashboardPage({ profile, setPage, apps, universities, scholarships }: { profile: any, setPage: any, apps: any[], universities: any[], scholarships: any[] }) {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      setBlogs(data.filter(b => b.status === "Published"));
    });
    return () => unsub();
  }, []);

  const profilePct = useMemo(() => {
    const fields = ["fullName", "cgpa", "ielts", "targetDegree"];
    const filled = fields.filter(f => profile[f]).length;
    return Math.round((filled / fields.length) * 100);
  }, [profile]);

  const displayBlogs = blogs.length > 0 ? blogs : DEFAULT_POSTS;

  const topMatches = useMemo(() => {
    if (!profile.cgpa || !profile.ielts || !profile.targetDegree) return [];
    return universities
      .map(u => ({ ...u, match: calculateMatchScore(profile, u) }))
      .sort((a, b) => b.match.score - a.match.score)
      .slice(0, 3);
  }, [profile, universities]);

  const eligibleScholarships = useMemo(() => {
    if (!profile.cgpa || !profile.ielts) return [];
    return scholarships
      .map(s => ({ ...s, match: calculateScholarshipMatch(profile, s) }))
      .filter(s => s.match.eligible)
      .sort((a, b) => b.match.score - a.match.score)
      .slice(0, 3);
  }, [profile, scholarships]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {profilePct < 100 && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-yellow-600 shrink-0" />
            <p className="text-yellow-800 font-medium text-sm">Profile Incomplete — Fill in academic details to see accurate matches.</p>
          </div>
          <button onClick={() => setPage("profile")} className="w-full sm:w-auto bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-700 transition-colors whitespace-nowrap">
            Complete Profile →
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <GraduationCap />, label: "Universities Listed", val: UNIVERSITIES.length, page: "match" },
          { icon: <TrendingUp />, label: "Strong Matches", val: topMatches.filter(m => m.match.score >= 50).length || "—", page: "match" },
          { icon: <Award />, label: "Eligible Scholarships", val: eligibleScholarships.length || SCHOLARSHIPS.length, page: "scholarship" },
          { icon: <ClipboardList />, label: "Applications", val: apps.length, page: "tracker" }
        ].map((stat, i) => (
          <div key={i} onClick={() => setPage(stat.page)} className="bg-white p-6 rounded-2xl border border-border-main hover:shadow-lg transition-all cursor-pointer group">
            <div className="text-blue-primary mb-3 group-hover:scale-110 transition-transform">{stat.icon}</div>
            <div className="text-2xl font-display font-extrabold text-navy">{stat.val}</div>
            <div className="text-xs text-muted font-medium uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {topMatches.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-navy">🏆 Your Top Matches</h3>
            <button onClick={() => setPage("match")} className="text-blue-primary font-bold text-sm hover:underline">View All →</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topMatches.map(uni => (
              <div key={uni.id} onClick={() => setPage("match")} className="bg-white p-5 rounded-2xl border border-border-main hover:border-blue-200 hover:shadow-md transition-all cursor-pointer flex items-center gap-4">
                <div className="text-4xl">{uni.logo}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-navy truncate">{uni.name}</h4>
                  <p className="text-xs text-muted">{uni.city}, {uni.country}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <MatchBadge category={uni.match.category} />
                  <ScoreRing score={uni.match.score} size={40} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {eligibleScholarships.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-navy">💰 Scholarships You Qualify For</h3>
            <button onClick={() => setPage("scholarship")} className="text-blue-primary font-bold text-sm hover:underline">View All →</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {eligibleScholarships.map(sch => (
              <div key={sch.id} className="bg-white p-5 rounded-2xl border border-border-main hover:border-teal-200 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-navy leading-tight">{sch.name}</h4>
                  <div className="text-teal font-display font-extrabold">${(sch.amount/1000).toFixed(0)}k</div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted mb-4">
                  <Globe size={12} /> {sch.country} · <Calendar size={12} /> {sch.deadline}
                </div>
                <div className="bg-green-50 text-green-700 text-xs font-bold py-1 px-3 rounded-full inline-block">
                  ✅ You are eligible!
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Blog Section */}
      <section className="space-y-8 pt-12 border-t border-border-main">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <h3 className="text-2xl font-display font-extrabold text-navy">Latest Guides & Articles</h3>
            <p className="text-muted text-sm font-medium">Expert advice for your study abroad journey.</p>
          </div>
          <button className="hidden sm:flex items-center gap-2 text-blue-primary font-bold text-sm hover:underline">
            View All <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayBlogs.map(blog => (
            <div 
              key={blog.id} 
              onClick={() => setSelectedBlog(blog)}
              className="group bg-white rounded-2xl border border-border-main overflow-hidden hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 cursor-pointer flex flex-col h-full"
            >
              <div className="relative h-56 sm:h-44 overflow-hidden">
                <img 
                  src={blog.image || `https://picsum.photos/seed/${blog.id}/800/600`} 
                  alt="" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  referrerPolicy="no-referrer" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                <div className="absolute top-4 left-4 flex gap-2">
                  {blog.tags?.map((t: string) => (
                    <span key={t} className="bg-gold text-navy text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-lg backdrop-blur-sm">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-3 text-[10px] text-muted font-bold uppercase tracking-widest mb-4">
                  <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                    <UserIcon size={12} className="text-gold" /> {blog.author}
                  </span>
                  <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                    <Clock size={12} className="text-gold" /> {blog.createdAt?.toDate ? blog.createdAt.toDate().toLocaleDateString() : 'Just now'}
                  </span>
                </div>
                <h4 className="text-xl font-display font-extrabold text-navy group-hover:text-blue-primary transition-colors mb-3 line-clamp-2 leading-tight">
                  {blog.title}
                </h4>
                <div className="text-slate-600 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
                  <ReactMarkdown>{blog.content}</ReactMarkdown>
                </div>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                  <div className="flex items-center text-blue-primary font-bold text-sm group-hover:translate-x-1 transition-transform">
                    Read Full Guide <ArrowRight size={16} className="ml-2" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-primary group-hover:text-white transition-all duration-300">
                    <BookOpen size={16} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="space-y-8 pt-12 border-t border-border-main">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h3 className="text-3xl font-display font-extrabold text-navy">Frequently Asked Questions</h3>
          <p className="text-muted font-medium">Quick answers to common queries about studying abroad from Bangladesh.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {[
            { q: "How do I start my application?", a: "First, complete your profile with your academic details. Then use the 'University Match' tool to find institutions that fit your profile. Once you find a match, add it to your 'App Tracker'." },
            { q: "Is Bidesh Jabo free to use?", a: "Yes! Our platform is completely free for students. We aim to empower Bangladeshi students with the right information to apply by themselves." },
            { q: "How accurate is the Match Score?", a: "The Match Score is calculated based on historical admission data and current university requirements. While highly accurate, it should be used as a guide alongside official university websites." },
            { q: "Can I apply directly through Bidesh Jabo?", a: "We provide the guidance and tracking tools, but you will need to submit your final application through the university's official portal. We provide links to those portals in the university details." },
            { q: "What documents do I need?", a: "Commonly required documents include academic transcripts, IELTS/TOEFL scores, Statement of Purpose (SOP), Letters of Recommendation (LOR), and a valid passport." }
          ].map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-border-main space-y-3 hover:shadow-md transition-shadow">
              <h4 className="font-display font-extrabold text-navy flex items-start gap-2">
                <span className="text-gold">Q.</span> {item.q}
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed pl-6">
                {item.a}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-navy rounded-3xl p-8 text-center space-y-6 max-w-4xl mx-auto">
          <div className="space-y-2">
            <h4 className="text-xl font-display font-bold text-white">Still have questions?</h4>
            <p className="text-slate-400 text-sm">Our team is here to help you with your journey.</p>
          </div>
          <button className="bg-gold text-navy px-8 py-3 rounded-xl font-bold hover:bg-gold-hover transition-all">
            Contact Support
          </button>
        </div>
      </section>

      {/* Blog Detail Modal */}
      <AnimatePresence>
        {selectedBlog && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBlog(null)}
              className="absolute inset-0 bg-navy/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="absolute top-6 right-6 z-10">
                <button onClick={() => setSelectedBlog(null)} className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full transition-all">
                  <X size={24} />
                </button>
              </div>
              
              <div className="overflow-y-auto">
                <div className="relative h-[40vh]">
                  {selectedBlog.image ? (
                    <img src={selectedBlog.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full bg-slate-100" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/20 to-transparent" />
                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedBlog.tags?.map((t: string) => (
                        <span key={t} className="bg-gold text-navy text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                          {t}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-3xl md:text-5xl font-display font-extrabold text-white leading-tight">
                      {selectedBlog.title}
                    </h2>
                  </div>
                </div>
                
                <div className="p-8 md:p-12">
                  <div className="flex items-center gap-6 pb-8 mb-8 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-navy rounded-full flex items-center justify-center text-white font-bold">
                        {selectedBlog.author[0]}
                      </div>
                      <div>
                        <p className="text-xs text-muted font-bold uppercase tracking-widest">Written By</p>
                        <p className="text-sm font-bold text-navy">{selectedBlog.author}</p>
                      </div>
                    </div>
                    <div className="h-8 w-px bg-slate-100" />
                    <div>
                      <p className="text-xs text-muted font-bold uppercase tracking-widest">Published On</p>
                      <p className="text-sm font-bold text-navy">
                        {selectedBlog.createdAt?.toDate ? selectedBlog.createdAt.toDate().toLocaleDateString() : 'Just now'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="markdown-body prose prose-lg max-w-none">
                    <ReactMarkdown>
                      {selectedBlog.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- MAIN APP ---

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardHome />} />
          <Route path="universities" element={<UniversityManagement />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="scholarships" element={<ScholarshipManagement />} />
          <Route path="announcements" element={<AnnouncementManagement />} />
          <Route path="applications" element={<ApplicationManagement />} />
          <Route path="blogs" element={<BlogManagement />} />
          <Route path="*" element={<div className="p-8 text-center font-bold text-slate-400">Coming Soon: This module is under development.</div>} />
        </Route>

        {/* Student Portal Routes */}
        <Route path="/*" element={<StudentPortal />} />
      </Routes>
    </BrowserRouter>
  );
}

function StudentPortal() {
  const [page, setPage] = useState("dashboard");
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [universities, setUniversities] = useState<any[]>(UNIVERSITIES);
  const [scholarships, setScholarships] = useState<any[]>(SCHOLARSHIPS);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch Universities & Scholarships from Firestore
  useEffect(() => {
    const unsubUnis = onSnapshot(collection(db, "universities"), (snap) => {
      if (!snap.empty) {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setUniversities(data);
      }
      setLoading(false);
    }, (err) => {
      console.error("Unis Fetch Error:", err);
      setLoading(false);
    });

    const unsubSchols = onSnapshot(collection(db, "scholarships"), (snap) => {
      if (!snap.empty) {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setScholarships(data);
      }
    });

    return () => {
      unsubUnis();
      unsubSchols();
    };
  }, []);

  // Handle URL sync for student portal (optional but good for UX)
  useEffect(() => {
    const path = location.pathname.substring(1);
    if (path && ["dashboard", "profile", "match", "scholarship", "tracker", "calculator", "ai"].includes(path)) {
      setPage(path);
    }
  }, [location]);
  const [profile, setProfile] = useState({
    fullName: "", email: "", phone: "", city: "", country: "Bangladesh",
    educationLevel: "", institution: "", cgpa: "", cgpaScale: "4.0", graduationYear: "", medium: "",
    ielts: "", toefl: "", gre: "", gmat: "", plannedTest: "",
    workExp: "", jobTitle: "", company: "", researchPapers: "", portfolio: "",
    targetDegree: "", targetSubject: "", targetCountries: [] as string[], intake: "", budgetMax: "", scholarshipRequired: "",
    careerGoal: "", whyAbroad: "", postStudyPlan: ""
  });
  const [apps, setApps] = useState<any[]>([]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Sync Profile
  useEffect(() => {
    if (!user) {
      setProfile({
        fullName: "", email: "", phone: "", city: "", country: "Bangladesh",
        educationLevel: "", institution: "", cgpa: "", cgpaScale: "4.0", graduationYear: "", medium: "",
        ielts: "", toefl: "", gre: "", gmat: "", plannedTest: "",
        workExp: "", jobTitle: "", company: "", researchPapers: "", portfolio: "",
        targetDegree: "", targetSubject: "", targetCountries: [] as string[], intake: "", budgetMax: "", scholarshipRequired: "",
        careerGoal: "", whyAbroad: "", postStudyPlan: ""
      });
      return;
    }

    const unsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as any);
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, `users/${user.uid}`));

    return () => unsub();
  }, [user]);

  // Sync Applications
  useEffect(() => {
    if (!user) {
      setApps([]);
      return;
    }

    const unsub = onSnapshot(collection(db, "users", user.uid, "applications"), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setApps(data);
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/applications`));

    return () => unsub();
  }, [user]);

  const profilePct = useMemo(() => {
    const fields = ["fullName", "cgpa", "ielts", "targetDegree"];
    const filled = fields.filter(f => profile[f as keyof typeof profile]).length;
    return Math.round((filled / fields.length) * 100);
  }, [profile]);

  const handleSaveProfile = async (newProfile: any) => {
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid), {
        ...newProfile,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  const handleLogin = async () => {
    setLoginError(null);
    try {
      await loginWithGoogle();
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        return;
      }
      if (error.code === 'auth/unauthorized-domain') {
        setLoginError('This domain is not authorized in Firebase. Please add your Railway URL to Firebase Console > Authentication > Settings > Authorized domains.');
      } else if (error.code === 'auth/popup-blocked') {
        setLoginError('Login popup was blocked by your browser. Please allow popups for this site.');
      } else {
        setLoginError(error.message || 'Login failed. Please try again.');
      }
      console.error('Login error:', error);
    }
  };

  const handleAddApp = async (app: any) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "users", user.uid, "applications"), {
        ...app,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/applications`);
    }
  };

  const handleUpdateApp = async (id: string, status: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid, "applications", id), { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/applications/${id}`);
    }
  };

  const handleRemoveApp = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "applications", id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/applications/${id}`);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white font-display font-bold">Loading Bidesh Jabo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-page font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 h-16 bg-navy shadow-2xl z-[100] px-4 md:px-8 flex items-center justify-between">
        {loginError && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-[200] flex items-center gap-2 text-sm font-bold">
            <AlertCircle size={16} />
            {loginError}
            <button onClick={() => setLoginError(null)} className="ml-2 hover:text-white/80">
              <X size={16} />
            </button>
          </div>
        )}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => {
              setPage("dashboard");
              navigate("/");
            }}
          >
            <Logo iconSize={28} textSize="text-xl md:text-2xl text-white" />
          </div>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {[
            { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18}/> },
            { id: "match", label: "University Match", icon: <GraduationCap size={18}/> },
            { id: "scholarship", label: "Scholarships", icon: <Award size={18}/> },
            { id: "tracker", label: "App Tracker", icon: <ClipboardList size={18}/> },
            { id: "calculator", label: "Cost Calculator", icon: <Calculator size={18}/> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setPage(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                page === tab.id 
                  ? "text-gold bg-gold/15" 
                  : "text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 p-1 pr-4 rounded-full border border-white/20 transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-navy font-bold text-sm shadow-lg group-hover:scale-105 transition-transform">
                  {profile.fullName?.[0] || user.displayName?.[0] || "U"}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-white text-[10px] font-bold leading-none">
                    {profile.fullName?.split(' ')[0] || user.displayName?.split(' ')[0] || "User"}
                  </p>
                  <p className="text-gold text-[8px] font-bold uppercase tracking-tighter mt-0.5">
                    {profilePct}% Profile
                  </p>
                </div>
                <ChevronDown size={14} className={cn("text-slate-400 transition-transform", isProfileMenuOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {isProfileMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-[110]" 
                      onClick={() => setIsProfileMenuOpen(false)} 
                    />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[120]"
                    >
                      <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                        <p className="text-xs font-bold text-navy truncate">{profile.fullName || user.displayName || "User"}</p>
                        <p className="text-[10px] text-muted truncate">{user.email}</p>
                      </div>
                      <div className="p-2">
                        <button 
                          onClick={() => {
                            setPage("profile");
                            setIsProfileMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-navy transition-all"
                        >
                          <UserCircle size={18} className="text-gold" />
                          My Profile
                        </button>
                        <button 
                          onClick={() => {
                            logout();
                            setIsProfileMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
                        >
                          <LogOut size={18} />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button onClick={handleLogin} className="bg-gold text-navy px-4 md:px-6 py-2 rounded-full font-bold text-xs md:text-sm hover:bg-gold-hover transition-all flex items-center gap-2">
              <LogIn size={18} /> <span className="hidden xs:inline">Login</span>
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] md:hidden"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-navy z-[200] md:hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <Logo iconSize={24} textSize="text-xl text-white" />
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {[
                  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20}/> },
                  { id: "match", label: "University Match", icon: <GraduationCap size={20}/> },
                  { id: "scholarship", label: "Scholarships", icon: <Award size={20}/> },
                  { id: "tracker", label: "App Tracker", icon: <ClipboardList size={20}/> },
                  { id: "calculator", label: "Cost Calculator", icon: <Calculator size={20}/> }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setPage(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-base font-bold transition-all ${
                      page === tab.id 
                        ? "text-gold bg-gold/15" 
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6 border-t border-white/10 space-y-4">
                {user && (
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => {
                        setPage("profile");
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-white bg-white/5 hover:bg-white/10 transition-all"
                    >
                      <UserCircle size={20} className="text-gold" />
                      My Profile
                    </button>
                    <button 
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all"
                    >
                      <LogOut size={20} />
                      Logout
                    </button>
                  </div>
                )}
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center">
                  Bidesh Jabo · Version 1.0.0
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero Section (Only on Dashboard) */}
      {page === "dashboard" && (
        <>
          <header className="relative bg-gradient-to-br from-navy via-navy2 to-[#162040] py-20 px-4 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] bg-blue-primary rounded-full blur-[120px]" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] bg-gold rounded-full blur-[120px]" />
            </div>
            
            <div className="relative max-w-4xl mx-auto text-center space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-block bg-gold/20 text-gold px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase border border-gold/30"
              >
                🌍 For Bangladeshi Students
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-6xl font-display font-extrabold text-white leading-tight"
              >
                Find Your Perfect <span className="text-gold">University Abroad</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto font-medium"
              >
                Fill in your profile once — get matched with universities, check scholarship eligibility, and track all your applications.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap justify-center gap-4 pt-4"
              >
                <button onClick={() => setPage("profile")} className="bg-gold text-navy px-8 py-4 rounded-xl font-display font-extrabold hover:bg-gold-hover hover:-translate-y-1 transition-all shadow-xl shadow-gold/20">
                  Complete My Profile →
                </button>
                <button onClick={() => setPage("match")} className="bg-white/10 text-white border-2 border-white/20 px-8 py-4 rounded-xl font-display font-extrabold hover:bg-white/20 transition-all backdrop-blur-sm">
                  Browse Universities
                </button>
              </motion.div>
            </div>
          </header>
          
          <div className="bg-white border-b border-border-main py-6 px-4">
            <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: "Universities", val: "8+" },
                { label: "Countries", val: "7+" },
                { label: "Scholarships", val: "7" },
                { label: "Match Engine", val: "Smart" }
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl font-display font-extrabold text-navy">{item.val}</div>
                  <div className="text-xs text-muted font-bold uppercase tracking-widest">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {!isAuthReady || (loading && universities.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="animate-spin text-blue-primary" size={48} />
            <p className="text-muted font-bold animate-pulse">Loading Portal...</p>
          </div>
        ) : !user && page !== "dashboard" ? (
          <div className="bg-white p-12 rounded-3xl border border-border-main text-center space-y-6 shadow-xl max-w-lg mx-auto mt-20">
            <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto">
              <LogIn size={40} className="text-gold" />
            </div>
            <h2 className="text-2xl font-display font-extrabold text-navy">Login Required</h2>
            <p className="text-muted font-medium">Please login with your Google account to access your personalized dashboard, track applications, and get AI guidance.</p>
            <button onClick={handleLogin} className="w-full bg-navy text-white py-4 rounded-xl font-display font-extrabold hover:bg-navy2 transition-all shadow-lg shadow-navy/20">
              Login with Google
            </button>
          </div>
        ) : (
          <>
            {page === "dashboard" && <DashboardPage profile={profile} setPage={setPage} apps={apps} universities={universities} scholarships={scholarships} />}
            {page === "profile" && <ProfilePage profile={profile} setProfile={setProfile} setPage={setPage} onSave={handleSaveProfile} />}
            {page === "match" && <MatchPage profile={profile} setPage={setPage} onAddApp={handleAddApp} universities={universities} />}
            {page === "scholarship" && <ScholarshipPage profile={profile} scholarships={scholarships} />}
            {page === "tracker" && <TrackerPage apps={apps} onUpdateStatus={handleUpdateApp} onRemove={handleRemoveApp} onAdd={() => setPage("match")} />}
            {page === "calculator" && <CostCalcPage />}
          </>
        )}
      </main>
    </div>
  );
}

function ProfilePage({ profile, setProfile, setPage, onSave }: { profile: any, setProfile: any, setPage: any, onSave: any }) {
  const [step, setStep] = useState(1);
  const countries = ["USA", "UK", "Canada", "Australia", "Germany", "Netherlands", "Singapore", "Sweden", "Japan", "South Korea"];

  const updateField = (field: string, value: any) => {
    setProfile((prev: any) => ({ ...prev, [field]: value }));
  };

  const toggleCountry = (country: string) => {
    const current = [...profile.targetCountries];
    if (current.includes(country)) {
      updateField("targetCountries", current.filter(c => c !== country));
    } else {
      updateField("targetCountries", [...current, country]);
    }
  };

  const isStepComplete = (s: number) => {
    switch(s) {
      case 1: return profile.fullName && profile.email && profile.phone;
      case 2: return profile.educationLevel && profile.cgpa && profile.institution;
      case 3: return profile.ielts || profile.toefl || profile.plannedTest;
      case 4: return true; // Experience optional
      case 5: return profile.targetDegree && profile.targetSubject && profile.targetCountries.length > 0;
      case 6: return true; // Goals optional
      default: return false;
    }
  };

  const completedSteps = [1,2,3,4,5,6].filter(s => isStepComplete(s)).length;
  const completionPct = Math.round((completedSteps / 6) * 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* Sidebar - Horizontal Scroll on Mobile */}
      <aside className="lg:space-y-6">
        <div className="bg-white p-4 lg:p-6 rounded-2xl border border-border-main lg:sticky lg:top-24 overflow-x-auto lg:overflow-x-visible">
          <h3 className="hidden lg:block text-xs font-bold text-navy uppercase tracking-widest mb-6">Your Profile</h3>
          <div className="flex lg:flex-col gap-2 lg:gap-4 min-w-max lg:min-w-0">
            {[
              { n: 1, label: "Basic Info", icon: "👤" },
              { n: 2, label: "Academic", icon: "🎓" },
              { n: 3, label: "Test Scores", icon: "📝" },
              { n: 4, label: "Experience", icon: "💼" },
              { n: 5, label: "Preferences", icon: "🌍" },
              { n: 6, label: "Goals", icon: "🎯" }
            ].map(s => (
              <button 
                key={s.n}
                onClick={() => setStep(s.n)}
                className={`flex items-center gap-2 lg:gap-3 p-2 lg:p-3 rounded-xl transition-all whitespace-nowrap ${
                  step === s.n ? "bg-blue-50 text-blue-primary shadow-sm" : "text-muted hover:bg-slate-50"
                }`}
              >
                <div className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-[10px] lg:text-xs font-bold ${
                  isStepComplete(s.n) ? "bg-green-primary text-white" : 
                  step === s.n ? "bg-blue-primary text-white" : "bg-slate-100 text-slate-400"
                }`}>
                  {isStepComplete(s.n) ? "✓" : s.n}
                </div>
                <span className="font-bold text-xs lg:text-sm">{s.label}</span>
              </button>
            ))}
          </div>
          
          <div className="hidden lg:block mt-8 pt-6 border-t border-slate-100">
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className="text-navy">Overall Completion</span>
              <span className="text-blue-primary">{completionPct}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-primary transition-all duration-500" style={{ width: `${completionPct}%` }} />
            </div>
          </div>
        </div>
      </aside>

      {/* Form Card */}
      <div className="bg-white p-6 lg:p-8 rounded-2xl border border-border-main shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-display font-extrabold text-navy">
              {step === 1 && "👤 Basic Information"}
              {step === 2 && "🎓 Academic Background"}
              {step === 3 && "📝 Test Scores"}
              {step === 4 && "💼 Work & Research"}
              {step === 5 && "🌍 Study Preferences"}
              {step === 6 && "🎯 Career & Goals"}
            </h2>
            <p className="text-muted text-sm font-medium">Step {step} of 6</p>
          </div>
          {profile.fullName && (
            <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 border border-green-100">
              <CheckCircle2 size={14} /> Profile Active
            </div>
          )}
        </div>

        <div className="space-y-8">
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">Full Name</label>
                <input type="text" value={profile.fullName} onChange={e => updateField("fullName", e.target.value)} placeholder="John Doe" className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-primary outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">Email Address</label>
                <input type="email" value={profile.email} onChange={e => updateField("email", e.target.value)} placeholder="john@example.com" className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-primary outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">Phone Number</label>
                <input type="text" value={profile.phone} onChange={e => updateField("phone", e.target.value)} placeholder="+880 1XXX XXXXXX" className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-primary outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">Current City</label>
                <input type="text" value={profile.city} onChange={e => updateField("city", e.target.value)} placeholder="Dhaka" className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-primary outline-none transition-all" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">Education Level</label>
                <select value={profile.educationLevel} onChange={e => updateField("educationLevel", e.target.value)} className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-primary outline-none transition-all bg-white">
                  <option value="">Select Level</option>
                  <option value="SSC">SSC</option>
                  <option value="HSC">HSC</option>
                  <option value="Bachelor">Bachelor's</option>
                  <option value="Master">Master's</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">Institution Name</label>
                <input type="text" value={profile.institution} onChange={e => updateField("institution", e.target.value)} placeholder="BUET, DU, BRAC..." className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-primary outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">CGPA</label>
                <input type="number" step="0.01" value={profile.cgpa} onChange={e => updateField("cgpa", e.target.value)} placeholder="3.85" className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-primary outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">CGPA Scale</label>
                <select value={profile.cgpaScale} onChange={e => updateField("cgpaScale", e.target.value)} className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-primary outline-none transition-all bg-white">
                  <option value="4.0">Out of 4.0</option>
                  <option value="5.0">Out of 5.0</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">Graduation Year</label>
                <input type="number" value={profile.graduationYear} onChange={e => updateField("graduationYear", e.target.value)} placeholder="2023" className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-primary outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">Medium of Instruction</label>
                <select value={profile.medium} onChange={e => updateField("medium", e.target.value)} className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-primary outline-none transition-all bg-white">
                  <option value="">Select Medium</option>
                  <option value="English">English</option>
                  <option value="Bangla">Bangla</option>
                  <option value="Both">Both</option>
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">IELTS Overall</label>
                <input 
                  type="number" 
                  step="0.5" 
                  min="0"
                  max="9"
                  value={profile.ielts} 
                  onChange={e => {
                    const val = e.target.value;
                    if (val === "" || (parseFloat(val) >= 0 && parseFloat(val) <= 9)) {
                      updateField("ielts", val);
                    }
                  }} 
                  placeholder="7.5" 
                  className={cn(
                    "w-full p-3 border-2 rounded-xl outline-none transition-all",
                    (parseFloat(profile.ielts) < 0 || parseFloat(profile.ielts) > 9) 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-slate-100 focus:border-blue-primary"
                  )}
                />
                <div className="flex justify-between items-center">
                  <p className="text-[10px] text-muted font-bold">Score 0-9</p>
                  {(parseFloat(profile.ielts) < 0 || parseFloat(profile.ielts) > 9) && (
                    <p className="text-[10px] text-red-500 font-bold">Must be between 0 and 9</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">TOEFL Total</label>
                <input type="number" value={profile.toefl} onChange={e => updateField("toefl", e.target.value)} placeholder="105" className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-primary outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">GRE Total (Optional)</label>
                <input type="number" value={profile.gre} onChange={e => updateField("gre", e.target.value)} placeholder="320" className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-primary outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">GMAT (Optional)</label>
                <input type="number" value={profile.gmat} onChange={e => updateField("gmat", e.target.value)} placeholder="680" className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-primary outline-none transition-all" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">Planned Test Date (If not taken)</label>
                <input type="date" value={profile.plannedTest} onChange={e => updateField("plannedTest", e.target.value)} className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-primary outline-none transition-all" />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">Work Experience (Years)</label>
                <input type="number" step="0.5" value={profile.workExp} onChange={e => updateField("workExp", e.target.value)} placeholder="2.5" className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-primary outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">Current Job Title</label>
                <input type="text" value={profile.jobTitle} onChange={e => updateField("jobTitle", e.target.value)} placeholder="Software Engineer" className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-primary outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">Company</label>
                <input type="text" value={profile.company} onChange={e => updateField("company", e.target.value)} placeholder="Tech Solutions Ltd." className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-primary outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">Research Papers Published</label>
                <input type="number" value={profile.researchPapers} onChange={e => updateField("researchPapers", e.target.value)} placeholder="0" className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-primary outline-none transition-all" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">Portfolio / GitHub URL</label>
                <input type="text" value={profile.portfolio} onChange={e => updateField("portfolio", e.target.value)} placeholder="https://github.com/johndoe" className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-primary outline-none transition-all" />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-navy uppercase tracking-wider">Target Degree</label>
                  <select value={profile.targetDegree} onChange={e => updateField("targetDegree", e.target.value)} className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-primary outline-none transition-all bg-white">
                    <option value="">Select Degree</option>
                    <option value="Bachelor">Bachelor's</option>
                    <option value="Master">Master's</option>
                    <option value="PhD">PhD</option>
                    <option value="MBA">MBA</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-navy uppercase tracking-wider">Target Subject</label>
                  <input type="text" value={profile.targetSubject} onChange={e => updateField("targetSubject", e.target.value)} placeholder="Computer Science, Business..." className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-primary outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-navy uppercase tracking-wider">Preferred Intake</label>
                  <select value={profile.intake} onChange={e => updateField("intake", e.target.value)} className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-primary outline-none transition-all bg-white">
                    <option value="">Select Intake</option>
                    <option value="Fall">Fall (Sept/Oct)</option>
                    <option value="Spring">Spring (Jan/Feb)</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-navy uppercase tracking-wider">Max Annual Budget (USD)</label>
                  <input type="number" value={profile.budgetMax} onChange={e => updateField("budgetMax", e.target.value)} placeholder="30000" className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-primary outline-none transition-all" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-navy uppercase tracking-wider">Scholarship Requirement</label>
                  <select value={profile.scholarshipRequired} onChange={e => updateField("scholarshipRequired", e.target.value)} className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-primary outline-none transition-all bg-white">
                    <option value="no">Not required</option>
                    <option value="preferred">Preferred but not required</option>
                    <option value="yes">Must have scholarship</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">Preferred Countries</label>
                <div className="flex flex-wrap gap-2">
                  {countries.map(c => (
                    <button
                      key={c}
                      onClick={() => toggleCountry(c)}
                      className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-all ${
                        profile.targetCountries.includes(c) 
                          ? "bg-blue-primary border-blue-primary text-white" 
                          : "border-slate-100 text-slate-500 hover:border-blue-200"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">Career Goal</label>
                <textarea value={profile.careerGoal} onChange={e => updateField("careerGoal", e.target.value)} placeholder="I want to work as a AI Researcher at a top tech firm..." rows={3} className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-primary outline-none transition-all resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">Why Study Abroad?</label>
                <textarea value={profile.whyAbroad} onChange={e => updateField("whyAbroad", e.target.value)} placeholder="To gain global exposure and access advanced research facilities..." rows={3} className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-primary outline-none transition-all resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider">Post-Study Plan</label>
                <select value={profile.postStudyPlan} onChange={e => updateField("postStudyPlan", e.target.value)} className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-blue-primary outline-none transition-all bg-white">
                  <option value="">Select Plan</option>
                  <option value="Return to Bangladesh">Return to Bangladesh</option>
                  <option value="Settle abroad">Settle abroad</option>
                  <option value="Undecided">Undecided</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
          <button 
            disabled={step === 1}
            onClick={() => setStep(s => s - 1)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-muted hover:text-navy disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={18} /> Previous
          </button>
          
          {step < 6 ? (
            <button 
              onClick={() => setStep(s => s + 1)}
              className="bg-blue-primary text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-blue-hover hover:-translate-y-0.5 transition-all shadow-lg shadow-blue-primary/20"
            >
              Next Step <ChevronRight size={18} className="inline ml-1" />
            </button>
          ) : (
            <button 
              onClick={() => { onSave(profile); setPage("match"); }}
              className="bg-gold text-navy px-8 py-3 rounded-xl font-display font-extrabold text-sm hover:bg-gold-hover hover:-translate-y-0.5 transition-all shadow-lg shadow-gold/20"
            >
              Save & View Matches 🎓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function MatchPage({ profile, setPage, onAddApp, universities }: { profile: any, setPage: any, onAddApp: any, universities: any[] }) {
  const [filters, setFilters] = useState({ country: "All", degree: "All", budget: "Any", sort: "score" });
  const [selectedUni, setSelectedUni] = useState<any>(null);

  console.log("MatchPage rendering with profile:", profile);
  console.log("Universities count:", universities?.length);

  const filteredUnis = useMemo(() => {
    return (universities || [])
      .map(u => ({ ...u, match: calculateMatchScore(profile, u) }))
      .filter(u => {
        const countryMatch = filters.country === "All" || u.country === filters.country;
        
        // Safety check for degreeLevel
        const degreeLevels = Array.isArray(u.degreeLevel) ? u.degreeLevel : [u.degreeLevel];
        const degreeMatch = filters.degree === "All" || degreeLevels.includes(filters.degree);
        
        const totalCost = (u.tuitionPerYear || 0) + (u.livingCost || 0);
        const budgetMatch = filters.budget === "Any" || 
          (filters.budget === "<15k" && totalCost < 15000) ||
          (filters.budget === "<25k" && totalCost < 25000) ||
          (filters.budget === "<35k" && totalCost < 35000) ||
          (filters.budget === "<50k" && totalCost < 50000);
        return countryMatch && degreeMatch && budgetMatch;
      })
      .sort((a, b) => {
        if (filters.sort === "score") return b.match.score - a.match.score;
        return (a.qsRank || 999) - (b.qsRank || 999);
      });
  }, [profile, filters, universities]);

  const countries = ["All", ...new Set((universities || []).map(u => u.country))];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {!profile.cgpa && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-yellow-600" />
            <p className="text-yellow-800 font-medium">Add CGPA, IELTS, and Target Degree to see accurate scores.</p>
          </div>
          <button onClick={() => setPage("profile")} className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-700 transition-colors">
            Complete Profile →
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 lg:p-5 rounded-2xl border border-border-main flex flex-col lg:flex-row gap-4 lg:items-center justify-between shadow-sm">
        <div className="grid grid-cols-2 lg:flex lg:flex-wrap gap-3 lg:gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Country</label>
            <select value={filters.country} onChange={e => setFilters({...filters, country: e.target.value})} className="w-full lg:w-auto bg-slate-50 border-none rounded-lg px-3 py-2 text-sm font-bold text-navy outline-none focus:ring-2 ring-blue-primary/20">
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Degree</label>
            <select value={filters.degree} onChange={e => setFilters({...filters, degree: e.target.value})} className="w-full lg:w-auto bg-slate-50 border-none rounded-lg px-3 py-2 text-sm font-bold text-navy outline-none focus:ring-2 ring-blue-primary/20">
              <option value="All">All Degrees</option>
              <option value="Bachelor">Bachelor</option>
              <option value="Master">Master</option>
              <option value="PhD">PhD</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Max Budget</label>
            <select value={filters.budget} onChange={e => setFilters({...filters, budget: e.target.value})} className="w-full lg:w-auto bg-slate-50 border-none rounded-lg px-3 py-2 text-sm font-bold text-navy outline-none focus:ring-2 ring-blue-primary/20">
              <option value="Any">Any Budget</option>
              <option value="<15k">&lt;$15k/yr</option>
              <option value="<25k">&lt;$25k/yr</option>
              <option value="<35k">&lt;$35k/yr</option>
              <option value="<50k">&lt;$50k/yr</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Sort By</label>
            <select value={filters.sort} onChange={e => setFilters({...filters, sort: e.target.value})} className="w-full lg:w-auto bg-slate-50 border-none rounded-lg px-3 py-2 text-sm font-bold text-navy outline-none focus:ring-2 ring-blue-primary/20">
              <option value="score">Match Score</option>
              <option value="rank">QS Ranking</option>
            </select>
          </div>
        </div>
        <div className="text-xs font-bold text-muted pt-2 lg:pt-0 border-t lg:border-none border-slate-100">
          Showing {(filteredUnis || []).length} universities
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUnis.map(uni => (
          <div 
            key={uni.id} 
            onClick={() => setSelectedUni(uni)}
            className="bg-white rounded-2xl border border-border-main overflow-hidden hover:border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
          >
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="text-5xl group-hover:scale-110 transition-transform">{uni.logo}</div>
                <MatchBadge category={uni.match.category} />
              </div>
              
              <div>
                <h3 className="text-lg font-display font-extrabold text-navy leading-tight">{uni.name}</h3>
                <div className="flex items-center gap-2 text-xs text-muted font-bold mt-1">
                  <MapPin size={12} /> {uni.city}, {uni.country} · QS #{uni.qsRank}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <div className="text-[10px] font-bold text-muted uppercase tracking-wider">Tuition</div>
                  <div className="text-sm font-extrabold text-navy">${(uni.tuitionPerYear/1000).toFixed(0)}k/yr</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <div className="text-[10px] font-bold text-muted uppercase tracking-wider">Acceptance</div>
                  <div className="text-sm font-extrabold text-navy">{uni.acceptanceRate}%</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <div className="text-[10px] font-bold text-muted uppercase tracking-wider">Employment</div>
                  <div className="text-sm font-extrabold text-navy">{uni.employmentRate}%</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl">
                  <div className="text-[10px] font-bold text-muted uppercase tracking-wider">Avg Salary</div>
                  <div className="text-sm font-extrabold text-navy">${(uni.avgSalary/1000).toFixed(0)}k</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {uni.tags.map(tag => (
                  <span key={tag} className="bg-blue-50 text-blue-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 border-t border-border-main flex items-center justify-between">
              <div className="text-[10px] font-bold text-muted space-x-2">
                <span>IELTS min: {uni.minIELTS}</span>
                <span>|</span>
                <span>CGPA min: {uni.minCGPA}</span>
                {uni.postStudyVisa && (
                  <span className="text-teal block mt-1">✈️ {uni.postStudyYears}yr post-study visa</span>
                )}
              </div>
              <ScoreRing score={uni.match.score} size={48} />
            </div>
          </div>
        ))}

        {filteredUnis.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
              <Search className="text-slate-300" size={32} />
            </div>
            <h3 className="text-xl font-display font-extrabold text-navy">No matches found</h3>
            <p className="text-muted font-medium max-w-xs mx-auto">Try adjusting your filters or completing your profile to see more results.</p>
            <button onClick={() => setFilters({ country: "All", degree: "All", budget: "Any", sort: "score" })} className="text-blue-primary font-bold hover:underline">
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedUni && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUni(null)}
              className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            >
              <button onClick={() => setSelectedUni(null)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-all z-10">
                <X size={24} className="text-navy" />
              </button>

              <div className="p-8 md:p-10 overflow-y-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="text-6xl">{selectedUni.logo}</div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-display font-extrabold text-navy leading-tight">{selectedUni.name}</h2>
                      <p className="text-muted font-bold">{selectedUni.city}, {selectedUni.country} · QS #{selectedUni.qsRank}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                    <ScoreRing score={selectedUni.match.score} size={72} />
                    <div className="space-y-1">
                      <MatchBadge category={selectedUni.match.category} />
                      <p className="text-[10px] font-bold text-muted uppercase tracking-widest text-center">Match Score</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-50 p-6 rounded-2xl border border-green-100 space-y-3">
                    <h4 className="text-xs font-bold text-green-700 uppercase tracking-widest">✅ What Matches</h4>
                    <ul className="space-y-2">
                      {selectedUni.match.matched.length > 0 ? selectedUni.match.matched.map((m: string, i: number) => (
                        <li key={i} className="text-sm font-bold text-green-800 flex items-start gap-2">
                          <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> {m}
                        </li>
                      )) : <li className="text-sm text-green-600 italic">Complete profile for details</li>}
                    </ul>
                  </div>
                  <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 space-y-3">
                    <h4 className="text-xs font-bold text-orange-700 uppercase tracking-widest">⚠️ What's Missing</h4>
                    <ul className="space-y-2">
                      {selectedUni.match.missing.length > 0 ? selectedUni.match.missing.map((m: string, i: number) => (
                        <li key={i} className="text-sm font-bold text-orange-800 flex items-start gap-2">
                          <X size={16} className="mt-0.5 shrink-0" /> {m}
                        </li>
                      )) : <li className="text-sm text-orange-600 italic">No major gaps found!</li>}
                    </ul>
                  </div>
                </div>

                {selectedUni.match.tips.length > 0 && (
                  <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 space-y-3">
                    <h4 className="text-xs font-bold text-blue-700 uppercase tracking-widest">💡 Tips to Improve</h4>
                    <ul className="space-y-2">
                      {selectedUni.match.tips.map((t: string, i: number) => (
                        <li key={i} className="text-sm font-bold text-blue-800 flex items-start gap-2">
                          <ChevronRight size={16} className="mt-0.5 shrink-0" /> {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-display font-extrabold text-navy flex items-center gap-2">
                      <BookOpen size={20} className="text-blue-primary" /> Available Programs
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedUni.programs.map((p: string) => (
                        <span key={p} className="bg-slate-100 text-navy text-xs font-bold px-3 py-1.5 rounded-lg">{p}</span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-display font-extrabold text-navy flex items-center gap-2">
                      <Award size={20} className="text-gold" /> Scholarships
                    </h4>
                    <div className="space-y-2">
                      {selectedUni.scholarships.map((s: string) => (
                        <div key={s} className="bg-gold/10 border border-gold/20 p-3 rounded-xl">
                          <p className="text-sm font-bold text-navy">{s}</p>
                          <p className="text-xs text-gold font-bold">Up to ${selectedUni.scholarshipAmount.toLocaleString()}/yr</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-100">
                  <button onClick={() => setSelectedUni(null)} className="flex-1 bg-navy text-white py-4 rounded-xl font-display font-extrabold hover:bg-navy2 transition-all">
                    Close
                  </button>
                  <button onClick={() => { 
                    onAddApp({
                      university: selectedUni.name,
                      program: selectedUni.programs[0] || "General",
                      deadline: selectedUni.fallDeadline || "TBD",
                      status: "researching",
                      notes: ""
                    });
                    setPage("tracker"); 
                    setSelectedUni(null); 
                  }} className="flex-1 bg-gold text-navy py-4 rounded-xl font-display font-extrabold hover:bg-gold-hover transition-all flex items-center justify-center gap-2">
                    <Plus size={20} /> Add to Tracker
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ScholarshipPage({ profile, scholarships }: { profile: any, scholarships: any[] }) {
  const [filters, setFilters] = useState({ country: "All", degree: "All", eligibleOnly: false });

  const filteredSchs = useMemo(() => {
    return scholarships
      .map(s => ({ ...s, match: calculateScholarshipMatch(profile, s) }))
      .filter(s => {
        const countryMatch = filters.country === "All" || s.country === filters.country;
        const degreeMatch = filters.degree === "All" || s.degreeLevel.includes(filters.degree);
        const eligibilityMatch = !filters.eligibleOnly || s.match.eligible;
        return countryMatch && degreeMatch && eligibilityMatch;
      })
      .sort((a, b) => b.match.score - a.match.score);
  }, [profile, filters, scholarships]);

  const countries = ["All", ...new Set(scholarships.map(s => s.country))];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-5 rounded-2xl border border-border-main flex flex-wrap gap-6 items-center justify-between shadow-sm">
        <div className="flex flex-wrap gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Country</label>
            <select value={filters.country} onChange={e => setFilters({...filters, country: e.target.value})} className="bg-slate-50 border-none rounded-lg px-3 py-2 text-sm font-bold text-navy outline-none focus:ring-2 ring-blue-primary/20">
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">Degree Level</label>
            <select value={filters.degree} onChange={e => setFilters({...filters, degree: e.target.value})} className="bg-slate-50 border-none rounded-lg px-3 py-2 text-sm font-bold text-navy outline-none focus:ring-2 ring-blue-primary/20">
              <option value="All">All Levels</option>
              <option value="Bachelor">Bachelor</option>
              <option value="Master">Master</option>
              <option value="PhD">PhD</option>
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer pt-5">
            <input type="checkbox" checked={filters.eligibleOnly} onChange={e => setFilters({...filters, eligibleOnly: e.target.checked})} className="w-4 h-4 rounded border-slate-300 text-blue-primary focus:ring-blue-primary" />
            <span className="text-sm font-bold text-navy">Show only eligible</span>
          </label>
        </div>
        <div className="text-sm font-bold text-muted">Showing {filteredSchs.length} scholarships</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchs.map(sch => (
          <div key={sch.id} className={`bg-white rounded-2xl border p-6 space-y-6 transition-all hover:shadow-xl ${sch.featured ? "border-gold ring-1 ring-gold/20" : "border-border-main"}`}>
            {sch.featured && (
              <div className="inline-block bg-gold text-navy text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">⭐ Featured</div>
            )}
            
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-display font-extrabold text-navy leading-tight">{sch.name}</h3>
                <p className="text-xs text-muted font-bold mt-1">{sch.country} · {sch.type}</p>
              </div>
              <div className="text-xl font-display font-extrabold text-teal">${(sch.amount/1000).toFixed(0)}k<span className="text-xs">/yr</span></div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {sch.coverage.map(c => (
                <span key={c} className="bg-teal/10 text-teal text-[10px] font-bold px-2 py-0.5 rounded-full">{c}</span>
              ))}
            </div>

            <div className={`py-2 px-4 rounded-xl flex items-center justify-between ${sch.match.eligible ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              <span className="text-xs font-bold">{sch.match.eligible ? "✅ You are eligible!" : "❌ Not yet eligible"}</span>
              <span className="text-xs font-black">{sch.match.score}%</span>
            </div>

            <div className="space-y-2">
              {sch.match.reasons.map((r: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-xs font-bold text-navy">
                  <CheckCircle2 size={12} className="text-teal" /> {r}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {sch.degreeLevel.map(d => (
                <span key={d} className="bg-blue-50 text-blue-primary text-[10px] font-bold px-2 py-0.5 rounded-full">{d}</span>
              ))}
            </div>

            <p className="text-xs text-muted leading-relaxed line-clamp-2">{sch.description}</p>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="text-[10px] font-bold text-muted">
                <Calendar size={12} className="inline mr-1" /> Deadline: {sch.deadline}
                {sch.renewable && <span className="text-teal ml-2">· Renewable</span>}
              </div>
              <a href={sch.link} target="_blank" rel="noreferrer" className="bg-blue-primary text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-hover transition-all flex items-center gap-1">
                Apply <ExternalLink size={12} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrackerPage({ apps, onUpdateStatus, onRemove, onAdd }: { apps: any[], onUpdateStatus: any, onRemove: any, onAdd: any }) {
  const [showForm, setShowForm] = useState(false);
  const [newApp, setNewApp] = useState({ university: "", program: "", deadline: "", status: "researching", notes: "" });

  const statusOptions = [
    { id: "researching", label: "Researching", color: "bg-slate-100 text-slate-600" },
    { id: "preparing", label: "Preparing", color: "bg-yellow-100 text-yellow-700" },
    { id: "applied", label: "Applied", color: "bg-blue-100 text-blue-700" },
    { id: "decision_pending", label: "Pending", color: "bg-orange-100 text-orange-700" },
    { id: "accepted", label: "Accepted", color: "bg-green-100 text-green-700" },
    { id: "rejected", label: "Rejected", color: "bg-red-100 text-red-700" },
    { id: "waitlisted", label: "Waitlisted", color: "bg-purple-100 text-purple-700" }
  ];

  const getDaysLeft = (deadline: string) => {
    if (!deadline || deadline === "TBD") return 999;
    const diff = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / 86400000);
    return diff;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Applications", val: apps.length, icon: <ClipboardList />, color: "text-navy" },
          { label: "In Progress", val: apps.filter(a => ["researching", "preparing"].includes(a.status)).length, icon: <Briefcase />, color: "text-yellow-600" },
          { label: "Applied", val: apps.filter(a => a.status === "applied").length, icon: <Globe />, color: "text-blue-primary" },
          { label: "Accepted", val: apps.filter(a => a.status === "accepted").length, icon: <CheckCircle2 />, color: "text-teal" }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-border-main shadow-sm">
            <div className={`${stat.color} mb-2`}>{stat.icon}</div>
            <div className="text-2xl font-display font-extrabold text-navy">{stat.val}</div>
            <div className="text-xs text-muted font-bold uppercase tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-navy">Application Pipeline</h3>
        <button onClick={onAdd} className="bg-blue-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-hover transition-all flex items-center gap-2">
          <Plus size={18} /> Add Application
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border-main overflow-x-auto shadow-sm">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 border-bottom border-border-main">
              <th className="text-left p-4 text-[10px] font-bold text-muted uppercase tracking-widest">University</th>
              <th className="text-left p-4 text-[10px] font-bold text-muted uppercase tracking-widest">Program</th>
              <th className="text-left p-4 text-[10px] font-bold text-muted uppercase tracking-widest">Deadline</th>
              <th className="text-left p-4 text-[10px] font-bold text-muted uppercase tracking-widest">Status</th>
              <th className="text-left p-4 text-[10px] font-bold text-muted uppercase tracking-widest">Notes</th>
              <th className="text-center p-4 text-[10px] font-bold text-muted uppercase tracking-widest">Action</th>
            </tr>
          </thead>
          <tbody>
            {apps.length > 0 ? apps.map(app => {
              const daysLeft = getDaysLeft(app.deadline);
              return (
                <tr key={app.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-navy">{app.university}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-muted font-medium">{app.program}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-bold text-navy">{app.deadline}</div>
                    <div className={`text-[10px] font-black uppercase mt-1 ${
                      daysLeft < 0 ? "text-red-primary" : 
                      daysLeft < 7 ? "text-red-primary" : 
                      daysLeft < 30 ? "text-gold" : "text-teal"
                    }`}>
                      {daysLeft === 999 ? "No deadline" : daysLeft < 0 ? "Passed" : daysLeft === 0 ? "Today!" : `${daysLeft} days left`}
                    </div>
                  </td>
                  <td className="p-4">
                    <select 
                      value={app.status} 
                      onChange={e => onUpdateStatus(app.id, e.target.value)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full border-none outline-none cursor-pointer ${
                        statusOptions.find(o => o.id === app.status)?.color
                      }`}
                    >
                      {statusOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                    </select>
                  </td>
                  <td className="p-4">
                    <div className="text-xs text-muted truncate max-w-[150px]" title={app.notes}>{app.notes || "—"}</div>
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => onRemove(app.id)} className="p-2 text-red-primary hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={6} className="p-20 text-center">
                  <div className="flex flex-col items-center gap-4 text-muted">
                    <ClipboardList size={48} className="opacity-20" />
                    <div>
                      <h4 className="text-navy font-bold">No applications yet</h4>
                      <p className="text-sm">Start tracking your journey by adding your first application.</p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CostCalcPage() {
  const [sel, setSel] = useState({ university: "", duration: "2", currency: "USD" });
  const [result, setResult] = useState<any>(null);

  const rates: any = { USD: 1, BDT: 110, EUR: 0.92, GBP: 0.79, SGD: 1.35 };
  const symbols: any = { BDT: "৳", EUR: "€", GBP: "£", USD: "$" };

  const calculate = () => {
    const uni = UNIVERSITIES.find(u => u.name === sel.university);
    if (!uni) return;
    const years = parseFloat(sel.duration);
    const r = rates[sel.currency];
    const sym = symbols[sel.currency] || "$";
    
    setResult({
      tuition: uni.tuitionPerYear * years * r,
      living: uni.livingCost * years * r,
      visa: 300 * r,
      flight: 1200 * r,
      misc: 2000 * years * r,
      total: (uni.tuitionPerYear * years + uni.livingCost * years + 300 + 1200 + 2000 * years) * r,
      symbol: sym,
      uni,
      years
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500 items-start">
      <div className="bg-white p-8 rounded-2xl border border-border-main shadow-sm space-y-6">
        <h3 className="text-xl font-display font-extrabold text-navy">Enter Details</h3>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-navy uppercase tracking-wider">Select University</label>
            <select value={sel.university} onChange={e => setSel({...sel, university: e.target.value})} className="w-full p-3 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-primary bg-white">
              <option value="">Choose a university</option>
              {UNIVERSITIES.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-navy uppercase tracking-wider">Program Duration</label>
            <select value={sel.duration} onChange={e => setSel({...sel, duration: e.target.value})} className="w-full p-3 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-primary bg-white">
              <option value="1">1 Year</option>
              <option value="1.5">1.5 Years</option>
              <option value="2">2 Years</option>
              <option value="3">3 Years</option>
              <option value="4">4 Years</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-navy uppercase tracking-wider">Display Currency</label>
            <select value={sel.currency} onChange={e => setSel({...sel, currency: e.target.value})} className="w-full p-3 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-primary bg-white">
              {Object.keys(rates).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button onClick={calculate} className="w-full bg-blue-primary text-white py-4 rounded-xl font-display font-extrabold hover:bg-blue-hover transition-all shadow-lg shadow-blue-primary/20">
            Calculate Total Cost →
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {result ? (
          <>
            <div className="bg-white p-8 rounded-2xl border border-border-main shadow-sm space-y-6">
              <h3 className="text-xl font-display font-extrabold text-navy">{result.uni.name} · {result.years} Year(s)</h3>
              <div className="space-y-4">
                {[
                  { label: "Tuition Fees", val: result.tuition },
                  { label: "Living Expenses", val: result.living },
                  { label: "Visa & Admin", val: result.visa },
                  { label: "Flight (Estimate)", val: result.flight },
                  { label: "Miscellaneous", val: result.misc }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center pb-3 border-b border-slate-50">
                    <span className="text-sm font-medium text-muted">{item.label}</span>
                    <span className="text-sm font-bold text-navy">{result.symbol}{Math.round(item.val).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-navy to-navy2 p-8 rounded-2xl shadow-xl space-y-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Estimated Cost ({result.years} yr)</div>
              <div className="text-4xl font-display font-extrabold text-gold">{result.symbol}{Math.round(result.total).toLocaleString()}</div>
              <div className="text-sm text-slate-400 font-medium">≈ {result.symbol}{Math.round(result.total / result.years).toLocaleString()} per year</div>
              
              {result.uni.scholarshipAmount > 0 && (
                <div className="bg-green-primary/10 border border-green-primary/20 p-3 rounded-xl flex items-center gap-2">
                  <Award size={16} className="text-green-primary" />
                  <p className="text-xs font-bold text-green-primary">
                    🎓 Potential savings up to {result.symbol}{Math.round(result.uni.scholarshipAmount * rates[sel.currency] * result.years).toLocaleString()} with scholarships
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white p-20 rounded-2xl border border-border-main border-dashed flex flex-col items-center justify-center text-center gap-4 text-muted">
            <Calculator size={48} className="opacity-20" />
            <div>
              <h4 className="text-navy font-bold">Select a University</h4>
              <p className="text-sm">Choose a university and duration to see a detailed cost breakdown.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
