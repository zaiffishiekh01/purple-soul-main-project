import { useState } from 'react';
import { Beaker, Plus, CreditCard as Edit, Send, X, CheckCircle, XCircle, Users, Paperclip } from 'lucide-react';
import { useAdminPermissions } from '../../hooks/useAdminPermissions';
import { useTestProductOffers, useTestProductOfferVendorApplications, useTestProductOfferMessages } from '../../hooks/useTestProductOffers';
import { supabase } from '../../lib/supabase';
import { TestProductOffer, TestProductOfferVendor } from '../../types';

export function AdminTestProductOffers() {
  const { isAdmin, permissions, loading: permissionsLoading } = useAdminPermissions();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<TestProductOffer | null>(null);
  const [showOfferDetail, setShowOfferDetail] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { offers, loading, refetch } = useTestProductOffers();

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const hasAccess = isAdmin && (permissions.is_super_admin || permissions.product_management);

  if (permissionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Access Denied</p>
          <p className="text-gray-600 mt-2">You need product management permissions to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Beaker className="w-8 h-8 text-emerald-600" />
            Test New Product Offers
          </h1>
          <p className="text-gray-600 mt-1">
            Manage test product opportunities and vendor collaboration (no purchase orders)
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Test Offer
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      ) : offers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Beaker className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Test Offers Yet</h3>
          <p className="text-gray-600 mb-4">Create your first test product offer to start collaborating with vendors.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create First Offer
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Title</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Categories</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Test Batch</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Applications</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer) => (
                  <OfferRow
                    key={offer.id}
                    offer={offer}
                    onViewDetails={() => {
                      setSelectedOffer(offer);
                      setShowOfferDetail(true);
                    }}
                    onEdit={() => {
                      setSelectedOffer(offer);
                      setShowCreateModal(true);
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${
            notification.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            )}
            <p className={`text-sm font-medium ${
              notification.type === 'success' ? 'text-emerald-800' : 'text-red-800'
            }`}>
              {notification.message}
            </p>
            <button
              onClick={() => setNotification(null)}
              className={`ml-2 p-1 rounded hover:bg-white/50 transition-colors ${
                notification.type === 'success' ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {showCreateModal && (
        <CreateOfferModal
          offer={selectedOffer}
          onClose={(success?: boolean, isUpdate?: boolean) => {
            setShowCreateModal(false);
            setSelectedOffer(null);
            refetch();
            if (success) {
              showNotification('success', isUpdate
                ? 'The test product offer has been successfully updated.'
                : 'The test product offer has been successfully created and is now available to eligible vendors.'
              );
            }
          }}
        />
      )}

      {showOfferDetail && selectedOffer && (
        <OfferDetailModal
          offer={selectedOffer}
          onClose={() => {
            setShowOfferDetail(false);
            setSelectedOffer(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}

function OfferRow({
  offer,
  onViewDetails,
  onEdit,
}: {
  offer: TestProductOffer;
  onViewDetails: () => void;
  onEdit: () => void;
}) {
  const [applicationsCount, setApplicationsCount] = useState(0);

  useState(() => {
    const fetchCount = async () => {
      const { count } = await supabase
        .from('test_product_offer_vendors')
        .select('*', { count: 'exact', head: true })
        .eq('offer_id', offer.id);
      setApplicationsCount(count || 0);
    };
    fetchCount();
  });

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="py-4 px-4">
        <div className="font-medium text-gray-900">{offer.title}</div>
        {offer.is_targeted_offer && (
          <div className="text-xs text-orange-600 mt-1">
            Targeted to: {offer.target_vendor_categories.slice(0, 2).join(', ')}
            {offer.target_vendor_categories.length > 2 && ` +${offer.target_vendor_categories.length - 2}`}
          </div>
        )}
      </td>
      <td className="py-4 px-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          offer.status === 'DRAFT' ? 'bg-gray-100 text-gray-700' :
          offer.status === 'VENDOR_REQUESTED' ? 'bg-orange-100 text-orange-700' :
          offer.status === 'OPEN_FOR_VENDORS' ? 'bg-green-100 text-green-700' :
          offer.status === 'UNDER_REVIEW' ? 'bg-yellow-100 text-yellow-700' :
          offer.status === 'APPROVED_VENDOR_SELECTED' ? 'bg-blue-100 text-blue-700' :
          offer.status === 'TEST_IN_PROGRESS' ? 'bg-purple-100 text-purple-700' :
          offer.status === 'TEST_COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
          'bg-red-100 text-red-700'
        }`}>
          {offer.status === 'VENDOR_REQUESTED' ? 'Vendor Request' : offer.status.replace(/_/g, ' ')}
        </span>
        {offer.vendor_requested && (offer as any).requester_vendor && (
          <div className="text-xs text-gray-600 mt-1">
            By: {(offer as any).requester_vendor.business_name}
          </div>
        )}
      </td>
      <td className="py-4 px-4">
        <div className="flex flex-wrap gap-1">
          {offer.categories.slice(0, 2).map((cat, idx) => (
            <span key={idx} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full">
              {cat}
            </span>
          ))}
          {offer.categories.length > 2 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{offer.categories.length - 2}
            </span>
          )}
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="text-sm text-gray-600">
          {offer.test_batch_size ? `${offer.test_batch_size} units` : 'Not specified'}
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          {applicationsCount}
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="text-sm text-gray-600">
          {new Date(offer.created_at).toLocaleDateString()}
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onViewDetails}
            className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors text-sm"
          >
            View Details
          </button>
          {offer.status === 'DRAFT' && (
            <button
              onClick={onEdit}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function CreateOfferModal({
  offer,
  onClose,
}: {
  offer: TestProductOffer | null;
  onClose: (success?: boolean, isUpdate?: boolean) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [designImages, setDesignImages] = useState<string[]>(offer?.design_reference_urls || []);
  const [isTargetedOffer, setIsTargetedOffer] = useState(offer?.is_targeted_offer || false);
  const [formData, setFormData] = useState({
    title: offer?.title || '',
    description: offer?.description || '',
    categories: offer?.categories?.join(', ') || '',
    target_vendor_categories: offer?.target_vendor_categories?.join(', ') || '',
    target_quantity: offer?.target_quantity?.toString() || '',
    test_batch_size: offer?.test_batch_size?.toString() || '',
    budget_currency: offer?.budget_currency || 'USD',
    budget_min: offer?.budget_min?.toString() || '',
    budget_max: offer?.budget_max?.toString() || '',
    target_region: offer?.target_region || '',
    usage_type: offer?.usage_type || '',
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `test-offer-design-${Date.now()}-${i}.${fileExt}`;
        const filePath = `test-products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('test-products')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('test-products')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      setDesignImages([...designImages, ...uploadedUrls]);
    } catch (err: any) {
      alert(`Unable to upload design reference images. ${err.message || 'Please verify file format and try again.'}`);
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setDesignImages(designImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent, publishImmediately = false) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: admin } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!admin) throw new Error('Admin user not found');

      const targetVendorCategories = formData.target_vendor_categories
        .split(',')
        .map(c => c.trim())
        .filter(Boolean);

      if (isTargetedOffer && targetVendorCategories.length === 0) {
        alert('Please specify at least one target vendor category for targeted offers.');
        return;
      }

      const offerData: any = {
        title: formData.title,
        description: formData.description,
        categories: formData.categories.split(',').map(c => c.trim()).filter(Boolean),
        is_targeted_offer: isTargetedOffer,
        target_vendor_categories: targetVendorCategories,
        target_quantity: formData.target_quantity ? parseInt(formData.target_quantity) : null,
        test_batch_size: formData.test_batch_size ? parseInt(formData.test_batch_size) : null,
        budget_currency: formData.budget_currency,
        budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
        budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
        target_region: formData.target_region || null,
        usage_type: formData.usage_type || null,
        design_reference_urls: designImages,
        status: publishImmediately ? 'OPEN_FOR_VENDORS' : 'DRAFT',
        created_by_admin_id: admin.id,
      };

      if (offer) {
        const { error } = await supabase
          .from('test_product_offers')
          .update(offerData)
          .eq('id', offer.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('test_product_offers')
          .insert(offerData);
        if (error) throw error;
      }

      onClose(true, !!offer);
    } catch (err: any) {
      console.error('Error saving offer:', err);
      alert(err.message || 'Unable to save test product offer. Please verify your information and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full my-8">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {offer ? 'Edit Test Product Offer' : 'Create Test Product Offer'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="e.g., New Festival Collection Design"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Describe the test product opportunity..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categories (comma-separated)
              </label>
              <input
                type="text"
                value={formData.categories}
                onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="e.g., Apparel, Accessories"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Region
              </label>
              <select
                value={formData.target_region}
                onChange={(e) => setFormData({ ...formData, target_region: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Select region</option>
                <option value="North America">North America</option>
                <option value="Europe">Europe</option>
                <option value="Middle East">Middle East</option>
                <option value="Asia">Asia</option>
                <option value="Africa">Africa</option>
                <option value="South America">South America</option>
                <option value="Oceania">Oceania</option>
                <option value="Global">Global</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Vendor Targeting</h3>

            <div className="mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTargetedOffer}
                  onChange={(e) => setIsTargetedOffer(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Target specific vendor categories
                </span>
              </label>
              <p className="text-xs text-gray-600 ml-6 mt-1">
                {isTargetedOffer
                  ? 'Only vendors with products in the specified categories will see this offer'
                  : 'This offer will be visible to ALL vendors'}
              </p>
            </div>

            {isTargetedOffer && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Vendor Categories (comma-separated) *
                </label>
                <input
                  type="text"
                  value={formData.target_vendor_categories}
                  onChange={(e) => setFormData({ ...formData, target_vendor_categories: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="e.g., Apparel, Accessories, Home Decor"
                  required={isTargetedOffer}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Only vendors who have products in these categories will see and can apply to this offer
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Quantity
              </label>
              <input
                type="number"
                value={formData.target_quantity}
                onChange={(e) => setFormData({ ...formData, target_quantity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="1000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Batch Size
              </label>
              <input
                type="number"
                value={formData.test_batch_size}
                onChange={(e) => setFormData({ ...formData, test_batch_size: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="100"
              />
              <p className="text-xs text-gray-500 mt-1">Planned test quantity (not purchase)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usage Type
              </label>
              <input
                type="text"
                value={formData.usage_type}
                onChange={(e) => setFormData({ ...formData, usage_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="e.g., Festival, New launch"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget Currency
              </label>
              <select
                value={formData.budget_currency}
                onChange={(e) => setFormData({ ...formData, budget_currency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget Min
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.budget_min}
                onChange={(e) => setFormData({ ...formData, budget_min: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="10.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget Max
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.budget_max}
                onChange={(e) => setFormData({ ...formData, budget_max: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="50.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Design Reference Photos
            </label>
            <div className="space-y-3">
              {designImages.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  {designImages.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Design ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div>
                <input
                  type="file"
                  id="design-images"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImages}
                />
                <label
                  htmlFor="design-images"
                  className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-colors ${
                    uploadingImages ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploadingImages ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
                      <span className="text-sm text-gray-600">Uploading images...</span>
                    </>
                  ) : (
                    <>
                      <Paperclip className="w-5 h-5 text-gray-600" />
                      <span className="text-sm text-gray-600">
                        Click to upload design photos
                      </span>
                    </>
                  )}
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Upload reference photos of the design you want vendors to create
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            {!offer || offer.status === 'DRAFT' ? (
              <>
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, false)}
                  disabled={submitting}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Publishing...
                    </>
                  ) : (
                    'Publish - Open for Vendors'
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={(e) => handleSubmit(e, false)}
                disabled={submitting}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function OfferDetailModal({
  offer,
  onClose,
}: {
  offer: TestProductOffer;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'details' | 'applications' | 'messages'>('details');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full my-8">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{offer.title}</h2>
            <p className="text-sm text-gray-600 mt-1">Test Product Offer Details</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 border-b border-gray-200 px-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'details'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'applications'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Vendor Applications
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'messages'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Messages
          </button>
        </div>

        <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
          {activeTab === 'details' && <OfferDetailsTab offer={offer} onClose={onClose} />}
          {activeTab === 'applications' && <ApplicationsTab offer={offer} onClose={onClose} />}
          {activeTab === 'messages' && <MessagesTab offer={offer} />}
        </div>
      </div>
    </div>
  );
}

function OfferDetailsTab({ offer, onClose }: { offer: TestProductOffer; onClose: () => void }) {
  const [updating, setUpdating] = useState(false);

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('test_product_offers')
        .update({ status: newStatus })
        .eq('id', offer.id);

      if (error) throw error;
      alert('The offer status has been updated successfully.');
      onClose();
    } catch (err: any) {
      alert(`Unable to update offer status. ${err.message || 'Please try again.'}`);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Beaker className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <strong>Reminder:</strong> This is a test program for collaboration, not a purchase order system.
            Approving a vendor means giving them permission to test/pilot, not committing to buy units.
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Status Control</h3>
        <div className="flex items-center gap-3">
          <select
            value={offer.status}
            onChange={(e) => updateStatus(e.target.value)}
            disabled={updating}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
          >
            <option value="DRAFT">Draft</option>
            <option value="OPEN_FOR_VENDORS">Open for Vendors</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPROVED_VENDOR_SELECTED">Approved Vendor Selected</option>
            <option value="TEST_IN_PROGRESS">Test in Progress</option>
            <option value="TEST_COMPLETED">Test Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          {updating && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Description</h4>
          <p className="text-gray-700 whitespace-pre-wrap">{offer.description}</p>
        </div>

        <div className="space-y-4">
          {offer.categories.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {offer.categories.map((cat, idx) => (
                  <span key={idx} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-sm rounded-full">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className={`p-3 rounded-lg ${
            offer.is_targeted_offer ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50 border border-gray-200'
          }`}>
            <h4 className="font-medium text-gray-900 mb-1">Vendor Targeting</h4>
            {offer.is_targeted_offer ? (
              <div>
                <p className="text-sm text-gray-700 mb-2">
                  Targeted to vendors with products in:
                </p>
                <div className="flex flex-wrap gap-2">
                  {offer.target_vendor_categories.map((cat, idx) => (
                    <span key={idx} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-700">
                Visible to ALL vendors
              </p>
            )}
          </div>

          {offer.target_region && (
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Target Region</h4>
              <p className="text-gray-700">{offer.target_region}</p>
            </div>
          )}

          {offer.usage_type && (
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Usage Type</h4>
              <p className="text-gray-700">{offer.usage_type}</p>
            </div>
          )}

          {offer.test_batch_size && (
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Test Batch Size</h4>
              <p className="text-gray-700">{offer.test_batch_size} units (planned, not purchase order)</p>
            </div>
          )}

          {offer.budget_min && offer.budget_max && (
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Budget Range</h4>
              <p className="text-gray-700">
                {offer.budget_currency} {offer.budget_min} - {offer.budget_max}
              </p>
            </div>
          )}

          {offer.locked_vendor_id && (
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Selected Vendor for Test</h4>
              <p className="text-emerald-600 font-medium">{(offer as any).locked_vendor?.business_name}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ApplicationsTab({ offer, onClose }: { offer: TestProductOffer; onClose: () => void }) {
  const { applications, refetch } = useTestProductOfferVendorApplications(offer.id);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const updateApplicationStatus = async (appId: string, newStatus: string) => {
    setProcessingId(appId);
    try {
      const { error } = await supabase
        .from('test_product_offer_vendors')
        .update({ status: newStatus })
        .eq('id', appId);

      if (error) throw error;
      await refetch();
    } catch (err: any) {
      alert(`Unable to update offer status. ${err.message || 'Please try again.'}`);
    } finally {
      setProcessingId(null);
    }
  };

  const approveAndLockVendor = async (application: TestProductOfferVendor) => {
    if (!confirm('This will approve this vendor for the test batch and lock the offer. Continue?')) {
      return;
    }

    setProcessingId(application.id);
    try {
      await supabase
        .from('test_product_offers')
        .update({
          locked_vendor_id: application.vendor_id,
          status: 'APPROVED_VENDOR_SELECTED',
        })
        .eq('id', offer.id);

      await supabase
        .from('test_product_offer_vendors')
        .update({ status: 'APPROVED_FOR_TEST' })
        .eq('id', application.id);

      alert('The vendor application has been approved successfully.');
      onClose();
    } catch (err: any) {
      alert(`Unable to approve vendor application. ${err.message || 'Please try again.'}`);
    } finally {
      setProcessingId(null);
    }
  };

  if (applications.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p>No vendor applications yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((app) => (
        <div key={app.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-semibold text-gray-900">{app.vendors?.business_name}</h4>
              <p className="text-sm text-gray-600">{app.vendors?.contact_email}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              app.status === 'APPROVED_FOR_TEST' ? 'bg-green-100 text-green-700' :
              app.status === 'SHORTLISTED' ? 'bg-yellow-100 text-yellow-700' :
              app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {app.status.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="space-y-2 text-sm text-gray-700 mb-4">
            {app.proposal_note && (
              <div>
                <span className="font-medium">Proposal:</span> {app.proposal_note}
              </div>
            )}
            <div className="grid grid-cols-3 gap-4">
              {app.estimated_unit_cost && (
                <div>
                  <span className="font-medium">Unit Cost:</span> ${app.estimated_unit_cost}
                </div>
              )}
              {app.estimated_lead_time_days && (
                <div>
                  <span className="font-medium">Lead Time:</span> {app.estimated_lead_time_days} days
                </div>
              )}
              {app.max_capacity_units && (
                <div>
                  <span className="font-medium">Capacity:</span> {app.max_capacity_units} units
                </div>
              )}
            </div>
            {app.sample_image_urls && app.sample_image_urls.length > 0 && (
              <div className="mt-3">
                <span className="font-medium">Sample Photos:</span>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {app.sample_image_urls.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Sample ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-75 transition-opacity"
                      onClick={() => window.open(url, '_blank')}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {app.status === 'APPLIED' && (
            <div className="flex gap-2">
              <button
                onClick={() => updateApplicationStatus(app.id, 'SHORTLISTED')}
                disabled={processingId === app.id}
                className="px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors text-sm disabled:opacity-50"
              >
                Shortlist
              </button>
              <button
                onClick={() => approveAndLockVendor(app)}
                disabled={processingId === app.id || offer.locked_vendor_id !== null}
                className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm disabled:opacity-50 flex items-center gap-1"
              >
                <CheckCircle className="w-4 h-4" />
                Approve for Test & Lock
              </button>
              <button
                onClick={() => updateApplicationStatus(app.id, 'REJECTED')}
                disabled={processingId === app.id}
                className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm disabled:opacity-50 flex items-center gap-1"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            </div>
          )}

          {app.status === 'SHORTLISTED' && !offer.locked_vendor_id && (
            <button
              onClick={() => approveAndLockVendor(app)}
              disabled={processingId === app.id}
              className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm disabled:opacity-50 flex items-center gap-1"
            >
              <CheckCircle className="w-4 h-4" />
              Approve for Test & Lock
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function MessagesTab({ offer }: { offer: TestProductOffer }) {
  const { messages, sendMessage, refetch } = useTestProductOfferMessages(offer.id);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await sendMessage(newMessage);
      setNewMessage('');
      await refetch();
    } catch (err: any) {
      alert(`Unable to send message. ${err.message || 'Please try again later.'}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Send className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No messages yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`p-3 rounded-lg ${
                msg.sender_type === 'ADMIN' ? 'bg-emerald-100' : 'bg-white border border-gray-200'
              }`}>
                <div className="text-xs text-gray-600 mb-1">
                  {msg.sender_type === 'ADMIN' ? `Admin (${msg.admin_users?.email})` : msg.vendors?.business_name} •{' '}
                  {new Date(msg.created_at).toLocaleString()}
                </div>
                <p className="text-gray-900 whitespace-pre-wrap">{msg.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {offer.status !== 'CANCELLED' && (
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
