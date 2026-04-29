import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ShippingRequest {
  fromZip: string;
  toZip: string;
  weight: number;
  length?: number;
  width?: number;
  height?: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { fromZip, toZip, weight, length = 12, width = 10, height = 8 } = await req.json() as ShippingRequest;

    if (!fromZip || !toZip || !weight) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: fromZip, toZip, weight" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const distance = calculateDistance(fromZip, toZip);
    const volumeWeight = (length * width * height) / 166;
    const chargeableWeight = Math.max(weight, volumeWeight);

    const rates = [
      {
        carrier: "USPS",
        service: "Priority Mail",
        rate: calculateRate(chargeableWeight, distance, 0.5),
        estimatedDays: distance < 500 ? "2-3" : "3-5",
        description: "Affordable and reliable",
      },
      {
        carrier: "USPS",
        service: "Priority Mail Express",
        rate: calculateRate(chargeableWeight, distance, 1.2),
        estimatedDays: "1-2",
        description: "Overnight to 2-day delivery",
      },
      {
        carrier: "UPS",
        service: "UPS Ground",
        rate: calculateRate(chargeableWeight, distance, 0.6),
        estimatedDays: distance < 300 ? "1-3" : "3-5",
        description: "Economical ground shipping",
      },
      {
        carrier: "UPS",
        service: "UPS 2nd Day Air",
        rate: calculateRate(chargeableWeight, distance, 1.5),
        estimatedDays: "2",
        description: "Guaranteed 2-day delivery",
      },
      {
        carrier: "UPS",
        service: "UPS Next Day Air",
        rate: calculateRate(chargeableWeight, distance, 2.5),
        estimatedDays: "1",
        description: "Next business day delivery",
      },
      {
        carrier: "FedEx",
        service: "FedEx Ground",
        rate: calculateRate(chargeableWeight, distance, 0.55),
        estimatedDays: distance < 300 ? "1-3" : "3-5",
        description: "Economical ground shipping",
      },
      {
        carrier: "FedEx",
        service: "FedEx Express Saver",
        rate: calculateRate(chargeableWeight, distance, 1.3),
        estimatedDays: "3",
        description: "3-day express delivery",
      },
      {
        carrier: "FedEx",
        service: "FedEx 2Day",
        rate: calculateRate(chargeableWeight, distance, 1.6),
        estimatedDays: "2",
        description: "Guaranteed 2-day delivery",
      },
      {
        carrier: "FedEx",
        service: "FedEx Standard Overnight",
        rate: calculateRate(chargeableWeight, distance, 2.8),
        estimatedDays: "1",
        description: "Next business day by 3pm",
      },
    ];

    return new Response(
      JSON.stringify({
        rates: rates.sort((a, b) => a.rate - b.rate),
        chargeableWeight,
        distance,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error calculating shipping rates:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to calculate rates" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function calculateDistance(fromZip: string, toZip: string): number {
  const from = parseInt(fromZip.substring(0, 3));
  const to = parseInt(toZip.substring(0, 3));
  const diff = Math.abs(from - to);
  return diff * 10 + Math.random() * 200;
}

function calculateRate(weight: number, distance: number, multiplier: number): number {
  const baseRate = 5.99;
  const weightRate = weight * 0.5;
  const distanceRate = (distance / 100) * 0.8;
  const total = (baseRate + weightRate + distanceRate) * multiplier;
  return Math.round(total * 100) / 100;
}