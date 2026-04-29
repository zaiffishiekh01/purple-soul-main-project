'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { RotateCcw, Sparkles, Package, DollarSign, Search, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAPIAuth as useAuth } from '@/lib/auth/api-context';
import { supabase } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  submitted: 'bg-blue-500/20 text-blue-200 border-blue-500/30',
  approved: 'bg-green-500/20 text-green-200 border-green-500/30',
  in_transit: 'bg-purple-500/20 text-purple-200 border-purple-500/30',
  received: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
  refunded: 'bg-green-500/20 text-green-200 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-200 border-red-500/30',
};

export default function ReturnsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [returns, setReturns] = useState<any[]>([]);
  const [refunds, setRefunds] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [returnReason, setReturnReason] = useState('');
  const [itemCondition, setItemCondition] = useState('');
  const [refundPreference, setRefundPreference] = useState('original');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            unit_price,
            product_id,
            products (
              title,
              images
            )
          )
        `)
        .eq('customer_id', user?.id)
        .gte('created_at', ninetyDaysAgo.toISOString())
        .in('status', ['delivered', 'shipped'])
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);

      const { data: returnsData, error: returnsError } = await supabase
        .from('returns')
        .select('*')
        .eq('customer_id', user?.id)
        .order('created_at', { ascending: false });

      if (returnsError && returnsError.code !== 'PGRST116') {
        console.error('Error fetching returns:', returnsError);
      }
      setReturns(returnsData || []);

      const { data: refundsData, error: refundsError } = await supabase
        .from('refunds')
        .select('*')
        .eq('customer_id', user?.id)
        .order('created_at', { ascending: false });

      if (refundsError && refundsError.code !== 'PGRST116') {
        console.error('Error fetching refunds:', refundsError);
      }
      setRefunds(refundsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReturn = async () => {
    if (!selectedOrder || selectedItems.length === 0 || !returnReason || !itemCondition) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const order = orders.find(o => o.id === selectedOrder);
      if (!order) {
        throw new Error('Order not found');
      }

      const returnTotal = order.order_items
        .filter((item: any) => selectedItems.includes(item.id))
        .reduce((sum: number, item: any) => sum + (parseFloat(item.unit_price) * item.quantity), 0);

      const { data: returnData, error: returnError } = await supabase
        .from('returns')
        .insert({
          customer_id: user?.id,
          order_id: selectedOrder,
          return_number: `RET-${Date.now()}`,
          reason: returnReason,
          item_condition: itemCondition,
          refund_preference: refundPreference,
          additional_notes: additionalNotes,
          status: 'submitted',
          return_amount: returnTotal,
        })
        .select()
        .single();

      if (returnError) throw returnError;

      toast.success('Return request submitted successfully');
      setSelectedOrder('');
      setSelectedItems([]);
      setReturnReason('');
      setItemCondition('');
      setAdditionalNotes('');
      fetchData();
    } catch (error: any) {
      console.error('Error submitting return:', error);
      toast.error(error.message || 'Failed to submit return request');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedOrderData = orders.find(o => o.id === selectedOrder);
  const paginatedReturns = returns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(returns.length / itemsPerPage);

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
              <span className="text-sm font-semibold text-white/90">Easy Returns</span>
            </div>

            <h1 className="hero-text font-serif text-white mb-6 leading-tight">
              Returns & Refunds
            </h1>

            <p className="text-xl text-white/70 mb-8 leading-relaxed">
              Request a return, track progress, and view refunds
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
                  <CardTitle className="text-white text-2xl font-serif">Start a Return</CardTitle>
                  <CardDescription className="text-white/60 text-base mt-2">
                    Select an order and items you'd like to return
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="order-select" className="text-white/90 text-base">Select Order (Last 90 Days)</Label>
                    <Select value={selectedOrder} onValueChange={setSelectedOrder}>
                      <SelectTrigger id="order-select" className="bg-white/5 border-white/20 text-white h-12">
                        <SelectValue placeholder="Choose an order..." />
                      </SelectTrigger>
                      <SelectContent>
                        {orders.length === 0 ? (
                          <SelectItem value="none" disabled>No eligible orders found</SelectItem>
                        ) : (
                          orders.map((order) => (
                            <SelectItem key={order.id} value={order.id}>
                              Order #{order.order_number} - ${parseFloat(order.total).toFixed(2)} ({formatDistanceToNow(new Date(order.created_at), { addSuffix: true })})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedOrderData && selectedOrderData.order_items && (
                    <div className="space-y-4">
                      <Label className="text-white/90 text-base">Select Items to Return</Label>
                      {selectedOrderData.order_items.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 glass-card rounded-lg">
                          <Checkbox
                            id={`item-${item.id}`}
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedItems([...selectedItems, item.id]);
                              } else {
                                setSelectedItems(selectedItems.filter(id => id !== item.id));
                              }
                            }}
                          />
                          <div className="flex-1">
                            <p className="text-white font-medium">{item.products?.title}</p>
                            <p className="text-white/60 text-sm">Quantity: {item.quantity} • ${parseFloat(item.unit_price).toFixed(2)} each</p>
                          </div>
                          <p className="text-white font-semibold">${(parseFloat(item.unit_price) * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedItems.length > 0 && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="return-reason" className="text-white/90 text-base">Reason for Return</Label>
                        <Select value={returnReason} onValueChange={setReturnReason}>
                          <SelectTrigger id="return-reason" className="bg-white/5 border-white/20 text-white h-12">
                            <SelectValue placeholder="Select a reason..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="damaged">Damaged</SelectItem>
                            <SelectItem value="not_as_described">Not as described</SelectItem>
                            <SelectItem value="wrong_item">Wrong item</SelectItem>
                            <SelectItem value="size_fit">Size/fit issue</SelectItem>
                            <SelectItem value="changed_mind">Changed mind</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="item-condition" className="text-white/90 text-base">Item Condition</Label>
                        <Select value={itemCondition} onValueChange={setItemCondition}>
                          <SelectTrigger id="item-condition" className="bg-white/5 border-white/20 text-white h-12">
                            <SelectValue placeholder="Select condition..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unopened">Unopened/New</SelectItem>
                            <SelectItem value="opened_unused">Opened but unused</SelectItem>
                            <SelectItem value="lightly_used">Lightly used</SelectItem>
                            <SelectItem value="damaged">Damaged/Defective</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="refund-preference" className="text-white/90 text-base">Refund Preference</Label>
                        <Select value={refundPreference} onValueChange={setRefundPreference}>
                          <SelectTrigger id="refund-preference" className="bg-white/5 border-white/20 text-white h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="original">Original Payment Method</SelectItem>
                            <SelectItem value="store_credit">Store Credit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="additional-notes" className="text-white/90 text-base">Additional Notes (Optional)</Label>
                        <Textarea
                          id="additional-notes"
                          value={additionalNotes}
                          onChange={(e) => setAdditionalNotes(e.target.value)}
                          placeholder="Provide any additional details about your return..."
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40 min-h-[100px]"
                        />
                      </div>

                      <div className="pt-6 border-t border-white/10">
                        <Button
                          onClick={handleSubmitReturn}
                          disabled={submitting}
                          className="celestial-button text-white"
                        >
                          {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RotateCcw className="w-4 h-4 mr-2" style={{ color: 'white' }} />}
                          Submit Return Request
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card glass-card-hover">
                <CardHeader>
                  <CardTitle className="text-white text-2xl font-serif">My Returns</CardTitle>
                  <CardDescription className="text-white/60 text-base mt-2">
                    Track the status of your return requests
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {returns.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 glass-card">
                        <RotateCcw className="w-10 h-10" style={{ color: '#d4af8a' }} />
                      </div>
                      <h3 className="text-2xl font-serif font-semibold mb-4 text-white">
                        No returns yet
                      </h3>
                      <p className="text-base text-white/60">
                        Your return requests will appear here
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {paginatedReturns.map((returnItem: any) => (
                          <div key={returnItem.id} className="p-4 glass-card rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-white font-semibold">Return #{returnItem.return_number}</p>
                                  <Badge className={statusColors[returnItem.status] || statusColors.submitted}>
                                    {returnItem.status.replace(/_/g, ' ')}
                                  </Badge>
                                </div>
                                <p className="text-white/60 text-sm">
                                  Order #{returnItem.order_id} • Submitted {formatDistanceToNow(new Date(returnItem.created_at), { addSuffix: true })}
                                </p>
                              </div>
                              <p className="text-white font-semibold">${parseFloat(returnItem.return_amount || 0).toFixed(2)}</p>
                            </div>
                            <div className="mt-2">
                              <p className="text-white/60 text-sm">Reason: {returnItem.reason?.replace(/_/g, ' ')}</p>
                            </div>
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

              <Card className="glass-card glass-card-hover">
                <CardHeader>
                  <CardTitle className="text-white text-2xl font-serif flex items-center gap-2">
                    <DollarSign className="w-6 h-6" style={{ color: '#d4af8a' }} />
                    Refund History
                  </CardTitle>
                  <CardDescription className="text-white/60 text-base mt-2">
                    View your completed refunds
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {refunds.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-base text-white/60">
                        No refunds processed yet
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {refunds.map((refund: any) => (
                        <div key={refund.id} className="p-4 glass-card rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-white font-semibold">Refund #{refund.refund_number || refund.id}</p>
                                <Badge className="bg-green-500/20 text-green-200 border-green-500/30">
                                  {refund.status}
                                </Badge>
                              </div>
                              <p className="text-white/60 text-sm">
                                {refund.refund_method?.replace(/_/g, ' ')} • {formatDistanceToNow(new Date(refund.created_at), { addSuffix: true })}
                              </p>
                            </div>
                            <p className="text-white font-semibold">${parseFloat(refund.refund_amount || 0).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
