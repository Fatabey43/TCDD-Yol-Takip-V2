import React from 'react';
import { Map as MapIcon, List, Plus, Search, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface MobileBottomNavProps {
  viewMode: 'map' | 'list';
  setViewMode: (mode: 'map' | 'list') => void;
  pointCount: number;
  onOpenAddModal: () => void;
  onToggleSearch: () => void;
  isSearchActive: boolean;
  onOpenMenu: () => void;
  isAddMode?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  viewMode,
  setViewMode,
  pointCount,
  onOpenAddModal,
  onToggleSearch,
  isSearchActive,
  onOpenMenu,
  isAddMode,
}) => {
  const { canAddPoint } = useAuth();

  return (
    <nav
      id="mobile-bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-20 sm:hidden bg-black border-t border-[#2d2d33] text-[#e0e0e4] select-none pb-safe font-mono-tech"
    >
      <div className="flex items-center justify-around h-14 px-2">
        {/* Map Tab */}
        <button
          onClick={() => setViewMode('map')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            viewMode === 'map' ? 'text-[#00ff88] font-bold' : 'text-[#e0e0e4]/50 hover:text-white'
          }`}
        >
          <div className={`p-1 rounded ${viewMode === 'map' ? 'bg-[#00ff88]/15 border border-[#00ff88]/30' : ''}`}>
            <MapIcon className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5">HARİTA</span>
        </button>

        {/* List Tab */}
        <button
          onClick={() => setViewMode('list')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors relative ${
            viewMode === 'list' ? 'text-[#00ff88] font-bold' : 'text-[#e0e0e4]/50 hover:text-white'
          }`}
        >
          <div className={`p-1 rounded ${viewMode === 'list' ? 'bg-[#00ff88]/15 border border-[#00ff88]/30' : ''}`}>
            <List className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5">
            LİSTE <span className="text-[9px] opacity-75 font-mono">({pointCount})</span>
          </span>
        </button>

        {/* Center Primary Action: Add Point (if authorized) */}
        {canAddPoint && (
          <button
            onClick={onOpenAddModal}
            className="flex flex-col items-center justify-center -mt-4 flex-none px-2 group cursor-pointer"
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center group-active:scale-95 transition-all border border-[#00ff88] ${
                isAddMode
                  ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.5)]'
                  : 'bg-[#00ff88] text-black shadow-[0_0_15px_rgba(0,255,136,0.5)]'
              }`}
            >
              <Plus className="w-6 h-6 stroke-[3]" />
            </div>
            <span
              className={`text-[9px] font-bold mt-1 tracking-wider ${
                isAddMode ? 'text-amber-400' : 'text-[#00ff88]'
              }`}
            >
              {isAddMode ? 'İŞARETLE' : '+EKLE'}
            </span>
          </button>
        )}

        {/* Search & Filter Toggle */}
        <button
          onClick={onToggleSearch}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isSearchActive ? 'text-[#00ff88] font-bold' : 'text-[#e0e0e4]/50 hover:text-white'
          }`}
        >
          <div className={`p-1 rounded relative ${isSearchActive ? 'bg-[#00ff88]/15 border border-[#00ff88]/30' : ''}`}>
            <Search className="w-5 h-5" />
            {isSearchActive && (
              <span className="w-2 h-2 rounded-full bg-[#00ff88] absolute top-0.5 right-0.5 status-dot-glow" />
            )}
          </div>
          <span className="text-[10px] mt-0.5">FİLTRE</span>
        </button>

        {/* Actions Menu */}
        <button
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center flex-1 py-1 text-[#e0e0e4]/50 hover:text-white transition-colors"
        >
          <div className="p-1 rounded">
            <MoreHorizontal className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5">MENÜ</span>
        </button>
      </div>
    </nav>
  );
};
