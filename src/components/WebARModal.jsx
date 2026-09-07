'use client';

import React from 'react';
import ARRoomScannerModal from './ARRoomScannerModal';

/**
 * WebARModal wrapper component.
 * Directly delegates to ARRoomScannerModal to avoid duplicate MediaStream allocations
 * and ensure instantaneous hardware camera track shutdown on modal closure.
 */
export default function WebARModal({ isOpen, onClose, selectedProduct, currentDealer }) {
  if (!isOpen) return null;

  return (
    <ARRoomScannerModal
      isOpen={isOpen}
      onClose={onClose}
      selectedProduct={selectedProduct}
      currentDealer={currentDealer}
    />
  );
}
