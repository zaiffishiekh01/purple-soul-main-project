import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function GET() {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userProfile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: stats } = await supabase
    .from('admin_dashboard_stats')
    .select('*')
    .single();

  const today = new Date().toISOString().split('T')[0];
  const { data: dailyStats } = await supabase
    .from('daily_sales_stats')
    .select('*')
    .order('date', { ascending: false })
    .limit(30);

  const { data: topProducts } = await supabase
    .from('product_analytics')
    .select('product_id, revenue, purchases, products(title)')
    .order('revenue', { ascending: false })
    .limit(10);

  return NextResponse.json({
    stats,
    dailyStats: dailyStats || [],
    topProducts: topProducts || []
  });
}
