export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'CANDIDATE' | 'RECRUITER' | 'ADMIN';
  candidateId?: string;
  recruiterId?: string;
}

export class ChatPermissionService {
  /**
   * Enforces role-aware authorization for querying specific entities.
   */
  static validateAccess(user: AuthUser, entityType: string, entityId?: string): boolean {
    if (!user) return false;

    // Admin has system-wide read access
    if (user.role === 'ADMIN') return true;

    if (user.role === 'CANDIDATE') {
      // Candidate can only access their own profile, resumes, and applications
      if (entityType === 'candidate' && entityId && entityId !== user.candidateId) {
        return false;
      }
      if (entityType === 'recruiter_notes' || entityType === 'candidate_pool_analytics' || entityType === 'parser_metrics') {
        return false; // Strictly unauthorized for candidates
      }
      return true;
    }

    if (user.role === 'RECRUITER') {
      // Recruiter cannot access system admin parser telemetry
      if (entityType === 'parser_metrics') {
        return false;
      }
      return true;
    }

    return false;
  }

  /**
   * Sanitizes structured candidate/application data to remove confidential fields.
   */
  static sanitizeForRole<T extends Record<string, any>>(data: T, role: 'CANDIDATE' | 'RECRUITER' | 'ADMIN'): Partial<T> {
    if (role === 'CANDIDATE') {
      const sanitized = { ...data };
      delete sanitized.recruiter_notes;
      delete sanitized.recruiterNotes;
      delete sanitized.internal_rank;
      delete sanitized.internalRank;
      return sanitized;
    }
    return data;
  }
}
