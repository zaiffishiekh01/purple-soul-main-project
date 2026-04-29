'use client';

import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' };

    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };

    if (checks.length) score += 20;
    if (checks.uppercase) score += 20;
    if (checks.lowercase) score += 20;
    if (checks.number) score += 20;
    if (checks.special) score += 20;

    let label = '';
    let color = '';

    if (score <= 20) {
      label = 'Weak';
      color = 'bg-red-500';
    } else if (score <= 40) {
      label = 'Fair';
      color = 'bg-orange-500';
    } else if (score <= 60) {
      label = 'Good';
      color = 'bg-yellow-500';
    } else if (score <= 80) {
      label = 'Strong';
      color = 'bg-emerald-500';
    } else {
      label = 'Very Strong';
      color = 'bg-emerald-600';
    }

    return { score, label, color, checks };
  }, [password]);

  if (!password) return null;

  return (
    <div className="space-y-3 mt-2">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">Password Strength</span>
          <span className={`font-semibold ${
            strength.score <= 40 ? 'text-red-600' :
            strength.score <= 60 ? 'text-yellow-600' :
            'text-emerald-600'
          }`}>
            {strength.label}
          </span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${strength.color}`}
            style={{ width: `${strength.score}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {strength.checks && (
          <>
            <div className={`flex items-center gap-1.5 ${
              strength.checks.length ? 'text-emerald-600' : 'text-gray-400'
            }`}>
              {strength.checks.length ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <X className="w-3.5 h-3.5" />
              )}
              <span>8+ characters</span>
            </div>
            <div className={`flex items-center gap-1.5 ${
              strength.checks.uppercase ? 'text-emerald-600' : 'text-gray-400'
            }`}>
              {strength.checks.uppercase ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <X className="w-3.5 h-3.5" />
              )}
              <span>Uppercase letter</span>
            </div>
            <div className={`flex items-center gap-1.5 ${
              strength.checks.number ? 'text-emerald-600' : 'text-gray-400'
            }`}>
              {strength.checks.number ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <X className="w-3.5 h-3.5" />
              )}
              <span>Number</span>
            </div>
            <div className={`flex items-center gap-1.5 ${
              strength.checks.special ? 'text-emerald-600' : 'text-gray-400'
            }`}>
              {strength.checks.special ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <X className="w-3.5 h-3.5" />
              )}
              <span>Special character</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
