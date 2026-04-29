'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, LogIn, Shield, Store } from 'lucide-react';
import { AuthModal } from '@/components/auth/auth-modal';

const EXTERNAL_DASHBOARD_URL = 'https://vendor.sufisciencecenter.info';

export default function PortalPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      setUser(user);

      const { data: userRoles } = await supabase
        .from('user_roles')
        .select(`
          role_id,
          roles (
            name
          )
        `)
        .eq('user_id', user.id);

      const role = userRoles?.[0]?.roles as any;
      setUserRole(role?.name || 'Customer');
    }

    setLoading(false);
  }

  function handleRedirect() {
    window.location.href = EXTERNAL_DASHBOARD_URL;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <LogIn className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-3xl">Authentication Required</CardTitle>
                <CardDescription className="text-base mt-2">
                  Please sign in to access the Management Portal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => setShowAuthModal(true)}
                  size="lg"
                  className="w-full"
                >
                  Sign In to Continue
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  The Management Portal is for vendors and administrators only.
                  <br />
                  Regular customers can access their account from the main navigation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      </>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-primary/10 rounded-full">
                {userRole === 'Administrator' ? (
                  <Shield className="h-10 w-10 text-primary" />
                ) : (
                  <Store className="h-10 w-10 text-primary" />
                )}
              </div>
            </div>
            <CardTitle className="text-3xl">Welcome to the Portal</CardTitle>
            <CardDescription className="text-base mt-2">
              {user.email}
              {userRole && <span className="block mt-1 font-medium">Role: {userRole}</span>}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">You will be redirected to:</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {EXTERNAL_DASHBOARD_URL}
              </p>
              <p className="text-sm text-muted-foreground">
                The external dashboard provides full management capabilities for vendors and administrators.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleRedirect}
                size="lg"
                className="w-full"
              >
                <ExternalLink className="h-5 w-5 mr-2" />
                Open Management Dashboard
              </Button>

              <Button
                onClick={() => window.history.back()}
                variant="outline"
                size="lg"
                className="w-full"
              >
                Go Back
              </Button>
            </div>

            {userRole === 'Administrator' && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold mb-2">Admin Features Available:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Category & Navigation Management</li>
                  <li>• Vendor Oversight & Approval</li>
                  <li>• Product Moderation & Review</li>
                  <li>• Platform Analytics & Reports</li>
                  <li>• Order Management & Support</li>
                </ul>
              </div>
            )}

            {userRole === 'Vendor' && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold mb-2">Vendor Features Available:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Product Catalog Management</li>
                  <li>• Inventory Tracking</li>
                  <li>• Order Fulfillment</li>
                  <li>• Sales Analytics</li>
                  <li>• Customer Reviews</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
