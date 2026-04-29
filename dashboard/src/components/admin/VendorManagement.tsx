import { useState } from 'react';
import { Users, Search, Check, X, Eye, Trash2, Mail, Phone, MapPin, Calendar, Clock, FileText, Zap } from 'lucide-react';
import { useAdminVendors } from '../../hooks/useAdminVendors';
import { useToast } from '../../components/Toast';
import { AdminFeeWaiverRequests } from './AdminFeeWaiverRequests';
import { Vendor } from '../../types';

export function VendorManagement() {
  const { vendors, loading, updateVendorStatus, approveVendor, rejectVendor, deleteVendor } = useAdminVendors();
  const { success, error: showError, warning } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [activeTab, setActiveTab] = useState<'vendors' | 'fee-waivers'>('vendors');

  const getStatusConfig = (status: string) => {
    const configs = {
      active: { color: 'bg-green-100 text-green-700 border-green-200', label: 'Active', icon: Check },
      pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Pending', icon: Clock },
      suspended: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Suspended', icon: X },
      inactive: { color: 'bg-gray-100 text-gray-700 border-gray-200', label: 'Inactive', icon: X },
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch =
      vendor.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.contact_email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (vendorId: string, newStatus: string) => {
    try {
      await updateVendorStatus(vendorId, newStatus);
      success(`Vendor status changed to ${newStatus}`, 'Status Updated');
    } catch (error) {
      showError('Failed to update vendor status', 'Update Failed');
    }
  };

  const handleApprove = async (vendorId: string) => {
    try {
      await approveVendor(vendorId);
      success('Vendor has been approved successfully', 'Vendor Approved');
    } catch (error) {
      showError('Failed to approve vendor', 'Approval Failed');
    }
  };

  const handleReject = async (vendorId: string) => {
    if (!confirm('Are you sure you want to reject this vendor?')) {
      return;
    }

    try {
      await rejectVendor(vendorId);
      success('Vendor has been rejected', 'Vendor Rejected');
    } catch (error) {
      showError('Failed to reject vendor', 'Rejection Failed');
    }
  };

  const handleDelete = async (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId);
    const vendorName = vendor?.business_name || 'This vendor';
    
    if (!confirm(`Are you sure you want to delete "${vendorName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteVendor(vendorId);
      success('Vendor has been permanently deleted', 'Vendor Deleted');
    } catch (error) {
      showError('Failed to delete vendor. The vendor may have associated records.', 'Delete Failed');
    }
  };

  const formatAddress = (address: Record<string, unknown>) => {
    if (typeof address === 'string') return address;
    const addr = address as any;
    return `${addr?.street || ''}, ${addr?.city || ''}, ${addr?.state || ''} ${addr?.zip || ''}`.trim();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Vendor Management
          </h1>
          <p className="text-gray-600 mt-1">Manage all vendors on the platform</p>
        </div>
        <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600">Total Vendors</div>
          <div className="text-2xl font-bold text-gray-900">{vendors.length}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('vendors')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
              activeTab === 'vendors'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-5 h-5" />
            Vendors
          </button>
          <button
            onClick={() => setActiveTab('fee-waivers')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
              activeTab === 'fee-waivers'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-5 h-5" />
            Fee Waiver Requests
          </button>
        </div>
      </div>

      {activeTab === 'fee-waivers' ? (
        <AdminFeeWaiverRequests />
      ) : (
        <>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Business Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Auto-Approve</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Joined</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.map((vendor) => {
                const statusConfig = getStatusConfig(vendor.status);
                return (
                  <tr key={vendor.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">{vendor.business_name}</div>
                      <div className="text-sm text-gray-600">{vendor.tax_id}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Mail className="w-4 h-4" />
                        {vendor.contact_email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        {vendor.contact_phone}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-700">{vendor.business_type}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {(vendor as any).auto_approve_products ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                          <Zap className="w-3 h-3" /> Auto
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Manual</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {new Date(vendor.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedVendor(vendor)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!vendor.is_approved && vendor.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(vendor.id)}
                              className="p-2 hover:bg-green-50 rounded-lg transition-colors text-green-600"
                              title="Approve Vendor"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(vendor.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                              title="Reject Vendor"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {vendor.is_approved && (
                          <select
                            value={vendor.status}
                            onChange={(e) => handleStatusChange(vendor.id, e.target.value)}
                            className="px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        )}
                        <button
                          onClick={() => handleDelete(vendor.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredVendors.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No vendors found matching your criteria
            </div>
          )}
        </div>
      </div>

      {selectedVendor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Vendor Details</h2>
              <button
                onClick={() => setSelectedVendor(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Business Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Business Name:</span>
                    <span className="font-medium text-gray-900">{selectedVendor.business_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Business Type:</span>
                    <span className="font-medium text-gray-900">{selectedVendor.business_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax ID:</span>
                    <span className="font-medium text-gray-900">{selectedVendor.tax_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusConfig(selectedVendor.status).color}`}>
                      {getStatusConfig(selectedVendor.status).label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-gray-600">Email</div>
                      <div className="font-medium text-gray-900">{selectedVendor.contact_email}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-gray-600">Phone</div>
                      <div className="font-medium text-gray-900">{selectedVendor.contact_phone}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-gray-600">Address</div>
                      <div className="font-medium text-gray-900">{formatAddress(selectedVendor.address)}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Customer Data Access Permissions</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    Control what customer information this vendor can see in shipping labels.
                    By default, vendors only see customer name and address. Enable these based on trust level.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-600" />
                        Customer Phone Numbers
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Allow vendor to see customer phone in orders/labels</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedVendor.can_view_customer_phone || false}
                        onChange={async (e) => {
                          try {
                            await updateVendorStatus(selectedVendor.id, selectedVendor.status, {
                              can_view_customer_phone: e.target.checked
                            });
                            setSelectedVendor({ ...selectedVendor, can_view_customer_phone: e.target.checked });
                          } catch (error) {
                            console.error('Failed to update permission:', error);
                          }
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-600" />
                        Customer Email Addresses
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Allow vendor to see customer email in orders/labels</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedVendor.can_view_customer_email || false}
                        onChange={async (e) => {
                          try {
                            await updateVendorStatus(selectedVendor.id, selectedVendor.status, {
                              can_view_customer_email: e.target.checked
                            });
                            setSelectedVendor({ ...selectedVendor, can_view_customer_email: e.target.checked });
                          } catch (error) {
                            console.error('Failed to update permission:', error);
                          }
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Product Upload Settings
                </h3>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                  <p className="text-sm text-amber-800">
                    When auto-approve is enabled, products uploaded by this vendor will be automatically approved and made public without manual review.
                  </p>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      Auto-Approve Products
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Automatically approve this vendor's new product uploads</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(selectedVendor as any).auto_approve_products || false}
                      onChange={async (e) => {
                        try {
                          await updateVendorStatus(selectedVendor.id, selectedVendor.status, {
                            auto_approve_products: e.target.checked
                          } as any);
                          setSelectedVendor({ ...selectedVendor, auto_approve_products: e.target.checked } as any);
                        } catch (error) {
                          console.error('Failed to update auto-approve setting:', error);
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Account Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Approval Status:</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                      selectedVendor.is_approved
                        ? 'bg-green-100 text-green-700 border-green-200'
                        : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                    }`}>
                      {selectedVendor.is_approved ? 'Approved' : 'Pending Approval'}
                    </span>
                  </div>
                  {selectedVendor.is_approved && selectedVendor.approved_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Approved On:</span>
                      <span className="font-medium text-gray-900">{new Date(selectedVendor.approved_at).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Joined:</span>
                    <span className="font-medium text-gray-900">{new Date(selectedVendor.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-medium text-gray-900">{new Date(selectedVendor.updated_at).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vendor ID:</span>
                    <span className="font-mono text-xs text-gray-600">{selectedVendor.id}</span>
                  </div>
                </div>
              </div>

              {!selectedVendor.is_approved && selectedVendor.status === 'pending' && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        handleApprove(selectedVendor.id);
                        setSelectedVendor(null);
                      }}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-medium flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      Approve Vendor
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedVendor.id);
                        setSelectedVendor(null);
                      }}
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-medium flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      Reject Vendor
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
