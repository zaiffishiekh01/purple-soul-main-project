import { useState } from 'react';
import { Gift, CreditCard, Plus, Check, X } from 'lucide-react';

interface GiftCardsPageProps { onBack?: () => void; }

export default function GiftCardsPage({ onBack }: GiftCardsPageProps) {
  const [activeTab, setActiveTab] = useState('active');
  const [showPurchase, setShowPurchase] = useState(false);
  const [showRedeem, setShowRedeem] = useState(false);
  const [amount, setAmount] = useState('');
  const [redeemCode, setRedeemCode] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');

  const activeCards = [
    { id: '1', code: 'GC-XXXX-XXXX-1234', balance: 75.00, original: 100.00, date: '2026-01-15' },
    { id: '2', code: 'GC-XXXX-XXXX-5678', balance: 75.00, original: 75.00, date: '2026-02-20' },
  ];
  const usedCards = [{ id: '3', code: 'GC-XXXX-XXXX-9012', original: 50.00, date: '2025-12-01' }];
  const totalBalance = activeCards.reduce((sum, c) => sum + c.balance, 0);

  return (
    <div className="space-y-6">
      <div className="bg-surface border border-default rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-primary mb-2">Gift Cards</h2>
        <p className="text-secondary">Share the gift of meaningful treasures</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-surface border border-default rounded-2xl p-6">
          <h3 className="font-bold text-primary mb-2">Total Balance</h3>
          <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">${totalBalance.toFixed(2)}</p>
          <p className="text-sm text-secondary mb-4">{activeCards.length} active card{activeCards.length !== 1 ? 's' : ''}</p>
          <button onClick={() => setShowRedeem(true)} className="w-full gradient-purple-soul text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Redeem Gift Card</button>
        </div>
        <div className="bg-surface border border-default rounded-2xl p-6">
          <h3 className="font-bold text-primary mb-2">Send a Gift</h3>
          <ul className="space-y-2 mb-4 text-sm text-secondary">
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> Instant digital delivery</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> Never expires</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600" /> Personal message included</li>
          </ul>
          <button onClick={() => setShowPurchase(true)} className="w-full gradient-purple-soul text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"><Gift className="w-4 h-4" /> Purchase Gift Card</button>
        </div>
      </div>

      <div className="bg-surface border border-default rounded-2xl p-6">
        <div className="flex gap-2 border-b border-default mb-4">
          {['active', 'used', 'sent'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium border-b-2 capitalize transition-colors ${activeTab === tab ? 'border-purple-600 text-purple-600 dark:text-purple-400' : 'border-transparent text-secondary hover:text-primary'}`}>{tab}</button>
          ))}
        </div>
        {activeTab === 'active' && activeCards.length === 0 && (<div className="text-center py-8 text-secondary"><CreditCard className="w-12 h-12 mx-auto mb-3 text-muted" /><p>No active gift cards</p></div>)}
        {activeTab === 'active' && activeCards.length > 0 && (
          <div className="space-y-4">
            {activeCards.map(card => (
              <div key={card.id} className="p-4 bg-surface-elevated border border-default rounded-xl">
                <div className="flex items-start justify-between mb-3">
                  <div><p className="font-semibold text-primary">Gift Card</p><code className="text-sm text-secondary">{card.code}</code></div>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">Active</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-secondary mb-1">Current Balance</p><p className="text-lg font-bold text-purple-600 dark:text-purple-400">${card.balance.toFixed(2)}</p></div>
                  <div><p className="text-xs text-secondary mb-1">Original Amount</p><p className="font-semibold text-primary">${card.original.toFixed(2)}</p></div>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'used' && usedCards.length === 0 && (<div className="text-center py-8 text-secondary"><p>No used gift cards</p></div>)}
        {activeTab === 'used' && usedCards.length > 0 && (
          <div className="space-y-4 opacity-60">
            {usedCards.map(card => (
              <div key={card.id} className="p-4 bg-surface-elevated border border-default rounded-xl">
                <div className="flex items-start justify-between mb-3">
                  <div><p className="font-semibold text-primary">Gift Card</p><code className="text-sm text-secondary">{card.code}</code></div>
                  <span className="px-2 py-1 bg-surface-deep text-secondary text-xs rounded-full">Used</span>
                </div>
                <p className="text-sm text-secondary">Original: ${card.original.toFixed(2)} - Fully Used</p>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'sent' && <div className="text-center py-8 text-secondary"><Gift className="w-12 h-12 mx-auto mb-3 text-muted" /><p>No sent gift cards</p></div>}
      </div>

      {showPurchase && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-default rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-primary">Purchase Gift Card</h3><button onClick={() => setShowPurchase(false)}><X className="w-5 h-5 text-primary" /></button></div>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2">{[25, 50, 100, 250].map(a => (<button key={a} onClick={() => setAmount(a.toString())} className={`p-3 rounded-xl border text-center font-bold transition-colors ${amount === a.toString() ? 'border-purple-600 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'border-default text-primary hover:border-purple-300'}`}>${a}</button>))}</div>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Or custom amount" className="w-full px-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500" />
              <input type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="Recipient email" className="w-full px-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500" />
              <button onClick={() => setShowPurchase(false)} className="w-full gradient-purple-soul text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all">Purchase</button>
            </div>
          </div>
        </div>
      )}

      {showRedeem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-default rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-primary">Redeem Gift Card</h3><button onClick={() => setShowRedeem(false)}><X className="w-5 h-5 text-primary" /></button></div>
            <input type="text" value={redeemCode} onChange={(e) => setRedeemCode(e.target.value)} placeholder="Gift card code" className="w-full px-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4" />
            <button onClick={() => setShowRedeem(false)} className="w-full gradient-purple-soul text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all">Redeem</button>
          </div>
        </div>
      )}
    </div>
  );
}
