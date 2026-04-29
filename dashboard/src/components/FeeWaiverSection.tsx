import { useState } from 'react';
import { FileText, CheckCircle, XCircle, Clock, Upload, AlertCircle } from 'lucide-react';
import { useFeeWaiver } from '../hooks/useFeeWaiver';
import { FeeWaiverDocumentType } from '../types';

interface FeeWaiverSectionProps {
  vendorId: string;
}

export function FeeWaiverSection({ vendorId }: FeeWaiverSectionProps) {
  const { latestRequest, loading, uploading, submitRequest, canSubmitNewRequest, hasPendingRequest, hasApprovedRequest } = useFeeWaiver(vendorId);

  const [documentType, setDocumentType] = useState<FeeWaiverDocumentType>('BPL_CARD');
  const [document, setDocument] = useState<File | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a PDF, JPG, or PNG file');
        setDocument(null);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        setDocument(null);
        return;
      }
      setDocument(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!document) {
      setError('Please select a document to upload');
      return;
    }

    setError(null);
    setSuccess(false);

    try {
      await submitRequest({
        documentType,
        document,
        note: note.trim() || undefined,
      });

      setSuccess(true);
      setDocument(null);
      setNote('');

      const fileInput = document.getElementById('document-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      setError(err.message || 'Failed to submit request. Please try again.');
    }
  };

  const getDocumentTypeLabel = (type: FeeWaiverDocumentType) => {
    switch (type) {
      case 'BPL_CARD':
        return 'Government poverty-line certificate';
      case 'INCOME_CERTIFICATE':
        return 'Income certificate';
      case 'OTHER':
        return 'Other official support document';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 bg-blue-100 rounded-xl">
          <FileText className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Fee Support Program</h3>
          <p className="text-sm text-gray-600">
            If you're facing financial challenges, you may qualify for reduced or waived platform fees.
            Upload supporting documentation for review by our team.
          </p>
        </div>
      </div>

      {hasPendingRequest() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-900 mb-2">Request Under Review</h4>
              <p className="text-sm text-yellow-800 mb-3">
                Your fee support request is being reviewed by our team. You'll be notified here once a decision is made.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-yellow-700">Submitted:</span>
                  <span className="font-medium text-yellow-900">{formatDate(latestRequest!.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-700">Document Type:</span>
                  <span className="font-medium text-yellow-900">{getDocumentTypeLabel(latestRequest!.document_type)}</span>
                </div>
                {latestRequest!.note_from_vendor && (
                  <div className="mt-3 pt-3 border-t border-yellow-200">
                    <span className="text-yellow-700 block mb-1">Your Note:</span>
                    <p className="text-yellow-900">{latestRequest!.note_from_vendor}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {hasApprovedRequest() && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-green-900 mb-2">Request Approved</h4>
              <p className="text-sm text-green-800 mb-4">
                Congratulations! Your fee support request has been approved.
              </p>
              <div className="space-y-2 text-sm bg-white rounded-lg p-4">
                <div className="flex justify-between">
                  <span className="text-gray-700">Waiver Type:</span>
                  <span className="font-semibold text-gray-900">
                    {latestRequest!.waiver_type === 'FULL_FEE_WAIVER' ? 'Full Fee Waiver' : 'Reduced Commission'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Commission Rate:</span>
                  <span className="font-semibold text-gray-900">
                    {latestRequest!.commission_rate !== null
                      ? `${(latestRequest!.commission_rate * 100).toFixed(1)}%`
                      : 'N/A'}
                  </span>
                </div>
                {latestRequest!.valid_from && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">Effective From:</span>
                    <span className="font-semibold text-gray-900">{formatDate(latestRequest!.valid_from)}</span>
                  </div>
                )}
                {latestRequest!.valid_until && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">Valid Until:</span>
                    <span className="font-semibold text-gray-900">{formatDate(latestRequest!.valid_until)}</span>
                  </div>
                )}
                {latestRequest!.note_from_admin && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <span className="text-gray-700 block mb-1">Admin Note:</span>
                    <p className="text-gray-900">{latestRequest!.note_from_admin}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {latestRequest?.status === 'REJECTED' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 mb-2">Request Not Approved</h4>
              <p className="text-sm text-red-800 mb-3">
                Unfortunately, your fee support request was not approved at this time.
              </p>
              {latestRequest.note_from_admin && (
                <div className="bg-white rounded-lg p-4 mb-3">
                  <span className="text-gray-700 block mb-1 text-sm font-medium">Reason:</span>
                  <p className="text-gray-900 text-sm">{latestRequest.note_from_admin}</p>
                </div>
              )}
              <p className="text-sm text-red-700">
                You may submit a new request with additional documentation if your circumstances have changed.
              </p>
            </div>
          </div>
        </div>
      )}

      {canSubmitNewRequest() && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {!latestRequest && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-2">Who is this for?</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Vendors with documented low income or below poverty line status</li>
                    <li>Small businesses facing temporary financial hardship</li>
                    <li>New vendors establishing their business</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Type <span className="text-red-500">*</span>
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as FeeWaiverDocumentType)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="BPL_CARD">Government poverty-line certificate</option>
              <option value="INCOME_CERTIFICATE">Income certificate</option>
              <option value="OTHER">Other official support document</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Document <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              <label className="flex-1 flex items-center justify-center px-6 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-600">
                    {document ? document.name : 'Click to upload PDF, JPG, or PNG (max 10MB)'}
                  </span>
                </div>
                <input
                  id="document-upload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
              </label>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Accepted formats: PDF, JPG, PNG • Maximum size: 10MB
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Explain Your Situation (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Provide any additional context that may help with the review..."
            />
            <p className="mt-2 text-xs text-gray-500">
              This information is visible only to the admin team and helps us understand your request better.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">Your request has been submitted successfully!</p>
            </div>
          )}

          <button
            type="submit"
            disabled={uploading || !document}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {uploading ? 'Submitting Request...' : 'Submit Fee Support Request'}
          </button>
        </form>
      )}
    </div>
  );
}
