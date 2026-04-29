import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface NavigationItem {
  id: string;
  name: string;
  menu_label: string;
  slug: string;
  route_slug: string;
  icon?: string;
  level: number;
  menu_order: number;
  is_featured: boolean;
  show_in_navigation: boolean;
  parent_id: string | null;
  mega_menu_enabled: boolean;
  mega_menu_columns: number;
  children?: NavigationItem[];
}

interface StaticLink {
  id: string;
  label: string;
  url: string;
  display_order: number;
  is_active: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all active categories that should show in navigation
    // Admin-defined navigation structure is the SINGLE SOURCE OF TRUTH
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .eq("show_in_navigation", true)
      .order("level", { ascending: true })
      .order("display_order", { ascending: true });

    if (categoriesError) {
      throw categoriesError;
    }

    // Fetch static navigation links (if they exist)
    const { data: staticLinks, error: linksError } = await supabase
      .from("navigation_links")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    // Build hierarchical navigation structure
    const navigationMap = new Map<string | null, NavigationItem[]>();

    (categories || []).forEach((cat: any) => {
      const parentId = cat.parent_id;
      if (!navigationMap.has(parentId)) {
        navigationMap.set(parentId, []);
      }

      navigationMap.get(parentId)!.push({
        id: cat.id,
        name: cat.name,
        menu_label: cat.navigation_label || cat.name, // Admin can override menu label
        slug: cat.slug,
        route_slug: cat.url_slug_override || cat.slug, // Admin can override route
        icon: cat.icon,
        level: cat.level,
        menu_order: cat.display_order,
        is_featured: cat.is_featured,
        show_in_navigation: cat.show_in_navigation,
        parent_id: cat.parent_id,
        mega_menu_enabled: cat.mega_menu_enabled || false,
        mega_menu_columns: cat.mega_menu_columns || 3,
      });
    });

    // Recursively build tree structure
    const buildTree = (parentId: string | null = null): NavigationItem[] => {
      const items = navigationMap.get(parentId) || [];
      return items.map(item => {
        const children = buildTree(item.id);
        return {
          ...item,
          ...(children.length > 0 ? { children } : {}),
        };
      });
    };

    const navigationTree = buildTree(null);

    // Get featured categories (for homepage sections, etc.)
    // Sorted by featured_order as defined by admin
    const featuredCategories = (categories || [])
      .filter((cat: any) => cat.is_featured)
      .sort((a: any, b: any) => (a.featured_order || 0) - (b.featured_order || 0))
      .map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        menu_label: cat.navigation_label || cat.name,
        slug: cat.slug,
        route_slug: cat.url_slug_override || cat.slug,
        icon: cat.icon,
        description: cat.description,
        featured_order: cat.featured_order || 0,
      }));

    const response = {
      success: true,
      data: {
        navigation: navigationTree,
        featured: featuredCategories,
        static_links: staticLinks || [],
      },
      meta: {
        total_categories: categories?.length || 0,
        featured_count: featuredCategories.length,
        static_links_count: staticLinks?.length || 0,
        generated_at: new Date().toISOString(),
        authority: "Admin Dashboard is the SINGLE SOURCE OF TRUTH for navigation",
        note: "Use menu_label and route_slug for navigation rendering. Never use fallback or hardcoded labels.",
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching navigation:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
