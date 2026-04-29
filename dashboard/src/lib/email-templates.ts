export interface OrderConfirmationData {
  orderNumber: string;
  customerName: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

export interface ShippingNotificationData {
  orderNumber: string;
  customerName: string;
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
  trackingUrl?: string;
}

export interface SupportTicketData {
  ticketNumber: string;
  customerName: string;
  subject: string;
  message: string;
  priority: string;
}

export const emailTemplates = {
  orderConfirmation: (data: OrderConfirmationData) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .total { font-weight: bold; font-size: 18px; margin-top: 15px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmed!</h1>
          <p>Thank you for your order</p>
        </div>
        <div class="content">
          <p>Hi ${data.customerName},</p>
          <p>We've received your order and are getting it ready for shipment.</p>

          <div class="order-details">
            <h2>Order #${data.orderNumber}</h2>
            <p><strong>Order Date:</strong> ${data.orderDate}</p>

            <h3>Items Ordered</h3>
            ${data.items.map(item => `
              <div class="item">
                <span>${item.name} (x${item.quantity})</span>
                <span>$${item.price.toFixed(2)}</span>
              </div>
            `).join('')}

            <div class="item">
              <span>Subtotal</span>
              <span>$${data.subtotal.toFixed(2)}</span>
            </div>
            <div class="item">
              <span>Shipping</span>
              <span>$${data.shipping.toFixed(2)}</span>
            </div>
            <div class="item total">
              <span>Total</span>
              <span>$${data.total.toFixed(2)}</span>
            </div>

            <h3>Shipping Address</h3>
            <p>
              ${data.shippingAddress.street}<br>
              ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postal_code}<br>
              ${data.shippingAddress.country}
            </p>
          </div>

          <p>You'll receive another email with tracking information once your order ships.</p>

          <div class="footer">
            <p>Questions? Contact our support team</p>
            <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,

  shippingNotification: (data: ShippingNotificationData) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .tracking-box { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .tracking-number { font-size: 24px; font-weight: bold; color: #667eea; margin: 15px 0; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📦 Your Order Has Shipped!</h1>
        </div>
        <div class="content">
          <p>Hi ${data.customerName},</p>
          <p>Great news! Your order #${data.orderNumber} has been shipped and is on its way to you.</p>

          <div class="tracking-box">
            <h3>Tracking Information</h3>
            <p><strong>Carrier:</strong> ${data.carrier}</p>
            <div class="tracking-number">${data.trackingNumber}</div>
            <p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>
            ${data.trackingUrl ? `<a href="${data.trackingUrl}" class="button">Track Your Package</a>` : ''}
          </div>

          <p>We'll notify you once your package is delivered.</p>

          <div class="footer">
            <p>Questions? Contact our support team</p>
            <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,

  supportTicketResponse: (data: SupportTicketData) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .ticket-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .priority { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .priority-high { background: #fee; color: #c00; }
        .priority-medium { background: #fef3cd; color: #856404; }
        .priority-low { background: #d1ecf1; color: #0c5460; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Support Ticket Received</h1>
        </div>
        <div class="content">
          <p>Hi ${data.customerName},</p>
          <p>We've received your support ticket and our team will respond as soon as possible.</p>

          <div class="ticket-box">
            <h3>Ticket #${data.ticketNumber}</h3>
            <p><span class="priority priority-${data.priority.toLowerCase()}">${data.priority.toUpperCase()} PRIORITY</span></p>
            <p><strong>Subject:</strong> ${data.subject}</p>
            <p><strong>Your Message:</strong></p>
            <p>${data.message}</p>
          </div>

          <p>Our average response time is 24 hours for standard inquiries and 4 hours for urgent matters.</p>
          <p>You can reply to this email or check your ticket status in your account dashboard.</p>

          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,

  lowStockAlert: (productName: string, currentStock: number, threshold: number) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .alert-box { background: #fef3cd; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .stock-info { font-size: 24px; font-weight: bold; color: #f59e0b; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Low Stock Alert</h1>
        </div>
        <div class="content">
          <div class="alert-box">
            <h3>${productName}</h3>
            <p><strong>Current Stock:</strong> <span class="stock-info">${currentStock} units</span></p>
            <p><strong>Low Stock Threshold:</strong> ${threshold} units</p>
          </div>
          <p>This product has reached its low stock threshold. Consider restocking soon to avoid stockouts.</p>
        </div>
      </div>
    </body>
    </html>
  `,
};
