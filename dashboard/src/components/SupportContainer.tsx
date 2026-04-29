'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Support } from './Support';
import { useSupportTickets, SupportTicket } from '../hooks/useSupportTickets';
import { CreateTicketModal } from './modals/CreateTicketModal';
import { TicketDetailsModal } from './modals/TicketDetailsModal';

export function SupportContainer() {
  const router = useRouter();
  const { tickets, loading, createTicket, addMessage, fetchTicketMessages } =
    useSupportTickets();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateTicket = async (ticketData: {
    subject: string;
    description: string;
    category: string;
    priority: string;
  }) => {
    await createTicket(ticketData);
    setShowCreateModal(false);
  };

  const handleViewDetails = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
  };

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sufi-purple"></div>
      </div>
    );
  }

  return (
    <>
      <Support
        tickets={filteredTickets}
        onCreateTicket={() => setShowCreateModal(true)}
        onViewDetails={handleViewDetails}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNavigateToFeeSupport={() => router.push('/vendor/fee-support')}
      />

      {showCreateModal && (
        <CreateTicketModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateTicket}
        />
      )}

      {selectedTicket && (
        <TicketDetailsModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onAddMessage={addMessage}
          fetchMessages={fetchTicketMessages}
        />
      )}
    </>
  );
}
