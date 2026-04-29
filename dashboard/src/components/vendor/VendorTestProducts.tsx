import { useState } from 'react';
import { Beaker, AlertCircle, Send, Paperclip, X, CheckCircle, XCircle, Plus } from 'lucide-react';
import { useVendor } from '../../hooks/useVendor';
import { useTestProductOffers, useTestProductOfferApplications, useTestProductOfferMessages } from '../../hooks/useTestProductOffers';
import { supabase } from '../../lib/supabase';
import { TestProductOffer, TestProductOfferVendor } from '../../types';
import { RequestTestProductModal, MyRequestsTab } from './VendorTestProductRequest';

export function VendorTestProducts() {
  const { vendor } = useVendor();
  const [activeTab, setActiveTab] = useState<'open' | 'my-applications' | 'my-requests'>('open');
  const [selectedOffer, setSelectedOffer] = useState<TestProductOffer | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<TestProductOfferVendor | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showMessageThread, setShowMessageThread] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const { offers: openOffers, loading: offersLoading, refetch: refetchOffers } = useTestProductOffers(vendor?.id);
  const { applications, loading: applicationsLoading, refetch: refetchApplications } = useTestProductOfferApplications(vendor?.id || '');

  const openOffersFiltered = openOffers.filter(
    (offer) => offer.status === 'OPEN_FOR_VENDORS' || offer.status === 'UNDER_REVIEW'
  );

  const myRequests = openOffers.filter(
    (offer) => offer.vendor_requested && offer.vendor_requester_id === vendor?.id
  );

  if (!vendor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Beaker className="w-8 h-8 text-emerald-600" />
            Test New Products
          </h1>
          <p className="text-gray-600 mt-1">
            Explore test product opportunities and collaborate with the marketplace
          </p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Request New Test Product
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <strong>Important Notice:</strong> Test New Product offers are collaboration opportunities.
            Being approved for a test does not guarantee that the marketplace will purchase all produced units.
            Final customer orders and payouts are handled separately through the normal marketplace order system.
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('open')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'open'
              ? 'text-emerald-600 border-b-2 border-emerald-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Open Test Offers ({openOffersFiltered.length})
        </button>
        <button
          onClick={() => setActiveTab('my-applications')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'my-applications'
              ? 'text-emerald-600 border-b-2 border-emerald-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Applications ({applications.length})
        </button>
        <button
          onClick={() => setActiveTab('my-requests')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'my-requests'
              ? 'text-emerald-600 border-b-2 border-emerald-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Requests ({myRequests.length})
        </button>
      </div>

      {activeTab === 'open' && (
        <OpenTestOffersTab
          offers={openOffersFiltered}
          loading={offersLoading}
          vendorId={vendor.id}
          onViewDetails={(offer) => {
            setSelectedOffer(offer);
            setShowApplicationModal(true);
          }}
        />
      )}

      {activeTab === 'my-applications' && (
        <MyApplicationsTab
          applications={applications}
          loading={applicationsLoading}
          vendorId={vendor.id}
          onViewDetails={(application) => {
            setSelectedApplication(application);
            setShowMessageThread(true);
          }}
        />
      )}

      {activeTab === 'my-requests' && (
        <MyRequestsTab
          requests={myRequests}
          loading={offersLoading}
          onRefresh={refetchOffers}
        />
      )}

      {showRequestModal && (
        <RequestTestProductModal
          vendorId={vendor.id}
          onClose={(success) => {
            setShowRequestModal(false);
            if (success) {
              refetchOffers();
              showNotification('success', 'Your test product request has been submitted for admin review.');
              setActiveTab('my-requests');
            }
          }}
        />
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

      {showApplicationModal && selectedOffer && (
        <ApplicationModal
          offer={selectedOffer}
          vendorId={vendor.id}
          onClose={(success?: boolean) => {
            setShowApplicationModal(false);
            setSelectedOffer(null);
            refetchOffers();
            refetchApplications();
            if (success) {
              showNotification('success', 'Your application has been successfully submitted and is currently under review by the marketplace team.');
            }
          }}
        />
      )}

      {showMessageThread && selectedApplication && (
        <MessageThreadModal
          application={selectedApplication}
          vendorId={vendor.id}
          onClose={() => {
            setShowMessageThread(false);
            setSelectedApplication(null);
          }}
        />
      )}
    </div>
  );
}

function OpenTestOffersTab({
  offers,
  loading,
  vendorId,
  onViewDetails,
}: {
  offers: TestProductOffer[];
  loading: boolean;
  vendorId: string;
  onViewDetails: (offer: TestProductOffer) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <Beaker className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Open Test Offers</h3>
        <p className="text-gray-600">There are currently no test product offers available for vendors.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {offers.map((offer) => (
        <div key={offer.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{offer.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-3">{offer.description}</p>
          </div>

          <div className="space-y-2 mb-4">
            {offer.categories && offer.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {offer.categories.slice(0, 3).map((cat, idx) => (
                  <span key={idx} className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-full">
                    {cat}
                  </span>
                ))}
                {offer.categories.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{offer.categories.length - 3} more
                  </span>
                )}
              </div>
            )}

            {offer.target_region && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Region:</span> {offer.target_region}
              </div>
            )}

            {offer.test_batch_size && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Test Batch:</span> {offer.test_batch_size} units (planned test quantity)
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              offer.status === 'OPEN_FOR_VENDORS'
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {offer.status === 'OPEN_FOR_VENDORS' ? 'Open for Vendors' : 'Under Review'}
            </span>
            <button
              onClick={() => onViewDetails(offer)}
              className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors"
            >
              View & Apply
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function MyApplicationsTab({
  applications,
  loading,
  vendorId,
  onViewDetails,
}: {
  applications: TestProductOfferVendor[];
  loading: boolean;
  vendorId: string;
  onViewDetails: (application: TestProductOfferVendor) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <Beaker className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Yet</h3>
        <p className="text-gray-600">You haven't applied to any test product offers yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Offer Title</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Offer Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Your Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Applied On</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4">
                  <div className="font-medium text-gray-900">{app.test_product_offers?.title}</div>
                </td>
                <td className="py-4 px-4">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {app.test_product_offers?.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    app.status === 'APPROVED_FOR_TEST' ? 'bg-green-100 text-green-700' :
                    app.status === 'SHORTLISTED' ? 'bg-yellow-100 text-yellow-700' :
                    app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {app.status.replace(/_/g, ' ')}
                  </span>
                  {app.status === 'APPROVED_FOR_TEST' &&
                   app.test_product_offers?.locked_vendor_id === vendorId && (
                    <div className="text-xs text-green-600 mt-1">✓ Approved vendor for test</div>
                  )}
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm text-gray-600">
                    {new Date(app.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <button
                    onClick={() => onViewDetails(app)}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors text-sm"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ApplicationModal({
  offer,
  vendorId,
  onClose,
}: {
  offer: TestProductOffer;
  vendorId: string;
  onClose: (success?: boolean) => void;
}) {
  const [existingApplication, setExistingApplication] = useState<TestProductOfferVendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [sampleImages, setSampleImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    proposal_note: '',
    estimated_unit_cost: '',
    estimated_lead_time_days: '',
    max_capacity_units: '',
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
        const fileName = `vendor-sample-${Date.now()}-${i}.${fileExt}`;
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

      setSampleImages([...sampleImages, ...uploadedUrls]);
    } catch (err: any) {
      alert(`Unable to upload images. ${err.message || 'Please try again or contact support if the issue persists.'}`)
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setSampleImages(sampleImages.filter((_, i) => i !== index));
  };

  useState(() => {
    const fetchExistingApplication = async () => {
      try {
        const { data } = await supabase
          .from('test_product_offer_vendors')
          .select('*')
          .eq('offer_id', offer.id)
          .eq('vendor_id', vendorId)
          .maybeSingle();

        if (data) {
          setExistingApplication(data);
          setSampleImages(data.sample_image_urls || []);
          setFormData({
            proposal_note: data.proposal_note || '',
            estimated_unit_cost: data.estimated_unit_cost?.toString() || '',
            estimated_lead_time_days: data.estimated_lead_time_days?.toString() || '',
            max_capacity_units: data.max_capacity_units?.toString() || '',
          });
        }
      } catch (err) {
        console.error('Error fetching application:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExistingApplication();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate offer is still open and not locked
      const { data: currentOffer, error: fetchError } = await supabase
        .from('test_product_offers')
        .select('status, locked_vendor_id')
        .eq('id', offer.id)
        .single();

      if (fetchError) throw new Error('Unable to verify offer status. Please try again.');

      if (!currentOffer) {
        throw new Error('This test product offer is no longer available.');
      }

      if (currentOffer.status !== 'OPEN_FOR_VENDORS') {
        throw new Error('This test product offer is no longer accepting applications.');
      }

      if (currentOffer.locked_vendor_id && currentOffer.locked_vendor_id !== vendorId) {
        throw new Error('This test product offer has been awarded to another vendor.');
      }

      const applicationData = {
        offer_id: offer.id,
        vendor_id: vendorId,
        proposal_note: formData.proposal_note,
        estimated_unit_cost: formData.estimated_unit_cost ? parseFloat(formData.estimated_unit_cost) : null,
        estimated_lead_time_days: formData.estimated_lead_time_days ? parseInt(formData.estimated_lead_time_days) : null,
        max_capacity_units: formData.max_capacity_units ? parseInt(formData.max_capacity_units) : null,
        sample_image_urls: sampleImages,
        status: 'APPLIED',
      };

      const { error } = await supabase
        .from('test_product_offer_vendors')
        .upsert(applicationData, { onConflict: 'offer_id,vendor_id' });

      if (error) throw error;

      onClose(true);
    } catch (err: any) {
      console.error('Error submitting application:', err);
      alert(err.message || 'We were unable to submit your application at this time. Please verify your information and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        </div>
      </div>
    );
  }

  const canApply = offer.status === 'OPEN_FOR_VENDORS' && !existingApplication;
  const isApproved = existingApplication?.status === 'APPROVED_FOR_TEST' && offer.locked_vendor_id === vendorId;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full my-8">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{offer.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {isApproved && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-900">
                  <strong>Congratulations!</strong> You have been approved to test this product.
                  This is not a purchase order. Final commercial orders are handled separately through the normal marketplace.
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{offer.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {offer.categories && offer.categories.length > 0 && (
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

              {offer.target_region && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Target Region</h4>
                  <p className="text-gray-700">{offer.target_region}</p>
                </div>
              )}

              {offer.usage_type && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Usage Type</h4>
                  <p className="text-gray-700">{offer.usage_type}</p>
                </div>
              )}

              {offer.test_batch_size && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Planned Test Quantity</h4>
                  <p className="text-gray-700">{offer.test_batch_size} units (not guaranteed purchase)</p>
                </div>
              )}

              {offer.budget_min && offer.budget_max && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Budget Range</h4>
                  <p className="text-gray-700">
                    {offer.budget_currency} {offer.budget_min} - {offer.budget_max}
                  </p>
                </div>
              )}
            </div>

            {offer.design_reference_urls && offer.design_reference_urls.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Design References</h4>
                <div className="grid grid-cols-3 gap-4">
                  {offer.design_reference_urls.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Design reference ${idx + 1}`}
                      className="w-full h-40 object-cover rounded-lg border border-gray-200"
                    />
                  ))}
                </div>
              </div>
            )}

            {existingApplication && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Your Application</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Status:</span>{' '}
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      existingApplication.status === 'APPROVED_FOR_TEST' ? 'bg-green-100 text-green-700' :
                      existingApplication.status === 'SHORTLISTED' ? 'bg-yellow-100 text-yellow-700' :
                      existingApplication.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {existingApplication.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {existingApplication.proposal_note && (
                    <div>
                      <span className="font-medium">Proposal:</span> {existingApplication.proposal_note}
                    </div>
                  )}
                  {existingApplication.estimated_unit_cost && (
                    <div>
                      <span className="font-medium">Estimated Unit Cost:</span> ${existingApplication.estimated_unit_cost}
                    </div>
                  )}
                  {existingApplication.estimated_lead_time_days && (
                    <div>
                      <span className="font-medium">Lead Time:</span> {existingApplication.estimated_lead_time_days} days
                    </div>
                  )}
                  {existingApplication.max_capacity_units && (
                    <div>
                      <span className="font-medium">Max Capacity:</span> {existingApplication.max_capacity_units} units
                    </div>
                  )}
                </div>
              </div>
            )}

            {canApply && (
              <form onSubmit={handleSubmit} className="space-y-4 bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-4">Apply to Test This Product</h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proposal Note *
                  </label>
                  <textarea
                    value={formData.proposal_note}
                    onChange={(e) => setFormData({ ...formData, proposal_note: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Explain why you're a good fit for this test opportunity..."
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Unit Cost ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.estimated_unit_cost}
                      onChange={(e) => setFormData({ ...formData, estimated_unit_cost: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lead Time (days)
                    </label>
                    <input
                      type="number"
                      value={formData.estimated_lead_time_days}
                      onChange={(e) => setFormData({ ...formData, estimated_lead_time_days: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Capacity (units)
                    </label>
                    <input
                      type="number"
                      value={formData.max_capacity_units}
                      onChange={(e) => setFormData({ ...formData, max_capacity_units: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="1000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Sample Photos
                  </label>
                  <div className="space-y-3">
                    {sampleImages.length > 0 && (
                      <div className="grid grid-cols-4 gap-3">
                        {sampleImages.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Sample ${index + 1}`}
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
                        id="sample-images"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImages}
                      />
                      <label
                        htmlFor="sample-images"
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
                              Click to upload product sample photos
                            </span>
                          </>
                        )}
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Upload photos of similar products you've created to showcase your work
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Submitting...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageThreadModal({
  application,
  vendorId,
  onClose,
}: {
  application: TestProductOfferVendor;
  vendorId: string;
  onClose: () => void;
}) {
  const { messages, sendMessage, refetch } = useTestProductOfferMessages(application.offer_id);
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{application.test_product_offers?.title}</h2>
            <p className="text-sm text-gray-600 mt-1">Communication Thread</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Send className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_type === 'VENDOR' && msg.sender_vendor_id === vendorId ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${
                  msg.sender_type === 'VENDOR' && msg.sender_vendor_id === vendorId
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                } rounded-lg p-4`}>
                  <div className="text-xs mb-1 opacity-75">
                    {msg.sender_type === 'ADMIN' ? `Admin (${msg.admin_users?.email})` : msg.vendors?.business_name}
                  </div>
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                  <div className="text-xs mt-2 opacity-75">
                    {new Date(msg.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {application.test_product_offers?.status !== 'CANCELLED' && (
          <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4">
            <div className="flex gap-2">
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
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
