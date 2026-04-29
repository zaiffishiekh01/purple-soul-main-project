import { useState } from 'react';
import { CreditCard, Plus, Shield, Lock, X, Trash2, Check, AlertCircle } from 'lucide-react';

interface PaymentsPageProps { onBack?: () => void; }

interface SavedCard {
  id: string;
  type: string;
  last4: string;
  expiry: string;
  name: string;
  isDefault: boolean;
}

export default function PaymentsPage({ onBack }: PaymentsPageProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [cards, setCards] = useState<SavedCard[]>([
    { id: '1', type: 'Visa', last4: '4242', expiry: '12/28', name: 'Sarah Johnson', isDefault: true },
    { id: '2', type: 'Mastercard', last4: '8765', expiry: '06/27', name: 'Sarah Johnson', isDefault: false },
  ]);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

  const getCardIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'visa': return '💳';
      case 'mastercard': return '💳';
      case 'amex': return '💳';
      default: return '💳';
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : v;
  };

  const handleAddCard = () => {
    if (!cardNumber || !cardName || !expMonth || !expYear || !cvv) {
      return;
    }

    const cardType = cardNumber.startsWith('4') ? 'Visa' : cardNumber.startsWith('5') ? 'Mastercard' : 'Credit Card';
    const last4 = cardNumber.replace(/\s/g, '').slice(-4);

    const newCard: SavedCard = {
      id: Date.now().toString(),
      type: cardType,
      last4,
      expiry: `${expMonth}/${expYear}`,
      name: cardName,
      isDefault: cards.length === 0 || setAsDefault,
    };

    setCards(prev => {
      if (setAsDefault) {
        return prev.map(c => ({ ...c, isDefault: false })).concat(newCard);
      }
      return [...prev, newCard];
    });

    setShowAddForm(false);
    setCardNumber('');
    setCardName('');
    setExpMonth('');
    setExpYear('');
    setCvv('');
    setSetAsDefault(false);
    setSuccessMessage('Payment method added successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleRemoveCard = (id: string) => {
    setRemovingId(id);
    setTimeout(() => {
      setCards(prev => prev.filter(c => c.id !== id));
      setRemovingId(null);
      setSuccessMessage('Payment method removed');
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 500);
  };

  const handleSetDefault = (id: string) => {
    setCards(prev => prev.map(c => ({ ...c, isDefault: c.id === id })));
    setSuccessMessage('Default payment method updated');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface border border-default rounded-2xl p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-primary">Payment Methods</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="gradient-purple-soul text-white px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Payment Method
          </button>
        </div>
        <p className="text-secondary">Securely manage your saved payment methods for faster checkout</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-700 dark:text-green-400 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Add Card Form */}
      {showAddForm && (
        <div className="bg-surface border border-default rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-primary">Add Payment Method</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-2 hover:bg-surface-elevated rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-primary" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Card Number</label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="w-full px-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Cardholder Name</label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Month</label>
                <select
                  value={expMonth}
                  onChange={(e) => setExpMonth(e.target.value)}
                  className="w-full px-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">MM</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                      {String(i + 1).padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Year</label>
                <select
                  value={expYear}
                  onChange={(e) => setExpYear(e.target.value)}
                  className="w-full px-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">YY</option>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() + i;
                    return (
                      <option key={year} value={String(year).slice(-2)}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">CVV</label>
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="123"
                  maxLength={4}
                  className="w-full px-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer p-3 bg-surface-elevated rounded-lg">
              <input
                type="checkbox"
                checked={setAsDefault}
                onChange={(e) => setSetAsDefault(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="text-sm text-primary">Set as default payment method</span>
            </label>

            <div className="flex items-center gap-2 text-sm text-secondary p-3 bg-surface-elevated rounded-lg">
              <Lock className="w-4 h-4 text-green-600 flex-shrink-0" />
              Your payment information is encrypted and secure
            </div>

            <button
              onClick={handleAddCard}
              disabled={!cardNumber || !cardName || !expMonth || !expYear || !cvv}
              className="w-full gradient-purple-soul text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Payment Method
            </button>
          </div>
        </div>
      )}

      {/* Saved Cards */}
      <div className="bg-surface border border-default rounded-2xl p-6">
        <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-purple-600" />
          Saved Payment Methods
        </h3>

        {cards.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-muted mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-primary mb-2">No payment methods yet</h4>
            <p className="text-secondary mb-6">Add a payment method for faster checkout</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="gradient-purple-soul text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Payment Method
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {cards.map(card => (
              <div
                key={card.id}
                className="p-4 bg-surface-elevated border border-default rounded-xl hover:border-purple-300 dark:hover:border-purple-700 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center text-white text-lg shadow-md">
                      {getCardIcon(card.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-primary">{card.type} •••• {card.last4}</p>
                        {card.isDefault && (
                          <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full font-medium">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-secondary">
                        Expires {card.expiry} • {card.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!card.isDefault && (
                      <button
                        onClick={() => handleSetDefault(card.id)}
                        className="px-3 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveCard(card.id)}
                      disabled={removingId === card.id}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {removingId === card.id ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security Info */}
      <div className="bg-surface border border-default rounded-2xl p-6">
        <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-600" />
          Payment Security
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-primary">End-to-end encryption</p>
              <p className="text-sm text-secondary">All transactions are encrypted with 256-bit SSL</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-primary">PCI DSS Compliant</p>
              <p className="text-sm text-secondary">We never store your full card number or CVV</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-primary">Secure payment gateways</p>
              <p className="text-sm text-secondary">Cards are processed through trusted payment processors</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-primary">Manage anytime</p>
              <p className="text-sm text-secondary">You can remove payment methods at any time</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
