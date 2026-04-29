import { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { SupportTicket, TicketMessage } from '../../hooks/useSupportTickets';

interface TicketDetailsModalProps {
  ticket: SupportTicket;
  onClose: () => void;
  onAddMessage: (ticketId: string, message: string) => Promise<void>;
  fetchMessages: (ticketId: string) => Promise<TicketMessage[]>;
}

export function TicketDetailsModal({
  ticket,
  onClose,
  onAddMessage,
  fetchMessages,
}: TicketDetailsModalProps) {
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadMessages();
  }, [ticket.id]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await fetchMessages(ticket.id);
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await onAddMessage(ticket.id, newMessage);
      setNewMessage('');
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'bg-blue-100 text-blue-700 border-blue-200',
      in_progress: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      waiting_response: 'bg-orange-100 text-orange-700 border-orange-200',
      resolved: 'bg-green-100 text-green-700 border-green-200',
      closed: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[status as keyof typeof colors] || colors.open;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-gray-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      urgent: 'text-red-600',
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-sm text-gray-500">{ticket.ticket_number}</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                  ticket.status
                )}`}
              >
                {ticket.status.replace('_', ' ')}
              </span>
              <span className={`text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority.toUpperCase()}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{ticket.subject}</h2>
            <p className="text-sm text-gray-600 mt-1">
              Category: {ticket.category} • Created {new Date(ticket.created_at).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sufi-purple"></div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_type === 'vendor' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    msg.sender_type === 'vendor'
                      ? 'bg-gradient-to-r from-sufi-purple to-sufi-dark text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold opacity-75">
                      {msg.sender_type === 'vendor' ? 'You' : 'Support Team'}
                    </span>
                    <span className="text-xs opacity-60">
                      {new Date(msg.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
          <form
            onSubmit={handleSendMessage}
            className="border-t border-gray-200 p-4 flex gap-3"
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="px-6 py-2 bg-gradient-to-r from-sufi-purple to-sufi-dark text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Sending...' : 'Send'}
            </button>
          </form>
        )}

        {(ticket.status === 'closed' || ticket.status === 'resolved') && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <p className="text-sm text-gray-600 text-center">
              This ticket has been {ticket.status}. Contact support if you need further assistance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
