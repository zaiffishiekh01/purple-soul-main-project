'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Truck, Sparkles, Package, Copy, MapPin, Clock, CircleCheck as CheckCircle2, Loader as Loader2, CircleAlert as AlertCircle } from 'lucide-react';
import { useAPIAuth as useAuth } from '@/lib/auth/api-context';
import { supabase } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  label_created: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
  in_transit: 'bg-purple-500/20 text-purple-200 border-purple-500/30',
  out_for_delivery: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
  delivered: 'bg-green-500/20 text-green-200 border-green-500/30',
  exception: 'bg-red-500/20 text-red-200 border-red-500/30',
};

export default function OrderTrackingPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState(false);
  const [trackingInput, setTrackingInput] = useState('');
  const [shipments, setShipments] = useState<any[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (user) {
      fetchShipments();
    }
  }, [user]);

  const fetchShipments = async () => {
    try {
      setLoading(true);

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          created_at,
          shipping_tracking_number,
          shipping_carrier,
          shipping_method,
          shipping_address
        `)
        .eq('customer_id', user?.id)
        .in('status', ['shipped', 'in_transit', 'out_for_delivery', 'delivered'])
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const shipmentsWithTracking = (ordersData || []).filter(
        order => order.shipping_tracking_number
      );

      setShipments(shipmentsWithTracking);
    } catch (error) {
      console.error('Error fetching shipments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackOrder = async () => {
    if (!trackingInput.trim()) {
      toast.error('Please enter an order number or tracking number');
      return;
    }

    setTracking(true);
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          created_at,
          shipping_tracking_number,
          shipping_carrier,
          shipping_method,
          shipping_address
        `)
        .eq('customer_id', user?.id)
        .or(`order_number.ilike.%${trackingInput}%,shipping_tracking_number.ilike.%${trackingInput}%`)
        .maybeSingle();

      if (orderError) throw orderError;

      if (!orderData) {
        toast.error('Order not found');
        return;
      }

      setSelectedShipment(orderData);
      toast.success('Order found');
    } catch (error: any) {
      console.error('Error tracking order:', error);
      toast.error(error.message || 'Failed to track order');
    } finally {
      setTracking(false);
    }
  };

  const copyTrackingNumber = (trackingNumber: string) => {
    navigator.clipboard.writeText(trackingNumber);
    toast.success('Tracking number copied');
  };

  const getTrackingTimeline = (status: string) => {
    const stages = [
      { key: 'label_created', label: 'Label Created', completed: true },
      { key: 'in_transit', label: 'In Transit', completed: false },
      { key: 'out_for_delivery', label: 'Out for Delivery', completed: false },
      { key: 'delivered', label: 'Delivered', completed: false },
    ];

    const statusIndex = stages.findIndex(s => s.key === status);
    return stages.map((stage, index) => ({
      ...stage,
      completed: index <= statusIndex,
      current: index === statusIndex,
    }));
  };

  const paginatedShipments = shipments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(shipments.length / itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-card mb-6">
              <Sparkles className="w-4 h-4" style={{ color: '#d4af8a' }} />
              <span className="text-sm font-semibold text-white/90">Track Your Order</span>
            </div>

            <h1 className="hero-text font-serif text-white mb-6 leading-tight">
              Order Tracking
            </h1>

            <p className="text-xl text-white/70 mb-8 leading-relaxed">
              Track shipments and delivery status
            </p>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="ethereal-divider mb-12"></div>

            <div className="space-y-8">
              <Card className="glass-card glass-card-hover">
                <CardHeader>
                  <CardTitle className="text-white text-2xl font-serif">Track an Order</CardTitle>
                  <CardDescription className="text-white/60 text-base mt-2">
                    Enter your order number or tracking number
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Order number or tracking number..."
                        value={trackingInput}
                        onChange={(e) => setTrackingInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleTrackOrder()}
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40 h-12"
                      />
                    </div>
                    <Button
                      onClick={handleTrackOrder}
                      disabled={tracking}
                      className="celestial-button text-white px-8"
                    >
                      {tracking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Truck className="w-4 h-4 mr-2" style={{ color: 'white' }} />}
                      Track
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card glass-card-hover">
                <CardHeader>
                  <CardTitle className="text-white text-2xl font-serif">Recent Shipments</CardTitle>
                  <CardDescription className="text-white/60 text-base mt-2">
                    Your recently shipped orders
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {shipments.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 glass-card">
                        <Package className="w-10 h-10" style={{ color: '#d4af8a' }} />
                      </div>
                      <h3 className="text-2xl font-serif font-semibold mb-4 text-white">
                        No shipments yet
                      </h3>
                      <p className="text-base text-white/60">
                        Your shipped orders will appear here
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {paginatedShipments.map((shipment: any) => (
                          <div
                            key={shipment.id}
                            className="p-4 glass-card rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
                            onClick={() => setSelectedShipment(shipment)}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-white font-semibold">Order #{shipment.order_number}</p>
                                  <Badge className={statusColors[shipment.status] || statusColors.in_transit}>
                                    {shipment.status.replace(/_/g, ' ')}
                                  </Badge>
                                </div>
                                <p className="text-white/60 text-sm">
                                  {shipment.shipping_carrier || 'Standard Shipping'} • {formatDistanceToNow(new Date(shipment.created_at), { addSuffix: true })}
                                </p>
                              </div>
                            </div>

                            {shipment.shipping_tracking_number && (
                              <div className="flex items-center gap-2 mt-2">
                                <code className="text-white/80 text-sm bg-white/5 px-3 py-1.5 rounded">
                                  {shipment.shipping_tracking_number}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyTrackingNumber(shipment.shipping_tracking_number);
                                  }}
                                  className="text-white/70 hover:text-white hover:bg-white/10 h-8"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                          >
                            Previous
                          </Button>
                          <span className="text-white/70 text-sm">
                            Page {currentPage} of {totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                          >
                            Next
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {selectedShipment && (
                <Card className="glass-card glass-card-hover">
                  <CardHeader>
                    <CardTitle className="text-white text-2xl font-serif">Shipment Details</CardTitle>
                    <CardDescription className="text-white/60 text-base mt-2">
                      Order #{selectedShipment.order_number}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="space-y-6">
                      <div className="relative">
                        {getTrackingTimeline(selectedShipment.status).map((stage, index, array) => (
                          <div key={stage.key} className="flex items-start gap-4 relative">
                            {index < array.length - 1 && (
                              <div
                                className={`absolute left-[15px] top-[40px] w-0.5 h-12 ${
                                  stage.completed ? 'bg-green-500/50' : 'bg-white/10'
                                }`}
                              />
                            )}
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                                stage.completed
                                  ? 'bg-green-500/20 border-2 border-green-500'
                                  : 'bg-white/5 border-2 border-white/20'
                              }`}
                            >
                              {stage.completed ? (
                                <CheckCircle2 className="w-4 h-4 text-green-300" />
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-white/30" />
                              )}
                            </div>
                            <div className="flex-1 pb-8">
                              <p className={`font-medium ${stage.current ? 'text-white' : 'text-white/60'}`}>
                                {stage.label}
                              </p>
                              {stage.current && (
                                <p className="text-sm text-white/50 mt-1">
                                  Current status
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-4 glass-card rounded-lg space-y-3">
                        <div className="flex items-center gap-2">
                          <Truck className="w-5 h-5" style={{ color: '#d4af8a' }} />
                          <p className="text-white font-medium">Carrier Information</p>
                        </div>
                        <div className="text-white/70 text-sm space-y-1">
                          <p>Carrier: {selectedShipment.shipping_carrier || 'Standard Shipping'}</p>
                          <p>Method: {selectedShipment.shipping_method || 'Ground'}</p>
                          {selectedShipment.shipping_tracking_number && (
                            <div className="flex items-center gap-2 mt-2">
                              <code className="text-white/80 bg-white/5 px-2 py-1 rounded">
                                {selectedShipment.shipping_tracking_number}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyTrackingNumber(selectedShipment.shipping_tracking_number)}
                                className="text-white/70 hover:text-white hover:bg-white/10 h-7"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {selectedShipment.shipping_address && (
                        <div className="p-4 glass-card rounded-lg space-y-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5" style={{ color: '#d4af8a' }} />
                            <p className="text-white font-medium">Delivery Address</p>
                          </div>
                          <div className="text-white/70 text-sm">
                            <p>{selectedShipment.shipping_address.line1}</p>
                            {selectedShipment.shipping_address.line2 && (
                              <p>{selectedShipment.shipping_address.line2}</p>
                            )}
                            <p>
                              {selectedShipment.shipping_address.city}, {selectedShipment.shipping_address.state} {selectedShipment.shipping_address.postal_code}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="p-4 glass-card rounded-lg border border-white/10">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-white/90 font-medium text-sm mb-1">Need help with your delivery?</p>
                            <p className="text-white/60 text-sm mb-3">
                              If you're experiencing issues with your shipment, our support team is here to help.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                            >
                              <Link href="/account/support">Contact Support</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
