import React from 'react';
import {
  Map as MapIcon,
  MapPin,
  Navigation2,
  AlertTriangle,
  Landmark,
  ClipboardList,
  HardDriveDownload,
  Palette,
  FileSpreadsheet,
  DownloadCloud,
  ShieldCheck,
  Plus,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';

interface TechnicalNavDockProps {
  activeTab: 'map' | 'list' | 'palette';
  setActiveTab: (tab: 'map' | 'list' | 'palette') => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isLiveGpsActive: boolean;
  onToggleLiveGps: () => void;
  onOpenTakyidat: () => void;
  activeTakyidatCount: number;
  onOpenParcels: () => void;
  totalParcelsCount: number;
  onOpenFieldWorks: () => void;
  fieldWorksCount: number;
  onOpenOfflineModal: () => void;
  isOfflineMode: boolean;
  onOpenReports: () => void;
  onOpenImportExport: () => void;
  onOpenUserManagement?: () => void;
  canManageUsers: boolean;
  onOpenAddModal: () => void;
  canAddPoint: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const TechnicalNavDock: React.FC<TechnicalNavDockProps> = ({
  activeTab,
  setActiveTab,
  isSidebarOpen,
  setIsSidebarOpen,
  isLiveGpsActive,
  onToggleLiveGps,
  onOpenTakyidat,
  activeTakyidatCount,
  onOpenParcels,
  totalParcelsCount,
  onOpenFieldWorks,
  fieldWorksCount,
  onOpenOfflineModal,
  isOfflineMode,
  onOpenReports,
  onOpenImportExport,
  onOpenUserManagement,
  canManageUsers,
  onOpenAddModal,
  canAddPoint,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <nav
      id="technical-nav-dock"
      aria-label="Sistem 712 Ana Gezinti Paneli"
      className="hidden sm:flex flex-col items-center justify-between w-20 bg-black border-r border-[#2d2d33] py-4 z-30 select-none flex-shrink-0"
    >
      {/* Top Logo Box */}
      <div className="flex flex-col items-center gap-4 w-full">
        <button
          onClick={() => {
            setActiveTab('map');
            if (!isSidebarOpen) setIsSidebarOpen(true);
          }}
          title="TCDD Sistem 712 - Harita & Nokta Paneli"
          className="w-11 h-11 bg-[#00ff88] text-black font-extrabold rounded flex items-center justify-center text-xl shadow-[0_0_15px_rgba(0,255,136,0.4)] hover:brightness-110 transition-all cursor-pointer font-syne"
        >
          T
        </button>

        {/* Navigation Icon List */}
        <div className="flex flex-col items-center gap-2.5 w-full px-2">
          {/* Map View */}
          <button
            onClick={() => setActiveTab('map')}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all cursor-pointer relative group ${
              activeTab === 'map'
                ? 'bg-[#e0e0e4]/10 text-[#00ff88] border border-[#00ff88]/30 shadow-xs'
                : 'text-[#e0e0e4]/60 hover:text-white hover:bg-white/5'
            }`}
            title="Harita Görünümü [M]"
          >
            <MapIcon className="w-5 h-5" />
            <span className="sr-only">Harita</span>
            {activeTab === 'map' && (
              <span className="absolute -left-2 w-1 h-5 bg-[#00ff88] rounded-r" />
            )}
          </button>

          {/* Points List View */}
          <button
            onClick={() => {
              setIsSidebarOpen((prev) => !prev);
              if (activeTab !== 'map') setActiveTab('map');
            }}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all cursor-pointer relative group ${
              isSidebarOpen
                ? 'bg-[#e0e0e4]/10 text-[#00ff88] border border-[#00ff88]/30 shadow-xs'
                : 'text-[#e0e0e4]/60 hover:text-white hover:bg-white/5'
            }`}
            title="Noktalar Listesi Paneli (Aç/Kapat)"
          >
            <MapPin className="w-5 h-5" />
            <span className="sr-only">Noktalar</span>
          </button>

          {/* Live GPS Tracker */}
          <button
            onClick={onToggleLiveGps}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all cursor-pointer relative group ${
              isLiveGpsActive
                ? 'bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88] shadow-[0_0_12px_rgba(0,255,136,0.3)]'
                : 'text-[#e0e0e4]/60 hover:text-white hover:bg-white/5'
            }`}
            title={isLiveGpsActive ? 'Canlı GPS KM Takibi Aktif (Kapat)' : 'Canlı GPS KM Takibini Başlat'}
          >
            <Navigation2 className={`w-5 h-5 ${isLiveGpsActive ? 'animate-pulse' : ''}`} />
            {isLiveGpsActive && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#00ff88] status-dot-glow" />
            )}
          </button>

          {/* Takyidat (Speed Restrictions) */}
          <button
            onClick={onOpenTakyidat}
            className="w-12 h-12 rounded-lg flex items-center justify-center text-[#e0e0e4]/60 hover:text-white hover:bg-white/5 transition-all cursor-pointer relative group"
            title="Takyidat Hız Sınırları & Uyarıları"
          >
            <AlertTriangle className="w-5 h-5 text-amber-400/90" />
            {activeTakyidatCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-amber-500 text-black text-[9px] font-bold px-1 rounded-full flex items-center justify-center">
                {activeTakyidatCount}
              </span>
            )}
          </button>

          {/* Kadastro & Parcels */}
          <button
            onClick={onOpenParcels}
            className="w-12 h-12 rounded-lg flex items-center justify-center text-[#e0e0e4]/60 hover:text-white hover:bg-white/5 transition-all cursor-pointer relative group"
            title="Kadastro, Tapu & Kamulaştırma Parselleri"
          >
            <Landmark className="w-5 h-5 text-purple-400/90" />
            {totalParcelsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-purple-600 text-white text-[9px] font-bold px-1 rounded-full flex items-center justify-center">
                {totalParcelsCount}
              </span>
            )}
          </button>

          {/* Field Works */}
          <button
            onClick={onOpenFieldWorks}
            className="w-12 h-12 rounded-lg flex items-center justify-center text-[#e0e0e4]/60 hover:text-white hover:bg-white/5 transition-all cursor-pointer relative group"
            title="Saha İş Listesi & Koordinasyon"
          >
            <ClipboardList className="w-5 h-5 text-sky-400/90" />
            {fieldWorksCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-sky-600 text-white text-[9px] font-bold px-1 rounded-full flex items-center justify-center">
                {fieldWorksCount}
              </span>
            )}
          </button>

          {/* Offline Map Manager */}
          <button
            onClick={onOpenOfflineModal}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all cursor-pointer relative group ${
              isOfflineMode
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'text-[#e0e0e4]/60 hover:text-white hover:bg-white/5'
            }`}
            title="Çevrimdışı (Offline) Harita ve Önbellek Yönetimi"
          >
            <HardDriveDownload className="w-5 h-5" />
          </button>

          {/* Color Palette */}
          <button
            onClick={() => setActiveTab(activeTab === 'palette' ? 'map' : 'palette')}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all cursor-pointer relative group ${
              activeTab === 'palette'
                ? 'bg-[#e0e0e4]/10 text-[#00ff88] border border-[#00ff88]/30 shadow-xs'
                : 'text-[#e0e0e4]/60 hover:text-white hover:bg-white/5'
            }`}
            title="Demiryolu Renk Paleti & Simge Ayarları"
          >
            <Palette className="w-5 h-5" />
          </button>

          {/* Reports */}
          <button
            onClick={onOpenReports}
            className="w-12 h-12 rounded-lg flex items-center justify-center text-[#e0e0e4]/60 hover:text-white hover:bg-white/5 transition-all cursor-pointer relative group"
            title="Saha Raporları & Excel / PDF Çıktısı"
          >
            <FileSpreadsheet className="w-5 h-5" />
          </button>

          {/* Import / Export */}
          <button
            onClick={onOpenImportExport}
            className="w-12 h-12 rounded-lg flex items-center justify-center text-[#e0e0e4]/60 hover:text-white hover:bg-white/5 transition-all cursor-pointer relative group"
            title="KML, GeoJSON, Excel ve Yedek İçe/Dışa Aktar"
          >
            <DownloadCloud className="w-5 h-5" />
          </button>

          {/* User Management */}
          {canManageUsers && onOpenUserManagement && (
            <button
              onClick={onOpenUserManagement}
              className="w-12 h-12 rounded-lg flex items-center justify-center text-[#e0e0e4]/60 hover:text-white hover:bg-white/5 transition-all cursor-pointer relative group"
              title="Kullanıcı &amp; Güvenlik Yetkileri"
            >
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </button>
          )}

          {/* Refresh / Sync Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="w-12 h-12 rounded-lg flex items-center justify-center text-[#e0e0e4]/60 hover:text-white hover:bg-white/5 transition-all cursor-pointer relative group disabled:opacity-40"
            title="Sunucu Senkronizasyonunu Yenile"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-[#00ff88]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Floating Glowing Neon Green Quick Add Button */}
      <div className="w-full px-3 pt-2">
        <button
          onClick={onOpenAddModal}
          disabled={!canAddPoint}
          className={`w-12 h-12 rounded-full bg-[#00ff88] text-black text-2xl font-bold flex items-center justify-center transition-all cursor-pointer mx-auto shadow-[0_0_16px_rgba(0,255,136,0.5)] hover:scale-105 active:scale-95 ${
            !canAddPoint ? 'opacity-40 cursor-not-allowed' : ''
          }`}
          title={canAddPoint ? 'Yeni Demiryolu Noktası Ekle (+)' : 'Nokta ekleme yetkisi sistem yöneticisine aittir'}
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>
      </div>
    </nav>
  );
};
