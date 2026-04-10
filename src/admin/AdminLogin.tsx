import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LogIn, Loader2, AlertCircle } from 'lucide-react';
import { auth, loginWithGoogle } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Logo from '../components/Logo';

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleAdminLogin = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Authenticate with Firebase first
      const result = await loginWithGoogle();
      const user = result.user;

      // 2. Verify with our backend that this user is an admin
      // In a real app, we'd check a dedicated 'admins' collection or custom claims
      // For this demo, we'll allow the user email provided in context as admin
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, role: 'admin' }) // Role check happens on server
      });

      if (response.ok) {
        navigate('/admin');
      } else {
        setError("You do not have administrative privileges.");
        await auth.signOut();
      }
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError("Login popup was closed.");
      } else if (err.code === 'auth/unauthorized-domain') {
        setError("This domain is not authorized in Firebase. Please add your Railway URL to Firebase Console.");
      } else if (err.code === 'auth/popup-blocked') {
        setError("Login popup was blocked by your browser.");
      } else {
        setError(err.message || "An error occurred during login.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border-2 border-navy rounded-3xl p-10 shadow-[8px_8px_0px_0px_#0a1628] space-y-8">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-navy rounded-2xl flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_#f59e0b]">
            <Logo showText={false} iconSize={40} />
          </div>
          <h1 className="text-3xl font-display font-extrabold tracking-tight">Admin Access</h1>
          <p className="text-slate-500 font-medium">Secure portal for Bidesh Jabo administrators.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3 text-red-700">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <button 
            onClick={handleAdminLogin}
            disabled={loading}
            className="w-full bg-navy text-white py-4 rounded-xl font-display font-extrabold hover:bg-slate-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
            Sign in as Administrator
          </button>
          
          <p className="text-center text-xs text-slate-400 font-bold uppercase tracking-widest">
            Restricted Area · Authorized Personnel Only
          </p>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <button 
            onClick={() => navigate('/')}
            className="w-full text-slate-500 text-sm font-bold hover:text-navy transition-colors"
          >
            ← Back to Student Portal
          </button>
        </div>
      </div>
    </div>
  );
}
