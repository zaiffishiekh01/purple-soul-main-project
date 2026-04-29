import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Facet {
  id: string;
  facet_group_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  data_type: string;
  is_required: boolean;
  display_order: number;
  is_active: boolean;
  values?: FacetValue[];
}

interface FacetValue {
  id: string;
  facet_id: string;
  value: string;
  display_order: number;
  is_active: boolean;
}

interface FacetGroup {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  facets?: Facet[];
}

interface CategoryFacetMapping {
  category_id: string;
  category_name: string;
  category_slug: string;
  facet_id: string;
  facet_name: string;
  is_required: boolean;
  display_order: number;
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
    const categoryId = url.searchParams.get("category_id");
    const facetGroupId = url.searchParams.get("facet_group_id");
    const includeInactive = url.searchParams.get("include_inactive") === "true";

    // Fetch facet groups
    let facetGroupsQuery = supabase
      .from("facet_groups")
      .select("*")
      .order("display_order", { ascending: true });

    if (!includeInactive) {
      facetGroupsQuery = facetGroupsQuery.eq("is_active", true);
    }

    if (facetGroupId) {
      facetGroupsQuery = facetGroupsQuery.eq("id", facetGroupId);
    }

    const { data: facetGroups, error: groupsError } = await facetGroupsQuery;

    if (groupsError) {
      throw groupsError;
    }

    // Fetch all facets
    let facetsQuery = supabase
      .from("facets")
      .select("*")
      .order("display_order", { ascending: true });

    if (!includeInactive) {
      facetsQuery = facetsQuery.eq("is_active", true);
    }

    const { data: facets, error: facetsError } = await facetsQuery;

    if (facetsError) {
      throw facetsError;
    }

    // Fetch all facet values
    const { data: facetValues, error: valuesError } = await supabase
      .from("facet_values")
      .select("*")
      .order("facet_id", { ascending: true })
      .order("display_order", { ascending: true });

    if (valuesError) {
      throw valuesError;
    }

    // Fetch category-facet mappings
    let mappingsQuery = supabase
      .from("category_facets")
      .select(`
        category_id,
        facet_id,
        is_required,
        display_order,
        categories!inner(name, slug),
        facets!inner(name, slug)
      `)
      .order("category_id", { ascending: true })
      .order("display_order", { ascending: true });

    if (categoryId) {
      mappingsQuery = mappingsQuery.eq("category_id", categoryId);
    }

    const { data: categoryFacets, error: mappingsError } = await mappingsQuery;

    if (mappingsError) {
      throw mappingsError;
    }

    // Organize facet values by facet_id
    const valuesByFacet = new Map<string, FacetValue[]>();
    (facetValues || []).forEach((value: any) => {
      if (!valuesByFacet.has(value.facet_id)) {
        valuesByFacet.set(value.facet_id, []);
      }
      valuesByFacet.get(value.facet_id)!.push({
        id: value.id,
        facet_id: value.facet_id,
        value: value.value,
        display_order: value.display_order,
        is_active: value.is_active,
      });
    });

    // Enhance facets with their values
    const enhancedFacets = (facets || []).map((facet: any) => ({
      id: facet.id,
      facet_group_id: facet.facet_group_id,
      name: facet.name,
      slug: facet.slug,
      description: facet.description,
      data_type: facet.data_type,
      is_required: facet.is_required,
      display_order: facet.display_order,
      is_active: facet.is_active,
      values: valuesByFacet.get(facet.id) || [],
    }));

    // Organize facets by group
    const facetsByGroup = new Map<string | null, Facet[]>();
    enhancedFacets.forEach((facet: Facet) => {
      const groupId = facet.facet_group_id;
      if (!facetsByGroup.has(groupId)) {
        facetsByGroup.set(groupId, []);
      }
      facetsByGroup.get(groupId)!.push(facet);
    });

    // Enhance facet groups with their facets
    const enhancedGroups = (facetGroups || []).map((group: any) => ({
      id: group.id,
      name: group.name,
      slug: group.slug,
      description: group.description,
      display_order: group.display_order,
      is_active: group.is_active,
      facets: facetsByGroup.get(group.id) || [],
    }));

    // Get ungrouped facets
    const ungroupedFacets = facetsByGroup.get(null) || [];

    // Process category-facet mappings
    const mappings = (categoryFacets || []).map((mapping: any) => ({
      category_id: mapping.category_id,
      category_name: mapping.categories.name,
      category_slug: mapping.categories.slug,
      facet_id: mapping.facet_id,
      facet_name: mapping.facets.name,
      is_required: mapping.is_required,
      display_order: mapping.display_order,
    }));

    // If specific category requested, organize by required/optional
    let categoryFacetDetails = null;
    if (categoryId && mappings.length > 0) {
      const categoryMappings = mappings.filter(
        (m: any) => m.category_id === categoryId
      );

      const requiredFacets = categoryMappings
        .filter((m: any) => m.is_required)
        .map((m: any) => {
          const facetData = enhancedFacets.find((f: Facet) => f.id === m.facet_id);
          return {
            ...m,
            facet: facetData,
          };
        });

      const optionalFacets = categoryMappings
        .filter((m: any) => !m.is_required)
        .map((m: any) => {
          const facetData = enhancedFacets.find((f: Facet) => f.id === m.facet_id);
          return {
            ...m,
            facet: facetData,
          };
        });

      categoryFacetDetails = {
        category_id: categoryId,
        required: requiredFacets,
        optional: optionalFacets,
        total: categoryMappings.length,
      };
    }

    // Build response
    const response: any = {
      success: true,
      data: {
        facet_groups: enhancedGroups,
        ungrouped_facets: ungroupedFacets,
        all_facets: enhancedFacets,
        category_mappings: mappings,
      },
      meta: {
        total_groups: enhancedGroups.length,
        total_facets: enhancedFacets.length,
        total_values: facetValues?.length || 0,
        total_mappings: mappings.length,
        generated_at: new Date().toISOString(),
      },
    };

    // Add category-specific details if requested
    if (categoryFacetDetails) {
      response.data.category_details = categoryFacetDetails;
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching facets:", error);

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
