import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getCurrentAdmin, logAdminAction } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    // 1. Fetch the invoice
    const { data: invoice, error: invErr } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (invErr || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // 2. Mark invoice as paid
    const { data: updatedInvoice, error: updateErr } = await supabaseAdmin
      .from('invoices')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        payment_gateway: 'manual_offline',
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // 3. Update school subscription status to 'active'
    if (invoice.school_id) {
      await supabaseAdmin
        .from('schools')
        .update({
          subscription_status: 'active',
          plan_id: invoice.plan_id || undefined,
        })
        .eq('id', invoice.school_id);
    }

    // 4. Log admin audit action
    await logAdminAction({
      adminId: admin.adminId,
      action: 'mark_invoice_paid_manual',
      targetSchoolId: invoice.school_id,
      metadata: { invoice_id: id, amount: invoice.amount },
    });

    return NextResponse.json({ success: true, invoice: updatedInvoice });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
