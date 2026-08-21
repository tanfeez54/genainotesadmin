import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getCurrentAdmin, logAdminAction } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// GET /api/team — List all platform admins
export async function GET() {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { data: team, error } = await supabaseAdmin
      .from('platform_admins')
      .select('id, full_name, email, role, is_active, last_login_at, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ team: team || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/team — Invite/Create a new platform admin (root_admin only)
export async function POST(req: NextRequest) {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (currentAdmin.role !== 'root_admin') {
    return NextResponse.json({ error: 'Forbidden: Only root_admin can add team members' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { full_name, email, password, role } = body;

    if (!full_name || !email || !password) {
      return NextResponse.json({ error: 'Full name, email, and password are required' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { data: newAdmin, error } = await supabaseAdmin
      .from('platform_admins')
      .insert({
        full_name,
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        role: role || 'support_admin',
        is_active: true,
      })
      .select('id, full_name, email, role, is_active, created_at')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'An admin with this email already exists' }, { status: 409 });
      }
      throw error;
    }

    // Log to audit trail
    await logAdminAction({
      adminId: currentAdmin.adminId,
      action: 'created_platform_admin',
      targetUserId: newAdmin.id,
      metadata: { new_admin_email: email, role: role || 'support_admin' },
    });

    return NextResponse.json({ success: true, admin: newAdmin }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
