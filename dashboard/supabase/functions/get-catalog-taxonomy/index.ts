import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Category {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  level: number;
  display_order: number;
  is_active: boolean;
  show_in_navigation: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  children?: Category[];
  is_leaf?: boolean;
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

    // Get query parameters
    const url = new URL(req.url);
    const includeInactive = url.searchParams.get("include_inactive") === "true";
    const flatStructure = url.searchParams.get("flat") === "true";
    const categoryId = url.searchParams.get("category_id");

    // Build query
    let query = supabase
      .from("categories")
      .select("*")
      .order("level", { ascending: true })
      .order("display_order", { ascending: true });

    // Filter by active status if needed
    if (!includeInactive) {
      query = query.eq("is_active", true);
    }

    // Filter by specific category if requested
    if (categoryId) {
      query = query.eq("id", categoryId);
    }

    const { data: categories, error: categoriesError } = await query;

    if (categoriesError) {
      throw categoriesError;
    }

    if (!categories || categories.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            categories: [],
            tree: [],
          },
          meta: {
            total_categories: 0,
            leaf_categories: 0,
            max_depth: 0,
          },
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Determine leaf categories (categories with no children)
    const categoryIds = new Set(categories.map((c: any) => c.id));
    const parentIds = new Set(
      categories.map((c: any) => c.parent_id).filter(Boolean)
    );

    const leafCategoryIds = new Set(
      [...categoryIds].filter(id => !parentIds.has(id))
    );

    // Enhance categories with leaf status
    const enhancedCategories = categories.map((cat: any) => ({
      ...cat,
      is_leaf: leafCategoryIds.has(cat.id),
    }));

    // If flat structure requested, return as-is
    if (flatStructure) {
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            categories: enhancedCategories,
          },
          meta: {
            total_categories: enhancedCategories.length,
            leaf_categories: leafCategoryIds.size,
            max_depth: Math.max(...enhancedCategories.map((c: any) => c.level)),
            generated_at: new Date().toISOString(),
          },
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Build hierarchical tree structure
    const categoryMap = new Map<string | null, Category[]>();

    enhancedCategories.forEach((cat: any) => {
      const parentId = cat.parent_id;
      if (!categoryMap.has(parentId)) {
        categoryMap.set(parentId, []);
      }
      categoryMap.get(parentId)!.push(cat);
    });

    // Recursively build tree
    const buildTree = (parentId: string | null = null): Category[] => {
      const items = categoryMap.get(parentId) || [];
      return items.map(item => {
        const children = buildTree(item.id);
        return {
          ...item,
          ...(children.length > 0 ? { children } : {}),
        };
      });
    };

    const tree = buildTree(null);

    // Get leaf categories for reference
    const leafCategories = enhancedCategories.filter((c: any) => c.is_leaf);

    const response = {
      success: true,
      data: {
        tree,
        leaf_categories: leafCategories,
        all_categories: enhancedCategories,
      },
      meta: {
        total_categories: enhancedCategories.length,
        leaf_categories: leafCategoryIds.size,
        root_categories: tree.length,
        max_depth: Math.max(...enhancedCategories.map((c: any) => c.level)),
        generated_at: new Date().toISOString(),
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
    console.error("Error fetching taxonomy:", error);

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
