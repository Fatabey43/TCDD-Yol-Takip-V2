import React, { useState } from 'react';
import { FilterOptions } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Navigation2,
  Search,
  Filter,
  LogOut,
  User,
  Shield,
  Layers,
  ChevronDown,
  Sparkles,
  Wifi,
  WifiOff,
} from 'lucide-react';

interface TechnicalTopHudProps {
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  availableLines: string[];
  totalPoints: number;
  filteredCount: number;
  isOnline: boolean;
  mapBounds: { minLat: number; maxLat: number; minLng: number; maxLng: number } | null;
  currentLiveKm?: string;
  isLiveGpsActive: boolean;
  onToggleLiveGps?: () => void;
  onOpenMobileActions?: () => void;
  onOpenLogin?: () => void;
  onOpenUserManagement?: () => void;
}

// Convert decimal degrees to standard degrees, minutes, seconds format
function formatDMS(dec: number, isLat: boolean): string {
  if (isNaN(dec)) return isLat ? `39°23'43.6"N` : `30°06'19.1"E`;
  const abs = Math.abs(dec);
  const degrees = Math.floor(abs);
  const minutes = Math.floor((abs - degrees) * 60);
  const seconds = ((abs - degrees - minutes / 60) * 3600).toFixed(1);
  const dir = isLat ? (dec >= 0 ? 'N' : 'S') : (dec >= 0 ? 'E' : 'W');
  return `${degrees}°${minutes}'${seconds}"${dir}`;
}

