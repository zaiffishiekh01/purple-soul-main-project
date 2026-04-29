'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Monitor, MapPin, Clock, AlertTriangle, Sparkles } from 'lucide-react';
import { TwoFactorSetup } from '@/components/auth/two-factor-setup';

const mockActivityLog = [
  {
    id: '1',
    activity_type: 'login',
    details: { device: 'Chrome on MacOS' },
    ip_address: '192.168.1.1',
    created_at: '2024-01-20T10:30:00Z'
  },
  {
    id: '2',
    activity_type: 'address_added',
    details: { label: 'Home' },
    ip_address: '192.168.1.1',
    created_at: '2024-01-19T14:20:00Z'
  },
  {
    id: '3',
    activity_type: 'password_changed',
    details: {},
    ip_address: '192.168.1.1',
    created_at: '2024-01-18T09:15:00Z'
  }
];

const activeSessions = [
  {
    id: '1',
    device: 'Chrome on MacOS',
    location: 'New York, NY',
    last_active: '2024-01-20T10:30:00Z',
    is_current: true
  }
];

export default function SecurityPage() {
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
              Security & Activity
            </h1>
            <p className="text-xl text-white/70 mb-8 leading-relaxed">
              Monitor your account security, manage active sessions, and review recent activity.
            </p>
          </div>
        </div>
      </section>

      <div className="ethereal-divider"></div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-6">
      <Card className="glass-card glass-card-hover">
        <CardHeader>
          <h2 className="section-title flex items-center gap-2 text-white">
            <Shield className="w-5 h-5" style={{ color: '#d4af8a' }} />
            Security Overview
          </h2>
          <CardDescription className="text-white/60">
            Keep your account safe and secure
          </CardDescription>
        </CardHeader>
      </Card>

      <TwoFactorSetup />

      <Card className="glass-card glass-card-hover">
        <CardHeader>
          <CardTitle className="text-2xl font-serif text-white">Active Sessions</CardTitle>
          <CardDescription className="text-white/60">
            Devices currently signed in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeSessions.map((session) => (
            <div key={session.id} className="flex items-start justify-between p-4 border border-white/10 rounded-lg">
              <div className="flex gap-4">
                <div className="p-2 bg-white/5 rounded-lg">
                  <Monitor className="w-6 h-6" style={{ color: '#d4af8a' }} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white">{session.device}</p>
                    {session.is_current && (
                      <Badge variant="default" className="text-xs bg-white/10 text-white border-white/20">Current</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {session.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(session.last_active).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              {!session.is_current && (
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                  Logout
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="glass-card glass-card-hover">
        <CardHeader>
          <CardTitle className="text-2xl font-serif text-white">Account Activity Log</CardTitle>
          <CardDescription className="text-white/60">
            Recent changes and login history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockActivityLog.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-3 border-b border-white/10 last:border-0">
                <div className="p-2 bg-white/5 rounded-lg">
                  <Shield className="w-4 h-4" style={{ color: '#d4af8a' }} />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium capitalize text-white">
                    {activity.activity_type.replace('_', ' ')}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <span>{new Date(activity.created_at).toLocaleString()}</span>
                    <span>{activity.ip_address}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card glass-card-hover sacred-glow">
        <CardHeader>
          <CardTitle className="text-2xl font-serif flex items-center gap-2 text-white">
            <AlertTriangle className="w-5 h-5" style={{ color: '#d4af8a' }} />
            Security Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-white/70">
          <p>• Enable two-factor authentication for extra security</p>
          <p>• Use a strong, unique password</p>
          <p>• Review active sessions regularly</p>
          <p>• Never share your password with anyone</p>
          <p>• Log out from devices you no longer use</p>
          <p>• Be cautious of phishing emails</p>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
}
