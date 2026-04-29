'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader, Sparkles, ArrowRight, Store, User, LogIn } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const VendorOnboardingWizard = dynamic(
  () => import('@/components/vendor/onboarding-wizard').then(m => ({ default: m.VendorOnboardingWizard })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <Loader className="h-8 w-8 animate-spin text-white/50" />
      </div>
    ),
  }
);

type AuthView = 'choose' | 'signin' | 'signup';

export default function VendorOnboardingPage() {
  const router = useRouter();
  const [authState, setAuthState] = useState<'loading' | 'unauthenticated' | 'authenticated'>('loading');
  const [submitted, setSubmitted] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('choose');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(session ? 'authenticated' : 'unauthenticated');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setAuthState(session ? 'authenticated' : 'unauthenticated');
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const { error } = await supabase.auth.signInWithPassword({
      email: form.get('email') as string,
      password: form.get('password') as string,
    });
    if (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const password = form.get('password') as string;
    const confirm = form.get('confirmPassword') as string;
    if (password !== confirm) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }
    const { error } = await supabase.auth.signUp({
      email: form.get('email') as string,
      password,
      options: { data: { full_name: form.get('fullName') as string } },
    });
    if (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  if (authState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-white/50" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center glass-card p-16">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/20 border-2 border-green-500 mb-8 mx-auto">
            <Sparkles className="h-12 w-12 text-green-400" />
          </div>
          <h1 className="text-4xl font-serif text-white mb-4">Application Submitted!</h1>
          <p className="text-xl text-white/70 mb-4 leading-relaxed">
            Thank you for applying to sell on Purple Soul Collective. Our team will review your application and get back to you within 2–3 business days.
          </p>
          <p className="text-white/50 text-sm mb-10">
            We'll send confirmation and status updates to your registered email address.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push('/')}
              className="celestial-button px-8 py-4 h-auto"
            >
              Return to Shop
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              onClick={() => router.push('/account')}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 px-8 py-4 h-auto"
            >
              View My Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (authState === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 mb-6 mx-auto">
              <Store className="h-10 w-10 text-white/80" />
            </div>
            <h1 className="text-3xl font-serif text-white mb-3">Start Your Vendor Application</h1>
            <p className="text-white/60 leading-relaxed">
              {authView === 'choose'
                ? 'Create a free account or sign in to begin your application. It only takes a moment.'
                : authView === 'signup'
                  ? 'Create your free account to begin applying.'
                  : 'Sign in to continue your application.'}
            </p>
          </div>

          <div className="glass-card p-8">
            {error && (
              <Alert variant="destructive" className="mb-5">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {authView === 'choose' && (
              <div className="flex flex-col gap-4">
                <Button
                  onClick={() => { setAuthView('signup'); setError(null); }}
                  className="celestial-button w-full py-5 h-auto text-base"
                >
                  <User className="mr-2 h-5 w-5" />
                  Create a Free Account
                </Button>
                <Button
                  onClick={() => { setAuthView('signin'); setError(null); }}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 w-full py-5 h-auto text-base"
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  I Already Have an Account
                </Button>
              </div>
            )}

            {authView === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-white/80">Full Name</Label>
                  <Input id="fullName" name="fullName" type="text" placeholder="Your full name" required disabled={isLoading} autoComplete="name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/80">Email Address</Label>
                  <Input id="email" name="email" type="email" placeholder="your@email.com" required disabled={isLoading} autoComplete="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white/80">Password</Label>
                  <Input id="password" name="password" type="password" placeholder="Min 8 characters" required disabled={isLoading} autoComplete="new-password" minLength={8} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white/80">Confirm Password</Label>
                  <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Repeat your password" required disabled={isLoading} autoComplete="new-password" minLength={8} />
                </div>
                <Button type="submit" className="celestial-button w-full py-5 h-auto text-base mt-2" disabled={isLoading}>
                  {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin" />Creating account...</> : <>Create Account & Continue <ArrowRight className="ml-2 h-4 w-4" /></>}
                </Button>
                <button type="button" onClick={() => { setAuthView('choose'); setError(null); }} className="w-full text-sm text-white/40 hover:text-white/70 transition-colors pt-1">
                  Back
                </button>
              </form>
            )}

            {authView === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-white/80">Email Address</Label>
                  <Input id="signin-email" name="email" type="email" placeholder="your@email.com" required disabled={isLoading} autoComplete="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="text-white/80">Password</Label>
                  <Input id="signin-password" name="password" type="password" placeholder="Your password" required disabled={isLoading} autoComplete="current-password" />
                </div>
                <Button type="submit" className="celestial-button w-full py-5 h-auto text-base mt-2" disabled={isLoading}>
                  {isLoading ? <><Loader className="mr-2 h-4 w-4 animate-spin" />Signing in...</> : <>Sign In & Continue <ArrowRight className="ml-2 h-4 w-4" /></>}
                </Button>
                <button type="button" onClick={() => { setAuthView('choose'); setError(null); }} className="w-full text-sm text-white/40 hover:text-white/70 transition-colors pt-1">
                  Back
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto">
        <VendorOnboardingWizard onComplete={() => setSubmitted(true)} />
      </div>
    </div>
  );
}
