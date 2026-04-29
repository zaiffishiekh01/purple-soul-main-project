import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ShoppingCart,
  User,
  Heart,
  Search,
  Menu,
  X,
  Star,
  TrendingUp,
  Zap,
  ChevronRight,
  Moon,
  Sun,
  GitCompare,
  Bell,
  ChevronDown,
  Home,
} from "lucide-react";
import { useTheme } from "./contexts/ThemeContext";
import { saveOrder } from "./lib/orderHelper";
import { useViewSync, useViewNavigate } from "./router/useViewRouter";
import ProductCatalog from "./components/ProductCatalog";
import ProductDetail from "./components/ProductDetail";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import UserAccount from "./components/UserAccount";
import WishlistManager from "./components/WishlistManager";
import Hero from "./components/Hero";
import QuickView from "./components/QuickView";
import ComparisonModal from "./components/ComparisonModal";
import SearchAutocomplete from "./components/SearchAutocomplete";
import NotificationCenter from "./components/NotificationCenter";
import MegaMenu from "./components/MegaMenu";
import MobileMenu from "./components/MobileMenu";
import GiftFinder from "./components/GiftFinder";
import TraditionGuides from "./components/TraditionGuides";
import DiscoverHub from "./components/DiscoverHub";
import CartPage from "./components/CartPage";
import OriginPage from "./components/OriginPage";
import CraftTypePage from "./components/CraftTypePage";
import MaterialPage from "./components/MaterialPage";
import CollectionPage from "./components/CollectionPage";
import ShippingAddress from "./components/ShippingAddress";
import PaymentMethod from "./components/PaymentMethod";
import OrderReview from "./components/OrderReview";
import OrderConfirmation from "./components/OrderConfirmation";
import OrderTracking from "./components/OrderTracking";
import CheckoutCustomer from "./components/CheckoutCustomer";
import CheckoutAddress from "./components/CheckoutAddress";
import CheckoutDelivery from "./components/CheckoutDelivery";
import CheckoutPayment from "./components/CheckoutPayment";
import OrderDetailPage from "./components/OrderDetailPage";
import PilgrimageEssentials from "./components/PilgrimageEssentials";
import HajjPlanner from "./components/HajjPlanner";
import UmrahPlanner from "./components/UmrahPlanner";
import ChristianPilgrimagePlanner from "./components/ChristianPilgrimagePlanner";
import JewishPilgrimagePlanner from "./components/JewishPilgrimagePlanner";
import UniversalPilgrimagePlanner from "./components/UniversalPilgrimagePlanner";
import IslamicWeddingPlanner from "./components/IslamicWeddingPlanner";
import ChristianWeddingPlanner from "./components/ChristianWeddingPlanner";
import JewishWeddingPlanner from "./components/JewishWeddingPlanner";
import SharedWeddingPlanner from "./components/SharedWeddingPlanner";
import WeddingGiftPlanner from "./components/WeddingGiftPlanner";
import NewHomeBlessingPlanner from "./components/NewHomeBlessingPlanner";
import WeddingProductCatalog from "./components/WeddingProductCatalog";
import WeddingRegistry from "./components/WeddingRegistry";
import UniversalRegistry from "./components/UniversalRegistry";
import ProductResearchImporter from "./components/ProductResearchImporter";
import ProductSourceManager from "./components/ProductSourceManager";
import WelcomeProductCatalog from "./components/WelcomeProductCatalog";
import AccountPage from "./components/account/AccountPage";
import ServicesPage from "./components/account/ServicesPage";
import AuthModal from "./components/AuthModal";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useCustomerAuth } from "./contexts/CustomerAuthContext";
import UserAccountWrapper from "./components/UserAccountWrapper";

// Vendor Portal
import { VendorLayout } from "./components/dashboard/VendorLayout";
import VendorDashboardPage from "./components/vendor/VendorDashboardPage";
import VendorOrdersPage from "./components/vendor/VendorOrdersPage";
import VendorProductsPage from "./components/vendor/VendorProductsPage";
import VendorInventoryPage from "./components/vendor/VendorInventoryPage";
import VendorShippingPage from "./components/vendor/VendorShippingPage";
import VendorReturnsPage from "./components/vendor/VendorReturnsPage";
import VendorFinancePage from "./components/vendor/VendorFinancePage";
import VendorAnalyticsPage from "./components/vendor/VendorAnalyticsPage";
import VendorProfilePage from "./components/vendor/VendorProfilePage";
import VendorNotificationsPage from "./components/vendor/VendorNotificationsPage";
import VendorGuidelinesPage from "./components/vendor/VendorGuidelinesPage";
import VendorSupportPage from "./components/vendor/VendorSupportPage";

// Admin Portal
import { AdminLayout } from "./components/dashboard/AdminLayout";
import AdminOverviewPage from "./components/admin/AdminOverviewPage";
import AdminAdminsPage from "./components/admin/AdminAdminsPage";
import AdminVendorsPage from "./components/admin/AdminVendorsPage";
import AdminCustomersPage from "./components/admin/AdminCustomersPage";
import AdminOrdersPage from "./components/admin/AdminOrdersPage";
import AdminProductsPage from "./components/admin/AdminProductsPage";
import AdminInventoryPage from "./components/admin/AdminInventoryPage";
import AdminCategoriesPage from "./components/admin/AdminCategoriesPage";
import AdminShippingPage from "./components/admin/AdminShippingPage";
import AdminReturnsPage from "./components/admin/AdminReturnsPage";
import AdminPricingPage from "./components/admin/AdminPricingPage";
import AdminFinancePage from "./components/admin/AdminFinancePage";
import AdminPayoutsPage from "./components/admin/AdminPayoutsPage";
import AdminAnalyticsPage from "./components/admin/AdminAnalyticsPage";
import AdminSettingsPage from "./components/admin/AdminSettingsPage";

// Birth & Welcome Planners
import IslamicWelcomePlanner from "./components/IslamicWelcomePlanner";
import ChristianWelcomePlanner from "./components/ChristianWelcomePlanner";
import JewishWelcomePlanner from "./components/JewishWelcomePlanner";
import SharedWelcomePlanner from "./components/SharedWelcomePlanner";

// Seasonal Celebration Planners
import RamadanEidPlanner from "./components/RamadanEidPlanner";
import ChristmasAdventPlanner from "./components/ChristmasAdventPlanner";
import HanukkahPlanner from "./components/HanukkahPlanner";
import SharedSeasonalPlanner from "./components/SharedSeasonalPlanner";
import SeasonalProductCatalog from "./components/SeasonalProductCatalog";

// Remembrance Planners
import IslamicRemembrancePlanner from "./components/IslamicRemembrancePlanner";
import ChristianRemembrancePlanner from "./components/ChristianRemembrancePlanner";
import JewishRemembrancePlanner from "./components/JewishRemembrancePlanner";
import SharedRemembrancePlanner from "./components/SharedRemembrancePlanner";
import RemembranceProductCatalog from "./components/RemembranceProductCatalog";

// Home Blessing Planners
import IslamicHomeBlessingPlanner from "./components/IslamicHomeBlessingPlanner";
import ChristianHomeBlessingPlanner from "./components/ChristianHomeBlessingPlanner";
import JewishHomeBlessingPlanner from "./components/JewishHomeBlessingPlanner";
import SharedHomeBlessingPlanner from "./components/SharedHomeBlessingPlanner";
import HomeBlessingProductCatalog from "./components/HomeBlessingProductCatalog";

