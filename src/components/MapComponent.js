'use client';
import { useEffect, useRef } from 'react';

export default function MapComponent({ dealers = [], userCoords = null, activeDealer = null }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    // Only execute on client side where window and document are defined
    if (typeof window === 'undefined') return;

    // Load Leaflet dynamically
    const L = require('leaflet');
    require('leaflet/dist/leaflet.css');

    // Fix default icon path issues in Next.js
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    // Custom gold marker for dealers
    const goldIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Custom blue marker for user
    const userIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Initialize map if it doesn't exist
    if (!mapInstanceRef.current && mapRef.current) {
      // Centered around Istanbul by default
      const defaultLat = userCoords?.lat || 41.0082;
      const defaultLng = userCoords?.lng || 28.9784;

      const map = L.map(mapRef.current, {
        center: [defaultLat, defaultLng],
        zoom: 12,
        zoomControl: true,
      });

      // Use dark themed Mapbox/OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current = [];

    const boundsPoints = [];

    // Add user marker
    if (userCoords) {
      const userMarker = L.marker([userCoords.lat, userCoords.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup('<b>Mevcut Konumunuz</b>')
        .openPopup();
      markersRef.current.push(userMarker);
      boundsPoints.push([userCoords.lat, userCoords.lng]);
    }

    // Add dealer markers
    dealers.forEach((dealer) => {
      const isHighlighted = activeDealer && activeDealer.id === dealer.id;
      const marker = L.marker([dealer.lat, dealer.lng], { icon: goldIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: var(--font-body); color: #111;">
            <strong style="font-size: 0.9rem;">${dealer.name}</strong><br/>
            <span style="font-size: 0.8rem; color: #555;">${dealer.address}</span><br/>
            <span style="font-size: 0.8rem; font-weight: bold; color: #c5a059;">Tel: ${dealer.phone}</span>
          </div>
        `);

      if (isHighlighted) {
        marker.openPopup();
      }

      markersRef.current.push(marker);
      boundsPoints.push([dealer.lat, dealer.lng]);
    });

    // Fit map bounds to contain all markers
    if (boundsPoints.length > 0) {
      map.fitBounds(boundsPoints, { padding: [50, 50] });
    }

    // Centering on highlighted active dealer
    if (activeDealer) {
      map.setView([activeDealer.lat, activeDealer.lng], 14);
    }

  }, [dealers, userCoords, activeDealer]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '350px' }} />
    </div>
  );
}