export const TechnicalTopHud: React.FC<TechnicalTopHudProps> = ({
  filters,
  setFilters,
  availableLines,
  totalPoints,
  filteredCount,
  isOnline,
  mapBounds,
  currentLiveKm,
  isLiveGpsActive,
  onToggleLiveGps,
  onOpenMobileActions,
  onOpenLogin,
  onOpenUserManagement,
}) => {
  const { user, role, isAdmin, canManageUsers, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Compute center coordinate from map bounds
  const centerLat = mapBounds ? (mapBounds.minLat + mapBounds.maxLat) / 2 : 39.3954;
  const centerLng = mapBounds ? (mapBounds.minLng + mapBounds.maxLng) / 2 : 30.1053;
  const dmsCoordString = `${formatDMS(centerLat, true)} ${formatDMS(centerLng, false)}`;

  return (
    <header className="w-full bg-[#0c0c0e]/95 border-b border-[#2d2d33] px-3 sm:px-6 py-2.5 z-20 select-none flex flex-wrap items-center justify-between gap-3 text-[#e0e0e4]">
      {/* Left: CENTER_COORD Pill */}
      <div className="flex items-center gap-3">
        <div
          id="center-coord-pill"
          className="bg-black border border-[#2d2d33] border-l-4 border-l-[#00ff88] px-3 py-1.5 rounded-sm flex flex-col justify-center shadow-xs"
          title={`Merkez Koordinat: ${centerLat.toFixed(6)}, ${centerLng.toFixed(6)}`}
        >
          <span className="text-[9px] uppercase tracking-wider text-[#e0e0e4]/50 font-bold leading-none mb-0.5">
            CENTER_COORD
          </span>
          <span className="text-xs sm:text-sm font-bold text-white tracking-tight font-mono-tech">
            {dmsCoordString}
          </span>
        </div>

        {/* Live GPS KM Telemetry Pill */}
        {isLiveGpsActive && (
          <div className="hidden md:flex bg-black border border-[#00ff88]/40 px-3 py-1.5 rounded-sm items-center gap-2 shadow-[0_0_12px_rgba(0,255,136,0.2)]">
            <Navigation2 className="w-4 h-4 text-[#00ff88] animate-spin-slow" />
            <div className="flex flex-col">
              <span className="text-[8px] uppercase tracking-wider text-[#00ff88] font-bold leading-none">
                LIVE_CHAINAGE
              </span>
              <span className="text-xs font-bold text-white font-mono-tech">
                KM {currentLiveKm || 'HESAPLANIYOR...'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Center: Search & Filter Controls (Technical Console Style) */}
      <div className="flex items-center gap-2 flex-1 max-w-xl mx-auto">
        {/* Monospace Query Field */}
        <div className="flex-1 bg-black border border-[#2d2d33] px-3 py-1.5 flex items-center gap-2 rounded-sm focus-within:border-[#00ff88]/70 transition-colors">
          <Search className="w-3.5 h-3.5 text-[#e0e0e4]/40 flex-shrink-0" />
          <input
            id="hud-search-input"
            type="text"
            placeholder="QUERY:// KM_LOC"
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="w-full bg-transparent text-xs text-white placeholder-[#e0e0e4]/30 outline-none font-mono-tech"
          />
          {filters.search && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
              className="text-[#e0e0e4]/40 hover:text-white text-xs px-1 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Hat Seçimi */}
        <div className="hidden sm:flex bg-black border border-[#2d2d33] px-2.5 py-1.5 rounded-sm items-center gap-1.5 text-xs">
          <span className="text-[10px] text-[#e0e0e4]/40 font-bold">HAT:</span>
          <select
            id="hud-line-select"
            value={filters.selectedLine}
            onChange={(e) => setFilters((prev) => ({ ...prev, selectedLine: e.target.value }))}
            className="bg-transparent text-xs font-semibold text-[#00ff88] outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#16161a] text-white">TÜMÜ ({totalPoints})</option>
            {availableLines.map((line) => (
              <option key={line} value={line} className="bg-[#16161a] text-white">
                {line.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Kategori Seçimi */}
        <div className="hidden lg:flex bg-black border border-[#2d2d33] px-2.5 py-1.5 rounded-sm items-center gap-1.5 text-xs">
          <span className="text-[10px] text-[#e0e0e4]/40 font-bold">KAT:</span>
          <select
            id="hud-cat-select"
            value={filters.category}
            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
            className="bg-transparent text-xs font-semibold text-[#00ff88] outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#16161a] text-white">TÜM KATEGORİLER</option>
            <option value="switch" className="bg-[#16161a] text-white">MAKASLAR (32)</option>
            <option value="culvert" className="bg-[#16161a] text-white">MENFEZLER</option>
            <option value="crossing" className="bg-[#16161a] text-white">HEMZEMİN GEÇİTLER</option>
            <option value="station" className="bg-[#16161a] text-white">İSTASYONLAR</option>
            <option value="km_marker" className="bg-[#16161a] text-white">KM TAŞLARI</option>
          </select>
        </div>

        {/* Clear filter button if active */}
        {(filters.search || filters.selectedLine !== 'all' || filters.category !== 'all') && (
          <button
            onClick={() => setFilters({ search: '', selectedLine: 'all', category: 'all' })}
            className="bg-red-950/60 hover:bg-red-900 border border-red-700/60 text-red-300 text-[10px] font-bold px-2 py-1 rounded-sm cursor-pointer whitespace-nowrap"
            title="Filtreleri Temizle"
          >
            ✕ ({filteredCount})
          </button>
        )}
      </div>

      {/* Right: AUTH_USER Pill & Menu */}
      <div className="relative flex items-center gap-2">
        <div
          id="auth-user-pill"
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className="user-info text-right cursor-pointer group bg-black hover:bg-[#16161a] border border-[#2d2d33] px-3 py-1.5 rounded-sm transition-colors flex items-center gap-2"
        >
          <div className="flex flex-col text-right">
            <span className="text-[8px] uppercase tracking-wider text-[#e0e0e4]/50 leading-none">
              AUTH_USER
            </span>
            <span className="text-xs font-bold text-white group-hover:text-[#00ff88] transition-colors font-mono-tech">
              {(user?.name || user?.email?.split('@')[0] || 'HASAN').toUpperCase()} / {(role || 'YÖNETİCİ').toUpperCase()}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[#e0e0e4]/40 group-hover:text-white" />
        </div>

        {/* User Context Dropdown Menu */}
        {isUserMenuOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-[#16161a] border border-[#2d2d33] rounded-md shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-2 border-b border-[#2d2d33] text-xs">
              <div className="font-bold text-white truncate">{user?.name || 'Hasan Polat Türkmen'}</div>
              <div className="text-[10px] text-[#e0e0e4]/60 truncate font-mono">{user?.email || 'admin@tcdd.gov.tr'}</div>
              <div className="mt-1 text-[9px] font-mono text-[#00ff88] uppercase bg-[#00ff88]/10 px-1.5 py-0.5 rounded border border-[#00ff88]/20 inline-block font-bold">
                {role === 'admin' ? 'SİSTEM YÖNETİCİSİ' : 'SAHA PERSONELİ'}
              </div>
            </div>

            {canManageUsers && onOpenUserManagement && (
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  onOpenUserManagement();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#e0e0e4] hover:bg-white/5 hover:text-[#00ff88] rounded transition-colors text-left cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-[#00ff88]" />
                <span>Kullanıcı Yönetimi</span>
              </button>
            )}

            <button
              onClick={() => {
                setIsUserMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-950/40 rounded transition-colors text-left cursor-pointer mt-1 border-t border-[#2d2d33]"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span>Oturumu Kapat</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
