import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getCurrentAdmin, logAdminAction } from '@/lib/auth';
import { sendSchoolOnboardingEmail } from '@/lib/email';
import crypto from 'crypto';


function getSchoolAppUrl(req: NextRequest): string {
  if (process.env.SCHOOL_APP_URL) return process.env.SCHOOL_APP_URL.replace(/\/$/, '');
  if (process.env.NEXT_PUBLIC_SCHOOL_APP_URL) return process.env.NEXT_PUBLIC_SCHOOL_APP_URL.replace(/\/$/, '');
  return 'http://localhost:3000';
}

export async function GET(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('q') || '';
  const status = searchParams.get('status'); // 'active' | 'suspended' | 'all'

  let query = supabaseAdmin
    .from('schools')
    .select(`
      id, name, contact_email, phone, address, board, classes_range, 
      num_teachers, num_students, is_active, created_at, subscription_status,
      school_users (count),
      questions (count),
      scanned_documents (count),
      question_papers (count)
    `)
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(`name.ilike.%${search}%,contact_email.ilike.%${search}%,board.ilike.%${search}%`);
  }

  if (status === 'active') {
    query = query.eq('is_active', true);
  } else if (status === 'suspended') {
    query = query.eq('is_active', false);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ schools: data });
}

export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { name, contact_email, phone, address, board, classes_range, num_teachers, num_students, principal_name } = body;

    if (!name || !contact_email) {
      return NextResponse.json({ error: 'Name and Contact Email are required' }, { status: 400 });
    }

    const cleanEmail = contact_email.toLowerCase().trim();
    // Generate an ultra-compact 16-hex short token (32 chars)
    const shortToken = crypto.randomBytes(16).toString('hex');
    const otpExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    // 1. Create School Record
    const { data: school, error: schoolErr } = await supabaseAdmin
      .from('schools')
      .insert({
        name,
        contact_email: cleanEmail,
        phone: phone || null,
        address: address || null,
        board: board || 'CBSE',
        classes_range: classes_range || null,
        num_teachers: num_teachers ? parseInt(num_teachers, 10) : null,
        num_students: num_students ? parseInt(num_students, 10) : null,
        subscription_status: 'trial',
        is_active: true,
      })
      .select()
      .single();

    if (schoolErr) throw schoolErr;

    // 2. Check if user exists in public.users, or create one with shortToken
    let targetUserId: string;
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name')
      .eq('email', cleanEmail)
      .single();

    if (existingUser) {
      targetUserId = existingUser.id;
      // Update OTP to shortToken
      await supabaseAdmin
        .from('users')
        .update({ otp: shortToken, otp_expires_at: otpExpiresAt })
        .eq('id', existingUser.id);
    } else {
      const { data: newUser, error: userErr } = await supabaseAdmin
        .from('users')
        .insert({
          email: cleanEmail,
          full_name: principal_name || `${name} Administrator`,
          mobile: phone || null,
          otp: shortToken,
          otp_expires_at: otpExpiresAt,
        })
        .select('id')
        .single();

      if (userErr) throw userErr;
      targetUserId = newUser.id;
    }

    // 3. Link user to school as school_admin
    await supabaseAdmin
      .from('school_users')
      .upsert(
        {
          school_id: school.id,
          user_id: targetUserId,
          role: 'school_admin',
          full_name: principal_name || `${name} Administrator`,
          is_active: true,
        },
        { onConflict: 'school_id,user_id' }
      );

    // 4. Construct compact direct activation URL
    const schoolAppUrl = getSchoolAppUrl(req);
    const activationUrl = `${schoolAppUrl}/set-password?token=${shortToken}`;

    // 5. Send Onboarding Email with compact link
    await sendSchoolOnboardingEmail({
      email: cleanEmail,
      schoolName: school.name,
      activationUrl,
      recipientName: principal_name || `${name} Administrator`,
    });

    // 6. Log admin audit action
    await logAdminAction({
      adminId: admin.adminId,
      action: 'manual_school_onboarding_invited',
      targetSchoolId: school.id,
      targetUserId: targetUserId,
      metadata: {
        school_name: name,
        admin_email: cleanEmail,
        activationUrl,
      },
    });

    return NextResponse.json({
      success: true,
      school,
      activationUrl,
      message: `School created and direct activation link sent to ${cleanEmail}`,
    });
  } catch (err: any) {
    console.error('Error in manual onboarding:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
