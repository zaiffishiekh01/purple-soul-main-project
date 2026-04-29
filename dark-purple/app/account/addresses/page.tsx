'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MapPin, Plus, Edit, Trash2, Home, Briefcase, Gift as GiftIcon, Sparkles, Loader2, Check } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAPIAuth as useAuth } from '@/lib/auth/api-context';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface Address {
  id?: string;
  label: string;
  recipient_name: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  delivery_instructions: string;
  is_default_shipping: boolean;
  is_default_billing: boolean;
  is_gift_address: boolean;
}

const emptyAddress: Address = {
  label: '',
  recipient_name: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'US',
  phone: '',
  delivery_instructions: '',
  is_default_shipping: false,
  is_default_billing: false,
  is_gift_address: false
};

export default function AddressesPage() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<Address>(emptyAddress);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .order('is_default_shipping', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setFormData(address);
    } else {
      setEditingAddress(null);
      setFormData(emptyAddress);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAddress(null);
    setFormData(emptyAddress);
  };

  const handleSave = async () => {
    if (!formData.label || !formData.recipient_name || !formData.address_line1 || !formData.city || !formData.state || !formData.postal_code) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      if (editingAddress?.id) {
        const { error } = await supabase
          .from('addresses')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingAddress.id)
          .eq('user_id', user?.id);

        if (error) throw error;
        toast.success('Address updated successfully');
      } else {
        const { error } = await supabase
          .from('addresses')
          .insert({
            ...formData,
            user_id: user?.id
          });

        if (error) throw error;
        toast.success('Address added successfully');
      }

      await fetchAddresses();
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error saving address:', error);
      toast.error(error.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const { error } = await supabase
        .from('addresses')
        .update({ is_active: false })
        .eq('id', addressId)
        .eq('user_id', user?.id);

      if (error) throw error;
      toast.success('Address deleted');
      await fetchAddresses();
    } catch (error: any) {
      console.error('Error deleting address:', error);
      toast.error(error.message || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (addressId: string, type: 'shipping' | 'billing') => {
    try {
      if (type === 'shipping') {
        await supabase
          .from('addresses')
          .update({ is_default_shipping: false })
          .eq('user_id', user?.id);

        const { error } = await supabase
          .from('addresses')
          .update({ is_default_shipping: true })
          .eq('id', addressId)
          .eq('user_id', user?.id);

        if (error) throw error;
      } else {
        await supabase
          .from('addresses')
          .update({ is_default_billing: false })
          .eq('user_id', user?.id);

        const { error } = await supabase
          .from('addresses')
          .update({ is_default_billing: true })
          .eq('id', addressId)
          .eq('user_id', user?.id);

        if (error) throw error;
      }

      toast.success(`Default ${type} address updated`);
      await fetchAddresses();
    } catch (error: any) {
      console.error('Error setting default:', error);
      toast.error(error.message || 'Failed to set default address');
    }
  };

  const getAddressIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case 'home':
        return <Home className="w-5 h-5" style={{ color: '#d4af8a' }} />;
      case 'work':
      case 'office':
        return <Briefcase className="w-5 h-5" style={{ color: '#d4af8a' }} />;
      case 'gift':
        return <GiftIcon className="w-5 h-5" style={{ color: '#d4af8a' }} />;
      default:
        return <MapPin className="w-5 h-5" style={{ color: '#d4af8a' }} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-card mb-6">
              <Sparkles className="w-4 h-4" style={{ color: '#d4af8a' }} />
              <span className="text-sm font-semibold text-white/90">Your Account</span>
            </div>
            <h1 className="hero-text font-serif text-white mb-6 leading-tight">
              Address Book
            </h1>
            <p className="text-xl text-white/70 mb-8 leading-relaxed">
              Manage your saved addresses for faster checkout
            </p>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="ethereal-divider mb-12"></div>

            <div className="mb-8">
              <Button onClick={() => handleOpenDialog()} className="celestial-button text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add New Address
              </Button>
            </div>

            {addresses.length === 0 ? (
              <Card className="glass-card p-12">
                <div className="text-center">
                  <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: '#d4af8a' }} />
                  <h3 className="text-2xl font-serif text-white mb-2">No addresses yet</h3>
                  <p className="text-white/60 mb-6">Add your first address to get started</p>
                  <Button onClick={() => handleOpenDialog()} className="celestial-button text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Address
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.map((address) => (
                  <Card key={address.id} className="glass-card glass-card-hover">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getAddressIcon(address.label)}
                          <div>
                            <h3 className="font-semibold text-lg text-white">{address.label}</h3>
                            <p className="text-sm text-white/60">{address.recipient_name}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(address)}
                            className="text-white/70 hover:text-white hover:bg-white/10"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(address.id!)}
                            className="text-white/70 hover:text-white hover:bg-white/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <p className="text-white/80">{address.address_line1}</p>
                        {address.address_line2 && <p className="text-white/80">{address.address_line2}</p>}
                        <p className="text-white/80">
                          {address.city}, {address.state} {address.postal_code}
                        </p>
                        <p className="text-white/60">{address.phone}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {address.is_default_shipping && (
                          <Badge className="bg-green-500/20 text-green-200 border-green-500/30">
                            <Check className="w-3 h-3 mr-1" />
                            Default Shipping
                          </Badge>
                        )}
                        {address.is_default_billing && (
                          <Badge className="bg-blue-500/20 text-blue-200 border-blue-500/30">
                            <Check className="w-3 h-3 mr-1" />
                            Default Billing
                          </Badge>
                        )}
                        {address.is_gift_address && (
                          <Badge className="bg-purple-500/20 text-purple-200 border-purple-500/30">
                            <GiftIcon className="w-3 h-3 mr-1" />
                            Gift Address
                          </Badge>
                        )}
                      </div>

                      {!address.is_default_shipping && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => handleSetDefault(address.id!, 'shipping')}
                          className="mt-4 text-white/70 hover:text-white p-0 h-auto"
                        >
                          Set as default shipping
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#1a1625]/95 border border-white/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </DialogTitle>
            <DialogDescription className="text-white/60">
              {editingAddress ? 'Update your address details' : 'Add a new address to your account'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="label" className="text-white/90">Address Label *</Label>
              <Select value={formData.label} onValueChange={(value) => setFormData({ ...formData, label: value })}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="Select label" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Home">Home</SelectItem>
                  <SelectItem value="Work">Work</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient_name" className="text-white/90">Recipient Name *</Label>
              <Input
                id="recipient_name"
                value={formData.recipient_name}
                onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                className="bg-white/5 border-white/20 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_line1" className="text-white/90">Address Line 1 *</Label>
              <Input
                id="address_line1"
                value={formData.address_line1}
                onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                className="bg-white/5 border-white/20 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_line2" className="text-white/90">Address Line 2</Label>
              <Input
                id="address_line2"
                value={formData.address_line2}
                onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                className="bg-white/5 border-white/20 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-white/90">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state" className="text-white/90">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postal_code" className="text-white/90">Postal Code *</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white/90">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery_instructions" className="text-white/90">Delivery Instructions</Label>
              <Textarea
                id="delivery_instructions"
                value={formData.delivery_instructions}
                onChange={(e) => setFormData({ ...formData, delivery_instructions: e.target.value })}
                className="bg-white/5 border-white/20 text-white"
                rows={3}
              />
            </div>

            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <Label htmlFor="is_default_shipping" className="text-white/90">Set as default shipping address</Label>
                <Switch
                  id="is_default_shipping"
                  checked={formData.is_default_shipping}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_default_shipping: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="is_default_billing" className="text-white/90">Set as default billing address</Label>
                <Switch
                  id="is_default_billing"
                  checked={formData.is_default_billing}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_default_billing: checked })}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              className="bg-white/5 border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="celestial-button text-white"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {editingAddress ? 'Update' : 'Add'} Address
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
