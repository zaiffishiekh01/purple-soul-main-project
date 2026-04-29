'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useRef, ReactNode } from 'react';

export interface CheckoutCustomer {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface CheckoutAddress {
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface CheckoutShipping {
  methodId: string;
  methodName: string;
  price: number;
  estimatedDays?: string;
}

export interface CheckoutPayment {
  method: 'card' | 'paypal' | 'googlepay';
  methodLabel: string;
}

interface CheckoutContextType {
  customer: CheckoutCustomer | null;
  shippingAddress: CheckoutAddress | null;
  billingAddress: CheckoutAddress | null;
  shipping: CheckoutShipping | null;
  payment: CheckoutPayment | null;
  useSameAddress: boolean;
  setCustomer: (customer: CheckoutCustomer) => void;
  setShippingAddress: (address: CheckoutAddress) => void;
  setBillingAddress: (address: CheckoutAddress) => void;
  setShipping: (shipping: CheckoutShipping) => void;
  setPayment: (payment: CheckoutPayment) => void;
  setUseSameAddress: (same: boolean) => void;
  reset: () => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

const STORAGE_KEY = 'checkout_data';

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomerState] = useState<CheckoutCustomer | null>(null);
  const [shippingAddress, setShippingAddressState] = useState<CheckoutAddress | null>(null);
  const [billingAddress, setBillingAddressState] = useState<CheckoutAddress | null>(null);
  const [shipping, setShippingState] = useState<CheckoutShipping | null>(null);
  const [payment, setPaymentState] = useState<CheckoutPayment | null>(null);
  const [useSameAddress, setUseSameAddressState] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setCustomerState(data.customer || null);
        setShippingAddressState(data.shippingAddress || null);
        setBillingAddressState(data.billingAddress || null);
        setShippingState(data.shipping || null);
        setPaymentState(data.payment || null);
        setUseSameAddressState(data.useSameAddress ?? true);
      }
    } catch (e) {
      console.error('Failed to restore checkout data:', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        customer,
        shippingAddress,
        billingAddress,
        shipping,
        payment,
        useSameAddress,
      }));
    }, 500);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [customer, shippingAddress, billingAddress, shipping, payment, useSameAddress, isHydrated]);

  const reset = () => {
    setCustomerState(null);
    setShippingAddressState(null);
    setBillingAddressState(null);
    setShippingState(null);
    setPaymentState(null);
    setUseSameAddressState(true);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const contextValue = useMemo(() => ({
    customer,
    shippingAddress,
    billingAddress,
    shipping,
    payment,
    useSameAddress,
    setCustomer: setCustomerState,
    setShippingAddress: setShippingAddressState,
    setBillingAddress: setBillingAddressState,
    setShipping: setShippingState,
    setPayment: setPaymentState,
    setUseSameAddress: setUseSameAddressState,
    reset,
  }), [customer, shippingAddress, billingAddress, shipping, payment, useSameAddress]);

  return (
    <CheckoutContext.Provider value={contextValue}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
}
