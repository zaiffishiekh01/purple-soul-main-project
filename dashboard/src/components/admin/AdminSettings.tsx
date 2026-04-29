import { useState, useEffect, useCallback } from 'react';
import { Settings, User, Lock, Bell, Shield, Truck, RotateCcw, Edit2, Trash2, Save, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useShippingPrograms } from '../../hooks/useShippingPrograms';
import { useReturnRules } from '../../hooks/useReturnRules';

interface AdminProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_super_admin: boolean;
}

interface NotificationPreferences {
  new_vendors: boolean;
  order_issues: boolean;
  system_updates: boolean;
  support_tickets: boolean;
}

interface PlatformSettings {
  commission_rate: string;
  minimum_payout: string;
  auto_approve_vendors: boolean;
}

type TabId = 'profile' | 'security' | 'notifications' | 'platform' | 'shipping' | 'returns';
type Message = { type: 'success' | 'error'; text: string };

export function AdminSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [message, setMessage] = useState<Message | null>(null);
  const [saving, setSaving] = useState(false);

  // Profile state
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [profileName, setProfileName] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    new_vendors: true,
    order_issues: true,
    system_updates: true,
    support_tickets: true,
  });
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  // Platform settings state
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    commission_rate: '15',
    minimum_payout: '50',
    auto_approve_vendors: false,
  });
  const [platformLoading, setPlatformLoading] = useState(true);

  // Shipping & Returns
  const { programs, loading: programsLoading, updateProgram, deleteProgram } = useShippingPrograms();
  const { rules, loading: rulesLoading, updateRule, deleteRule } = useReturnRules();
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});

  // Show message helper
  const showMessage = useCallback((type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  }, []);

  // =============================================
  // PROFILE TAB
  // =============================================
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      const { data: admin } = await supabase
        .from('admin_users')
        .select('id, full_name, role, is_super_admin')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (admin) {
        setProfile({
          id: admin.id,
          full_name: admin.full_name || '',
          email: user?.email || '',
          role: admin.role,
          is_super_admin: admin.is_super_admin || false,
        });
        setProfileName(admin.full_name || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!profile?.id) return;
    
    try {
      setSaving(true);
      
      // Update admin_users
      const { error } = await supabase
        .from('admin_users')
        .update({ full_name: profileName.trim() })
        .eq('id', profile.id);

      if (error) throw error;

      // Also update Supabase user metadata
      const { error: userError } = await supabase.auth.updateUser({
        data: { full_name: profileName.trim() }
      });

      if (userError) console.warn('Could not update user metadata:', userError);

      showMessage('success', 'Profile updated successfully!');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      showMessage('error', 'Failed to save profile: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  // =============================================
  // SECURITY TAB
  // =============================================
  const updatePassword = async () => {
    setPasswordError('');

    if (!newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      showMessage('success', 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error updating password:', error);
      setPasswordError('Failed to update password: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  // =============================================
  // NOTIFICATIONS TAB
  // =============================================
  useEffect(() => {
    if (activeTab === 'notifications') {
      fetchNotificationPreferences();
    }
  }, [activeTab]);

  const fetchNotificationPreferences = async () => {
    try {
      setNotificationsLoading(true);
      const { data: admin } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (!admin) return;

      const { data, error } = await supabase
        .from('admin_preferences')
        .select('preference_key, preference_value')
        .eq('admin_id', admin.id)
        .eq('preference_key', 'notifications');

      if (error) throw error;

      if (data && data.length > 0) {
        setNotifications(data[0].preference_value as unknown as NotificationPreferences);
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const saveNotificationPreferences = async (prefs: NotificationPreferences) => {
    try {
      setNotificationsLoading(true);
      const { data: admin } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (!admin) return;

      // Upsert notification preferences
      const { error } = await supabase
        .from('admin_preferences')
        .upsert({
          admin_id: admin.id,
          preference_key: 'notifications',
          preference_value: prefs as any,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'admin_id,preference_key'
        });

      if (error) throw error;
      showMessage('success', 'Notification preferences saved!');
    } catch (error: any) {
      console.error('Error saving notification preferences:', error);
      showMessage('error', 'Failed to save preferences: ' + (error.message || 'Unknown error'));
    } finally {
      setNotificationsLoading(false);
    }
  };

  // =============================================
  // PLATFORM TAB
  // =============================================
  useEffect(() => {
    if (activeTab === 'platform') {
      fetchPlatformSettings();
    }
  }, [activeTab]);

  const fetchPlatformSettings = async () => {
    try {
      setPlatformLoading(true);
      const { data, error } = await supabase
        .from('platform_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['platform_commission_rate', 'minimum_payout_amount', 'auto_approve_vendors']);

      if (error) throw error;

      const settings: any = {};
      data?.forEach(row => {
        settings[row.setting_key] = row.setting_value;
      });

      setPlatformSettings({
        commission_rate: settings.platform_commission_rate || '15',
        minimum_payout: settings.minimum_payout_amount || '50',
        auto_approve_vendors: settings.auto_approve_vendors === 'true',
      });
    } catch (error) {
      console.error('Error fetching platform settings:', error);
    } finally {
      setPlatformLoading(false);
    }
  };

  const savePlatformSetting = async (key: string, value: string) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('platform_settings')
        .upsert({
          setting_key: key,
          setting_value: value,
          updated_at: new Date().toISOString(),
          updated_by: user?.id,
        }, {
          onConflict: 'setting_key'
        });

      if (error) throw error;
      showMessage('success', `${key.replace(/_/g, ' ')} updated successfully!`);
    } catch (error: any) {
      console.error('Error saving platform setting:', error);
      showMessage('error', 'Failed to save setting: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  // =============================================
  // SHIPPING & RETURNS (existing logic)
  // =============================================
  const startEditingProgram = (program: any) => {
    setEditingProgramId(program.id);
    setEditFormData({
      name: program.name,
      carrier: program.carrier,
      max_weight_kg: program.max_weight_kg,
      base_rate_usd: program.base_rate_usd,
      vendor_rate_usd: program.vendor_rate_usd,
      supports_returns: program.supports_returns,
    });
  };

  const saveProgram = async () => {
    try {
      await updateProgram(editingProgramId!, {
        ...editFormData,
        markup_usd: editFormData.vendor_rate_usd - editFormData.base_rate_usd,
      });
      setEditingProgramId(null);
      setEditFormData({});
      showMessage('success', 'Shipping program updated successfully!');
    } catch (error) {
      showMessage('error', 'Unable to update shipping program. Please try again.');
    }
  };

  const handleDeleteProgram = async (id: string) => {
    if (confirm('Are you sure you want to delete this shipping program?')) {
      try {
        await deleteProgram(id);
        showMessage('success', 'Shipping program deleted successfully!');
      } catch (error) {
        showMessage('error', 'Unable to delete shipping program. Please try again.');
      }
    }
  };

  const startEditingRule = (rule: any) => {
    setEditingRuleId(rule.id);
    setEditFormData({
      return_window_days: rule.return_window_days,
      return_shipping_paid_by: rule.return_shipping_paid_by,
    });
  };

  const saveRule = async () => {
    try {
      await updateRule(editingRuleId!, editFormData);
      setEditingRuleId(null);
      setEditFormData({});
      showMessage('success', 'Return rule updated successfully!');
    } catch (error) {
      showMessage('error', 'Unable to update return rule. Please try again.');
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (confirm('Are you sure you want to delete this return rule?')) {
      try {
        await deleteRule(id);
        showMessage('success', 'Return rule deleted successfully!');
      } catch (error) {
        showMessage('error', 'Unable to delete return rule. Please try again.');
      }
    }
  };

  // =============================================
  // TABS CONFIG
  // =============================================
  const tabs: { id: TabId; label: string; icon: any }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'platform', label: 'Set Platform Fee', icon: Shield },
    { id: 'shipping', label: 'Shipping & Logistics', icon: Truck },
    { id: 'returns', label: 'Returns & Disputes', icon: RotateCcw },
  ];

  // =============================================
  // MESSAGE COMPONENT
  // =============================================
  const MessageBanner = () => {
    if (!message) return null;
    return (
      <div className={`p-4 rounded-lg flex items-center gap-3 ${
        message.type === 'success'
          ? 'bg-green-50 border border-green-200 text-green-800'
          : 'bg-red-50 border border-red-200 text-red-800'
      }`}>
        {message.type === 'success' ? (
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
        )}
        <span className="text-sm font-medium">{message.text}</span>
      </div>
    );
  };

  // =============================================
  // RENDER
  // =============================================
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Settings className="w-8 h-8 text-emerald-600" />
          Admin Settings
        </h1>
        <p className="text-gray-600 mt-1">Manage your account and platform settings</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-emerald-600 text-emerald-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          <MessageBanner />

          {/* ==================== PROFILE TAB ==================== */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>

              {profileLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      value={profile?.is_super_admin ? 'Super Administrator' : 'Platform Administrator'}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>

                  <button
                    onClick={saveProfile}
                    disabled={saving || !profileName.trim()}
                    className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ==================== SECURITY TAB ==================== */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Security Settings</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordError('');
                    }}
                    placeholder="Enter new password (min 6 characters)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordError('');
                    }}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {passwordError && (
                  <div className="text-red-600 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {passwordError}
                  </div>
                )}

                <button
                  onClick={updatePassword}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          )}

          {/* ==================== NOTIFICATIONS TAB ==================== */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Notification Preferences</h2>

              {notificationsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                </div>
              ) : (
                <div className="space-y-4">
                  {[
                    { key: 'new_vendors' as const, label: 'New Vendor Registrations', desc: 'Get notified when new vendors sign up' },
                    { key: 'order_issues' as const, label: 'Order Issues', desc: 'Alerts for orders requiring attention' },
                    { key: 'system_updates' as const, label: 'System Updates', desc: 'Important platform updates and maintenance' },
                    { key: 'support_tickets' as const, label: 'Support Tickets', desc: 'New and urgent support requests' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{label}</div>
                        <div className="text-sm text-gray-600">{desc}</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications[key]}
                          onChange={(e) => {
                            const newPrefs = { ...notifications, [key]: e.target.checked };
                            setNotifications(newPrefs);
                            saveNotificationPreferences(newPrefs);
                          }}
                          disabled={notificationsLoading}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================== PLATFORM TAB ==================== */}
          {activeTab === 'platform' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Set Platform Fee</h2>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>How it works:</strong> The commission rate is automatically added to vendor prices.
                  For example, if a vendor sets a price of $100 and the commission is 15%, customers will see $115
                  as the final price. The vendor receives $100 and the platform earns $15.
                </p>
              </div>

              {platformLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Platform Commission Rate (%)
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        value={platformSettings.commission_rate}
                        onChange={(e) => setPlatformSettings(prev => ({ ...prev, commission_rate: e.target.value }))}
                        onBlur={() => savePlatformSetting('platform_commission_rate', platformSettings.commission_rate)}
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="15"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => savePlatformSetting('platform_commission_rate', platformSettings.commission_rate)}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-400"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      This percentage is added to vendor prices. Applies to all new products uploaded.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Payout Amount ($)
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        value={platformSettings.minimum_payout}
                        onChange={(e) => setPlatformSettings(prev => ({ ...prev, minimum_payout: e.target.value }))}
                        onBlur={() => savePlatformSetting('minimum_payout_amount', platformSettings.minimum_payout)}
                        min="0"
                        step="10"
                        placeholder="50"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => savePlatformSetting('minimum_payout_amount', platformSettings.minimum_payout)}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-400"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Minimum balance required for vendor payouts</p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Automatic Vendor Approval</div>
                      <div className="text-sm text-gray-600">Automatically approve new vendor registrations without manual review</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={platformSettings.auto_approve_vendors}
                        onChange={async (e) => {
                          const newValue = e.target.checked;
                          setPlatformSettings(prev => ({ ...prev, auto_approve_vendors: newValue }));
                          await savePlatformSetting('auto_approve_vendors', newValue.toString());
                        }}
                        disabled={saving}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== SHIPPING TAB ==================== */}
          {activeTab === 'shipping' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Shipping & Logistics</h2>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Edit Programs:</strong> Click the edit icon to modify shipping program details.
                  Changes are saved to the database and will be reflected across the platform immediately.
                </p>
              </div>

              {programsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carrier</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Weight</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Returns</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {programs.map((program) => (
                        <tr key={program.id} className="hover:bg-gray-50">
                          {editingProgramId === program.id ? (
                            <>
                              <td className="px-6 py-4"><input type="text" value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" /></td>
                              <td className="px-6 py-4"><input type="text" value={editFormData.carrier} onChange={(e) => setEditFormData({ ...editFormData, carrier: e.target.value })} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" /></td>
                              <td className="px-6 py-4"><input type="number" value={editFormData.max_weight_kg} onChange={(e) => setEditFormData({ ...editFormData, max_weight_kg: parseFloat(e.target.value) })} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" /></td>
                              <td className="px-6 py-4"><input type="number" step="0.01" value={editFormData.base_rate_usd} onChange={(e) => setEditFormData({ ...editFormData, base_rate_usd: parseFloat(e.target.value) })} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" /></td>
                              <td className="px-6 py-4"><input type="number" step="0.01" value={editFormData.vendor_rate_usd} onChange={(e) => setEditFormData({ ...editFormData, vendor_rate_usd: parseFloat(e.target.value) })} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" /></td>
                              <td className="px-6 py-4">
                                <select value={editFormData.supports_returns ? 'true' : 'false'} onChange={(e) => setEditFormData({ ...editFormData, supports_returns: e.target.value === 'true' })} className="w-full px-2 py-1 border border-gray-300 rounded text-sm">
                                  <option value="true">Yes</option>
                                  <option value="false">No</option>
                                </select>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <button onClick={saveProgram} className="text-emerald-600 hover:text-emerald-700"><Save className="w-4 h-4" /></button>
                                  <button onClick={() => { setEditingProgramId(null); setEditFormData({}); }} className="text-gray-600 hover:text-gray-700"><X className="w-4 h-4" /></button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-6 py-4"><div className="text-sm font-medium text-gray-900">{program.name}</div></td>
                              <td className="px-6 py-4"><div className="text-sm text-gray-900">{program.carrier}</div></td>
                              <td className="px-6 py-4"><div className="text-sm text-gray-900">{program.max_weight_kg} kg</div></td>
                              <td className="px-6 py-4"><div className="text-sm text-gray-900">${program.base_rate_usd.toFixed(2)}</div></td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">${program.vendor_rate_usd.toFixed(2)}</div>
                                <div className="text-xs text-gray-500">+${program.markup_usd.toFixed(2)} markup</div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${program.supports_returns ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                  {program.supports_returns ? 'Yes' : 'No'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <button onClick={() => startEditingProgram(program)} className="text-blue-600 hover:text-blue-700"><Edit2 className="w-4 h-4" /></button>
                                  <button onClick={() => handleDeleteProgram(program.id)} className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ==================== RETURNS TAB ==================== */}
          {activeTab === 'returns' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Returns & Disputes</h2>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Edit Rules:</strong> Click the edit icon to modify return window days or who pays for return shipping.
                  Rules cascade from specific (category) to general (global), giving you fine-grained control over return policies.
                </p>
              </div>

              {rulesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scope</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Window</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shipping Paid By</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rules.map((rule) => (
                        <tr key={rule.id} className="hover:bg-gray-50">
                          {editingRuleId === rule.id ? (
                            <>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${rule.scope === 'GLOBAL' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>{rule.scope}</span>
                              </td>
                              <td className="px-6 py-4"><div className="text-sm text-gray-900">{rule.category || 'All Categories'}</div></td>
                              <td className="px-6 py-4"><input type="number" value={editFormData.return_window_days} onChange={(e) => setEditFormData({ ...editFormData, return_window_days: parseInt(e.target.value) })} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" /></td>
                              <td className="px-6 py-4">
                                <select value={editFormData.return_shipping_paid_by} onChange={(e) => setEditFormData({ ...editFormData, return_shipping_paid_by: e.target.value })} className="w-full px-2 py-1 border border-gray-300 rounded text-sm">
                                  <option value="MARKETPLACE">MARKETPLACE</option>
                                  <option value="VENDOR">VENDOR</option>
                                  <option value="CUSTOMER">CUSTOMER</option>
                                </select>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <button onClick={saveRule} className="text-emerald-600 hover:text-emerald-700"><Save className="w-4 h-4" /></button>
                                  <button onClick={() => { setEditingRuleId(null); setEditFormData({}); }} className="text-gray-600 hover:text-gray-700"><X className="w-4 h-4" /></button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${rule.scope === 'GLOBAL' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>{rule.scope}</span>
                              </td>
                              <td className="px-6 py-4"><div className="text-sm text-gray-900">{rule.category || 'All Categories'}</div></td>
                              <td className="px-6 py-4"><div className="text-sm text-gray-900">{rule.return_window_days} days</div></td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${rule.return_shipping_paid_by === 'MARKETPLACE' ? 'bg-emerald-100 text-emerald-800' : rule.return_shipping_paid_by === 'VENDOR' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}>{rule.return_shipping_paid_by}</span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <button onClick={() => startEditingRule(rule)} className="text-blue-600 hover:text-blue-700"><Edit2 className="w-4 h-4" /></button>
                                  <button onClick={() => handleDeleteRule(rule.id)} className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
