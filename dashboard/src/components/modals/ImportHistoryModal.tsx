import { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useVendor } from '../../hooks/useVendor';

interface ImportRecord {
  id: string;
  filename: string;
  total_rows: number;
  success_count: number;
  error_count: number;
  errors: string[];
  status: string;
  created_at: string;
  completed_at: string | null;
}

interface ImportHistoryModalProps {
  onClose: () => void;
}

export function ImportHistoryModal({ onClose }: ImportHistoryModalProps) {
  const [imports, setImports] = useState<ImportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImport, setSelectedImport] = useState<ImportRecord | null>(null);
  const { vendor } = useVendor();

  const vendorId = vendor?.id;

  useEffect(() => {
    fetchImportHistory();
  }, [vendorId]);

  const fetchImportHistory = async () => {
    if (!vendorId) return;

    try {
      const { data, error } = await supabase
        .from('product_imports')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setImports(data || []);
    } catch (error) {
      console.error('Error fetching import history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'processing':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Import History</h2>
            <p className="text-sm text-gray-600 mt-1">View your bulk product upload history</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sufi-purple"></div>
            </div>
          ) : imports.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Import History</h3>
              <p className="text-gray-600">Your bulk upload history will appear here</p>
            </div>
          ) : selectedImport ? (
            <div className="space-y-4">
              <button
                onClick={() => setSelectedImport(null)}
                className="text-sufi-purple hover:text-sufi-dark font-medium mb-4"
              >
                ← Back to list
              </button>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {selectedImport.filename}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedImport.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                      selectedImport.status
                    )}`}
                  >
                    {selectedImport.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Total Rows</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedImport.total_rows}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <p className="text-sm text-gray-600 mb-1">Successful</p>
                    <p className="text-2xl font-bold text-green-600">
                      {selectedImport.success_count}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-red-200">
                    <p className="text-sm text-gray-600 mb-1">Failed</p>
                    <p className="text-2xl font-bold text-red-600">{selectedImport.error_count}</p>
                  </div>
                </div>

                {selectedImport.errors && selectedImport.errors.length > 0 && (
                  <div className="bg-white rounded-lg p-4 border border-red-200">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Error Details ({selectedImport.errors.length})
                    </h4>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {selectedImport.errors.map((error, index) => (
                        <div
                          key={index}
                          className="text-sm text-gray-700 p-2 bg-red-50 rounded border-l-2 border-red-400"
                        >
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {imports.map((importRecord) => (
                <div
                  key={importRecord.id}
                  onClick={() => setSelectedImport(importRecord)}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:border-sufi-purple hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(importRecord.status)}
                      <div>
                        <h3 className="font-semibold text-gray-900">{importRecord.filename}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(importRecord.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                        importRecord.status
                      )}`}
                    >
                      {importRecord.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-gray-600">Total: </span>
                      <span className="font-semibold text-gray-900">
                        {importRecord.total_rows}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Success: </span>
                      <span className="font-semibold text-green-600">
                        {importRecord.success_count}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Failed: </span>
                      <span className="font-semibold text-red-600">
                        {importRecord.error_count}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
