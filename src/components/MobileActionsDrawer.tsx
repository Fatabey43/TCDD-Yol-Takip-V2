import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  X,
  Upload,
  FileJson,
  RotateCw,
  Smartphone,
  Palette,
  Users,
  LogOut,
  CloudUpload,
  HardDriveDownload,
  FileText,
  Gauge,
  Compass,
  Navigation2,
  Wrench,
} from 'lucide-react';

interface MobileActionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  totalPoints: number;
  isLiveGpsActive?: boolean;
  onToggleLiveGps?: () => void;
  onOpenOfflineModal?: () => void;
  isOfflineMode?: boolean;
  onOpenImportExport: () => void;
  onOpenMobileInstall: () => void;
  onOpenPalette: () => void;
  onOpenReports?: () => void;
  onOpenTakyidat?: () => void;
  onOpenFieldWorks?: () => void;
  fieldWorksCount?: number;
  onOpenSelectPoint?: () => void;
  activeTakyidatCount?: number;
  onRefresh: () => void;
  onExportJSON: () => void;
  onSyncPhotos: () => void;
  onOpenUserManagement?: () => void;
  isRefreshing?: boolean;
}

export const MobileActionsDrawer: React.FC<MobileActionsDrawerProps> = ({
  isOpen,
  onClose,
  totalPoints,
  isLiveGpsActive = false,
  onToggleLiveGps,
  onOpenOfflineModal,
  isOfflineMode = false,
  onOpenImportExport,
  onOpenMobileInstall,
  onOpenPalette,
  onOpenReports,
  onOpenTakyidat,
  onOpenFieldWorks,
  fieldWorksCount = 0,
  onOpenSelectPoint,
  activeTakyidatCount = 0,
  onRefresh,
  onExportJSON,
  onSyncPhotos,
  onOpenUserManagement,
  isRefreshing,
}) => {
  const { user, role, isAdmin, canManageUsers, logout } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-xs sm:hidden animate-in fade-in duration-200">
      {/* Backdrop tap to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer content: Variation 6 White & Red Clean Government Theme */}
      <div className="bg-white border-t border-[#DEE2E6] rounded-t-3xl shadow-2xl p-4 max-h-[85dvh] overflow-y-auto prominent-scrollbar flex flex-col gap-3 text-[#212529] animate-in slide-in-from-bottom duration-250 pb-safe touch-pan-y overscroll-contain font-poppins">
        {/* Top Government Accent Strip */}
        <div className="gov-bar w-full h-1 -mt-1 rounded-full shrink-0" />

        {/* Drag handle & close header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-[#DEE2E6]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#DEE2E6] flex items-center justify-center shadow-xs shrink-0 bg-white p-0.5">
              <img
                src="/tcdd_logo_badge.svg"
                alt="TCDD"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-extrabold text-[#212529] tracking-tight">TCDD HAT İZLEME</h3>
                <span className="bg-[#D32F2F]/10 text-[#D32F2F] text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-[#D32F2F]/20 font-mono">
                  ALPHA
                </span>
              </div>
              <p className="text-[11px] text-[#6C757D] font-medium">712 Şefliği • {totalPoints} KM Kayıtlı</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#F8F9FA] text-[#6C757D] hover:text-[#212529] hover:bg-[#DEE2E6] transition-colors cursor-pointer"
            title="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Status Card */}
        <div className="p-3 bg-[#F8F9FA] rounded-xl flex items-center justify-between border border-[#DEE2E6]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-white shadow-xs shrink-0 ${
                isAdmin ? 'bg-[#D32F2F]' : role === 'editor' ? 'bg-sky-600' : 'bg-slate-600'
              }`}
            >
              {user ? user.name.slice(0, 2).toUpperCase() : '??'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#212529] leading-tight truncate">{user?.name || 'Kullanıcı'}</p>
              <p className="text-[10px] text-[#6C757D] truncate font-roboto-mono">{user?.email || '-'}</p>
            </div>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0 ${
              isAdmin
                ? 'bg-[#D32F2F]/10 text-[#D32F2F] border border-[#D32F2F]/20'
                : role === 'editor'
                ? 'bg-sky-50 text-sky-800 border border-sky-200'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {isAdmin ? '👑 Yönetici' : role === 'editor' ? '🛠️ Saha' : '👁️ Gözlemci'}
          </span>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Refresh / Sync Now */}
          <button
            onClick={() => {
              onRefresh();
              onClose();
            }}
            disabled={isRefreshing}
            className="flex items-center gap-2 p-3 bg-white hover:bg-[#F8F9FA] active:bg-slate-100 rounded-xl border border-[#DEE2E6] transition-all font-semibold text-[#212529] shadow-2xs cursor-pointer"
          >
            <RotateCw className={`w-4 h-4 text-[#D32F2F] shrink-0 ${isRefreshing ? 'animate-spin' : ''}`} />
            <div className="text-left leading-tight min-w-0">
              <span className="block font-bold text-xs truncate">Haritayı Yenile</span>
              <span className="text-[10px] text-[#6C757D] truncate block">Verileri Güncelle</span>
            </div>
          </button>

          {/* Sync Photos */}
          <button
            onClick={() => {
              onSyncPhotos();
              onClose();
            }}
            className="flex items-center gap-2 p-3 bg-white hover:bg-[#F8F9FA] active:bg-slate-100 rounded-xl border border-[#DEE2E6] transition-all font-semibold text-[#212529] shadow-2xs cursor-pointer"
          >
            <CloudUpload className="w-4 h-4 text-sky-600 shrink-0" />
            <div className="text-left leading-tight min-w-0">
              <span className="block font-bold text-xs truncate">Fotoğraf Eşitle</span>
              <span className="text-[10px] text-[#6C757D] truncate block">Buluta Gönder</span>
            </div>
          </button>

          {/* KML Import / Export */}
          <button
            onClick={() => {
              onOpenImportExport();
              onClose();
            }}
            className="flex items-center gap-2 p-3 bg-white hover:bg-[#F8F9FA] active:bg-slate-100 rounded-xl border border-[#DEE2E6] transition-all font-semibold text-[#212529] shadow-2xs cursor-pointer"
          >
            <Upload className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="text-left leading-tight min-w-0">
              <span className="block font-bold text-xs truncate">KML &amp; Harita</span>
              <span className="text-[10px] text-[#6C757D] truncate block">İçe / Dışa Aktar</span>
            </div>
          </button>

          {/* Çevrimdışı Harita & Önbellek */}
          {onOpenOfflineModal && (
            <button
              onClick={() => {
                onOpenOfflineModal();
                onClose();
              }}
              className={`flex items-center gap-2 p-3 rounded-xl border transition-all font-semibold shadow-2xs cursor-pointer ${
                isOfflineMode
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-white hover:bg-[#F8F9FA] active:bg-slate-100 border-[#DEE2E6] text-[#212529]'
              }`}
            >
              <HardDriveDownload
                className={`w-4 h-4 shrink-0 ${
                  isOfflineMode ? 'text-amber-600 animate-pulse' : 'text-emerald-600'
                }`}
              />
              <div className="text-left leading-tight min-w-0">
                <span className="block font-bold text-xs truncate flex items-center gap-1">
                  <span>Çevrimdışı Harita</span>
                  {isOfflineMode && (
                    <span className="bg-amber-500 text-white px-1 py-0.2 rounded text-[8px] font-bold">
                      AKTİF
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-[#6C757D] truncate block">Önbellek &amp; Hat İndir</span>
              </div>
            </button>
          )}

          {/* TCDD Resmi Raporlar */}
          {onOpenReports && (
            <button
              onClick={() => {
                onOpenReports();
                onClose();
              }}
              className="flex items-center gap-2 p-3 bg-white hover:bg-[#F8F9FA] active:bg-slate-100 rounded-xl border border-[#DEE2E6] transition-all font-semibold text-[#212529] shadow-2xs cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#D32F2F] shrink-0" />
              <div className="text-left leading-tight min-w-0">
                <span className="block font-bold text-xs truncate">Resmi Raporlar</span>
                <span className="text-[10px] text-[#6C757D] truncate block">PDF &amp; Excel Çıktısı</span>
              </div>
            </button>
          )}

          {/* TCDD Takyidat & Hız Kısıtlamaları */}
          {onOpenTakyidat && (
            <button
              onClick={() => {
                onOpenTakyidat();
                onClose();
              }}
              className="flex items-center gap-2 p-3 bg-white hover:bg-[#F8F9FA] active:bg-slate-100 rounded-xl border border-[#DEE2E6] transition-all font-semibold text-[#212529] shadow-2xs cursor-pointer"
            >
              <Gauge className="w-4 h-4 text-[#D32F2F] shrink-0" />
              <div className="text-left leading-tight min-w-0">
                <span className="block font-bold text-xs truncate flex items-center gap-1">
                  <span>Takyidatlar</span>
                  {activeTakyidatCount > 0 && (
                    <span className="bg-[#D32F2F] text-white px-1.5 py-0.2 rounded-full text-[9px] font-black">
                      {activeTakyidatCount}
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-[#6C757D] truncate block">KM Hız Sınırları</span>
              </div>
            </button>
          )}

          {/* Saha İş Listesi */}
          {onOpenFieldWorks && (
            <button
              onClick={() => {
                onOpenFieldWorks();
                onClose();
              }}
              className="flex items-center gap-2 p-3 bg-white hover:bg-[#F8F9FA] active:bg-slate-100 rounded-xl border border-[#DEE2E6] transition-all font-semibold text-[#212529] shadow-2xs cursor-pointer"
            >
              <Wrench className="w-4 h-4 text-amber-600 shrink-0" />
              <div className="text-left leading-tight min-w-0">
                <span className="block font-bold text-xs truncate flex items-center gap-1">
                  <span>Saha İşleri</span>
                  {fieldWorksCount > 0 && (
                    <span className="bg-amber-600 text-white px-1.5 py-0.2 rounded-full text-[9px] font-black">
                      {fieldWorksCount}
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-[#6C757D] truncate block">İş &amp; Görev Defteri</span>
              </div>
            </button>
          )}

          {/* Canlı Konum (GPS Takibi) */}
          {onToggleLiveGps && (
            <button
              onClick={() => {
                onToggleLiveGps();
                onClose();
              }}
              className={`flex items-center gap-2 p-3 rounded-xl border transition-all font-semibold shadow-2xs cursor-pointer ${
                isLiveGpsActive
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-white hover:bg-[#F8F9FA] active:bg-slate-100 border-[#DEE2E6] text-[#212529]'
              }`}
            >
              <Navigation2
                className={`w-4 h-4 shrink-0 ${
                  isLiveGpsActive ? 'text-emerald-600 animate-spin-slow' : 'text-[#D32F2F]'
                }`}
              />
              <div className="text-left leading-tight min-w-0">
                <span className="block font-bold text-xs truncate">
                  {isLiveGpsActive ? 'Canlı GPS Kapat' : 'Canlı GPS Aç'}
                </span>
                <span className="text-[10px] text-[#6C757D] truncate block">
                  {isLiveGpsActive ? 'Anlık KM Takibi Açık' : 'Hat Üzeri Canlı KM'}
                </span>
              </div>
            </button>
          )}

          {/* Canlı Konum / Nokta Seç */}
          {onOpenSelectPoint && (
            <button
              onClick={() => {
                onOpenSelectPoint();
                onClose();
              }}
              className="flex items-center gap-2 p-3 bg-white hover:bg-[#F8F9FA] active:bg-slate-100 rounded-xl border border-[#DEE2E6] transition-all font-semibold text-[#212529] shadow-2xs cursor-pointer"
            >
              <Compass className="w-4 h-4 text-sky-600 shrink-0" />
              <div className="text-left leading-tight min-w-0">
                <span className="block font-bold text-xs truncate">Noktadan KM Seç</span>
                <span className="text-[10px] text-[#6C757D] truncate block">Haritadan veya Listeden</span>
              </div>
            </button>
          )}

          {/* JSON Export */}
          <button
            onClick={() => {
              onExportJSON();
              onClose();
            }}
            className="flex items-center gap-2 p-3 bg-white hover:bg-[#F8F9FA] active:bg-slate-100 rounded-xl border border-[#DEE2E6] transition-all font-semibold text-[#212529] shadow-2xs cursor-pointer"
          >
            <FileJson className="w-4 h-4 text-indigo-600 shrink-0" />
            <div className="text-left leading-tight min-w-0">
              <span className="block font-bold text-xs truncate">JSON İndir</span>
              <span className="text-[10px] text-[#6C757D] truncate block">Tüm Verileri Kaydet</span>
            </div>
          </button>

          {/* Mobile Install */}
          <button
            onClick={() => {
              onOpenMobileInstall();
              onClose();
            }}
            className="flex items-center gap-2 p-3 bg-white hover:bg-[#F8F9FA] active:bg-slate-100 rounded-xl border border-[#DEE2E6] transition-all font-semibold text-[#212529] shadow-2xs cursor-pointer"
          >
            <Smartphone className="w-4 h-4 text-teal-600 shrink-0" />
            <div className="text-left leading-tight min-w-0">
              <span className="block font-bold text-xs truncate">Telefona Yükle</span>
              <span className="text-[10px] text-[#6C757D] truncate block">PWA Uygulaması</span>
            </div>
          </button>

          {/* Color & Pin Palette */}
          <button
            onClick={() => {
              onOpenPalette();
              onClose();
            }}
            className="flex items-center gap-2 p-3 bg-white hover:bg-[#F8F9FA] active:bg-slate-100 rounded-xl border border-[#DEE2E6] transition-all font-semibold text-[#212529] shadow-2xs cursor-pointer"
          >
            <Palette className="w-4 h-4 text-amber-600 shrink-0" />
            <div className="text-left leading-tight min-w-0">
              <span className="block font-bold text-xs truncate">Renk Paleti</span>
              <span className="text-[10px] text-[#6C757D] truncate block">Kategori Renkleri</span>
            </div>
          </button>
        </div>

        {/* Admin User Management Button */}
        {canManageUsers && onOpenUserManagement && (
          <button
            onClick={() => {
              onOpenUserManagement();
              onClose();
            }}
            className="w-full flex items-center justify-between p-3 bg-[#F8F9FA] hover:bg-slate-100 border border-[#DEE2E6] rounded-xl text-[#212529] font-semibold text-xs transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-[#D32F2F]" />
              <span>Kullanıcı &amp; Yetki Yönetim Paneli</span>
            </div>
            <span className="text-[10px] bg-[#D32F2F]/10 text-[#D32F2F] px-2 py-0.5 rounded font-bold border border-[#D32F2F]/20">
              Yönetici
            </span>
          </button>
        )}

        {/* Logout */}
        <button
          onClick={() => {
            logout();
            onClose();
          }}
          className="w-full flex items-center justify-center gap-2 p-2.5 bg-rose-50 hover:bg-rose-100 text-[#D32F2F] border border-rose-200 rounded-xl font-bold text-xs transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-[#D32F2F]" />
          <span>Oturumu Kapat</span>
        </button>
      </div>
    </div>
  );
};
