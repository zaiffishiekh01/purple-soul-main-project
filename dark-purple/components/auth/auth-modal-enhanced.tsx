'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useAPIAuth as useAuth } from '@/lib/auth/api-context';
import { Loader2, ShieldCheck, Sparkles, Heart, Gift, Mail, Apple, Eye, EyeOff, CheckCircle2, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { PasswordStrength } from './password-strength';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'signin' | 'signup' | 'otp';
}

export function AuthModalEnhanced({ open, onOpenChange, defaultTab = 'signin' }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showOTPVerify, setShowOTPVerify] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupPassword, setSignupPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
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
      setSuccess('Welcome back!');
      setTimeout(() => onOpenChange(false), 800);
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
      setSuccess('Account created successfully!');
      setTimeout(() => onOpenChange(false), 800);
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
      setSuccess('Verified successfully!');
      setTimeout(() => onOpenChange(false), 800);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[460px] p-0 overflow-hidden border border-white/10 shadow-2xl bg-[rgba(40,20,70,0.98)] backdrop-blur-xl">
        <DialogTitle className="sr-only">Authentication</DialogTitle>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5" />
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

          <div className="relative px-8 pt-8 pb-6">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full blur-2xl opacity-40 animate-pulse" />
                <div className="relative bg-gradient-to-br from-emerald-500 to-cyan-500 p-4 rounded-2xl shadow-xl">
                  <Gift className="w-9 h-9 text-white" />
                </div>
              </div>
            </div>

            <div className="text-center space-y-2 mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Welcome Back
              </h2>
              <p className="text-white/80 text-sm">
                Sign in to continue your spiritual journey
              </p>
            </div>

            <div className="flex items-center justify-center gap-8 py-4 px-6 bg-white/5 rounded-xl border border-white/10">
              <div className="flex flex-col items-center gap-1.5">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Heart className="w-4 h-4 text-rose-400" />
                </div>
                <span className="text-xs font-medium text-white/90">Wishlist</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="p-2 bg-white/10 rounded-lg">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-xs font-medium text-white/90">Secure</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-xs font-medium text-white/90">Rewards</span>
              </div>
            </div>
          </div>

          <div className="px-8 pb-8">
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 h-11 bg-white/5 border border-white/10">
                <TabsTrigger
                  value="signin"
                  className="data-[state=active]:bg-white/15 data-[state=active]:text-white data-[state=active]:shadow-sm text-white/60 font-semibold data-[state=active]:border data-[state=active]:border-white/20"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:bg-white/15 data-[state=active]:text-white data-[state=active]:shadow-sm text-white/60 font-semibold data-[state=active]:border data-[state=active]:border-white/20"
                >
                  Sign Up
                </TabsTrigger>
                <TabsTrigger
                  value="otp"
                  className="data-[state=active]:bg-white/15 data-[state=active]:text-white data-[state=active]:shadow-sm text-white/60 font-semibold data-[state=active]:border data-[state=active]:border-white/20"
                >
                  OTP
                </TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive" className="mb-4 animate-in slide-in-from-top-2">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-4 bg-emerald-500/20 text-emerald-100 border-emerald-400/30 animate-in slide-in-from-top-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <AlertDescription className="ml-2">{success}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="signin" className="space-y-4 mt-0">
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-[15px] font-semibold border-2 border-white/20 text-white bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                    onClick={() => handleOAuthSignIn('google')}
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-[15px] font-semibold border-2 border-white/20 text-white bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                    onClick={() => handleOAuthSignIn('apple')}
                    disabled={isLoading}
                  >
                    <Apple className="w-5 h-5 mr-3" />
                    Continue with Apple
                  </Button>
                </div>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="bg-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[rgba(40,20,70,0.98)] px-3 text-white/60 font-medium">Or with email</span>
                  </div>
                </div>

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-sm font-semibold text-white">Email Address</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      required
                      disabled={isLoading}
                      autoComplete="email"
                      className="h-11 border-2 border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-emerald-400 focus:bg-white/10 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-sm font-semibold text-white">Password</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        required
                        disabled={isLoading}
                        autoComplete="current-password"
                        className="h-11 border-2 border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-emerald-400 focus:bg-white/10 transition-colors pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        className="border-white/30 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                      />
                      <label
                        htmlFor="remember"
                        className="text-sm text-white/90 cursor-pointer select-none"
                      >
                        Remember me
                      </label>
                    </div>
                    <Button variant="link" className="text-sm text-emerald-400 hover:text-emerald-300 px-0 h-auto font-semibold">
                      Forgot password?
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white font-semibold text-[15px] shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:scale-[1.01] hover:shadow-xl active:scale-[0.99]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Sign In Securely
                      </>
                    )}
                  </Button>
                </form>

                <div className="text-center pt-2">
                  <p className="text-xs text-white/50">
                    <ShieldCheck className="w-3 h-3 inline mr-1" />
                    Protected by industry-standard encryption
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-0">
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-[15px] font-semibold border-2 border-white/20 text-white bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                    onClick={() => handleOAuthSignIn('google')}
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign up with Google
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-[15px] font-semibold border-2 border-white/20 text-white bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                    onClick={() => handleOAuthSignIn('apple')}
                    disabled={isLoading}
                  >
                    <Apple className="w-5 h-5 mr-3" />
                    Sign up with Apple
                  </Button>
                </div>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="bg-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[rgba(40,20,70,0.98)] px-3 text-white/60 font-medium">Or with email</span>
                  </div>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-sm font-semibold text-white">Full Name</Label>
                    <Input
                      id="signup-name"
                      name="fullName"
                      type="text"
                      placeholder="Your full name"
                      required
                      disabled={isLoading}
                      autoComplete="name"
                      className="h-11 border-2 border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-emerald-400 focus:bg-white/10 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-semibold text-white">Email Address</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      required
                      disabled={isLoading}
                      autoComplete="email"
                      className="h-11 border-2 border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-emerald-400 focus:bg-white/10 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-semibold text-white">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        required
                        disabled={isLoading}
                        autoComplete="new-password"
                        minLength={8}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="h-11 border-2 border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-emerald-400 focus:bg-white/10 transition-colors pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <PasswordStrength password={signupPassword} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm" className="text-sm font-semibold text-white">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-confirm"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        required
                        disabled={isLoading}
                        autoComplete="new-password"
                        minLength={8}
                        className="h-11 border-2 border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-emerald-400 focus:bg-white/10 transition-colors pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white font-semibold text-[15px] shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:scale-[1.01] hover:shadow-xl active:scale-[0.99]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Your Account'
                    )}
                  </Button>
                </form>

                <p className="text-xs text-center text-white/50 px-2 pt-2">
                  By signing up, you agree to our{' '}
                  <button className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline">
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline">
                    Privacy Policy
                  </button>
                </p>
              </TabsContent>

              <TabsContent value="otp" className="space-y-4 mt-0">
                {!showOTPVerify ? (
                  <>
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl mb-4 shadow-lg shadow-emerald-500/30">
                        <Mail className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-xl mb-2 text-white">Sign in with OTP</h3>
                      <p className="text-sm text-white/70">
                        We'll send a one-time code to your email
                      </p>
                    </div>

                    <form onSubmit={handleOTPRequest} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="otp-email" className="text-sm font-semibold text-white">Email Address</Label>
                        <Input
                          id="otp-email"
                          name="email"
                          type="email"
                          placeholder="name@example.com"
                          required
                          disabled={isLoading}
                          autoComplete="email"
                          className="h-11 border-2 border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-emerald-400 focus:bg-white/10 transition-colors"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white font-semibold text-[15px] shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:scale-[1.01] hover:shadow-xl active:scale-[0.99]"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending code...
                          </>
                        ) : (
                          <>
                            <Mail className="w-4 h-4 mr-2" />
                            Send Verification Code
                          </>
                        )}
                      </Button>
                    </form>

                    <div className="text-center pt-2">
                      <p className="text-xs text-white/50">
                        No password needed, just your email
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl mb-4 shadow-lg shadow-emerald-500/30">
                        <ShieldCheck className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-xl mb-2 text-white">Verify Your Code</h3>
                      <p className="text-sm text-white/70">
                        Enter the 6-digit code sent to
                      </p>
                      <p className="text-sm font-semibold text-emerald-400 mt-1">{otpEmail}</p>
                    </div>

                    <form onSubmit={handleOTPVerify} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="otp-token" className="text-sm font-semibold text-white">Verification Code</Label>
                        <Input
                          id="otp-token"
                          name="token"
                          type="text"
                          placeholder="000000"
                          required
                          disabled={isLoading}
                          maxLength={6}
                          className="h-14 text-center text-3xl tracking-[0.5em] font-bold border-2 border-white/20 bg-white/5 text-white placeholder:text-white/30 focus:border-emerald-400 focus:bg-white/10 transition-colors"
                        />
                        <p className="text-xs text-center text-white/50">
                          Check your email inbox and spam folder
                        </p>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white font-semibold text-[15px] shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:scale-[1.01] hover:shadow-xl active:scale-[0.99]"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Verify Code
                          </>
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full text-white/70 hover:text-white hover:bg-white/5"
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
