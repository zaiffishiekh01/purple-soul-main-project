import { useState, useRef } from 'react';
import { Building2, Mail, Phone, MapPin, Save, Upload, Loader2, CheckCircle } from 'lucide-react';
import { Vendor } from '../types';
import { dashboardClient } from '../lib/data-client';

interface VendorProfileProps {
  vendor: Vendor | null;
  onUpdate?: (updates: Partial<Vendor>) => void;
}

export function VendorProfile({ vendor, onUpdate }: VendorProfileProps) {
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logoUrl, setLogoUrl] = useState(vendor?.logo_url || '');
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    business_name: vendor?.business_name || '',
    business_type: vendor?.business_type || '',
    contact_email: vendor?.contact_email || '',
    contact_phone: vendor?.contact_phone || '',
    tax_id: vendor?.tax_id || '',
    address: typeof vendor?.address === 'string' ? vendor.address : '',
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !vendor) return;

    setUploadingLogo(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `logos/${vendor.id}.${ext}`;

      const { error: uploadError } = await dashboardClient.storage
        .from('product-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = dashboardClient.storage
        .from('product-images')
        .getPublicUrl(filePath);

      const { error: updateError } = await dashboardClient
        .from('vendors')
        .update({ logo_url: publicUrl })
        .eq('id', vendor.id);

      if (updateError) throw updateError;

      setLogoUrl(publicUrl);
      if (onUpdate) onUpdate({ logo_url: publicUrl });
    } catch (err: any) {
      alert('Failed to upload logo: ' + (err.message || 'Please try again.'));
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) return;

    setSaving(true);
    try {
      const updates = {
        business_name: formData.business_name,
        business_type: formData.business_type,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        tax_id: formData.tax_id,
        address: formData.address,
        updated_at: new Date().toISOString(),
      };

      const { error } = await dashboardClient
        .from('vendors')
        .update(updates)
        .eq('id', vendor.id);

      if (error) throw error;

      if (onUpdate) onUpdate(updates);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert('Failed to save changes: ' + (err.message || 'Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-3xl font-bold shadow-xl">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                formData.business_name?.charAt(0) || 'V'
              )}
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {formData.business_name || 'Vendor Name'}
            </h2>
            <p className="text-gray-600">{formData.business_type || 'Business Type'}</p>
            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                vendor?.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {vendor?.status || 'Active'}
            </span>
          </div>
          <div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              disabled={uploadingLogo}
              className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {uploadingLogo ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Logo
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Business Information</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  placeholder="Your business name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
              <input
                type="text"
                value={formData.business_type}
                onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                placeholder="e.g., Retail, Wholesale"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  placeholder="contact@business.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID</label>
              <input
                type="text"
                value={formData.tax_id}
                onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                placeholder="XX-XXXXXXX"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Business Address</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Address</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
              <textarea
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all resize-none"
                placeholder="123 Main Street, Suite 100, City, State, ZIP, Country"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => setFormData({
              business_name: vendor?.business_name || '',
              business_type: vendor?.business_type || '',
              contact_email: vendor?.contact_email || '',
              contact_phone: vendor?.contact_phone || '',
              tax_id: vendor?.tax_id || '',
              address: typeof vendor?.address === 'string' ? vendor.address : '',
            })}
            className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all flex items-center gap-2 font-medium disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
