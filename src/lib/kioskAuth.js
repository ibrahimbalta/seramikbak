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
