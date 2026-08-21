import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getCurrentAdmin, logAdminAction } from '@/lib/auth';
import jwt from 'jsonwebtoken';

const SCHOOL_JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_notegen_12345!';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    // 1. Fetch school and an active school admin user
    const { data: school, error: schoolErr } = await supabaseAdmin
      .from('schools')
      .select('id, name')
      .eq('id', id)
      .single();

    if (schoolErr || !school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    const { data: schoolUser } = await supabaseAdmin
      .from('school_users')
      .select('user_id, role, full_name, users:user_id(email)')
      .eq('school_id', id)
      .eq('is_active', true)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    const targetUserId = schoolUser?.user_id || '00000000-0000-0000-0000-000000000000';
    const targetEmail = (schoolUser?.users as any)?.email || `${school.name.toLowerCase().replace(/\s+/g, '')}@school.internal`;

    // 2. Generate a 15-minute single-use support session token
    const token = jwt.sign(
      {
        sub: targetUserId,
        email: targetEmail,
        school_id: school.id,
        school_name: school.name,
        impersonated_by: admin.adminId,
        impersonator_email: admin.email,
        is_support_session: true,
      },
      SCHOOL_JWT_SECRET,
      { expiresIn: '15m' }
    );

    // 3. Log to admin audit trail
    await logAdminAction({
      adminId: admin.adminId,
      action: 'impersonated_school_session',
      targetSchoolId: school.id,
      targetUserId: targetUserId,
      metadata: {
        school_name: school.name,
        expires_in: '15 minutes',
      },
    });

    const targetUrl = `http://localhost:3000/dashboard?support_token=${token}&school_name=${encodeURIComponent(school.name)}`;

    return NextResponse.json({
      success: true,
      token,
      targetUrl,
    });
  } catch (err: any) {
    console.error('Impersonation error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
