'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarCheck, Eye, EyeOff, Home, Lock, Mail, ShieldCheck, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/app-store';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, user } = useAppStore();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [authError, setAuthError] = useState('');
  
  const [isCreateAccount, setIsCreateAccount] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestAge, setGuestAge] = useState('');
  const [guestRole, setGuestRole] = useState('Family Member');

  const goToDashboard = async (provider: 'email' | 'facebook' | 'guest' | 'google') => {
    try {
      setAuthError('');
      setAuthMessage('');
      await signIn(provider, email, guestName, guestAge, guestRole, password, isCreateAccount);
      // Fallback manual push if the useEffect doesn't trigger fast enough
      router.push('/dashboard');
    } catch (error) {
      console.error('Sign in failed or was cancelled:', error);
      setAuthError(error instanceof Error ? error.message : 'Could not sign in. Please try again.');
    }
  };

  // Auto-redirect if already logged in (e.g., page refresh or successful background sign-in)
  React.useEffect(() => {
    if (user?.email) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleAuthSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (isGuestMode) {
      goToDashboard('guest');
    } else {
      goToDashboard('email');
    }
  };



  return (
    <div className="min-h-screen bg-slate-50 grid lg:grid-cols-[1fr_460px]">
      <section className="hidden lg:flex flex-col justify-between p-10 bg-white border-r border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
            <Home className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-950">MedHome</h1>
            <p className="text-sm text-slate-500">Family medicine command center</p>
          </div>
        </div>

        <div className="max-w-xl space-y-6">
          <div>
            <p className="text-sm font-semibold text-teal-700">Secure household care</p>
            <h2 className="text-5xl font-bold text-slate-950 mt-3 leading-tight">
              Manage medicines, reminders, and restocks in one calm place.
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-slate-200 p-4">
              <ShieldCheck className="w-5 h-5 text-teal-600 mb-3" />
              <p className="text-sm font-semibold text-slate-900">Family profiles</p>
              <p className="text-xs text-slate-500 mt-1">Separate medicines and allergies.</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <CalendarCheck className="w-5 h-5 text-teal-600 mb-3" />
              <p className="text-sm font-semibold text-slate-900">Calendar sync</p>
              <p className="text-xs text-slate-500 mt-1">Plan doses and restocks.</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <BellIcon />
              <p className="text-sm font-semibold text-slate-900">Smart alerts</p>
              <p className="text-xs text-slate-500 mt-1">Low stock, expiry, duplicates.</p>
            </div>
          </div>
        </div>


      </section>

      <main className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-7">
          <div className="lg:hidden flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center">
              <Home className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">MedHome</h1>
            <p className="text-slate-600 text-center text-sm">Manage family medicines together</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-7 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">
                {isGuestMode ? 'Guest Setup' : (isCreateAccount ? 'Create account' : 'Sign in')}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {isGuestMode ? 'Tell us a bit about yourself.' : 'Open your household dashboard.'}
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {isGuestMode ? (
                <>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">Name</span>
                    <span className="relative block">
                      <User className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="John Doe"
                      />
                    </span>
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">Age</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      required
                      value={guestAge}
                      onChange={(e) => setGuestAge(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g. 35"
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">Role in household</span>
                    <select
                      value={guestRole}
                      onChange={(e) => setGuestRole(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    >
                      <option value="Host">Host</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Child">Child</option>
                      <option value="Grandparent">Grandparent</option>
                      <option value="Caregiver">Caregiver</option>
                      <option value="Family Member">Other Family Member</option>
                    </select>
                  </label>
                </>
              ) : (
                <>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">Email address</span>
                    <span className="relative block">
                      <Mail className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </span>
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">Password</span>
                    <span className="relative block">
                      <Lock className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </span>
                  </label>
                </>
              )}

              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
                {isGuestMode ? 'Enter as Guest' : (isCreateAccount ? 'Create Account' : 'Sign in')}
              </Button>
              {authError && <p className="text-sm font-medium text-red-600">{authError}</p>}
              {authMessage && <p className="text-sm font-medium text-teal-700">{authMessage}</p>}
            </form>





            <div className="flex flex-col gap-2 text-sm text-center">
              {isGuestMode ? (
                <button type="button" onClick={() => setIsGuestMode(false)} className="text-slate-600 hover:text-slate-900 mt-2">
                  Back to login
                </button>
              ) : (
                <div className="flex items-center justify-between mt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateAccount(!isCreateAccount)}
                    className="text-teal-700 font-medium hover:text-teal-800"
                  >
                    {isCreateAccount ? 'Sign in instead' : 'Create account'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsGuestMode(true)}
                    className="text-slate-600 hover:text-slate-900"
                  >
                    Continue as guest
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function BellIcon() {
  return (
    <svg className="w-5 h-5 text-teal-600 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
