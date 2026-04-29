import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface SupportTicket {
  id: string;
  vendor_id: string;
  ticket_number: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_type: 'vendor' | 'support';
  message: string;
  attachments: string[];
  created_at: string;
}

export function useSupportTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const { userId } = useAuth();

  useEffect(() => {
    if (userId) {
      fetchTickets();
    } else {
      setTickets([]);
      setLoading(false);
    }
  }, [userId]);

  const fetchTickets = async () => {
    try {
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!vendorData) {
        setTickets([]);
        return;
      }

      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('vendor_id', vendorData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketMessages = async (ticketId: string): Promise<TicketMessage[]> => {
    try {
      const { data, error } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching ticket messages:', error);
      return [];
    }
  };

  const createTicket = async (ticketData: {
    subject: string;
    description: string;
    category: string;
    priority: string;
  }) => {
    try {
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!vendorData) throw new Error('Vendor not found');

      const ticketCount = await supabase
        .from('support_tickets')
        .select('id', { count: 'exact', head: true });

      const ticketNumber = `TKT-${new Date().getFullYear()}-${String(
        (ticketCount.count || 0) + 1
      ).padStart(4, '0')}`;

      const { data: ticket, error } = await supabase
        .from('support_tickets')
        .insert({
          vendor_id: vendorData.id,
          ticket_number: ticketNumber,
          ...ticketData,
        })
        .select()
        .single();

      if (error) throw error;

      const { error: messageError } = await supabase.from('ticket_messages').insert({
        ticket_id: ticket.id,
        sender_type: 'vendor',
        message: ticketData.description,
      });

      if (messageError) throw messageError;

      setTickets((prev) => [ticket, ...prev]);
      return ticket;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  };

  const addMessage = async (ticketId: string, message: string) => {
    try {
      const { error } = await supabase.from('ticket_messages').insert({
        ticket_id: ticketId,
        sender_type: 'vendor',
        message,
      });

      if (error) throw error;

      const { error: updateError } = await supabase
        .from('support_tickets')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', ticketId);

      if (updateError) throw updateError;

      await fetchTickets();
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const updates: any = { status };

      if (status === 'resolved' || status === 'closed') {
        updates.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('support_tickets')
        .update(updates)
        .eq('id', ticketId);

      if (error) throw error;

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, ...updates } : ticket
        )
      );
    } catch (error) {
      console.error('Error updating ticket status:', error);
      throw error;
    }
  };

  const memoizedFetchTicketMessages = useCallback(fetchTicketMessages, []);
  const memoizedCreateTicket = useCallback(createTicket, [userId]);
  const memoizedAddMessage = useCallback(addMessage, [fetchTickets]);
  const memoizedUpdateTicketStatus = useCallback(updateTicketStatus, []);
  const memoizedRefetch = useCallback(fetchTickets, [userId]);

  return useMemo(() => ({
    tickets,
    loading,
    fetchTicketMessages: memoizedFetchTicketMessages,
    createTicket: memoizedCreateTicket,
    addMessage: memoizedAddMessage,
    updateTicketStatus: memoizedUpdateTicketStatus,
    refetch: memoizedRefetch,
  }), [tickets, loading, memoizedFetchTicketMessages, memoizedCreateTicket, memoizedAddMessage, memoizedUpdateTicketStatus, memoizedRefetch]);
}