import { mockProducts } from "./data/products";
import { supabase } from "./lib/supabase";
import UnifiedProductCatalog from "./components/UnifiedProductCatalog";
import { NavigationHelper } from "./lib/navigationHelper";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  images: string[];
  rating: number;
  reviews: number;
  inStock: boolean;
  stock?: number;
  tags: string[];
  colors?: string[];
  sizes?: string[];
  trending?: boolean;
  featured?: boolean;
  viewCount?: number;
  purchaseCount?: number;
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  bundleId?: string;
  bundleDiscount?: number;
}

export interface Notification {
  id: string;
  type: "price_drop" | "back_in_stock" | "new_arrival" | "sale";
  productId: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export type View =
  | "home"
  | "catalog"
  | "product"
  | "cart"
  | "checkout"
  | "account"
  | "dashboard"
  | "wishlist"
  | "gifts"
  | "traditions"
  | "discover"
  | "discover-christian"
  | "discover-jewish"
  | "discover-islamic"
  | "discover-interfaith"
  | "cart-page"
  | "shipping"
  | "payment"
  | "review"
  | "confirmation"
  | "tracking"
  | "origin"
  | "craft-type"
  | "material"
  | "collection"
  | "pilgrimage"
  | "hajj-planner"
  | "umrah-planner"
  | "christian-planner"
  | "jewish-planner"
  | "universal-planner"
  | "wedding-products"
  | "islamic-wedding"
  | "christian-wedding"
  | "jewish-wedding"
  | "shared-wedding"
  | "wedding-gifts"
  | "home-blessing"
  | "wedding-registry"
  | "wedding-registry-create"
  | "wedding-registry-manage"
  | "celebration-registry"
  | "remembrance-registry"
  | "home-blessing-registry"
  | "family-gift-registry"
  | "welcome-products"
  | "islamic-welcome"
  | "christian-welcome"
  | "jewish-welcome"
  | "shared-welcome"
  | "ramadan-eid"
  | "christmas-advent"
  | "hanukkah"
  | "shared-seasonal"
  | "seasonal-products"
  | "islamic-remembrance"
  | "christian-remembrance"
  | "jewish-remembrance"
  | "shared-remembrance"
  | "remembrance-products"
  | "islamic-home-blessing"
  | "christian-home-blessing"
  | "jewish-home-blessing"
  | "shared-home-blessing"
  | "home-blessing-products"
  | "checkout-customer"
  | "checkout-address"
  | "checkout-delivery"
  | "checkout-payment"
  | "order-detail"
  | "account-page"
  | "account-dashboard"
  | "services"
  | "product-research"
  | "product-sources"
  | "vendor-dashboard" | "vendor-orders" | "vendor-products" | "vendor-inventory"
  | "vendor-shipping" | "vendor-returns" | "vendor-finance" | "vendor-analytics"
  | "vendor-profile" | "vendor-notifications" | "vendor-guidelines" | "vendor-support"
  | "admin-overview" | "admin-admins" | "admin-vendors" | "admin-customers"
  | "admin-orders" | "admin-products" | "admin-inventory" | "admin-categories"
  | "admin-shipping" | "admin-returns" | "admin-pricing" | "admin-finance"
  | "admin-payouts" | "admin-analytics" | "admin-settings";

function App() {
  const { theme, toggleTheme } = useTheme();
  const [currentViewSynced, currentViewRouterParams] = useViewSync();
  const navigateView = useViewNavigate();
  const [searchParams] = useSearchParams();

  // Derive currentView directly from router (no useState lag)
  const currentView = (currentViewSynced || "home") as View;
  const viewParams = currentViewRouterParams;

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrigin, setSelectedOrigin] = useState<string>("");
  const [selectedCraftType, setSelectedCraftType] = useState<string>("");
  const [selectedMaterial, setSelectedMaterial] = useState<string>("");
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [completedOrderItems, setCompletedOrderItems] = useState<CartItem[]>(
    [],
  );
  const [lastOrderNumber, setLastOrderNumber] = useState<string>("");
  const [checkoutStep, setCheckoutStep] = useState<
    "cart" | "shipping" | "payment" | "review" | "confirmation"
  >("cart");
  const [shippingCompleted, setShippingCompleted] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null,
  );
  const [comparisonProducts, setComparisonProducts] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [userPreferences, setUserPreferences] = useState({
    viewedProducts: [] as string[],
    searchHistory: [] as string[],
    preferredCategories: [] as string[],
  });
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [authModal, setAuthModal] = useState(false);
  const { isAuthenticated, loading: authLoading } = useCustomerAuth();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUserId(session?.user?.id || null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Set selected values when route params change
  useEffect(() => {
    if (viewParams.slug) setSelectedOrigin(viewParams.slug);
    if (viewParams.type) setSelectedCraftType(viewParams.type);
    if (viewParams.material) setSelectedMaterial(viewParams.material);
    if (viewParams.name) setSelectedCollection(viewParams.name);
    if (viewParams.id) {
      const product = mockProducts.find((p) => p.id === viewParams.id);
      if (product) setSelectedProduct(product);
    }
  }, [viewParams.slug, viewParams.type, viewParams.material, viewParams.name, viewParams.id]);

  const changeView = (view: View) => {
    navigateView(view);
  };

  const addToCart = (
    product: Product,
    selectedColor?: string,
    selectedSize?: string,
    bundleId?: string,
    bundleDiscount?: number,
  ) => {
    setCart((prev) => {
      const existingItem = prev.find(
        (item) =>
          item.id === product.id &&
          item.selectedColor === selectedColor &&
          item.selectedSize === selectedSize &&
          item.bundleId === bundleId,
      );

      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id &&
          item.selectedColor === selectedColor &&
          item.selectedSize === selectedSize &&
          item.bundleId === bundleId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [
        ...prev,
        {
          ...product,
          quantity: 1,
          selectedColor,
          selectedSize,
          bundleId,
          bundleDiscount,
        },
      ];
    });
  };

  const buyNow = (
    product: Product,
    selectedColor?: string,
    selectedSize?: string,
    quantity: number = 1,
  ) => {
    setCart((prev) => {
      const existingItem = prev.find(
        (item) =>
          item.id === product.id &&
          item.selectedColor === selectedColor &&
          item.selectedSize === selectedSize,
      );

      if (existingItem) {
        const updatedCart = prev.map((item) =>
          item.id === product.id &&
          item.selectedColor === selectedColor &&
          item.selectedSize === selectedSize
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
        setCart(updatedCart);
        return updatedCart;
      }

      const newCart = [...prev, { ...product, quantity, selectedColor, selectedSize }];
      setCart(newCart);
      return newCart;
    });

    changeView("checkout-customer");
  };

  const removeFromCart = (
    productId: string,
    selectedColor?: string,
    selectedSize?: string,
    bundleId?: string,
  ) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.id === productId &&
            item.selectedColor === selectedColor &&
            item.selectedSize === selectedSize &&
            item.bundleId === bundleId
          ),
      ),
    );
  };

  const updateCartQuantity = (
    productId: string,
    quantity: number,
    selectedColor?: string,
    selectedSize?: string,
    bundleId?: string,
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedColor, selectedSize, bundleId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (
          item.id === productId &&
          item.selectedColor === selectedColor &&
          item.selectedSize === selectedSize &&
          item.bundleId === bundleId
        ) {
          const maxStock = item.stock || 999;
          const validatedQuantity = Math.min(quantity, maxStock);

          const originalQuantity = bundleId ? 1 : item.quantity;
          if (validatedQuantity !== originalQuantity && bundleId) {
            return {
              ...item,
              quantity: validatedQuantity,
              bundleId: undefined,
              bundleDiscount: undefined,
            };
          }

          return { ...item, quantity: validatedQuantity };
        }
        return item;
      }),
    );
  };

  const toggleWishlist = (productId: string) => {
    const isAdding = !wishlist.includes(productId);
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );

    if (isAdding) {
      setNotifications((prev) => [
        {
          id: Date.now().toString(),
          type: "price_drop",
          productId,
          message: "Added to wishlist! We'll notify you of price drops.",
          timestamp: new Date(),
          read: false,
        },
        ...prev,
      ]);
    }
  };

  const viewProduct = (product: Product) => {
    setSelectedProduct(product);
    navigateView("product", { id: product.id });

    setUserPreferences((prev) => ({
      ...prev,
      viewedProducts: [
        product.id,
        ...prev.viewedProducts.filter((id) => id !== product.id),
      ].slice(0, 20),
      preferredCategories: [
        ...new Set([product.category, ...prev.preferredCategories]),
      ].slice(0, 5),
    }));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setUserPreferences((prev) => ({
        ...prev,
        searchHistory: [
          query,
          ...prev.searchHistory.filter((q) => q !== query),
        ].slice(0, 10),
      }));
      changeView("catalog");
    }
  };

  const toggleComparison = (productId: string) => {
    setComparisonProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : prev.length < 4
          ? [...prev, productId]
          : prev,
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-page transition-colors duration-300">
      <header className="sticky top-0 z-50 border-b border-default shadow-theme-md transition-colors duration-300 bg-gradient-to-r from-purple-600 to-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <button
              onClick={() => changeView("home")}
              className="flex items-center gap-2 text-xl font-bold text-white shrink-0"
            >
              <Zap className="w-8 h-8 text-white" />
              <span className="hidden sm:inline">Purple Soul Shop</span>
            </button>

            <nav className="hidden lg:flex items-center gap-6">
              <button
                onClick={() => changeView("home")}
                className={`transition-colors ${
                  currentView === "home"
                    ? "text-purple-200"
                    : "text-white hover:text-purple-200"
                }`}
              >
                <Home className="w-5 h-5" />
              </button>

              <div className="relative group">
                <button
                  onClick={() => changeView("catalog")}
                  className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                    currentView === "catalog"
                      ? "text-purple-200"
                      : "text-white hover:text-purple-200"
                  }`}
                >
                  Shop
                  <ChevronDown className="w-4 h-4" />
                </button>
                <MegaMenu
                  onNavigate={(view, category) => {
                    if (view === "product") {
                      const product = mockProducts.find(
                        (p) => p.id === category,
                      );
                      if (product) viewProduct(product);
                    } else {
                      changeView(view as View);
                      if (category) {
                        setSearchQuery(category);
                      }
                    }
                  }}
                  darkMode={theme === "dark"}
                />
              </div>

              <button
                onClick={() => changeView("gifts")}
                className={`text-sm font-medium transition-colors ${
                  currentView === "gifts"
                    ? "text-purple-200"
                    : "text-white hover:text-purple-200"
                }`}
              >
                Gift Finder
              </button>

              <button
                onClick={() => changeView("traditions")}
                className={`text-sm font-medium transition-colors ${
                  currentView === "traditions"
                    ? "text-purple-200"
                    : "text-white hover:text-purple-200"
                }`}
              >
                Traditions
              </button>

              <div className="relative group">
                <button
                  onClick={() => changeView("discover")}
                  className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                    currentView === "discover" ||
                    currentView === "discover-christian" ||
                    currentView === "discover-jewish" ||
                    currentView === "discover-islamic" ||
                    currentView === "discover-interfaith"
                      ? "text-purple-200"
                      : "text-white hover:text-purple-200"
                  }`}
                >
                  Discover
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute top-full left-0 mt-2 w-56 rounded-xl shadow-theme-xl border border-default opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 bg-surface">
                  <div className="p-2">
                    <button
                      onClick={() => changeView("discover-christian")}
                      className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-primary hover:bg-purple-50 hover:text-purple-700 transition-all"
                    >
                      Christian
                    </button>
                    <button
                      onClick={() => changeView("discover-jewish")}
                      className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-primary hover:bg-purple-50 hover:text-purple-700 transition-all"
                    >
                      Jewish
                    </button>
                    <button
                      onClick={() => changeView("discover-islamic")}
                      className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-primary hover:bg-purple-50 hover:text-purple-700 transition-all"
                    >
                      Islamic
                    </button>
                    <button
                      onClick={() => changeView("discover-interfaith")}
                      className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-primary hover:bg-purple-50 hover:text-purple-700 transition-all"
                    >
                      Interfaith & Universal
                    </button>
                    <div className="border-t border-default my-2"></div>
                    <button
                      onClick={() => changeView("pilgrimage")}
                      className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-primary hover:bg-purple-50 hover:text-purple-700 transition-all"
                    >
                      Shop Pilgrimage Essentials
                    </button>
                    <button
                      onClick={() => changeView("wedding-products")}
                      className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-primary hover:bg-purple-50 hover:text-purple-700 transition-all"
                    >
                      Shop Wedding Essentials
                    </button>
                    <button
                      onClick={() => changeView("welcome-products")}
                      className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-primary hover:bg-purple-50 hover:text-purple-700 transition-all"
                    >
                      Shop New Birth Essentials
                    </button>
                    <button
                      onClick={() => changeView("seasonal-products")}
                      className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-primary hover:bg-purple-50 hover:text-purple-700 transition-all"
                    >
                      Shop Celebrations Essentials
                    </button>
                    <button
                      onClick={() => changeView("remembrance-products")}
                      className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-primary hover:bg-purple-50 hover:text-purple-700 transition-all"
                    >
                      Shop Reflections Essentials
                    </button>
                    <button
                      onClick={() => changeView("home-blessing-products")}
                      className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-primary hover:bg-purple-50 hover:text-purple-700 transition-all"
                    >
                      Shop Home Blessing Essentials
                    </button>
                  </div>
                </div>
              </div>
            </nav>

            <div className="hidden md:flex items-center flex-1 max-w-md">
              <SearchAutocomplete
                value={searchQuery}
                onChange={handleSearch}
                searchHistory={userPreferences.searchHistory}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 transition-colors text-white hover:text-purple-200"
                title={theme === "dark" ? "Light mode" : "Dark mode"}
              >
                {theme === "dark" ? (
                  <Sun className="w-6 h-6" />
                ) : (
                  <Moon className="w-6 h-6" />
                )}
              </button>

              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 transition-colors text-white hover:text-purple-200"
                title="Notifications"
              >
                <Bell className="w-6 h-6" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              <button
                onClick={() => setShowComparison(true)}
                className="relative p-2 transition-colors text-white hover:text-purple-200"
                title="Compare products"
              >
                <GitCompare className="w-6 h-6" />
                {comparisonProducts.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {comparisonProducts.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => changeView("wishlist")}
                className="relative p-2 transition-colors text-white hover:text-purple-200"
                title="Wishlist"
              >
                <Heart className="w-6 h-6" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => changeView("cart-page")}
                className="relative p-2 transition-colors text-white hover:text-purple-200"
                title="Shopping cart"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => changeView("account-page")}
                className="p-2 transition-colors text-white hover:text-purple-200"
                title="Account"
              >
                <User className="w-6 h-6" />
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-white"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {currentView === "home" && (
          <Hero
            onShopNow={() => changeView("catalog")}
            onViewProduct={viewProduct}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onAddToCart={addToCart}
            onNavigate={(section) => changeView(section as View)}
          />
        )}
        {currentView === "catalog" && (
          <ProductCatalog
            searchQuery={searchQuery}
            onViewProduct={viewProduct}
            onQuickView={setQuickViewProduct}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onAddToCart={addToCart}
            userPreferences={userPreferences}
            comparisonProducts={comparisonProducts}
            onToggleComparison={toggleComparison}
            onViewOrigin={(origin) => {
              setSelectedOrigin(origin);
              changeView("origin");
            }}
            onViewCraftType={(craftType) => {
              setSelectedCraftType(craftType);
              changeView("craft-type");
            }}
            onViewMaterial={(material) => {
              setSelectedMaterial(material);
              changeView("material");
            }}
            onViewCollection={(collection) => {
              setSelectedCollection(collection);
              changeView("collection");
            }}
            viewMode="shop"
          />
        )}
        {currentView.startsWith("catalog?") &&
          (() => {
            const navState = NavigationHelper.parseViewString(currentView);
            return (
              <UnifiedProductCatalog
                category={navState.params?.category}
                subcategory={navState.params?.subcategory}
                faithTradition={navState.params?.faithTradition}
                searchQuery={navState.params?.search}
                onAddToCart={addToCart}
                onNavigate={(view) => changeView(view as View)}
                onViewProduct={viewProduct}
              />
            );
          })()}
        {currentView === "origin" && (selectedOrigin || viewParams.slug) && (
          <OriginPage
            originSlug={selectedOrigin || viewParams.slug || ""}
            onViewProduct={viewProduct}
            onQuickView={setQuickViewProduct}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onAddToCart={addToCart}
            comparisonProducts={comparisonProducts}
            onToggleComparison={toggleComparison}
          />
        )}
        {currentView === "craft-type" && (selectedCraftType || viewParams.type) && (
          <CraftTypePage
            craftType={selectedCraftType || viewParams.type || ""}
            products={mockProducts.filter(
              (p) => p.craftType === (selectedCraftType || viewParams.type),
            )}
            onViewProduct={viewProduct}
            onAddToCart={addToCart}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
          />
        )}
        {currentView === "material" && (selectedMaterial || viewParams.material) && (
          <MaterialPage
            material={selectedMaterial || viewParams.material || ""}
            products={mockProducts.filter(
              (p) => p.material === (selectedMaterial || viewParams.material),
            )}
            onViewProduct={viewProduct}
            onAddToCart={addToCart}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
          />
        )}
        {currentView === "collection" && (selectedCollection || viewParams.name) && (
          <CollectionPage
            collection={selectedCollection || viewParams.name || ""}
            products={mockProducts.filter((p) =>
              p.tags.includes(selectedCollection || viewParams.name),
            )}
            onViewProduct={viewProduct}
            onAddToCart={addToCart}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
          />
        )}
        {currentView === "product" && selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            cart={cart}
            onAddToCart={addToCart}
            onBack={() => setCurrentView("catalog")}
            isInWishlist={wishlist.includes(selectedProduct.id)}
            onToggleWishlist={toggleWishlist}
            onBuyNow={buyNow}
          />
        )}
        {currentView === "cart" && (
          <Cart
            cart={cart}
            onUpdateQuantity={updateCartQuantity}
            onRemove={removeFromCart}
            onCheckout={() => changeView("cart-page")}
            onContinueShopping={() => changeView("catalog")}
          />
        )}
        {currentView === "cart-page" && (
          <CartPage
            cart={cart}
            onUpdateQuantity={updateCartQuantity}
            onRemove={removeFromCart}
            onCheckout={() => {
              navigateView("checkout-customer");
            }}
            onBack={() => changeView("catalog")}
          />
        )}
        {currentView === "shipping" && (
          <ShippingAddress
            onContinue={() => {
              setShippingCompleted(true);
              setCheckoutStep("payment");
              changeView("payment");
            }}
            onBack={() => changeView("cart-page")}
          />
        )}
        {currentView === "payment" &&
          (cart.length === 0 ? (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-primary mb-4">
                  Cart is Empty
                </h2>
                <p className="text-secondary mb-6">
                  Please add items to your cart first
                </p>
                <button
                  onClick={() => changeView("catalog")}
                  className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : !shippingCompleted ? (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-primary mb-4">
                  Complete Shipping Information
                </h2>
                <p className="text-secondary mb-6">
                  Please complete shipping information first
                </p>
                <button
                  onClick={() => changeView("shipping")}
                  className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                >
                  Go to Shipping
                </button>
              </div>
            </div>
          ) : (
            <PaymentMethod
              cart={cart}
              onContinue={() => {
                setPaymentCompleted(true);
                setCheckoutStep("review");
                changeView("review");
              }}
              onBack={() => changeView("shipping")}
            />
          ))}
        {currentView === "review" &&
          (cart.length === 0 ? (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-primary mb-4">
                  Cart is Empty
                </h2>
                <p className="text-secondary mb-6">
                  Please add items to your cart first
                </p>
                <button
                  onClick={() => changeView("catalog")}
                  className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : !shippingCompleted || !paymentCompleted ? (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-primary mb-4">
                  Complete Checkout Steps
                </h2>
                <p className="text-secondary mb-6">
                  Please complete shipping and payment information first
                </p>
                <button
                  onClick={() =>
                    changeView(shippingCompleted ? "payment" : "shipping")
                  }
                  className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                >
                  {shippingCompleted ? "Go to Payment" : "Go to Shipping"}
                </button>
              </div>
            </div>
          ) : (
            <OrderReview
              cart={cart}
              onPlaceOrder={async () => {
                const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 10000)}`;

                const subtotal = cart.reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0,
                );
                const bundleDiscount = cart.reduce((sum, item) => {
                  if (item.bundleDiscount && item.bundleId) {
                    return (
                      sum +
                      (item.price * item.quantity * item.bundleDiscount) / 100
                    );
                  }
                  return sum;
                }, 0);
                const subtotalAfterDiscount = subtotal - bundleDiscount;
                const shipping = subtotalAfterDiscount > 50 ? 0 : 10;
                const tax = subtotalAfterDiscount * 0.1;
                const total = subtotalAfterDiscount + shipping + tax;

                await saveOrder({
                  orderNumber,
                  cart,
                  subtotal,
                  tax,
                  shipping,
                  discount: bundleDiscount,
                  total,
                });

                setLastOrderNumber(orderNumber);
                setCompletedOrderItems([...cart]);
                setCart([]);
                setCheckoutStep("confirmation");
                setShippingCompleted(false);
                setPaymentCompleted(false);
                changeView("confirmation");
              }}
              onBack={() => changeView("payment")}
            />
          ))}
        {currentView === "confirmation" && (
          <OrderConfirmation
            orderNumber={lastOrderNumber}
            cart={completedOrderItems}
            onViewTracking={() => changeView("tracking")}
            onBack={() => changeView("catalog")}
            onContinueShopping={() => changeView("catalog")}
          />
        )}
        {currentView === "tracking" && (
          <OrderTracking
            orderNumber={lastOrderNumber}
            orderItems={completedOrderItems}
            onBack={() => changeView("confirmation")}
          />
        )}
        {currentView === "checkout-customer" && (
          (() => {
            const step = searchParams.get('step') || 'customer';
            if (step === 'address') return <CheckoutAddress />;
            if (step === 'delivery') return <CheckoutDelivery />;
            if (step === 'payment') return <CheckoutPayment />;
            if (step === 'review') return <OrderReview cart={cart} onPlaceOrder={async () => {
              const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 10000)}`;
              const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
              const bundleDiscount = cart.reduce((sum, item) => {
                if (item.bundleDiscount && item.bundleId) {
                  return sum + (item.price * item.quantity * item.bundleDiscount) / 100;
                }
                return sum;
              }, 0);
              const subtotalAfterDiscount = subtotal - bundleDiscount;
              const shipping = subtotalAfterDiscount > 50 ? 0 : 10;
              const tax = subtotalAfterDiscount * 0.1;
              const total = subtotalAfterDiscount + shipping + tax;
              await saveOrder({ orderNumber, cart, subtotal, tax, shipping, discount: bundleDiscount, total });
              setLastOrderNumber(orderNumber);
              setCompletedOrderItems([...cart]);
              setCart([]);
              setShippingCompleted(false);
              setPaymentCompleted(false);
              changeView("confirmation");
            }} onBack={() => navigateView("checkout-customer", { step: 'payment' })} />;
            return <CheckoutCustomer />;
          })()
        )}
        {currentView === "checkout-address" && <CheckoutAddress />}
        {currentView === "checkout-delivery" && <CheckoutDelivery />}
        {currentView === "checkout-payment" && <CheckoutPayment />}
        {currentView === "order-detail" && <OrderDetailPage />}
        {currentView === "checkout" && (
          <Checkout
            cart={cart}
            totalAmount={totalAmount}
            onBack={() => changeView("cart")}
            onComplete={() => {
              setCart([]);
              changeView("account");
            }}
          />
        )}
        {currentView === "account" && (
          <UserAccountWrapper
            cart={cart}
            userPreferences={userPreferences}
            onNavigate={changeView}
          />
        )}
        {currentView === "account-page" && (
          <AccountPage
            onNavigate={(section) => {
              if (section === 'services') {
                changeView("services");
              } else if (section === 'account-dashboard') {
                changeView("account-dashboard");
              } else {
                changeView("account-page");
              }
            }}
          />
        )}
        {currentView === "account-dashboard" && (
          <UserAccountWrapper
            cart={cart}
            userPreferences={userPreferences}
            onNavigate={(view) => {
              if (view === "account" || view === "account-page") {
                changeView("account-page");
              } else if (view === "dashboard" || view === "home") {
                changeView("home");
              } else {
                changeView(view);
              }
            }}
          />
        )}
        {currentView === "services" && (
          <ProtectedRoute onRequireAuth={() => setAuthModal(true)}>
            <ServicesPage
              onNavigate={(section) => {
                if (section === 'dashboard') {
                  changeView("account-page");
                }
              }}
              onBack={() => changeView("account-page")}
            />
          </ProtectedRoute>
        )}
        {currentView === "wishlist" && (
          <WishlistManager
            onViewProduct={(productId) => {
              const product = mockProducts.find((p) => p.id === productId);
              if (product) viewProduct(product);
            }}
            onAddToCart={(productId, quantity) => {
              const product = mockProducts.find((p) => p.id === productId);
              if (product) {
                for (let i = 0; i < quantity; i++) {
                  addToCart(product);
                }
              }
            }}
          />
        )}
        {currentView === "gifts" && <GiftFinder />}
        {currentView === "traditions" && <TraditionGuides />}
        {currentView === "pilgrimage" && (
          <PilgrimageEssentials
            products={mockProducts}
            onViewProduct={viewProduct}
            onAddToCart={addToCart}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onQuickView={setQuickViewProduct}
            comparisonProducts={comparisonProducts}
            onToggleComparison={toggleComparison}
          />
        )}
        {currentView === "hajj-planner" && (
          <HajjPlanner
            onAddToCart={addToCart}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onViewProduct={viewProduct}
            onQuickView={setQuickViewProduct}
          />
        )}
        {currentView === "umrah-planner" && (
          <UmrahPlanner
            onAddToCart={addToCart}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onViewProduct={viewProduct}
            onQuickView={setQuickViewProduct}
          />
        )}
        {currentView === "christian-planner" && (
          <ChristianPilgrimagePlanner
            onAddToCart={addToCart}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onViewProduct={viewProduct}
            onQuickView={setQuickViewProduct}
          />
        )}
        {currentView === "jewish-planner" && (
          <JewishPilgrimagePlanner
            onAddToCart={addToCart}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onViewProduct={viewProduct}
            onQuickView={setQuickViewProduct}
          />
        )}
        {currentView === "universal-planner" && (
          <UniversalPilgrimagePlanner
            onAddToCart={addToCart}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onViewProduct={viewProduct}
            onQuickView={setQuickViewProduct}
          />
        )}
        {currentView === "wedding-products" && (
          <WeddingProductCatalog
            products={mockProducts}
            onAddToCart={addToCart}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onViewProduct={viewProduct}
            onQuickView={setQuickViewProduct}
            comparisonProducts={comparisonProducts}
            onToggleComparison={toggleComparison}
          />
        )}
        {currentView === "islamic-wedding" && (
          <IslamicWeddingPlanner
            onAddToCart={addToCart}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onViewProduct={viewProduct}
            onQuickView={setQuickViewProduct}
          />
        )}
        {currentView === "christian-wedding" && (
          <ChristianWeddingPlanner
            onAddToCart={addToCart}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onViewProduct={viewProduct}
            onQuickView={setQuickViewProduct}
          />
        )}
        {currentView === "jewish-wedding" && (
          <JewishWeddingPlanner
            onAddToCart={addToCart}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onViewProduct={viewProduct}
            onQuickView={setQuickViewProduct}
          />
        )}
        {currentView === "shared-wedding" && (
          <SharedWeddingPlanner
            onAddToCart={addToCart}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onViewProduct={viewProduct}
            onQuickView={setQuickViewProduct}
          />
        )}
        {currentView === "wedding-gifts" && (
          <WeddingGiftPlanner
            onAddToCart={addToCart}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onViewProduct={viewProduct}
            onQuickView={setQuickViewProduct}
          />
        )}
        {currentView === "home-blessing" && (
          <NewHomeBlessingPlanner
            onAddToCart={addToCart}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onViewProduct={viewProduct}
            onQuickView={setQuickViewProduct}
          />
        )}
        {currentView === "wedding-registry" && (
          <WeddingRegistry
            currentUserId={currentUserId || undefined}
            availableProducts={mockProducts}
            onAddToCart={addToCart}
            viewMode="browse"
          />
        )}
        {currentView === "wedding-registry-create" && (
          <WeddingRegistry
            currentUserId={currentUserId || undefined}
            availableProducts={mockProducts}
            onAddToCart={addToCart}
            viewMode="create"
          />
        )}
        {currentView === "wedding-registry-manage" && (
          <WeddingRegistry
            currentUserId={currentUserId || undefined}
            availableProducts={mockProducts}
            onAddToCart={addToCart}
            viewMode="manage"
          />
        )}
        {currentView === "celebration-registry" && (
          <UniversalRegistry
            registryType="celebration"
            currentUserId={currentUserId || undefined}
            availableProducts={mockProducts}
            onAddToCart={addToCart}
            viewMode={currentUserId ? "manage" : "browse"}
          />
        )}
        {currentView === "remembrance-registry" && (
          <UniversalRegistry
            registryType="remembrance"
            currentUserId={currentUserId || undefined}
            availableProducts={mockProducts}
            onAddToCart={addToCart}
            viewMode={currentUserId ? "manage" : "browse"}
          />
        )}
        {currentView === "home-blessing-registry" && (
          <UniversalRegistry
            registryType="home-blessing"
            currentUserId={currentUserId || undefined}
            availableProducts={mockProducts}
            onAddToCart={addToCart}
            viewMode={currentUserId ? "manage" : "browse"}
          />
        )}
        {currentView === "family-gift-registry" && (
          <UniversalRegistry
            registryType="family-gift"
            currentUserId={currentUserId || undefined}
            availableProducts={mockProducts}
            onAddToCart={addToCart}
            viewMode={currentUserId ? "manage" : "browse"}
          />
        )}
        {currentView.startsWith("universal-registry") && (
          <UniversalRegistry
            currentUserId={currentUserId || undefined}
            onNavigate={(view) => changeView(view)}
          />
        )}
        {/* Birth & Welcome Planners */}
        {currentView === "welcome-products" && (
          <WelcomeProductCatalog
            products={mockProducts}
            onAddToCart={addToCart}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onViewProduct={viewProduct}
            onQuickView={setQuickViewProduct}
            comparisonProducts={comparisonProducts}
            onToggleComparison={toggleComparison}
          />
        )}
        {currentView === "islamic-welcome" && (
          <IslamicWelcomePlanner
            onAddToCart={addToCart}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onViewProduct={viewProduct}
            onQuickView={setQuickViewProduct}
          />
        )}
        {currentView === "christian-welcome" && (
          <ChristianWelcomePlanner
            onAddToCart={addToCart}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onViewProduct={viewProduct}
            onQuickView={setQuickViewProduct}
          />
        )}
        {currentView === "jewish-welcome" && (
          <JewishWelcomePlanner
            onAddToCart={addToCart}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onViewProduct={viewProduct}
            onQuickView={setQuickViewProduct}
          />
        )}
        {currentView === "shared-welcome" && (
          <SharedWelcomePlanner
            onAddToCart={addToCart}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onViewProduct={viewProduct}
            onQuickView={setQuickViewProduct}
          />
        )}
        {/* Seasonal Planners */}
        {currentView === "ramadan-eid" && (
          <RamadanEidPlanner
            onAddToCart={addToCart}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onViewProduct={viewProduct}
            onQuickView={setQuickViewProduct}
            products={mockProducts}
            comparisonProducts={comparisonProducts}
            onToggleComparison={toggleComparison}
          />
        )}
        {currentView === "christmas-advent" && (
          <ChristmasAdventPlanner
            onAddToCart={addToCart}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onViewProduct={viewProduct}
            onQuickView={setQuickViewProduct}
            products={mockProducts}
            comparisonProducts={comparisonProducts}
            onToggleComparison={toggleComparison}
          />
        )}
        {currentView === "hanukkah" && (
          <HanukkahPlanner
            onAddToCart={addToCart}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onViewProduct={viewProduct}
            onQuickView={setQuickViewProduct}
            products={mockProducts}
            comparisonProducts={comparisonProducts}
            onToggleComparison={toggleComparison}
          />
        )}
        {currentView === "shared-seasonal" && (
          <SharedSeasonalPlanner
            onAddToCart={addToCart}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onViewProduct={viewProduct}
            onQuickView={setQuickViewProduct}
            products={mockProducts}
            comparisonProducts={comparisonProducts}
            onToggleComparison={toggleComparison}
          />
        )}
        {currentView === "seasonal-products" && (
          <SeasonalProductCatalog
            products={mockProducts}
            onAddToCart={addToCart}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onViewProduct={viewProduct}
            onQuickView={setQuickViewProduct}
            comparisonProducts={comparisonProducts}
            onToggleComparison={toggleComparison}
          />
        )}
        {/* Remembrance Planners */}
        {currentView === "islamic-remembrance" && (
          <IslamicRemembrancePlanner
            onAddToCart={addToCart}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onViewProduct={viewProduct}
            onQuickView={setQuickViewProduct}
          />
        )}
        {currentView === "christian-remembrance" && (
          <ChristianRemembrancePlanner
            onAddToCart={addToCart}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onViewProduct={viewProduct}
            onQuickView={setQuickViewProduct}
          />
        )}
        {currentView === "jewish-remembrance" && (
          <JewishRemembrancePlanner
            onAddToCart={addToCart}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onViewProduct={viewProduct}
            onQuickView={setQuickViewProduct}
          />
        )}
        {currentView === "shared-remembrance" && (
          <SharedRemembrancePlanner
            onAddToCart={addToCart}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onViewProduct={viewProduct}
            onQuickView={setQuickViewProduct}
          />
        )}
        {currentView === "remembrance-products" && (
          <RemembranceProductCatalog
            products={mockProducts}
            onAddToCart={addToCart}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onViewProduct={viewProduct}
            onQuickView={setQuickViewProduct}
            comparisonProducts={comparisonProducts}
            onToggleComparison={toggleComparison}
          />
        )}
        {currentView === "home-blessing-products" && (
          <HomeBlessingProductCatalog
            products={mockProducts}
            onAddToCart={addToCart}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onViewProduct={viewProduct}
            onQuickView={setQuickViewProduct}
            comparisonProducts={comparisonProducts}
            onToggleComparison={toggleComparison}
          />
        )}
        {/* Home Blessing Planners */}
        {currentView === "islamic-home-blessing" && (
          <IslamicHomeBlessingPlanner
            onAddToCart={addToCart}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onViewProduct={viewProduct}
            onQuickView={setQuickViewProduct}
          />
        )}
        {currentView === "christian-home-blessing" && (
          <ChristianHomeBlessingPlanner
            onAddToCart={addToCart}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onViewProduct={viewProduct}
            onQuickView={setQuickViewProduct}
          />
        )}
        {currentView === "jewish-home-blessing" && (
          <JewishHomeBlessingPlanner
            onAddToCart={addToCart}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onViewProduct={viewProduct}
            onQuickView={setQuickViewProduct}
          />
        )}
        {currentView === "shared-home-blessing" && (
          <SharedHomeBlessingPlanner
            onAddToCart={addToCart}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onViewProduct={viewProduct}
            onQuickView={setQuickViewProduct}
          />
        )}
        {(currentView === "discover" ||
          currentView === "discover-christian" ||
          currentView === "discover-jewish" ||
          currentView === "discover-islamic" ||
          currentView === "discover-interfaith") && (
          <DiscoverHub
            currentSection={currentView}
            onNavigate={(section) => changeView(section as View)}
            onViewProduct={viewProduct}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onAddToCart={addToCart}
          />
        )}
        {currentView === "product-research" && <ProductResearchImporter />}
        {currentView === "product-sources" && <ProductSourceManager />}

        {/* Vendor Portal */}
        {currentView === "vendor-dashboard" && (
          <VendorLayout><VendorDashboardPage /></VendorLayout>
        )}
        {currentView === "vendor-orders" && (
          <VendorLayout><VendorOrdersPage /></VendorLayout>
        )}
        {currentView === "vendor-products" && (
          <VendorLayout><VendorProductsPage /></VendorLayout>
        )}
        {currentView === "vendor-inventory" && (
          <VendorLayout><VendorInventoryPage /></VendorLayout>
        )}
        {currentView === "vendor-shipping" && (
          <VendorLayout><VendorShippingPage /></VendorLayout>
        )}
        {currentView === "vendor-returns" && (
          <VendorLayout><VendorReturnsPage /></VendorLayout>
        )}
        {currentView === "vendor-finance" && (
          <VendorLayout><VendorFinancePage /></VendorLayout>
        )}
        {currentView === "vendor-analytics" && (
          <VendorLayout><VendorAnalyticsPage /></VendorLayout>
        )}
        {currentView === "vendor-profile" && (
          <VendorLayout><VendorProfilePage /></VendorLayout>
        )}
        {currentView === "vendor-notifications" && (
          <VendorLayout><VendorNotificationsPage /></VendorLayout>
        )}
        {currentView === "vendor-guidelines" && (
          <VendorLayout><VendorGuidelinesPage /></VendorLayout>
        )}
        {currentView === "vendor-support" && (
          <VendorLayout><VendorSupportPage /></VendorLayout>
        )}

        {/* Admin Portal */}
        {currentView === "admin-overview" && (
          <AdminLayout><AdminOverviewPage /></AdminLayout>
        )}
        {currentView === "admin-admins" && (
          <AdminLayout><AdminAdminsPage /></AdminLayout>
        )}
        {currentView === "admin-vendors" && (
          <AdminLayout><AdminVendorsPage /></AdminLayout>
        )}
        {currentView === "admin-customers" && (
          <AdminLayout><AdminCustomersPage /></AdminLayout>
        )}
        {currentView === "admin-orders" && (
          <AdminLayout><AdminOrdersPage /></AdminLayout>
        )}
        {currentView === "admin-products" && (
          <AdminLayout><AdminProductsPage /></AdminLayout>
        )}
        {currentView === "admin-inventory" && (
          <AdminLayout><AdminInventoryPage /></AdminLayout>
        )}
        {currentView === "admin-categories" && (
          <AdminLayout><AdminCategoriesPage /></AdminLayout>
        )}
        {currentView === "admin-shipping" && (
          <AdminLayout><AdminShippingPage /></AdminLayout>
        )}
        {currentView === "admin-returns" && (
          <AdminLayout><AdminReturnsPage /></AdminLayout>
        )}
        {currentView === "admin-pricing" && (
          <AdminLayout><AdminPricingPage /></AdminLayout>
        )}
        {currentView === "admin-finance" && (
          <AdminLayout><AdminFinancePage /></AdminLayout>
        )}
        {currentView === "admin-payouts" && (
          <AdminLayout><AdminPayoutsPage /></AdminLayout>
        )}
        {currentView === "admin-analytics" && (
          <AdminLayout><AdminAnalyticsPage /></AdminLayout>
        )}
        {currentView === "admin-settings" && (
          <AdminLayout><AdminSettingsPage /></AdminLayout>
        )}
      </main>

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onNavigate={(view, category) => {
          if (view === "product") {
            const product = mockProducts.find((p) => p.id === category);
            if (product) viewProduct(product);
          } else {
            changeView(view as View);
            if (category) {
              setSearchQuery(category);
            }
          }
        }}
        darkMode={theme === "dark"}
        searchQuery={searchQuery}
        onSearch={handleSearch}
      />

      {quickViewProduct && (
        <QuickView
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={addToCart}
          isInWishlist={wishlist.includes(quickViewProduct.id)}
          onToggleWishlist={toggleWishlist}
          onViewFull={() => {
            viewProduct(quickViewProduct);
            setQuickViewProduct(null);
          }}
        />
      )}

      {showComparison && (
        <ComparisonModal
          productIds={comparisonProducts}
          onClose={() => setShowComparison(false)}
          onRemove={(id) =>
            setComparisonProducts((prev) => prev.filter((p) => p !== id))
          }
          onViewProduct={(product) => {
            viewProduct(product);
            setShowComparison(false);
          }}
        />
      )}

      {showNotifications && (
        <NotificationCenter
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          onMarkRead={markNotificationRead}
          onClearAll={() => setNotifications([])}
        />
      )}

      <section className="bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 text-white py-16 mt-16">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-600 rounded-full p-3">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold">10,000+</h3>
              </div>
              <p className="text-purple-200">
                Happy Customers Across the Globe
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-600 rounded-full p-3">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold">500+</h3>
              </div>
              <p className="text-purple-200">Verified Artisans Worldwide</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-600 rounded-full p-3">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold">3 Traditions</h3>
              </div>
              <p className="text-purple-200">
                Islamic, Christian & Jewish Heritage
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Stay Connected to Sacred Craftsmanship
              </h2>
              <p className="text-purple-100 mb-8 max-w-2xl mx-auto">
                Join our community and receive exclusive updates on new artisan
                collections, spiritual celebrations, and special offers.
              </p>

              <div className="max-w-xl mx-auto">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="flex-1 px-6 py-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <button className="px-8 py-4 bg-white text-purple-700 font-semibold rounded-lg hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl">
                    Subscribe
                  </button>
                </div>
                <p className="text-xs text-purple-200 mt-4">
                  By subscribing, you agree to our Privacy Policy and consent to
                  receive updates from Purple Soul.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {authModal && (
        <AuthModal
          onClose={() => setAuthModal(false)}
          onSuccess={() => setAuthModal(false)}
        />
      )}

      <footer className="bg-gradient-to-br from-purple-950 via-purple-900 to-purple-950 text-white">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-8 h-8" />
                  <div>
                    <h2 className="text-2xl font-bold">Purple Soul</h2>
                    <p className="text-sm text-purple-300">
                      by DKC Collectives
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-purple-200">
                North America–based, Purple Soul is the world's largest
                faith-inspired marketplace for handcrafted sacred goods. Purple
                Soul brings together artisans, traditions, and timeless
                craftsmanship from across the Abrahamic world. Every piece is
                handmade with devotion, carrying meaning, heritage, and
                spiritual beauty that nourishes both the home and the soul.
              </p>

              <div className="space-y-1 text-sm text-purple-200">
                <p>123 Faith Avenue,</p>
                <p>Harmony City, Country</p>
                <p className="pt-2">+1 (800) 123-4567</p>
              </div>

              <div className="flex gap-4">
                <a href="#" className="hover:text-purple-300 transition-colors">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a href="#" className="hover:text-purple-300 transition-colors">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                  </svg>
                </a>
                <a href="#" className="hover:text-purple-300 transition-colors">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                  </svg>
                </a>
                <a href="#" className="hover:text-purple-300 transition-colors">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>

              <div className="flex gap-2">
                <div className="bg-white/10 rounded px-2 py-1">
                  <svg className="h-5" viewBox="0 0 38 24" fill="white">
                    <rect width="38" height="24" rx="3" fill="#1434CB" />
                    <text
                      x="19"
                      y="16"
                      fontSize="10"
                      fill="white"
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      VISA
                    </text>
                  </svg>
                </div>
                <div className="bg-white/10 rounded px-2 py-1">
                  <svg className="h-5" viewBox="0 0 38 24" fill="white">
                    <circle cx="14" cy="12" r="8" fill="#EB001B" />
                    <circle cx="24" cy="12" r="8" fill="#F79E1B" />
                  </svg>
                </div>
                <div className="bg-white/10 rounded px-2 py-1">
                  <svg className="h-5" viewBox="0 0 38 24" fill="white">
                    <rect width="38" height="24" rx="3" fill="#003087" />
                    <text
                      x="19"
                      y="16"
                      fontSize="8"
                      fill="white"
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      PayPal
                    </text>
                  </svg>
                </div>
                <div className="bg-white/10 rounded px-2 py-1 text-xs font-bold flex items-center">
                  stripe
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-purple-200">Secure Checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-purple-200">
                    Verified Artisan Network
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-purple-200">
                    Curated Across Traditions
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Pilgrimage Planning
                </h3>
                <ul className="space-y-2 text-sm text-purple-200">
                  <li>
                    <button
                      onClick={() => changeView("pilgrimage")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Shop Pilgrimage Essentials
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => changeView("hajj-planner")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Hajj Planner
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => changeView("umrah-planner")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Umrah Planner
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => changeView("christian-planner")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Christian Planner
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => changeView("jewish-planner")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Jewish Planner
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => changeView("universal-planner")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Universal Planner
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Seasonal Celebrations
                </h3>
                <ul className="space-y-2 text-sm text-purple-200">
                  <li>
                    <button
                      onClick={() => changeView("seasonal-products")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Shop Celebrations Essentials
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => changeView("ramadan-eid")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Ramadan & Eid Planner
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => changeView("christmas-advent")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Christmas & Advent Planner
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => changeView("hanukkah")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Jewish Planner
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => changeView("shared-seasonal")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Shared Celebration Planner
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => changeView("celebration-registry")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Celebration Gift Registry
                    </button>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">My Account</h3>
                <ul className="space-y-2 text-sm text-purple-200">
                  <li>
                    <button
                      onClick={() => changeView("account-page")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Dashboard
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => changeView("account-page")}
                      className="hover:text-white transition-colors text-left"
                    >
                      My Orders
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => changeView("wishlist")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Wishlist
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => changeView("gifts")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Gift Cards
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => changeView("remembrance-registry")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Registries
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Wedding Planning</h3>
                <ul className="space-y-2 text-sm text-purple-200">
                  <li>
                    <button
                      onClick={() => changeView("wedding-products")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Shop Wedding Essentials
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => changeView("islamic-wedding")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Islamic Wedding Planner
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => changeView("christian-wedding")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Christian Wedding Planner
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => changeView("jewish-wedding")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Jewish Wedding Planner
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => changeView("shared-wedding")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Shared Wedding Planner
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => changeView("wedding-registry")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Wedding Gift Registry
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Remembrance</h3>
                <ul className="space-y-2 text-sm text-purple-200">
                  <li>
                    <button
                      onClick={() => changeView("remembrance-products")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Shop Reflections Essentials
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => changeView("islamic-remembrance")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Islamic Remembrance Planner
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => changeView("christian-remembrance")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Christian Remembrance Planner
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => changeView("jewish-remembrance")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Jewish Remembrance Planner
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => changeView("shared-remembrance")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Shared Remembrance Planner
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => changeView("remembrance-registry")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Remembrance Registry
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  New Birth & Welcome
                </h3>
                <ul className="space-y-2 text-sm text-purple-200">
                  <li>
                    <button
                      onClick={() => changeView("welcome-products")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Shop New Birth Essentials
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => changeView("islamic-welcome")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Islamic Welcome Planner
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => changeView("christian-welcome")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Christian Welcome Planner
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => changeView("jewish-welcome")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Jewish Welcome Planner
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => changeView("shared-welcome")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Shared Welcome Planner
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => changeView("family-gift-registry")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Family Gift Planner
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">
                  New Home & Blessing
                </h3>
                <ul className="space-y-2 text-sm text-purple-200">
                  <li>
                    <button
                      onClick={() => changeView("home-blessing-products")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Shop Home Blessings Essentials
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => changeView("islamic-home-blessing")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Islamic Home Blessing Planner
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => changeView("christian-home-blessing")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Christian Home Blessing Planner
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => changeView("jewish-home-blessing")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Jewish Home Planner
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => changeView("shared-home-blessing")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Host & Hospitality Planner
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => changeView("home-blessing-registry")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Home Blessing Registry
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Partner With Us</h3>
                <div className="space-y-3">
                  <a
                    href="#"
                    className="block border border-purple-600 hover:border-purple-400 rounded-lg p-3 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-800 rounded p-2 group-hover:bg-purple-700 transition-colors">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-sm mb-1">
                          Affiliate Program
                        </div>
                        <div className="text-xs text-purple-300">
                          Earn by sharing sacred craftsmanship
                        </div>
                      </div>
                    </div>
                  </a>
                  <a
                    href="#"
                    className="block border border-purple-600 hover:border-purple-400 rounded-lg p-3 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-800 rounded p-2 group-hover:bg-purple-700 transition-colors">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-sm mb-1">
                          Vendor Hub
                        </div>
                        <div className="text-xs text-purple-300">
                          Sell your handcrafted products
                        </div>
                      </div>
                    </div>
                  </a>
                  <button
                    onClick={() => changeView("product-research")}
                    className="block w-full border border-purple-600 hover:border-purple-400 rounded-lg p-3 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-800 rounded p-2 group-hover:bg-purple-700 transition-colors">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-sm mb-1">
                          Product Research
                        </div>
                        <div className="text-xs text-purple-300">
                          Import products from research
                        </div>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => changeView("product-sources")}
                    className="block w-full border border-purple-600 hover:border-purple-400 rounded-lg p-3 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-800 rounded p-2 group-hover:bg-purple-700 transition-colors">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-sm mb-1">
                          Manage Sources
                        </div>
                        <div className="text-xs text-purple-300">
                          Track vendors and suppliers
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Company & Trust</h3>
                <ul className="space-y-2 text-sm text-purple-200">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      About Us
                    </a>
                  </li>
                  <li>
                    <button
                      onClick={() => changeView("traditions")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Tradition Guides
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => changeView("discover")}
                      className="hover:text-white transition-colors text-left"
                    >
                      Discover Hub
                    </button>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Support</h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-purple-200">
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-3 h-3 text-green-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="hover:text-white transition-colors cursor-pointer">
                      Contact Us
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-3 h-3 text-green-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="hover:text-white transition-colors cursor-pointer">
                      Returns
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-3 h-3 text-green-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="hover:text-white transition-colors cursor-pointer">
                      Track Order
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-3 h-3 text-green-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="hover:text-white transition-colors cursor-pointer">
                      Help Centre
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-3 h-3 text-green-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="hover:text-white transition-colors cursor-pointer">
                      Privacy Policy
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-3 h-3 text-green-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="hover:text-white transition-colors cursor-pointer">
                      FAQ
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-purple-800 flex justify-between items-center text-sm text-purple-300">
            <p>&copy; 2026 Purple Soul Shop. All rights reserved.</p>
            <p>Platform developed by Prime Logic Solutions</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
