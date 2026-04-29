import {
  Package,
  User,
  Heart,
  Settings,
  LogOut,
  Clock,
  Gift,
  Baby,
  Sparkles,
  Crown,
  Home,
  Bell,
  Calendar,
  MapPin,
  Globe,
  Shield,
  Bookmark,
  TrendingUp,
  Star,
  Award,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Eye,
  ShoppingBag,
  MessageCircle,
  Users,
  Layers,
  Palette,
  BookOpen,
  Send,
  Plus,
  ExternalLink,
  Briefcase,
  X,
  Save,
  Camera,
  Mail,
  Phone,
  Languages,
  Clock3,
  CreditCard as Edit,
  Trash2,
  Check,
  ArrowRight,
  LayoutDashboard,
} from "lucide-react";
import { CartItem, View } from "../App";
import { useState, useEffect } from "react";
import { useCustomerAuth } from "../contexts/CustomerAuthContext";
import { supabase } from "../lib/supabase";
import { NavigationHelper } from "../lib/navigationHelper";
import AuthModal from "./AuthModal";

interface UserAccountProps {
  cart: CartItem[];
  userPreferences: {
    viewedProducts: string[];
    searchHistory: string[];
    preferredCategories: string[];
  };
  onNavigate?: (view: View) => void;
}

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  photo_url: string | null;
  faith_tradition: string;
  country: string;
  timezone: string;
  language: string;
  verified: boolean;
  member_tier: string;
  member_since: string;
  loyalty_points: number;
}

interface PlannerProgress {
  id: string;
  planner_type: string;
  planner_title: string;
  total_steps: number;
  completed_steps: number;
  next_task: string;
  progress_percentage: number;
  status: string;
}

interface Order {
  id: string;
  order_number: string;
  product_name: string;
  product_image: string;
  artisan_name: string;
  region: string;
  total_amount: number;
  status: string;
  items_count: number;
  verified: boolean;
  order_date: string;
}

interface VendorBooking {
  id: string;
  booking_type: string;
  vendor_name: string;
  vendor_email?: string;
  vendor_phone?: string;
  vendor_website?: string;
  vendor_address?: string;
  service_package?: string;
  booking_amount?: number;
  booking_description?: string;
  booking_date: string;
  location: string;
  status: string;
}

interface UserNotification {
  id: string;
  notification_type: string;
  message: string;
  color: string;
  read: boolean;
  created_at: string;
}

interface CalendarEvent {
  id: string;
  event_name: string;
  event_date: string;
  event_type: string;
  color: string;
}

