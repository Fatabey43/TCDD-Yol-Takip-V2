import React, { useState, useMemo, useRef } from 'react';
import { RailwayPoint, RailwayPointCategory } from '../types.ts';
import { CategoryColorConfig, DEFAULT_CATEGORY_COLORS, formatKmDisplay } from '../utils/categoryColors.ts';
import { getTextStyleInline } from '../utils/textStyleHelper.ts';
import { sortPointsByKm } from '../utils/kmUtils.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { DeleteConfirmModal } from './DeleteConfirmModal.tsx';
import {
  Navigation,
  MessageSquare,
  Image,
  ChevronRight,
  Trash2,
  Globe,
  X,
  CheckSquare,
  Square,
  Search,
} from 'lucide-react';

interface PointListSidebarProps {
  points: RailwayPoint[];
  selectedPoint: RailwayPoint | null;
  onSelectPoint: (point: RailwayPoint) => void;
  isOpen: boolean;
  onToggle: () => void;
  categoryColors?: Record<RailwayPointCategory, CategoryColorConfig>;
  onDeletePoint?: (point: RailwayPoint) => void;
  onBulkDeletePoints?: (ids: string[]) => Promise<void>;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

export const PointListSidebar: React.FC<PointListSidebarProps> = ({
  points,
  selectedPoint,
  onSelectPoint,
  isOpen,
  onToggle,
  categoryColors = DEFAULT_CATEGORY_COLORS,
  onDeletePoint,
  onBulkDeletePoints,
  searchQuery = '',
  onSearchChange,
}) => {
  const { canDelete } = useAuth();
  const sortedPoints = useMemo(() => sortPointsByKm(points), [points]);

  // Selection & Bulk Delete State
  const [isSelectMode, setIsSelectMode] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState<boolean>(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState<boolean>(false);
  const [singlePointToDelete, setSinglePointToDelete] = useState<RailwayPoint | null>(null);

  // Scroll Container Ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const toggleSelectPoint = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === sortedPoints.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedPoints.map((p) => p.id)));
    }
  };

