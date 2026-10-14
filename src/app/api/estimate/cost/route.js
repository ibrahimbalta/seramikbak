import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const {
      area_sqm = 10,
      tile_width_mm = 600,
      tile_height_mm = 1200,
      tiles_per_box = 2,
      price_per_box = 450,
      waste_factor = 0.1
    } = await req.json();

    const tileAreaSqm = (tile_width_mm / 1000) * (tile_height_mm / 1000);
    const coveragePerBox = tileAreaSqm * tiles_per_box;
    const requiredCoverage = area_sqm * (1 + waste_factor);
    const tilesNeeded = Math.ceil(requiredCoverage / Math.max(0.01, tileAreaSqm));
    const boxesNeeded = Math.ceil(requiredCoverage / Math.max(0.01, coveragePerBox));
    const totalCost = boxesNeeded * price_per_box;

    return NextResponse.json({
      area_sqm: Math.round(area_sqm * 100) / 100,
      tiles_needed: tilesNeeded,
      boxes_needed: boxesNeeded,
      total_cost: Math.round(totalCost * 100) / 100,
      coverage_per_box_sqm: Math.round(coveragePerBox * 10000) / 10000
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
