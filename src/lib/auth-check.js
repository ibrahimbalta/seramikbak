import { cookies } from 'next/headers';
import { decryptSession } from './session';

/**
 * Verifies the current request session and checks user privileges.
 * Supports secure cookies (default) and Authorization header (fallback).
 * @param {Request} request 
 * @param {string|null} requiredRole - 'admin', 'dealer', or 'brand'
 * @param {string|null} requiredAdminRole - 'SUPER_ADMIN', 'CONTENT_MANAGER', or 'SUPPORT'
 * @returns {Promise<object|null>} The session object if valid, otherwise null.
 */
export async function verifyAuth(request, requiredRole = null, requiredAdminRole = null) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('sb_session');
    let token = null;

    if (sessionCookie && sessionCookie.value) {
      token = sessionCookie.value;
    } else {
      // Fallback: Authorization header (e.g. "Bearer <token>")
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return null;
    }

    const session = decryptSession(token);
    if (!session) {
      return null;
    }

    // Primary role validation ('admin', 'dealer', 'brand')
    if (requiredRole && session.role !== requiredRole) {
      return null;
    }

    // Granular Admin sub-role validation (SUPER_ADMIN always passes)
    if (requiredAdminRole && session.role === 'admin') {
      if (session.adminRole !== 'SUPER_ADMIN' && session.adminRole !== requiredAdminRole) {
        return null;
      }
    }

    return session;
  } catch (error) {
    console.error('[verifyAuth Error]:', error);
    return null;
  }
}

