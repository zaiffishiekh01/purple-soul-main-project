import { useState, useEffect } from 'react';
import { BookOpen, Save, Plus, Trash2, Eye, EyeOff, Edit2, X } from 'lucide-react';
import { dashboardClient } from '../../lib/data-client';
import { useAuth } from '../../contexts/AuthContext';

interface Guideline {
  id: string;
  title: string;
  content: string;
  section_order: number;
  is_active: boolean;
}

export function AdminGuidelines() {
  const { user } = useAuth();
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', content: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGuideline, setNewGuideline] = useState({ title: '', content: '', section_order: 0 });

  useEffect(() => {
    fetchGuidelines();
  }, []);

  const fetchGuidelines = async () => {
    try {
      const { data, error } = await dashboardClient
        .from('product_guidelines')
        .select('*')
        .order('section_order');

      if (error) throw error;
      setGuidelines(data || []);
    } catch (error) {
      console.error('Error fetching guidelines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (guideline: Guideline) => {
    setEditingId(guideline.id);
    setEditForm({ title: guideline.title, content: guideline.content });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ title: '', content: '' });
  };

  const handleSave = async (id: string) => {
    try {
      const { error } = await dashboardClient
        .from('product_guidelines')
        .update({
          title: editForm.title,
          content: editForm.content,
          updated_at: new Date().toISOString(),
          updated_by: user?.id,
        })
        .eq('id', id);

      if (error) throw error;

      await fetchGuidelines();
      setEditingId(null);
      alert('Guideline updated successfully!');
    } catch (error) {
      console.error('Error updating guideline:', error);
      alert('Failed to update guideline');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await dashboardClient
        .from('product_guidelines')
        .update({
          is_active: !currentStatus,
          updated_at: new Date().toISOString(),
          updated_by: user?.id,
        })
        .eq('id', id);

      if (error) throw error;
      await fetchGuidelines();
    } catch (error) {
      console.error('Error toggling guideline status:', error);
      alert('Failed to update status');
    }
  };

  const handleAddNew = async () => {
    try {
      const { error } = await dashboardClient
        .from('product_guidelines')
        .insert({
          title: newGuideline.title,
          content: newGuideline.content,
          section_order: newGuideline.section_order,
          is_active: true,
          updated_by: user?.id,
        });

      if (error) throw error;

      await fetchGuidelines();
      setShowAddModal(false);
      setNewGuideline({ title: '', content: '', section_order: 0 });
      alert('Guideline added successfully!');
    } catch (error) {
      console.error('Error adding guideline:', error);
      alert('Failed to add guideline');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this guideline?')) return;

    try {
      const { error } = await dashboardClient
        .from('product_guidelines')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchGuidelines();
      alert('Guideline deleted successfully!');
    } catch (error) {
      console.error('Error deleting guideline:', error);
      alert('Failed to delete guideline');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Upload Guidelines</h1>
          <p className="text-gray-600">Manage vendor guidelines for product uploads</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Section
        </button>
      </div>

      <div className="grid gap-6">
        {guidelines.map((guideline) => (
          <div
            key={guideline.id}
            className={`bg-white rounded-xl border-2 p-6 ${
              guideline.is_active ? 'border-gray-200' : 'border-gray-300 bg-gray-50'
            }`}
          >
            {editingId === guideline.id ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section Title
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                    <span className="text-xs text-gray-500 ml-2">
                      (Use # for headings, ## for subheadings, - for bullets)
                    </span>
                  </label>
                  <textarea
                    value={editForm.content}
                    onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                    rows={12}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleSave(guideline.id)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">
                      {guideline.section_order}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{guideline.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {guideline.is_active ? 'Visible to vendors' : 'Hidden from vendors'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(guideline.id, guideline.is_active)}
                      className={`p-2 rounded-lg transition-colors ${
                        guideline.is_active
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                      title={guideline.is_active ? 'Hide from vendors' : 'Show to vendors'}
                    >
                      {guideline.is_active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => handleEdit(guideline)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Edit guideline"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(guideline.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      title="Delete guideline"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                    {guideline.content}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Add New Guideline Section</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Title
                </label>
                <input
                  type="text"
                  value={newGuideline.title}
                  onChange={(e) => setNewGuideline({ ...newGuideline, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Image Requirements"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Order
                </label>
                <input
                  type="number"
                  value={newGuideline.section_order}
                  onChange={(e) =>
                    setNewGuideline({ ...newGuideline, section_order: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Display order (e.g., 1, 2, 3)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                  <span className="text-xs text-gray-500 ml-2">
                    (Use # for headings, ## for subheadings, - for bullets)
                  </span>
                </label>
                <textarea
                  value={newGuideline.content}
                  onChange={(e) => setNewGuideline({ ...newGuideline, content: e.target.value })}
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="Enter guideline content..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddNew}
                  disabled={!newGuideline.title || !newGuideline.content}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Guideline
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
