import { useState } from 'react';
import { MapPin, Plus, Edit, Trash2, Home, Briefcase, Gift, Check, X } from 'lucide-react';

interface AddressesPageProps {
  onBack?: () => void;
}

interface Address {
  id: string;
  label: string;
  name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal: string;
  country: string;
  phone: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
}

const initialAddresses: Address[] = [
  { id: '1', label: 'Home', name: 'Sarah Johnson', line1: '123 Main Street', line2: 'Apt 4B', city: 'New York', state: 'NY', postal: '10001', country: 'US', phone: '(555) 123-4567', isDefaultShipping: true, isDefaultBilling: true },
  { id: '2', label: 'Work', name: 'Sarah Johnson', line1: '456 Business Ave', line2: 'Suite 200', city: 'New York', state: 'NY', postal: '10002', country: 'US', phone: '(555) 987-6543', isDefaultShipping: false, isDefaultBilling: false },
];

const emptyAddress: Omit<Address, 'id'> = { label: 'Home', name: '', line1: '', line2: '', city: '', state: '', postal: '', country: 'US', phone: '', isDefaultShipping: false, isDefaultBilling: false };

export default function AddressesPage({ onBack }: AddressesPageProps) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [editing, setEditing] = useState<Address | null>(null);
  const [formData, setFormData] = useState(emptyAddress);
  const [showForm, setShowForm] = useState(false);

  const handleSave = () => {
    if (editing) {
      setAddresses(prev => prev.map(a => a.id === editing.id ? { ...formData, id: editing.id } : a));
    } else {
      setAddresses(prev => [...prev, { ...formData, id: Date.now().toString() }]);
    }
    setShowForm(false);
    setEditing(null);
    setFormData(emptyAddress);
  };

  const handleDelete = (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  const getIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case 'home': return <Home className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'work': return <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'gift': return <Gift className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      default: return <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-surface border border-default rounded-2xl p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-primary">Address Book</h2>
          <button
            onClick={() => { setShowForm(true); setEditing(null); setFormData(emptyAddress); }}
            className="gradient-purple-soul text-white px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Address
          </button>
        </div>
        <p className="text-secondary">Manage your saved addresses for faster checkout</p>
      </div>

      {showForm && (
        <div className="bg-surface border border-default rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-primary">{editing ? 'Edit Address' : 'New Address'}</h3>
            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-surface-elevated rounded-lg transition-colors">
              <X className="w-5 h-5 text-primary" />
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Label</label>
              <select
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="w-full px-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option>Home</option><option>Work</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Recipient Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-secondary mb-1">Address Line 1</label>
              <input type="text" value={formData.line1} onChange={(e) => setFormData({ ...formData, line1: e.target.value })} className="w-full px-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-secondary mb-1">Address Line 2</label>
              <input type="text" value={formData.line2} onChange={(e) => setFormData({ ...formData, line2: e.target.value })} className="w-full px-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">City</label>
              <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full px-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">State</label>
              <input type="text" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="w-full px-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Postal Code</label>
              <input type="text" value={formData.postal} onChange={(e) => setFormData({ ...formData, postal: e.target.value })} className="w-full px-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Phone</label>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 border border-default rounded-xl bg-surface-elevated text-primary focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.isDefaultShipping} onChange={(e) => setFormData({ ...formData, isDefaultShipping: e.target.checked })} className="w-4 h-4 text-purple-600 rounded" />
              <span className="text-sm text-secondary">Default shipping</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.isDefaultBilling} onChange={(e) => setFormData({ ...formData, isDefaultBilling: e.target.checked })} className="w-4 h-4 text-purple-600 rounded" />
              <span className="text-sm text-secondary">Default billing</span>
            </label>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={handleSave} className="gradient-purple-soul text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all">Save Address</button>
            <button onClick={() => setShowForm(false)} className="px-6 py-3 border border-default rounded-xl text-secondary hover:text-primary transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {addresses.length === 0 ? (
        <div className="bg-surface border border-default rounded-2xl p-12 text-center">
          <MapPin className="w-16 h-16 text-muted mx-auto mb-4" />
          <h3 className="text-xl font-bold text-primary mb-2">No addresses yet</h3>
          <p className="text-secondary mb-6">Add your first address to get started</p>
          <button onClick={() => setShowForm(true)} className="gradient-purple-soul text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Address
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="bg-surface border border-default rounded-2xl p-6 hover:shadow-theme-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getIcon(addr.label)}
                  <div>
                    <h3 className="font-bold text-primary">{addr.label}</h3>
                    <p className="text-sm text-secondary">{addr.name}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditing(addr); setFormData(addr); setShowForm(true); }} className="p-2 hover:bg-surface-elevated rounded-lg transition-colors text-muted hover:text-primary">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(addr.id)} className="p-2 hover:bg-surface-elevated rounded-lg transition-colors text-muted hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-1 text-sm text-secondary mb-4">
                <p>{addr.line1}</p>
                {addr.line2 && <p>{addr.line2}</p>}
                <p>{addr.city}, {addr.state} {addr.postal}</p>
                <p>{addr.phone}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {addr.isDefaultShipping && <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full flex items-center gap-1"><Check className="w-3 h-3" /> Default Shipping</span>}
                {addr.isDefaultBilling && <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full flex items-center gap-1"><Check className="w-3 h-3" /> Default Billing</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
