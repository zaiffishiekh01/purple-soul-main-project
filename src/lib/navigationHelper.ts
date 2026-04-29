import { ROUTES } from "../router/useViewRouter";

export interface NavigationState {
  view: string;
  params?: Record<string, any>;
  returnTo?: string;
  /** The URL path for this navigation state */
  urlPath?: string;
}

/** Build a URL path from a view name and optional params */
function buildUrlPath(view: string, params?: Record<string, any>): string {
  const route = ROUTES.find((r) => r.view === view);
  if (!route) return "/";

  let path = route.path;
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      path = path.replace(`:${key}`, String(value));
    }
  }
  // Remove remaining :param segments that weren't filled
  path = path.replace(/:[a-zA-Z]+/g, "");
  return path || "/";
}

export class NavigationHelper {
  static navigateToProduct(productId: string, returnTo?: string): NavigationState {
    const urlPath = `/product/${productId}`;
    return {
      view: 'product',
      params: { id: productId },
      returnTo,
      urlPath
    };
  }

  static navigateToCategory(category: string, subcategory?: string): NavigationState {
    const params: Record<string, string> = { category };
    if (subcategory) params.subcategory = subcategory;
    const qs = new URLSearchParams(params).toString();
    return {
      view: 'catalog',
      params: { category, subcategory },
      urlPath: `/shop?${qs}`
    };
  }

  static navigateToCheckout(items: any[], source?: string): NavigationState {
    return {
      view: 'checkout',
      params: { items, source },
      urlPath: '/checkout'
    };
  }

  static navigateToPlannerBooking(plannerType: string, plannerData?: any): NavigationState {
    return {
      view: 'planner-booking',
      params: { plannerType, plannerData },
      urlPath: buildUrlPath('planner-booking', { plannerType })
    };
  }

  static navigateToServiceBooking(serviceType: string, serviceId?: string): NavigationState {
    return {
      view: 'service-booking',
      params: { serviceType, serviceId },
      urlPath: buildUrlPath('service-booking', { serviceType })
    };
  }

  static navigateToOrderTracking(orderId?: string): NavigationState {
    return {
      view: 'tracking',
      params: { orderId },
      urlPath: buildUrlPath('tracking', { orderId })
    };
  }

  static navigateToRegistry(registryType: string, registryId?: string, mode?: string): NavigationState {
    const urlPath = `/registry/${registryType}`;
    return {
      view: 'universal-registry',
      params: { type: registryType, registryId, mode },
      urlPath
    };
  }

  static navigateToMyAccount(section?: string): NavigationState {
    return {
      view: 'account',
      params: { section },
      urlPath: '/account'
    };
  }

  static navigateToPlanner(plannerType: string, faithTradition?: string): NavigationState {
    const plannerMap: Record<string, string> = {
      'wedding': faithTradition ? `${faithTradition}-wedding` : 'shared-wedding',
      'pilgrimage': faithTradition === 'Islam' ? 'hajj-planner' : faithTradition === 'Christian' ? 'christian-planner' : faithTradition === 'Jewish' ? 'jewish-planner' : 'universal-planner',
      'seasonal': faithTradition === 'Islam' ? 'ramadan-eid' : faithTradition === 'Christian' ? 'christmas-advent' : faithTradition === 'Jewish' ? 'hanukkah' : 'shared-seasonal',
      'welcome': faithTradition ? `${faithTradition.toLowerCase()}-welcome` : 'welcome-products',
      'home-blessing': faithTradition ? `${faithTradition.toLowerCase()}-home-blessing` : 'home-blessing',
      'remembrance': faithTradition ? `${faithTradition.toLowerCase()}-remembrance` : 'remembrance'
    };

    const view = plannerMap[plannerType] || plannerType;
    return {
      view,
      params: { faithTradition },
      urlPath: buildUrlPath(view)
    };
  }

  static parseViewString(viewString: string): NavigationState {
    const [view, queryString] = viewString.split('?');
    const params: Record<string, any> = {};

    if (queryString) {
      queryString.split('&').forEach(param => {
        const [key, value] = param.split('=');
        params[decodeURIComponent(key)] = decodeURIComponent(value);
      });
    }

    return { view, params };
  }

  static buildViewString(state: NavigationState): string {
    if (!state.params || Object.keys(state.params).length === 0) {
      return state.view;
    }

    const queryString = Object.entries(state.params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    return `${state.view}?${queryString}`;
  }
}

export const PRODUCT_CATEGORIES = {
  WEDDING: {
    name: 'Wedding',
    slug: 'wedding',
    subcategories: ['Decor', 'Tableware', 'Gifts', 'Keepsakes', 'Jewelry']
  },
  HOME: {
    name: 'Home & Living',
    slug: 'home',
    subcategories: ['Furniture', 'Decor', 'Kitchen', 'Bedding', 'Lighting']
  },
  SPIRITUAL: {
    name: 'Spiritual Items',
    slug: 'spiritual',
    subcategories: ['Prayer Items', 'Religious Art', 'Books', 'Candles', 'Incense']
  },
  BABY: {
    name: 'Baby & Kids',
    slug: 'baby',
    subcategories: ['Clothing', 'Toys', 'Nursery', 'Gifts', 'Books']
  },
  JEWELRY: {
    name: 'Jewelry',
    slug: 'jewelry',
    subcategories: ['Necklaces', 'Bracelets', 'Rings', 'Earrings', 'Religious Jewelry']
  },
  GIFTS: {
    name: 'Gifts',
    slug: 'gifts',
    subcategories: ['Personalized', 'Seasonal', 'Luxury', 'Hampers', 'Gift Sets']
  }
};

export const PLANNER_TYPES = {
  WEDDING: { id: 'wedding', name: 'Wedding Planner', icon: 'Heart' },
  PILGRIMAGE: { id: 'pilgrimage', name: 'Pilgrimage Planner', icon: 'MapPin' },
  SEASONAL: { id: 'seasonal', name: 'Seasonal Celebration', icon: 'Sparkles' },
  WELCOME: { id: 'welcome', name: 'New Birth & Welcome', icon: 'Baby' },
  HOME_BLESSING: { id: 'home-blessing', name: 'Home Blessing', icon: 'Home' },
  REMEMBRANCE: { id: 'remembrance', name: 'Remembrance', icon: 'Crown' }
};

export const SERVICE_TYPES = {
  TRAVEL: { id: 'travel', name: 'Travel Packages', icon: 'Plane' },
  VENUE: { id: 'venue', name: 'Venue Booking', icon: 'Building' },
  CATERING: { id: 'catering', name: 'Catering Services', icon: 'Utensils' },
  PHOTOGRAPHY: { id: 'photography', name: 'Photography', icon: 'Camera' },
  ENTERTAINMENT: { id: 'entertainment', name: 'Entertainment', icon: 'Music' }
};
