import { supabase } from './supabase';
import { NEXT_PUBLIC_SUPABASE_URL } from './env';

export interface CarrierIntegration {
  id: string;
  carrier_name: string;
  carrier_code: string;
  api_endpoint: string;
  is_active: boolean;
  supports_rates: boolean;
  supports_labels: boolean;
  supports_tracking: boolean;
  configuration: any;
  created_at: string;
  updated_at: string;
}

export interface ShippingAddress {
  name: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  email?: string;
}

export interface PackageDetails {
  weight_kg: number;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  description?: string;
  value?: number;
  currency?: string;
}

export interface ShippingRate {
  carrier_code: string;
  service_type: string;
  amount: number;
  currency: string;
  estimated_days: number;
  service_level: string;
}

export interface LabelResponse {
  success: boolean;
  tracking_number: string;
  label_url?: string;
  label_base64?: string;
  error?: string;
}

export async function getActiveCarriers(): Promise<CarrierIntegration[]> {
  const { data, error } = await supabase
    .from('carrier_integrations')
    .select('*')
    .eq('is_active', true)
    .order('carrier_name');

  if (error) {
    console.error('Error fetching carriers:', error);
    return [];
  }

  return data || [];
}

export async function getShippingRates(
  carrierCode: string,
  origin: { country: string; postal_code: string; city?: string },
  destination: { country: string; postal_code: string; city?: string },
  packageDetails: PackageDetails
): Promise<ShippingRate[]> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    const apiUrl = `${NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-shipping-rates`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        carrier_code: carrierCode,
        origin,
        destination,
        package: packageDetails,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get shipping rates');
    }

    const result = await response.json();
    return result.rates || [];
  } catch (error) {
    console.error('Error getting shipping rates:', error);
    throw error;
  }
}

export async function getAllCarrierRates(
  origin: { country: string; postal_code: string; city?: string },
  destination: { country: string; postal_code: string; city?: string },
  packageDetails: PackageDetails
): Promise<{ carrier: string; rates: ShippingRate[]; error?: string }[]> {
  const carriers = await getActiveCarriers();
  const results = [];

  for (const carrier of carriers) {
    if (!carrier.supports_rates) continue;

    try {
      const rates = await getShippingRates(
        carrier.carrier_code,
        origin,
        destination,
        packageDetails
      );
      results.push({
        carrier: carrier.carrier_name,
        rates,
      });
    } catch (error) {
      results.push({
        carrier: carrier.carrier_name,
        rates: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}

export async function createShippingLabel(
  carrierCode: string,
  shipmentId: string,
  serviceType: string,
  shipper: ShippingAddress,
  recipient: ShippingAddress,
  packageDetails: PackageDetails
): Promise<LabelResponse> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    const apiUrl = `${NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-shipping-label`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        carrier_code: carrierCode,
        shipment_id: shipmentId,
        service_type: serviceType,
        shipper,
        recipient,
        package: packageDetails,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create shipping label');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating shipping label:', error);
    return {
      success: false,
      tracking_number: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function trackShipment(
  carrierCode: string,
  trackingNumber: string
): Promise<any> {
  const carriers = await getActiveCarriers();
  const carrier = carriers.find(c => c.carrier_code === carrierCode);

  if (!carrier || !carrier.supports_tracking) {
    throw new Error('Carrier does not support tracking');
  }

  const trackingUrls: Record<string, string> = {
    dhl: `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
    fedex: `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
    ups: `https://www.ups.com/track?tracknum=${trackingNumber}`,
    usps: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
  };

  return {
    tracking_url: trackingUrls[carrierCode] || '#',
    carrier: carrier.carrier_name,
    tracking_number: trackingNumber,
  };
}

export function downloadLabel(labelData: string, trackingNumber: string, format: 'pdf' | 'base64' = 'pdf') {
  if (format === 'pdf' && labelData.startsWith('http')) {
    window.open(labelData, '_blank');
  } else {
    const link = document.createElement('a');
    link.href = labelData.startsWith('data:') ? labelData : `data:application/pdf;base64,${labelData}`;
    link.download = `shipping-label-${trackingNumber}.pdf`;
    link.click();
  }
}
