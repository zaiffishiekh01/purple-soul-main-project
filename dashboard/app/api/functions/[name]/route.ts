import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { query } from '@/src/lib/server/db';
import { hashPassword } from '@/src/lib/server/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const resolved = await params;
  const isStripeWebhook = resolved.name === 'stripe-webhook';
  const body = isStripeWebhook ? ({} as Record<string, any>) : ((await request.json().catch(() => ({}))) as Record<string, any>);

  if (resolved.name === 'create-payment-intent') {
    try {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeKey) return NextResponse.json({ error: 'Stripe secret key not configured' }, { status: 500 });
      const stripe = new Stripe(stripeKey);
      const amount = Number(body.amount ?? 0);
      const orderId = body.orderId;
      if (!amount || !orderId) {
        return NextResponse.json({ error: 'amount and orderId are required' }, { status: 400 });
      }
      const orderRes = await query<{ vendor_id: string }>('SELECT vendor_id FROM orders WHERE id = $1 LIMIT 1', [orderId]);
      const vendorId = body.vendorId ?? orderRes.rows[0]?.vendor_id;
      if (!vendorId) return NextResponse.json({ error: 'Vendor not found for order' }, { status: 400 });

      const vendorRes = await query<{ stripe_account_id: string | null; stripe_charges_enabled: boolean | null }>(
        'SELECT stripe_account_id, stripe_charges_enabled FROM vendors WHERE id = $1 LIMIT 1',
        [vendorId],
      );
      const vendor = vendorRes.rows[0];
      if (!vendor?.stripe_account_id || !vendor.stripe_charges_enabled) {
        return NextResponse.json({ error: 'Vendor has not completed Stripe Connect onboarding' }, { status: 400 });
      }

      const platformFee = Number(body.platformFee ?? amount * 0.1);
      const appFeeAmount = Math.round(platformFee * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: String(body.currency ?? 'usd'),
        application_fee_amount: appFeeAmount,
        transfer_data: { destination: vendor.stripe_account_id },
        metadata: { orderId, vendorId },
        receipt_email: body.customerEmail,
        automatic_payment_methods: { enabled: true },
      });

      await query(
        `INSERT INTO stripe_payment_intents
         (order_id, vendor_id, customer_id, stripe_payment_intent_id, amount, platform_fee, vendor_amount, currency, status, metadata)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          orderId,
          vendorId,
          body.customerId ?? null,
          paymentIntent.id,
          amount,
          appFeeAmount / 100,
          amount - appFeeAmount / 100,
          String(body.currency ?? 'usd'),
          paymentIntent.status,
          paymentIntent.metadata,
        ],
      );
      await query('UPDATE orders SET stripe_payment_intent_id = $1, stripe_payment_status = $2 WHERE id = $3', [
        paymentIntent.id,
        paymentIntent.status,
        orderId,
      ]);

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        platformFee: appFeeAmount / 100,
        vendorAmount: amount - appFeeAmount / 100,
      });
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create payment intent' }, { status: 500 });
    }
  }

  if (resolved.name === 'calculate-shipping-rates') {
    const fromZip = String(body.fromZip ?? '');
    const toZip = String(body.toZip ?? '');
    const weight = Number(body.weight ?? 0);
    const length = Number(body.length ?? 12);
    const width = Number(body.width ?? 10);
    const height = Number(body.height ?? 8);
    if (!fromZip || !toZip || !weight) {
      return NextResponse.json({ error: 'Missing required fields: fromZip, toZip, weight' }, { status: 400 });
    }
    const from = parseInt(fromZip.slice(0, 3), 10);
    const to = parseInt(toZip.slice(0, 3), 10);
    const distance = Math.abs((Number.isNaN(from) ? 100 : from) - (Number.isNaN(to) ? 100 : to)) * 10;
    const volumeWeight = (length * width * height) / 166;
    const chargeableWeight = Math.max(weight, volumeWeight);
    const calc = (multiplier: number) => Math.round((5.99 + chargeableWeight * 0.5 + (distance / 100) * 0.8) * multiplier * 100) / 100;
    return NextResponse.json({
      rates: [
        { carrier: 'USPS', service: 'Priority Mail', rate: calc(0.5), estimatedDays: distance < 500 ? '2-3' : '3-5', description: 'Affordable and reliable' },
        { carrier: 'UPS', service: 'UPS Ground', rate: calc(0.6), estimatedDays: distance < 300 ? '1-3' : '3-5', description: 'Economical ground shipping' },
        { carrier: 'FedEx', service: 'FedEx Ground', rate: calc(0.55), estimatedDays: distance < 300 ? '1-3' : '3-5', description: 'Economical ground shipping' },
      ],
      chargeableWeight,
      distance,
    });
  }

  if (resolved.name === 'generate-shipping-label') {
    try {
      const orderId = body.orderId;
      if (!orderId) return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
      const result = await query<{
        id: string;
        vendor_id: string;
        order_number: string;
        customer_name: string;
        shipping_address: any;
        business_name: string;
        address: string | null;
        city: string | null;
        state: string | null;
        postal_code: string | null;
        country: string | null;
      }>(
        `SELECT o.id, o.vendor_id, o.order_number, o.customer_name, o.shipping_address,
                v.business_name, v.address, v.city, v.state, v.postal_code, v.country
         FROM orders o
         JOIN vendors v ON v.id = o.vendor_id
         WHERE o.id = $1 LIMIT 1`,
        [orderId],
      );
      const order = result.rows[0];
      if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      const carrier = String(body.carrier ?? 'Standard');
      const serviceType = String(body.serviceType ?? 'Ground');
      const trackingNumber = `${carrier.slice(0, 3).toUpperCase()}${Date.now()}`;
      await query(
        `INSERT INTO shipments (vendor_id, order_id, tracking_number, carrier, shipping_method, status, estimated_delivery)
         VALUES ($1,$2,$3,$4,$5,'pending', now() + interval '7 days')`,
        [order.vendor_id, order.id, trackingNumber, carrier, serviceType],
      );
      const html = `<html><body><h1>${carrier} Label</h1><p>Order ${order.order_number}</p><p>Tracking: ${trackingNumber}</p></body></html>`;
      return NextResponse.json({ html, trackingNumber, success: true });
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to generate label' }, { status: 500 });
    }
  }

  if (resolved.name === 'generate-invoice-pdf') {
    try {
      const orderId = body.orderId;
      if (!orderId) return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
      const result = await query<{ order_number: string; created_at: string; customer_name: string; customer_email: string; total_amount: number; payment_status: string }>(
        'SELECT order_number, created_at, customer_name, customer_email, total_amount, payment_status FROM orders WHERE id = $1 LIMIT 1',
        [orderId],
      );
      const order = result.rows[0];
      if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      const html = `<html><body><h1>Invoice ${order.order_number}</h1><p>${order.customer_name}</p><p>Total: $${Number(order.total_amount).toFixed(2)}</p></body></html>`;
      return new NextResponse(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html', 'Content-Disposition': `inline; filename="invoice-${order.order_number}.html"` },
      });
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to generate invoice' }, { status: 500 });
    }
  }

  if (resolved.name === 'process-refund') {
    try {
      const returnId = body.returnId;
      const refundAmount = Number(body.refundAmount ?? 0);
      const refundMethod = String(body.refundMethod ?? 'manual');
      if (!returnId || !refundAmount) {
        return NextResponse.json({ error: 'Return ID and refund amount are required' }, { status: 400 });
      }
      const ret = await query<{ id: string; vendor_id: string; order_id: string; return_number: string; reason: string; status: string; notes: string | null }>(
        'SELECT id, vendor_id, order_id, return_number, reason, status, notes FROM returns WHERE id = $1 LIMIT 1',
        [returnId],
      );
      const returnData = ret.rows[0];
      if (!returnData) return NextResponse.json({ error: 'Return not found' }, { status: 404 });
      if (returnData.status !== 'received') {
        return NextResponse.json({ error: "Return must be in 'received' status to process refund" }, { status: 400 });
      }
      await query(
        `UPDATE returns
         SET status='completed', refund_method=$1, return_amount=$2, refunded_at=now(), processed_at=now(), notes=coalesce($3, notes)
         WHERE id=$4`,
        [refundMethod, refundAmount, body.notes ?? null, returnId],
      );
      await query(
        `INSERT INTO transactions (vendor_id, order_id, type, amount, status, description, metadata)
         VALUES ($1,$2,'refund',$3,'completed',$4,$5)`,
        [returnData.vendor_id, returnData.order_id, -refundAmount, `Refund for return ${returnData.return_number}`, { return_id: returnId, refund_method: refundMethod }],
      );
      return NextResponse.json({ success: true, refund_status: 'completed', message: 'Refund processed successfully' });
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to process refund' }, { status: 500 });
    }
  }

  if (resolved.name === 'get-shipping-rates') {
    return NextResponse.json({ success: true, rates: [{ service_type: 'Standard', amount: 9.99, currency: 'USD', estimated_days: 3, service_level: 'standard' }] });
  }

  if (resolved.name === 'create-shipping-label') {
    try {
      const shipmentId = body.shipment_id;
      const carrierCode = String(body.carrier_code ?? 'manual');
      if (!shipmentId) return NextResponse.json({ error: 'shipment_id is required' }, { status: 400 });
      const tracking = `${carrierCode.toUpperCase()}-${Date.now()}`;
      await query(
        `UPDATE shipments SET tracking_number=$1, carrier=$2, status='in_transit', shipped_at=now() WHERE id=$3`,
        [tracking, carrierCode, shipmentId],
      );
      await query(
        `INSERT INTO shipping_labels (shipment_id, carrier, tracking_number, label_format, label_data, service_type)
         VALUES ($1,$2,$3,'PDF',$4,$5)`,
        [shipmentId, carrierCode, tracking, null, String(body.service_type ?? 'standard')],
      );
      return NextResponse.json({ success: true, tracking_number: tracking, label_url: null, label_base64: null });
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create shipping label' }, { status: 500 });
    }
  }

  if (resolved.name === 'send-email') {
    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      if (!resendApiKey) return NextResponse.json({ error: 'Resend API key not configured' }, { status: 500 });
      const to = String(body.to ?? '');
      const subject = String(body.subject ?? '');
      const html = String(body.html ?? '');
      if (!to || !subject || !html) return NextResponse.json({ error: 'Missing required fields: to, subject, html' }, { status: 400 });
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendApiKey}` },
        body: JSON.stringify({ from: body.from ?? 'noreply@yourdomain.com', to: [to], subject, html }),
      });
      if (!response.ok) {
        const errText = await response.text();
        return NextResponse.json({ error: `Resend API error: ${errText}` }, { status: 500 });
      }
      const data = await response.json();
      return NextResponse.json({ success: true, messageId: data.id });
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to send email' }, { status: 500 });
    }
  }

  if (resolved.name === 'generate-guidelines-pdf') {
    try {
      const result = await query<{ title: string; content: string }>(
        'SELECT title, content FROM product_guidelines WHERE is_active = true ORDER BY section_order',
      );
      const html = `<html><body><h1>Product Upload Guidelines</h1>${result.rows
        .map((g, i) => `<h2>${i + 1}. ${g.title}</h2><div>${g.content.replace(/\n/g, '<br/>')}</div>`)
        .join('')}</body></html>`;
      return new NextResponse(html, { status: 200, headers: { 'Content-Type': 'text/html' } });
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to generate guidelines' }, { status: 500 });
    }
  }

  if (resolved.name === 'create-stripe-connect-account') {
    try {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeKey) return NextResponse.json({ error: 'Stripe secret key not configured' }, { status: 500 });
      const stripe = new Stripe(stripeKey);
      const vendorId = body.vendorId;
      const businessName = String(body.businessName ?? '');
      const email = String(body.email ?? '');
      const country = String(body.country ?? 'US');
      if (!vendorId || !businessName || !email) {
        return NextResponse.json({ error: 'vendorId, businessName, and email are required' }, { status: 400 });
      }
      const vendorRes = await query<{ stripe_account_id: string | null }>('SELECT stripe_account_id FROM vendors WHERE id = $1 LIMIT 1', [vendorId]);
      let accountId = vendorRes.rows[0]?.stripe_account_id ?? null;
      if (!accountId) {
        const account = await stripe.accounts.create({
          type: 'express',
          country,
          email,
          capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
          business_type: 'company',
          company: { name: businessName },
          metadata: { vendorId: String(vendorId) },
        });
        accountId = account.id;
        await query(
          `UPDATE vendors
           SET stripe_account_id = $1, stripe_account_status='pending', stripe_account_type='express'
           WHERE id = $2`,
          [accountId, vendorId],
        );
      }
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: String(body.refreshUrl ?? `${request.nextUrl.origin}/vendor/profile?stripe_refresh=true`),
        return_url: String(body.returnUrl ?? `${request.nextUrl.origin}/vendor/profile?stripe_connected=true`),
        type: 'account_onboarding',
      });
      return NextResponse.json({ accountId, onboardingUrl: accountLink.url });
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create Stripe Connect account' }, { status: 500 });
    }
  }

  if (resolved.name === 'create-automatic-payout') {
    try {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeKey) return NextResponse.json({ error: 'Stripe secret key not configured' }, { status: 500 });
      const stripe = new Stripe(stripeKey);
      const payoutRequestId = body.payoutRequestId;
      const vendorId = body.vendorId;
      const amount = Number(body.amount ?? 0);
      if (!payoutRequestId || !vendorId || !amount) {
        return NextResponse.json({ error: 'payoutRequestId, vendorId, and amount are required' }, { status: 400 });
      }
      const vendorRes = await query<{ stripe_account_id: string | null; stripe_payouts_enabled: boolean | null; business_name: string | null }>(
        'SELECT stripe_account_id, stripe_payouts_enabled, business_name FROM vendors WHERE id = $1 LIMIT 1',
        [vendorId],
      );
      const vendor = vendorRes.rows[0];
      if (!vendor?.stripe_account_id) return NextResponse.json({ error: 'Vendor has not connected a Stripe account' }, { status: 400 });
      if (!vendor.stripe_payouts_enabled) return NextResponse.json({ error: "Vendor's Stripe account does not have payouts enabled" }, { status: 400 });
      const transfer = await stripe.transfers.create({
        amount: Math.round(amount * 100),
        currency: String(body.currency ?? 'usd'),
        destination: vendor.stripe_account_id,
        description: `Payout to ${vendor.business_name ?? 'vendor'}`,
        metadata: { payoutRequestId: String(payoutRequestId), vendorId: String(vendorId) },
      });
      await query(
        `UPDATE payout_requests
         SET status='completed', stripe_transfer_id=$1, transfer_completed_date=now(), auto_payout_enabled=true
         WHERE id=$2`,
        [transfer.id, payoutRequestId],
      );
      await query(
        `INSERT INTO transactions (vendor_id, type, amount, status, description, reference_id)
         VALUES ($1,'payout',$2,'completed',$3,$4)`,
        [vendorId, amount, `Automatic payout via Stripe - Transfer ID: ${transfer.id}`, `PAYOUT-${Date.now()}`],
      );
      await query(
        `INSERT INTO notifications (vendor_id, type, title, message, is_read)
         VALUES ($1,'payment',$2,$3,false)`,
        [vendorId, 'Automatic Payout Completed', `Your payout of $${amount.toFixed(2)} has been automatically transferred to your Stripe account. Transfer ID: ${transfer.id}`],
      );
      return NextResponse.json({ success: true, transferId: transfer.id, amount, status: 'completed' });
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create automatic payout' }, { status: 500 });
    }
  }

  if (resolved.name === 'create-admin') {
    try {
      const email = String(body.email ?? '').toLowerCase();
      const password = String(body.password ?? '');
      const roleName = String(body.roleName ?? 'admin');
      const permissions = (body.permissions ?? {}) as Record<string, boolean>;
      if (!email || !password || !roleName) {
        return NextResponse.json({ error: 'Missing required fields: email, password, roleName' }, { status: 400 });
      }
      const existing = await query<{ id: string }>('SELECT id FROM auth.users WHERE email = $1 LIMIT 1', [email]);
      if (existing.rows[0]) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
      }
      const userRes = await query<{ id: string }>(
        `INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
         VALUES ($1, $2, now()) RETURNING id`,
        [email, hashPassword(password)],
      );
      const userId = userRes.rows[0].id;
      const adminRes = await query<{ id: string; user_id: string; role: string }>(
        `INSERT INTO admin_users (user_id, email, is_super_admin, role, permissions)
         VALUES ($1,$2,$3,$4,$5)
         RETURNING id, user_id, role`,
        [
          userId,
          email,
          roleName === 'super_admin',
          roleName,
          {
            vendor_management: !!permissions.vendor_management,
            order_management: !!permissions.order_management,
            product_management: !!permissions.product_management,
            finance_management: !!permissions.finance_management,
            analytics_monitoring: !!permissions.analytics_monitoring,
          },
        ],
      );
      return NextResponse.json({ success: true, admin: { ...adminRes.rows[0], email } });
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create admin' }, { status: 500 });
    }
  }

  if (resolved.name === 'create-vendor') {
    try {
      const email = String(body.email ?? '').toLowerCase();
      const password = String(body.password ?? '');
      const businessName = String(body.businessName ?? '');
      if (!email || !password || !businessName) {
        return NextResponse.json({ error: 'Missing required fields: email, password, businessName' }, { status: 400 });
      }
      const existing = await query<{ id: string }>('SELECT id FROM auth.users WHERE email = $1 LIMIT 1', [email]);
      if (existing.rows[0]) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
      }
      const userRes = await query<{ id: string }>(
        `INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
         VALUES ($1, $2, now()) RETURNING id`,
        [email, hashPassword(password)],
      );
      const userId = userRes.rows[0].id;
      const vendorRes = await query<{ id: string; user_id: string; business_name: string; status: string }>(
        `INSERT INTO vendors (user_id, business_name, business_type, contact_email, contact_phone, address, tax_id, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING id, user_id, business_name, status`,
        [
          userId,
          businessName,
          String(body.businessType ?? 'E-commerce'),
          email,
          String(body.contactPhone ?? '+1-555-0100'),
          body.address ?? {
            street: '123 Business St',
            city: 'New York',
            state: 'NY',
            zip: '10001',
            country: 'United States',
          },
          String(body.taxId ?? 'TAX-DEFAULT'),
          String(body.status ?? 'pending'),
        ],
      );
      return NextResponse.json({ success: true, vendor: { ...vendorRes.rows[0], email } });
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create vendor' }, { status: 500 });
    }
  }

  if (resolved.name === 'inventory-alert-checker') {
    try {
      const threshold = Number(body.threshold ?? 10);
      const lowStock = await query<{ id: string; vendor_id: string; product_name: string; quantity: number }>(
        'SELECT id, vendor_id, product_name, quantity FROM inventory WHERE quantity <= $1',
        [threshold],
      );
      if (lowStock.rows.length) {
        await query(
          `INSERT INTO notifications (vendor_id, type, title, message, priority, is_read)
           SELECT vendor_id, 'inventory_alert', 'Low Stock Alert',
                  product_name || ' is running low (' || quantity || ' units remaining)',
                  CASE WHEN quantity = 0 THEN 'high' ELSE 'medium' END,
                  false
           FROM inventory
           WHERE quantity <= $1`,
          [threshold],
        );
      }
      return NextResponse.json({
        success: true,
        lowStockCount: lowStock.rows.length,
        alertsSent: lowStock.rows.length,
        vendors: new Set(lowStock.rows.map((r) => r.vendor_id)).size,
      });
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to check inventory' }, { status: 500 });
    }
  }

  if (resolved.name === 'get-catalog-navigation') {
    const categories = await query(
      `SELECT * FROM categories WHERE is_active = true AND show_in_navigation = true ORDER BY level ASC, display_order ASC`,
    );
    const featured = (categories.rows as any[]).filter((c) => c.is_featured);
    const links = await query(`SELECT * FROM navigation_links WHERE is_active = true ORDER BY display_order ASC`);
    return NextResponse.json({ success: true, data: { navigation: categories.rows, featured, static_links: links.rows } });
  }

  if (resolved.name === 'get-catalog-taxonomy') {
    const categories = await query(`SELECT * FROM categories WHERE is_active = true ORDER BY level ASC, display_order ASC`);
    return NextResponse.json({ success: true, data: { categories: categories.rows, tree: categories.rows } });
  }

  if (resolved.name === 'get-catalog-facets') {
    const groups = await query(`SELECT * FROM facet_groups WHERE is_active = true ORDER BY display_order ASC`);
    const facets = await query(`SELECT * FROM facets WHERE is_active = true ORDER BY display_order ASC`);
    const values = await query(`SELECT * FROM facet_values ORDER BY facet_id ASC, display_order ASC`);
    const mappings = await query(`SELECT category_id, facet_id, is_required, display_order FROM category_facets ORDER BY category_id ASC, display_order ASC`);
    return NextResponse.json({
      success: true,
      data: {
        facet_groups: groups.rows,
        all_facets: facets.rows,
        facet_values: values.rows,
        category_mappings: mappings.rows,
      },
    });
  }

  if (resolved.name === 'download-digital-product') {
    try {
      const licenseKey = String(body.license_key ?? body.licenseKey ?? '');
      if (!licenseKey) return NextResponse.json({ error: 'License key is required' }, { status: 400 });
      const licenseRes = await query<{
        id: string;
        download_count: number;
        download_limit: number;
        expires_at: string | null;
        is_active: boolean;
        file_path: string;
        file_name: string;
      }>(
        `SELECT pl.id, pl.download_count, pl.download_limit, pl.expires_at, pl.is_active, dpf.file_path, dpf.file_name
         FROM product_licenses pl
         JOIN digital_product_files dpf ON dpf.id = pl.digital_product_file_id
         WHERE pl.license_key = $1 LIMIT 1`,
        [licenseKey],
      );
      const license = licenseRes.rows[0];
      if (!license) return NextResponse.json({ error: 'Invalid license key' }, { status: 404 });
      if (!license.is_active) return NextResponse.json({ error: 'License is inactive' }, { status: 403 });
      if (license.expires_at && new Date(license.expires_at) < new Date()) {
        return NextResponse.json({ error: 'License has expired' }, { status: 403 });
      }
      if (license.download_count >= license.download_limit) {
        return NextResponse.json({ error: `Download limit reached (${license.download_limit})` }, { status: 403 });
      }
      await query(
        `UPDATE product_licenses SET download_count = download_count + 1, last_downloaded_at = now() WHERE id = $1`,
        [license.id],
      );
      const signedUrl = `${request.nextUrl.origin}/api/storage/file/digital-products/${license.file_path
        .split('/')
        .map(encodeURIComponent)
        .join('/')}`;
      return NextResponse.json({
        success: true,
        download_url: signedUrl,
        file_name: license.file_name,
        downloads_remaining: license.download_limit - (license.download_count + 1),
        expires_at: license.expires_at,
      });
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to process download' }, { status: 500 });
    }
  }

  if (resolved.name === 'stripe-webhook') {
    try {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!stripeKey || !webhookSecret) {
        return NextResponse.json({ error: 'Missing Stripe webhook configuration' }, { status: 500 });
      }
      const signature = request.headers.get('stripe-signature');
      if (!signature) return NextResponse.json({ error: 'No signature' }, { status: 400 });
      const stripe = new Stripe(stripeKey);
      const rawBody = await request.text();
      const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      if (event.type === 'payment_intent.succeeded') {
        const pi = event.data.object as Stripe.PaymentIntent;
        const orderId = pi.metadata.orderId;
        const vendorId = pi.metadata.vendorId;
        if (orderId) {
          await query(`UPDATE orders SET payment_status='paid', status='processing', stripe_payment_status='succeeded' WHERE id = $1`, [orderId]);
          await query(`UPDATE stripe_payment_intents SET status='succeeded', transfer_status='pending' WHERE stripe_payment_intent_id = $1`, [pi.id]);
          if (vendorId) {
            await query(
              `INSERT INTO transactions (vendor_id, order_id, type, amount, status, payment_method, reference_id)
               VALUES ($1,$2,'sale',$3,'completed','stripe',$4)`,
              [vendorId, orderId, pi.amount / 100, pi.id],
            );
          }
        }
      }
      return NextResponse.json({ received: true });
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Webhook handler failed' }, { status: 400 });
    }
  }

  if (resolved.name === 'delete-admin-user') {
    if (!body.userId) {
      return NextResponse.json({ data: null, error: { message: 'userId is required' } }, { status: 400 });
    }

    await query('DELETE FROM auth.users WHERE id = $1', [body.userId]);
    return NextResponse.json({ data: { success: true }, error: null });
  }

  return NextResponse.json(
    { data: null, error: { message: `Function ${resolved.name} is not implemented yet` } },
    { status: 501 },
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const resolved = await params;
  if (resolved.name === 'download-digital-product') {
    const licenseKey = request.nextUrl.searchParams.get('license_key');
    if (!licenseKey) return NextResponse.json({ error: 'License key is required' }, { status: 400 });
    const proxyRequest = new NextRequest(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify({ license_key: licenseKey }),
    });
    return POST(proxyRequest, { params: Promise.resolve(resolved) });
  }
  return NextResponse.json({ error: `GET not implemented for ${resolved.name}` }, { status: 405 });
}

