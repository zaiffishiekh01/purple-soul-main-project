import { useState, useEffect } from 'react';
import { Shield, Plus, Edit, Trash2, X, UserPlus, CheckCircle, XCircle, Crown, UserCog, BarChart3, Inbox, Clock, Check, Ban } from 'lucide-react';
import { useAdminManagement, AdminPermissions } from '../../hooks/useAdminPermissions';
import { useToast } from '../../components/Toast';
import { dashboardClient } from '../../lib/data-client';

interface AccessRequest {
  id: string;
  email: string;
  full_name: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  notes: string | null;
  created_at: string;
}

function useAccessRequests() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await dashboardClient
        .from('admin_access_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setRequests(data as AccessRequest[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const updateRequest = async (id: string, status: 'approved' | 'rejected', notes?: string) => {
    const { error } = await dashboardClient
      .from('admin_access_requests')
      .update({ status, notes: notes || '', reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    await fetchRequests();
  };

  return { requests, loading, refresh: fetchRequests, updateRequest };
}

const ROLES = [
  {
    value: 'super_admin',
    label: 'Super Admin',
    description: 'Complete platform control including admin management',
    icon: Crown,
    color: 'emerald',
    defaultPermissions: {
      vendor_management: true,
      order_management: true,
      product_management: true,
      finance_management: true,
      analytics_monitoring: true,
    },
  },
  {
    value: 'admin',
    label: 'Admin',
    description: 'Full e-commerce management: vendors, orders, products, finance, analytics',
    icon: UserCog,
    color: 'blue',
    defaultPermissions: {
      vendor_management: true,
      order_management: true,
      product_management: true,
      finance_management: true,
      analytics_monitoring: true,
    },
  },
  {
    value: 'management',
    label: 'Management',
    description: 'Oversight role: analytics and finance reporting access',
    icon: BarChart3,
    color: 'amber',
    defaultPermissions: {
      vendor_management: false,
      order_management: false,
      product_management: false,
      finance_management: true,
      analytics_monitoring: true,
    },
  },
];

const PERMISSION_LABELS: Record<string, string> = {
  vendor_management: 'Vendor Management',
  order_management: 'Order & Shipping Management',
  product_management: 'Product & Catalog Management',
  finance_management: 'Finance & Payouts',
  analytics_monitoring: 'Analytics & Monitoring',
};

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  admin: 'bg-blue-100 text-blue-700 border-blue-200',
  management: 'bg-amber-100 text-amber-700 border-amber-200',
  support: 'bg-gray-100 text-gray-700 border-gray-200',
};

interface CreateAdminModalProps {
  onClose: () => void;
  onCreate: (email: string, password: string, roleName: string, permissions: Partial<AdminPermissions>) => Promise<void>;
}

