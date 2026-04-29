import { Metadata } from 'next';
import { Mail, MessageSquare, HelpCircle, Store } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with our team for support, vendor inquiries, or general questions.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="hero-text font-serif text-white mb-6 soft-glow">
                Contact Us
              </h1>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                We're here to help with questions, support, and vendor inquiries
              </p>
              <div className="ethereal-divider"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <div className="glass-card glass-card-hover p-8">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, rgba(212, 175, 138, 0.6), rgba(184, 160, 220, 0.6))' }}>
                  <HelpCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-medium mb-3 text-white">Customer Support</h3>
                <p className="text-white/60 mb-4">
                  Questions about orders, returns, or products? Our support team is ready to help.
                </p>
                <p className="text-sm text-white/50">
                  Response time: Within 24 hours
                </p>
              </div>

              <div className="glass-card glass-card-hover p-8">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, rgba(212, 175, 138, 0.6), rgba(184, 160, 220, 0.6))' }}>
                  <Store className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-medium mb-3 text-white">Vendor Inquiries</h3>
                <p className="text-white/60 mb-4">
                  Interested in joining our marketplace? We review all vendor applications carefully.
                </p>
                <p className="text-sm text-white/50">
                  Response time: Within 3-5 business days
                </p>
              </div>

              <div className="glass-card glass-card-hover p-8">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, rgba(212, 175, 138, 0.6), rgba(184, 160, 220, 0.6))' }}>
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-medium mb-3 text-white">General Inquiries</h3>
                <p className="text-white/60 mb-4">
                  Questions about our mission, partnerships, or media requests.
                </p>
                <p className="text-sm text-white/50">
                  Response time: Within 48 hours
                </p>
              </div>

              <div className="glass-card glass-card-hover p-8">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, rgba(212, 175, 138, 0.6), rgba(184, 160, 220, 0.6))' }}>
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-medium mb-3 text-white">Direct Email</h3>
                <p className="text-white/60 mb-4">
                  Prefer email? Reach us directly at:
                </p>
                <a href="mailto:ps@dekoshurcrafts.com" className="text-sm font-medium" style={{ color: '#d4af8a' }}>
                  ps@dekoshurcrafts.com
                </a>
              </div>
            </div>

            <div className="glass-card p-10 sacred-glow">
              <h2 className="section-title font-serif text-white text-center mb-8">
                Send Us a Message
              </h2>

              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-white/90">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="Enter your first name"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-white/90">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Enter your last name"
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/90">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-white/90">Subject</Label>
                  <Select>
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer-support">Customer Support</SelectItem>
                      <SelectItem value="vendor-inquiry">Vendor Inquiry</SelectItem>
                      <SelectItem value="order-issue">Order Issue</SelectItem>
                      <SelectItem value="product-question">Product Question</SelectItem>
                      <SelectItem value="partnership">Partnership Opportunity</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-white/90">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us how we can help..."
                    rows={6}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 resize-none"
                  />
                </div>

                <div className="flex justify-center pt-4">
                  <button type="submit" className="celestial-button text-white px-12">
                    Send Message
                  </button>
                </div>
              </form>

              <div className="mt-8 pt-8 border-t border-white/10">
                <p className="text-center text-sm text-white/50">
                  We read every message and respond as quickly as possible. Thank you for your patience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
