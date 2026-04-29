'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function EmailPreferencesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    order_updates: true,
    promotional: true,
    review_reminders: true,
    product_restocks: true,
    price_drops: true,
    newsletter: true,
    unsubscribed_all: false
  });

  const supabase = createClient();

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('email_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setPreferences({
          order_updates: data.order_updates,
          promotional: data.promotional,
          review_reminders: data.review_reminders,
          product_restocks: data.product_restocks,
          price_drops: data.price_drops,
          newsletter: data.newsletter,
          unsubscribed_all: data.unsubscribed_all
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast.error('Failed to load email preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('email_preferences')
        .upsert({
          user_id: user.id,
          ...preferences
        });

      if (error) throw error;
      toast.success('Email preferences updated');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Email Preferences</h1>
        <p className="text-muted-foreground">Manage your email notification settings</p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="unsubscribed_all" className="text-base font-medium">
                  Unsubscribe from all emails
                </Label>
                <p className="text-sm text-muted-foreground">
                  Stop receiving all email communications
                </p>
              </div>
            </div>
            <Switch
              id="unsubscribed_all"
              checked={preferences.unsubscribed_all}
              onCheckedChange={() => handleToggle('unsubscribed_all')}
            />
          </div>

          <div className="space-y-4 opacity-75" style={{ opacity: preferences.unsubscribed_all ? 0.5 : 1 }}>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="order_updates" className="font-medium">
                  Order Updates
                </Label>
                <p className="text-sm text-muted-foreground">
                  Order confirmations, shipping updates, and delivery notifications
                </p>
              </div>
              <Switch
                id="order_updates"
                checked={preferences.order_updates}
                onCheckedChange={() => handleToggle('order_updates')}
                disabled={preferences.unsubscribed_all}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="review_reminders" className="font-medium">
                  Review Reminders
                </Label>
                <p className="text-sm text-muted-foreground">
                  Requests to review products you've purchased
                </p>
              </div>
              <Switch
                id="review_reminders"
                checked={preferences.review_reminders}
                onCheckedChange={() => handleToggle('review_reminders')}
                disabled={preferences.unsubscribed_all}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="product_restocks" className="font-medium">
                  Product Restock Alerts
                </Label>
                <p className="text-sm text-muted-foreground">
                  Notifications when wishlist items are back in stock
                </p>
              </div>
              <Switch
                id="product_restocks"
                checked={preferences.product_restocks}
                onCheckedChange={() => handleToggle('product_restocks')}
                disabled={preferences.unsubscribed_all}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="price_drops" className="font-medium">
                  Price Drop Alerts
                </Label>
                <p className="text-sm text-muted-foreground">
                  Notifications when wishlist items go on sale
                </p>
              </div>
              <Switch
                id="price_drops"
                checked={preferences.price_drops}
                onCheckedChange={() => handleToggle('price_drops')}
                disabled={preferences.unsubscribed_all}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="promotional" className="font-medium">
                  Promotional Emails
                </Label>
                <p className="text-sm text-muted-foreground">
                  Special offers, discounts, and promotions
                </p>
              </div>
              <Switch
                id="promotional"
                checked={preferences.promotional}
                onCheckedChange={() => handleToggle('promotional')}
                disabled={preferences.unsubscribed_all}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="newsletter" className="font-medium">
                  Newsletter
                </Label>
                <p className="text-sm text-muted-foreground">
                  Monthly newsletter with updates and featured products
                </p>
              </div>
              <Switch
                id="newsletter"
                checked={preferences.newsletter}
                onCheckedChange={() => handleToggle('newsletter')}
                disabled={preferences.unsubscribed_all}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t">
          <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
