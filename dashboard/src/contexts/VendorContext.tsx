import { createContext, useContext, ReactNode } from 'react';
import { useVendor } from '../hooks/useVendor';
import { Vendor } from '../types';

interface VendorContextType {
  vendor: Vendor | null;
  loading: boolean;
  updateVendor: (updates: Partial<Vendor>) => Promise<Vendor>;
  refetch: () => void;
}

export const VendorContext = createContext<VendorContextType | undefined>(undefined);

export function VendorProvider({ children }: { children: ReactNode }) {
  const vendorData = useVendor();

  // vendorData is already memoized in useVendor, so we can use it directly
  // No need to wrap in additional useMemo since useVendor returns a stable reference

  return (
    <VendorContext.Provider value={vendorData}>
      {children}
    </VendorContext.Provider>
  );
}

export function useVendorContext() {
  const context = useContext(VendorContext);
  if (context === undefined) {
    throw new Error('useVendorContext must be used within a VendorProvider');
  }
  return context;
}
