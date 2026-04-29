import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';

export interface CheckoutCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface CheckoutAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CheckoutShipping {
  method: string;
  carrier: string;
  cost: number;
  estimatedDays: string;
}

export interface CheckoutPayment {
  method: 'card' | 'paypal' | 'cod';
  last4?: string;
  transactionId?: string;
}

interface CheckoutState {
  customer: CheckoutCustomer | null;
  shippingAddress: CheckoutAddress | null;
  billingAddress: CheckoutAddress | null;
  shipping: CheckoutShipping | null;
  payment: CheckoutPayment | null;
  useSameAddress: boolean;
}

interface CheckoutContextType extends CheckoutState {
  setCustomer: (customer: CheckoutCustomer) => void;
  setShippingAddress: (address: CheckoutAddress) => void;
  setBillingAddress: (address: CheckoutAddress) => void;
  setShipping: (shipping: CheckoutShipping) => void;
  setPayment: (payment: CheckoutPayment) => void;
  setUseSameAddress: (useSame: boolean) => void;
  reset: () => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

const STORAGE_KEY = 'checkout_state';
const DEBOUNCE_MS = 500;

const defaultState: CheckoutState = {
  customer: null,
  shippingAddress: null,
  billingAddress: null,
  shipping: null,
  payment: null,
  useSameAddress: true,
};

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CheckoutState>(defaultState);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CheckoutState;
        setState((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // Ignore malformed sessionStorage data
    }
  }, []);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // Ignore quota exceeded or storage errors
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [state]);

  const setCustomer = useCallback((customer: CheckoutCustomer) => {
    setState((prev) => ({ ...prev, customer }));
  }, []);

  const setShippingAddress = useCallback((address: CheckoutAddress) => {
    setState((prev) => ({ ...prev, shippingAddress: address }));
  }, []);

  const setBillingAddress = useCallback((address: CheckoutAddress) => {
    setState((prev) => ({ ...prev, billingAddress: address }));
  }, []);

  const setShipping = useCallback((shipping: CheckoutShipping) => {
    setState((prev) => ({ ...prev, shipping }));
  }, []);

  const setPayment = useCallback((payment: CheckoutPayment) => {
    setState((prev) => ({ ...prev, payment }));
  }, []);

  const setUseSameAddress = useCallback((useSame: boolean) => {
    setState((prev) => ({ ...prev, useSameAddress: useSame }));
  }, []);

  const reset = useCallback(() => {
    setState({ ...defaultState, useSameAddress: true });
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      ...state,
      setCustomer,
      setShippingAddress,
      setBillingAddress,
      setShipping,
      setPayment,
      setUseSameAddress,
      reset,
    }),
    [state, setCustomer, setShippingAddress, setBillingAddress, setShipping, setPayment, setUseSameAddress, reset]
  );

  return <CheckoutContext.Provider value={contextValue}>{children}</CheckoutContext.Provider>;
}

export function useCheckout(): CheckoutContextType {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
}
