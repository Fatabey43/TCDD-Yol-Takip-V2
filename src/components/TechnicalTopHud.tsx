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
    <>
      {/* Top Government Accent Strip */}
      <div className="gov-bar w-full h-[5px] shrink-0" />

      {/* Main Official TCDD Navigation Bar */}
      <header className="w-full bg-white border-b border-[#DEE2E6] px-2.5 sm:px-6 py-1.5 sm:py-2.5 z-20 select-none flex items-center justify-between gap-2 sm:gap-3 text-[#212529] shadow-xs font-poppins min-h-[46px] sm:min-h-[54px]">
        {/* Brand & Institution Info */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <img
              src="/tcdd_logo_badge.svg"
              alt="TCDD"
              className="h-7 sm:h-10 w-auto object-contain shrink-0"
              onError={(e) => {
                // Fallback to iconic TCDD insignia
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <div className="border-l-2 border-[#DEE2E6] pl-2 sm:pl-3 min-w-0">
              <div className="font-extrabold text-[#212529] text-[11px] sm:text-base tracking-tight leading-tight flex items-center gap-1.5 truncate">
                <span className="truncate">HAT İZLEME PORTALI</span>
                <span className="bg-emerald-600/10 text-emerald-700 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
                  ALPHA v1.0
                </span>
                <span className="hidden md:inline bg-[#D32F2F]/10 text-[#D32F2F] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#D32F2F]/20 font-roboto-mono">
                  712 KISIM
                </span>
              </div>
              <div className="text-[9px] sm:text-[10px] text-[#6C757D] font-medium leading-tight hidden md:block">
                TÜRKİYE CUMHURİYETİ DEVLET DEMİRYOLLARI
              </div>
            </div>
          </div>

          {/* Center Coordinates & GPS Pill */}
          <div className="hidden lg:flex items-center gap-2 pl-2">
            <div
              className="bg-[#F8F9FA] border border-[#DEE2E6] px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-xs font-roboto-mono"
              title={`Merkez Koordinat: ${centerLat.toFixed(6)}, ${centerLng.toFixed(6)}`}
            >
              <span className="text-[10px] font-bold text-[#6C757D]">KOORDİNAT:</span>
              <span className="font-bold text-[#212529] text-xs">
                {dmsCoordString}
              </span>
            </div>

            {isLiveGpsActive && (
              <div className="bg-[#D32F2F]/10 border border-[#D32F2F]/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-xs font-roboto-mono text-[#D32F2F]">
                <Navigation2 className="w-3.5 h-3.5 animate-spin-slow" />
                <span className="font-bold">
                  KM {currentLiveKm || 'HESAPLANIYOR...'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Center: Search Field & Line Filter */}
        <div className="hidden sm:flex items-center gap-2 flex-1 max-w-md mx-2">
          <div className="flex-1 bg-[#F8F9FA] border border-[#DEE2E6] px-3 py-1.5 flex items-center gap-2 rounded-xl focus-within:border-[#D32F2F] focus-within:bg-white transition-all">
            <Search className="w-3.5 h-3.5 text-[#6C757D] flex-shrink-0" />
            <input
              id="hud-search-input"
              type="text"
              placeholder="KM, makas veya lokasyon ara..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="w-full bg-transparent text-xs text-[#212529] placeholder-[#ADB5BD] outline-none font-poppins"
            />
            {filters.search && (
              <button
                onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
                className="text-[#6C757D] hover:text-[#212529] text-xs px-1 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <div className="hidden md:flex bg-[#F8F9FA] border border-[#DEE2E6] px-2.5 py-1.5 rounded-xl items-center gap-1 text-xs">
            <select
              id="hud-line-select"
              value={filters.selectedLine}
              onChange={(e) => setFilters((prev) => ({ ...prev, selectedLine: e.target.value }))}
              className="bg-transparent text-xs font-medium text-[#212529] outline-none cursor-pointer max-w-[130px] truncate"
            >
              <option value="all">Tüm Hatlar ({totalPoints})</option>
              {availableLines.map((line) => (
                <option key={line} value={line}>
                  {line}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Authenticated User Badge & Profile Menu */}
        <div className="relative flex items-center gap-1.5 shrink-0">
          <div
            id="auth-user-pill"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="user-info text-right cursor-pointer group bg-white hover:bg-[#F8F9FA] border border-[#DEE2E6] p-1 sm:px-3 sm:py-1.5 rounded-xl transition-all flex items-center gap-1.5 sm:gap-2 shadow-2xs hover:border-[#D32F2F]/30"
          >
            <div className="flex flex-col text-right">
              <span className="text-[10px] sm:text-xs font-bold text-[#212529] group-hover:text-[#D32F2F] transition-colors max-w-[75px] sm:max-w-none truncate leading-tight">
                {user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Admin'}
              </span>
              <span className="text-[9px] text-[#6C757D] font-medium leading-tight hidden sm:block">
                {role === 'admin' ? 'Sistem Sorumlusu' : 'Saha Personeli'}
              </span>
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#D32F2F] text-white flex items-center justify-center font-bold text-[11px] sm:text-xs shadow-xs shrink-0">
              {(user?.name || user?.email || 'A').charAt(0).toUpperCase()}
            </div>
            <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#6C757D] group-hover:text-[#212529] hidden sm:block" />
          </div>

          {/* User Context Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-[#DEE2E6] rounded-xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 font-poppins text-slate-800">
              <div className="px-3 py-2 border-b border-[#DEE2E6] text-xs">
                <div className="font-bold text-[#212529] truncate">{user?.name || 'Hasan Polat Türkmen'}</div>
                <div className="text-[10px] text-[#6C757D] truncate font-roboto-mono">{user?.email || 'admin@tcdd.gov.tr'}</div>
                <div className="mt-1 text-[9px] font-bold text-[#D32F2F] uppercase bg-[#D32F2F]/10 px-1.5 py-0.5 rounded border border-[#D32F2F]/20 inline-block">
                  {role === 'admin' ? 'SİSTEM YÖNETİCİSİ' : 'SAHA PERSONELİ'}
                </div>
              </div>

              {canManageUsers && onOpenUserManagement && (
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onOpenUserManagement();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#212529] hover:bg-[#F8F9FA] hover:text-[#D32F2F] rounded-lg transition-colors text-left cursor-pointer font-medium"
                >
                  <Shield className="w-3.5 h-3.5 text-[#D32F2F]" />
                  <span>Kullanıcı Yönetimi</span>
                </button>
              )}

              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#D32F2F] hover:bg-rose-50 rounded-lg transition-colors text-left cursor-pointer mt-1 border-t border-[#DEE2E6] font-medium"
              >
                <LogOut className="w-3.5 h-3.5 text-[#D32F2F]" />
                <span>Oturumu Kapat</span>
              </button>
            </div>
          )}
        </div>
      </header>
    </>
  );
};
