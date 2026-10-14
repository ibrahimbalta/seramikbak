export interface RoomInfo {
  id: string;
  filename: string;
  width: number;
  height: number;
}

export interface MaterialInfo {
  id: string;
  name: string;
  width_mm: number;
  height_mm: number;
  thumbnail_url: string;
  texture_url: string;
}

export interface Surface {
  id: string;
  label: string;
  color: string;
  maskUrl: string;
  maskData: ImageData | null;
  lightmapUrl: string | null;
  materialId: string | null;
  bbox: number[];
  score: number;
}

export interface TileSettings {
  widthMm: number;
  heightMm: number;
  groutWidthMm: number;
  groutColor: string;
  rotation: number;
  layout: 'grid' | 'brick' | 'herringbone';
}

export interface CostEstimate {
  area_sqm: number;
  tiles_needed: number;
  boxes_needed: number;
  total_cost: number;
  coverage_per_box_sqm: number;
}

export const SURFACE_COLORS = [
  'rgba(59, 130, 246, 0.4)',   // blue
  'rgba(239, 68, 68, 0.4)',    // red
  'rgba(34, 197, 94, 0.4)',    // green
  'rgba(168, 85, 247, 0.4)',   // purple
  'rgba(234, 179, 8, 0.4)',    // yellow
  'rgba(236, 72, 153, 0.4)',   // pink
];

export const DEFAULT_TILE_SETTINGS: TileSettings = {
  widthMm: 300,
  heightMm: 300,
  groutWidthMm: 2,
  groutColor: '#888888',
  rotation: 0,
  layout: 'grid',
};
