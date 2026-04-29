'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ListTree, Plus, Share2, Eye, Edit, Trash2, Gift, Calendar, Sparkles } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const mockRegistries = [
  {
    id: '1',
    name: 'New Home Setup',
    type: 'new_home',
    event_date: '2024-03-15',
    items_count: 15,
    items_purchased: 3,
    is_public: true
  },
  {
    id: '2',
    name: 'Pilgrimage Preparation',
    type: 'pilgrimage',
    event_date: '2024-06-01',
    items_count: 8,
    items_purchased: 0,
    is_public: false
  }
];

const registryTypes = [
  { value: 'new_home', label: 'New Home' },
  { value: 'marriage', label: 'Marriage' },
  { value: 'birth', label: 'Birth & Welcome' },
  { value: 'study', label: 'Study & Learning' },
  { value: 'healing', label: 'Healing Support' },
  { value: 'mourning', label: 'Mourning & Remembrance' },
  { value: 'pilgrimage', label: 'Pilgrimage Preparation' }
];

export default function RegistriesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [registries] = useState(mockRegistries);

  return (
    <div className="min-h-screen">
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-card mb-6">
              <Sparkles className="w-4 h-4" style={{ color: '#d4af8a' }} />
              <span className="text-sm font-semibold text-white/90">Gift Registries</span>
            </div>

            <h1 className="hero-text font-serif text-white mb-6 leading-tight">
              My Registries
            </h1>

            <p className="text-xl text-white/70 leading-relaxed max-w-2xl mx-auto">
              Create registries for life's special moments and share them with loved ones
            </p>
          </div>
        </div>
      </section>

      <div className="ethereal-divider mb-12"></div>

      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-6xl mx-auto space-y-8">
          <Card className="glass-card glass-card-hover p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="section-title font-serif text-white mb-2">Your Registries</h2>
                <p className="text-base text-white/60">
                  Manage registries for special occasions
                </p>
              </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <button className="celestial-button text-white flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create Registry
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-slate-900/95 border-white/20">
                <DialogHeader>
                  <DialogTitle className="text-white">Create New Registry</DialogTitle>
                  <DialogDescription className="text-white/60">
                    Set up a registry for your special occasion
                  </DialogDescription>
                </DialogHeader>
                <form className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="registry-name" className="text-base text-white/90">Registry Name</Label>
                    <Input
                      id="registry-name"
                      placeholder="e.g., Our New Home, Hajj 2024"
                      className="h-12 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registry-type" className="text-base text-white/90">Registry Type</Label>
                    <Select>
                      <SelectTrigger id="registry-type" className="h-12 bg-white/5 border-white/20 text-white">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {registryTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event-date" className="text-base text-white/90">
                      Event Date <span className="text-white/40">(Optional)</span>
                    </Label>
                    <Input id="event-date" type="date" className="h-12 bg-white/5 border-white/20 text-white" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-base text-white/90">
                      Description <span className="text-white/40">(Optional)</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Tell guests about your special occasion..."
                      rows={3}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shipping-address" className="text-base text-white/90">Shipping Address</Label>
                    <Select>
                      <SelectTrigger id="shipping-address" className="h-12 bg-white/5 border-white/20 text-white">
                        <SelectValue placeholder="Select an address" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Home - 123 Main St</SelectItem>
                        <SelectItem value="new">Add new address</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="public" className="text-base text-white/90">Make registry public</Label>
                        <p className="text-sm text-white/50">
                          Anyone with the link can view your registry
                        </p>
                      </div>
                      <Switch id="public" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor="partial" className="text-base text-white/90">Allow partial contributions</Label>
                        <p className="text-sm text-white/50">
                          Guests can contribute toward expensive items
                        </p>
                      </div>
                      <Switch id="partial" />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button type="submit" className="celestial-button text-white flex-1">
                      Create Registry
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
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {registries.map((registry) => (
            <Card key={registry.id} className="glass-card glass-card-hover p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-serif text-white mb-2">{registry.name}</h3>
                  <p className="flex items-center gap-2 text-base text-white/60">
                    <Calendar className="w-4 h-4" style={{ color: '#d4af8a' }} />
                    {new Date(registry.event_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {registry.is_public ? (
                    <Badge className="bg-white/10 text-white border-white/20">Public</Badge>
                  ) : (
                    <Badge className="bg-white/5 text-white/70 border-white/20">Private</Badge>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-base mb-2">
                    <span className="text-white/60">Progress</span>
                    <span className="font-semibold text-white">
                      {registry.items_purchased} / {registry.items_count} items
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${(registry.items_purchased / registry.items_count) * 100}%`,
                        background: 'linear-gradient(135deg, rgba(212, 175, 138, 0.8), rgba(184, 160, 220, 0.8))'
                      }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/account/registries/${registry.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10">
                      <Eye className="w-4 h-4 mr-2" style={{ color: '#d4af8a' }} />
                      View
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                    <Share2 className="w-4 h-4" style={{ color: '#d4af8a' }} />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                    <Edit className="w-4 h-4" style={{ color: '#d4af8a' }} />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                    <Trash2 className="w-4 h-4" style={{ color: '#d4af8a' }} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="glass-card glass-card-hover p-8">
          <div className="mb-6">
            <h2 className="section-title font-serif text-white mb-2">Registry Features</h2>
          </div>
          <div className="space-y-3 text-base text-white/70">
            <p>• Create registries for any special occasion or life moment</p>
            <p>• Share with friends and family via unique link</p>
            <p>• Track what's been purchased to avoid duplicates</p>
            <p>• Allow partial contributions for expensive items</p>
            <p>• Send thank-you messages to gift givers</p>
            <p>• Keep your shipping address private from guests</p>
          </div>
        </Card>
      </div>
    </div>
    </div>
  );
}
