'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAPIAuth as useAuth } from '@/lib/auth/api-context';
import { Loader2, ShieldCheck, Smartphone, QrCode, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function TwoFactorSetup() {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [factorId, setFactorId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const { enrollMFA, verifyMFA } = useAuth();

  const handleEnroll = async () => {
    setIsEnrolling(true);
    setError(null);

    if (!enrollMFA) {
      setError('MFA enrollment is not available');
      setIsEnrolling(false);
      return;
    }

    const result = await enrollMFA();

    if (result.error) {
      setError(result.error.message);
      setIsEnrolling(false);
    } else if (result.data) {
      setQrCode(result.data.qrCode || '');
      setSecret(result.data.secret || '');
      setShowEnrollDialog(true);
      setIsEnrolling(false);
    } else {
      setError('Failed to enroll MFA');
      setIsEnrolling(false);
    }
  };

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsVerifying(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const code = formData.get('code') as string;

    if (!verifyMFA) {
      setError('MFA verification is not available');
      setIsVerifying(false);
      return;
    }

    const { error: verifyError } = await verifyMFA(code);

    if (verifyError) {
      setError(verifyError.message);
      setIsVerifying(false);
    } else {
      setSuccess(true);
      setIsVerifying(false);
      setTimeout(() => {
        setShowEnrollDialog(false);
        setSuccess(false);
      }, 2000);
    }
  };

  return (
    <>
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
            <Smartphone className="w-5 h-5 text-emerald-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-emerald-900 mb-1">
                Protect Your Account
              </h4>
              <p className="text-sm text-emerald-800">
                Two-factor authentication (2FA) adds an additional layer of security by requiring a
                verification code from your authenticator app in addition to your password.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">How it works:</h4>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-2">
                <span className="font-semibold text-emerald-600">1.</span>
                <span>Download an authenticator app like Google Authenticator or Authy</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-emerald-600">2.</span>
                <span>Scan the QR code with your authenticator app</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-emerald-600">3.</span>
                <span>Enter the 6-digit code from your app to verify</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-emerald-600">4.</span>
                <span>Use codes from your app when signing in</span>
              </li>
            </ol>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleEnroll}
            disabled={isEnrolling}
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-medium"
          >
            {isEnrolling ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Setting up 2FA...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 mr-2" />
                Enable Two-Factor Authentication
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
        <DialogContent className="max-w-md">
          {!success ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-emerald-600" />
                  Set Up Two-Factor Authentication
                </DialogTitle>
                <DialogDescription>
                  Scan the QR code below with your authenticator app
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {qrCode && (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                      <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">
                        Can't scan? Enter this code manually:
                      </p>
                      <code className="px-3 py-2 bg-gray-100 rounded text-sm font-mono break-all">
                        {secret}
                      </code>
                    </div>
                  </div>
                )}

                <form onSubmit={handleVerify} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="verify-code">Verification Code</Label>
                    <Input
                      id="verify-code"
                      name="code"
                      type="text"
                      placeholder="000000"
                      required
                      disabled={isVerifying}
                      maxLength={6}
                      className="text-center text-xl tracking-widest font-mono"
                    />
                    <p className="text-xs text-gray-500">
                      Enter the 6-digit code from your authenticator app
                    </p>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify and Enable'
                    )}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500 rounded-full blur-xl opacity-50 animate-pulse" />
                <div className="relative bg-gradient-to-br from-emerald-500 to-cyan-500 p-4 rounded-full">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  2FA Enabled Successfully!
                </h3>
                <p className="text-gray-600">
                  Your account is now protected with two-factor authentication
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
