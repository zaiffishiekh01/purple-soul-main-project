'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreditCard, Plus, Sparkles } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PaymentsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
              Payment Methods
            </h1>
            <p className="text-xl text-white/70 mb-8 leading-relaxed">
              Securely manage your saved payment methods for faster and easier checkout.
            </p>
          </div>
        </div>
      </section>

      <div className="ethereal-divider"></div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-6">
      <Card className="glass-card glass-card-hover">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="section-title text-white">Saved Cards</h2>
              <CardDescription className="text-white/60">
                All your payment methods in one secure place
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <button className="celestial-button text-white flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Payment Method
                </button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900/95 border-white/20">
                <DialogHeader>
                  <DialogTitle className="text-white">Add Payment Method</DialogTitle>
                  <DialogDescription className="text-white/60">
                    Add a new credit or debit card
                  </DialogDescription>
                </DialogHeader>
                <form className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="card-number" className="text-base text-white/90">Card Number</Label>
                    <Input
                      id="card-number"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="h-12 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="card-name" className="text-base text-white/90">Cardholder Name</Label>
                    <Input id="card-name" placeholder="JOHN DOE" className="h-12 bg-white/5 border-white/20 text-white placeholder:text-white/40" />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 space-y-2">
                      <Label htmlFor="exp-month" className="text-base text-white/90">Month</Label>
                      <Select>
                        <SelectTrigger id="exp-month" className="bg-white/5 border-white/20 text-white">
                          <SelectValue placeholder="MM" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => (
                            <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                              {String(i + 1).padStart(2, '0')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1 space-y-2">
                      <Label htmlFor="exp-year" className="text-base text-white/90">Year</Label>
                      <Select>
                        <SelectTrigger id="exp-year" className="bg-white/5 border-white/20 text-white">
                          <SelectValue placeholder="YY" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => {
                            const year = new Date().getFullYear() + i;
                            return (
                              <SelectItem key={year} value={String(year).slice(-2)}>
                                {year}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1 space-y-2">
                      <Label htmlFor="cvv" className="text-base text-white/90">CVV</Label>
                      <Input id="cvv" placeholder="123" maxLength={4} className="h-12 bg-white/5 border-white/20 text-white placeholder:text-white/40" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="billing-address" className="text-base text-white/90">Billing Address</Label>
                    <Select>
                      <SelectTrigger id="billing-address" className="bg-white/5 border-white/20 text-white">
                        <SelectValue placeholder="Select an address" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Home - 123 Main St</SelectItem>
                        <SelectItem value="new">Add new address</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Card className="glass-card">
                    <CardContent className="pt-6">
                      <p className="text-sm text-white/70">
                        Your card information is encrypted and securely stored. We never store your full card number.
                      </p>
                    </CardContent>
                  </Card>

                  <div className="flex gap-3 pt-4">
                    <button type="submit" className="celestial-button text-white flex-1">
                      Add Card
                    </button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      <Card className="glass-card glass-card-hover">
        <CardContent className="py-12 text-center">
          <CreditCard className="w-12 h-12 mx-auto mb-4" style={{ color: '#d4af8a' }} />
          <p className="text-white/60 mb-4">No payment methods saved yet</p>
          <p className="text-sm text-white/50 mb-6">
            Add a payment method for faster checkout
          </p>
          <button className="celestial-button text-white flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" />
            Add Payment Method
          </button>
        </CardContent>
      </Card>

      <Card className="glass-card glass-card-hover sacred-glow">
        <CardHeader>
          <CardTitle className="text-2xl font-serif text-white">Security Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-white/70">
          <p>• All payment information is encrypted and tokenized</p>
          <p>• We never store your full card number or CVV</p>
          <p>• Cards are processed through secure payment gateways</p>
          <p>• You can remove payment methods at any time</p>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
}
