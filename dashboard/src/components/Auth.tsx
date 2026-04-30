'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LogIn, UserPlus, ArrowLeft, Eye, EyeOff, KeyRound, Shield, Clock, CheckCircle, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const DEV_QUICK_LOGIN = {
  vendor: {
    email: 'test.vendor@purple-soul.com',
    password: 'VendorTest123!',
  },
  admin: {
    email: 'fk.envcal@gmail.com',
    password: 'Admin123!',
  },
} as const;

function AdminRequestAccess({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: insertError } = await supabase
        .from('admin_access_requests')
        .insert({ email, full_name: name, reason, status: 'pending' });
      if (insertError) throw insertError;
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Request Submitted</h2>
        <p className="text-slate-600 text-sm mb-6">
          Your access request has been sent to the super administrator for review. You will be notified once approved.
        </p>
        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors text-sm font-medium"
        >
          Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
        <h2 className="text-lg font-bold text-slate-800">Request Admin Access</h2>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
        <div className="flex gap-3">
          <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Admin accounts require approval from a super administrator. Submit your request and you will be contacted once approved.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-sm"
            placeholder="Your full name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-sm"
            placeholder="admin@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason for Access *</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-sm resize-none"
            placeholder="Briefly describe your role and why you need admin access..."
          />
        </div>

        {error && (
          <div className="p-3 rounded-xl text-sm bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Submitting...' : (
            <>
              <Send className="w-4 h-4" />
              Submit Request
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export function Auth() {
  const params = useParams<{ role: string }>();
  const role = params?.role as 'vendor' | 'admin' | undefined;
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showAdminRequest, setShowAdminRequest] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();

  const isAdmin = role === 'admin';
  const isDev = process.env.NODE_ENV === 'development';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
        setSignUpSuccess(true);
        setLoading(false);
      } else {
        const { isAdmin: userIsAdmin } = await signIn(email, password);
        if (userIsAdmin) {
          router.replace('/admin/dashboard');
        } else {
          router.replace('/vendor/dashboard');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await resetPassword(resetEmail);
      setResetSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDevQuickLogin = async () => {
    const creds = isAdmin ? DEV_QUICK_LOGIN.admin : DEV_QUICK_LOGIN.vendor;
    setEmail(creds.email);
    setPassword(creds.password);
    setError('');
    setLoading(true);

    try {
      const { isAdmin: userIsAdmin } = await signIn(creds.email, creds.password);
      if (userIsAdmin) {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/vendor/dashboard');
      }
    } catch (err) {
      console.error('Dev quick login error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <button
          onClick={() => router.push('/')}
          className="mb-4 flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to role selection
        </button>

        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className={`w-16 h-16 bg-gradient-to-br ${
              isAdmin ? 'from-emerald-500 to-emerald-600' : 'from-blue-500 to-blue-600'
            } rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
              {isAdmin ? <Shield className="w-8 h-8 text-white" /> : <span className="text-2xl font-bold text-white">D</span>}
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">
              Purple Soul Collective by DKC
            </h1>
            <p className="text-xs text-slate-500 italic mb-2">Faith Based Big Ecommerce</p>
            <p className="text-slate-500 text-sm">
              {isAdmin ? 'Admin Portal' : 'Vendor Portal'}
            </p>
          </div>

          {isAdmin && showAdminRequest ? (
            <AdminRequestAccess onBack={() => setShowAdminRequest(false)} />
          ) : signUpSuccess && !isAdmin ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Account Created</h2>
              <p className="text-slate-600 text-sm mb-2">
                Your vendor account has been created and is <strong>pending approval</strong> from our admin team.
              </p>
              <p className="text-slate-500 text-sm mb-6">
                You can sign in now to check your approval status. You'll receive access once an admin approves your account.
              </p>
              <button
                onClick={() => {
                  setSignUpSuccess(false);
                  setIsSignUp(false);
                  setEmail('');
                  setPassword('');
                }}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Sign In Now
              </button>
            </div>
          ) : (
            <>
              {isAdmin && !isSignUp && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-5 flex gap-3">
                  <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-800">
                    Admin accounts are managed by super administrators. If you need access, use the <strong>"Request Access"</strong> option below.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      isAdmin ? 'focus:ring-emerald-500/30 focus:border-emerald-500' : 'focus:ring-blue-500/30 focus:border-blue-500'
                    }`}
                    placeholder={isAdmin ? 'admin@example.com' : 'vendor@example.com'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className={`w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                        isAdmin ? 'focus:ring-emerald-500/30 focus:border-emerald-500' : 'focus:ring-blue-500/30 focus:border-blue-500'
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {isSignUp && !isAdmin && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                    <p className="text-xs text-blue-700">
                      After signing up, your account will need approval from an admin before you can access the vendor dashboard.
                    </p>
                  </div>
                )}

                {error && (
                  <div className="p-4 rounded-xl text-sm bg-red-50 text-red-700 border border-red-200">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full px-6 py-3 bg-gradient-to-r ${
                    isAdmin ? 'from-emerald-500 to-emerald-600' : 'from-blue-500 to-blue-600'
                  } text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50`}
                >
                  {loading ? 'Loading...' : isSignUp ? (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Create Account
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Sign In
                    </>
                  )}
                </button>
              </form>

              <div className="mt-5 text-center space-y-3">
                {isDev && !isSignUp && (
                  <button
                    type="button"
                    onClick={handleDevQuickLogin}
                    disabled={loading}
                    className={`w-full px-6 py-2.5 rounded-xl border font-medium transition-all disabled:opacity-50 ${
                      isAdmin
                        ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                        : 'border-blue-300 text-blue-700 hover:bg-blue-50'
                    }`}
                  >
                    {isAdmin ? 'Dev Bypass: Login as Admin' : 'Dev Bypass: Login as Vendor'}
                  </button>
                )}

                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setError('');
                      setResetSuccess(false);
                    }}
                    className={`${
                      isAdmin ? 'text-emerald-600 hover:text-emerald-700' : 'text-blue-600 hover:text-blue-700'
                    } text-sm font-medium transition-colors flex items-center gap-2 mx-auto`}
                  >
                    <KeyRound className="w-4 h-4" />
                    Forgot password?
                  </button>
                )}

                {isAdmin ? (
                  <button
                    onClick={() => {
                      setShowAdminRequest(true);
                      setError('');
                    }}
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors flex items-center gap-1.5 mx-auto"
                  >
                    <UserPlus className="w-4 h-4" />
                    Request Admin Access
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError('');
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors text-sm"
                  >
                    {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">Reset Password</h2>
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetSuccess(false);
                  setError('');
                  setResetEmail('');
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            {resetSuccess ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-green-700 mb-4 text-sm">
                  Password reset email sent. Check your inbox for instructions.
                </p>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetSuccess(false);
                    setResetEmail('');
                  }}
                  className={`px-6 py-2.5 bg-gradient-to-r ${
                    isAdmin ? 'from-emerald-500 to-emerald-600' : 'from-blue-500 to-blue-600'
                  } text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium`}
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm"
                    placeholder="Enter your email"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">We'll send you a link to reset your password.</p>
                </div>

                {error && (
                  <div className="p-3 rounded-xl text-sm bg-red-50 text-red-700 border border-red-200">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full px-6 py-3 bg-gradient-to-r ${
                    isAdmin ? 'from-emerald-500 to-emerald-600' : 'from-blue-500 to-blue-600'
                  } text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium disabled:opacity-50`}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