export default function UserAccount({
  cart,
  userPreferences,
  onNavigate,
}: UserAccountProps) {
  const { user: authUser, profile: customerProfile, loading: authLoading } = useCustomerAuth();
  const [authModal, setAuthModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [planners, setPlanners] = useState<PlannerProgress[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<VendorBooking[]>([]);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);
  const [showAllPlanners, setShowAllPlanners] = useState(false);
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] =
    useState<Order | null>(null);

  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    country: "",
    language: "",
    faith_tradition: "",
  });

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    console.log('[UserAccount] useEffect triggered:', { 
      hasAuthUser: !!authUser, 
      hasCustomerProfile: !!customerProfile, 
      authLoading,
      userEmail: authUser?.email 
    });
    loadDashboardData();
  }, [authUser, customerProfile]);

  const loadDashboardData = async () => {
    console.log('[UserAccount] loadDashboardData called:', { hasAuthUser: !!authUser, authUserEmail: authUser?.email });
    try {
      if (!authUser) {
        console.log('[UserAccount] No auth user, setting loading false');
        setLoading(false);
        return;
      }

      let profile: any = {};

      // Use customer profile from auth context if available
      if (customerProfile) {
        profile = {
          id: customerProfile.id,
          email: customerProfile.email,
          full_name: customerProfile.full_name || authUser.email?.split('@')[0] || 'User',
          country: customerProfile.country || '',
          language: customerProfile.language || 'en',
          faith_tradition: customerProfile.faith_tradition || 'Islam',
          member_tier: 'Premium',
          verified: false,
          photo_url: customerProfile.avatar_url || '',
          loyalty_points: 0,
        };
        setUserProfile(profile);
        setEditForm({
          full_name: profile.full_name,
          email: profile.email,
          country: profile.country,
          language: profile.language,
          faith_tradition: profile.faith_tradition,
        });
      } else {
        // Load or create user profile from users table
        let { data: userData } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .maybeSingle();

        if (!userData) {
          const { data: newProfile } = await supabase
            .from("users")
            .insert({
              id: authUser.id,
              email: authUser.email || "",
              full_name: authUser.user_metadata?.full_name || "User",
              role: "customer",
              status: "active",
            })
            .select()
            .single();
          userData = newProfile;
        }

        profile = {
          id: userData?.id || authUser.id,
          email: userData?.email || authUser.email || '',
          full_name: userData?.full_name || authUser.email?.split('@')[0] || 'User',
          country: userData?.country || '',
          language: userData?.language || 'en',
          faith_tradition: userData?.faith_tradition || 'Islam',
          member_tier: 'Premium',
          verified: userData?.verified || false,
          photo_url: userData?.avatar_url || '',
          loyalty_points: userData?.loyalty_points || 0,
        };
        setUserProfile(profile);
        setEditForm({
          full_name: profile.full_name,
          email: profile.email,
          country: profile.country,
          language: profile.language,
          faith_tradition: profile.faith_tradition,
        });
      }

      // Load planners (optional)
      try {
        const { data: plannersData } = await supabase
          .from("user_planner_progress")
          .select("*")
          .eq("user_id", authUser.id)
          .eq("status", "active")
          .order("created_at", { ascending: false });

        if (plannersData && plannersData.length > 0) {
          setPlanners(plannersData);
        }
      } catch (e) {
        console.log('Planners table not available');
      }

      // Load orders (optional)
      try {
        const { data: ordersData } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", authUser.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (ordersData) setOrders(ordersData);
      } catch (e) {
        console.log('Orders table not available');
      }

      // Load bookings (optional)
      try {
        const { data: bookingsData } = await supabase
          .from("user_vendor_bookings")
          .select("*")
          .eq("user_id", authUser.id)
          .order("booking_date", { ascending: true });

        if (bookingsData) setBookings(bookingsData);
      } catch (e) {
        console.log('Bookings table not available');
      }

      // Load notifications (optional)
      try {
        const { data: notificationsData } = await supabase
          .from("user_notifications")
          .select("*")
          .eq("user_id", authUser.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (notificationsData) setNotifications(notificationsData);
      } catch (e) {
        console.log('Notifications table not available');
      }

      // Load calendar events (optional)
      try {
        const faithTradition = profile.faith_tradition || 'Islam';
        const eventTypeMap: Record<string, string> = {
          Christian: "christian",
          Islam: "islam",
          Jewish: "jewish",
          Interfaith: "interfaith",
        };
        const eventType = eventTypeMap[faithTradition] || "interfaith";

        let eventsQuery = supabase.from("sacred_calendar_events").select("*");

        if (faithTradition !== "Interfaith") {
          eventsQuery = eventsQuery.eq("event_type", eventType);
        }

        const { data: eventsData } = await eventsQuery
          .gte("event_date", new Date().toISOString().split("T")[0])
          .order("event_date", { ascending: true })
          .limit(5);

        if (eventsData) setCalendarEvents(eventsData);
      } catch (e) {
        console.log('Calendar events table not available');
      }

      setLoading(false);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      onNavigate?.("home");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!event.target.files || !event.target.files[0] || !userProfile) return;

    const file = event.target.files[0];

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5242880) {
      alert("Image must be smaller than 5MB");
      return;
    }

    setUploadingPhoto(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Delete old photo if exists
      if (userProfile.photo_url) {
        const oldPath = userProfile.photo_url.split("/").pop();
        if (oldPath) {
          await supabase.storage
            .from("profile-photos")
            .remove([`${userProfile.id}/${oldPath}`]);
        }
      }

      // Upload new photo
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${userProfile.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-photos").getPublicUrl(filePath);

      // Update profile with new photo URL
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({ photo_url: publicUrl })
        .eq("id", userProfile.id);

      if (updateError) throw updateError;

      // Update local state
      setUserProfile({ ...userProfile, photo_url: publicUrl });
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("Failed to upload photo. Please try again.");
      setPhotoPreview(null);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!userProfile) return;

    try {
      const faithChanged =
        editForm.faith_tradition !== userProfile.faith_tradition;

      const { error } = await supabase
        .from("user_profiles")
        .update({
          full_name: editForm.full_name,
          country: editForm.country,
          language: editForm.language,
          faith_tradition: editForm.faith_tradition,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userProfile.id);

      if (!error) {
        if (faithChanged) {
          await supabase
            .from("user_planner_progress")
            .delete()
            .eq("user_id", userProfile.id);
          await supabase
            .from("user_vendor_bookings")
            .delete()
            .eq("user_id", userProfile.id);
          await supabase
            .from("user_notifications")
            .delete()
            .eq("user_id", userProfile.id);
        }

        setUserProfile({ ...userProfile, ...editForm });
        setShowEditProfile(false);
        loadDashboardData();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleMarkNotificationRead = async (notificationId: string) => {
    try {
      await supabase
        .from("user_notifications")
        .update({ read: true })
        .eq("id", notificationId);

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await supabase
        .from("user_notifications")
        .delete()
        .eq("id", notificationId);

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!selectedOrderForReview || !userProfile) return;

    try {
      await supabase.from("user_notifications").insert({
        user_id: userProfile.id,
        notification_type: "system",
        message: `Thank you for reviewing ${selectedOrderForReview.product_name}!`,
        color: "emerald",
        read: false,
      });

      setShowReviewModal(false);
      setSelectedOrderForReview(null);
      await loadDashboardData();
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const getPlannerIcon = (type: string) => {
    switch (type) {
      case "wedding":
        return Heart;
      case "pilgrimage":
        return MapPin;
      case "birth":
        return Baby;
      case "seasonal":
        return Sparkles;
      case "remembrance":
        return Crown;
      case "home-blessing":
        return Home;
      default:
        return Layers;
    }
  };

  const getPlannerColor = (type: string) => {
    switch (type) {
      case "wedding":
        return "rose";
      case "pilgrimage":
        return "teal";
      case "birth":
        return "blue";
      case "seasonal":
        return "purple";
      case "remembrance":
        return "amber";
      case "home-blessing":
        return "emerald";
      default:
        return "purple";
    }
  };

  const getPlannerRoute = (type: string) => {
    switch (type) {
      case "wedding":
        return "islamic-wedding";
      case "pilgrimage":
        return "umrah-planner";
      case "birth":
        return "islamic-welcome";
      case "seasonal":
        return "ramadan-eid";
      case "remembrance":
        return "islamic-remembrance";
      case "home-blessing":
        return "islamic-home-blessing";
      default:
        return "catalog";
    }
  };

  const getColorClasses = (color: string) => {
    const colors: Record<
      string,
      { bg: string; text: string; light: string; dark: string }
    > = {
      rose: {
        bg: "bg-rose-600",
        text: "text-rose-600",
        light: "bg-rose-50",
        dark: "bg-rose-100",
      },
      teal: {
        bg: "bg-teal-600",
        text: "text-teal-600",
        light: "bg-teal-50",
        dark: "bg-teal-100",
      },
      blue: {
        bg: "bg-blue-600",
        text: "text-blue-600",
        light: "bg-blue-50",
        dark: "bg-blue-100",
      },
      amber: {
        bg: "bg-amber-600",
        text: "text-amber-600",
        light: "bg-amber-50",
        dark: "bg-amber-100",
      },
      purple: {
        bg: "bg-purple-600",
        text: "text-purple-600",
        light: "bg-purple-50",
        dark: "bg-purple-100",
      },
      emerald: {
        bg: "bg-emerald-600",
        text: "text-emerald-600",
        light: "bg-emerald-50",
        dark: "bg-emerald-100",
      },
    };
    return colors[color] || colors.purple;
  };

  const calculateDaysAway = (dateString: string) => {
    const today = new Date();
    const eventDate = new Date(dateString);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "1d ago";
    return `${diffDays}d ago`;
  };

  const registries = [
    {
      name: "Wedding Registry",
      icon: Heart,
      count: 24,
      contributions: 18,
      color: "rose" as const,
      type: "wedding",
      faith: "shared",
    },
    {
      name: "Pilgrimage Registry",
      icon: MapPin,
      count: 12,
      contributions: 8,
      color: "teal" as const,
      type: "family-gift",
      faith: "shared",
      subtype: "pilgrimage",
    },
    {
      name: "New Birth",
      icon: Baby,
      count: 15,
      contributions: 10,
      color: "blue" as const,
      type: "celebration",
      faith: "shared",
      subtype: "welcome",
    },
    {
      name: "Home Blessing",
      icon: Home,
      count: 8,
      contributions: 5,
      color: "amber" as const,
      type: "home-blessing",
      faith: "shared",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-purple-950/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-purple-950/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Please sign in to view your dashboard
          </p>

          <div className="mt-4 flex items-center justify-center gap-3">
            {/* Sign In Button */}
            {authModal && (
              <AuthModal
                onClose={() => setAuthModal(false)}
                onSuccess={() => {
                  setAuthModal(false);
                  loadDashboardData();
                }}
              />
            )}
            <button
              onClick={() => setAuthModal(true)}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Sign In
            </button>

            {/* Go Home Button */}
            <button
              onClick={() => onNavigate?.("home")}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-purple-950/20">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome & Identity Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {userProfile.photo_url ? (
                    <img
                      src={userProfile.photo_url}
                      alt={userProfile.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    userProfile.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                  )}
                </div>
                {userProfile.verified && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-800">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Welcome back, {userProfile.full_name.split(" ")[0]}
                  </h1>
                  <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    {userProfile.member_tier}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Bookmark className="w-4 h-4" />
                    {userProfile.faith_tradition}
                  </span>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {userProfile.country}
                  </span>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <span className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    {userProfile.language}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate("dashboard")}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <LayoutDashboard className="w-4 h-4" />
                View Account
              </button>{" "}
              <button
                onClick={() => setShowEditProfile(true)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <User className="w-4 h-4" />
                Edit Profile
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button
                onClick={() => setShowNotificationsPanel(true)}
                className="relative p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
            </div>
          </div>

          {/* Smart Message Banner */}
          {calendarEvents.length > 0 &&
            calculateDaysAway(calendarEvents[0].event_date) <= 14 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-emerald-900 dark:text-emerald-100 font-semibold">
                      {calendarEvents[0].event_name} begins in{" "}
                      {calculateDaysAway(calendarEvents[0].event_date)} days
                    </p>
                    <p className="text-emerald-700 dark:text-emerald-300 text-sm">
                      Prepare with our curated {calendarEvents[0].event_name}{" "}
                      essentials
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate?.("catalog")}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium whitespace-nowrap"
                  >
                    Shop Now
                  </button>
                </div>
              </div>
            )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Main Content Area */}
          <div className="xl:col-span-8 space-y-6">
            {/* Active Planners */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Active Planners
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Your ongoing life celebrations
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAllPlanners(true)}
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium flex items-center gap-1"
                >
                  View All
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {planners.map((planner) => {
                  const Icon = getPlannerIcon(planner.planner_type);
                  const colorName = getPlannerColor(planner.planner_type);
                  const colors = getColorClasses(colorName);
                  const route = getPlannerRoute(planner.planner_type);

                  return (
                    <div
                      key={planner.id}
                      className="group border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                  {planner.planner_title}
                                </h3>
                                <span
                                  className={`px-2 py-0.5 ${colors.light} dark:${colors.dark} ${colors.text} text-xs font-semibold rounded capitalize`}
                                >
                                  {planner.planner_type}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Next: {planner.next_task}
                              </p>
                            </div>
                            <span className="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">
                              {planner.completed_steps}/{planner.total_steps}{" "}
                              steps
                            </span>
                          </div>

                          <div className="mb-3">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-gray-600 dark:text-gray-400">
                                Progress
                              </span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {planner.progress_percentage}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className={`${colors.bg} rounded-full h-2 transition-all`}
                                style={{
                                  width: `${planner.progress_percentage}%`,
                                }}
                              ></div>
                            </div>
                          </div>

                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => onNavigate?.(route)}
                              className={`px-4 py-2 ${colors.bg} text-white rounded-lg hover:opacity-90 transition-colors text-sm font-medium flex items-center gap-2`}
                            >
                              <ArrowRight className="w-4 h-4" />
                              Continue Planning
                            </button>
                            <button
                              onClick={() =>
                                onNavigate?.(
                                  NavigationHelper.buildViewString(
                                    NavigationHelper.navigateToCategory(
                                      planner.planner_type,
                                    ),
                                  ),
                                )
                              }
                              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium flex items-center gap-2"
                            >
                              <ShoppingBag className="w-4 h-4" />
                              Shop Products
                            </button>
                            <button
                              onClick={() =>
                                onNavigate?.(
                                  NavigationHelper.buildViewString(
                                    NavigationHelper.navigateToRegistry(
                                      planner.planner_type,
                                      undefined,
                                      "browse",
                                    ),
                                  ),
                                )
                              }
                              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium flex items-center gap-2"
                            >
                              <Gift className="w-4 h-4" />
                              Registry
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <button
                  onClick={() => onNavigate?.("discover")}
                  className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 hover:border-purple-400 dark:hover:border-purple-600 hover:text-purple-600 dark:hover:text-purple-400 transition-all flex items-center justify-center gap-2 font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Start New Planner
                </button>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Recent Orders
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Track your purchases
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate?.("tracking")}
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium flex items-center gap-1"
                >
                  View All
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="group border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={order.product_image}
                          alt={order.product_name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-gray-900 dark:text-white">
                                {order.product_name}
                              </h3>
                              {order.verified && (
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded text-xs font-medium">
                                  <Shield className="w-3 h-3" />
                                  Verified
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <Palette className="w-4 h-4" />
                                {order.artisan_name}
                              </span>
                              <span className="text-gray-300 dark:text-gray-600">
                                •
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {order.region}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap capitalize ${
                              order.status === "delivered"
                                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                            }`}
                          >
                            {order.status.replace("-", " ")}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              Order {order.order_number}
                            </span>
                            <span className="text-gray-300 dark:text-gray-600">
                              •
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {new Date(order.order_date).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" },
                              )}
                            </span>
                          </div>
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            ${order.total_amount.toFixed(2)}
                          </span>
                        </div>

                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() =>
                              onNavigate?.(
                                NavigationHelper.buildViewString(
                                  NavigationHelper.navigateToOrderTracking(
                                    order.id,
                                  ),
                                ),
                              )
                            }
                            className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                          <button
                            onClick={() =>
                              onNavigate?.(
                                NavigationHelper.buildViewString(
                                  NavigationHelper.navigateToOrderTracking(
                                    order.id,
                                  ),
                                ),
                              )
                            }
                            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium flex items-center gap-1"
                          >
                            <Package className="w-4 h-4" />
                            Track
                          </button>
                          <button
                            onClick={() => onNavigate?.("discover")}
                            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium flex items-center gap-1"
                          >
                            <ShoppingBag className="w-4 h-4" />
                            Buy Again
                          </button>
                          {order.status === "delivered" && (
                            <button
                              onClick={() => {
                                setSelectedOrderForReview(order);
                                setShowReviewModal(true);
                              }}
                              className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors text-sm font-medium flex items-center gap-1"
                            >
                              <Star className="w-4 h-4" />
                              Review
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gift Registries */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-lg flex items-center justify-center">
                    <Gift className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      My Registries
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Manage your gift registries
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate?.("universal-registry")}
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium flex items-center gap-1"
                >
                  Create New
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {registries.map((registry) => {
                  const Icon = registry.icon;
                  const colors = getColorClasses(registry.color);
                  return (
                    <button
                      key={registry.name}
                      onClick={() =>
                        onNavigate?.(
                          `universal-registry?type=${registry.type}&faith=${registry.faith}${registry.subtype ? `&subtype=${registry.subtype}` : ""}`,
                        )
                      }
                      className="group border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-all text-left"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className={`w-10 h-10 ${colors.light} dark:${colors.dark} rounded-lg flex items-center justify-center flex-shrink-0`}
                        >
                          <Icon className={`w-5 h-5 ${colors.text}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                            {registry.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {registry.count} items • {registry.contributions}{" "}
                            contributions
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className={`${colors.bg} rounded-full h-1.5`}
                          style={{
                            width: `${(registry.contributions / registry.count) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-4 space-y-6">
            {/* Sacred Calendar */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Sacred Calendar
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Upcoming events
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {calendarEvents.slice(0, 3).map((event) => {
                  const colors = getColorClasses(event.color);
                  const daysAway = calculateDaysAway(event.event_date);
                  return (
                    <div
                      key={event.id}
                      className={`${colors.light} dark:${colors.dark} rounded-xl p-3`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 ${colors.bg} rounded-lg flex flex-col items-center justify-center text-white flex-shrink-0`}
                        >
                          <span className="text-xs font-medium">
                            {new Date(event.event_date).toLocaleDateString(
                              "en-US",
                              { month: "short" },
                            )}
                          </span>
                          <span className="text-lg font-bold">
                            {new Date(event.event_date).getDate()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-bold ${colors.text} text-sm`}>
                            {event.event_name}
                          </h3>
                          <p className={`text-xs ${colors.text} opacity-80`}>
                            {daysAway} days away
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setShowFullCalendar(true)}
                className="w-full mt-4 py-2 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors text-sm font-medium"
              >
                View Full Calendar
              </button>
            </div>

            {/* Vendor Bookings */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Service Bookings
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Your appointments
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-teal-300 dark:hover:border-teal-700 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">
                            {booking.vendor_name}
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 capitalize mt-1">
                            {booking.booking_type}
                          </p>
                          {booking.service_package && (
                            <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">
                              {booking.service_package}
                            </p>
                          )}
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded capitalize ${
                            booking.status === "confirmed"
                              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                              : booking.status === "pending"
                                ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                                : booking.status === "completed"
                                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                  : "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(booking.booking_date).toLocaleDateString(
                            "en-US",
                            { month: "long", day: "numeric", year: "numeric" },
                          )}
                        </div>
                        {booking.location && (
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <MapPin className="w-3.5 h-3.5" />
                            {booking.location}
                          </div>
                        )}
                        {booking.booking_amount && (
                          <div className="flex items-center gap-2 text-xs text-gray-900 dark:text-white font-semibold">
                            <span className="text-teal-600 dark:text-teal-400">
                              Amount:
                            </span>
                            ${booking.booking_amount.toFixed(2)}
                          </div>
                        )}
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3 space-y-1.5">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-2">
                          Vendor Contact
                        </p>
                        {booking.vendor_email && (
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <Mail className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                            <a
                              href={`mailto:${booking.vendor_email}`}
                              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                            >
                              {booking.vendor_email}
                            </a>
                          </div>
                        )}
                        {booking.vendor_phone && (
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <Phone className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                            <a
                              href={`tel:${booking.vendor_phone}`}
                              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                            >
                              {booking.vendor_phone}
                            </a>
                          </div>
                        )}
                        {booking.vendor_website && (
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <Globe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                            <a
                              href={booking.vendor_website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                            >
                              Visit Website
                            </a>
                          </div>
                        )}
                        {booking.vendor_address && (
                          <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 mt-0.5 flex-shrink-0" />
                            <span>{booking.vendor_address}</span>
                          </div>
                        )}
                      </div>

                      {booking.booking_description && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {booking.booking_description}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No service bookings yet
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Your wedding and ceremony service appointments will appear
                      here
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Notifications
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Recent updates
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {notifications.map((notif) => {
                  const colors = getColorClasses(notif.color);
                  return (
                    <div
                      key={notif.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div
                        className={`w-2 h-2 ${colors.bg} rounded-full mt-2 flex-shrink-0`}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {getTimeAgo(notif.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setShowNotificationsPanel(true)}
                className="w-full mt-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-sm font-medium"
              >
                View All Notifications
              </button>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-8 h-8" />
                <div>
                  <h2 className="text-lg font-bold">Premium Rewards</h2>
                  <p className="text-purple-100 text-sm">
                    Your journey progress
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Points Earned</span>
                    <span className="font-bold text-xl">
                      {userProfile.loyalty_points}
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className="bg-white rounded-full h-2"
                      style={{
                        width: `${(userProfile.loyalty_points % 1000) / 10}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-purple-100 text-xs mt-1">
                    {1000 - (userProfile.loyalty_points % 1000)} points to next
                    reward
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/20">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{orders.length}</p>
                    <p className="text-purple-100 text-xs">Orders Placed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{planners.length}</p>
                    <p className="text-purple-100 text-xs">Active Planners</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => onNavigate?.("wishlist")}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                >
                  <Heart className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white font-medium">
                    Wishlist
                  </span>
                </button>
                <button
                  onClick={() => onNavigate?.("traditions")}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                >
                  <BookOpen className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white font-medium">
                    Tradition Guides
                  </span>
                </button>
                <button
                  onClick={() => onNavigate?.("catalog")}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                >
                  <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white font-medium">
                    Browse Artisans
                  </span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left text-red-600 dark:text-red-400"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Edit Profile
              </h2>
              <button
                onClick={() => setShowEditProfile(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Profile Photo
                </label>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                      {photoPreview || userProfile?.photo_url ? (
                        <img
                          src={photoPreview || userProfile?.photo_url || ""}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-12 h-12 text-white" />
                      )}
                    </div>
                    {uploadingPhoto && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      id="photo-upload"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploadingPhoto}
                    />
                    <label
                      htmlFor="photo-upload"
                      className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer text-sm font-medium ${
                        uploadingPhoto ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <Camera className="w-4 h-4" />
                      {uploadingPhoto ? "Uploading..." : "Change Photo"}
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      JPG, PNG or GIF. Max 5MB.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, full_name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Faith Tradition
                </label>
                <select
                  value={editForm.faith_tradition}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      faith_tradition: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="Islam">Islam</option>
                  <option value="Christian">Christian</option>
                  <option value="Jewish">Jewish</option>
                  <option value="Interfaith">Interfaith</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={editForm.country}
                  onChange={(e) =>
                    setEditForm({ ...editForm, country: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Language
                </label>
                <select
                  value={editForm.language}
                  onChange={(e) =>
                    setEditForm({ ...editForm, language: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="English">English</option>
                  <option value="Arabic">Arabic</option>
                  <option value="Hebrew">Hebrew</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                </select>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-6 flex gap-3">
              <button
                onClick={() => setShowEditProfile(false)}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProfile}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Settings
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Notification Preferences
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Order Updates
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Get notified about your order status
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-5 h-5 text-purple-600 rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Sacred Events
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Reminders for upcoming religious events
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-5 h-5 text-purple-600 rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Planner Updates
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Task reminders for your active planners
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-5 h-5 text-purple-600 rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Marketing Emails
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Special offers and new arrivals
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-purple-600 rounded"
                    />
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Privacy
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Profile Visibility
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Make your profile visible to other users
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-purple-600 rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Public Registries
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Allow others to view your gift registries
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-5 h-5 text-purple-600 rounded"
                    />
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Account
                </h3>
                <button className="w-full p-4 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors font-medium">
                  Delete Account
                </button>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-6">
              <button
                onClick={() => setShowSettings(false)}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Panel */}
      {showNotificationsPanel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Notifications
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {notifications.filter((n) => !n.read).length} unread
                </p>
              </div>
              <button
                onClick={() => setShowNotificationsPanel(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              {notifications.map((notif) => {
                const colors = getColorClasses(notif.color);
                return (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-xl border ${notif.read ? "border-gray-200 dark:border-gray-700" : "border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20"}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-3 h-3 ${colors.bg} rounded-full mt-1.5 flex-shrink-0`}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {notif.message}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {getTimeAgo(notif.created_at)}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {!notif.read && (
                          <button
                            onClick={() => handleMarkNotificationRead(notif.id)}
                            className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteNotification(notif.id)}
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {notifications.length === 0 && (
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No notifications yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View All Planners Modal */}
      {showAllPlanners && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                All Planners
              </h2>
              <button
                onClick={() => setShowAllPlanners(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {planners.map((planner) => {
                const Icon = getPlannerIcon(planner.planner_type);
                const colorName = getPlannerColor(planner.planner_type);
                const colors = getColorClasses(colorName);
                const route = getPlannerRoute(planner.planner_type);

                return (
                  <div
                    key={planner.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {planner.planner_title}
                              </h3>
                              <span
                                className={`px-2 py-0.5 ${colors.light} dark:${colors.dark} ${colors.text} text-xs font-semibold rounded capitalize`}
                              >
                                {planner.planner_type}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Next: {planner.next_task}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">
                            {planner.completed_steps}/{planner.total_steps}
                          </span>
                        </div>

                        <div className="mb-3">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`${colors.bg} rounded-full h-2`}
                              style={{
                                width: `${planner.progress_percentage}%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setShowAllPlanners(false);
                            onNavigate?.(route);
                          }}
                          className={`px-4 py-2 ${colors.bg} text-white rounded-lg hover:opacity-90 transition-colors text-sm font-medium`}
                        >
                          Continue Planning
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedOrderForReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Write a Review
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {selectedOrderForReview.product_name}
              </p>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Review
                </label>
                <textarea
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Share your thoughts about this product..."
                ></textarea>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedOrderForReview(null);
                }}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmitReview(5, "Great product!")}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Calendar Modal */}
      {showFullCalendar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Sacred Calendar
              </h2>
              <button
                onClick={() => setShowFullCalendar(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {calendarEvents.map((event) => {
                  const colors = getColorClasses(event.color);
                  const daysAway = calculateDaysAway(event.event_date);
                  return (
                    <div
                      key={event.id}
                      className={`${colors.light} dark:${colors.dark} rounded-xl p-4`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-16 h-16 ${colors.bg} rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0 shadow-sm`}
                        >
                          <span className="text-xs font-medium">
                            {new Date(event.event_date).toLocaleDateString(
                              "en-US",
                              { month: "short" },
                            )}
                          </span>
                          <span className="text-2xl font-bold">
                            {new Date(event.event_date).getDate()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-bold ${colors.text} text-lg`}>
                            {event.event_name}
                          </h3>
                          <p className={`text-sm ${colors.text} opacity-80`}>
                            {daysAway > 0
                              ? `${daysAway} days away`
                              : daysAway === 0
                                ? "Today"
                                : "Past"}
                          </p>
                          <p
                            className={`text-xs ${colors.text} opacity-70 capitalize mt-1`}
                          >
                            {event.event_type}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
