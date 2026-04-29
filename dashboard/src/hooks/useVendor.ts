import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Vendor } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function useVendor() {
  const { userId, userEmail } = useAuth();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const isFetchingRef = useRef(false);
  const userIdRef = useRef(userId);
  const userEmailRef = useRef(userEmail);

  useEffect(() => {
    userIdRef.current = userId;
    userEmailRef.current = userEmail;
  }, [userId, userEmail]);

  useEffect(() => {
    let mounted = true;
    isFetchingRef.current = false;

    const fetchVendor = async () => {
      if (!userId) {
        if (mounted) {
          setVendor(null);
          setLoading(false);
        }
        return;
      }

      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      try {
        if (mounted) setLoading(true);

        const { data, error } = await supabase
          .from('vendors')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching vendor:', error);
          if (mounted) {
            setVendor(null);
            setLoading(false);
          }
          return;
        }

        if (!mounted) return;

        if (!data) {
          const newVendor = {
            user_id: userId,
            business_name: userEmailRef.current?.split('@')[0] || 'New Vendor',
            contact_email: userEmailRef.current || '',
            status: 'pending',
            is_approved: false,
            business_type: '',
            contact_phone: '',
            address: {},
            tax_id: '',
            logo_url: '',
          };

          const { data: created, error: createError } = await supabase
            .from('vendors')
            .insert(newVendor)
            .select()
            .single();

          if (createError) {
            console.error('Error creating vendor:', createError);
            if (mounted) {
              setVendor(null);
              setLoading(false);
            }
            return;
          }

          if (mounted) setVendor(created as Vendor);
        } else {
          if (mounted) setVendor(data as Vendor);
        }
      } catch (error: any) {
        console.error('Error in fetchVendor:', error);
        if (mounted) {
          setVendor(null);
        }
      } finally {
        if (mounted) setLoading(false);
        isFetchingRef.current = false;
      }
    };

    fetchVendor();

    return () => {
      mounted = false;
      isFetchingRef.current = false;
    };
  }, [userId]);

  const refetch = useCallback(async () => {
    const currentUserId = userIdRef.current;
    if (!currentUserId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', currentUserId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setVendor(data as Vendor);
      }
    } catch (error) {
      console.error('Error refetching vendor:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateVendor = useCallback(async (updates: Partial<Vendor>) => {
    return new Promise<Vendor>((resolve, reject) => {
      setVendor((currentVendor) => {
        if (!currentVendor) {
          reject(new Error('No vendor'));
          return currentVendor;
        }

        supabase
          .from('vendors')
          .update(updates)
          .eq('id', currentVendor.id)
          .select()
          .single()
          .then(({ data, error }) => {
            if (error) {
              reject(error);
            } else {
              setVendor(data as Vendor);
              resolve(data as Vendor);
            }
          })
          .catch(reject);

        return currentVendor;
      });
    });
  }, []);

  return useMemo(() => ({
    vendor,
    loading,
    updateVendor,
    refetch,
  }), [vendor, loading, updateVendor, refetch]);
}
