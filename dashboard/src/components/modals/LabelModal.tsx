import { useState, useEffect } from 'react';
import { X, Save, Tag } from 'lucide-react';
import { Label } from '../../hooks/useLabels';

interface LabelModalProps {
  label: Label | null;
  onClose: () => void;
  onSave: (label: Partial<Label>) => Promise<void>;
}

const PRESET_COLORS = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#84CC16', '#06B6D4'
];

export function LabelModal({ label, onClose, onSave }: LabelModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    color: '#8B5CF6',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (label) {
      setFormData({
        name: label.name,
        color: label.color,
        description: label.description,
      });
    }
  }, [label]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving label:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full">
        <div className="border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${formData.color}20` }}
            >
              <Tag className="w-6 h-6" style={{ color: formData.color }} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {label ? 'Edit Label' : 'Create New Label'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Label Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30 focus:border-sufi-purple transition-all"
              placeholder="e.g., Urgent, Gift Order, Wholesale"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sufi-purple/30 focus:border-sufi-purple transition-all resize-none"
              placeholder="What is this label for?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Label Color</label>
            <div className="grid grid-cols-5 gap-3">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-full h-12 rounded-lg transition-all hover:scale-110 ${
                    formData.color === color
                      ? 'ring-4 ring-offset-2 ring-gray-400 scale-110'
                      : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-12 h-12 rounded-lg cursor-pointer"
              />
              <span className="text-sm text-gray-600">Or pick a custom color</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium"
              style={{ backgroundColor: `${formData.color}20`, color: formData.color }}
            >
              <Tag className="w-4 h-4" />
              {formData.name || 'Label Preview'}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-sufi-purple to-sufi-dark text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Saving...' : 'Save Label'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
