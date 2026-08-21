import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getCurrentAdmin } from '@/lib/auth';

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [
      { count: totalSchools },
      { count: activeSchools },
      { count: totalTeachers },
      { count: totalScans },
      { count: totalQuestions },
      { count: totalPapers },
    ] = await Promise.all([
      supabaseAdmin.from('schools').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('schools').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabaseAdmin.from('school_users').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('scanned_documents').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('questions').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('question_papers').select('*', { count: 'exact', head: true }),
    ]);

    // Recent 5 schools
    const { data: recentSchools } = await supabaseAdmin
      .from('schools')
      .select('id, name, contact_email, board, is_active, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    // Recent 5 scans
    const { data: recentScans } = await supabaseAdmin
      .from('scanned_documents')
      .select('id, status, doc_type, created_at, schools(name)')
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      stats: {
        totalSchools: totalSchools || 0,
        activeSchools: activeSchools || 0,
        totalTeachers: totalTeachers || 0,
        totalScans: totalScans || 0,
        totalQuestions: totalQuestions || 0,
        totalPapers: totalPapers || 0,
      },
      recentSchools: recentSchools || [],
      recentScans: recentScans || [],
    });
  } catch (err: any) {
    console.error('Stats API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
