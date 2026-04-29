import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { Label } from '../hooks/useLabels';

interface LabelManagementProps {
  labels: Label[];
  onAddLabel: () => void;
  onEditLabel?: (labelId: string) => void;
  onDeleteLabel?: (labelId: string) => void;
}

export function LabelManagement({ labels, onAddLabel, onEditLabel, onDeleteLabel }: LabelManagementProps) {
  const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Manage Labels</h3>
            <p className="text-sm text-gray-600 mt-1">Organize orders with custom labels and tags</p>
          </div>
          <button
            onClick={onAddLabel}
            className="px-6 py-3 bg-gradient-to-r from-sufi-purple to-sufi-dark text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            New Label
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {labels.map((label) => (
            <div
              key={label.id}
              className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all group"
              style={{ borderLeftWidth: '4px', borderLeftColor: label.color }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${label.color}20` }}
                  >
                    <Tag className="w-5 h-5" style={{ color: label.color }} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{label.name}</h4>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onEditLabel && (
                    <button
                      onClick={() => onEditLabel(label.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
                  {onDeleteLabel && (
                    <button
                      onClick={() => onDeleteLabel(label.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600">{label.description}</p>
            </div>
          ))}
        </div>

        {labels.length === 0 && (
          <div className="py-12 text-center">
            <div className="w-20 h-20 bg-sufi-light/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="w-10 h-10 text-sufi-purple" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No labels yet</h3>
            <p className="text-gray-600 mb-6">Create labels to organize and categorize your orders</p>
            <button
              onClick={onAddLabel}
              className="px-6 py-3 bg-gradient-to-r from-sufi-purple to-sufi-dark text-white rounded-xl hover:shadow-lg transition-all inline-flex items-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Your First Label
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Color Palette</h3>
        <div className="flex gap-3 flex-wrap">
          {colors.map((color, index) => (
            <div
              key={index}
              className="w-12 h-12 rounded-lg cursor-pointer hover:scale-110 transition-transform shadow-md"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
