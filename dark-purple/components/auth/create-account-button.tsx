'use client';

import { useState } from 'react';
import { AuthModalEnhanced } from './auth-modal-enhanced';

interface CreateAccountButtonProps {
  children: React.ReactNode;
  className?: string;
}

export function CreateAccountButton({ children, className }: CreateAccountButtonProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowAuthModal(true)}
        className={className}
      >
        {children}
      </button>
      <AuthModalEnhanced
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        defaultTab="signup"
      />
    </>
  );
}
