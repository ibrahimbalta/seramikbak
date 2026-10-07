'use client';

import React from 'react';
import NeuralRenovationModal from './NeuralRenovationModal';

/**
 * WebARModal wrapper component.
 * Upgraded from legacy 2D trapezoid AR to Neural Renovation Engine:
 * - Real spatial vision analysis (Gemini 3.6 Flash)
 * - Fixture & obstacle protection (klozet, lavabo, küvet maskeleme)
 * - True vanishing 3D perspective tiling
 * - Interactive Before/After split comparison slider
 */
export default function WebARModal({ 
  isOpen, 
  onClose, 
  selectedProduct, 
  currentDealer,
  userLocationCoords,
  userLocationName,
  initialNearbyDealers,
  availableProducts = []
}) {
  if (!isOpen) return null;

  return (
    <NeuralRenovationModal
      isOpen={isOpen}
      onClose={onClose}
      selectedProduct={selectedProduct}
      activeTile={selectedProduct}
      availableProducts={availableProducts}
    />
  );
}
