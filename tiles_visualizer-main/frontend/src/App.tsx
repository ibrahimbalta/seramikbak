import { useState, useEffect, useRef, useCallback } from 'react';
import PanoramaViewer from './components/PanoramaViewer';
import type { SurfaceName, PanoSurface } from './components/PanoramaViewer';
import MaterialBrowser from './components/MaterialBrowser';
import TileControls from './components/TileControls';
import CostEstimator from './components/CostEstimator';
import ImageModeWorkspace from './components/ImageModeWorkspace';
import {
  loadImage,
  listPanoramaRooms,
  fetchPanoramaRoom,
} from './hooks/useApi';
import type { PanoramaApiResponse, PanoramaRoomSummary } from './hooks/useApi';
import type { MaterialInfo, TileSettings } from './types';
import { DEFAULT_TILE_SETTINGS } from './types';

type Tab = 'surfaces' | 'materials' | 'settings' | 'cost';
type Mode = 'landing' | 'panorama' | 'image';

export default function App() {
  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('mode') === 'panorama') return 'panorama';
      if (p.get('mode') === 'image' || p.has('tile')) return 'image';
    }
    return 'landing';
  });

  // Panorama data from backend
  const [rooms, setRooms] = useState<PanoramaRoomSummary[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [panoInfo, setPanoInfo] = useState<PanoramaApiResponse | null>(null);
  const [surfaces, setSurfaces] = useState<PanoSurface[]>([]);

  // Tile images cache: materialId → HTMLImageElement
  const tileImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

  const [selectedSurface, setSelectedSurface] = useState<SurfaceName | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialInfo | null>(null);
  const [tileSettings, setTileSettings] = useState<TileSettings>(DEFAULT_TILE_SETTINGS);
  const [activeTab, setActiveTab] = useState<Tab>('surfaces');
  const [loading, setLoading] = useState(false);
  const [roomSwitching, setRoomSwitching] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [suggestedRoomId, setSuggestedRoomId] = useState<string | null>(null);

  const loadRoom = useCallback(async (roomId: string) => {
    setRoomSwitching(true);
    try {
      const info = await fetchPanoramaRoom(roomId);
      setPanoInfo(info);
      setActiveRoomId(info.id ?? roomId);

      // New room → fresh surfaces with no materials applied yet.
      const loadedSurfaces: PanoSurface[] = info.surfaces.map((s) => ({
        name: s.name as SurfaceName,
        label: s.label,
        maskUrl: s.mask_url,
        maskData: null,
        materialId: null,
      }));
      setSurfaces(loadedSurfaces);
      setSelectedSurface(null);
    } catch (err) {
      console.error('Failed to load room:', err);
    } finally {
      setRoomSwitching(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const list = await listPanoramaRooms();
        setRooms(list.rooms);
        setSuggestedRoomId(list.default_id ?? list.rooms[0]?.id ?? null);
      } catch (err) {
        console.error('Failed to load panorama rooms:', err);
      } finally {
        setInitLoading(false);
      }
    })();
  }, [loadRoom]);

  const handleRoomSelect = useCallback(
    (roomId: string) => {
      if (roomId === activeRoomId) return;
      loadRoom(roomId);
    },
    [activeRoomId, loadRoom],
  );

  // No-op — Three.js scene re-renders automatically when surfaces/settings change

  const handleSelectSurface = useCallback((name: SurfaceName) => {
    setSelectedSurface(name);
    setActiveTab('materials');
  }, []);

  const handleMaterialSelect = useCallback(
    async (material: MaterialInfo) => {
      setSelectedMaterial(material);
      if (!selectedSurface) return;

      setLoading(true);
      try {
        // Cache tile image
        if (!tileImagesRef.current.has(material.id)) {
          const img = await loadImage(material.texture_url);
          tileImagesRef.current.set(material.id, img);
        }

        // Update surface
        setSurfaces((prev) =>
          prev.map((s) =>
            s.name === selectedSurface ? { ...s, materialId: material.id } : s,
          ),
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [selectedSurface],
  );

  const handleClearSurface = useCallback((name: SurfaceName) => {
    setSurfaces((prev) =>
      prev.map((s) => (s.name === name ? { ...s, materialId: null } : s)),
    );
  }, []);

  const handleSettingsChange = useCallback((newSettings: TileSettings) => {
    setTileSettings(newSettings);
  }, []);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'surfaces', label: 'Surfaces' },
    { id: 'materials', label: 'Tiles' },
    { id: 'settings', label: 'Settings' },
    { id: 'cost', label: 'Cost' },
  ];

  const tabIcons: Record<Tab, string> = {
    surfaces: '◫',
    materials: '◧',
    settings: '⚙',
    cost: '₹',
  };

  const surfaceIcon = (name: string): string => {
    if (name === 'floor') return '▦';
    if (name === 'ceiling') return '▭';
    if (name.startsWith('wall_') || name.startsWith('wall')) return '▯';
    return '◻';
  };

  if (initLoading) {
    return (
      <div className="h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg mb-2">Loading panorama...</div>
          <div className="text-sm text-gray-400">Setting up the room view</div>
        </div>
      </div>
    );
  }

  if (mode === 'landing') {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
          <header className="mb-10 flex items-center justify-between">
            <div>
              <p className="mb-2 inline-block rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-200">
                Tiles Visualizer
              </p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Choose your visualization mode
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
                Start with Panorama mode for 360-degree room previews. Image mode will support
                flat photo workflows in the next step.
              </p>
            </div>
          </header>

          <main className="grid flex-1 gap-5 md:grid-cols-2">
            <button
              onClick={() => setMode('panorama')}
              className="group rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-left transition hover:border-sky-400/60 hover:shadow-lg hover:shadow-sky-900/20"
            >
              <p className="mb-3 inline-block rounded-full bg-sky-500/20 px-2 py-1 text-xs font-medium text-sky-200">
                Available now
              </p>
              <h2 className="text-2xl font-semibold">Panorama Visualization</h2>
              <p className="mt-2 text-sm text-slate-300">
                Apply tiles to floor, walls, and ceiling directly inside immersive 360-degree
                scenes with room presets.
              </p>
              <div className="mt-6 text-sm font-medium text-sky-300 group-hover:text-sky-200">
                Open Panorama Workspace →
              </div>
            </button>

            <button
              onClick={() => setMode('image')}
              className="group rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-left transition hover:border-slate-600"
            >
              <p className="mb-3 inline-block rounded-full bg-fuchsia-500/20 px-2 py-1 text-xs font-medium text-fuchsia-200">
                Available now
              </p>
              <h2 className="text-2xl font-semibold text-slate-100">Image Visualization</h2>
              <p className="mt-2 text-sm text-slate-300">
                Upload or select a room photo, auto-generate semantic masks, and apply tiles.
              </p>
              <div className="mt-6 text-sm font-medium text-fuchsia-300 group-hover:text-fuchsia-200">
                Open Image Workspace →
              </div>
            </button>
          </main>
        </div>
      </div>
    );
  }

  if (mode === 'image') {
    return <ImageModeWorkspace onBack={() => setMode('landing')} />;
  }

  if (!activeRoomId || !panoInfo) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <p className="mb-2 inline-block rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-200">
                Panorama Mode
              </p>
              <h1 className="text-3xl font-semibold tracking-tight">Choose a room to start</h1>
              <p className="mt-2 text-sm text-slate-300">
                Select a room first, then we will open the editor with surfaces, tiles, settings,
                and cost tools.
              </p>
            </div>
            <button
              onClick={() => setMode('landing')}
              className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
            >
              ← Back
            </button>
          </header>

          <main className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => {
              const isSuggested = room.id === suggestedRoomId;
              return (
                <button
                  key={room.id}
                  onClick={() => handleRoomSelect(room.id)}
                  className="group overflow-hidden rounded-xl border border-slate-700 bg-slate-900 text-left transition hover:border-sky-400/60 hover:shadow-lg hover:shadow-sky-900/20"
                  title={room.description ?? room.title}
                >
                  <div className="relative h-40 w-full overflow-hidden bg-slate-800">
                    <img src={room.thumbnail_url} alt={room.title} className="h-full w-full object-cover" />
                    {isSuggested && (
                      <span className="absolute left-3 top-3 rounded-full bg-sky-500/90 px-2 py-1 text-[10px] font-medium text-white">
                        Recommended
                      </span>
                    )}
                  </div>
                  <div className="px-4 py-3">
                    <div className="text-sm font-semibold text-white">{room.title}</div>
                    <div className="mt-1 min-h-8 text-xs text-slate-400">
                      {room.description ?? 'Panorama room ready for tile visualization.'}
                    </div>
                    <div className="mt-3 text-xs font-medium text-sky-300 group-hover:text-sky-200">
                      Open room →
                    </div>
                  </div>
                </button>
              );
            })}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-950 text-white flex flex-col">
      {/* Top bar */}
      <header className="flex items-center gap-3 px-4 py-3 bg-slate-900 border-b border-slate-800 flex-shrink-0">
        <div>
          <h1 className="text-sm font-semibold tracking-wide">Tiles Visualizer</h1>
          <p className="text-[11px] text-slate-400">Panorama workspace</p>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 bg-sky-600/25 text-sky-200 rounded">
          360 Panorama
        </span>
        <div className="flex-1" />
        <button
          onClick={() => setMode('landing')}
          className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
        >
          Change mode
        </button>
        {loading && <div className="text-sky-300 text-xs animate-pulse">Applying texture...</div>}
      </header>

      {/* Main layout */}
      <div className="flex flex-1 min-h-0">
        {/* Left sidebar */}
        <aside className="w-72 flex-shrink-0 bg-slate-900/95 border-r border-slate-800 flex flex-col">
          {/* Tab bar */}
          <div className="grid grid-cols-4 gap-1 border-b border-slate-800 p-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`rounded-md py-2 text-xs transition-colors ${
                  activeTab === t.id
                    ? 'bg-slate-700/80 text-sky-200'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                }`}
              >
                <span className="mr-1">{tabIcons[t.id]}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'surfaces' && (
              <div className="p-3 space-y-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1 mb-2">
                  Room Surfaces
                </h3>
                <p className="text-xs text-slate-400 px-1 mb-2">
                  Select a surface below, then pick a tile to apply.
                </p>
                {surfaces.map((s) => (
                  <div
                    key={s.name}
                    onClick={() => handleSelectSurface(s.name)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-colors border ${
                      selectedSurface === s.name
                        ? 'bg-sky-600/20 border-sky-500/40'
                        : 'hover:bg-slate-800/80 border-slate-800'
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{
                        backgroundColor: s.materialId ? '#22c55e' : '#6b7280',
                      }}
                    />
                    <span className="text-slate-400 text-xs">{surfaceIcon(s.name)}</span>
                    <span className="flex-1 text-white">{s.label}</span>
                    {s.materialId && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearSurface(s.name);
                        }}
                        className="text-slate-500 hover:text-red-400 text-xs"
                        title="Remove tile"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'materials' && (
              <MaterialBrowser
                selectedId={selectedMaterial?.id ?? null}
                onSelect={handleMaterialSelect}
              />
            )}
            {activeTab === 'settings' && (
              <TileControls settings={tileSettings} onChange={handleSettingsChange} />
            )}
            {activeTab === 'cost' && <CostEstimator tileSettings={tileSettings} />}
          </div>
        </aside>

        {/* Panorama viewer + room picker */}
        <main className="flex flex-1 min-w-0 flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-2">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Selected Room</p>
              <p className="text-sm font-medium text-slate-100">
                {panoInfo.title ?? activeRoomId}
              </p>
            </div>
            <p className="text-xs text-slate-400">
              To switch rooms, use <span className="text-slate-200">Change mode</span>
            </p>
          </div>
          <div className="relative min-h-0 flex-1">
            {panoInfo && (
              <PanoramaViewer
                key={activeRoomId ?? 'default'}
                panoramaUrl={panoInfo.panorama_url}
                surfaces={surfaces}
                tileImages={tileImagesRef.current}
                tileSettings={tileSettings}
                selectedSurface={selectedSurface}
                layout={
                  panoInfo.dimensions
                    ? {
                        floorPolygon: panoInfo.dimensions.floor_polygon_m as [number, number][],
                        roomHeightM: panoInfo.dimensions.height_m,
                        cameraHeightM: panoInfo.dimensions.camera_height_m,
                      }
                    : null
                }
              />
            )}
            {roomSwitching && (
              <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                <div className="rounded-full bg-black/70 px-4 py-2 text-sm text-white shadow-lg">
                  Loading room…
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
