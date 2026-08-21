import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getCurrentAdmin, logAdminAction } from '@/lib/auth';

// PATCH /api/team/:id — Update admin status or role
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (currentAdmin.role !== 'root_admin') {
    return NextResponse.json({ error: 'Forbidden: Only root_admin can modify admins' }, { status: 403 });
  }

  const { id } = await params;

  // Prevent self-deactivation
  if (id === currentAdmin.adminId) {
    return NextResponse.json({ error: 'You cannot deactivate your own root account' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { is_active, role } = body;

    const updates: any = {};
    if (typeof is_active === 'boolean') updates.is_active = is_active;
    if (role) updates.role = role;

    const { data: updatedAdmin, error } = await supabaseAdmin
      .from('platform_admins')
      .update(updates)
      .eq('id', id)
      .select('id, full_name, email, role, is_active')
      .single();

    if (error) throw error;

    await logAdminAction({
      adminId: currentAdmin.adminId,
      action: 'updated_platform_admin',
      targetUserId: id,
      metadata: updates,
    });

    return NextResponse.json({ success: true, admin: updatedAdmin });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
