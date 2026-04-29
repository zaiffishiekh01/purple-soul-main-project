import { useState } from 'react';
import { HelpCircle, MessageSquare, Book, Mail, Plus, Search, ChevronDown, FileText } from 'lucide-react';
import { SupportTicket } from '../hooks/useSupportTickets';

interface SupportProps {
  tickets: SupportTicket[];
  onCreateTicket: () => void;
  onViewDetails: (ticket: SupportTicket) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNavigateToFeeSupport?: () => void;
}

export function Support({ tickets, onCreateTicket, onViewDetails, searchQuery, onSearchChange, onNavigateToFeeSupport }: SupportProps) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const getStatusColor = (status: string) => {
    const colors = {
      open: 'bg-blue-100 text-blue-700 border-blue-200',
      in_progress: 'bg-yellow-100 text-yellow-700 border-yellow-200',
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
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl cursor-pointer hover:shadow-2xl transition-shadow">
          <div className="p-3 bg-white/20 rounded-xl inline-block mb-4">
            <Book className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold mb-2">Knowledge Base</h3>
          <p className="text-sm opacity-90">Browse articles and guides</p>
        </div>

        <div
          onClick={onCreateTicket}
          className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl cursor-pointer hover:shadow-2xl transition-shadow"
        >
          <div className="p-3 bg-white/20 rounded-xl inline-block mb-4">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold mb-2">Create Ticket</h3>
          <p className="text-sm opacity-90">Get help from our team</p>
        </div>

        <div
          onClick={onNavigateToFeeSupport}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl cursor-pointer hover:shadow-2xl transition-shadow"
        >
          <div className="p-3 bg-white/20 rounded-xl inline-block mb-4">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold mb-2">Fee Support Program</h3>
          <p className="text-sm opacity-90">Request fee reduction</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl cursor-pointer hover:shadow-2xl transition-shadow">
          <div className="p-3 bg-white/20 rounded-xl inline-block mb-4">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold mb-2">Email Support</h3>
          <p className="text-sm opacity-90">support@sufiscience.com</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4 justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Your Support Tickets</h3>
            <p className="text-sm text-gray-600 mt-1">Track and manage your support requests</p>
          </div>
          <button
            onClick={onCreateTicket}
            className="px-6 py-3 bg-gradient-to-r from-sufi-purple to-sufi-dark text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            New Ticket
          </button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search tickets..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30 focus:border-sufi-purple transition-all"
            />
          </div>
        </div>

        {tickets.length > 0 ? (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-5 border border-gray-200 rounded-xl hover:border-sufi-purple hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
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
                    <h4 className="font-semibold text-gray-900 mb-1">{ticket.subject}</h4>
                    <p className="text-sm text-gray-600">
                      Created {new Date(ticket.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => onViewDetails(ticket)}
                    className="px-4 py-2 bg-sufi-light/30 text-sufi-dark rounded-lg hover:bg-sufi-light/50 transition-colors text-sm font-medium whitespace-nowrap"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="w-20 h-20 bg-sufi-light/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-10 h-10 text-sufi-purple" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No support tickets yet</h3>
            <p className="text-gray-600 mb-6">Need help? Create a support ticket and we'll assist you</p>
            <button
              onClick={onCreateTicket}
              className="px-6 py-3 bg-gradient-to-r from-sufi-purple to-sufi-dark text-white rounded-xl hover:shadow-lg transition-all inline-flex items-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Your First Ticket
            </button>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-sufi-light to-purple-100 rounded-2xl p-6 border border-sufi-purple/20">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
        <div className="space-y-3">
          {[
            {
              question: 'How do I update my payout settings?',
              answer:
                'Navigate to the Finance section and click on "Update Payout Settings" at the bottom of the page. You can configure your payout frequency (daily, weekly, bi-weekly, or monthly), payout day, payment method, and bank account details.',
            },
            {
              question: 'What are the shipping carrier options?',
              answer:
                'We currently support major carriers including UPS, FedEx, USPS, and DHL. You can create shipping labels for any of these carriers directly from the Shipping Management section. Each carrier offers different service levels and pricing options.',
            },
            {
              question: 'How do I handle returns and refunds?',
              answer:
                'Go to the Returns section to view all return requests. You can approve or reject requests, mark items as received once they arrive at your warehouse, and process refunds. The system tracks the entire return workflow from request to refund completion.',
            },
            {
              question: 'How can I export my transaction history?',
              answer:
                'In the Finance section, click the "Export" button at the top right of the transaction history table. This will download a CSV file containing all your transactions with dates, types, descriptions, amounts, and status information.',
            },
            {
              question: 'How do I add new products to my catalog?',
              answer:
                'Go to the Products section and click "Add Product". Fill in the product details including name, description, SKU, pricing, and upload images. You can also bulk upload products using a CSV file for faster inventory management.',
            },
            {
              question: 'What should I do if an order is delayed?',
              answer:
                'Visit the Orders section, find the specific order, and update its status. You can add notes to communicate with customers and update shipping information. Consider reaching out to the customer through their contact details to keep them informed.',
            },
          ].map((faq, index) => (
            <div key={index} className="bg-white rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full text-left p-4 hover:bg-gray-50 transition-all flex items-center justify-between"
              >
                <p className="font-medium text-gray-900">{faq.question}</p>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    expandedFaq === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedFaq === index && (
                <div className="px-4 pb-4 pt-0">
                  <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
