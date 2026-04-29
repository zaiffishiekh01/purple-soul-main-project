import { useState, useEffect } from 'react';
import { X, Gift, Plus, Check, Heart, Calendar, Users, Sparkles, Crown, Home, Baby, Search, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Registry {
  id: string;
  registry_type: string;
  faith_tradition: string;
  primary_name: string;
  secondary_name: string | null;
  event_date: string | null;
  registry_url_slug: string;
}

interface AddToRegistryModalProps {
  product: any;
  onClose: () => void;
  onSuccess?: () => void;
  currentUserId?: string;
}

export default function AddToRegistryModal({ product, onClose, onSuccess, currentUserId }: AddToRegistryModalProps) {
  const [registries, setRegistries] = useState<Registry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegistry, setSelectedRegistry] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showCreateNew, setShowCreateNew] = useState(false);

  useEffect(() => {
    loadUserRegistries();
  }, [currentUserId]);

  const loadUserRegistries = async () => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('celebration_registries')
        .select('*')
        .eq('user_id', currentUserId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRegistries(data || []);
    } catch (err) {
      console.error('Error loading registries:', err);
      setError('Failed to load your registries');
    } finally {
      setLoading(false);
    }
  };

  const getRegistryIcon = (type: string) => {
    switch (type) {
      case 'wedding':
        return Heart;
      case 'celebration':
        return Sparkles;
      case 'remembrance':
        return Crown;
      case 'home-blessing':
        return Home;
      case 'family-gift':
        return Baby;
      default:
        return Gift;
    }
  };

  const getRegistryColor = (type: string) => {
    switch (type) {
      case 'wedding':
        return 'from-pink-500 to-rose-500';
      case 'celebration':
        return 'from-purple-500 to-pink-500';
      case 'remembrance':
        return 'from-amber-500 to-orange-500';
      case 'home-blessing':
        return 'from-blue-500 to-cyan-500';
      case 'family-gift':
        return 'from-green-500 to-teal-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const handleAddToRegistry = async () => {
    if (!selectedRegistry) {
      setError('Please select a registry');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Check if product already exists in registry
      const { data: existingItem } = await supabase
        .from('celebration_registry_items')
        .select('*')
        .eq('registry_id', selectedRegistry)
        .eq('product_id', product.id)
        .single();

      if (existingItem) {
        // Update existing item
        const { error: updateError } = await supabase
          .from('celebration_registry_items')
          .update({
            quantity_requested: existingItem.quantity_requested + quantity,
            priority,
            notes
          })
          .eq('id', existingItem.id);

        if (updateError) throw updateError;
      } else {
        // Create new item
        const { error: insertError } = await supabase
          .from('celebration_registry_items')
          .insert({
            registry_id: selectedRegistry,
            product_id: product.id,
            quantity_requested: quantity,
            quantity_purchased: 0,
            priority,
            notes
          });

        if (insertError) throw insertError;
      }

      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error adding to registry:', err);
      setError('Failed to add product to registry');
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Added to Registry!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {product.name} has been added to your registry
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full my-8">
        <div className="border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gift className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add to Registry</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
              {error}
            </div>
          )}

          {/* Product Summary */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl flex gap-4">
            <img src={product.image_url} alt={product.name} className="w-20 h-20 object-cover rounded-lg" />
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">{product.name}</h3>
              <p className="text-purple-600 dark:text-purple-400 font-semibold text-lg">${product.price.toFixed(2)}</p>
            </div>
          </div>

          {!currentUserId ? (
            <div className="text-center py-8">
              <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Sign in to Add to Registry
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create an account or sign in to manage your registries
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Sign In
              </button>
            </div>
          ) : loading ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" />
              <p className="text-gray-600 dark:text-gray-400 mt-4">Loading your registries...</p>
            </div>
          ) : registries.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No Registries Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create your first registry to start adding products
              </p>
              <button
                onClick={() => setShowCreateNew(true)}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Create Registry
              </button>
            </div>
          ) : (
            <>
              {/* Select Registry */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select Registry
                  </label>
                  <button
                    onClick={() => setShowCreateNew(true)}
                    className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Create New
                  </button>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {registries.map(registry => {
                    const Icon = getRegistryIcon(registry.registry_type);
                    const colorGradient = getRegistryColor(registry.registry_type);

                    return (
                      <button
                        key={registry.id}
                        onClick={() => setSelectedRegistry(registry.id)}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                          selectedRegistry === registry.id
                            ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 bg-gradient-to-br ${colorGradient} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 dark:text-white truncate">
                              {registry.primary_name}
                              {registry.secondary_name && ` & ${registry.secondary_name}`}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <span className="capitalize">{registry.registry_type.replace('-', ' ')}</span>
                              {registry.event_date && (
                                <>
                                  <span>•</span>
                                  <span>{new Date(registry.event_date).toLocaleDateString()}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            selectedRegistry === registry.id
                              ? 'border-purple-600 bg-purple-600'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {selectedRegistry === registry.id && (
                              <Check className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity & Priority */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity Needed
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any special notes or preferences..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddToRegistry}
                  disabled={!selectedRegistry || saving}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Add to Registry
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
