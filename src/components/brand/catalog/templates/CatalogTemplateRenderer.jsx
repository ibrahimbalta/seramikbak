'use client';

import React from 'react';
import MilanoLookbookTemplate from './MilanoLookbookTemplate';
import ArchitecturalSpecSheetTemplate from './ArchitecturalSpecSheetTemplate';
import ShowroomCollectionTemplate from './ShowroomCollectionTemplate';
import GlobalExportTemplate from './GlobalExportTemplate';

export default function CatalogTemplateRenderer({ catalog, products = [], mode = 'preview' }) {
  if (!catalog) return null;

  const template = catalog.template || 'milano';
  const isLandscape = catalog.orientation === 'landscape';

  const renderTemplate = () => {
    switch (template) {
      case 'spec-sheet':
        return <ArchitecturalSpecSheetTemplate catalog={catalog} products={products} mode={mode} />;
      case 'showroom':
        return <ShowroomCollectionTemplate catalog={catalog} products={products} mode={mode} />;
      case 'global-export':
        return <GlobalExportTemplate catalog={catalog} products={products} mode={mode} />;
      case 'milano':
      default:
        return <MilanoLookbookTemplate catalog={catalog} products={products} mode={mode} />;
    }
  };

  return (
    <div className={`catalog-renderer-container ${mode === 'print' ? 'mode-print' : 'mode-preview'}`}>
      <style jsx global>{`
        /* Screen Preview Styling */
        .mode-preview .catalog-page {
          width: ${isLandscape ? '297mm' : '210mm'};
          min-height: ${isLandscape ? '210mm' : '297mm'};
          max-width: 100%;
          margin: 0 auto 2rem auto;
          box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
          border-radius: 8px;
          background: #ffffff;
          box-sizing: border-box;
          position: relative;
        }

        /* Responsive scaling on small screens */
        @media (max-width: 1024px) {
          .mode-preview .catalog-page {
            width: 100% !important;
            min-height: auto !important;
            padding: 1.5rem !important;
          }
        }

        /* Print Specific Styling */
        @media print {
          @page {
            size: ${catalog.pageSize === 'letter' ? 'letter' : 'A4'} ${isLandscape ? 'landscape' : 'portrait'};
            margin: 0mm;
          }

          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Hide all surrounding non-catalog UI */
          header, nav, footer, .no-print, button, .sidebar {
            display: none !important;
          }

          .catalog-renderer-container {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .catalog-page {
            width: 100% !important;
            height: 100vh !important;
            min-height: 100vh !important;
            max-height: 100vh !important;
            margin: 0 !important;
            padding: 15mm !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }
        }
      `}</style>

      {renderTemplate()}
    </div>
  );
}
