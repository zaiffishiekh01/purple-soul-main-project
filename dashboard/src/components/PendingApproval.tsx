import { useState } from 'react';
import { Clock, Mail, CheckCircle, RefreshCw, LogOut, Store } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useVendorContext } from '../contexts/VendorContext';

export function PendingApproval() {
  const { signOut, userEmail } = useAuth();
  const { refetch } = useVendorContext();
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState(false);

  const handleCheckStatus = async () => {
    setChecking(true);
    setChecked(false);
    try {
      await refetch();
      setChecked(true);
      setTimeout(() => setChecked(false), 3000);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-8 py-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Account Pending Approval</h1>
                <p className="text-amber-100 text-sm mt-0.5">Your account is being reviewed</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {userEmail && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
                <Store className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">Registered as</p>
                  <p className="text-sm font-medium text-slate-800">{userEmail}</p>
                </div>
              </div>
            )}

            <p className="text-slate-600 mb-6 leading-relaxed">
              Your vendor request has been submitted successfully. Our admin team will review and verify your account. Once approved, you will be notified via email or SMS so you can access your vendor dashboard.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-amber-700">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Request Submitted</p>
                  <p className="text-xs text-slate-500 mt-0.5">Your vendor application is queued for review</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-slate-500">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Admin Verification</p>
                  <p className="text-xs text-slate-400 mt-0.5">An admin will review and verify your account details</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-slate-500">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Email or SMS Notification</p>
                  <p className="text-xs text-slate-400 mt-0.5">We'll notify you once your account is approved so you can access your dashboard</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
              <Mail className="w-4 h-4 text-blue-500 shrink-0" />
              <p className="text-sm text-blue-700">You'll receive a notification via email or SMS once verified. Approval typically takes 1-2 business days.</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleCheckStatus}
                disabled={checking}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium disabled:opacity-70 text-sm"
              >
                {checking ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Checking status...
                  </>
                ) : checked ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Still pending - check back soon
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Check Approval Status
                  </>
                )}
              </button>

              <button
                onClick={() => signOut()}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-medium text-sm"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>

            <p className="text-xs text-slate-400 text-center mt-4">
              Need help? Contact{' '}
              <a href="mailto:support@sufism.com" className="text-blue-500 hover:underline">
                support@sufism.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