  const handleConfirmBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setIsBulkDeleting(true);
    try {
      if (onBulkDeletePoints) {
        await onBulkDeletePoints(ids);
      } else if (onDeletePoint) {
        for (const p of sortedPoints.filter((pt) => selectedIds.has(pt.id))) {
          await onDeletePoint(p);
        }
      }
      setSelectedIds(new Set());
      setIsBulkDeleteModalOpen(false);
      setIsSelectMode(false);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Helper for Technical Shell category sys-tag colors
  const getCategoryTagInfo = (cat: string) => {
    switch (cat) {
      case 'switch':
        return { label: 'MAKAS', color: '#ef4444' };
      case 'station':
        return { label: 'GAR', color: '#16a34a' };
      case 'crossing':
        return { label: 'GEÇİT', color: '#eab308' };
      case 'culvert':
        return { label: 'MENFEZ', color: '#06b6d4' };
      case 'bridge':
        return { label: 'KÖPRÜ', color: '#8b5cf6' };
      case 'signal':
        return { label: 'SİNYAL', color: '#ec4899' };
      default:
        return { label: 'KM TAŞI', color: '#00ff88' };
    }
  };

  return (
    <aside
      id="point-list-sidebar"
      className={`bg-white border-r border-[#DEE2E6] flex flex-col h-full max-h-full min-h-0 overflow-hidden z-10 transition-all duration-300 relative font-poppins shadow-sm ${
        isOpen ? 'w-full sm:w-80 md:w-96' : 'w-0 hidden'
      }`}
    >
      {/* Aside Header - Variation 6: Bölgesel Kayıtlar */}
      <div className="p-3 sm:p-5 border-b border-[#DEE2E6] bg-white flex-shrink-0">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-lg font-bold text-[#212529] tracking-tight">
              Bölgesel Kayıtlar
            </h2>
            <span className="text-[10px] sm:text-[11px] font-roboto-mono text-[#D32F2F] bg-[#D32F2F]/10 px-2 py-0.5 rounded-full font-bold">
              {sortedPoints.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {canDelete && sortedPoints.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setIsSelectMode((prev) => !prev);
                  if (isSelectMode) setSelectedIds(new Set());
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelectMode
                    ? 'bg-[#D32F2F] text-white border-[#D32F2F] shadow-xs'
                    : 'bg-[#F8F9FA] text-[#495057] border-[#DEE2E6] hover:text-[#212529] hover:bg-slate-100'
                }`}
                title="Toplu silme ve seçim modunu aç/kapat"
              >
                {isSelectMode ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                <span>{isSelectMode ? 'BİTİR' : 'SEÇ'}</span>
              </button>
            )}

            <button
              id="close-sidebar-btn"
              type="button"
              onClick={onToggle}
              className="p-1.5 text-[#6C757D] hover:text-[#212529] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Listeyi Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Field */}
        {onSearchChange && (
          <div className="search-field bg-[#F8F9FA] border border-[#DEE2E6] px-3 py-1.5 flex items-center gap-2 rounded-xl focus-within:border-[#D32F2F] focus-within:bg-white transition-all">
            <Search className="w-3.5 h-3.5 text-[#6C757D] flex-shrink-0" />
            <input
              type="text"
              placeholder="KM, makas veya lokasyon ara..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-transparent border-none text-[#212529] font-poppins w-full outline-none text-xs placeholder-[#ADB5BD]"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="text-[#6C757D] hover:text-[#212529] text-xs px-1 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bulk Action Bar (when in select mode) */}
      {isSelectMode && canDelete && sortedPoints.length > 0 && (
        <div className="bg-[#F8F9FA] border-b border-[#DEE2E6] px-4 py-2 flex items-center justify-between gap-2 flex-wrap text-xs shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="flex items-center gap-1.5 text-[#212529] font-bold hover:text-[#D32F2F] cursor-pointer"
            >
              {selectedIds.size === sortedPoints.length ? (
                <CheckSquare className="w-4 h-4 text-[#D32F2F]" />
              ) : (
                <Square className="w-4 h-4 text-[#6C757D]" />
              )}
              <span>TÜMÜNÜ SEÇ ({sortedPoints.length})</span>
            </button>
            {selectedIds.size > 0 && (
              <span className="bg-[#D32F2F]/10 text-[#D32F2F] font-bold px-2 py-0.5 rounded-full text-[10px] font-roboto-mono">
                {selectedIds.size} SEÇİLDİ
              </span>
            )}
          </div>

          {selectedIds.size > 0 && (
            <button
              type="button"
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="flex items-center gap-1 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold px-2.5 py-1 rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>SİL ({selectedIds.size})</span>
            </button>
          )}
        </div>
      )}

      {/* Points Scroll Area - Variation 6 State Entry Cards */}
      <div
        ref={scrollContainerRef}
        className="entry-list flex-1 overflow-y-auto prominent-scrollbar relative min-h-0 max-h-full divide-y divide-[#DEE2E6] pb-24 sm:pb-6 bg-[#F8F9FA]/40 touch-pan-y overscroll-contain"
      >
        {sortedPoints.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#6C757D] font-poppins">
            Arama kriterine uygun kayıt bulunamadı.
          </div>
        ) : (
          sortedPoints.map((point) => {
            const isSelected = selectedPoint?.id === point.id;
            const isChecked = selectedIds.has(point.id);
            const cleanKm = formatKmDisplay(point.kmValue, point.title);
            const tagInfo = getCategoryTagInfo(point.category);

            // Variation 6: KM Box Background based on category
            const getKmBoxBg = (cat: string) => {
              switch (cat) {
                case 'switch':
                  return '#D32F2F'; // TCDD Red
                case 'culvert':
                  return '#2B6CB0'; // Railway Blue
                case 'crossing':
                  return '#D69E2E'; // Level Crossing Amber
                case 'station':
                  return '#2E7D32'; // Station Green
                default:
                  return '#D32F2F';
              }
            };

            return (
              <div
                key={point.id}
                id={`point-item-${point.id}`}
                onClick={(e) => {
                  if (isSelectMode) {
                    toggleSelectPoint(point.id, e);
                  } else {
                    onSelectPoint(point);
                  }
                }}
                className={`state-entry p-2.5 sm:p-3.5 cursor-pointer transition-all flex items-center gap-2.5 sm:gap-3 ${
                  isChecked
                    ? 'bg-[#D32F2F]/10 border-l-4 border-l-[#D32F2F]'
                    : isSelected
                    ? 'bg-rose-50/80 border-l-4 border-l-[#D32F2F]'
                    : 'hover:bg-white bg-white/70'
                }`}
              >
                {/* Checkbox if select mode is active */}
                {isSelectMode && canDelete && (
                  <div
                    onClick={(e) => toggleSelectPoint(point.id, e)}
                    className="pr-1 cursor-pointer shrink-0"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-[#D32F2F] border-[#DEE2E6] focus:ring-0 cursor-pointer pointer-events-none"
                    />
                  </div>
                )}

                {/* Variation 6: km-box (KM label top, number bottom) */}
                <div
                  className="km-box w-[64px] sm:w-[76px] h-[46px] sm:h-[54px] rounded-lg sm:rounded-xl flex flex-col items-center justify-center text-white font-roboto-mono shrink-0 shadow-xs"
                  style={{ backgroundColor: getKmBoxBg(point.category) }}
                >
                  <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-semibold opacity-85 leading-tight">
                    KM
                  </span>
                  <span className="text-[11px] sm:text-[12px] font-bold leading-tight notranslate tracking-tight" translate="no">
                    {cleanKm || '0+000'}
                  </span>
                </div>

                {/* Entry Info: Title & Sub */}
                <div className="entry-info flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h4
                      className="text-xs sm:text-sm font-bold text-[#212529] truncate notranslate"
                      translate="no"
                      style={point.titleTextStyle ? getTextStyleInline(point.titleTextStyle) : undefined}
                    >
                      {point.title}
                    </h4>
                    <span
                      className="text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-roboto-mono shrink-0"
                      style={{ color: tagInfo.color, backgroundColor: `${tagInfo.color}15` }}
                    >
                      {tagInfo.label}
                    </span>
                  </div>

                  <p className="text-[10px] sm:text-[11px] text-[#6C757D] truncate mb-0.5 sm:mb-1">
                    {point.lineName} {point.locationDesc ? `• ${point.locationDesc}` : ''}
                  </p>

                  {/* Actions & Meta row */}
                  <div className="flex items-center justify-between text-[10px] text-[#ADB5BD]">
                    <div className="flex items-center gap-2">
                      {point.photos && point.photos.length > 0 && (
                        <span className="flex items-center gap-0.5 text-emerald-600 font-semibold">
                          <Image className="w-3 h-3" />
                          <span>{point.photos.length}</span>
                        </span>
                      )}
                      {point.notes && point.notes.length > 0 && (
                        <span className="flex items-center gap-0.5 text-sky-600 font-semibold">
                          <MessageSquare className="w-3 h-3" />
                          <span>{point.notes.length}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        id={`quick-nav-${point.id}-btn`}
                        onClick={(e) => {
                          e.stopPropagation();
                          const lat = Number(point.lat);
                          const lng = Number(point.lng);
                          if (!isNaN(lat) && !isNaN(lng)) {
                            window.open(
                              `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
                              '_blank',
                              'noopener,noreferrer'
                            );
                          }
                        }}
                        title="Google Haritalar Navigasyonu"
                        className="p-1 text-[#6C757D] hover:text-[#D32F2F] hover:bg-slate-100 rounded transition-colors cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                      </button>

