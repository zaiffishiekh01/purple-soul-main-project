import { useState, useEffect } from 'react';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import { User, Mail, Phone, Bell, Shield, Globe, Truck, Languages, Save, Loader2, Check, AlertCircle } from 'lucide-react';

interface ProfilePageProps {
  onBack?: () => void;
}

export default function ProfilePage({ onBack }: ProfilePageProps) {
  const { profile, updateProfile } = useCustomerAuth();
  const [activeTab, setActiveTab] = useState('identity');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Identity
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [promoEmails, setPromoEmails] = useState(true);

  // Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Preferences
  const [language, setLanguage] = useState('en');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [currency, setCurrency] = useState('usd');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      await updateProfile({
        full_name: fullName,
        phone,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'identity', label: 'Identity', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Globe },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-surface border border-default rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-primary mb-2">Profile Settings</h2>
        <p className="text-secondary">Manage your personal information</p>
      </div>

      {/* Messages */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-700 dark:text-green-400 font-medium">Profile updated successfully!</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-default overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSuccess(false); setError(null); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.id
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Identity Tab */}
      {activeTab === 'identity' && (
        <div className="bg-surface border border-default rounded-2xl p-6">
          <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-purple-600" />
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
                <span className="ml-2 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-full">Required</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
                <span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">Verified</span>
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-3 border border-default rounded-xl bg-surface-deep text-secondary cursor-not-allowed"
              />
              <p className="text-xs text-muted mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
                <span className="ml-2 px-2 py-0.5 bg-surface-elevated text-secondary text-xs rounded-full">Optional</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-6 gradient-purple-soul text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-surface border border-default rounded-2xl p-6">
          <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-600" />
            Notification Preferences
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Email Notifications', desc: 'Receive order updates and promotions', checked: emailNotifications, onChange: setEmailNotifications },
              { label: 'SMS Notifications', desc: 'Get delivery updates via text', checked: smsNotifications, onChange: setSmsNotifications },
              { label: 'Promotional Emails', desc: 'Receive special offers and new arrivals', checked: promoEmails, onChange: setPromoEmails },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-surface-elevated border border-default rounded-xl">
                <div>
                  <p className="font-medium text-primary">{item.label}</p>
                  <p className="text-sm text-secondary">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={item.checked} onChange={(e) => item.onChange(e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                </label>
              </div>
            ))}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-6 gradient-purple-soul text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Preferences
          </button>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-surface border border-default rounded-2xl p-6">
          <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            Password & Security
          </h3>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">Current Password</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-6 gradient-purple-soul text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Update Password
          </button>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="bg-surface border border-default rounded-2xl p-6">
          <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-600" />
            App Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2 flex items-center gap-2"><Globe className="w-4 h-4" />Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full px-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="en">English</option>
                <option value="ar">Arabic</option>
                <option value="es">Spanish</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-2 flex items-center gap-2"><Truck className="w-4 h-4" />Default Shipping</label>
              <select value={shippingMethod} onChange={(e) => setShippingMethod(e.target.value)} className="w-full px-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="standard">Standard Shipping</option>
                <option value="express">Express Shipping</option>
                <option value="overnight">Overnight</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-2 flex items-center gap-2"><Languages className="w-4 h-4" />Currency</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full px-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="usd">USD ($)</option>
                <option value="eur">EUR (€)</option>
                <option value="gbp">GBP (£)</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-6 gradient-purple-soul text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Preferences
          </button>
        </div>
      )}
    </div>
  );
}
