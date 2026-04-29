'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Building2, Mail, MapPin, Package, Heart, Truck, FileText, CreditCard, CircleCheck as CheckCircle2, ArrowRight, ArrowLeft, Sparkles, CircleAlert as AlertCircle, Loader as Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';

const STEPS = [
  { id: 1, title: 'Business Info', icon: Building2, description: 'Tell us about your business' },
  { id: 2, title: 'Contact', icon: Mail, description: 'How can we reach you?' },
  { id: 3, title: 'Address', icon: MapPin, description: 'Where are you located?' },
  { id: 4, title: 'Products', icon: Package, description: 'What do you create?' },
  { id: 5, title: 'Values', icon: Heart, description: 'Your craft story' },
  { id: 6, title: 'Operations', icon: Truck, description: 'How you work' },
  { id: 7, title: 'Legal', icon: FileText, description: 'Tax & compliance' },
  { id: 8, title: 'Banking', icon: CreditCard, description: 'Payment details' },
];

const BUSINESS_TYPES = [
  { value: 'sole_proprietor', label: 'Sole Proprietor' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'llc', label: 'LLC' },
  { value: 'corporation', label: 'Corporation' },
  { value: 'non_profit', label: 'Non-Profit' },
  { value: 'artisan', label: 'Independent Artisan' },
  { value: 'cottage_industry', label: 'Cottage Industry' },
];

const ETHICAL_PRACTICES = [
  'Fair Trade Certified',
  'Organic Materials',
  'Sustainable Sourcing',
  'Zero Waste Production',
  'Carbon Neutral',
  'Living Wage Employer',
  'Local Materials',
  'Recycled Materials',
  'Vegan/Cruelty-Free',
  'Woman-Owned',
  'Minority-Owned',
  'Family Business',
];

const SHIPPING_REGIONS = [
  'United States',
  'Canada',
  'Mexico',
  'Europe',
  'Asia',
  'Australia',
  'South America',
  'Africa',
  'Worldwide',
];

interface VendorOnboardingWizardProps {
  onComplete?: () => void;
}