                      <a
                        id={`quick-earth-${point.id}-btn`}
                        href={
                          !isNaN(Number(point.lat)) && !isNaN(Number(point.lng))
                            ? `https://earth.google.com/web/search/${Number(point.lat).toFixed(7)},${Number(point.lng).toFixed(7)}`
                            : '#'
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title="Google Earth"
                        className="p-1 text-[#6C757D] hover:text-emerald-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                      >
                        <Globe className="w-3.5 h-3.5" />
                      </a>

                      {onDeletePoint && canDelete && !isSelectMode && (
                        <button
                          id={`quick-delete-${point.id}-btn`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSinglePointToDelete(point);
                          }}
                          title="Noktayı Sil"
                          className="p-1 text-[#6C757D] hover:text-[#D32F2F] hover:bg-rose-50 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* SINGLE POINT DELETE CONFIRMATION MODAL */}
      <DeleteConfirmModal
        isOpen={!!singlePointToDelete}
        title="Demiryolu Noktasını Sil"
        itemName={singlePointToDelete?.title}
        description="Bu demiryolu noktası sistemden ve haritadan kalıcı olarak silinecektir."
        confirmText="Evet, Noktayı Sil"
        cancelText="Vazgeç"
        isDeleting={isBulkDeleting}
        onConfirm={async () => {
          if (!singlePointToDelete) return;
          setIsBulkDeleting(true);
          try {
            if (onDeletePoint) {
              await onDeletePoint(singlePointToDelete);
            }
            setSinglePointToDelete(null);
          } finally {
            setIsBulkDeleting(false);
          }
        }}
        onClose={() => setSinglePointToDelete(null)}
      />

      {/* BULK DELETE CONFIRMATION MODAL */}
      <DeleteConfirmModal
        isOpen={isBulkDeleteModalOpen}
        title="Seçilen Noktaları Sil"
        itemName={`${selectedIds.size} adet demiryolu noktası`}
        description="Seçilen tüm demiryolu noktaları sistemden ve haritadan kalıcı olarak silinecektir. Bu işlem geri alınamaz."
        confirmText="Evet, Seçilenleri Sil"
        cancelText="Vazgeç"
        isDeleting={isBulkDeleting}
        onConfirm={handleConfirmBulkDelete}
        onClose={() => setIsBulkDeleteModalOpen(false)}
      />
    </aside>
  );
};
