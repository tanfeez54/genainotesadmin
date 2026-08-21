import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getCurrentAdmin } from '@/lib/auth';

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // 1. Fetch all subscription plans
    const { data: plans } = await supabaseAdmin
      .from('subscription_plans')
      .select('*')
      .order('price_monthly', { ascending: true });

    // 2. Fetch schools with their plans
    const { data: schools } = await supabaseAdmin
      .from('schools')
      .select('id, name, subscription_status, billing_cycle, trial_ends_at, plan_id, subscription_plans(name, price_monthly, price_yearly)');

    // 3. Fetch recent invoices
    const { data: invoices } = await supabaseAdmin
      .from('invoices')
      .select('*, schools(name), subscription_plans(name)')
      .order('created_at', { ascending: false })
      .limit(50);

    // Compute MRR & ARR
    let mrr = 0;
    let arr = 0;
    let activeSubscribers = 0;
    let trialSubscribers = 0;
    let pastDueSubscribers = 0;

    const planCounts: Record<string, number> = {};

    schools?.forEach((s: any) => {
      const plan = s.subscription_plans;
      if (s.subscription_status === 'active' && plan) {
        activeSubscribers += 1;
        const monthly = s.billing_cycle === 'yearly' && plan.price_yearly ? plan.price_yearly / 12 : plan.price_monthly;
        mrr += Number(monthly) || 0;
        arr += Number(s.billing_cycle === 'yearly' ? plan.price_yearly : plan.price_monthly * 12) || 0;
        planCounts[plan.name] = (planCounts[plan.name] || 0) + 1;
      } else if (s.subscription_status === 'trial') {
        trialSubscribers += 1;
      } else if (s.subscription_status === 'past_due') {
        pastDueSubscribers += 1;
      }
    });

    // Total collected revenue from paid invoices
    const paidInvoices = invoices?.filter((inv) => inv.status === 'paid') || [];
    const totalCollectedRevenue = paidInvoices.reduce((acc, inv) => acc + Number(inv.amount), 0);

    // Outstanding overdue amount
    const overdueInvoices = invoices?.filter((inv) => inv.status === 'pending' || inv.status === 'failed') || [];
    const outstandingOverdueAmount = overdueInvoices.reduce((acc, inv) => acc + Number(inv.amount), 0);

    return NextResponse.json({
      metrics: {
        mrr: Math.round(mrr),
        arr: Math.round(arr),
        activeSubscribers,
        trialSubscribers,
        pastDueSubscribers,
        totalCollectedRevenue,
        outstandingOverdueAmount,
      },
      plans: plans || [],
      planCounts,
      invoices: invoices || [],
    });
  } catch (err: any) {
    console.error('Revenue API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