export function VendorOnboardingWizard({ onComplete }: VendorOnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Business Info
    business_name: '',
    business_type: '',
    business_description: '',
    business_story: '',
    year_established: new Date().getFullYear(),

    // Step 2: Contact
    contact_email: '',
    contact_phone: '',
    website_url: '',
    instagram: '',
    facebook: '',
    twitter: '',

    // Step 3: Address
    address_line1: '',
    address_line2: '',
    city: '',
    state_province: '',
    postal_code: '',
    country: 'United States',

    // Step 4: Products
    primary_category: '',
    product_categories: [] as string[],
    product_types: [] as string[],
    estimated_monthly_products: 0,
    sample_product_1: '',
    sample_product_2: '',
    sample_product_3: '',

    // Step 5: Values
    is_handmade: true,
    handmade_percentage: 100,
    materials_sourcing: '',
    ethical_practices: [] as string[],
    certifications: [] as string[],

    // Step 6: Operations
    production_time_days: 7,
    shipping_regions: [] as string[],
    return_policy: '',
    custom_orders_accepted: false,

    // Step 7: Legal
    tax_id_type: '',
    tax_id_number: '',
    business_license_number: '',
    business_registered_state: '',

    // Step 8: Banking
    bank_account_holder: '',
    bank_name: '',
    bank_account_type: '',
    bank_routing_number: '',
    bank_account_last4: '',
  });

  // Load existing application on mount
  useEffect(() => {
    loadExistingApplication();
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (applicationId) {
        autoSaveProgress();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [formData, applicationId]);

  const loadExistingApplication = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check for existing application
      const { data: application } = await supabase
        .from('vendor_applications')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['draft', 'needs_info'])
        .maybeSingle();

      if (application) {
        setApplicationId(application.id);
        // Populate form with existing data
        setFormData({
          ...formData,
          ...application,
          instagram: application.social_media_links?.instagram || '',
          facebook: application.social_media_links?.facebook || '',
          twitter: application.social_media_links?.twitter || '',
          address_line1: application.business_address?.address_line1 || '',
          address_line2: application.business_address?.address_line2 || '',
          city: application.business_address?.city || '',
          state_province: application.business_address?.state_province || '',
          postal_code: application.business_address?.postal_code || '',
          country: application.business_address?.country || 'United States',
        });

        // Load progress
        const { data: progress } = await supabase
          .from('vendor_onboarding_progress')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (progress) {
          setCurrentStep(progress.current_step);
          setCompletedSteps(progress.completed_steps || []);
        }
      }
    } catch (error) {
      console.error('Error loading application:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const autoSaveProgress = async () => {
    try {
      setIsSaving(true);
      await saveApplication('draft', false);
    } catch (error) {
      console.error('Auto-save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const saveApplication = async (status: string = 'draft', showToast: boolean = true) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const applicationData = {
      user_id: user.id,
      status,
      business_name: formData.business_name,
      business_type: formData.business_type,
      business_description: formData.business_description,
      business_story: formData.business_story,
      year_established: formData.year_established,
      contact_email: formData.contact_email,
      contact_phone: formData.contact_phone,
      website_url: formData.website_url,
      social_media_links: {
        instagram: formData.instagram,
        facebook: formData.facebook,
        twitter: formData.twitter,
      },
      business_address: {
        address_line1: formData.address_line1,
        address_line2: formData.address_line2,
        city: formData.city,
        state_province: formData.state_province,
        postal_code: formData.postal_code,
        country: formData.country,
      },
      primary_category: formData.primary_category,
      product_categories: formData.product_categories,
      product_types: formData.product_types,
      estimated_monthly_products: formData.estimated_monthly_products,
      sample_product_descriptions: [
        formData.sample_product_1,
        formData.sample_product_2,
        formData.sample_product_3,
      ].filter(Boolean),
      is_handmade: formData.is_handmade,
      handmade_percentage: formData.handmade_percentage,
      materials_sourcing: formData.materials_sourcing,
      ethical_practices: formData.ethical_practices,
      certifications: formData.certifications,
      production_time_days: formData.production_time_days,
      shipping_regions: formData.shipping_regions,
      return_policy: formData.return_policy,
      custom_orders_accepted: formData.custom_orders_accepted,
      tax_id_type: formData.tax_id_type,
      tax_id_number: formData.tax_id_number,
      business_license_number: formData.business_license_number,
      business_registered_state: formData.business_registered_state,
      bank_account_holder: formData.bank_account_holder,
      bank_name: formData.bank_name,
      bank_account_type: formData.bank_account_type,
      bank_routing_number: formData.bank_routing_number,
      bank_account_last4: formData.bank_account_last4,
      submitted_at: status === 'submitted' ? new Date().toISOString() : null,
    };

    let resolvedApplicationId = applicationId;

    if (applicationId) {
      const { error } = await supabase
        .from('vendor_applications')
        .update(applicationData)
        .eq('id', applicationId);

      if (error) throw error;
    } else {
      const { data, error } = await supabase
        .from('vendor_applications')
        .insert([applicationData])
        .select()
        .single();

      if (error) throw error;
      resolvedApplicationId = data.id;
      setApplicationId(data.id);
    }

    // Update progress
    await supabase
      .from('vendor_onboarding_progress')
      .upsert({
        user_id: user.id,
        application_id: resolvedApplicationId,
        current_step: currentStep,
        completed_steps: completedSteps,
        form_data: formData,
        last_saved_at: new Date().toISOString(),
      });

    if (showToast) {
      toast.success('Progress saved!');
    }
  };

  const validateStep = (step: number): string[] => {
    const errors: string[] = [];

    switch (step) {
      case 1:
        if (!formData.business_name) errors.push('Business name is required');
        if (!formData.business_type) errors.push('Business type is required');
        if (!formData.business_description || formData.business_description.length < 50) {
          errors.push('Business description must be at least 50 characters');
        }
        break;
      case 2:
        if (!formData.contact_email) errors.push('Email is required');
        if (!formData.contact_phone) errors.push('Phone is required');
        break;
      case 3:
        if (!formData.address_line1) errors.push('Street address is required');
        if (!formData.city) errors.push('City is required');
        if (!formData.state_province) errors.push('State/Province is required');
        if (!formData.postal_code) errors.push('Postal code is required');
        break;
      case 4:
        if (!formData.primary_category) errors.push('Primary category is required');
        break;
      case 5:
        if (!formData.materials_sourcing) errors.push('Materials sourcing information is required');
        break;
      case 6:
        if (!formData.return_policy) errors.push('Return policy is required');
        if (formData.shipping_regions.length === 0) errors.push('Select at least one shipping region');
        break;
      case 7:
        // Optional for now
        break;
      case 8:
        // Optional for now
        break;
    }

    return errors;
  };

  const handleNext = async () => {
    const errors = validateStep(currentStep);

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    // Mark step as completed
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    // Save progress
    await saveApplication('draft', false);

    // Move to next step
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // Validate all steps
      for (let i = 1; i <= STEPS.length; i++) {
        const errors = validateStep(i);
        if (errors.length > 0) {
          toast.error(`Please complete step ${i}: ${STEPS[i - 1].title}`);
          setCurrentStep(i);
          return;
        }
      }

      // Submit application
      await saveApplication('submitted', false);

      toast.success('Application submitted successfully! We\'ll review it shortly.');

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit application');
    } finally {
      setIsLoading(false);
    }
  };

  const progress = (completedSteps.length / STEPS.length) * 100;

  if (isLoading && !applicationId) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-rose-gold" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-serif text-white">Vendor Application</h2>
            <p className="text-white/60 mt-1">
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].title}
            </p>
          </div>
          {isSaving && (
            <Badge variant="outline" className="border-rose-gold/30 text-rose-gold">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Saving...
            </Badge>
          )}
        </div>

        <Progress value={progress} className="h-2" />

        {/* Step Indicators */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mt-6">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = currentStep === step.id;

            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`
                  flex flex-col items-center gap-2 p-3 rounded-lg transition-all
                  ${isCurrent ? 'bg-rose-gold/20 border-2 border-rose-gold' : 'bg-white/5 border border-white/10'}
                  ${isCompleted ? 'border-green-500/50' : ''}
                  hover:bg-white/10
                `}
              >
                <div className="relative">
                  <Icon className={`h-5 w-5 ${isCurrent ? 'text-rose-gold' : 'text-white/60'}`} />
                  {isCompleted && (
                    <CheckCircle2 className="h-3 w-3 text-green-500 absolute -top-1 -right-1" />
                  )}
                </div>
                <span className="text-xs text-white/60 hidden md:block">{step.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="glass-card p-8 mb-8">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          onClick={handleBack}
          disabled={currentStep === 1}
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex gap-3">
          <Button
            onClick={() => saveApplication('draft')}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            Save Draft
          </Button>

          {currentStep < STEPS.length ? (
            <Button onClick={handleNext} className="celestial-button">
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="celestial-button" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  function renderStepContent() {
    switch (currentStep) {
      case 1:
        return <Step1BusinessInfo />;
      case 2:
        return <Step2Contact />;
      case 3:
        return <Step3Address />;
      case 4:
        return <Step4Products />;
      case 5:
        return <Step5Values />;
      case 6:
        return <Step6Operations />;
      case 7:
        return <Step7Legal />;
      case 8:
        return <Step8Banking />;
      default:
        return null;
    }
  }

  function Step1BusinessInfo() {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-serif text-white mb-2">Tell Us About Your Business</h3>
          <p className="text-white/60">Help us understand your craft and mission</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="business_name" className="text-white">
              Business Name <span className="text-rose-gold">*</span>
            </Label>
            <Input
              id="business_name"
              value={formData.business_name}
              onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              placeholder="Your artisan business name"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div>
            <Label htmlFor="business_type" className="text-white">
              Business Type <span className="text-rose-gold">*</span>
            </Label>
            <Select
              value={formData.business_type}
              onValueChange={(value) => setFormData({ ...formData, business_type: value })}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select business structure" />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="year_established" className="text-white">
              Year Established
            </Label>
            <Input
              id="year_established"
              type="number"
              value={formData.year_established}
              onChange={(e) => setFormData({ ...formData, year_established: parseInt(e.target.value) })}
              min="1800"
              max={new Date().getFullYear()}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div>
            <Label htmlFor="business_description" className="text-white">
              Business Description <span className="text-rose-gold">*</span>
              <span className="text-xs text-white/40 ml-2">
                (Minimum 50 characters - {formData.business_description.length}/50)
              </span>
            </Label>
            <Textarea
              id="business_description"
              value={formData.business_description}
              onChange={(e) => setFormData({ ...formData, business_description: e.target.value })}
              placeholder="Describe what makes your business unique..."
              rows={4}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div>
            <Label htmlFor="business_story" className="text-white">
              Your Craft Story
            </Label>
            <Textarea
              id="business_story"
              value={formData.business_story}
              onChange={(e) => setFormData({ ...formData, business_story: e.target.value })}
              placeholder="Share the inspiration behind your craft, your journey, and what drives your passion..."
              rows={6}
              className="bg-white/5 border-white/10 text-white"
            />
            <p className="text-xs text-white/40 mt-1">
              This will be displayed on your vendor profile
            </p>
          </div>
        </div>
      </div>
    );
  }

  function Step2Contact() {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-serif text-white mb-2">Contact Information</h3>
          <p className="text-white/60">How can customers and admins reach you?</p>
        </div>

        <Alert className="bg-rose-gold/10 border-rose-gold/30">
          <AlertCircle className="h-4 w-4 text-rose-gold" />
          <AlertDescription className="text-white/80">
            Your contact info is protected. Customers will only see it after admin approval.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <Label htmlFor="contact_email" className="text-white">
              Business Email <span className="text-rose-gold">*</span>
            </Label>
            <Input
              id="contact_email"
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              placeholder="business@example.com"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div>
            <Label htmlFor="contact_phone" className="text-white">
              Business Phone <span className="text-rose-gold">*</span>
            </Label>
            <Input
              id="contact_phone"
              type="tel"
              value={formData.contact_phone}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div>
            <Label htmlFor="website_url" className="text-white">
              Website
            </Label>
            <Input
              id="website_url"
              type="url"
              value={formData.website_url}
              onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
              placeholder="https://yourwebsite.com"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div className="pt-4">
            <Label className="text-white mb-3 block">Social Media (Optional)</Label>
            <div className="space-y-3">
              <Input
                placeholder="Instagram username"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
              <Input
                placeholder="Facebook page"
                value={formData.facebook}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
              <Input
                placeholder="Twitter/X handle"
                value={formData.twitter}
                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  function Step3Address() {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-serif text-white mb-2">Business Address</h3>
          <p className="text-white/60">Where is your business located?</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="address_line1" className="text-white">
              Street Address <span className="text-rose-gold">*</span>
            </Label>
            <Input
              id="address_line1"
              value={formData.address_line1}
              onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
              placeholder="123 Main Street"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div>
            <Label htmlFor="address_line2" className="text-white">
              Address Line 2
            </Label>
            <Input
              id="address_line2"
              value={formData.address_line2}
              onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
              placeholder="Suite, Unit, Building (optional)"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city" className="text-white">
                City <span className="text-rose-gold">*</span>
              </Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="City"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <Label htmlFor="state_province" className="text-white">
                State/Province <span className="text-rose-gold">*</span>
              </Label>
              <Input
                id="state_province"
                value={formData.state_province}
                onChange={(e) => setFormData({ ...formData, state_province: e.target.value })}
                placeholder="State"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="postal_code" className="text-white">
                Postal Code <span className="text-rose-gold">*</span>
              </Label>
              <Input
                id="postal_code"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                placeholder="12345"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <Label htmlFor="country" className="text-white">
                Country <span className="text-rose-gold">*</span>
              </Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  function Step4Products() {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-serif text-white mb-2">Your Products</h3>
          <p className="text-white/60">Tell us about what you create</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="primary_category" className="text-white">
              Primary Category <span className="text-rose-gold">*</span>
            </Label>
            <Select
              value={formData.primary_category}
              onValueChange={(value) => setFormData({ ...formData, primary_category: value })}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select your main category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prayer_beads">Prayer Beads & Rosaries</SelectItem>
                <SelectItem value="prayer_rugs">Prayer Rugs & Mats</SelectItem>
                <SelectItem value="islamic_art">Islamic Art & Calligraphy</SelectItem>
                <SelectItem value="jewelry">Spiritual Jewelry</SelectItem>
                <SelectItem value="home_decor">Home Decor</SelectItem>
                <SelectItem value="books">Books & Literature</SelectItem>
                <SelectItem value="clothing">Modest Clothing</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
                <SelectItem value="gifts">Gifts & Special Occasions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="estimated_monthly_products" className="text-white">
              Estimated Monthly Production
            </Label>
            <Input
              id="estimated_monthly_products"
              type="number"
              value={formData.estimated_monthly_products}
              onChange={(e) => setFormData({ ...formData, estimated_monthly_products: parseInt(e.target.value) })}
              placeholder="How many items can you produce per month?"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div>
            <Label className="text-white mb-3 block">
              Sample Product Descriptions
              <span className="text-xs text-white/40 ml-2">(Optional but recommended)</span>
            </Label>
            <div className="space-y-3">
              <Input
                placeholder="Product 1: Handcrafted 99-bead tasbih with..."
                value={formData.sample_product_1}
                onChange={(e) => setFormData({ ...formData, sample_product_1: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
              <Input
                placeholder="Product 2: Turkish prayer rug with..."
                value={formData.sample_product_2}
                onChange={(e) => setFormData({ ...formData, sample_product_2: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
              <Input
                placeholder="Product 3: Islamic wall art featuring..."
                value={formData.sample_product_3}
                onChange={(e) => setFormData({ ...formData, sample_product_3: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  function Step5Values() {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-serif text-white mb-2">Your Craft Values</h3>
          <p className="text-white/60">Share your commitment to quality and ethics</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3 glass-card p-4">
            <Checkbox
              id="is_handmade"
              checked={formData.is_handmade}
              onCheckedChange={(checked) => setFormData({ ...formData, is_handmade: checked as boolean })}
            />
            <Label htmlFor="is_handmade" className="text-white cursor-pointer">
              My products are handmade
            </Label>
          </div>

          {formData.is_handmade && (
            <div>
              <Label htmlFor="handmade_percentage" className="text-white">
                Handmade Percentage: {formData.handmade_percentage}%
              </Label>
              <input
                type="range"
                id="handmade_percentage"
                min="0"
                max="100"
                value={formData.handmade_percentage}
                onChange={(e) => setFormData({ ...formData, handmade_percentage: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          )}

          <div>
            <Label htmlFor="materials_sourcing" className="text-white">
              Materials Sourcing <span className="text-rose-gold">*</span>
            </Label>
            <Textarea
              id="materials_sourcing"
              value={formData.materials_sourcing}
              onChange={(e) => setFormData({ ...formData, materials_sourcing: e.target.value })}
              placeholder="Where do you source your materials? Are they ethically sourced?"
              rows={4}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div>
            <Label className="text-white mb-3 block">
              Ethical Practices & Certifications
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {ETHICAL_PRACTICES.map((practice) => (
                <div key={practice} className="flex items-center space-x-2 glass-card p-3">
                  <Checkbox
                    id={`practice-${practice}`}
                    checked={formData.ethical_practices.includes(practice)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData({
                          ...formData,
                          ethical_practices: [...formData.ethical_practices, practice],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          ethical_practices: formData.ethical_practices.filter((p) => p !== practice),
                        });
                      }
                    }}
                  />
                  <Label htmlFor={`practice-${practice}`} className="text-white/80 text-sm cursor-pointer">
                    {practice}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function Step6Operations() {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-serif text-white mb-2">Business Operations</h3>
          <p className="text-white/60">How does your business work?</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="production_time_days" className="text-white">
              Typical Production Time (days)
            </Label>
            <Input
              id="production_time_days"
              type="number"
              value={formData.production_time_days}
              onChange={(e) => setFormData({ ...formData, production_time_days: parseInt(e.target.value) })}
              placeholder="7"
              className="bg-white/5 border-white/10 text-white"
            />
            <p className="text-xs text-white/40 mt-1">
              How many days do you need to create and ship an order?
            </p>
          </div>

          <div>
            <Label className="text-white mb-3 block">
              Shipping Regions <span className="text-rose-gold">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {SHIPPING_REGIONS.map((region) => (
                <div key={region} className="flex items-center space-x-2 glass-card p-3">
                  <Checkbox
                    id={`region-${region}`}
                    checked={formData.shipping_regions.includes(region)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData({
                          ...formData,
                          shipping_regions: [...formData.shipping_regions, region],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          shipping_regions: formData.shipping_regions.filter((r) => r !== region),
                        });
                      }
                    }}
                  />
                  <Label htmlFor={`region-${region}`} className="text-white/80 text-sm cursor-pointer">
                    {region}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="return_policy" className="text-white">
              Return Policy <span className="text-rose-gold">*</span>
            </Label>
            <Textarea
              id="return_policy"
              value={formData.return_policy}
              onChange={(e) => setFormData({ ...formData, return_policy: e.target.value })}
              placeholder="Describe your return and exchange policy..."
              rows={4}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div className="flex items-center space-x-3 glass-card p-4">
            <Checkbox
              id="custom_orders_accepted"
              checked={formData.custom_orders_accepted}
              onCheckedChange={(checked) => setFormData({ ...formData, custom_orders_accepted: checked as boolean })}
            />
            <Label htmlFor="custom_orders_accepted" className="text-white cursor-pointer">
              I accept custom orders
            </Label>
          </div>
        </div>
      </div>
    );
  }

  function Step7Legal() {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-serif text-white mb-2">Tax & Legal Information</h3>
          <p className="text-white/60">For compliance and verification</p>
        </div>

        <Alert className="bg-white/5 border-white/10">
          <AlertCircle className="h-4 w-4 text-white/60" />
          <AlertDescription className="text-white/60">
            This information is confidential and used only for verification purposes.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <Label htmlFor="tax_id_type" className="text-white">
              Tax ID Type
            </Label>
            <Select
              value={formData.tax_id_type}
              onValueChange={(value) => setFormData({ ...formData, tax_id_type: value })}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select ID type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ein">EIN (Employer Identification Number)</SelectItem>
                <SelectItem value="ssn">SSN (Social Security Number)</SelectItem>
                <SelectItem value="itin">ITIN (Individual Taxpayer Identification)</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="tax_id_number" className="text-white">
              Tax ID Number
            </Label>
            <Input
              id="tax_id_number"
              type="password"
              value={formData.tax_id_number}
              onChange={(e) => setFormData({ ...formData, tax_id_number: e.target.value })}
              placeholder="••••••••"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div>
            <Label htmlFor="business_license_number" className="text-white">
              Business License Number (if applicable)
            </Label>
            <Input
              id="business_license_number"
              value={formData.business_license_number}
              onChange={(e) => setFormData({ ...formData, business_license_number: e.target.value })}
              placeholder="License number"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div>
            <Label htmlFor="business_registered_state" className="text-white">
              State of Registration
            </Label>
            <Input
              id="business_registered_state"
              value={formData.business_registered_state}
              onChange={(e) => setFormData({ ...formData, business_registered_state: e.target.value })}
              placeholder="Where is your business registered?"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
        </div>
      </div>
    );
  }

  function Step8Banking() {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-serif text-white mb-2">Banking Information</h3>
          <p className="text-white/60">For receiving payments from sales</p>
        </div>

        <Alert className="bg-white/5 border-white/10">
          <AlertCircle className="h-4 w-4 text-white/60" />
          <AlertDescription className="text-white/60">
            Your banking information is encrypted and secure. We use it only to process payouts.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <Label htmlFor="bank_account_holder" className="text-white">
              Account Holder Name
            </Label>
            <Input
              id="bank_account_holder"
              value={formData.bank_account_holder}
              onChange={(e) => setFormData({ ...formData, bank_account_holder: e.target.value })}
              placeholder="Full name on account"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div>
            <Label htmlFor="bank_name" className="text-white">
              Bank Name
            </Label>
            <Input
              id="bank_name"
              value={formData.bank_name}
              onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
              placeholder="Your bank name"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div>
            <Label htmlFor="bank_account_type" className="text-white">
              Account Type
            </Label>
            <Select
              value={formData.bank_account_type}
              onValueChange={(value) => setFormData({ ...formData, bank_account_type: value })}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checking">Checking</SelectItem>
                <SelectItem value="savings">Savings</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="bank_routing_number" className="text-white">
              Routing Number
            </Label>
            <Input
              id="bank_routing_number"
              value={formData.bank_routing_number}
              onChange={(e) => setFormData({ ...formData, bank_routing_number: e.target.value })}
              placeholder="9-digit routing number"
              maxLength={9}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div>
            <Label htmlFor="bank_account_last4" className="text-white">
              Account Number (last 4 digits)
            </Label>
            <Input
              id="bank_account_last4"
              value={formData.bank_account_last4}
              onChange={(e) => setFormData({ ...formData, bank_account_last4: e.target.value })}
              placeholder="Last 4 digits"
              maxLength={4}
              className="bg-white/5 border-white/10 text-white"
            />
            <p className="text-xs text-white/40 mt-1">
              For security, we only store the last 4 digits
            </p>
          </div>
        </div>

        <Alert className="bg-rose-gold/10 border-rose-gold/30">
          <Sparkles className="h-4 w-4 text-rose-gold" />
          <AlertDescription className="text-white/80">
            Almost done! Review all steps and submit your application when ready.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
}
