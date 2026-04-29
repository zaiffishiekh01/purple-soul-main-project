export function downloadCSV(data: any[], filename: string) {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportOrders(orders: any[]) {
  const exportData = orders.map((order) => ({
    order_number: order.order_number,
    customer_name: order.customer_name,
    customer_email: order.customer_email,
    status: order.status,
    total_amount: order.total_amount,
    created_at: new Date(order.created_at).toLocaleString(),
    shipping_address: `${order.shipping_address?.street}, ${order.shipping_address?.city}, ${order.shipping_address?.state} ${order.shipping_address?.postal_code}`,
  }));

  downloadCSV(exportData, 'orders');
}

export function exportProducts(products: any[]) {
  const exportData = products.map((product) => {
    const images: string[] = Array.isArray(product.images) ? product.images : [];
    const tags: string[] = Array.isArray(product.tags) ? product.tags : [];

    return {
      id: product.id || '',
      vendor_id: product.vendor_id || '',
      name: product.name || '',
      sku: product.sku || '',
      description: product.description || '',
      category: product.category || '',
      material: product.material || '',
      color: product.color || '',
      size_dimensions: product.size_dimensions || '',
      care_instructions: product.care_instructions || '',
      shipping_timeline: product.shipping_timeline || '',
      price: product.price ?? '',
      cost: product.cost ?? '',
      base_price: product.base_price ?? '',
      markup_amount: product.markup_amount ?? '',
      markup_type: product.markup_type || '',
      discount_amount: product.discount_amount ?? '',
      discount_type: product.discount_type || '',
      final_price: product.final_price ?? '',
      final_marketplace_price: product.final_marketplace_price ?? '',
      commission_percentage: product.commission_percentage ?? '',
      commission_amount: product.commission_amount ?? '',
      stock_quantity: product.stock_quantity ?? '',
      status: product.status || '',
      approval_status: product.approval_status || '',
      deactivation_reason: product.deactivation_reason || '',
      rejection_reason: product.rejection_reason || '',
      is_digital: product.is_digital ?? false,
      tags: tags.join('|'),
      image_url_1: images[0] || '',
      image_url_2: images[1] || '',
      image_url_3: images[2] || '',
      image_url_4: images[3] || '',
      image_url_5: images[4] || '',
      all_image_urls: images.join('|'),
      approved_at: product.approved_at ? new Date(product.approved_at).toLocaleString() : '',
      created_at: product.created_at ? new Date(product.created_at).toLocaleString() : '',
      updated_at: product.updated_at ? new Date(product.updated_at).toLocaleString() : '',
    };
  });

  downloadCSV(exportData, 'products');
}

export function exportTransactions(transactions: any[]) {
  const exportData = transactions.map((transaction) => ({
    order_number: transaction.order_number,
    type: transaction.type,
    amount: transaction.amount,
    status: transaction.status,
    payment_method: transaction.payment_method,
    created_at: new Date(transaction.created_at).toLocaleString(),
  }));

  downloadCSV(exportData, 'transactions');
}

export function exportReturns(returns: any[]) {
  const exportData = returns.map((returnItem) => ({
    return_number: returnItem.return_number,
    order_number: returnItem.order_number,
    reason: returnItem.reason,
    status: returnItem.status,
    refund_amount: returnItem.refund_amount,
    created_at: new Date(returnItem.created_at).toLocaleString(),
  }));

  downloadCSV(exportData, 'returns');
}

export function exportInventory(inventory: any[]) {
  const exportData = inventory.map((item) => ({
    product_name: item.product_name,
    sku: item.sku,
    quantity: item.quantity,
    reserved_quantity: item.reserved_quantity,
    available: item.quantity - item.reserved_quantity,
    low_stock_threshold: item.low_stock_threshold,
    warehouse_location: item.warehouse_location || 'N/A',
    last_restocked_at: item.last_restocked_at
      ? new Date(item.last_restocked_at).toLocaleString()
      : 'Never',
  }));

  downloadCSV(exportData, 'inventory');
}
