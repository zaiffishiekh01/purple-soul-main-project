import { useEffect } from "react";
import { useLocation, useNavigate, useSearchParams, useParams } from "react-router-dom";

/**
 * Route definitions: maps URL path patterns to view names.
 * Dynamic segments use :param syntax.
 */
export interface RouteDef {
  /** URL path pattern, e.g. "/pilgrimage/hajj" */
  path: string;
  /** The view name to set in App state */
  view: string;
  /** Whether to parse query params from URL and pass them */
  hasQueryParams?: boolean;
}

export const ROUTES: RouteDef[] = [
  { path: "/", view: "home" },
  { path: "/shop", view: "catalog", hasQueryParams: true },
  { path: "/product/:id", view: "product" },
  { path: "/cart", view: "cart-page" },
  { path: "/checkout", view: "checkout-customer" },
  { path: "/checkout/address", view: "checkout-address" },
  { path: "/checkout/delivery", view: "checkout-delivery" },
  { path: "/checkout/payment", view: "checkout-payment" },
  { path: "/checkout/shipping", view: "shipping" },
  { path: "/checkout/review", view: "review" },
  { path: "/order/confirmation", view: "confirmation" },
  { path: "/order/track", view: "tracking" },
  { path: "/order/:orderNumber", view: "order-detail" },
  { path: "/account", view: "account-page" },
  { path: "/account/dashboard", view: "account-dashboard" },
  { path: "/account/profile", view: "account-page" },
  { path: "/account/addresses", view: "account-page" },
  { path: "/account/payments", view: "account-page" },
  { path: "/account/orders", view: "account-page" },
  { path: "/account/order-tracking", view: "account-page" },
  { path: "/account/returns", view: "account-page" },
  { path: "/account/subscriptions", view: "account-page" },
  { path: "/account/security", view: "account-page" },
  { path: "/account/notifications", view: "account-page" },
  { path: "/account/support", view: "account-page" },
  { path: "/account/wishlist", view: "account-page" },
  { path: "/account/gift-cards", view: "account-page" },
  { path: "/account/recipients", view: "account-page" },
  { path: "/account/services", view: "services" },
  { path: "/dashboard", view: "dashboard" },
  { path: "/wishlist", view: "wishlist" },
  { path: "/gift-finder", view: "gifts" },
  { path: "/traditions", view: "traditions" },
  { path: "/discover", view: "discover" },
  { path: "/discover/christian", view: "discover-christian" },
  { path: "/discover/jewish", view: "discover-jewish" },
  { path: "/discover/islamic", view: "discover-islamic" },
  { path: "/discover/interfaith", view: "discover-interfaith" },
  { path: "/origin/:slug", view: "origin" },
  { path: "/craft/:type", view: "craft-type" },
  { path: "/material/:material", view: "material" },
  { path: "/collection/:name", view: "collection" },
  // Pilgrimage
  { path: "/pilgrimage", view: "pilgrimage" },
  { path: "/pilgrimage/hajj", view: "hajj-planner" },
  { path: "/pilgrimage/umrah", view: "umrah-planner" },
  { path: "/pilgrimage/christian", view: "christian-planner" },
  { path: "/pilgrimage/jewish", view: "jewish-planner" },
  { path: "/pilgrimage/universal", view: "universal-planner" },
  // Wedding
  { path: "/wedding", view: "wedding-products" },
  { path: "/wedding/islamic", view: "islamic-wedding" },
  { path: "/wedding/christian", view: "christian-wedding" },
  { path: "/wedding/jewish", view: "jewish-wedding" },
  { path: "/wedding/shared", view: "shared-wedding" },
  { path: "/wedding/gifts", view: "wedding-gifts" },
  // Registry
  { path: "/registry/wedding", view: "wedding-registry" },
  { path: "/registry/wedding/create", view: "wedding-registry-create" },
  { path: "/registry/wedding/manage", view: "wedding-registry-manage" },
  { path: "/registry/celebration", view: "celebration-registry" },
  { path: "/registry/remembrance", view: "remembrance-registry" },
  { path: "/registry/home-blessing", view: "home-blessing-registry" },
  { path: "/registry/family-gift", view: "family-gift-registry" },
  { path: "/registry/:type", view: "universal-registry" },
  // Welcome
  { path: "/welcome", view: "welcome-products" },
  { path: "/welcome/islamic", view: "islamic-welcome" },
  { path: "/welcome/christian", view: "christian-welcome" },
  { path: "/welcome/jewish", view: "jewish-welcome" },
  { path: "/welcome/shared", view: "shared-welcome" },
  // Seasonal
  { path: "/seasonal", view: "seasonal-products" },
  { path: "/seasonal/ramadan-eid", view: "ramadan-eid" },
  { path: "/seasonal/christmas", view: "christmas-advent" },
  { path: "/seasonal/hanukkah", view: "hanukkah" },
  { path: "/seasonal/shared", view: "shared-seasonal" },
  // Remembrance
  { path: "/remembrance", view: "remembrance-products" },
  { path: "/remembrance/islamic", view: "islamic-remembrance" },
  { path: "/remembrance/christian", view: "christian-remembrance" },
  { path: "/remembrance/jewish", view: "jewish-remembrance" },
  { path: "/remembrance/shared", view: "shared-remembrance" },
  // Home Blessing
  { path: "/home-blessing", view: "home-blessing" },
  { path: "/home-blessing/products", view: "home-blessing-products" },
  { path: "/home-blessing/islamic", view: "islamic-home-blessing" },
  { path: "/home-blessing/christian", view: "christian-home-blessing" },
  { path: "/home-blessing/jewish", view: "jewish-home-blessing" },
  { path: "/home-blessing/shared", view: "shared-home-blessing" },
  // Admin
  { path: "/admin/product-research", view: "product-research" },
  { path: "/admin/product-sources", view: "product-sources" },
  // Vendor routes
  { path: "/vendor", view: "vendor-dashboard" },
  { path: "/vendor/dashboard", view: "vendor-dashboard" },
  { path: "/vendor/orders", view: "vendor-orders" },
  { path: "/vendor/products", view: "vendor-products" },
  { path: "/vendor/inventory", view: "vendor-inventory" },
  { path: "/vendor/shipping", view: "vendor-shipping" },
  { path: "/vendor/returns", view: "vendor-returns" },
  { path: "/vendor/finance", view: "vendor-finance" },
  { path: "/vendor/analytics", view: "vendor-analytics" },
  { path: "/vendor/profile", view: "vendor-profile" },
  { path: "/vendor/notifications", view: "vendor-notifications" },
  { path: "/vendor/guidelines", view: "vendor-guidelines" },
  { path: "/vendor/support", view: "vendor-support" },
  // Admin routes
  { path: "/admin", view: "admin-overview" },
  { path: "/admin/dashboard", view: "admin-overview" },
  { path: "/admin/admins", view: "admin-admins" },
  { path: "/admin/vendors", view: "admin-vendors" },
  { path: "/admin/customers", view: "admin-customers" },
  { path: "/admin/orders", view: "admin-orders" },
  { path: "/admin/products", view: "admin-products" },
  { path: "/admin/inventory", view: "admin-inventory" },
  { path: "/admin/categories", view: "admin-categories" },
  { path: "/admin/shipping", view: "admin-shipping" },
  { path: "/admin/returns", view: "admin-returns" },
  { path: "/admin/pricing", view: "admin-pricing" },
  { path: "/admin/finance", view: "admin-finance" },
  { path: "/admin/payouts", view: "admin-payouts" },
  { path: "/admin/analytics", view: "admin-analytics" },
  { path: "/admin/settings", view: "admin-settings" },
];

