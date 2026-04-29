'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Plus, Edit, Trash2, Gift, MapPin, Sparkles } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const mockRecipients = [
  {
    id: '1',
    name: 'Sarah (Mother)',
    relationship: 'Mother',
    gift_preferences: ['No fragrances', 'Prefers neutral colors'],
    notes: 'Loves prayer mats with traditional patterns',
    has_address: true
  },
  {
    id: '2',
    name: 'Ahmed (Brother)',
    relationship: 'Brother',
    gift_preferences: ['Modern design', 'Tech-friendly items'],
    notes: 'Interested in digital Quran readers',
    has_address: false
  }
];

export default function RecipientsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [recipients] = useState(mockRecipients);

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
              Gift Recipients
            </h1>
            <p className="text-xl text-white/70 mb-8 leading-relaxed">
              Save people you buy gifts for with their preferences and notes for thoughtful giving.
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
              <h2 className="section-title text-white">Saved Recipients</h2>
              <CardDescription className="text-white/60">
                Keep track of gift preferences for your loved ones
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <button className="celestial-button text-white flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Recipient
                </button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900/95 border-white/20">
                <DialogHeader>
                  <DialogTitle className="text-white">Add Gift Recipient</DialogTitle>
                  <DialogDescription className="text-white/60">
                    Save details about someone you buy gifts for
                  </DialogDescription>
                </DialogHeader>
                <form className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipient-name" className="text-base text-white/90">Recipient Name</Label>
                    <Input id="recipient-name" placeholder="e.g., Sarah, Mom" className="h-12 bg-white/5 border-white/20 text-white placeholder:text-white/40" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="relationship" className="text-base text-white/90">Relationship</Label>
                    <Select>
                      <SelectTrigger id="relationship">
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mother">Mother</SelectItem>
                        <SelectItem value="father">Father</SelectItem>
                        <SelectItem value="spouse">Spouse</SelectItem>
                        <SelectItem value="sibling">Sibling</SelectItem>
                        <SelectItem value="child">Child</SelectItem>
                        <SelectItem value="friend">Friend</SelectItem>
                        <SelectItem value="colleague">Colleague</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferences" className="text-base text-white/90">
                      Gift Preferences <span className="text-white/40">(Optional)</span>
                    </Label>
                    <Input
                      id="preferences"
                      placeholder="e.g., No fragrances, prefers neutral colors"
                      className="h-12 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    />
                    <p className="text-sm text-white/50">
                      Separate multiple preferences with commas
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-base text-white/90">
                      Notes <span className="text-white/40">(Optional)</span>
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any helpful notes for gift shopping..."
                      rows={3}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-base text-white/90">
                      Shipping Address <span className="text-white/40">(Optional)</span>
                    </Label>
                    <Select>
                      <SelectTrigger id="address">
                        <SelectValue placeholder="Select or add an address" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="1">123 Main St, New York, NY</SelectItem>
                        <SelectItem value="new">Add new address</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button type="submit" className="celestial-button text-white flex-1">
                      Save Recipient
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recipients.map((recipient) => (
          <Card key={recipient.id} className="glass-card glass-card-hover">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl font-serif flex items-center gap-2 text-white">
                    <Users className="w-5 h-5" style={{ color: '#d4af8a' }} />
                    {recipient.name}
                  </CardTitle>
                  <CardDescription className="mt-1 text-white/60">
                    {recipient.relationship}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                    <Trash2 className="w-4 h-4" style={{ color: '#d4af8a' }} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recipient.gift_preferences && recipient.gift_preferences.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-white">
                    <Gift className="w-4 h-4" style={{ color: '#d4af8a' }} />
                    Gift Preferences
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {recipient.gift_preferences.map((pref, idx) => (
                      <Badge key={idx} variant="secondary">
                        {pref}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {recipient.notes && (
                <div>
                  <h4 className="text-sm font-semibold mb-1 text-white">Notes</h4>
                  <p className="text-sm text-white/60">{recipient.notes}</p>
                </div>
              )}

              {recipient.has_address && (
                <div className="pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <MapPin className="w-4 h-4" />
                    <span>Shipping address saved</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card glass-card-hover sacred-glow">
        <CardHeader>
          <CardTitle className="text-2xl font-serif text-white">Why Save Recipients?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-white/70">
          <p>• Remember gift preferences and avoid duplicate purchases</p>
          <p>• Save time during checkout with pre-saved addresses</p>
          <p>• Track gift history by recipient</p>
          <p>• Get reminded of special occasions</p>
          <p>• Add personal notes about what they liked or didn't like</p>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
}
