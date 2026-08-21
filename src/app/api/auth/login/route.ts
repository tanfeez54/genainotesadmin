import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { signAdminToken, logAdminAction } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // 1. Fetch admin record from platform_admins
    const { data: admin, error } = await supabaseAdmin
      .from('platform_admins')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('is_active', true)
      .single();

    if (error || !admin) {
      return NextResponse.json({ error: 'Invalid admin credentials or inactive account' }, { status: 401 });
    }

    // 2. Compare password hash
    const isValid = await bcrypt.compare(password, admin.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
    }

    // 3. Update last login
    await supabaseAdmin
      .from('platform_admins')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', admin.id);

    // 4. Sign JWT
    const token = signAdminToken({
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
      fullName: admin.full_name,
    });

    // 5. Log audit action
    await logAdminAction({
      adminId: admin.id,
      action: 'super_admin_login',
      metadata: { ip: req.headers.get('x-forwarded-for') || 'unknown' },
    });

    // 6. Set HttpOnly Cookie
    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        fullName: admin.full_name,
        role: admin.role,
      },
    });

    response.cookies.set('kavion_admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8, // 8 hours
    });

    return response;
  } catch (error: any) {
    console.error('Super Admin Login Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
