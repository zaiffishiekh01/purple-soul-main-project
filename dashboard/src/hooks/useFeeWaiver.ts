import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FeeWaiverRequest, FeeWaiverDocumentType } from '../types';

export function useFeeWaiver(vendorId?: string) {
  const [latestRequest, setLatestRequest] = useState<FeeWaiverRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchLatestRequest = async () => {
    if (!vendorId) {
      setLatestRequest(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('fee_waiver_requests')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setLatestRequest(data);
    } catch (error) {
      console.error('Error fetching fee waiver request:', error);
      setLatestRequest(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestRequest();
  }, [vendorId]);

  const uploadDocument = async (file: File, vendorId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${vendorId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('fee-waiver-docs')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    return fileName;
  };

  const submitRequest = async (data: {
    documentType: FeeWaiverDocumentType;
    document: File;
    note?: string;
  }) => {
    if (!vendorId) throw new Error('Vendor ID is required');

    setUploading(true);
    try {
      const documentUrl = await uploadDocument(data.document, vendorId);

      const { data: newRequest, error } = await supabase
        .from('fee_waiver_requests')
        .insert({
          vendor_id: vendorId,
          status: 'PENDING',
          document_url: documentUrl,
          document_type: data.documentType,
          note_from_vendor: data.note || null,
        })
        .select()
        .single();

      if (error) throw error;

      setLatestRequest(newRequest);
      return newRequest;
    } catch (error) {
      console.error('Error submitting fee waiver request:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const canSubmitNewRequest = () => {
    if (!latestRequest) return true;
    return latestRequest.status === 'REJECTED';
  };

  const hasPendingRequest = () => {
    return latestRequest?.status === 'PENDING';
  };

  const hasApprovedRequest = () => {
    if (!latestRequest || latestRequest.status !== 'APPROVED') return false;
    if (!latestRequest.valid_until) return true;

    const validUntil = new Date(latestRequest.valid_until);
    return validUntil > new Date();
  };

  return {
    latestRequest,
    loading,
    uploading,
    submitRequest,
    refetch: fetchLatestRequest,
    canSubmitNewRequest,
    hasPendingRequest,
    hasApprovedRequest,
  };
}
