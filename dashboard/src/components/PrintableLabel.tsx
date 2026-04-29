import { Package, MapPin, User, Truck, Box } from 'lucide-react';
import { ShippingLabel } from '../hooks/useShippingLabels';

interface PrintableLabelProps {
  label: ShippingLabel;
}

export function PrintableLabel({ label }: PrintableLabelProps) {
  return (
    <div className="print-label hidden print:block">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-label, .print-label * {
            visibility: visible;
          }
          .print-label {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: block !important;
          }
          @page {
            size: 4in 6in;
            margin: 0.25in;
          }
        }
      `}</style>

      <div className="w-full h-full bg-white p-4 text-black" style={{ fontSize: '10px' }}>
        <div className="border-4 border-black p-3">
          <div className="border-b-2 border-black pb-3 mb-3">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="text-xl font-black mb-1">{label.courier_partner || 'COURIER'}</div>
                <div className="text-xs font-bold uppercase">{label.shipping_method} Shipping</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold">DATE</div>
                <div className="text-xs">{new Date(label.order_date).toLocaleDateString()}</div>
              </div>
            </div>
            <div className="bg-gray-900 text-white px-2 py-1 text-center">
              <div className="text-sm font-black">SUFI SCIENCE CENTER USA</div>
              <div className="text-xs">Official Marketplace Shipping Label</div>
            </div>
          </div>

          <div className="border-4 border-black p-2 mb-3 text-center">
            <div className="text-xs font-semibold mb-1">TRACKING NUMBER</div>
            <div className="text-lg font-black font-mono mb-1 break-all px-1 leading-tight" style={{ wordBreak: 'break-all', overflowWrap: 'break-word' }}>
              {label.tracking_number}
            </div>
            <div className="h-12 bg-white border border-black flex items-center justify-center">
              <div className="font-mono text-xs">||||| ||||| ||||| |||||</div>
            </div>
            <div className="text-xs font-bold mt-1 break-all" style={{ wordBreak: 'break-all', overflowWrap: 'break-word' }}>
              AWB: {label.awb_number}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="border-2 border-black p-2">
              <div className="text-xs font-black mb-2 bg-black text-white px-1 inline-block">FROM</div>
              <div className="text-xs">
                <div className="font-bold">{label.vendor_name}</div>
                <div className="font-semibold">{label.pickup_name}</div>
                <div className="mt-1">{label.pickup_address}</div>
                <div>{label.pickup_city}, {label.pickup_state}</div>
                <div className="font-bold">{label.pickup_pincode}</div>
                <div>{label.pickup_country}</div>
                <div className="mt-1 font-semibold">Ph: {label.pickup_phone}</div>
              </div>
            </div>

            <div className="border-4 border-black p-2 bg-yellow-50">
              <div className="text-xs font-black mb-2 bg-black text-white px-1 inline-block">TO (DELIVER TO)</div>
              <div className="text-xs">
                <div className="font-black text-base">{label.customer_name}</div>
                <div className="mt-1 font-semibold">{label.shipping_address}</div>
                {label.shipping_landmark && <div className="text-xs">Near: {label.shipping_landmark}</div>}
                <div className="font-bold mt-1">{label.shipping_city}, {label.shipping_state}</div>
                <div className="font-black text-lg">{label.shipping_pincode}</div>
                <div className="font-bold">{label.shipping_country}</div>
                {label.customer_phone && <div className="mt-1 font-bold">Ph: {label.customer_phone}</div>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3 text-center border-2 border-black">
            <div className="border-r-2 border-black p-2">
              <div className="text-xs font-bold">WEIGHT</div>
              <div className="text-sm font-black">{label.package_weight} kg</div>
            </div>
            <div className="border-r-2 border-black p-2">
              <div className="text-xs font-bold">PACKAGES</div>
              <div className="text-sm font-black">{label.number_of_packages}</div>
            </div>
            <div className="p-2">
              <div className="text-xs font-bold">TYPE</div>
              <div className="text-sm font-black uppercase">{label.package_type}</div>
            </div>
          </div>

          <div className="border-2 border-black p-2 mb-3">
            <div className="text-xs font-black mb-1 bg-black text-white px-1 inline-block">PRODUCT DETAILS</div>
            <div className="text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-semibold">Product:</span> {label.product_names}
                </div>
                <div>
                  <span className="font-semibold">SKU:</span> {label.sku}
                </div>
                <div>
                  <span className="font-semibold">Quantity:</span> {label.quantity}
                </div>
                <div>
                  <span className="font-semibold">Category:</span> {label.product_category}
                </div>
              </div>
            </div>
          </div>

          {label.hsn_code && (
            <div className="border-2 border-black p-2 mb-3">
              <div className="text-xs font-black mb-1 bg-black text-white px-1 inline-block">CUSTOMS INFO</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div><span className="font-semibold">HSN:</span> {label.hsn_code}</div>
                <div><span className="font-semibold">Value:</span> ${label.customs_value}</div>
                <div><span className="font-semibold">Type:</span> {label.customs_category}</div>
              </div>
              {label.invoice_number && (
                <div className="mt-1 text-xs">
                  <span className="font-semibold">Invoice:</span> {label.invoice_number}
                </div>
              )}
            </div>
          )}

          <div className="border-2 border-black p-2 bg-gray-100">
            <div className="text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-semibold">Dimensions:</span> {label.package_length} × {label.package_width} × {label.package_height} cm
                </div>
                {label.pickup_date && (
                  <div>
                    <span className="font-semibold">Pickup:</span> {new Date(label.pickup_date).toLocaleDateString()} {label.pickup_slot}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t-2 border-dashed border-black text-center">
            <div className="text-xs">
              <span className="font-bold">Handle with care</span>
            </div>
            <div className="text-xs mt-1 font-semibold">
              Order #{label.order_number} • Purple Soul Collective by DKC USA
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
