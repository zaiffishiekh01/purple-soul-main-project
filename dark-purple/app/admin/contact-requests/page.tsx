"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ShieldCheck, MessageCircle, CircleCheck as CheckCircle, Circle as XCircle, Clock, CircleAlert as AlertCircle, Loader as Loader2, Package } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ContactRequest {
  id: string;
  reason_category: string;
  reason_text: string;
  status: string;
  requested_at: string;
  reviewed_at?: string;
  admin_notes?: string;
  customer_accepted: boolean;
  vendor: {
    id: string;
    business_name: string;
    email: string;
    logo_url?: string;
  };
  customer: {
    id: string;
    full_name?: string;
    email: string;
  };
  order?: {
    order_number: string;
    total: number;
    created_at: string;
    status: string;
  };
  product?: {
    title: string;
    images: string[];
  };
}

export default function AdminContactRequestsPage() {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ContactRequest | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchRequests(activeTab);
  }, [activeTab]);

  const fetchRequests = async (status: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/contact-requests?status=${status}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch contact requests');
      }

      setRequests(data.requests || []);
    } catch (error: any) {
      console.error('Error fetching contact requests:', error);
      toast.error(error.message || 'Failed to load contact requests');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!selectedRequest) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/admin/contact-requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          request_id: selectedRequest.id,
          action: reviewAction,
          admin_notes: adminNotes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process request');
      }

      toast.success(
        reviewAction === 'approve'
          ? 'Contact request approved. Customer will be notified.'
          : 'Contact request rejected.'
      );

      setShowReviewModal(false);
      setAdminNotes('');
      setSelectedRequest(null);

      // Refresh list
      fetchRequests(activeTab);
    } catch (error: any) {
      console.error('Error reviewing request:', error);
      toast.error(error.message || 'Failed to process request');
    } finally {
      setProcessing(false);
    }
  };

  const openReviewModal = (request: ContactRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setReviewAction(action);
    setShowReviewModal(true);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      order_inquiry: 'Order Inquiry',
      shipping_issue: 'Shipping Issue',
      product_question: 'Product Question',
      return_assistance: 'Return Assistance',
      custom_order: 'Custom Order',
      other: 'Other',
    };
    return labels[category] || category;
  };

  const getStatusBadge = (request: ContactRequest) => {
    if (request.status === 'pending') {
      return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
    if (request.status === 'approved' && !request.customer_accepted) {
      return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />Awaiting Customer</Badge>;
    }
    if (request.status === 'approved' && request.customer_accepted) {
      return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
    }
    if (request.status === 'rejected') {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
    }
    return <Badge>{request.status}</Badge>;
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-serif text-white mb-2">
            Contact Requests
          </h1>
          <p className="text-white/60">
            Review vendor requests to contact customers
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="pending">Pending Review</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All Requests</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-white/50" />
              </div>
            ) : requests.length === 0 ? (
              <Card className="glass-card p-12 text-center">
                <ShieldCheck className="h-12 w-12 mx-auto text-white/40 mb-4" />
                <p className="text-white/60">
                  No {activeTab === 'all' ? '' : activeTab} contact requests found
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <Card key={request.id} className="glass-card glass-card-hover">
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={request.vendor.logo_url} />
                                <AvatarFallback>
                                  {request.vendor.business_name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="text-lg font-semibold text-white">
                                  {request.vendor.business_name}
                                </h3>
                                <p className="text-sm text-white/60">
                                  {request.vendor.email}
                                </p>
                              </div>
                            </div>
                            {getStatusBadge(request)}
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                            <div>
                              <p className="text-white/50 mb-1">Customer</p>
                              <p className="text-white">
                                {request.customer.full_name || 'Not provided'}
                              </p>
                              <p className="text-white/60 text-xs">
                                {request.customer.email}
                              </p>
                            </div>

                            {request.order && (
                              <div>
                                <p className="text-white/50 mb-1">Order</p>
                                <p className="text-white">
                                  #{request.order.order_number}
                                </p>
                                <p className="text-white/60 text-xs">
                                  ${request.order.total.toFixed(2)} • {request.order.status}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">
                                {getCategoryLabel(request.reason_category)}
                              </Badge>
                              <span className="text-xs text-white/50">
                                {format(new Date(request.requested_at), 'MMM d, yyyy h:mm a')}
                              </span>
                            </div>
                            <p className="text-white/80 text-sm bg-white/5 p-3 rounded">
                              {request.reason_text}
                            </p>
                          </div>

                          {request.admin_notes && (
                            <Alert className="mb-4 bg-white/5">
                              <AlertDescription className="text-white/80 text-sm">
                                <strong>Admin Notes:</strong> {request.admin_notes}
                              </AlertDescription>
                            </Alert>
                          )}

                          {request.status === 'pending' && (
                            <div className="flex gap-3">
                              <Button
                                onClick={() => openReviewModal(request, 'approve')}
                                className="celestial-button"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => openReviewModal(request, 'reject')}
                                variant="destructive"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          )}

                          {request.status === 'approved' && request.reviewed_at && (
                            <p className="text-xs text-white/50">
                              Approved {format(new Date(request.reviewed_at), 'MMM d, yyyy h:mm a')}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {reviewAction === 'approve' ? 'Approve' : 'Reject'} Contact Request
              </DialogTitle>
              <DialogDescription>
                {reviewAction === 'approve'
                  ? 'Allow vendor to contact customer through platform messaging'
                  : 'Deny vendor access to contact customer'}
              </DialogDescription>
            </DialogHeader>

            {selectedRequest && (
              <div className="space-y-4">
                <Alert>
                  <ShieldCheck className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {reviewAction === 'approve'
                      ? 'A message thread will be created. Customer will be notified and must accept before messaging begins.'
                      : 'The vendor will be notified that their request was denied.'}
                  </AlertDescription>
                </Alert>

                <div>
                  <Label htmlFor="admin-notes">
                    Admin Notes (optional)
                  </Label>
                  <Textarea
                    id="admin-notes"
                    placeholder="Add internal notes about this decision..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowReviewModal(false)}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReview}
                disabled={processing}
                variant={reviewAction === 'reject' ? 'destructive' : 'default'}
              >
                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {reviewAction === 'approve' ? 'Approve Request' : 'Reject Request'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
