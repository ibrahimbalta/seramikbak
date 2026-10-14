import { useEffect, useState } from 'react';
import type { MaterialInfo } from '../types';
import { listMaterials } from '../hooks/useApi';

interface Props {
  selectedId: string | null;
  onSelect: (material: MaterialInfo) => void;
}

export default function MaterialBrowser({ selectedId, onSelect }: Props) {
  const [materials, setMaterials] = useState<MaterialInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    listMaterials()
      .then((mats) => {
        let finalMats = [...mats];
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const customTile = params.get('tile');
          const customProduct = params.get('product');
          if (customTile) {
            const currentItem: MaterialInfo = {
              id: 'seramikbak_active_tile',
              name: customProduct || 'Seçili Seramik Modeli',
              width_mm: parseInt(params.get('width') || '600', 10),
              height_mm: parseInt(params.get('height') || '1200', 10),
              thumbnail_url: customTile,
              texture_url: customTile,
            };
            finalMats = [currentItem, ...mats.filter((m) => m.id !== 'seramikbak_active_tile')];
            onSelect(currentItem);
          }
        }
        setMaterials(finalMats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [onSelect]);

  const filtered = materials.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return <div className="p-3 text-sm text-slate-300">Loading materials...</div>;
  }

  if (materials.length === 0) {
    return (
      <div className="p-3 text-sm text-gray-400">
        <p>No tile textures found.</p>
        <p className="text-xs mt-1">Add .jpg/.png files to <code>assets/textures/</code> and restart the backend.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-2">
        <input
          type="text"
          placeholder="Search tiles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-slate-700 bg-slate-800 px-2 py-1.5 text-sm text-white placeholder-slate-500 outline-none focus:border-sky-500"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-2 grid grid-cols-2 gap-2">
        {filtered.map((m) => (
          <button
            key={m.id}
            onClick={() => onSelect(m)}
            className={`overflow-hidden rounded-md border-2 bg-slate-900 transition-colors ${
              m.id === selectedId ? 'border-sky-500' : 'border-transparent hover:border-slate-600'
            }`}
          >
            <img
              src={m.thumbnail_url}
              alt={m.name}
              className="w-full aspect-square object-cover"
            />
            <div className="truncate p-1 text-xs text-slate-200">{m.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