function CreateAdminModal({ onClose, onCreate }: CreateAdminModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [permissions, setPermissions] = useState({
    vendor_management: false,
    order_management: false,
    product_management: false,
    finance_management: false,
    analytics_monitoring: false,
  });
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (roleValue: string) => {
    setSelectedRole(roleValue);
    const role = ROLES.find(r => r.value === roleValue);
    if (role && roleValue !== 'super_admin') {
      setPermissions({ ...role.defaultPermissions });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onCreate(email, password, selectedRole, permissions);
      onClose();
      // Show success notification via parent
      if (typeof window !== 'undefined') {
        // The parent component's showNotification will be called
      }
    } catch (error: any) {
      alert(error.message || 'Failed to create admin. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedRoleInfo = ROLES.find(r => r.value === selectedRole);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-600" />
            Create New Admin
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                placeholder="Minimum 6 characters"
              />
              <p className="text-xs text-gray-500 mt-1">They will need to verify their email on first login</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Role *</label>
            <div className="grid grid-cols-1 gap-3">
              {ROLES.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.value;
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => handleRoleChange(role.value)}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all duration-150 ${
                      isSelected
                        ? role.value === 'super_admin'
                          ? 'border-emerald-500 bg-emerald-50'
                          : role.value === 'admin'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${
                      isSelected
                        ? role.value === 'super_admin'
                          ? 'bg-emerald-100'
                          : role.value === 'admin'
                          ? 'bg-blue-100'
                          : 'bg-amber-100'
                        : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        isSelected
                          ? role.value === 'super_admin'
                            ? 'text-emerald-600'
                            : role.value === 'admin'
                            ? 'text-blue-600'
                            : 'text-amber-600'
                          : 'text-gray-500'
                      }`} />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{role.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{role.description}</div>
                    </div>
                    {isSelected && (
                      <CheckCircle className={`w-5 h-5 ml-auto shrink-0 ${
                        role.value === 'super_admin'
                          ? 'text-emerald-500'
                          : role.value === 'admin'
                          ? 'text-blue-500'
                          : 'text-amber-500'
                      }`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedRole && selectedRole !== 'super_admin' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">Permissions</label>
                {selectedRoleInfo && (
                  <button
                    type="button"
                    onClick={() => setPermissions({ ...selectedRoleInfo.defaultPermissions })}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Reset to defaults
                  </button>
                )}
              </div>
              <div className="space-y-2 bg-gray-50 rounded-xl p-4">
                {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={permissions[key as keyof typeof permissions]}
                      onChange={(e) => setPermissions({ ...permissions, [key]: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {selectedRole === 'super_admin' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-sm text-emerald-800 font-medium">Super Admin has all permissions by default</p>
              <p className="text-xs text-emerald-600 mt-1">This includes admin management and full platform access.</p>
            </div>
          )}

          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedRole}
              className="flex-1 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditAdminModal({ admin, onClose, onUpdate, onSuccess }: any) {
  const [roleName, setRoleName] = useState(admin.role || 'admin');
  const [permissions, setPermissions] = useState(admin.permissions || {
    vendor_management: false,
    order_management: false,
    product_management: false,
    finance_management: false,
    analytics_monitoring: false,
  });
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (roleValue: string) => {
    setRoleName(roleValue);
    const role = ROLES.find(r => r.value === roleValue);
    if (role && roleValue !== 'super_admin') {
      setPermissions({ ...role.defaultPermissions });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdate(admin.id, roleName, permissions);
      onSuccess?.(admin.email || admin.user_id.substring(0, 8));
      onClose();
    } catch (error) {
      alert('Failed to update administrator. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedRoleInfo = ROLES.find(r => r.value === roleName);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900">Edit Admin Role & Permissions</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {admin.email && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={admin.email}
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Role</label>
            <div className="grid grid-cols-1 gap-2">
              {ROLES.map((role) => {
                const Icon = role.icon;
                const isSelected = roleName === role.value;
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => handleRoleChange(role.value)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all duration-150 ${
                      isSelected
                        ? role.value === 'super_admin'
                          ? 'border-emerald-500 bg-emerald-50'
                          : role.value === 'admin'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${
                      isSelected
                        ? role.value === 'super_admin'
                          ? 'text-emerald-600'
                          : role.value === 'admin'
                          ? 'text-blue-600'
                          : 'text-amber-600'
                        : 'text-gray-400'
                    }`} />
                    <div className="flex-1">
                      <span className="font-medium text-sm text-gray-900">{role.label}</span>
                      <span className="text-xs text-gray-500 ml-2">{role.description}</span>
                    </div>
                    {isSelected && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {roleName && roleName !== 'super_admin' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">Permissions</label>
                {selectedRoleInfo && (
                  <button
                    type="button"
                    onClick={() => setPermissions({ ...selectedRoleInfo.defaultPermissions })}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Reset to defaults
                  </button>
                )}
              </div>
              <div className="space-y-2 bg-gray-50 rounded-xl p-4">
                {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={permissions[key as keyof typeof permissions] || false}
                      onChange={(e) => setPermissions({ ...permissions, [key]: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AdminManagement() {
  const { admins, loading, createAdmin, updateAdminRole, deleteAdmin } = useAdminManagement();
  const { requests, loading: requestsLoading, updateRequest } = useAccessRequests();
  const { success, error: showError, warning } = useToast();
  const [activeTab, setActiveTab] = useState<'admins' | 'requests'>('admins');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<any>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  const pendingRequests = requests.filter(r => r.status === 'pending');

  const handleCreateAdmin = async (email: string, password: string, roleName: string, permissions: any) => {
    try {
      await createAdmin(email, password, roleName, permissions);
      success(`Administrator account created successfully for ${email}`, 'Admin Created');
      setShowCreateModal(false);
    } catch (error: any) {
      showError(error.message || 'Failed to create admin', 'Creation Failed');
      throw error;
    }
  };

  const handleDelete = async (admin: any) => {
    if (admin.is_super_admin) {
      warning('Super administrators cannot be deleted for security reasons', 'Action Blocked');
      return;
    }
    const displayName = admin.email || admin.user_id.substring(0, 8);
    if (!confirm(`Are you sure you want to delete administrator ${displayName}? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteAdmin(admin.id, admin.user_id);
      success('Administrator account has been successfully removed', 'Admin Deleted');
    } catch (error) {
      showError('Failed to delete administrator. Please try again.', 'Delete Failed');
    }
  };

  const handleApproveRequest = async (req: AccessRequest) => {
    try {
      await updateRequest(req.id, 'approved');
      success(`Request from ${req.email} marked as approved. Create their admin account above.`, 'Request Approved');
    } catch {
      showError('Failed to update request.', 'Approval Failed');
    }
  };

  const handleRejectRequest = async (id: string) => {
    try {
      await updateRequest(id, 'rejected', rejectNote);
      setRejectingId(null);
      setRejectNote('');
      success('Request has been rejected.', 'Request Rejected');
    } catch {
      showError('Failed to reject request.', 'Rejection Failed');
    }
  };

  const superAdminCount = admins.filter(a => a.is_super_admin || a.role === 'super_admin').length;
  const adminCount = admins.filter(a => !a.is_super_admin && a.role === 'admin').length;
  const managementCount = admins.filter(a => a.role === 'management').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-7 h-7 text-emerald-600" />
            Admin Management
          </h1>
          <p className="text-gray-500 mt-0.5 text-sm">Manage admin users and their platform access roles</p>
        </div>
        {activeTab === 'admins' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Admin
          </button>
        )}
      </div>

      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('admins')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'admins' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <UserCog className="w-4 h-4" />
          Admin Users
          <span className="bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded text-xs">{admins.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'requests' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Inbox className="w-4 h-4" />
          Access Requests
          {pendingRequests.length > 0 && (
            <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-xs font-semibold">{pendingRequests.length}</span>
          )}
        </button>
      </div>

      {activeTab === 'requests' ? (
        <div className="space-y-4">
          {requestsLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <Inbox className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-gray-500">No access requests yet</p>
              <p className="text-sm text-gray-400 mt-1">Requests submitted from the admin login page will appear here</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">Admin Access Requests ({requests.length})</h2>
                <p className="text-xs text-gray-500 mt-0.5">People who have requested admin access from the login page</p>
              </div>
              <div className="divide-y divide-gray-50">
                {requests.map((req) => (
                  <div key={req.id} className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 text-sm">{req.full_name || 'No name'}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                            req.status === 'pending' ? 'bg-amber-100 text-amber-700'
                            : req.status === 'approved' ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                          }`}>
                            {req.status === 'pending' && <Clock className="w-3 h-3" />}
                            {req.status === 'approved' && <Check className="w-3 h-3" />}
                            {req.status === 'rejected' && <Ban className="w-3 h-3" />}
                            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{req.email}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(req.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                        {req.reason && (
                          <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-2.5">
                            <span className="font-medium text-gray-600">Reason: </span>{req.reason}
                          </div>
                        )}
                        {req.notes && (
                          <div className="mt-1.5 text-xs text-slate-500 italic">Note: {req.notes}</div>
                        )}
                      </div>

                      {req.status === 'pending' && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleApproveRequest(req)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => setRejectingId(req.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>

                    {rejectingId === req.id && (
                      <div className="mt-3 bg-red-50 border border-red-100 rounded-xl p-3">
                        <label className="block text-xs font-medium text-red-800 mb-1.5">Rejection reason (optional)</label>
                        <textarea
                          value={rejectNote}
                          onChange={(e) => setRejectNote(e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-red-200 rounded-lg text-xs resize-none focus:outline-none focus:ring-1 focus:ring-red-400"
                          placeholder="Enter reason for rejection..."
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleRejectRequest(req.id)}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
                          >
                            Confirm Reject
                          </button>
                          <button
                            onClick={() => { setRejectingId(null); setRejectNote(''); }}
                            className="px-3 py-1.5 bg-white text-gray-600 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {req.status === 'approved' && (
                      <div className="mt-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                        Request approved. Create their admin account using the "Add Admin" button above and switch to the Admin Users tab.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
      <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Crown className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">Super Admins</span>
          </div>
          <div className="text-3xl font-bold text-emerald-900">{superAdminCount}</div>
          <p className="text-xs text-emerald-600 mt-1">Full platform control</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <UserCog className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Admins</span>
          </div>
          <div className="text-3xl font-bold text-blue-900">{adminCount}</div>
          <p className="text-xs text-blue-600 mt-1">E-commerce management</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-700">Management</span>
          </div>
          <div className="text-3xl font-bold text-amber-900">{managementCount}</div>
          <p className="text-xs text-amber-600 mt-1">Analytics & finance oversight</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Role Overview</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          {ROLES.map((role) => {
            const Icon = role.icon;
            return (
              <div key={role.value} className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Icon className={`w-4 h-4 ${
                    role.value === 'super_admin' ? 'text-emerald-600'
                    : role.value === 'admin' ? 'text-blue-600'
                    : 'text-amber-600'
                  }`} />
                  <span className="font-semibold text-sm text-gray-900">{role.label}</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">{role.description}</p>
                <div className="space-y-1.5">
                  {Object.entries(PERMISSION_LABELS).map(([key, label]) => {
                    const hasAccess = role.value === 'super_admin' || role.defaultPermissions[key as keyof typeof role.defaultPermissions];
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${hasAccess ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                        <span className={`text-xs ${hasAccess ? 'text-gray-700' : 'text-gray-400'}`}>{label}</span>
                      </div>
                    );
                  })}
                  {role.value === 'super_admin' && (
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-xs text-gray-700">Admin Management</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Admin Users ({admins.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Admin</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Permissions</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Created</th>
                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                        admin.is_super_admin || admin.role === 'super_admin'
                          ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                          : admin.role === 'management'
                          ? 'bg-gradient-to-br from-amber-500 to-amber-600'
                          : 'bg-gradient-to-br from-blue-500 to-blue-600'
                      }`}>
                        {(admin.email || admin.user_id).substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-sm text-gray-900">
                          {admin.email || `${admin.user_id.substring(0, 8)}...`}
                        </div>
                        <div className="text-xs text-gray-400">{admin.user_id.substring(0, 12)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${
                      ROLE_COLORS[admin.role] || ROLE_COLORS.support
                    }`}>
                      {admin.role === 'super_admin' ? 'Super Admin'
                        : admin.role === 'management' ? 'Management'
                        : admin.role === 'admin' ? 'Admin'
                        : admin.role || 'No Role'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {admin.is_super_admin || admin.role === 'super_admin' ? (
                      <span className="text-xs text-emerald-600 font-medium">All Permissions</span>
                    ) : admin.permissions ? (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(admin.permissions)
                          .filter(([key, value]) => key !== 'is_super_admin' && value === true)
                          .map(([key]) => (
                            <span key={key} className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-xs text-gray-600">
                              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          ))}
                        {Object.values(admin.permissions).filter(v => v === true && v !== admin.permissions?.is_super_admin).length === 0 && (
                          <span className="text-xs text-gray-400">None assigned</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">None</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-500">
                      {new Date(admin.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1">
                      {!(admin.is_super_admin || admin.role === 'super_admin') && (
                        <>
                          <button
                            onClick={() => setEditingAdmin(admin)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-500"
                            title="Edit Role & Permissions"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(admin)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500"
                            title="Delete Admin"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {admins.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No admins found</p>
              <p className="text-sm mt-1">Create your first admin to get started</p>
            </div>
          )}
        </div>
      </div>
      </>
      )}

      {showCreateModal && (
        <CreateAdminModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateAdmin}
        />
      )}

      {editingAdmin && (
        <EditAdminModal
          admin={editingAdmin}
          onClose={() => setEditingAdmin(null)}
          onUpdate={updateAdminRole}
          onSuccess={(name: string) => success(`Administrator ${name} updated successfully`, 'Admin Updated')}
        />
      )}
    </div>
  );
}
