import { useState } from 'react';
import {
  Shield, Monitor, MapPin, Clock, AlertTriangle, Lock, Eye, EyeOff,
  CheckCircle2, Smartphone, LogOut,
} from 'lucide-react';

interface SecurityPageProps { onBack?: () => void; }

interface ActiveSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

interface ActivityLog {
  id: string;
  type: string;
  details: string;
  ip: string;
  date: string;
}

const mockSessions: ActiveSession[] = [
  { id: '1', device: 'Chrome on Windows', location: 'New York, NY', lastActive: '2026-04-08T10:30:00Z', isCurrent: true },
  { id: '2', device: 'Safari on iPhone', location: 'New York, NY', lastActive: '2026-04-07T15:20:00Z', isCurrent: false },
];

const mockActivity: ActivityLog[] = [
  { id: '1', type: 'login', details: 'Chrome on Windows', ip: '192.168.1.1', date: '2026-04-08T10:30:00Z' },
  { id: '2', type: 'password_changed', details: '', ip: '192.168.1.1', date: '2026-04-06T09:15:00Z' },
  { id: '3', type: 'login', details: 'Safari on iPhone', ip: '192.168.1.5', date: '2026-04-07T15:20:00Z' },
  { id: '4', type: 'address_added', details: 'Home address added', ip: '192.168.1.1', date: '2026-04-05T14:20:00Z' },
];

export default function SecurityPage({ onBack }: SecurityPageProps) {
  const [sessions, setSessions] = useState<ActiveSession[]>(mockSessions);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogoutSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    setSuccessMessage('Session terminated');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) return;
    setSuccessMessage('Password updated successfully');
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { label: '', color: '' };
    if (password.length < 8) return { label: 'Weak', color: 'text-red-600' };
    if (password.length < 12) return { label: 'Fair', color: 'text-amber-600' };
    return { label: 'Strong', color: 'text-green-600' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface border border-default rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">Account Protection</span>
        </div>
        <h2 className="text-2xl font-bold text-primary mb-2">Security & Activity</h2>
        <p className="text-secondary">Monitor your account security, manage active sessions, and review recent activity</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-700 dark:text-green-400 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Two-Factor Authentication */}
      <div className="bg-surface border border-default rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-bold text-primary">Two-Factor Authentication</h3>
              <p className="text-sm text-secondary">Add an extra layer of security to your account</p>
            </div>
          </div>
          <button
            onClick={() => { setTwoFactorEnabled(!twoFactorEnabled); setSuccessMessage(twoFactorEnabled ? '2FA disabled' : '2FA enabled'); setTimeout(() => setSuccessMessage(''), 3000); }}
            className={`relative w-12 h-6 rounded-full transition-colors ${twoFactorEnabled ? 'bg-purple-600' : 'bg-surface-deep'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${twoFactorEnabled ? 'translate-x-6' : ''}`} />
          </button>
        </div>
        {twoFactorEnabled && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            Two-factor authentication is enabled
          </div>
        )}
      </div>

      {/* Change Password */}
      <div className="bg-surface border border-default rounded-2xl p-6">
        <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-purple-600" />
          Change Password
        </h3>
        <div className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-secondary mb-1">Current Password</label>
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 pr-10 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-9 text-muted hover:text-primary">
              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-secondary mb-1">New Password</label>
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 pr-10 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-9 text-muted hover:text-primary">
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            {newPassword && <p className={`text-xs mt-1 ${passwordStrength.color}`}>Password strength: {passwordStrength.label}</p>}
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-secondary mb-1">Confirm New Password</label>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 pr-10 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-9 text-muted hover:text-primary">
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs mt-1 text-red-600">Passwords do not match</p>
            )}
          </div>
          <button
            onClick={handleUpdatePassword}
            disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}
            className="gradient-purple-soul text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Update Password
          </button>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-surface border border-default rounded-2xl p-6">
        <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
          <Monitor className="w-5 h-5 text-purple-600" />
          Active Sessions
        </h3>
        <p className="text-sm text-secondary mb-4">Devices currently signed in to your account</p>
        <div className="space-y-4">
          {sessions.map(session => (
            <div key={session.id} className="flex items-start justify-between p-4 bg-surface-elevated border border-default rounded-lg">
              <div className="flex gap-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Monitor className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-primary">{session.device}</p>
                    {session.isCurrent && (
                      <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">Current</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-secondary">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{session.location}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(session.lastActive).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              {!session.isCurrent && (
                <button
                  onClick={() => handleLogoutSession(session.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-surface border border-default rounded-2xl p-6">
        <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-600" />
          Account Activity Log
        </h3>
        <p className="text-sm text-secondary mb-4">Recent changes and login history</p>
        <div className="space-y-3">
          {mockActivity.map(activity => (
            <div key={activity.id} className="flex items-start gap-4 p-3 bg-surface-elevated rounded-lg">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex-shrink-0">
                <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-primary capitalize">{activity.type.replace(/_/g, ' ')}</p>
                <div className="flex items-center gap-4 text-sm text-secondary mt-1">
                  <span>{new Date(activity.date).toLocaleString()}</span>
                  <span>{activity.ip}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Tips */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-700 dark:text-amber-400 mb-3">Security Tips</h4>
            <ul className="space-y-1.5 text-sm text-amber-600 dark:text-amber-500">
              <li>• Enable two-factor authentication for extra security</li>
              <li>• Use a strong, unique password</li>
              <li>• Review active sessions regularly</li>
              <li>• Never share your password with anyone</li>
              <li>• Log out from devices you no longer use</li>
              <li>• Be cautious of phishing emails</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
