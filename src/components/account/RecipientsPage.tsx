import { useState } from 'react';
import { Users, Plus, Mail, MapPin, Edit, Trash2, X } from 'lucide-react';

interface RecipientsPageProps { onBack?: () => void; }

interface Recipient {
  id: string; name: string; email: string; relationship: string;
  address: string; city: string; state: string; postal: string;
}

const mockRecipients: Recipient[] = [
  { id: '1', name: 'Mom', email: 'mom@example.com', relationship: 'Family', address: '123 Family St', city: 'Boston', state: 'MA', postal: '02101' },
  { id: '2', name: 'John Smith', email: 'john@example.com', relationship: 'Friend', address: '456 Friend Ave', city: 'Chicago', state: 'IL', postal: '60601' },
  { id: '3', name: 'Office Manager', email: 'office@work.com', relationship: 'Work', address: '789 Business Blvd', city: 'New York', state: 'NY', postal: '10001' },
];

export default function RecipientsPage({ onBack }: RecipientsPageProps) {
  const [recipients, setRecipients] = useState(mockRecipients);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<Recipient, 'id'>>({ name: '', email: '', relationship: 'Family', address: '', city: '', state: '', postal: '' });

  const handleSave = () => {
    setRecipients([...recipients, { ...form, id: Date.now().toString() }]);
    setShowForm(false);
    setForm({ name: '', email: '', relationship: 'Family', address: '', city: '', state: '', postal: '' });
  };

  return (
    <div className="space-y-6">
      <div className="bg-surface border border-default rounded-2xl p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-primary">Recipients</h2>
          <button onClick={() => setShowForm(true)} className="gradient-purple-soul text-white px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center gap-2"><Plus className="w-4 h-4" /> Add Recipient</button>
        </div>
        <p className="text-secondary">Saved people for sending gifts</p>
      </div>

      {showForm && (
        <div className="bg-surface border border-default rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6"><h3 className="text-lg font-bold text-primary">New Recipient</h3><button onClick={() => setShowForm(false)} className="p-2 hover:bg-surface-elevated rounded-lg"><X className="w-5 h-5 text-primary" /></button></div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-secondary mb-1">Name</label><input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
            <div><label className="block text-sm font-medium text-secondary mb-1">Email</label><input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full px-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium text-secondary mb-1">Relationship</label><select value={form.relationship} onChange={(e) => setForm({...form, relationship: e.target.value})} className="w-full px-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500"><option>Family</option><option>Friend</option><option>Work</option><option>Other</option></select></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium text-secondary mb-1">Address</label><input type="text" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} className="w-full px-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
            <div><label className="block text-sm font-medium text-secondary mb-1">City</label><input type="text" value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} className="w-full px-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
            <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-secondary mb-1">State</label><input type="text" value={form.state} onChange={(e) => setForm({...form, state: e.target.value})} className="w-full px-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500" /></div><div><label className="block text-sm font-medium text-secondary mb-1">Postal</label><input type="text" value={form.postal} onChange={(e) => setForm({...form, postal: e.target.value})} className="w-full px-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500" /></div></div>
          </div>
          <button onClick={handleSave} className="gradient-purple-soul text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all mt-6">Save Recipient</button>
        </div>
      )}

      {recipients.length === 0 ? (
        <div className="bg-surface border border-default rounded-2xl p-12 text-center"><Users className="w-16 h-16 text-muted mx-auto mb-4" /><h3 className="text-xl font-bold text-primary mb-2">No recipients yet</h3><p className="text-secondary">Add people to send gifts to</p></div>
      ) : (
        <div className="space-y-4">
          {recipients.map(r => (
            <div key={r.id} className="bg-surface border border-default rounded-2xl p-6 hover:shadow-theme-lg transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center"><Users className="w-6 h-6 text-purple-600 dark:text-purple-400" /></div>
                  <div>
                    <h3 className="font-bold text-primary">{r.name}</h3>
                    <p className="text-sm text-secondary flex items-center gap-1"><Mail className="w-3 h-3" /> {r.email}</p>
                    <p className="text-sm text-secondary flex items-center gap-1"><MapPin className="w-3 h-3" /> {r.address}, {r.city}, {r.state} {r.postal}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-surface-elevated text-xs rounded-full text-secondary">{r.relationship}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-surface-elevated rounded-lg transition-colors text-muted hover:text-primary"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => setRecipients(prev => prev.filter(x => x.id !== r.id))} className="p-2 hover:bg-surface-elevated rounded-lg transition-colors text-muted hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
