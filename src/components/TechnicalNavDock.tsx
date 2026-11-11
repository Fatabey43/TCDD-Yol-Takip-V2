import React from 'react';
import {
  Map as MapIcon,
  MapPin,
  Navigation2,
  AlertTriangle,
  ClipboardList,
  HardDriveDownload,
  Palette,
  FileSpreadsheet,
  DownloadCloud,
  ShieldCheck,
  Plus,
  RefreshCw,
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
      aria-label="TCDD Hat İzleme Ana Menüsü"
      className="hidden sm:flex flex-col items-center justify-between w-16 md:w-18 bg-white border-r border-[#DEE2E6] py-3.5 z-30 select-none flex-shrink-0 font-poppins shadow-xs"
    >
      {/* Top Logo / Brand Square */}
      <div className="flex flex-col items-center gap-3 w-full">
        <button
          onClick={() => {
            setActiveTab('map');
            if (!isSidebarOpen) setIsSidebarOpen(true);
          }}
          title="TCDD Hat İzleme Portalı"
          className="w-10 h-10 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-extrabold rounded-xl flex items-center justify-center text-lg shadow-[0_4px_12px_rgba(211,47,47,0.3)] transition-all cursor-pointer font-roboto-mono"
        >
          T
        </button>

        {/* Navigation Icon List */}
        <div className="flex flex-col items-center gap-2 w-full px-1.5 pt-1">
          {/* Map View */}
          <button
            onClick={() => setActiveTab('map')}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer relative group ${
              activeTab === 'map'
                ? 'bg-[#D32F2F]/10 text-[#D32F2F] border border-[#D32F2F]/25 shadow-xs font-semibold'
                : 'text-[#6C757D] hover:text-[#212529] hover:bg-[#F8F9FA]'
            }`}
            title="Harita Görünümü"
          >
            <MapIcon className="w-5 h-5" />
            <span className="sr-only">Harita</span>
            {activeTab === 'map' && (
              <span className="absolute -left-1.5 w-1 h-5 bg-[#D32F2F] rounded-r" />
            )}
          </button>

          {/* Points List View */}
          <button
            onClick={() => {
              setIsSidebarOpen((prev) => !prev);
              if (activeTab !== 'map') setActiveTab('map');
            }}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer relative group ${
              isSidebarOpen
                ? 'bg-[#D32F2F]/10 text-[#D32F2F] border border-[#D32F2F]/25 shadow-xs'
                : 'text-[#6C757D] hover:text-[#212529] hover:bg-[#F8F9FA]'
            }`}
            title="Bölgesel Nokta Listesi (Aç/Kapat)"
          >
            <MapPin className="w-5 h-5" />
            <span className="sr-only">Noktalar</span>
          </button>

          {/* Live GPS Tracker */}
          <button
            onClick={onToggleLiveGps}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer relative group ${
              isLiveGpsActive
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-400 shadow-xs'
                : 'text-[#6C757D] hover:text-[#212529] hover:bg-[#F8F9FA]'
            }`}
            title={isLiveGpsActive ? 'Canlı GPS KM Takibi Aktif (Kapat)' : 'Canlı GPS KM Takibini Başlat'}
          >
            <Navigation2 className={`w-5 h-5 ${isLiveGpsActive ? 'animate-pulse text-emerald-600' : ''}`} />
            {isLiveGpsActive && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            )}
          </button>

          {/* Takyidat (Speed Restrictions) */}
          <button
            onClick={onOpenTakyidat}
            className="w-11 h-11 rounded-xl flex items-center justify-center text-[#6C757D] hover:text-[#212529] hover:bg-[#F8F9FA] transition-all cursor-pointer relative group"
            title="Takyidat Hız Sınırları & Uyarıları"
          >
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            {activeTakyidatCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-amber-500 text-white text-[9px] font-bold px-1 rounded-full flex items-center justify-center shadow-xs">
                {activeTakyidatCount}
              </span>
            )}
          </button>


          {/* Field Works */}
          <button
            onClick={onOpenFieldWorks}
            className="w-11 h-11 rounded-xl flex items-center justify-center text-[#6C757D] hover:text-[#212529] hover:bg-[#F8F9FA] transition-all cursor-pointer relative group"
            title="Saha İş Listesi & Koordinasyon"
          >
            <ClipboardList className="w-5 h-5 text-sky-600" />
            {fieldWorksCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-sky-600 text-white text-[9px] font-bold px-1 rounded-full flex items-center justify-center shadow-xs">
                {fieldWorksCount}
              </span>
            )}
          </button>

          {/* Offline Map Manager */}
          <button
            onClick={onOpenOfflineModal}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer relative group ${
              isOfflineMode
                ? 'bg-amber-100 text-amber-700 border border-amber-300'
                : 'text-[#6C757D] hover:text-[#212529] hover:bg-[#F8F9FA]'
            }`}
            title="Çevrimdışı (Offline) Harita ve Önbellek Yönetimi"
          >
            <HardDriveDownload className="w-5 h-5" />
          </button>

          {/* Color Palette */}
          <button
            onClick={() => setActiveTab(activeTab === 'palette' ? 'map' : 'palette')}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer relative group ${
              activeTab === 'palette'
                ? 'bg-[#D32F2F]/10 text-[#D32F2F] border border-[#D32F2F]/25 shadow-xs'
                : 'text-[#6C757D] hover:text-[#212529] hover:bg-[#F8F9FA]'
            }`}
            title="Demiryolu Renk Paleti & Simge Ayarları"
          >
            <Palette className="w-5 h-5" />
          </button>

          {/* Reports */}
          <button
            onClick={onOpenReports}
            className="w-11 h-11 rounded-xl flex items-center justify-center text-[#6C757D] hover:text-[#212529] hover:bg-[#F8F9FA] transition-all cursor-pointer relative group"
            title="Saha Raporları & Excel / PDF Çıktısı"
          >
            <FileSpreadsheet className="w-5 h-5" />
          </button>

          {/* Import / Export */}
          <button
            onClick={onOpenImportExport}
            className="w-11 h-11 rounded-xl flex items-center justify-center text-[#6C757D] hover:text-[#212529] hover:bg-[#F8F9FA] transition-all cursor-pointer relative group"
            title="KML, GeoJSON, Excel ve Yedek İçe/Dışa Aktar"
          >
            <DownloadCloud className="w-5 h-5" />
          </button>

          {/* User Management */}
          {canManageUsers && onOpenUserManagement && (
            <button
              onClick={onOpenUserManagement}
              className="w-11 h-11 rounded-xl flex items-center justify-center text-[#6C757D] hover:text-[#212529] hover:bg-[#F8F9FA] transition-all cursor-pointer relative group"
              title="Kullanıcı & Güvenlik Yetkileri"
            >
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </button>
          )}

          {/* Refresh / Sync Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="w-11 h-11 rounded-xl flex items-center justify-center text-[#6C757D] hover:text-[#212529] hover:bg-[#F8F9FA] transition-all cursor-pointer relative group disabled:opacity-40"
            title="Sunucu Senkronizasyonunu Yenile"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-[#D32F2F]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Floating Red Quick Add Button */}
      <div className="w-full px-2 pt-2">
        <button
          onClick={onOpenAddModal}
          disabled={!canAddPoint}
          className={`w-11 h-11 rounded-xl bg-[#D32F2F] hover:bg-[#B71C1C] text-white flex items-center justify-center transition-all cursor-pointer mx-auto shadow-[0_4px_14px_rgba(211,47,47,0.35)] hover:scale-105 active:scale-95 ${
            !canAddPoint ? 'opacity-40 cursor-not-allowed' : ''
          }`}
          title={canAddPoint ? 'Yeni Demiryolu Noktası Ekle (+)' : 'Nokta ekleme yetkisi sistem yöneticisine aittir'}
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>
    </nav>
  );
};
