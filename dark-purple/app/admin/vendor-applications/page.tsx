'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CircleCheck as CheckCircle2, Circle as XCircle, Clock, Eye, Building2, Mail, Phone, MapPin, Calendar, Package, Heart, FileText, Loader as Loader2, CircleAlert as AlertCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import { format } from 'date-fns';

interface VendorApplication {
  id: string;
  user_id: string;
  status: string;
  business_name: string;
  business_type: string;
  business_description: string;
  business_story?: string;
  year_established?: number;
  contact_email: string;
  contact_phone: string;
  website_url?: string;
  social_media_links?: any;
  business_address?: any;
  primary_category: string;
  product_categories?: string[];
  estimated_monthly_products?: number;
  is_handmade: boolean;
  handmade_percentage?: number;
  materials_sourcing?: string;
  ethical_practices?: string[];
  production_time_days?: number;
  shipping_regions?: string[];
  return_policy?: string;
  custom_orders_accepted: boolean;
  submitted_at?: string;
  reviewed_at?: string;
  admin_notes?: string;
  rejection_reason?: string;
  created_at: string;
}

export default function VendorApplicationsPage() {
  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<VendorApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<VendorApplication | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'request_info'>('approve');
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [additionalInfoRequested, setAdditionalInfoRequested] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplicationsByStatus(activeTab);
  }, [activeTab, applications]);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('vendor_applications')
        .select('*')
        .order('submitted_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  const filterApplicationsByStatus = (status: string) => {
    if (status === 'all') {
      setFilteredApplications(applications);
    } else if (status === 'pending') {
      setFilteredApplications(
        applications.filter((app) => app.status === 'submitted' || app.status === 'under_review')
      );
    } else {
      setFilteredApplications(applications.filter((app) => app.status === status));
    }
  };

  const openReviewModal = (application: VendorApplication, action: 'approve' | 'reject' | 'request_info') => {
    setSelectedApplication(application);
    setReviewAction(action);
    setAdminNotes(application.admin_notes || '');
    setRejectionReason('');
    setAdditionalInfoRequested('');
    setShowReviewModal(true);
  };

  const handleReview = async () => {
    if (!selectedApplication) return;

    try {
      setIsSubmitting(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updates: any = {
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        admin_notes: adminNotes,
      };

      if (reviewAction === 'approve') {
        updates.status = 'approved';

        // Create vendor from application
        const { error: vendorError } = await supabase.rpc(
          'create_vendor_from_application',
          { p_application_id: selectedApplication.id }
        );

        if (vendorError) throw vendorError;

        toast.success('Application approved and vendor account created!');
      } else if (reviewAction === 'reject') {
        if (!rejectionReason) {
          toast.error('Please provide a rejection reason');
          return;
        }
        updates.status = 'rejected';
        updates.rejection_reason = rejectionReason;

        toast.success('Application rejected');
      } else if (reviewAction === 'request_info') {
        if (!additionalInfoRequested) {
          toast.error('Please specify what additional information is needed');
          return;
        }
        updates.status = 'needs_info';
        updates.additional_info_requested = additionalInfoRequested;

        toast.success('Request sent to applicant');
      }

      const { error: updateError } = await supabase
        .from('vendor_applications')
        .update(updates)
        .eq('id', selectedApplication.id);

      if (updateError) throw updateError;

      setShowReviewModal(false);
      fetchApplications();
    } catch (error) {
      console.error('Error reviewing application:', error);
      toast.error('Failed to process application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: <Badge variant="secondary">Draft</Badge>,
      submitted: <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">Submitted</Badge>,
      under_review: <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Under Review</Badge>,
      approved: <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Approved</Badge>,
      rejected: <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Rejected</Badge>,
      needs_info: <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30">Needs Info</Badge>,
    };

    return badges[status as keyof typeof badges] || <Badge>{status}</Badge>;
  };

  const pendingCount = applications.filter((app) =>
    app.status === 'submitted' || app.status === 'under_review'
  ).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-rose-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-serif text-white mb-2">
          Vendor Applications
        </h1>
        <p className="text-white/60">
          Review and approve vendor applications
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="pending" className="data-[state=active]:bg-rose-gold/20">
            Pending Review
            {pendingCount > 0 && (
              <Badge className="ml-2 bg-rose-gold text-white border-none">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved" className="data-[state=active]:bg-rose-gold/20">
            Approved
          </TabsTrigger>
          <TabsTrigger value="rejected" className="data-[state=active]:bg-rose-gold/20">
            Rejected
          </TabsTrigger>
          <TabsTrigger value="needs_info" className="data-[state=active]:bg-rose-gold/20">
            Needs Info
          </TabsTrigger>
          <TabsTrigger value="all" className="data-[state=active]:bg-rose-gold/20">
            All
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {filteredApplications.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <AlertCircle className="h-12 w-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/60">No applications found</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredApplications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  onReview={(action) => openReviewModal(application, action)}
                />
              ))}
            </div>
          )}
        </div>
      </Tabs>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-2xl bg-gray-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl font-serif">
              {reviewAction === 'approve' && 'Approve Application'}
              {reviewAction === 'reject' && 'Reject Application'}
              {reviewAction === 'request_info' && 'Request Additional Information'}
            </DialogTitle>
            <DialogDescription className="text-white/60">
              {selectedApplication?.business_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="admin_notes" className="text-white">
                Admin Notes (Internal)
              </Label>
              <Textarea
                id="admin_notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Internal notes about this application..."
                rows={3}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            {reviewAction === 'reject' && (
              <div>
                <Label htmlFor="rejection_reason" className="text-white">
                  Rejection Reason <span className="text-rose-gold">*</span>
                </Label>
                <Textarea
                  id="rejection_reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="This will be shown to the applicant..."
                  rows={4}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            )}

            {reviewAction === 'request_info' && (
              <div>
                <Label htmlFor="additional_info" className="text-white">
                  Additional Information Needed <span className="text-rose-gold">*</span>
                </Label>
                <Textarea
                  id="additional_info"
                  value={additionalInfoRequested}
                  onChange={(e) => setAdditionalInfoRequested(e.target.value)}
                  placeholder="Specify what additional information or documentation is required..."
                  rows={4}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <Button
                onClick={() => setShowReviewModal(false)}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              <Button
                onClick={handleReview}
                className={
                  reviewAction === 'approve'
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : reviewAction === 'reject'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'celestial-button'
                }
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {reviewAction === 'approve' && <CheckCircle2 className="h-4 w-4 mr-2" />}
                    {reviewAction === 'reject' && <XCircle className="h-4 w-4 mr-2" />}
                    {reviewAction === 'request_info' && <Clock className="h-4 w-4 mr-2" />}
                    {reviewAction === 'approve' && 'Approve & Create Vendor'}
                    {reviewAction === 'reject' && 'Reject Application'}
                    {reviewAction === 'request_info' && 'Request Information'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ApplicationCard({
  application,
  onReview,
}: {
  application: VendorApplication;
  onReview: (action: 'approve' | 'reject' | 'request_info') => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="glass-card">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-serif text-white">
                {application.business_name}
              </h3>
              {getStatusBadge(application.status)}
            </div>

            <p className="text-white/60 line-clamp-2">
              {application.business_description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center gap-2 text-white/60">
            <Building2 className="h-4 w-4" />
            <span className="text-sm">{application.business_type}</span>
          </div>

          <div className="flex items-center gap-2 text-white/60">
            <Mail className="h-4 w-4" />
            <span className="text-sm">{application.contact_email}</span>
          </div>

          <div className="flex items-center gap-2 text-white/60">
            <Package className="h-4 w-4" />
            <span className="text-sm">{application.primary_category}</span>
          </div>

          <div className="flex items-center gap-2 text-white/60">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">
              {application.submitted_at
                ? format(new Date(application.submitted_at), 'MMM d, yyyy')
                : 'Draft'}
            </span>
          </div>
        </div>

        {showDetails && (
          <div className="mt-6 pt-6 border-t border-white/10 space-y-6">
            {/* Contact Information */}
            <div>
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Mail className="h-4 w-4 text-rose-gold" />
                Contact Information
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-white/40">Email</p>
                  <p className="text-white">{application.contact_email}</p>
                </div>
                <div>
                  <p className="text-white/40">Phone</p>
                  <p className="text-white">{application.contact_phone}</p>
                </div>
                {application.website_url && (
                  <div>
                    <p className="text-white/40">Website</p>
                    <a
                      href={application.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-rose-gold hover:underline flex items-center gap-1"
                    >
                      {application.website_url}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Business Address */}
            {application.business_address && (
              <div>
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-rose-gold" />
                  Business Address
                </h4>
                <div className="text-sm text-white space-y-1">
                  <p>{application.business_address.address_line1}</p>
                  {application.business_address.address_line2 && (
                    <p>{application.business_address.address_line2}</p>
                  )}
                  <p>
                    {application.business_address.city}, {application.business_address.state_province}{' '}
                    {application.business_address.postal_code}
                  </p>
                  <p>{application.business_address.country}</p>
                </div>
              </div>
            )}

            {/* Craft Story */}
            {application.business_story && (
              <div>
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Heart className="h-4 w-4 text-rose-gold" />
                  Craft Story
                </h4>
                <p className="text-white/80 text-sm whitespace-pre-line">
                  {application.business_story}
                </p>
              </div>
            )}

            {/* Values & Practices */}
            {application.ethical_practices && application.ethical_practices.length > 0 && (
              <div>
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Heart className="h-4 w-4 text-rose-gold" />
                  Ethical Practices
                </h4>
                <div className="flex flex-wrap gap-2">
                  {application.ethical_practices.map((practice) => (
                    <Badge key={practice} variant="outline" className="border-rose-gold/30 text-rose-gold">
                      {practice}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Shipping */}
            {application.shipping_regions && application.shipping_regions.length > 0 && (
              <div>
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4 text-rose-gold" />
                  Shipping Regions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {application.shipping_regions.map((region) => (
                    <Badge key={region} variant="secondary">
                      {region}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Return Policy */}
            {application.return_policy && (
              <div>
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-rose-gold" />
                  Return Policy
                </h4>
                <p className="text-white/80 text-sm whitespace-pre-line">
                  {application.return_policy}
                </p>
              </div>
            )}

            {/* Admin Notes */}
            {application.admin_notes && (
              <div className="bg-white/5 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Admin Notes</h4>
                <p className="text-white/60 text-sm">{application.admin_notes}</p>
              </div>
            )}

            {/* Rejection Reason */}
            {application.rejection_reason && (
              <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
                <h4 className="text-red-500 font-semibold mb-2">Rejection Reason</h4>
                <p className="text-white/80 text-sm">{application.rejection_reason}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 mt-6">
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Eye className="h-4 w-4 mr-2" />
            {showDetails ? 'Hide Details' : 'View Details'}
          </Button>

          {(application.status === 'submitted' || application.status === 'under_review') && (
            <>
              <Button
                onClick={() => onReview('approve')}
                size="sm"
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approve
              </Button>

              <Button
                onClick={() => onReview('request_info')}
                size="sm"
                variant="outline"
                className="border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10"
              >
                <Clock className="h-4 w-4 mr-2" />
                Request Info
              </Button>

              <Button
                onClick={() => onReview('reject')}
                size="sm"
                variant="outline"
                className="border-red-500/30 text-red-500 hover:bg-red-500/10"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  function getStatusBadge(status: string) {
    const badges = {
      draft: <Badge variant="secondary">Draft</Badge>,
      submitted: <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">Submitted</Badge>,
      under_review: <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Under Review</Badge>,
      approved: <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Approved</Badge>,
      rejected: <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Rejected</Badge>,
      needs_info: <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30">Needs Info</Badge>,
    };

    return badges[status as keyof typeof badges] || <Badge>{status}</Badge>;
  }
}
