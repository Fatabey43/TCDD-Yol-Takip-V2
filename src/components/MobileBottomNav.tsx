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
      className="fixed bottom-0 left-0 right-0 z-20 sm:hidden bg-white border-t border-[#DEE2E6] text-[#212529] select-none pb-safe font-poppins shadow-[0_-3px_12px_rgba(0,0,0,0.05)]"
    >
      <div className="flex items-center justify-around h-12.5 px-1 bg-white">
        {/* Map Tab */}
        <button
          onClick={() => setViewMode('map')}
          className={`flex flex-col items-center justify-center flex-1 py-0.5 transition-colors ${
            viewMode === 'map' ? 'text-[#D32F2F] font-bold' : 'text-[#6C757D] hover:text-[#212529]'
          }`}
        >
          <div
            className={`p-1 rounded-md transition-colors ${
              viewMode === 'map' ? 'bg-[#D32F2F]/10 border border-[#D32F2F]/25 text-[#D32F2F]' : ''
            }`}
          >
            <MapIcon className="w-4.5 h-4.5" />
          </div>
          <span className="text-[9px] mt-0.5 tracking-tight font-medium">HARİTA</span>
        </button>

        {/* List Tab */}
        <button
          onClick={() => setViewMode('list')}
          className={`flex flex-col items-center justify-center flex-1 py-0.5 transition-colors relative ${
            viewMode === 'list' ? 'text-[#D32F2F] font-bold' : 'text-[#6C757D] hover:text-[#212529]'
          }`}
        >
          <div
            className={`p-1 rounded-md transition-colors ${
              viewMode === 'list' ? 'bg-[#D32F2F]/10 border border-[#D32F2F]/25 text-[#D32F2F]' : ''
            }`}
          >
            <List className="w-4.5 h-4.5" />
          </div>
          <span className="text-[9px] mt-0.5 tracking-tight font-medium">
            LİSTE <span className="text-[8px] font-roboto-mono opacity-80">({pointCount})</span>
          </span>
        </button>

        {/* Center Primary Action: Add Point (if authorized) */}
        {canAddPoint && (
          <button
            onClick={onOpenAddModal}
            className="flex flex-col items-center justify-center -mt-3.5 flex-none px-1.5 group cursor-pointer"
            title="Yeni Demiryolu Noktası Ekle"
          >
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center group-active:scale-95 transition-all text-white border-2 border-white shadow-[0_3px_12px_rgba(211,47,47,0.4)] ${
                isAddMode
                  ? 'bg-amber-500 hover:bg-amber-600'
                  : 'bg-[#D32F2F] hover:bg-[#B71C1C]'
              }`}
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span
              className={`text-[8.5px] font-bold mt-0.5 tracking-wider ${
                isAddMode ? 'text-amber-600' : 'text-[#D32F2F]'
              }`}
            >
              {isAddMode ? 'İŞARETLE' : '+EKLE'}
            </span>
          </button>
        )}

        {/* Search & Filter Toggle */}
        <button
          onClick={onToggleSearch}
          className={`flex flex-col items-center justify-center flex-1 py-0.5 transition-colors ${
            isSearchActive ? 'text-[#D32F2F] font-bold' : 'text-[#6C757D] hover:text-[#212529]'
          }`}
        >
          <div
            className={`p-1 rounded-md relative transition-colors ${
              isSearchActive ? 'bg-[#D32F2F]/10 border border-[#D32F2F]/25 text-[#D32F2F]' : ''
            }`}
          >
            <Search className="w-4.5 h-4.5" />
            {isSearchActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#D32F2F] absolute top-0.5 right-0.5 shadow-xs" />
            )}
          </div>
          <span className="text-[9px] mt-0.5 tracking-tight font-medium">FİLTRE</span>
        </button>

        {/* Actions Menu */}
        <button
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center flex-1 py-0.5 text-[#6C757D] hover:text-[#212529] transition-colors"
        >
          <div className="p-1 rounded-md">
            <MoreHorizontal className="w-4.5 h-4.5" />
          </div>
          <span className="text-[9px] mt-0.5 tracking-tight font-medium">MENÜ</span>
        </button>
      </div>
    </nav>
  );
};
