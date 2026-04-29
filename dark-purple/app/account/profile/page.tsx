'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Bell, Shield, Globe, Sparkles, Mail, Phone, Lock, Languages, Truck, DollarSign, CheckCircle2, Loader2 } from 'lucide-react';
import { useAPIAuth as useAuth } from '@/lib/auth/api-context';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [defaultShippingMethod, setDefaultShippingMethod] = useState('standard');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, full_name')
        .eq('id', user?.id)
        .maybeSingle();

      if (userError) throw userError;

      if (userData) {
        setFullName(userData.full_name || '');
        setEmail(userData.email || '');
      }

      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (profileData) {
        setPhone(profileData.phone || '');
        setEmailNotifications(profileData.notification_email ?? true);
        setSmsNotifications(profileData.notification_sms ?? false);
        setPreferredLanguage(profileData.preferred_language || 'en');
        setDefaultShippingMethod(profileData.default_shipping_method || 'standard');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveIdentity = async () => {
    setSaving(true);
    try {
      const { error: userError } = await supabase
        .from('users')
        .update({ full_name: fullName })
        .eq('id', user?.id);

      if (userError) throw userError;

      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user?.id)
        .maybeSingle();

      if (existingProfile) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({ phone })
          .eq('id', user?.id);

        if (profileError) throw profileError;
      } else {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: user?.id,
            phone
          });

        if (profileError) throw profileError;
      }

      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(error.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user?.id)
        .maybeSingle();

      if (existingProfile) {
        const { error } = await supabase
          .from('user_profiles')
          .update({
            notification_email: emailNotifications,
            notification_sms: smsNotifications
          })
          .eq('id', user?.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_profiles')
          .insert({
            id: user?.id,
            notification_email: emailNotifications,
            notification_sms: smsNotifications
          });

        if (error) throw error;
      }

      toast.success('Notification preferences saved');
    } catch (error: any) {
      console.error('Error saving notifications:', error);
      toast.error(error.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user?.id)
        .maybeSingle();

      if (existingProfile) {
        const { error } = await supabase
          .from('user_profiles')
          .update({
            preferred_language: preferredLanguage,
            default_shipping_method: defaultShippingMethod
          })
          .eq('id', user?.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_profiles')
          .insert({
            id: user?.id,
            preferred_language: preferredLanguage,
            default_shipping_method: defaultShippingMethod
          });

        if (error) throw error;
      }

      toast.success('Preferences saved successfully');
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      toast.error(error.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setSaving(true);
    try {
      toast.info('Password update is not yet implemented');
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast.error(error.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    if (!fullName) return 'U';
    const names = fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
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
              Profile Settings
            </h1>

            <p className="text-xl text-white/70 mb-8 leading-relaxed">
              Manage your personal information, preferences, and account security
            </p>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="ethereal-divider mb-12"></div>

            <Tabs defaultValue="identity" className="space-y-8">
              <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/20 p-1 rounded-xl">
                <TabsTrigger value="identity" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70 rounded-lg">
                  <User className="w-4 h-4 mr-2" />
                  Identity
                </TabsTrigger>
                <TabsTrigger value="notifications" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70 rounded-lg">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="security" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70 rounded-lg">
                  <Shield className="w-4 h-4 mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="preferences" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70 rounded-lg">
                  <Globe className="w-4 h-4 mr-2" />
                  Preferences
                </TabsTrigger>
              </TabsList>

              <TabsContent value="identity">
                <Card className="glass-card glass-card-hover">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Avatar className="w-20 h-20 border-2 border-white/20">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-2xl text-white" style={{ background: 'linear-gradient(135deg, rgba(212, 175, 138, 0.6), rgba(184, 160, 220, 0.6))' }}>
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-white text-2xl font-serif mb-2">Personal Information</CardTitle>
                        <CardDescription className="text-white/60 text-base">
                          Update your personal details and contact information
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-white/90 text-base">Full Name</Label>
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="John Doe"
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40 h-12"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white/90 flex items-center gap-2 text-base">
                          <Mail className="w-4 h-4" style={{ color: '#d4af8a' }} />
                          Email Address
                          <Badge className="ml-2 bg-green-500/20 text-green-200 border-green-500/30">Verified</Badge>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          disabled
                          className="bg-white/5 border-white/20 text-white/50 placeholder:text-white/40 h-12 cursor-not-allowed"
                        />
                        <p className="text-sm text-white/50">
                          Email cannot be changed at this time
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-white/90 flex items-center gap-2 text-base">
                          <Phone className="w-4 h-4" style={{ color: '#d4af8a' }} />
                          Phone Number
                          <Badge className="ml-2 bg-white/5 text-white/60 border-white/20">Optional</Badge>
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 (555) 123-4567"
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40 h-12"
                        />
                        <p className="text-sm text-white/50">
                          For order updates and delivery notifications
                        </p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/10">
                      <Button
                        onClick={handleSaveIdentity}
                        disabled={saving}
                        className="celestial-button text-white"
                      >
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications">
                <Card className="glass-card glass-card-hover">
                  <CardHeader>
                    <CardTitle className="text-white text-2xl font-serif">Notification Preferences</CardTitle>
                    <CardDescription className="text-white/60 text-base mt-2">
                      Choose how you want to receive updates
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 glass-card rounded-lg">
                        <div className="space-y-1">
                          <Label htmlFor="email-notifications" className="text-white/90 text-base">Email Notifications</Label>
                          <p className="text-sm text-white/60">
                            Receive order updates and promotions via email
                          </p>
                        </div>
                        <Switch
                          id="email-notifications"
                          checked={emailNotifications}
                          onCheckedChange={setEmailNotifications}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 glass-card rounded-lg">
                        <div className="space-y-1">
                          <Label htmlFor="sms-notifications" className="text-white/90 text-base">SMS Notifications</Label>
                          <p className="text-sm text-white/60">
                            Get delivery updates via text message
                          </p>
                        </div>
                        <Switch
                          id="sms-notifications"
                          checked={smsNotifications}
                          onCheckedChange={setSmsNotifications}
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/10">
                      <Button
                        onClick={handleSaveNotifications}
                        disabled={saving}
                        className="celestial-button text-white"
                      >
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Save Preferences
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card className="glass-card glass-card-hover">
                  <CardHeader>
                    <CardTitle className="text-white text-2xl font-serif flex items-center gap-2">
                      <Lock className="w-6 h-6" style={{ color: '#d4af8a' }} />
                      Security Settings
                    </CardTitle>
                    <CardDescription className="text-white/60 text-base mt-2">
                      Manage your password and security options
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="current-password" className="text-white/90 text-base">Current Password</Label>
                        <Input
                          id="current-password"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="bg-white/5 border-white/20 text-white h-12"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="new-password" className="text-white/90 text-base">New Password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="bg-white/5 border-white/20 text-white h-12"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-white/90 text-base">Confirm New Password</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="bg-white/5 border-white/20 text-white h-12"
                        />
                      </div>

                      <div className="pt-2">
                        <Button
                          onClick={handleUpdatePassword}
                          disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                          className="celestial-button text-white"
                        >
                          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                          Update Password
                        </Button>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/10 space-y-4">
                      <div className="flex items-center justify-between p-4 glass-card rounded-lg opacity-50 cursor-not-allowed">
                        <div className="space-y-1 flex-1">
                          <Label htmlFor="two-factor" className="text-white/90 text-base flex items-center gap-2">
                            <Shield className="w-4 h-4" style={{ color: '#d4af8a' }} />
                            Two-Factor Authentication
                          </Label>
                          <p className="text-sm text-white/60">
                            Coming soon: Add an extra layer of security to your account
                          </p>
                        </div>
                        <Switch
                          id="two-factor"
                          checked={twoFactorEnabled}
                          disabled
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preferences">
                <Card className="glass-card glass-card-hover">
                  <CardHeader>
                    <CardTitle className="text-white text-2xl font-serif">General Preferences</CardTitle>
                    <CardDescription className="text-white/60 text-base mt-2">
                      Customize your shopping experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="language" className="text-white/90 flex items-center gap-2 text-base">
                          <Languages className="w-4 h-4" style={{ color: '#d4af8a' }} />
                          Preferred Language
                        </Label>
                        <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
                          <SelectTrigger id="language" className="bg-white/5 border-white/20 text-white h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="ar">Arabic</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="shipping-method" className="text-white/90 flex items-center gap-2 text-base">
                          <Truck className="w-4 h-4" style={{ color: '#d4af8a' }} />
                          Default Shipping Method
                        </Label>
                        <Select value={defaultShippingMethod} onValueChange={setDefaultShippingMethod}>
                          <SelectTrigger id="shipping-method" className="bg-white/5 border-white/20 text-white h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard Shipping</SelectItem>
                            <SelectItem value="express">Express Shipping</SelectItem>
                            <SelectItem value="overnight">Overnight</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-white/50">
                          This will be pre-selected at checkout
                        </p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/10">
                      <Button
                        onClick={handleSavePreferences}
                        disabled={saving}
                        className="celestial-button text-white"
                      >
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Save Preferences
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
    </div>
  );
}
