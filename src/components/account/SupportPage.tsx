import { useState } from 'react';
import {
  HeadphonesIcon, Plus, MessageSquare, Clock, Sparkles, X,
  CheckCircle2, AlertCircle, Mail, ExternalLink,
} from 'lucide-react';

interface SupportPageProps { onBack?: () => void; }

interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  orderId?: string;
  createdAt: string;
  updatedAt: string;
}

const mockTickets: SupportTicket[] = [
  {
    id: '1', subject: 'Question about my order #ORD-20260315-7821',
    status: 'open', priority: 'medium', orderId: 'ORD-20260315-7821',
    createdAt: '2026-04-05T10:30:00Z', updatedAt: '2026-04-05T10:30:00Z',
  },
];

const statusColors: Record<string, string> = {
  open: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  in_progress: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  waiting_customer: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
  resolved: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  closed: 'bg-surface-deep text-secondary',
};

export default function SupportPage({ onBack }: SupportPageProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>(mockTickets);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [subject, setSubject] = useState('');
  const [orderId, setOrderId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmitTicket = () => {
    if (!subject || !message) {
      setSuccessMessage('Please fill in subject and message');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      const newTicket: SupportTicket = {
        id: Date.now().toString(),
        subject,
        status: 'open',
        priority: priority as SupportTicket['priority'],
        orderId: orderId || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTickets(prev => [newTicket, ...prev]);
      setShowNewTicket(false);
      setSubject(''); setOrderId(''); setPriority('medium'); setMessage('');
      setSubmitting(false);
      setSuccessMessage('Support ticket created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface border border-default rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">Get Help</span>
        </div>
        <h2 className="text-2xl font-bold text-primary mb-2">Support Center</h2>
        <p className="text-secondary">Get help with your orders and account. We're here to assist you every step of the way.</p>
      </div>

      {/* Success/Error Message */}
      {successMessage && (
        <div className={`rounded-xl p-4 flex items-center gap-3 ${
          successMessage.includes('Please')
            ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
        }`}>
          {successMessage.includes('Please') ? (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          )}
          <p className={`font-medium ${
            successMessage.includes('Please')
              ? 'text-red-700 dark:text-red-400'
              : 'text-green-700 dark:text-green-400'
          }`}>{successMessage}</p>
        </div>
      )}

      {/* New Ticket Form */}
      {showNewTicket && (
        <div className="bg-surface border border-default rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-primary">Create Support Ticket</h3>
            <button onClick={() => setShowNewTicket(false)} className="p-2 hover:bg-surface-elevated rounded-lg transition-colors">
              <X className="w-5 h-5 text-primary" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Subject *</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of your issue"
                className="w-full px-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">
                Related Order <span className="text-muted">(Optional)</span>
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Order number (e.g., ORD-20260315-7821)"
                className="w-full px-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Message *</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue in detail..."
                rows={5}
                className="w-full px-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSubmitTicket}
                disabled={submitting}
                className="flex-1 gradient-purple-soul text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
              <button
                onClick={() => setShowNewTicket(false)}
                className="px-6 py-3 border border-default rounded-xl text-secondary hover:text-primary transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Support Tickets List */}
      <div className="bg-surface border border-default rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <HeadphonesIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Support Tickets
            </h3>
            <p className="text-sm text-secondary">Track all your support requests in one place</p>
          </div>
          <button
            onClick={() => setShowNewTicket(true)}
            className="gradient-purple-soul text-white px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Ticket
          </button>
        </div>

        {tickets.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-surface-elevated border border-default">
              <MessageSquare className="w-10 h-10 text-muted" />
            </div>
            <h4 className="text-xl font-bold text-primary mb-2">No support tickets</h4>
            <p className="text-secondary mb-6">We're here to help if you need us</p>
            <button
              onClick={() => setShowNewTicket(true)}
              className="gradient-purple-soul text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create Support Ticket
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map(ticket => (
              <div key={ticket.id} className="p-5 bg-surface-elevated border border-default rounded-xl hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-primary">{ticket.subject}</h4>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${statusColors[ticket.status]}`}>
                        {ticket.status.replace(/_/g, ' ')}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${
                        ticket.priority === 'urgent' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                        ticket.priority === 'high' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                        'bg-surface-deep text-secondary'
                      }`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-secondary">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Created {new Date(ticket.createdAt).toLocaleString()}
                      </span>
                      {ticket.orderId && (
                        <span className="text-purple-600 dark:text-purple-400">Order #{ticket.orderId}</span>
                      )}
                    </div>
                  </div>
                  <button className="px-3 py-2 border border-default rounded-lg text-sm text-secondary hover:text-primary transition-colors flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4" /> View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border border-default rounded-2xl p-6">
          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-3">
            <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h4 className="font-bold text-primary mb-2">Email Support</h4>
          <p className="text-sm text-secondary mb-3">Get in touch with our support team</p>
          <p className="text-sm font-medium text-purple-600 dark:text-purple-400">support@purplesoul.com</p>
        </div>

        <div className="bg-surface border border-default rounded-2xl p-6">
          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h4 className="font-bold text-primary mb-2">Response Time</h4>
          <p className="text-sm text-secondary mb-3">We typically respond within</p>
          <p className="text-sm font-medium text-primary">24 hours</p>
        </div>

        <div className="bg-surface border border-default rounded-2xl p-6">
          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-3">
            <ExternalLink className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h4 className="font-bold text-primary mb-2">Help Center</h4>
          <p className="text-sm text-secondary mb-3">Find answers to common questions</p>
          <button className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
            Visit Help Center →
          </button>
        </div>
      </div>
    </div>
  );
}
