'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Gift, CreditCard, Sparkles, Plus, Check, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAPIAuth as useAuth } from '@/lib/auth/api-context';
import { supabase } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';

export default function GiftCardsPage() {
  const { user } = useAuth();
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [isRedeemDialogOpen, setIsRedeemDialogOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [redeemCode, setRedeemCode] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [loading, setLoading] = useState(true);
  const [giftCards, setGiftCards] = useState<any[]>([]);
  const [sentGiftCards, setSentGiftCards] = useState<any[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);

  const presetAmounts = [25, 50, 100, 250];

  useEffect(() => {
    if (user) {
      fetchGiftCards();
    }
  }, [user]);

  const fetchGiftCards = async () => {
    try {
      setLoading(true);

      // Fetch gift cards owned by user
      const { data: myCards, error: myCardsError } = await supabase
        .from('gift_cards')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (myCardsError) throw myCardsError;
      setGiftCards(myCards || []);

      // Calculate total balance
      const balance = (myCards || []).reduce((sum, card) => sum + parseFloat(card.current_balance || 0), 0);
      setTotalBalance(balance);

      // Fetch gift cards purchased by user
      const { data: sentCards, error: sentCardsError } = await supabase
        .from('gift_cards')
        .select('*')
        .eq('purchased_by_user_id', user?.id)
        .order('created_at', { ascending: false });

      if (sentCardsError) throw sentCardsError;
      setSentGiftCards(sentCards || []);

    } catch (error) {
      console.error('Error fetching gift cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateGiftCardCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segments = 4;
    const segmentLength = 4;
    const code = Array.from({ length: segments }, () =>
      Array.from({ length: segmentLength }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    ).join('-');
    return code;
  };

  const handlePurchase = async () => {
    const amount = selectedAmount || parseFloat(customAmount);

    if (!amount || amount <= 0) {
      toast.error('Please select or enter a valid amount');
      return;
    }

    if (!recipientEmail) {
      toast.error('Please enter a recipient email');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsPurchasing(true);
    try {
      const giftCardCode = generateGiftCardCode();

      const { data, error } = await supabase
        .from('gift_cards')
        .insert({
          code: giftCardCode,
          original_amount: amount,
          current_balance: amount,
          purchased_by_user_id: user?.id,
          recipient_email: recipientEmail,
          message: personalMessage || null,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Gift card purchased successfully!', {
        description: `Gift card code: ${giftCardCode}`,
      });

      // Reset form
      setSelectedAmount(null);
      setCustomAmount('');
      setRecipientEmail('');
      setPersonalMessage('');
      setIsPurchaseDialogOpen(false);

      // Refresh gift cards
      fetchGiftCards();
    } catch (error: any) {
      console.error('Error purchasing gift card:', error);
      toast.error(error.message || 'Failed to purchase gift card');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRedeem = async () => {
    if (!redeemCode) {
      toast.error('Please enter a gift card code');
      return;
    }

    setIsRedeeming(true);
    try {
      const { data: giftCard, error: fetchError } = await supabase
        .from('gift_cards')
        .select('*')
        .eq('code', redeemCode.toUpperCase().trim())
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!giftCard) {
        toast.error('Invalid gift card code');
        return;
      }

      if (!giftCard.is_active) {
        toast.error('This gift card has been deactivated');
        return;
      }

      if (giftCard.user_id) {
        toast.error('This gift card has already been redeemed');
        return;
      }

      if (giftCard.current_balance <= 0) {
        toast.error('This gift card has no remaining balance');
        return;
      }

      const { error: updateError } = await supabase
        .from('gift_cards')
        .update({ user_id: user?.id })
        .eq('id', giftCard.id);

      if (updateError) throw updateError;

      toast.success('Gift card redeemed successfully!', {
        description: `Added $${parseFloat(giftCard.current_balance).toFixed(2)} to your balance`,
      });

      setIsRedeemDialogOpen(false);
      setRedeemCode('');
      fetchGiftCards();
    } catch (error: any) {
      console.error('Error redeeming gift card:', error);
      toast.error(error.message || 'Failed to redeem gift card');
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="min-h-screen">
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-card mb-6">
              <Sparkles className="w-4 h-4" style={{ color: '#d4af8a' }} />
              <span className="text-sm font-semibold text-white/90">Gift Cards</span>
            </div>

            <h1 className="hero-text font-serif text-white mb-6 leading-tight">
              Gift Cards
            </h1>

            <p className="text-xl text-white/70 leading-relaxed max-w-2xl mx-auto">
              Share the gift of meaningful treasures with loved ones
            </p>
          </div>
        </div>
      </section>

      <div className="ethereal-divider mb-12"></div>

      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card glass-card-hover p-8">
              <div className="mb-6">
                <h2 className="section-title font-serif text-white mb-2">Total Balance</h2>
                <p className="text-base text-white/60">Available gift card balance</p>
              </div>
              <div className="mb-6">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-white/50" />
                  </div>
                ) : (
                  <>
                    <div className="text-5xl font-serif text-white mb-2">${totalBalance.toFixed(2)}</div>
                    <p className="text-sm text-white/50">
                      {giftCards.length === 0 ? 'No active gift cards' : `${giftCards.length} active card${giftCards.length !== 1 ? 's' : ''}`}
                    </p>
                  </>
                )}
              </div>
              <Button
                onClick={() => setIsRedeemDialogOpen(true)}
                className="w-full celestial-button text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Redeem Gift Card
              </Button>
            </Card>

            <Card className="glass-card glass-card-hover p-8">
              <div className="mb-6">
                <h2 className="section-title font-serif text-white mb-2">Send a Gift</h2>
                <p className="text-base text-white/60">Share meaningful moments</p>
              </div>
              <div className="mb-6 space-y-3">
                <div className="flex items-center gap-2 text-white/70">
                  <Check className="w-4 h-4" style={{ color: '#d4af8a' }} />
                  <span className="text-sm">Instant digital delivery</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <Check className="w-4 h-4" style={{ color: '#d4af8a' }} />
                  <span className="text-sm">Never expires</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <Check className="w-4 h-4" style={{ color: '#d4af8a' }} />
                  <span className="text-sm">Personal message included</span>
                </div>
              </div>
              <Button
                onClick={() => setIsPurchaseDialogOpen(true)}
                className="w-full celestial-button text-white"
              >
                <Gift className="w-4 h-4 mr-2" />
                Purchase Gift Card
              </Button>
            </Card>
          </div>

          <Card className="glass-card p-8">
            <div className="mb-6">
              <h2 className="section-title font-serif text-white mb-2">Your Gift Cards</h2>
              <p className="text-base text-white/60">Manage your active and used gift cards</p>
            </div>

            <Tabs defaultValue="active" className="space-y-6">
              <TabsList className="bg-white/5 border border-white/10">
                <TabsTrigger value="active" className="data-[state=active]:bg-white/10 text-white">
                  Active
                </TabsTrigger>
                <TabsTrigger value="used" className="data-[state=active]:bg-white/10 text-white">
                  Used
                </TabsTrigger>
                <TabsTrigger value="sent" className="data-[state=active]:bg-white/10 text-white">
                  Sent
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-white/50" />
                  </div>
                ) : giftCards.filter(card => parseFloat(card.current_balance) > 0).length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: '#d4af8a' }} />
                    <p className="text-white/60">No active gift cards</p>
                  </div>
                ) : (
                  giftCards.filter(card => parseFloat(card.current_balance) > 0).map((card) => (
                    <div key={card.id} className="p-6 glass-card rounded-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-white font-semibold text-lg mb-1">Gift Card</p>
                          <code className="text-white/70 text-sm bg-white/5 px-2 py-1 rounded">{card.code}</code>
                        </div>
                        <Badge className="bg-green-500/20 text-green-200 border-green-500/30">Active</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-white/60 text-sm mb-1">Current Balance</p>
                          <p className="text-white font-bold text-xl">${parseFloat(card.current_balance).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-sm mb-1">Original Amount</p>
                          <p className="text-white font-semibold">${parseFloat(card.original_amount).toFixed(2)}</p>
                        </div>
                      </div>
                      {card.message && (
                        <div className="mt-4 p-3 bg-white/5 rounded-lg">
                          <p className="text-white/60 text-xs mb-1">Message</p>
                          <p className="text-white/80 text-sm">{card.message}</p>
                        </div>
                      )}
                      <p className="text-white/50 text-xs mt-3">
                        Added {formatDistanceToNow(new Date(card.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="used" className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-white/50" />
                  </div>
                ) : giftCards.filter(card => parseFloat(card.current_balance) === 0).length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: '#d4af8a' }} />
                    <p className="text-white/60">No used gift cards</p>
                  </div>
                ) : (
                  giftCards.filter(card => parseFloat(card.current_balance) === 0).map((card) => (
                    <div key={card.id} className="p-6 glass-card rounded-lg opacity-60">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-white font-semibold text-lg mb-1">Gift Card</p>
                          <code className="text-white/70 text-sm bg-white/5 px-2 py-1 rounded">{card.code}</code>
                        </div>
                        <Badge className="bg-gray-500/20 text-gray-200 border-gray-500/30">Used</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-white/60 text-sm mb-1">Original Amount</p>
                          <p className="text-white font-semibold">${parseFloat(card.original_amount).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-sm mb-1">Fully Used</p>
                          <p className="text-white/60 text-sm">$0.00 remaining</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="sent" className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-white/50" />
                  </div>
                ) : sentGiftCards.length === 0 ? (
                  <div className="text-center py-12">
                    <Gift className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: '#d4af8a' }} />
                    <p className="text-white/60">No sent gift cards</p>
                  </div>
                ) : (
                  sentGiftCards.map((card) => (
                    <div key={card.id} className="p-6 glass-card rounded-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-white font-semibold text-lg mb-1">Gift Card</p>
                          <code className="text-white/70 text-sm bg-white/5 px-2 py-1 rounded">{card.code}</code>
                        </div>
                        <Badge className={card.user_id ? 'bg-green-500/20 text-green-200 border-green-500/30' : 'bg-amber-500/20 text-amber-200 border-amber-500/30'}>
                          {card.user_id ? 'Redeemed' : 'Pending'}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-white/60 text-sm">Recipient</p>
                          <p className="text-white font-medium">{card.recipient_email}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-white/60 text-sm">Amount</p>
                          <p className="text-white font-semibold">${parseFloat(card.original_amount).toFixed(2)}</p>
                        </div>
                        {card.message && (
                          <div className="mt-3 p-3 bg-white/5 rounded-lg">
                            <p className="text-white/60 text-xs mb-1">Your Message</p>
                            <p className="text-white/80 text-sm">{card.message}</p>
                          </div>
                        )}
                        <p className="text-white/50 text-xs mt-3">
                          Sent {formatDistanceToNow(new Date(card.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>

      <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
        <DialogContent className="bg-[#1a1625]/95 border border-white/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">Purchase Gift Card</DialogTitle>
            <DialogDescription className="text-white/60">
              Send a meaningful gift to someone special
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-white/90">Select Amount</Label>
              <div className="grid grid-cols-4 gap-3">
                {presetAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => {
                      setSelectedAmount(amount);
                      setCustomAmount('');
                    }}
                    className={`p-4 rounded-lg border transition-colors ${
                      selectedAmount === amount
                        ? 'border-[#d4af8a] bg-[#d4af8a]/10'
                        : 'border-white/20 hover:border-white/40 bg-white/5'
                    }`}
                  >
                    <span className="text-2xl font-serif text-white">${amount}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-amount" className="text-white/90">Or Enter Custom Amount</Label>
              <Input
                id="custom-amount"
                type="number"
                placeholder="$0.00"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                className="bg-white/5 border-white/20 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient-email" className="text-white/90">Recipient Email</Label>
              <Input
                id="recipient-email"
                type="email"
                placeholder="email@example.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="bg-white/5 border-white/20 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-white/90">Personal Message (Optional)</Label>
              <Input
                id="message"
                placeholder="Add a personal message..."
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value)}
                className="bg-white/5 border-white/20 text-white"
              />
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsPurchaseDialogOpen(false)}
              disabled={isPurchasing}
              className="bg-white/5 border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={isPurchasing}
              className="celestial-button text-white"
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Purchase Gift Card'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isRedeemDialogOpen} onOpenChange={setIsRedeemDialogOpen}>
        <DialogContent className="bg-[#1a1625]/95 border border-white/20 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">Redeem Gift Card</DialogTitle>
            <DialogDescription className="text-white/60">
              Enter your gift card code to add it to your account
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-white/90">Gift Card Code</Label>
              <Input
                id="code"
                placeholder="XXXX-XXXX-XXXX-XXXX"
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value)}
                className="bg-white/5 border-white/20 text-white uppercase"
              />
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsRedeemDialogOpen(false)}
              disabled={isRedeeming}
              className="bg-white/5 border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRedeem}
              disabled={isRedeeming}
              className="celestial-button text-white"
            >
              {isRedeeming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Redeeming...
                </>
              ) : (
                'Redeem'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
