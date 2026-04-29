import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getDeterministicIncrement(date: Date, min: number, max: number): number {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const random = seededRandom(seed);
  return Math.floor(min + random * (max - min + 1));
}

function daysBetween(startDate: Date, endDate: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.floor((endDate.getTime() - startDate.getTime()) / oneDay);
}

function monthsBetween(startDate: Date, endDate: Date): number {
  const yearDiff = endDate.getFullYear() - startDate.getFullYear();
  const monthDiff = endDate.getMonth() - startDate.getMonth();
  return yearDiff * 12 + monthDiff;
}

export const revalidate = 3600;

export async function GET() {
  try {
    const supabase = createClient();

    const { data: config, error } = await supabase
      .from('site_stats')
      .select('*')
      .maybeSingle();

    if (error || !config) {
      return NextResponse.json(
        { customers: 2456, products: 3256, countries: 32 },
        { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
      );
    }

    const today = new Date();
    const startDate = new Date(config.stats_start_date);

    let customers = config.base_customers;
    let products = config.base_products;
    let countries = config.base_countries;

    if (config.dynamic_enabled) {
      const totalDays = daysBetween(startDate, today);

      for (let i = 0; i < totalDays; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);

        const customerIncrement = getDeterministicIncrement(
          currentDate,
          config.customer_daily_min,
          config.customer_daily_max
        );
        customers += customerIncrement;

        const productIncrement = getDeterministicIncrement(
          currentDate,
          config.product_daily_min,
          config.product_daily_max
        );
        products += productIncrement;
      }

      const totalMonths = monthsBetween(startDate, today);
      const countryIncrements = Math.floor(totalMonths / config.country_increment_every_months);
      countries += countryIncrements;
    }

    return NextResponse.json(
      { customers, products, countries },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
    );
  } catch (error) {
    console.error('Error computing stats:', error);
    return NextResponse.json(
      { customers: 2456, products: 3256, countries: 32 },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
    );
  }
}
