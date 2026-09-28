/**
 * Checks whether a dealer's SaaS subscription config qualifies for Kiosk Mode access.
 * Only dealers with an ACTIVE subscription and a non-expired end date can access Kiosk.
 * 
 * @param {object|null} saas - The dealerSaaSConfig record or state object
 * @returns {{ authorized: boolean, reason: 'AUTHORIZED'|'NO_SUBSCRIPTION'|'PENDING_APPROVAL'|'INACTIVE'|'EXPIRED', message: string }}
 */
export function checkKioskSubscriptionAccess(saas) {
  if (!saas) {
    return {
      authorized: false,
      reason: 'NO_SUBSCRIPTION',
      message: 'Kiosk Teşhir Modu yalnızca aktif paket aboneliği (Lite, Standart veya Premium) olan bayilerimize özeldir.'
    };
  }

  if (saas.status === 'PENDING_APPROVAL') {
    return {
      authorized: false,
      reason: 'PENDING_APPROVAL',
      message: 'Abonelik başvurunuz onay beklemektedir. Admin onayının ardından Kiosk Teşhir Modu aktifleşecektir.'
    };
  }

  if (saas.status !== 'ACTIVE') {
    return {
      authorized: false,
      reason: 'INACTIVE',
      message: 'Kiosk Teşhir Modunu kullanabilmek için aboneliğinizin aktif olması gerekmektedir.'
    };
  }

  if (saas.expiresAt && new Date(saas.expiresAt).getTime() <= Date.now()) {
    return {
      authorized: false,
      reason: 'EXPIRED',
      message: 'Paket abonelik süreniz dolmuştur. Kiosk Teşhir Modunu kullanmaya devam etmek için lütfen paketinizi yenileyiniz.'
    };
  }

  return {
    authorized: true,
    reason: 'AUTHORIZED',
    message: 'Kiosk Teşhir Modu erişimi yetkilendirildi.'
  };
}

/**
 * Checks whether a brand's SaaS subscription config qualifies for Kiosk Mode access.
 * Only brands with an active PRO or ENTERPRISE subscription can access Kiosk.
 * 
 * @param {object|null} saas - The brand SaaSConfig record or state object
 * @returns {{ authorized: boolean, reason: 'BRAND_AUTHORIZED'|'NO_BRAND_SUBSCRIPTION'|'PLAN_UPGRADE_REQUIRED'|'PENDING_APPROVAL'|'INACTIVE'|'EXPIRED', message: string }}
 */
export function checkBrandKioskSubscriptionAccess(saas) {
  if (!saas) {
    return {
      authorized: false,
      reason: 'NO_BRAND_SUBSCRIPTION',
      message: 'Kiosk Teşhir Modu, PRO veya ENTERPRISE paket aboneliği olan üretici markalarımıza özeldir.'
    };
  }

  const plan = (saas.plan || '').toUpperCase();
  if (plan !== 'PRO' && plan !== 'ENTERPRISE') {
    return {
      authorized: false,
      reason: 'PLAN_UPGRADE_REQUIRED',
      message: 'Kiosk Teşhir Modunu kullanabilmek için markanızın PRO veya ENTERPRISE plana sahip olması gerekmektedir.'
    };
  }

  if (saas.status === 'PENDING_APPROVAL') {
    return {
      authorized: false,
      reason: 'PENDING_APPROVAL',
      message: 'Marka paket abonelik başvurunuz onay beklemektedir. Admin onayının ardından Kiosk Teşhir Modu aktifleşecektir.'
    };
  }

  if (saas.status && saas.status !== 'ACTIVE') {
    return {
      authorized: false,
      reason: 'INACTIVE',
      message: 'Kiosk Teşhir Modunu kullanabilmek için marka aboneliğinizin aktif olması gerekmektedir.'
    };
  }

  if (saas.expiresAt && saas.expiresAt !== 'N/A' && new Date(saas.expiresAt).getTime() <= Date.now()) {
    return {
      authorized: false,
      reason: 'EXPIRED',
      message: 'Marka paket abonelik süreniz dolmuştur. Kiosk Teşhir Modunu kullanmaya devam etmek için lütfen paketinizi yenileyiniz.'
    };
  }

  return {
    authorized: true,
    reason: 'BRAND_AUTHORIZED',
    message: 'Marka Kurumsal Kiosk Modu erişimi yetkilendirildi.'
  };
}
