'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, Sparkles, Mail, MessageSquare, Package, Heart, DollarSign, Smartphone, Loader2 } from 'lucide-react';
import { useAPIAuth as useAuth } from '@/lib/auth/api-context';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [orderPlaced, setOrderPlaced] = useState(true);
  const [orderShipped, setOrderShipped] = useState(true);
  const [orderDelivered, setOrderDelivered] = useState(true);
  const [returnStatus, setReturnStatus] = useState(true);

  const [wishlistBackInStock, setWishlistBackInStock] = useState(true);
  const [priceDrop, setPriceDrop] = useState(false);

  const [supportTicketUpdates, setSupportTicketUpdates] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState(true);

  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [inAppEnabled, setInAppEnabled] = useState(true);

  const [phoneVerified, setPhoneVerified] = useState(false);

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    try {
      setLoading(true);

      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (profileData) {
        setPhoneVerified(!!profileData.phone);
      }

      const { data: prefsData, error: prefsError } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (prefsError && prefsError.code !== 'PGRST116') {
        console.error('Error loading preferences:', prefsError);
      }

      if (prefsData) {
        setOrderPlaced(prefsData.order_placed ?? true);
        setOrderShipped(prefsData.order_shipped ?? true);
        setOrderDelivered(prefsData.order_delivered ?? true);
        setReturnStatus(prefsData.return_status ?? true);
        setWishlistBackInStock(prefsData.wishlist_back_in_stock ?? true);
        setPriceDrop(prefsData.price_drop ?? false);
        setSupportTicketUpdates(prefsData.support_ticket_updates ?? true);
        setSystemNotifications(prefsData.system_notifications ?? true);
        setEmailEnabled(prefsData.email_enabled ?? true);
        setSmsEnabled(prefsData.sms_enabled ?? false);
        setInAppEnabled(prefsData.in_app_enabled ?? true);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const preferences = {
        user_id: user?.id,
        order_placed: orderPlaced,
        order_shipped: orderShipped,
        order_delivered: orderDelivered,
        return_status: returnStatus,
        wishlist_back_in_stock: wishlistBackInStock,
        price_drop: priceDrop,
        support_ticket_updates: supportTicketUpdates,
        system_notifications: systemNotifications,
        email_enabled: emailEnabled,
        sms_enabled: smsEnabled,
        in_app_enabled: inAppEnabled,
      };

      const { data: existingPrefs } = await supabase
        .from('notification_preferences')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (existingPrefs) {
        const { error } = await supabase
          .from('notification_preferences')
          .update(preferences)
          .eq('user_id', user?.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('notification_preferences')
          .insert(preferences);

        if (error) throw error;
      }

      toast.success('Notification preferences saved successfully');
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      toast.error(error.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
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
              <span className="text-sm font-semibold text-white/90">Stay Informed</span>
            </div>

            <h1 className="hero-text font-serif text-white mb-6 leading-tight">
              Notifications & Preferences
            </h1>

            <p className="text-xl text-white/70 mb-8 leading-relaxed">
              Control how and when we contact you
            </p>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="ethereal-divider mb-12"></div>

            <div className="space-y-8">
              <Card className="glass-card glass-card-hover">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Package className="w-6 h-6" style={{ color: '#d4af8a' }} />
                    <CardTitle className="text-white text-2xl font-serif">Order Updates</CardTitle>
                  </div>
                  <CardDescription className="text-white/60 text-base mt-2">
                    Get notified about your order status
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="flex items-center justify-between p-4 glass-card rounded-lg">
                    <div className="flex-1">
                      <Label htmlFor="order-placed" className="text-white/90 text-base cursor-pointer">
                        Order Placed
                      </Label>
                      <p className="text-sm text-white/60 mt-1">
                        Confirmation when your order is successfully placed
                      </p>
                    </div>
                    <Switch
                      id="order-placed"
                      checked={orderPlaced}
                      onCheckedChange={setOrderPlaced}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 glass-card rounded-lg">
                    <div className="flex-1">
                      <Label htmlFor="order-shipped" className="text-white/90 text-base cursor-pointer">
                        Shipped
                      </Label>
                      <p className="text-sm text-white/60 mt-1">
                        When your order ships with tracking information
                      </p>
                    </div>
                    <Switch
                      id="order-shipped"
                      checked={orderShipped}
                      onCheckedChange={setOrderShipped}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 glass-card rounded-lg">
                    <div className="flex-1">
                      <Label htmlFor="order-delivered" className="text-white/90 text-base cursor-pointer">
                        Delivered
                      </Label>
                      <p className="text-sm text-white/60 mt-1">
                        Confirmation when your order is delivered
                      </p>
                    </div>
                    <Switch
                      id="order-delivered"
                      checked={orderDelivered}
                      onCheckedChange={setOrderDelivered}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 glass-card rounded-lg">
                    <div className="flex-1">
                      <Label htmlFor="return-status" className="text-white/90 text-base cursor-pointer">
                        Return Status
                      </Label>
                      <p className="text-sm text-white/60 mt-1">
                        Updates on your return and refund requests
                      </p>
                    </div>
                    <Switch
                      id="return-status"
                      checked={returnStatus}
                      onCheckedChange={setReturnStatus}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card glass-card-hover">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Heart className="w-6 h-6" style={{ color: '#d4af8a' }} />
                    <CardTitle className="text-white text-2xl font-serif">Wishlist & Alerts</CardTitle>
                  </div>
                  <CardDescription className="text-white/60 text-base mt-2">
                    Stay updated on items you love
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="flex items-center justify-between p-4 glass-card rounded-lg">
                    <div className="flex-1">
                      <Label htmlFor="back-in-stock" className="text-white/90 text-base cursor-pointer">
                        Wishlist Back in Stock
                      </Label>
                      <p className="text-sm text-white/60 mt-1">
                        When items from your wishlist become available
                      </p>
                    </div>
                    <Switch
                      id="back-in-stock"
                      checked={wishlistBackInStock}
                      onCheckedChange={setWishlistBackInStock}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 glass-card rounded-lg">
                    <div className="flex-1">
                      <Label htmlFor="price-drop" className="text-white/90 text-base cursor-pointer">
                        Price Drop Alerts
                      </Label>
                      <p className="text-sm text-white/60 mt-1">
                        Get notified when wishlist items go on sale
                      </p>
                    </div>
                    <Switch
                      id="price-drop"
                      checked={priceDrop}
                      onCheckedChange={setPriceDrop}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card glass-card-hover">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-6 h-6" style={{ color: '#d4af8a' }} />
                    <CardTitle className="text-white text-2xl font-serif">Messages</CardTitle>
                  </div>
                  <CardDescription className="text-white/60 text-base mt-2">
                    Communication and system updates
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="flex items-center justify-between p-4 glass-card rounded-lg">
                    <div className="flex-1">
                      <Label htmlFor="support-updates" className="text-white/90 text-base cursor-pointer">
                        Support Ticket Updates
                      </Label>
                      <p className="text-sm text-white/60 mt-1">
                        Responses and updates to your support requests
                      </p>
                    </div>
                    <Switch
                      id="support-updates"
                      checked={supportTicketUpdates}
                      onCheckedChange={setSupportTicketUpdates}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 glass-card rounded-lg">
                    <div className="flex-1">
                      <Label htmlFor="system-notifications" className="text-white/90 text-base cursor-pointer">
                        System Notifications
                      </Label>
                      <p className="text-sm text-white/60 mt-1">
                        Important updates about your account and services
                      </p>
                    </div>
                    <Switch
                      id="system-notifications"
                      checked={systemNotifications}
                      onCheckedChange={setSystemNotifications}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card glass-card-hover">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Bell className="w-6 h-6" style={{ color: '#d4af8a' }} />
                    <CardTitle className="text-white text-2xl font-serif">Delivery Channels</CardTitle>
                  </div>
                  <CardDescription className="text-white/60 text-base mt-2">
                    Choose how you want to receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="flex items-center justify-between p-4 glass-card rounded-lg">
                    <div className="flex-1 flex items-center gap-3">
                      <Mail className="w-5 h-5" style={{ color: '#d4af8a' }} />
                      <div>
                        <Label htmlFor="email-channel" className="text-white/90 text-base cursor-pointer">
                          Email
                        </Label>
                        <p className="text-sm text-white/60 mt-1">
                          Receive notifications via email
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="email-channel"
                      checked={emailEnabled}
                      onCheckedChange={setEmailEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 glass-card rounded-lg">
                    <div className="flex-1 flex items-center gap-3">
                      <Smartphone className="w-5 h-5" style={{ color: '#d4af8a' }} />
                      <div>
                        <Label
                          htmlFor="sms-channel"
                          className={`text-white/90 text-base cursor-pointer ${!phoneVerified ? 'opacity-50' : ''}`}
                        >
                          SMS
                          {!phoneVerified && (
                            <span className="ml-2 text-xs text-amber-300">(Phone verification required)</span>
                          )}
                        </Label>
                        <p className="text-sm text-white/60 mt-1">
                          Get text messages for important updates
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="sms-channel"
                      checked={smsEnabled}
                      onCheckedChange={setSmsEnabled}
                      disabled={!phoneVerified}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 glass-card rounded-lg">
                    <div className="flex-1 flex items-center gap-3">
                      <Bell className="w-5 h-5" style={{ color: '#d4af8a' }} />
                      <div>
                        <Label htmlFor="in-app-channel" className="text-white/90 text-base cursor-pointer">
                          In-App Notifications
                        </Label>
                        <p className="text-sm text-white/60 mt-1">
                          See notifications when you visit the site
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="in-app-channel"
                      checked={inAppEnabled}
                      onCheckedChange={setInAppEnabled}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="celestial-button text-white px-8"
                >
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save Preferences
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
