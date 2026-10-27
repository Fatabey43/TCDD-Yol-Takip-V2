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
      className={`bg-[#16161a] border-r border-[#2d2d33] flex flex-col h-full z-10 transition-all duration-300 relative font-mono-tech ${
        isOpen ? 'w-full sm:w-80 md:w-96' : 'w-0 hidden'
      }`}
    >
      {/* Aside Header - Variation 6: Sistem 712 with QUERY:// KM_LOC field */}
      <div className="p-4 sm:p-5 border-b border-[#2d2d33] bg-[#16161a] flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-syne text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <span>Sistem 712</span>
            <span className="text-[10px] font-mono-tech text-[#00ff88] bg-[#00ff88]/10 px-2 py-0.5 rounded border border-[#00ff88]/30 font-bold">
              {sortedPoints.length}
            </span>
          </h2>

          <div className="flex items-center gap-1.5">
            {canDelete && sortedPoints.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setIsSelectMode((prev) => !prev);
                  if (isSelectMode) setSelectedIds(new Set());
                }}
                className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
                  isSelectMode
                    ? 'bg-[#00ff88] text-black border-[#00ff88] shadow-xs'
                    : 'bg-black text-[#e0e0e4]/80 border-[#2d2d33] hover:text-white hover:border-[#00ff88]/40'
                }`}
                title="Toplu silme ve seçim modunu aç/kapat"
              >
                {isSelectMode ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                <span>{isSelectMode ? 'BİTİR' : 'SEÇ'}</span>
              </button>
            )}

            <button
              id="close-sidebar-btn"
              type="button"
              onClick={onToggle}
              className="p-1.5 text-[#e0e0e4]/50 hover:text-white hover:bg-white/5 rounded transition-colors cursor-pointer"
              title="Listeyi Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Monospace Query Field (QUERY:// KM_LOC) */}
        {onSearchChange && (
          <div className="search-field bg-black border border-[#2d2d33] px-3 py-2 flex items-center gap-2 focus-within:border-[#00ff88]/70 transition-colors">
            <Search className="w-3.5 h-3.5 text-[#e0e0e4]/40 flex-shrink-0" />
            <input
              type="text"
              placeholder="QUERY:// KM_LOC"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-transparent border-none text-[#e0e0e4] font-mono-tech w-full outline-none text-xs placeholder-[#e0e0e4]/30"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="text-[#e0e0e4]/40 hover:text-white text-xs px-1 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bulk Action Bar (when in select mode) */}
      {isSelectMode && canDelete && sortedPoints.length > 0 && (
        <div className="bg-black border-b border-[#2d2d33] px-4 py-2 flex items-center justify-between gap-2 flex-wrap text-xs shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="flex items-center gap-1.5 text-white font-bold hover:text-[#00ff88] cursor-pointer"
            >
              {selectedIds.size === sortedPoints.length ? (
                <CheckSquare className="w-4 h-4 text-[#00ff88]" />
              ) : (
                <Square className="w-4 h-4 text-[#e0e0e4]/60" />
              )}
              <span>TÜMÜNÜ SEÇ ({sortedPoints.length})</span>
            </button>
            {selectedIds.size > 0 && (
              <span className="bg-[#00ff88]/20 text-[#00ff88] font-bold px-2 py-0.5 rounded text-[10px]">
                {selectedIds.size} SEÇİLDİ
              </span>
            )}
          </div>

          {selectedIds.size > 0 && (
            <button
              type="button"
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white font-bold px-2.5 py-1 rounded text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>SİL ({selectedIds.size})</span>
            </button>
          )}
        </div>
      )}

      {/* Points Scroll Area - Variation 6 entry list */}
      <div
        ref={scrollContainerRef}
        className="entry-list flex-1 overflow-y-auto prominent-scrollbar relative min-h-0 divide-y divide-[#2d2d33]"
      >
        {sortedPoints.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#e0e0e4]/40 font-mono-tech">
            QUERY:// NO_RECORDS_FOUND
          </div>
        ) : (
          sortedPoints.map((point) => {
            const isSelected = selectedPoint?.id === point.id;
            const isChecked = selectedIds.has(point.id);
            const cleanKm = formatKmDisplay(point.kmValue, point.title);
            const tagInfo = getCategoryTagInfo(point.category);

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
                className={`entry p-4 cursor-pointer transition-colors ${
                  isChecked
                    ? 'bg-[#00ff88]/15 border-l-4 border-l-[#00ff88]'
                    : isSelected
                    ? 'bg-[#e0e0e4]/10 border-l-4 border-l-[#00ff88]'
                    : 'hover:bg-white/[0.03]'
                }`}
              >
                {/* Checkbox if select mode is active */}
                {isSelectMode && canDelete && (
                  <div
                    onClick={(e) => toggleSelectPoint(point.id, e)}
                    className="pr-2 pb-1 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-[#00ff88] border-[#2d2d33] focus:ring-0 cursor-pointer pointer-events-none"
                    />
                  </div>
                )}

                {/* Entry Header: km-label in accent & tag-sys badge */}
                <div className="entry-header flex items-center justify-between gap-2 mb-1">
                  <span className="km-label text-[#00ff88] font-bold text-sm tracking-tight font-mono-tech notranslate" translate="no">
                    {cleanKm ? `KM ${cleanKm}` : 'HAT NOKTASI'}
                  </span>
                  <span
                    className="tag-sys bg-[#2d2d33] text-[9px] font-bold px-2 py-0.5 rounded tracking-wider uppercase font-mono-tech flex items-center gap-1 shadow-2xs notranslate"
                    translate="no"
                    style={{ color: tagInfo.color }}
                  >
                    <span>{tagInfo.label}</span>
                  </span>
                </div>

                {/* Entry Title */}
                <div
                  className="entry-title font-bold text-sm text-[#e0e0e4] truncate notranslate mb-0.5"
                  translate="no"
                  style={point.titleTextStyle ? getTextStyleInline(point.titleTextStyle) : undefined}
                >
                  {point.title}
                </div>

                {/* Entry Sub: line name & location */}
                <div className="entry-sub text-[10px] text-[#e0e0e4]/50 uppercase tracking-wider truncate font-mono-tech flex items-center justify-between gap-2">
                  <span className="truncate">{point.lineName} Line {point.locationDesc ? `• ${point.locationDesc}` : ''}</span>
                  
                  {/* Photo & Note Counters */}
                  <div className="flex items-center gap-2 text-[#e0e0e4]/40 flex-shrink-0">
                    {point.photos && point.photos.length > 0 && (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Image className="w-3 h-3" />
                        <span>{point.photos.length}</span>
                      </span>
                    )}
                    {point.notes && point.notes.length > 0 && (
                      <span className="flex items-center gap-1 text-sky-400">
                        <MessageSquare className="w-3 h-3" />
                        <span>{point.notes.length}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions row: Quick Nav & Delete */}
                <div className="flex items-center justify-end gap-1.5 mt-2 pt-2 border-t border-[#2d2d33]/50">
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
                    className="p-1 text-[#e0e0e4]/50 hover:text-[#00ff88] hover:bg-white/5 rounded transition-colors cursor-pointer"
                  >
                    <Navigation className="w-3 h-3" />
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
                    className="p-1 text-[#e0e0e4]/50 hover:text-emerald-400 hover:bg-white/5 rounded transition-colors cursor-pointer"
                  >
                    <Globe className="w-3 h-3" />
                  </a>

                  {onDeletePoint && canDelete && !isSelectMode && (
                    <button
                      id={`quick-delete-${point.id}-btn`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSinglePointToDelete(point);
                      }}
                      title="Noktayı Sil"
                      className="p-1 text-[#e0e0e4]/40 hover:text-red-400 hover:bg-red-950/40 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}

                  {!isSelectMode && <ChevronRight className="w-3.5 h-3.5 text-[#e0e0e4]/30" />}
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
