import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface RateRequest {
  carrier_code: string;
  origin: {
    country: string;
    postal_code: string;
    city?: string;
  };
  destination: {
    country: string;
    postal_code: string;
    city?: string;
  };
  package: {
    weight_kg: number;
    length_cm?: number;
    width_cm?: number;
    height_cm?: number;
  };
  service_type?: string;
}

interface DHLRateResponse {
  products: Array<{
    productName: string;
    productCode: string;
    totalPrice: Array<{ price: number; priceCurrency: string }>;
    deliveryCapabilities: { deliveryTypeCode: string; estimatedDeliveryDateAndTime: string };
  }>;
}

interface FedExRateResponse {
  output: {
    rateReplyDetails: Array<{
      serviceType: string;
      ratedShipmentDetails: Array<{ totalNetCharge: number; currency: string; effectiveNetDiscount: { currency: string } }>;
      commit: { dateDetail: { dayFormat: string } };
    }>;
  };
}

interface UPSRateResponse {
  RateResponse: {
    RatedShipment: Array<{
      Service: { Code: string };
      TotalCharges: { MonetaryValue: string; CurrencyCode: string };
      TimeInTransit: { ServiceSummary: { EstimatedArrival: { BusinessDaysInTransit: string } } };
    }>;
  };
}

interface USPSRateResponse {
  Package: {
    Service: Array<{
      SvcDescription: string;
      Rate: string;
    }>;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const rateRequest: RateRequest = await req.json();
    const { carrier_code, origin, destination, package: pkg } = rateRequest;

    // Get carrier configuration
    const { data: carrier, error: carrierError } = await supabase
      .from('carrier_integrations')
      .select('*')
      .eq('carrier_code', carrier_code)
      .eq('is_active', true)
      .single();

    if (carrierError || !carrier) {
      throw new Error(`Carrier not found or inactive: ${carrier_code}`);
    }

    // Get carrier credentials
    const { data: credentials, error: credError } = await supabase
      .from('carrier_credentials')
      .select('*')
      .eq('carrier_code', carrier_code)
      .eq('is_active', true);

    if (credError || !credentials || credentials.length === 0) {
      throw new Error(`No credentials found for carrier: ${carrier_code}`);
    }

    let rates = [];

    // Call appropriate carrier API based on carrier_code
    switch (carrier_code) {
      case 'dhl':
        rates = await getDHLRates(carrier, credentials, origin, destination, pkg);
        break;
      case 'fedex':
        rates = await getFedExRates(carrier, credentials, origin, destination, pkg);
        break;
      case 'ups':
        rates = await getUPSRates(carrier, credentials, origin, destination, pkg);
        break;
      case 'usps':
        rates = await getUSPSRates(carrier, credentials, origin, destination, pkg);
        break;
      default:
        throw new Error(`Unsupported carrier: ${carrier_code}`);
    }

    // Store rates in database
    for (const rate of rates) {
      await supabase.from('shipping_rates').insert({
        carrier_code,
        service_type: rate.service_type,
        origin_country: origin.country,
        origin_postal_code: origin.postal_code,
        destination_country: destination.country,
        destination_postal_code: destination.postal_code,
        weight_kg: pkg.weight_kg,
        dimensions_cm: pkg.length_cm ? { length: pkg.length_cm, width: pkg.width_cm, height: pkg.height_cm } : null,
        rate_amount: rate.amount,
        currency: rate.currency,
        estimated_days: rate.estimated_days,
        service_level: rate.service_level,
      });
    }

    return new Response(JSON.stringify({ success: true, rates }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error getting shipping rates:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to get shipping rates' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// DHL Express API Integration
async function getDHLRates(carrier: any, credentials: any[], origin: any, destination: any, pkg: any) {
  const apiKey = credentials.find(c => c.credential_type === 'api_key')?.credential_value;
  const accountNumber = credentials.find(c => c.credential_type === 'account_number')?.credential_value;

  if (!apiKey || !accountNumber) {
    throw new Error('Missing DHL credentials');
  }

  const requestBody = {
    customerDetails: { shipperDetails: { postalCode: origin.postal_code, cityName: origin.city, countryCode: origin.country }, receiverDetails: { postalCode: destination.postal_code, cityName: destination.city, countryCode: destination.country } },
    accounts: [{ typeCode: 'shipper', number: accountNumber }],
    productCode: carrier.configuration.service_codes?.express || 'P',
    packages: [{ weight: pkg.weight_kg, dimensions: { length: pkg.length_cm || 10, width: pkg.width_cm || 10, height: pkg.height_cm || 10 } }],
  };

  try {
    const response = await fetch(`${carrier.api_endpoint}/mydhlapi/rates`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.error('DHL API Error:', await response.text());
      return [{ service_type: 'DHL Express', amount: 0, currency: 'USD', estimated_days: 3, service_level: 'express', error: 'API call failed' }];
    }

    const data: DHLRateResponse = await response.json();
    return data.products.map(product => ({
      service_type: product.productName,
      amount: product.totalPrice[0]?.price || 0,
      currency: product.totalPrice[0]?.priceCurrency || 'USD',
      estimated_days: 3,
      service_level: product.productCode,
    }));
  } catch (error) {
    console.error('DHL API Error:', error);
    return [{ service_type: 'DHL Express', amount: 0, currency: 'USD', estimated_days: 3, service_level: 'express', error: error.message }];
  }
}

// FedEx API Integration
async function getFedExRates(carrier: any, credentials: any[], origin: any, destination: any, pkg: any) {
  const apiKey = credentials.find(c => c.credential_type === 'api_key')?.credential_value;
  const secretKey = credentials.find(c => c.credential_type === 'secret_key')?.credential_value;

  if (!apiKey || !secretKey) {
    throw new Error('Missing FedEx credentials');
  }

  // First, get OAuth token
  let accessToken;
  try {
    const tokenResponse = await fetch(`${carrier.api_endpoint}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`,
    });

    if (!tokenResponse.ok) {
      console.error('FedEx OAuth Error:', await tokenResponse.text());
      return [{ service_type: 'FedEx International', amount: 0, currency: 'USD', estimated_days: 4, service_level: 'international', error: 'OAuth failed' }];
    }

    const tokenData = await tokenResponse.json();
    accessToken = tokenData.access_token;
  } catch (error) {
    console.error('FedEx OAuth Error:', error);
    return [{ service_type: 'FedEx International', amount: 0, currency: 'USD', estimated_days: 4, service_level: 'international', error: error.message }];
  }

  const requestBody = {
    accountNumber: { value: credentials.find(c => c.credential_type === 'account_number')?.credential_value },
    requestedShipment: {
      shipper: { address: { postalCode: origin.postal_code, countryCode: origin.country } },
      recipient: { address: { postalCode: destination.postal_code, countryCode: destination.country } },
      pickupType: 'DROPOFF_AT_FEDEX_LOCATION',
      rateRequestType: ['LIST'],
      requestedPackageLineItems: [{ weight: { units: 'KG', value: pkg.weight_kg } }],
    },
  };

  try {
    const response = await fetch(`${carrier.api_endpoint}/rate/v1/rates/quotes`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.error('FedEx Rate API Error:', await response.text());
      return [{ service_type: 'FedEx International', amount: 0, currency: 'USD', estimated_days: 4, service_level: 'international', error: 'Rate API failed' }];
    }

    const data: FedExRateResponse = await response.json();
    return data.output.rateReplyDetails.map(rate => ({
      service_type: rate.serviceType,
      amount: rate.ratedShipmentDetails[0]?.totalNetCharge || 0,
      currency: rate.ratedShipmentDetails[0]?.currency || 'USD',
      estimated_days: 4,
      service_level: rate.serviceType,
    }));
  } catch (error) {
    console.error('FedEx Rate API Error:', error);
    return [{ service_type: 'FedEx International', amount: 0, currency: 'USD', estimated_days: 4, service_level: 'international', error: error.message }];
  }
}

// UPS API Integration
async function getUPSRates(carrier: any, credentials: any[], origin: any, destination: any, pkg: any) {
  const apiKey = credentials.find(c => c.credential_type === 'api_key')?.credential_value;
  const username = credentials.find(c => c.credential_type === 'username')?.credential_value;
  const password = credentials.find(c => c.credential_type === 'password')?.credential_value;

  if (!apiKey || !username || !password) {
    throw new Error('Missing UPS credentials');
  }

  const requestBody = {
    RateRequest: {
      Shipment: {
        Shipper: { Address: { PostalCode: origin.postal_code, CountryCode: origin.country } },
        ShipTo: { Address: { PostalCode: destination.postal_code, CountryCode: destination.country } },
        Package: { PackagingType: { Code: '02' }, PackageWeight: { UnitOfMeasurement: { Code: 'KGS' }, Weight: String(pkg.weight_kg) } },
      },
    },
  };

  try {
    const response = await fetch(`${carrier.api_endpoint}/api/rating/v1/Rate`, {
      method: 'POST',
      headers: { 'Authorization': `Basic ${btoa(`${username}:${password}`)}`, 'Content-Type': 'application/json', 'transId': crypto.randomUUID(), 'transactionSrc': 'testing' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.error('UPS API Error:', await response.text());
      return [{ service_type: 'UPS', amount: 0, currency: 'USD', estimated_days: 3, service_level: 'standard', error: 'API call failed' }];
    }

    const data: UPSRateResponse = await response.json();
    return data.RateResponse.RatedShipment.map(rate => ({
      service_type: `UPS ${rate.Service.Code}`,
      amount: parseFloat(rate.TotalCharges.MonetaryValue),
      currency: rate.TotalCharges.CurrencyCode,
      estimated_days: parseInt(rate.TimeInTransit?.ServiceSummary?.EstimatedArrival?.BusinessDaysInTransit || '3'),
      service_level: rate.Service.Code,
    }));
  } catch (error) {
    console.error('UPS API Error:', error);
    return [{ service_type: 'UPS', amount: 0, currency: 'USD', estimated_days: 3, service_level: 'standard', error: error.message }];
  }
}

// USPS API Integration
async function getUSPSRates(carrier: any, credentials: any[], origin: any, destination: any, pkg: any) {
  const userId = credentials.find(c => c.credential_type === 'user_id')?.credential_value;

  if (!userId) {
    throw new Error('Missing USPS credentials');
  }

  const xmlRequest = `<IntlRateV2Request USERID="${userId}"><Revision>2</Revision><Package ID="1ST"><Pounds>${Math.floor(pkg.weight_kg * 2.20462)}</Pounds><Ounces>${Math.round((pkg.weight_kg * 2.20462 % 1) * 16)}</Ounces><MailType>Package</MailType><Country>${destination.country}</Country></Package></IntlRateV2Request>`;

  try {
    const response = await fetch(`${carrier.api_endpoint}/ShippingAPI.dll?API=IntlRateV2&XML=${encodeURIComponent(xmlRequest)}`);

    if (!response.ok) {
      console.error('USPS API Error:', await response.text());
      return [{ service_type: 'USPS', amount: 0, currency: 'USD', estimated_days: 7, service_level: 'standard', error: 'API call failed' }];
    }

    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    const services = xmlDoc.getElementsByTagName('Service');
    const rates = [];
    
    for (let i = 0; i < services.length; i++) {
      const service = services[i];
      const svcDescription = service.getElementsByTagName('SvcDescription')[0]?.textContent;
      const rate = service.getElementsByTagName('Rate')[0]?.textContent;
      
      if (svcDescription && rate) {
        rates.push({
          service_type: svcDescription,
          amount: parseFloat(rate),
          currency: 'USD',
          estimated_days: 7,
          service_level: 'international',
        });
      }
    }

    return rates.length > 0 ? rates : [{ service_type: 'USPS', amount: 0, currency: 'USD', estimated_days: 7, service_level: 'standard', error: 'No rates found' }];
  } catch (error) {
    console.error('USPS API Error:', error);
    return [{ service_type: 'USPS', amount: 0, currency: 'USD', estimated_days: 7, service_level: 'standard', error: error.message }];
  }
}