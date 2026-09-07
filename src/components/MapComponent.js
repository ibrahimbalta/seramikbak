'use client';
import { useEffect, useRef } from 'react';

export default function MapComponent({ dealers = [], userCoords = null, activeDealer = null }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    // Only execute on client side where window and document are defined
    if (typeof window === 'undefined') return;

    let isMounted = true;

    try {
      // Load Leaflet dynamically
      const L = require('leaflet');

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

      if (!mapRef.current) return;

      // Handle re-initialization cleanly if container already has a Leaflet instance
      if (mapRef.current._leaflet_id && !mapInstanceRef.current) {
        delete mapRef.current._leaflet_id;
      }

      // Initialize map if it doesn't exist yet
      if (!mapInstanceRef.current) {
        const defaultLat = (userCoords && typeof userCoords.lat === 'number' && !isNaN(userCoords.lat)) ? userCoords.lat : 41.0082;
        const defaultLng = (userCoords && typeof userCoords.lng === 'number' && !isNaN(userCoords.lng)) ? userCoords.lng : 28.9784;

        const map = L.map(mapRef.current, {
          center: [defaultLat, defaultLng],
          zoom: 12,
          zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;
      if (!map) return;

      // Clear existing markers safely
      markersRef.current.forEach((marker) => {
        try {
          map.removeLayer(marker);
        } catch (e) {}
      });
      markersRef.current = [];

      const boundsPoints = [];

      // Add user marker if valid coords exist
      if (userCoords && typeof userCoords.lat === 'number' && typeof userCoords.lng === 'number' && !isNaN(userCoords.lat) && !isNaN(userCoords.lng)) {
        const userMarker = L.marker([userCoords.lat, userCoords.lng], { icon: userIcon })
          .addTo(map)
          .bindPopup('<b>Mevcut Konumunuz</b>');
        markersRef.current.push(userMarker);
        boundsPoints.push([userCoords.lat, userCoords.lng]);
      }

      // Add dealer markers safely
      const safeDealers = Array.isArray(dealers) ? dealers : [];
      safeDealers.forEach((dealer) => {
        if (!dealer) return;
        const dLat = typeof dealer.lat === 'number' ? dealer.lat : parseFloat(dealer.lat);
        const dLng = typeof dealer.lng === 'number' ? dealer.lng : parseFloat(dealer.lng);

        if (isNaN(dLat) || isNaN(dLng)) return;

        const isHighlighted = activeDealer && activeDealer.id === dealer.id;
        const dealerName = dealer.name || 'Yetkili Bayi';
        const dealerAddress = dealer.address || '';
        const dealerPhone = dealer.phone || '';

        const marker = L.marker([dLat, dLng], { icon: goldIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: var(--font-body); color: #111;">
              <strong style="font-size: 0.9rem;">${dealerName}</strong><br/>
              <span style="font-size: 0.8rem; color: #555;">${dealerAddress}</span><br/>
              <span style="font-size: 0.8rem; font-weight: bold; color: #c5a059;">Tel: ${dealerPhone}</span>
            </div>
          `);

        if (isHighlighted) {
          try {
            marker.openPopup();
          } catch (e) {}
        }

        markersRef.current.push(marker);
        boundsPoints.push([dLat, dLng]);
      });

      // Fit map bounds safely to contain all markers
      if (boundsPoints.length > 1) {
        try {
          map.fitBounds(boundsPoints, { padding: [40, 40], maxZoom: 15 });
        } catch (e) {
          console.warn('fitBounds warning:', e);
        }
      } else if (boundsPoints.length === 1) {
        try {
          map.setView(boundsPoints[0], 13);
        } catch (e) {}
      }

      // Centering on highlighted active dealer if requested
      if (activeDealer) {
        const aLat = typeof activeDealer.lat === 'number' ? activeDealer.lat : parseFloat(activeDealer.lat);
        const aLng = typeof activeDealer.lng === 'number' ? activeDealer.lng : parseFloat(activeDealer.lng);
        if (!isNaN(aLat) && !isNaN(aLng)) {
          try {
            map.setView([aLat, aLng], 14);
          } catch (e) {}
        }
      }

      // Draw a dashed route line from user to active dealer safely
      if (userCoords && activeDealer) {
        const uLat = typeof userCoords.lat === 'number' ? userCoords.lat : parseFloat(userCoords.lat);
        const uLng = typeof userCoords.lng === 'number' ? userCoords.lng : parseFloat(userCoords.lng);
        const aLat = typeof activeDealer.lat === 'number' ? activeDealer.lat : parseFloat(activeDealer.lat);
        const aLng = typeof activeDealer.lng === 'number' ? activeDealer.lng : parseFloat(activeDealer.lng);

        if (!isNaN(uLat) && !isNaN(uLng) && !isNaN(aLat) && !isNaN(aLng)) {
          const latlngs = [[uLat, uLng], [aLat, aLng]];
          const routeLine = L.polyline(latlngs, {
            color: '#b38e47',
            weight: 4,
            opacity: 0.8,
            dashArray: '6, 10',
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(map);

          markersRef.current.push(routeLine);
          try {
            map.fitBounds(latlngs, { padding: [60, 60], maxZoom: 15 });
          } catch (e) {}
        }
      }
    } catch (err) {
      console.warn('Leaflet Map Error handled gracefully:', err);
    }

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
      if (mapRef.current && mapRef.current._leaflet_id) {
        delete mapRef.current._leaflet_id;
      }
    };
  }, [dealers, userCoords, activeDealer]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '350px' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '350px', borderRadius: '14px' }} />
    </div>
  );
}
