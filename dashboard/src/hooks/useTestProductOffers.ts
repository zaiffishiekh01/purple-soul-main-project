import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TestProductOffer, TestProductOfferVendor, TestProductOfferMessage } from '../types';

export function useTestProductOffers(vendorId?: string) {
  const [offers, setOffers] = useState<TestProductOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError(null);

      const query = supabase
        .from('test_product_offers')
        .select(`
          *,
          locked_vendor:locked_vendor_id (
            business_name
          ),
          requester_vendor:vendor_requester_id (
            business_name
          )
        `)
        .order('created_at', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setOffers(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching test product offers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [vendorId]);

  return { offers, loading, error, refetch: fetchOffers };
}

export function useTestProductOfferApplications(vendorId: string) {
  const [applications, setApplications] = useState<TestProductOfferVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('test_product_offer_vendors')
        .select(`
          *,
          test_product_offers (
            title,
            status,
            locked_vendor_id
          ),
          vendors (
            business_name,
            contact_email
          )
        `)
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setApplications(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [vendorId]);

  return { applications, loading, error, refetch: fetchApplications };
}

export function useTestProductOfferMessages(offerId: string) {
  const [messages, setMessages] = useState<TestProductOfferMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('test_product_offer_messages')
        .select(`
          *,
          admin_users:sender_admin_id (
            email
          ),
          vendors:sender_vendor_id (
            business_name
          )
        `)
        .eq('offer_id', offerId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      setMessages(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (message: string, attachmentUrls: string[] = []) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: vendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const { data: admin } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      const messageData: any = {
        offer_id: offerId,
        message,
        attachment_urls: attachmentUrls,
      };

      if (vendor) {
        messageData.sender_type = 'VENDOR';
        messageData.sender_vendor_id = vendor.id;
      } else if (admin) {
        messageData.sender_type = 'ADMIN';
        messageData.sender_admin_id = admin.id;
      } else {
        throw new Error('User is neither vendor nor admin');
      }

      const { error: insertError } = await supabase
        .from('test_product_offer_messages')
        .insert(messageData);

      if (insertError) throw insertError;

      await fetchMessages();
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  useEffect(() => {
    if (offerId) {
      fetchMessages();
    }
  }, [offerId]);

  return { messages, loading, error, sendMessage, refetch: fetchMessages };
}

export function useTestProductOfferVendorApplications(offerId: string) {
  const [applications, setApplications] = useState<TestProductOfferVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('test_product_offer_vendors')
        .select(`
          *,
          vendors (
            business_name,
            contact_email
          )
        `)
        .eq('offer_id', offerId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setApplications(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (offerId) {
      fetchApplications();
    }
  }, [offerId]);

  return { applications, loading, error, refetch: fetchApplications };
}
