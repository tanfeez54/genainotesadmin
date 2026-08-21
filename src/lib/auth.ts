import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { supabaseAdmin } from './supabase';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'kavion_super_admin_ultra_secret_key_999888777!';

export interface AdminPayload {
  adminId: string;
  email: string;
  role: 'root_admin' | 'support_admin' | 'billing_admin';
  fullName: string;
}

export function signAdminToken(payload: AdminPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}

export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminPayload;
  } catch {
    return null;
  }
}

export async function getCurrentAdmin(): Promise<AdminPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('kavion_admin_session')?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

/**
 * Log an administrative action to admin_audit_log
 */
export async function logAdminAction(params: {
  adminId: string;
  action: string;
  targetSchoolId?: string | null;
  targetUserId?: string | null;
  metadata?: Record<string, any>;
}) {
  try {
    await supabaseAdmin.from('admin_audit_log').insert({
      admin_id: params.adminId,
      action: params.action,
      target_school_id: params.targetSchoolId || null,
      target_user_id: params.targetUserId || null,
      metadata: params.metadata || {},
    });
  } catch (err) {
    console.error('[Admin Audit Log Error]', err);
  }
}
