import { supabase } from './supabase';
import { NEXT_PUBLIC_SUPABASE_URL } from './env';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from }: SendEmailParams): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      console.error('No active session for sending email');
      return false;
    }

    const apiUrl = `${NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, subject, html, from }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Email sending failed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function sendOrderConfirmationEmail(orderId: string): Promise<boolean> {
  try {
    const { data: order } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          quantity,
          unit_price,
          products (
            name
          )
        )
      `)
      .eq('id', orderId)
      .single();

    if (!order) return false;

    const { emailTemplates } = await import('./email-templates');

    const html = emailTemplates.orderConfirmation({
      orderNumber: order.order_number,
      customerName: order.customer_name,
      orderDate: new Date(order.created_at).toLocaleDateString(),
      items: order.order_items.map((item: any) => ({
        name: item.products.name,
        quantity: item.quantity,
        price: item.unit_price,
      })),
      subtotal: order.total_amount - 10,
      shipping: 10,
      total: order.total_amount,
      shippingAddress: order.shipping_address,
    });

    return await sendEmail({
      to: order.customer_email,
      subject: `Order Confirmation - ${order.order_number}`,
      html,
    });
  } catch (error) {
    console.error('Error sending order confirmation:', error);
    return false;
  }
}

export async function sendShippingNotificationEmail(shipmentId: string): Promise<boolean> {
  try {
    const { data: shipment } = await supabase
      .from('shipments')
      .select(`
        *,
        orders (
          order_number,
          customer_name,
          customer_email
        )
      `)
      .eq('id', shipmentId)
      .single();

    if (!shipment) return false;

    const { emailTemplates } = await import('./email-templates');

    const html = emailTemplates.shippingNotification({
      orderNumber: shipment.orders.order_number,
      customerName: shipment.orders.customer_name,
      trackingNumber: shipment.tracking_number,
      carrier: shipment.carrier,
      estimatedDelivery: new Date(shipment.estimated_delivery).toLocaleDateString(),
      trackingUrl: shipment.tracking_url,
    });

    return await sendEmail({
      to: shipment.orders.customer_email,
      subject: `Your Order Has Shipped - ${shipment.orders.order_number}`,
      html,
    });
  } catch (error) {
    console.error('Error sending shipping notification:', error);
    return false;
  }
}
