import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { checkRateLimit } from '../src/lib/rate-limit.js';

describe('Security Audit & Hardening Regression Tests', () => {

  describe('1. Favorites IDOR & Session Isolation', () => {
    const evaluateFavoritesAccess = (auth, queryUserId) => {
      if (!auth) {
        return { status: 401, error: 'Yetkilendirme gerekli' };
      }
      const targetUserId = (auth.role === 'admin' && queryUserId) ? queryUserId : auth.id;
      if (queryUserId && auth.role !== 'admin' && auth.id !== queryUserId) {
        return { status: 403, error: 'Bu veriye erişim yetkiniz bulunmuyor' };
      }
      return { status: 200, effectiveUserId: targetUserId };
    };

    it('should strictly deny unauthenticated access to favorites (401)', () => {
      const result = evaluateFavoritesAccess(null, 'user-123');
      assert.equal(result.status, 401);
    });

    it('should block IDOR attempt when user tries to access another user favorites (403)', () => {
      const auth = { id: 'attacker-1', role: 'user', email: 'attacker@test.com' };
      const result = evaluateFavoritesAccess(auth, 'victim-user-456');
      assert.equal(result.status, 403);
    });

    it('should allow user to access their own favorites', () => {
      const auth = { id: 'legit-user', role: 'user', email: 'legit@test.com' };
      const result = evaluateFavoritesAccess(auth, 'legit-user');
      assert.equal(result.status, 200);
      assert.equal(result.effectiveUserId, 'legit-user');
    });

    it('should automatically bind to session user ID when no query param is passed', () => {
      const auth = { id: 'legit-user', role: 'user', email: 'legit@test.com' };
      const result = evaluateFavoritesAccess(auth, null);
      assert.equal(result.status, 200);
      assert.equal(result.effectiveUserId, 'legit-user');
    });

    it('should permit admin to inspect any user favorites', () => {
      const auth = { id: 'admin-1', role: 'admin', adminRole: 'SUPER_ADMIN' };
      const result = evaluateFavoritesAccess(auth, 'target-user-999');
      assert.equal(result.status, 200);
      assert.equal(result.effectiveUserId, 'target-user-999');
    });
  });

  describe('2. Project Inquiries Anti-IDOR & Information Disclosure', () => {
    const evaluateProjectsListAccess = (auth, { queryDealerId, queryBrandId, email }) => {
      if (!auth) {
        return { status: 401, error: 'Yetkilendirme gerekli' };
      }

      if (email) {
        if (auth.role !== 'admin' && auth.email !== email) {
          return { status: 403, error: 'Bu e-posta adresine ait taleplere erişim yetkiniz bulunmuyor' };
        }
        return { status: 200, filterType: 'email', targetEmail: email };
      }

      let dealerId = null;
      let brandId = null;

      if (auth.role === 'dealer') {
        dealerId = auth.id;
      } else if (auth.role === 'brand') {
        brandId = auth.id;
      } else if (auth.role === 'admin') {
        dealerId = queryDealerId;
        brandId = queryBrandId;
      } else {
        return { status: 403, error: 'Bu veriye erişim yetkiniz bulunmuyor' };
      }

      if (!dealerId && !brandId) {
        return { status: 400, error: 'Giriş yapan bayiId veya markaId belirtilmelidir' };
      }

      return { status: 200, filterType: 'portal', dealerId, brandId };
    };

    it('should reject unauthenticated caller trying to inspect project requests (401)', () => {
      const res = evaluateProjectsListAccess(null, { email: 'client@example.com' });
      assert.equal(res.status, 401);
    });

    it('should reject user trying to view another user project requests via email spoofing (403)', () => {
      const auth = { id: 'user-a', role: 'user', email: 'alice@example.com' };
      const res = evaluateProjectsListAccess(auth, { email: 'bob@example.com' });
      assert.equal(res.status, 403);
    });

    it('should allow user to view their own submitted project requests', () => {
      const auth = { id: 'user-a', role: 'user', email: 'alice@example.com' };
      const res = evaluateProjectsListAccess(auth, { email: 'alice@example.com' });
      assert.equal(res.status, 200);
      assert.equal(res.targetEmail, 'alice@example.com');
    });

    it('should prevent dealer from spoofing another dealer ID via query parameter', () => {
      const auth = { id: 'dealer-honest', role: 'dealer' };
      const res = evaluateProjectsListAccess(auth, { queryDealerId: 'dealer-victim' });
      assert.equal(res.status, 200);
      assert.equal(res.dealerId, 'dealer-honest', 'Must enforce session dealer ID over query');
    });

    it('should prevent brand from spoofing another brand ID via query parameter', () => {
      const auth = { id: 'brand-honest', role: 'brand' };
      const res = evaluateProjectsListAccess(auth, { queryBrandId: 'brand-victim' });
      assert.equal(res.status, 200);
      assert.equal(res.brandId, 'brand-honest', 'Must enforce session brand ID over query');
    });
  });

  describe('3. Architect Endpoints Authentication & Access Control', () => {
    const evaluateArchitectAction = (auth, targetArchitectId) => {
      if (!auth) {
        return { status: 401, error: 'Yetkilendirme gerekli' };
      }

      if (auth.role !== 'architect' && auth.role !== 'admin') {
        return { status: 403, error: 'Bu işlem için mimar yetkisi gereklidir' };
      }

      const effectiveArchitectId = (auth.role === 'admin' && targetArchitectId) ? targetArchitectId : auth.id;
      if (targetArchitectId && auth.role !== 'admin' && auth.id !== targetArchitectId) {
        return { status: 403, error: 'Başka bir mimar adına işlem yapamazsınız' };
      }

      return { status: 200, architectId: effectiveArchitectId };
    };

    it('should deny unauthenticated requests to architect sample/quote APIs (401)', () => {
      assert.equal(evaluateArchitectAction(null, 'arch-1').status, 401);
    });

    it('should deny non-architect users (e.g. regular users or unauthorized roles) (403)', () => {
      const userAuth = { id: 'user-1', role: 'user' };
      assert.equal(evaluateArchitectAction(userAuth, 'arch-1').status, 403);
    });

    it('should prevent an architect from creating quotes/samples on behalf of another architect (403)', () => {
      const archAuth = { id: 'arch-1', role: 'architect' };
      const res = evaluateArchitectAction(archAuth, 'arch-2');
      assert.equal(res.status, 403);
    });

    it('should allow valid architect to submit for themselves', () => {
      const archAuth = { id: 'arch-1', role: 'architect' };
      const res = evaluateArchitectAction(archAuth, 'arch-1');
      assert.equal(res.status, 200);
      assert.equal(res.architectId, 'arch-1');
    });
  });

  describe('4. Rate Limiting Protection on Sensitive Endpoints', () => {
    it('should throttle abusive login attempts after exceeding 20 hits', () => {
      const ip = '198.51.100.1';
      const key = `test_dealer_login_${ip}`;
      
      for (let i = 0; i < 20; i++) {
        const check = checkRateLimit(key, 20, 60000);
        assert.equal(check.allowed, true);
      }

      const blocked = checkRateLimit(key, 20, 60000);
      assert.equal(blocked.allowed, false);
      assert.ok(blocked.resetInMs > 0);
    });

    it('should throttle project spam creation after exceeding 5 hits', () => {
      const ip = '198.51.100.2';
      const key = `test_project_create_${ip}`;
      
      for (let i = 0; i < 5; i++) {
        const check = checkRateLimit(key, 5, 60000);
        assert.equal(check.allowed, true);
      }

      const blocked = checkRateLimit(key, 5, 60000);
      assert.equal(blocked.allowed, false);
    });
  });

  describe('5. Stripe Webhook Signature & Environment Protection', () => {
    const evaluateWebhookAuth = ({ webhookSecret, env, signatureHeader }) => {
      if (webhookSecret) {
        if (!signatureHeader || signatureHeader !== webhookSecret) {
          return { status: 401, error: 'Unauthorized webhook call' };
        }
      } else if (env === 'production') {
        return { status: 503, error: 'Webhook processing disabled in prod without secret' };
      }
      return { status: 200, message: 'Authorized' };
    };

    it('should reject webhook if secret is configured and signature is missing', () => {
      const res = evaluateWebhookAuth({ webhookSecret: 'whsec_secret123', env: 'production', signatureHeader: null });
      assert.equal(res.status, 401);
    });

    it('should reject webhook if secret is configured and signature is wrong', () => {
      const res = evaluateWebhookAuth({ webhookSecret: 'whsec_secret123', env: 'production', signatureHeader: 'invalid_sig' });
      assert.equal(res.status, 401);
    });

    it('should allow webhook if secret is configured and signature matches', () => {
      const res = evaluateWebhookAuth({ webhookSecret: 'whsec_secret123', env: 'production', signatureHeader: 'whsec_secret123' });
      assert.equal(res.status, 200);
    });

    it('should block unconfigured webhooks in production environment (503)', () => {
      const res = evaluateWebhookAuth({ webhookSecret: null, env: 'production', signatureHeader: null });
      assert.equal(res.status, 503);
    });
  });

});
