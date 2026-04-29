import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface LabelRequest {
  carrier_code: string;
  shipment_id: string;
  service_type: string;
  shipper: {
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
  };
  recipient: {
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
  };
  package: {
    weight_kg: number;
    length_cm: number;
    width_cm: number;
    height_cm: number;
    description?: string;
    value?: number;
    currency?: string;
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

    const labelRequest: LabelRequest = await req.json();
    const { carrier_code, shipment_id, service_type, shipper, recipient, package: pkg } = labelRequest;

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

    let labelData;

    // Call appropriate carrier API based on carrier_code
    switch (carrier_code) {
      case 'dhl':
        labelData = await createDHLLabel(carrier, credentials, labelRequest);
        break;
      case 'fedex':
        labelData = await createFedExLabel(carrier, credentials, labelRequest);
        break;
      case 'ups':
        labelData = await createUPSLabel(carrier, credentials, labelRequest);
        break;
      case 'usps':
        labelData = await createUSPSLabel(carrier, credentials, labelRequest);
        break;
      default:
        throw new Error(`Unsupported carrier: ${carrier_code}`);
    }

    // Update shipment with tracking number and label
    await supabase
      .from('shipments')
      .update({
        tracking_number: labelData.tracking_number,
        carrier: carrier.carrier_name,
        status: 'in_transit',
        shipped_at: new Date().toISOString(),
      })
      .eq('id', shipment_id);

    // Store label in shipping_labels table
    await supabase.from('shipping_labels').insert({
      shipment_id,
      carrier: carrier.carrier_name,
      tracking_number: labelData.tracking_number,
      label_format: 'PDF',
      label_data: labelData.label_url || labelData.label_base64,
      service_type,
    });

    return new Response(
      JSON.stringify({
        success: true,
        tracking_number: labelData.tracking_number,
        label_url: labelData.label_url,
        label_base64: labelData.label_base64,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating shipping label:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create shipping label' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// DHL Express Label Creation
async function createDHLLabel(carrier: any, credentials: any[], request: LabelRequest) {
  const apiKey = credentials.find(c => c.credential_type === 'api_key')?.credential_value;
  const accountNumber = credentials.find(c => c.credential_type === 'account_number')?.credential_value;

  if (!apiKey || !accountNumber) {
    throw new Error('Missing DHL credentials');
  }

  const requestBody = {
    plannedShippingDateAndTime: new Date().toISOString(),
    pickup: { isRequested: false },
    productCode: request.service_type || 'P',
    accounts: [{ typeCode: 'shipper', number: accountNumber }],
    customerDetails: {
      shipperDetails: {
        postalAddress: {
          postalCode: request.shipper.postal_code,
          cityName: request.shipper.city,
          countryCode: request.shipper.country,
          addressLine1: request.shipper.address1,
        },
        contactInformation: { email: request.shipper.email, phone: request.shipper.phone, companyName: request.shipper.company, fullName: request.shipper.name },
      },
      receiverDetails: {
        postalAddress: {
          postalCode: request.recipient.postal_code,
          cityName: request.recipient.city,
          countryCode: request.recipient.country,
          addressLine1: request.recipient.address1,
        },
        contactInformation: { email: request.recipient.email, phone: request.recipient.phone, companyName: request.recipient.company, fullName: request.recipient.name },
      },
    },
    content: {
      packages: [{
        weight: request.package.weight_kg,
        dimensions: { length: request.package.length_cm, width: request.package.width_cm, height: request.package.height_cm },
      }],
      isCustomsDeclarable: request.shipper.country !== request.recipient.country,
      declaredValue: request.package.value || 100,
      declaredValueCurrency: request.package.currency || 'USD',
      description: request.package.description || 'Goods',
    },
    outputImageProperties: { imageOptions: [{ typeCode: 'label' }] },
  };

  const response = await fetch(`${carrier.api_endpoint}/mydhlapi/shipments`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DHL API Error: ${errorText}`);
  }

  const data = await response.json();
  return {
    tracking_number: data.shipmentTrackingNumber,
    label_base64: data.documents[0]?.content,
    label_url: null,
  };
}

// FedEx Label Creation
async function createFedExLabel(carrier: any, credentials: any[], request: LabelRequest) {
  const apiKey = credentials.find(c => c.credential_type === 'api_key')?.credential_value;
  const secretKey = credentials.find(c => c.credential_type === 'secret_key')?.credential_value;
  const accountNumber = credentials.find(c => c.credential_type === 'account_number')?.credential_value;

  if (!apiKey || !secretKey || !accountNumber) {
    throw new Error('Missing FedEx credentials');
  }

  // Get OAuth token
  const tokenResponse = await fetch(`${carrier.api_endpoint}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`,
  });

  if (!tokenResponse.ok) {
    throw new Error('FedEx OAuth failed');
  }

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  const requestBody = {
    labelResponseOptions: 'URL_ONLY',
    requestedShipment: {
      shipper: {
        contact: { personName: request.shipper.name, phoneNumber: request.shipper.phone, companyName: request.shipper.company },
        address: {
          streetLines: [request.shipper.address1],
          city: request.shipper.city,
          stateOrProvinceCode: request.shipper.state,
          postalCode: request.shipper.postal_code,
          countryCode: request.shipper.country,
        },
      },
      recipients: [{
        contact: { personName: request.recipient.name, phoneNumber: request.recipient.phone, companyName: request.recipient.company },
        address: {
          streetLines: [request.recipient.address1],
          city: request.recipient.city,
          stateOrProvinceCode: request.recipient.state,
          postalCode: request.recipient.postal_code,
          countryCode: request.recipient.country,
        },
      }],
      shipDateStamp: new Date().toISOString().split('T')[0],
      serviceType: request.service_type || 'INTERNATIONAL_PRIORITY',
      packagingType: 'YOUR_PACKAGING',
      pickupType: 'USE_SCHEDULED_PICKUP',
      blockInsightVisibility: false,
      shippingChargesPayment: { paymentType: 'SENDER' },
      labelSpecification: { imageType: 'PDF', labelStockType: 'PAPER_7X4.75' },
      requestedPackageLineItems: [{
        weight: { units: 'KG', value: request.package.weight_kg },
        dimensions: { length: request.package.length_cm, width: request.package.width_cm, height: request.package.height_cm, units: 'CM' },
      }],
    },
    accountNumber: { value: accountNumber },
  };

  const response = await fetch(`${carrier.api_endpoint}/ship/v1/shipments`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`FedEx API Error: ${errorText}`);
  }

  const data = await response.json();
  return {
    tracking_number: data.output.transactionShipments[0]?.masterTrackingNumber,
    label_url: data.output.transactionShipments[0]?.pieceResponses[0]?.packageDocuments[0]?.url,
    label_base64: null,
  };
}

// UPS Label Creation
async function createUPSLabel(carrier: any, credentials: any[], request: LabelRequest) {
  const apiKey = credentials.find(c => c.credential_type === 'api_key')?.credential_value;
  const username = credentials.find(c => c.credential_type === 'username')?.credential_value;
  const password = credentials.find(c => c.credential_type === 'password')?.credential_value;
  const accountNumber = credentials.find(c => c.credential_type === 'account_number')?.credential_value;

  if (!apiKey || !username || !password || !accountNumber) {
    throw new Error('Missing UPS credentials');
  }

  const requestBody = {
    ShipmentRequest: {
      Shipment: {
        Shipper: {
          Name: request.shipper.name,
          AttentionName: request.shipper.name,
          Phone: { Number: request.shipper.phone },
          ShipperNumber: accountNumber,
          Address: {
            AddressLine: [request.shipper.address1],
            City: request.shipper.city,
            StateProvinceCode: request.shipper.state,
            PostalCode: request.shipper.postal_code,
            CountryCode: request.shipper.country,
          },
        },
        ShipTo: {
          Name: request.recipient.name,
          AttentionName: request.recipient.name,
          Phone: { Number: request.recipient.phone },
          Address: {
            AddressLine: [request.recipient.address1],
            City: request.recipient.city,
            StateProvinceCode: request.recipient.state,
            PostalCode: request.recipient.postal_code,
            CountryCode: request.recipient.country,
          },
        },
        Service: { Code: request.service_type || '08' },
        Package: {
          Packaging: { Code: '02' },
          PackageWeight: { UnitOfMeasurement: { Code: 'KGS' }, Weight: String(request.package.weight_kg) },
          Dimensions: { UnitOfMeasurement: { Code: 'CM' }, Length: String(request.package.length_cm), Width: String(request.package.width_cm), Height: String(request.package.height_cm) },
        },
        PaymentInformation: { ShipmentCharge: { Type: '01', BillShipper: { AccountNumber: accountNumber } } },
      },
      LabelSpecification: { LabelImageFormat: { Code: 'PDF' } },
    },
  };

  const response = await fetch(`${carrier.api_endpoint}/api/shipments/v1/ship`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${username}:${password}`)}`,
      'Content-Type': 'application/json',
      'transId': crypto.randomUUID(),
      'transactionSrc': 'testing',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`UPS API Error: ${errorText}`);
  }

  const data = await response.json();
  return {
    tracking_number: data.ShipmentResponse.ShipmentResults.ShipmentIdentificationNumber,
    label_base64: data.ShipmentResponse.ShipmentResults.PackageResults.ShippingLabel.GraphicImage,
    label_url: null,
  };
}

// USPS Label Creation
async function createUSPSLabel(carrier: any, credentials: any[], request: LabelRequest) {
  const userId = credentials.find(c => c.credential_type === 'user_id')?.credential_value;

  if (!userId) {
    throw new Error('Missing USPS credentials');
  }

  const poundsOunces = request.package.weight_kg * 2.20462;
  const pounds = Math.floor(poundsOunces);
  const ounces = Math.round((poundsOunces % 1) * 16);

  const xmlRequest = `
    <eVSRequest USERID="${userId}">
      <Option></Option>
      <Revision>2</Revision>
      <ImageParameters></ImageParameters>
      <FromName>${request.shipper.name}</FromName>
      <FromFirm>${request.shipper.company || ''}</FromFirm>
      <FromAddress1>${request.shipper.address2 || ''}</FromAddress1>
      <FromAddress2>${request.shipper.address1}</FromAddress2>
      <FromCity>${request.shipper.city}</FromCity>
      <FromState>${request.shipper.state}</FromState>
      <FromZip5>${request.shipper.postal_code}</FromZip5>
      <FromPhone>${request.shipper.phone}</FromPhone>
      <ToName>${request.recipient.name}</ToName>
      <ToFirm>${request.recipient.company || ''}</ToFirm>
      <ToAddress1>${request.recipient.address2 || ''}</ToAddress1>
      <ToAddress2>${request.recipient.address1}</ToAddress2>
      <ToCity>${request.recipient.city}</ToCity>
      <ToProvince>${request.recipient.state}</ToProvince>
      <ToCountry>${request.recipient.country}</ToCountry>
      <ToPostalCode>${request.recipient.postal_code}</ToPostalCode>
      <ToPOBoxFlag>N</ToPOBoxFlag>
      <ToPhone>${request.recipient.phone}</ToPhone>
      <WeightInPounds>${pounds}</WeightInPounds>
      <WeightInOunces>${ounces}</WeightInOunces>
      <ServiceType>Priority Mail International</ServiceType>
      <Container>RECTANGULAR</Container>
      <Width>${request.package.width_cm / 2.54}</Width>
      <Length>${request.package.length_cm / 2.54}</Length>
      <Height>${request.package.height_cm / 2.54}</Height>
      <Girth></Girth>
      <InsuredAmount>${request.package.value || 0}</InsuredAmount>
    </eVSRequest>
  `;

  const response = await fetch(
    `${carrier.api_endpoint}/ShippingAPI.dll?API=eVS&XML=${encodeURIComponent(xmlRequest)}`
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`USPS API Error: ${errorText}`);
  }

  const xmlText = await response.text();
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

  const trackingNumber = xmlDoc.getElementsByTagName('BarcodeNumber')[0]?.textContent;
  const labelImage = xmlDoc.getElementsByTagName('LabelImage')[0]?.textContent;

  if (!trackingNumber || !labelImage) {
    throw new Error('USPS API did not return label data');
  }

  return {
    tracking_number: trackingNumber,
    label_base64: labelImage,
    label_url: null,
  };
}