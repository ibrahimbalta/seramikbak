import test from 'node:test';
import assert from 'node:assert/strict';
import { checkKioskSubscriptionAccess } from '../src/lib/kioskAuth.js';

test('Kiosk Auth - Dealer SaaS Package Subscription Access Control', async (t) => {
  await t.test('should deny access if dealer has no SaaS subscription', () => {
    const result = checkKioskSubscriptionAccess(null);
    assert.equal(result.authorized, false);
    assert.equal(result.reason, 'NO_SUBSCRIPTION');
    assert.ok(result.message.includes('aktif paket aboneliği'));
  });

  await t.test('should deny access if subscription status is PENDING_APPROVAL', () => {
    const pendingSaas = {
      plan: 'STANDART',
      status: 'PENDING_APPROVAL',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    const result = checkKioskSubscriptionAccess(pendingSaas);
    assert.equal(result.authorized, false);
    assert.equal(result.reason, 'PENDING_APPROVAL');
    assert.ok(result.message.includes('onay beklemektedir'));
  });

  await t.test('should deny access if subscription is inactive or paused', () => {
    const pausedSaas = {
      plan: 'PREMIUM',
      status: 'PAUSED',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    const result = checkKioskSubscriptionAccess(pausedSaas);
    assert.equal(result.authorized, false);
    assert.equal(result.reason, 'INACTIVE');
  });

  await t.test('should deny access if subscription has expired', () => {
    const expiredSaas = {
      plan: 'LITE',
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // expired 5 days ago
    };
    const result = checkKioskSubscriptionAccess(expiredSaas);
    assert.equal(result.authorized, false);
    assert.equal(result.reason, 'EXPIRED');
    assert.ok(result.message.includes('süreniz dolmuştur'));
  });

  await t.test('should grant access for active LITE package subscription', () => {
    const activeLite = {
      plan: 'LITE',
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()
    };
    const result = checkKioskSubscriptionAccess(activeLite);
    assert.equal(result.authorized, true);
    assert.equal(result.reason, 'AUTHORIZED');
  });

  await t.test('should grant access for active STANDART package subscription', () => {
    const activeStandart = {
      plan: 'STANDART',
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString()
    };
    const result = checkKioskSubscriptionAccess(activeStandart);
    assert.equal(result.authorized, true);
    assert.equal(result.reason, 'AUTHORIZED');
  });

  await t.test('should grant access for active PREMIUM package subscription', () => {
    const activePremium = {
      plan: 'PREMIUM',
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    };
    const result = checkKioskSubscriptionAccess(activePremium);
    assert.equal(result.authorized, true);
    assert.equal(result.reason, 'AUTHORIZED');
  });
});
