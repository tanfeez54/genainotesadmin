import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getCurrentAdmin, logAdminAction } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    const { data: school, error: schoolErr } = await supabaseAdmin
      .from('schools')
      .select('*, subscription_plans(*)')
      .eq('id', id)
      .single();

    if (schoolErr || !school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    // Fetch school staff / users
    const { data: users } = await supabaseAdmin
      .from('school_users')
      .select('id, user_id, role, full_name, is_active, created_at, users:user_id(email, mobile)')
      .eq('school_id', id)
      .order('created_at', { ascending: true });

    // Fetch classes & subjects
    const { data: classes } = await supabaseAdmin
      .from('classes')
      .select('id, name, order_index, subjects(id, name)')
      .eq('school_id', id)
      .order('order_index', { ascending: true });

    // Fetch recent scans
    const { data: scans } = await supabaseAdmin
      .from('scanned_documents')
      .select('id, doc_type, status, error_message, created_at')
      .eq('school_id', id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch all subscription plans
    const { data: plans } = await supabaseAdmin
      .from('subscription_plans')
      .select('*')
      .order('price_monthly', { ascending: true });

    // Fetch school's invoices
    const { data: invoices } = await supabaseAdmin
      .from('invoices')
      .select('*, subscription_plans(name)')
      .eq('school_id', id)
      .order('created_at', { ascending: false });

    // Fetch counts
    const [
      { count: questionCount },
      { count: paperCount },
    ] = await Promise.all([
      supabaseAdmin.from('questions').select('*', { count: 'exact', head: true }).eq('school_id', id),
      supabaseAdmin.from('question_papers').select('*', { count: 'exact', head: true }).eq('school_id', id),
    ]);

    return NextResponse.json({
      school,
      plans: plans || [],
      invoices: invoices || [],
      users: users || [],
      classes: classes || [],
      scans: scans || [],
      stats: {
        totalQuestions: questionCount || 0,
        totalPapers: paperCount || 0,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    const body = await req.json();

    const { data: updated, error } = await supabaseAdmin
      .from('schools')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logAdminAction({
      adminId: admin.adminId,
      action:
        body.is_active === false
          ? 'suspend_school'
          : body.is_active === true
          ? 'reactivate_school'
          : body.plan_id
          ? 'update_school_subscription'
          : 'update_school_profile',
      targetSchoolId: id,
      metadata: body,
    });

    return NextResponse.json({ success: true, school: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