/**
 * Hook: syncs the current URL to a view string.
 * Returns the matched view name and any URL params.
 */
export function useViewSync(): [string, Record<string, string>] {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const pathname = location.pathname;

  for (const route of ROUTES) {
    const regexPattern = "^" + route.path.replace(/:[a-zA-Z]+/g, "([^/]+)") + "$";
    const regex = new RegExp(regexPattern);
    const match = pathname.match(regex);
    if (match) {
      const params: Record<string, string> = {};
      const paramNames = route.path.match(/:([a-zA-Z]+)/g);
      if (paramNames) {
        paramNames.forEach((name, i) => {
          params[name.slice(1)] = match[i + 1] || "";
        });
      }

      // For catalog with query params, build the query-string view format
      if (route.hasQueryParams && searchParams.toString()) {
        return [`catalog?${searchParams.toString()}`, params];
      }

      // For universal-registry with type param
      if (route.view === "universal-registry" && params.type) {
        return [`universal-registry?type=${params.type}`, params];
      }

      return [route.view, params];
    }
  }

  return ["home", {}];
}

/**
 * Hook: navigates to a view by setting the URL.
 * Replaces the old changeView() function.
 */
export function useViewNavigate() {
  const navigate = useNavigate();

  return (view: string, params?: Record<string, string>, queryParams?: Record<string, string>) => {
    // Handle catalog?query-string format
    if (view.startsWith("catalog?")) {
      const qs = view.split("?")[1];
      navigate(`/shop?${qs}`, { replace: false });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Handle universal-registry?type=xxx format
    if (view.startsWith("universal-registry")) {
      const typeMatch = view.match(/type=([^&]+)/);
      if (typeMatch) {
        navigate(`/registry/${typeMatch[1]}`, { replace: false });
      } else {
        navigate("/registry/wedding", { replace: false });
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Look up the route
    const route = ROUTES.find((r) => r.view === view);
    if (route) {
      let path = route.path;
      // Replace :param placeholders
      if (params) {
        for (const [key, value] of Object.entries(params)) {
          path = path.replace(`:${key}`, value);
        }
      }
      
      // Add query parameters if provided
      if (queryParams && Object.keys(queryParams).length > 0) {
        const qs = new URLSearchParams(queryParams).toString();
        path = `${path}?${qs}`;
      }
      
      navigate(path, { replace: false });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Fallback: go home
      navigate("/", { replace: false });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
}
