'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAPIAuth as useAuth } from '@/lib/auth/api-context';
import { Loader as Loader2, ShieldCheck, Sparkles, Heart, Gift, Mail, Apple, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showOTPVerify, setShowOTPVerify] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signIn, signUp, signInWithOAuth, signInWithOTP, verifyOTP } = useAuth();

  const handleOAuthSignIn = async (provider: 'google' | 'apple') => {
    setIsLoading(true);
    setError(null);

    if (!signInWithOAuth) {
      setError('OAuth sign-in is not available');
      setIsLoading(false);
      return;
    }

    const { error } = await signInWithOAuth(provider);

    if (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      onOpenChange(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    const { error } = await signUp(email, password, fullName);

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      onOpenChange(false);
    }
  };

  const handleOTPRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    if (!signInWithOTP) {
      setError('OTP sign-in is not available');
      setIsLoading(false);
      return;
    }

    const { error } = await signInWithOTP(email);

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      setOtpEmail(email);
      setShowOTPVerify(true);
      setSuccess('Check your email for the verification code');
      setIsLoading(false);
    }
  };

  const handleOTPVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const token = formData.get('token') as string;

    if (!verifyOTP) {
      setError('OTP verification is not available');
      setIsLoading(false);
      return;
    }

    const { error } = await verifyOTP(otpEmail, token);

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="relative">
          <div className="relative p-6 pb-4">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full blur-xl opacity-50" style={{ background: 'radial-gradient(circle, rgba(212, 175, 138, 0.4), transparent)' }} />
                <div className="relative p-3 rounded-full" style={{ background: 'linear-gradient(135deg, rgba(212, 175, 138, 0.6), rgba(184, 160, 220, 0.6))' }}>
                  <Gift className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            <DialogHeader className="space-y-1 text-center">
              <DialogTitle className="text-2xl font-bold text-white">
                Welcome Back
              </DialogTitle>
              <DialogDescription className="text-base">
                Sign in to continue your spiritual journey
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center justify-center gap-6 mt-6 mb-4">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Heart className="w-4 h-4" style={{ color: '#d4af8a' }} />
                <span>Wishlist</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <ShieldCheck className="w-4 h-4" style={{ color: '#d4af8a' }} />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Sparkles className="w-4 h-4" style={{ color: '#d4af8a' }} />
                <span>Rewards</span>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-white/5 border border-white/20 p-1">
                <TabsTrigger value="signin" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70">Sign Up</TabsTrigger>
                <TabsTrigger value="otp" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70">OTP</TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-4 bg-green-500/20 text-green-200 border-green-500/30">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="signin" className="space-y-4 mt-0">
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-base font-medium bg-white/5 border-white/20 text-white hover:bg-white/10 transition-all"
                    onClick={() => handleOAuthSignIn('google')}
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-base font-medium bg-white/5 border-white/20 text-white hover:bg-white/10 transition-all"
                    onClick={() => handleOAuthSignIn('apple')}
                    disabled={isLoading}
                  >
                    <Apple className="w-5 h-5 mr-3" />
                    Continue with Apple
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="bg-white/20" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="px-2 text-white/50" style={{ background: 'rgba(60, 30, 100, 0.35)' }}>Or with email</span>
                  </div>
                </div>

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      disabled={isLoading}
                      autoComplete="email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        required
                        disabled={isLoading}
                        autoComplete="current-password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-medium py-6 text-base shadow-lg shadow-emerald-500/30 transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>

                <div className="text-center">
                  <Button variant="link" className="text-sm text-gray-600 hover:text-gray-900">
                    Forgot password?
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-0">
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-base font-medium bg-white/5 border-white/20 text-white hover:bg-white/10 transition-all"
                    onClick={() => handleOAuthSignIn('google')}
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign up with Google
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-base font-medium bg-white/5 border-white/20 text-white hover:bg-white/10 transition-all"
                    onClick={() => handleOAuthSignIn('apple')}
                    disabled={isLoading}
                  >
                    <Apple className="w-5 h-5 mr-3" />
                    Sign up with Apple
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or sign up with email</span>
                  </div>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      name="fullName"
                      type="text"
                      placeholder="Your full name"
                      required
                      disabled={isLoading}
                      autoComplete="name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      disabled={isLoading}
                      autoComplete="email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        name="password"
                        type={showSignUpPassword ? "text" : "password"}
                        placeholder="Create a password (min 8 characters)"
                        required
                        disabled={isLoading}
                        autoComplete="new-password"
                        minLength={8}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                        tabIndex={-1}
                      >
                        {showSignUpPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-confirm"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        required
                        disabled={isLoading}
                        autoComplete="new-password"
                        minLength={8}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-medium py-6 text-base shadow-lg shadow-emerald-500/30 transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>

                <p className="text-xs text-center text-gray-500 px-4">
                  By signing up, you agree to our Terms of Service and Privacy Policy
                </p>
              </TabsContent>

              <TabsContent value="otp" className="space-y-4 mt-0">
                {!showOTPVerify ? (
                  <>
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full mb-3">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">Sign in with OTP</h3>
                      <p className="text-sm text-gray-600">
                        We'll send you a one-time password to your email
                      </p>
                    </div>

                    <form onSubmit={handleOTPRequest} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="otp-email">Email Address</Label>
                        <Input
                          id="otp-email"
                          name="email"
                          type="email"
                          placeholder="your@email.com"
                          required
                          disabled={isLoading}
                          autoComplete="email"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-medium py-6 text-base shadow-lg shadow-emerald-500/30 transition-all"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending code...
                          </>
                        ) : (
                          'Send OTP Code'
                        )}
                      </Button>
                    </form>
                  </>
                ) : (
                  <>
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full mb-3">
                        <ShieldCheck className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">Verify OTP Code</h3>
                      <p className="text-sm text-gray-600">
                        Enter the 6-digit code sent to <strong>{otpEmail}</strong>
                      </p>
                    </div>

                    <form onSubmit={handleOTPVerify} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="otp-token">Verification Code</Label>
                        <Input
                          id="otp-token"
                          name="token"
                          type="text"
                          placeholder="000000"
                          required
                          disabled={isLoading}
                          maxLength={6}
                          className="text-center text-2xl tracking-widest font-mono"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-medium py-6 text-base shadow-lg shadow-emerald-500/30 transition-all"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          'Verify Code'
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="link"
                        className="w-full"
                        onClick={() => {
                          setShowOTPVerify(false);
                          setSuccess(null);
                        }}
                      >
                        Use a different email
                      </Button>
                    </form>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
