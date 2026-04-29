'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { HeadphonesIcon, Plus, MessageSquare, Clock, Sparkles } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const mockTickets = [
  {
    id: '1',
    subject: 'Question about my order #ORD-2024-0001',
    status: 'open',
    priority: 'medium',
    created_at: '2024-01-20T10:30:00Z',
    updated_at: '2024-01-20T10:30:00Z'
  }
];

const statusColors = {
  open: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
  in_progress: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30',
  waiting_customer: 'bg-orange-500/20 text-orange-200 border-orange-500/30',
  resolved: 'bg-green-500/20 text-green-200 border-green-500/30',
  closed: 'bg-gray-500/20 text-gray-200 border-gray-500/30'
};

export default function SupportPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tickets] = useState(mockTickets);

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
              Support Center
            </h1>
            <p className="text-xl text-white/70 mb-8 leading-relaxed">
              Get help with your orders and account. We're here to assist you every step of the way.
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
              <h2 className="section-title flex items-center gap-2 text-white">
                <HeadphonesIcon className="w-5 h-5" style={{ color: '#d4af8a' }} />
                Support Tickets
              </h2>
              <CardDescription className="text-white/60">
                Track all your support requests in one place
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <button className="celestial-button text-white flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Ticket
                </button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900/95 border-white/20">
                <DialogHeader>
                  <DialogTitle className="text-white">Create Support Ticket</DialogTitle>
                  <DialogDescription className="text-white/60">
                    Tell us how we can help you
                  </DialogDescription>
                </DialogHeader>
                <form className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-base text-white/90">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Brief description of your issue"
                      className="h-12 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="order" className="text-base text-white/90">
                      Related Order <span className="text-white/40">(Optional)</span>
                    </Label>
                    <Select>
                      <SelectTrigger id="order" className="bg-white/5 border-white/20 text-white">
                        <SelectValue placeholder="Select an order" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No order</SelectItem>
                        <SelectItem value="1">Order #ORD-2024-0001</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority" className="text-base text-white/90">Priority</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger id="priority" className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-base text-white/90">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Describe your issue in detail..."
                      rows={5}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button type="submit" className="celestial-button text-white flex-1">
                      Submit Ticket
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

      <div className="space-y-4">
        {tickets.length > 0 ? (
          tickets.map((ticket) => (
            <Card key={ticket.id} className="glass-card glass-card-hover cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-2xl font-serif text-white">{ticket.subject}</CardTitle>
                      <Badge className={statusColors[ticket.status as keyof typeof statusColors]}>
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-4 text-white/60">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Created {new Date(ticket.created_at).toLocaleString()}
                      </span>
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="bg-white/5 border-white/20 text-white hover:bg-white/10">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    View
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))
        ) : (
          <Card className="glass-card glass-card-hover">
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4" style={{ color: '#d4af8a' }} />
              <p className="text-white/60 mb-4">No support tickets yet</p>
              <p className="text-sm text-white/50 mb-6">
                We're here to help if you need us
              </p>
              <button className="celestial-button text-white flex items-center gap-2 mx-auto">
                <Plus className="w-4 h-4" />
                Create Support Ticket
              </button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card glass-card-hover">
          <CardHeader>
            <CardTitle className="text-2xl font-serif text-white">Email Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-white/60 mb-3">
              Get in touch with our support team
            </p>
            <p className="text-sm font-medium text-white">ps@dekoshurcrafts.com</p>
          </CardContent>
        </Card>

        <Card className="glass-card glass-card-hover">
          <CardHeader>
            <CardTitle className="text-2xl font-serif text-white">Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-white/60 mb-3">
              We typically respond within
            </p>
            <p className="text-sm font-medium text-white">24 hours</p>
          </CardContent>
        </Card>

        <Card className="glass-card glass-card-hover">
          <CardHeader>
            <CardTitle className="text-2xl font-serif text-white">Help Center</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-white/60 mb-3">
              Find answers to common questions
            </p>
            <Button variant="link" className="p-0 h-auto text-white/70 hover:text-white">
              Visit Help Center
            </Button>
          </CardContent>
        </Card>
      </div>
        </div>
      </div>
    </div>
  );
}
