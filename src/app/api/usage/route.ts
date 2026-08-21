import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getCurrentAdmin } from '@/lib/auth';

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // 1. Fetch scan stats per school
    const { data: scans, error } = await supabaseAdmin
      .from('scanned_documents')
      .select('id, school_id, status, created_at, schools(id, name, contact_email)');

    if (error) throw error;

    // Aggregate by school
    const schoolMap = new Map<string, {
      schoolId: string;
      name: string;
      email: string;
      totalScans: number;
      completedScans: number;
      failedScans: number;
      estimatedCostUsd: number;
    }>();

    scans?.forEach((scan) => {
      const s = scan.schools as any;
      if (!s) return;
      
      const existing = schoolMap.get(s.id) || {
        schoolId: s.id,
        name: s.name,
        email: s.contact_email,
        totalScans: 0,
        completedScans: 0,
        failedScans: 0,
        estimatedCostUsd: 0,
      };

      existing.totalScans += 1;
      if (scan.status === 'ocr_completed') existing.completedScans += 1;
      if (scan.status === 'failed') existing.failedScans += 1;
      
      // Gemini 1.5 Flash approx cost ~ $0.001 per page OCR
      existing.estimatedCostUsd = +(existing.completedScans * 0.001).toFixed(4);

      schoolMap.set(s.id, existing);
    });

    const usageList = Array.from(schoolMap.values()).sort((a, b) => b.totalScans - a.totalScans);

    const totalScansProcessed = usageList.reduce((acc, u) => acc + u.totalScans, 0);
    const totalEstimatedCost = usageList.reduce((acc, u) => acc + u.estimatedCostUsd, 0);

    return NextResponse.json({
      summary: {
        totalScansProcessed,
        totalEstimatedCost: +totalEstimatedCost.toFixed(4),
        activeSchoolsUsingOCR: usageList.length,
      },
      schoolsUsage: usageList,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
