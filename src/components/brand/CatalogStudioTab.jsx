'use client';

import React from 'react';
import SimpleDigitalCatalogModule from './SimpleDigitalCatalogModule';

/**
 * SeramikBak — Yeni Nesil Dijital Katalog & Lookbook Stüdyosu
 * 
 * Basit, modern ve profesyonel HTML dijital yayın şablonları sunan
 * yeni katalog yönetim modülü.
 * (Eski karmaşık tuval stüdyosu CatalogStudioTabLegacy.jsx altında arşivlenmiştir.)
 */
export default function CatalogStudioTab({ brandInfo, externalSubSection, onNavigateTab }) {
  return (
    <SimpleDigitalCatalogModule
      brandInfo={brandInfo}
      externalSubSection={externalSubSection}
      onNavigateTab={onNavigateTab}
    />
  );
}
