import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  RailwayPoint,
  RailwayPointCategory,
  BulkPointChanges,
  WorkLog,
} from '../types.ts';
import { DEFAULT_CATEGORY_COLORS, formatKmDisplay } from '../utils/categoryColors.ts';
import { getStoredLines, addCustomLine } from '../utils/customLinesStorage.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  X,
  Save,
  Layers,
  Train,
  MapPin,
  Type,
  FileText,
  MessageSquare,
  Wrench,
  Check,
  Plus,
  ShieldAlert,
  Sliders,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface BulkEditPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPoints: RailwayPoint[];
  allExistingLines: string[];
  onApplyBulkEdit: (ids: string[], changes: BulkPointChanges) => Promise<void>;
}

const CATEGORIES: { id: RailwayPointCategory; label: string }[] = [
  { id: 'km_marker', label: 'Demiryolu Kilometre Taşı' },
  { id: 'switch', label: 'Demiryolu Makası' },
  { id: 'crossing', label: 'Hemzemin Geçit' },
  { id: 'bridge', label: 'Köprü / Viyadük' },
  { id: 'culvert', label: 'Menfez / Drenaj' },
  { id: 'station', label: 'İstasyon / Gar / Durak' },
  { id: 'signal', label: 'Sinyal / Elektrifikasyon' },
  { id: 'other', label: 'Diğer Hat Noktası' },
];

export const BulkEditPointsModal: React.FC<BulkEditPointsModalProps> = ({
  isOpen,
  onClose,
  selectedPoints,
  allExistingLines,
  onApplyBulkEdit,
}) => {
  const { user } = useAuth();

  // Preview list collapse
  const [showAllSelectedPreview, setShowAllSelectedPreview] = useState(false);

  // 1. Category
  const [enableCategory, setEnableCategory] = useState(false);
  const [category, setCategory] = useState<RailwayPointCategory>('km_marker');

  // 2. Line Name
  const [enableLineName, setEnableLineName] = useState(false);
  const [lineName, setLineName] = useState('');
  const [savedLines, setSavedLines] = useState<string[]>([]);
  const [isAddingNewLine, setIsAddingNewLine] = useState(false);
  const [newLineInput, setNewLineInput] = useState('');

  // 3. Location Desc
  const [enableLocationDesc, setEnableLocationDesc] = useState(false);
  const [locationDesc, setLocationDesc] = useState('');

  // 4. Title Operation
  const [enableTitleOp, setEnableTitleOp] = useState(false);
  const [titleMode, setTitleMode] = useState<'prefix' | 'suffix' | 'find_replace' | 'replace'>('prefix');
  const [titleValue, setTitleValue] = useState('');
  const [titleFindText, setTitleFindText] = useState('');
  const [titleReplaceText, setTitleReplaceText] = useState('');

  // 5. Description Operation
  const [enableDescOp, setEnableDescOp] = useState(false);
  const [descMode, setDescMode] = useState<'append' | 'replace' | 'clear'>('append');
  const [descValue, setDescValue] = useState('');

  // 6. Bulk Note
  const [enableAddNote, setEnableAddNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteAuthor, setNoteAuthor] = useState(user?.name || '712 Yol Bakım Şefliği');

  // 7. Bulk Work Log
  const [enableAddWorkLog, setEnableAddWorkLog] = useState(false);
  const [workTitle, setWorkTitle] = useState('');
  const [workType, setWorkType] = useState<WorkLog['workType']>('bakim');
  const [workStatus, setWorkStatus] = useState<WorkLog['status']>('tamamlandi');
  const [workDate, setWorkDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [workBy, setWorkBy] = useState(user?.name ? `${user.name} (712 Ekip)` : '712 Yol Bakım Ekibi');
  const [workMaterials, setWorkMaterials] = useState('');
  const [workDesc, setWorkDesc] = useState('');

  // 8. Crossing / Culvert common technical fields
  const [enableCrossingPatch, setEnableCrossingPatch] = useState(false);
  const [crossingIl, setCrossingIl] = useState('');
  const [crossingSeflik, setCrossingSeflik] = useState('');
  const [crossingRoad, setCrossingRoad] = useState('');
  const [crossingType, setCrossingType] = useState('');
  const [crossingSurface, setCrossingSurface] = useState('');

  const [enableCulvertPatch, setEnableCulvertPatch] = useState(false);
  const [culvertSeflik, setCulvertSeflik] = useState('');
  const [culvertHatti, setCulvertHatti] = useState('');
  const [culvertCinsi, setCulvertCinsi] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      wasOpenRef.current = false;
      return;
    }
    if (wasOpenRef.current) return;
    wasOpenRef.current = true;

    const fromStorage = getStoredLines();
    const merged = Array.from(
      new Set([...allExistingLines, ...fromStorage].map((l) => l.trim()).filter(Boolean))
    ).sort();
    setSavedLines(merged);

    // Reset form ONLY when modal opens
    setEnableCategory(false);
    setCategory(selectedPoints[0]?.category || 'km_marker');
    setEnableLineName(false);
    setLineName(selectedPoints[0]?.lineName || merged[0] || '');
    setIsAddingNewLine(false);
    setNewLineInput('');
    setEnableLocationDesc(false);
    setLocationDesc('');
    setEnableTitleOp(false);
    setTitleMode('prefix');
    setTitleValue('');
    setTitleFindText('');
    setTitleReplaceText('');
    setEnableDescOp(false);
    setDescMode('append');
    setDescValue('');
    setEnableAddNote(false);
    setNoteText('');
    setNoteAuthor(user?.name || '712 Yol Bakım Şefliği');
    setEnableAddWorkLog(false);
    setWorkTitle('');
    setWorkType('bakim');
    setWorkStatus('tamamlandi');
    setWorkDate(new Date().toISOString().split('T')[0]);
    setWorkBy(user?.name ? `${user.name} (712 Ekip)` : '712 Yol Bakım Ekibi');
    setWorkMaterials('');
    setWorkDesc('');
    setEnableCrossingPatch(false);
    setCrossingIl('');
    setCrossingSeflik('');
    setCrossingRoad('');
    setCrossingType('');
    setCrossingSurface('');
    setEnableCulvertPatch(false);
    setCulvertSeflik('');
    setCulvertHatti('');
    setCulvertCinsi('');
    setErrorMsg(null);
    setShowAllSelectedPreview(false);
  }, [isOpen, selectedPoints, allExistingLines, user]);

  const hasCrossing = useMemo(
    () =>
      selectedPoints.some((p) => p.category === 'crossing') ||
      (enableCategory && category === 'crossing'),
    [selectedPoints, enableCategory, category]
  );

  const hasCulvert = useMemo(
    () =>
      selectedPoints.some((p) => p.category === 'culvert') ||
      (enableCategory && category === 'culvert'),
    [selectedPoints, enableCategory, category]
  );

  const activeOperationsCount = useMemo(() => {
    let count = 0;
    if (enableCategory) count++;
    if (enableLineName) count++;
    if (enableLocationDesc) count++;
    if (enableTitleOp) count++;
    if (enableDescOp) count++;
    if (enableAddNote) count++;
    if (enableAddWorkLog) count++;
    if (enableCrossingPatch) count++;
    if (enableCulvertPatch) count++;
    return count;
  }, [
    enableCategory,
    enableLineName,
    enableLocationDesc,
    enableTitleOp,
    enableDescOp,
    enableAddNote,
    enableAddWorkLog,
    enableCrossingPatch,
    enableCulvertPatch,
  ]);

  const titlePreview = useMemo(() => {
    const sample = selectedPoints[0]?.title || 'Örnek KM Başlığı';
    if (!enableTitleOp) return sample;
    if (titleMode === 'replace' && titleValue.trim()) return titleValue.trim();
    if (titleMode === 'prefix' && titleValue.trim()) {
      const p = titleValue.trim();
      return sample.startsWith(p) ? sample : `${p} ${sample}`;
    }
    if (titleMode === 'suffix' && titleValue.trim()) {
      const s = titleValue.trim();
      return sample.endsWith(s) ? sample : `${sample} ${s}`;
    }
    if (titleMode === 'find_replace' && titleFindText) {
      return sample.split(titleFindText).join(titleReplaceText || '');
    }
    return sample;
  }, [selectedPoints, enableTitleOp, titleMode, titleValue, titleFindText, titleReplaceText]);

  if (!isOpen || selectedPoints.length === 0) return null;

  const handleAddCustomLine = () => {
    const trimmed = newLineInput.trim();
    if (!trimmed) return;
    const updated = addCustomLine(trimmed);
    const merged = Array.from(new Set([...allExistingLines, ...updated])).sort();
    setSavedLines(merged);
    setLineName(trimmed);
    setEnableLineName(true);
    setNewLineInput('');
    setIsAddingNewLine(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (activeOperationsCount === 0) {
      setErrorMsg('Lütfen seçili KM noktalarına uygulanacak en az bir düzenleme seçeneğini işaretleyin.');
      return;
    }

    const changes: BulkPointChanges = {};

    if (enableCategory) {
      changes.category = category;
    }

    if (enableLineName) {
      if (!lineName.trim()) {
        setErrorMsg('Lütfen yeni hat adını seçin veya yazın.');
        return;
      }
      changes.lineName = lineName.trim();
    }

    if (enableLocationDesc) {
      changes.setLocationDesc = true;
      changes.locationDesc = locationDesc.trim();
    }

    if (enableTitleOp) {
      if (titleMode === 'find_replace') {
        if (!titleFindText) {
          setErrorMsg('Başlıkta bulunacak metni girin.');
          return;
        }
        changes.titleOperation = {
          mode: 'find_replace',
          findText: titleFindText,
          replaceText: titleReplaceText,
        };
      } else {
        if (!titleValue.trim()) {
          setErrorMsg('Başlık işlemi için metin girin.');
          return;
        }
        changes.titleOperation = {
          mode: titleMode,
          value: titleValue.trim(),
        };
      }
    }

    if (enableDescOp) {
      if (descMode !== 'clear' && !descValue.trim()) {
        setErrorMsg('Açıklama işlemi için metin girin veya "Temizle" seçeneğini seçin.');
        return;
      }
      changes.descriptionOperation = {
        mode: descMode,
        value: descValue.trim(),
      };
    }

    if (enableAddNote) {
      if (!noteText.trim()) {
        setErrorMsg('Tüm seçili KM noktalarına eklenecek saha notunu yazın.');
        return;
      }
      changes.addNote = {
        text: noteText.trim(),
        author: noteAuthor.trim() || '712 Yol Bakım Şefliği',
      };
    }

    if (enableAddWorkLog) {
      if (!workTitle.trim()) {
        setErrorMsg('Yapılan iş kaydı için iş başlığı girin (Örn: Balast Takviyesi).');
        return;
      }
      changes.addWorkLog = {
        title: workTitle.trim(),
        workType,
        status: workStatus,
        performedAt: workDate,
        performedBy: workBy.trim() || '712 Yol Bakım Ekibi',
        materialsUsed: workMaterials.trim(),
        description: workDesc.trim() || workTitle.trim(),
      };
    }

    if (enableCrossingPatch) {
      const patch: Record<string, string> = {};
      if (crossingIl.trim()) patch.bulunduguIl = crossingIl.trim();
      if (crossingSeflik.trim()) patch.subeSefligi = crossingSeflik.trim();
      if (crossingRoad.trim()) patch.roadBelonging = crossingRoad.trim();
      if (crossingType.trim()) patch.crossingType = crossingType.trim();
      if (crossingSurface.trim()) patch.surfaceType = crossingSurface.trim();
      if (Object.keys(patch).length === 0) {
        setErrorMsg('Hemzemin geçit ortak bilgisi için en az bir alan doldurun.');
        return;
      }
      changes.crossingPatch = patch;
    }

    if (enableCulvertPatch) {
      const patch: Record<string, string> = {};
      if (culvertSeflik.trim()) patch.bakimSefligi = culvertSeflik.trim();
      if (culvertHatti.trim()) patch.hatti = culvertHatti.trim();
      if (culvertCinsi.trim()) patch.cinsi = culvertCinsi.trim();
      if (Object.keys(patch).length === 0) {
        setErrorMsg('Menfez ortak bilgisi için en az bir alan doldurun.');
        return;
      }
      changes.culvertPatch = patch;
    }

    setIsSaving(true);
    try {
      await onApplyBulkEdit(
        selectedPoints.map((p) => p.id),
        changes
      );
      onClose();
    } catch {
      setErrorMsg('Toplu düzenleme sırasında beklenmedik bir durum oluştu, veriler yerel önbelleğe kaydedildi.');
    } finally {
      setIsSaving(false);
    }
  };

  const displayedPreviewPoints = showAllSelectedPreview
    ? selectedPoints
    : selectedPoints.slice(0, 6);

  return (
    <div
      id="bulk-edit-points-modal"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150 font-poppins"
    >
      <div className="bg-white border border-[#DEE2E6] w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90vh]">
        {/* Top TCDD Red Accent Strip */}
        <div className="gov-bar w-full h-[5px] shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-[#DEE2E6] bg-white shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#D32F2F] text-white flex items-center justify-center shadow-xs shrink-0">
              <Layers className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-extrabold text-[#212529] tracking-tight truncate">
                  Toplu KM Düzenleme Menüsü
                </h2>
                <span className="bg-[#D32F2F]/10 text-[#D32F2F] border border-[#D32F2F]/20 px-2 py-0.5 rounded-full text-[11px] font-bold font-roboto-mono shrink-0">
                  {selectedPoints.length} KM SEÇİLDİ
                </span>
              </div>
              <p className="text-[11px] text-[#6C757D] truncate">
                İşaretlediğiniz tüm işlemler seçili KM kayıtlarının hepsine aynı anda uygulanır.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#6C757D] hover:text-[#212529] hover:bg-[#F8F9FA] rounded-lg transition-colors cursor-pointer shrink-0"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected KMs Preview Strip */}
        <div className="px-4 sm:px-5 py-2.5 bg-[#F8F9FA] border-b border-[#DEE2E6] shrink-0">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D]">
              İşlem Yapılacak Seçili Noktalar ({selectedPoints.length})
            </span>
            {selectedPoints.length > 6 && (
              <button
                type="button"
                onClick={() => setShowAllSelectedPreview((p) => !p)}
                className="text-[11px] font-bold text-[#D32F2F] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>{showAllSelectedPreview ? 'Daralt' : `Tümünü Gör (+${selectedPoints.length - 6})`}</span>
                {showAllSelectedPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto prominent-scrollbar">
            {displayedPreviewPoints.map((pt) => {
              const km = formatKmDisplay(pt.kmValue, pt.title);
              return (
                <span
                  key={pt.id}
                  className="inline-flex items-center gap-1 bg-white border border-[#DEE2E6] px-2 py-0.5 rounded-lg text-[10px] font-medium text-[#212529] shadow-2xs max-w-[200px]"
                  title={`${km ? `KM ${km} - ` : ''}${pt.title}`}
                >
                  {km && (
                    <span className="font-roboto-mono font-bold text-[#D32F2F] shrink-0">
                      {km}
                    </span>
                  )}
                  <span className="truncate">{pt.title}</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="overflow-y-auto prominent-scrollbar px-4 sm:px-5 py-3.5 space-y-3 flex-1 min-h-0 touch-pan-y overscroll-contain bg-white">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#D32F2F] shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. KATEGORİ / TÜR DEĞİŞTİR */}
            <div
              className={`rounded-xl border p-3 transition-all ${
                enableCategory
                  ? 'border-[#D32F2F] bg-rose-50/30 shadow-xs'
                  : 'border-[#DEE2E6] bg-[#F8F9FA]/60'
              }`}
            >
              <label className="flex items-center justify-between gap-2 cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={enableCategory}
                    onChange={(e) => setEnableCategory(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#D32F2F] cursor-pointer"
                  />
                  <Sliders className="w-4 h-4 text-[#D32F2F]" />
                  <span className="text-xs sm:text-sm font-bold text-[#212529]">
                    Kategori / Varlık Türünü Değiştir
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-[#6C757D]">
                  {enableCategory ? 'Uygulanacak' : 'Değiştirilmeyecek'}
                </span>
              </label>

              {enableCategory && (
                <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {CATEGORIES.map((cat) => {
                    const conf = DEFAULT_CATEGORY_COLORS[cat.id];
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-[11px] font-semibold text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#D32F2F] text-white border-[#D32F2F] shadow-xs'
                            : 'bg-white text-[#212529] border-[#DEE2E6] hover:border-[#D32F2F]/50'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/60"
                          style={{ backgroundColor: conf?.bg || '#D32F2F' }}
                        />
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. HAT ADI DEĞİŞTİR */}
            <div
              className={`rounded-xl border p-3 transition-all ${
                enableLineName
                  ? 'border-[#D32F2F] bg-rose-50/30 shadow-xs'
                  : 'border-[#DEE2E6] bg-[#F8F9FA]/60'
              }`}
            >
              <label className="flex items-center justify-between gap-2 cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={enableLineName}
                    onChange={(e) => setEnableLineName(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#D32F2F] cursor-pointer"
                  />
                  <Train className="w-4 h-4 text-[#D32F2F]" />
                  <span className="text-xs sm:text-sm font-bold text-[#212529]">
                    Demiryolu Hattını Değiştir
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-[#6C757D]">
                  {enableLineName ? 'Uygulanacak' : 'Değiştirilmeyecek'}
                </span>
              </label>

              {enableLineName && (
                <div className="mt-2.5 space-y-2">
                  {!isAddingNewLine ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={lineName}
                        onChange={(e) => setLineName(e.target.value)}
                        className="flex-1 bg-white border border-[#DEE2E6] focus:border-[#D32F2F] rounded-lg px-3 py-2 text-xs font-medium text-[#212529] outline-none"
                      >
                        {savedLines.length === 0 && (
                          <option value="Eskişehir-Konya">Eskişehir-Konya</option>
                        )}
                        {savedLines.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setIsAddingNewLine(true)}
                        className="px-2.5 py-2 bg-white hover:bg-[#F8F9FA] border border-[#DEE2E6] rounded-lg text-xs font-bold text-[#D32F2F] flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Yeni Hat</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newLineInput}
                        onChange={(e) => setNewLineInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomLine();
                          }
                        }}
                        placeholder="Örn: Kütahya - Balıkesir Hattı"
                        className="flex-1 bg-white border border-[#DEE2E6] focus:border-[#D32F2F] rounded-lg px-3 py-2 text-xs text-[#212529] outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomLine}
                        className="px-3 py-2 bg-[#D32F2F] text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Ekle</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingNewLine(false)}
                        className="px-2.5 py-2 bg-slate-100 text-[#6C757D] rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        İptal
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. MEVKİİ / LOKASYON AÇIKLAMASI */}
            <div
              className={`rounded-xl border p-3 transition-all ${
                enableLocationDesc
                  ? 'border-[#D32F2F] bg-rose-50/30 shadow-xs'
                  : 'border-[#DEE2E6] bg-[#F8F9FA]/60'
              }`}
            >
              <label className="flex items-center justify-between gap-2 cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={enableLocationDesc}
                    onChange={(e) => setEnableLocationDesc(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#D32F2F] cursor-pointer"
                  />
                  <MapPin className="w-4 h-4 text-[#D32F2F]" />
                  <span className="text-xs sm:text-sm font-bold text-[#212529]">
                    Bölge / Mevkii Bilgisini Güncelle
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-[#6C757D]">
                  {enableLocationDesc ? 'Uygulanacak' : 'Değiştirilmeyecek'}
                </span>
              </label>

              {enableLocationDesc && (
                <div className="mt-2.5">
                  <input
                    type="text"
                    value={locationDesc}
                    onChange={(e) => setLocationDesc(e.target.value)}
                    placeholder="Örn: 712 Yol Bakım Şefliği Sorumluluk Sahası (boş bırakırsanız temizlenir)"
                    className="w-full bg-white border border-[#DEE2E6] focus:border-[#D32F2F] rounded-lg px-3 py-2 text-xs text-[#212529] outline-none"
                  />
                </div>
              )}
            </div>

            {/* 4. BAŞLIK TOPLU İŞLEMİ */}
            <div
              className={`rounded-xl border p-3 transition-all ${
                enableTitleOp
                  ? 'border-[#D32F2F] bg-rose-50/30 shadow-xs'
                  : 'border-[#DEE2E6] bg-[#F8F9FA]/60'
              }`}
            >
              <label className="flex items-center justify-between gap-2 cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={enableTitleOp}
                    onChange={(e) => setEnableTitleOp(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#D32F2F] cursor-pointer"
                  />
                  <Type className="w-4 h-4 text-[#D32F2F]" />
                  <span className="text-xs sm:text-sm font-bold text-[#212529]">
                    Başlıkları Toplu Düzenle
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-[#6C757D]">
                  {enableTitleOp ? 'Uygulanacak' : 'Değiştirilmeyecek'}
                </span>
              </label>

              {enableTitleOp && (
                <div className="mt-2.5 space-y-2.5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {[
                      { id: 'prefix', label: 'Başına Ekle' },
                      { id: 'suffix', label: 'Sonuna Ekle' },
                      { id: 'find_replace', label: 'Bul & Değiştir' },
                      { id: 'replace', label: 'Hepsini Aynı Yap' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setTitleMode(opt.id as any)}
                        className={`px-2 py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                          titleMode === opt.id
                            ? 'bg-[#212529] text-white border-[#212529]'
                            : 'bg-white text-[#495057] border-[#DEE2E6] hover:bg-slate-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {titleMode === 'find_replace' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={titleFindText}
                        onChange={(e) => setTitleFindText(e.target.value)}
                        placeholder="Bulunacak kelime/metin..."
                        className="bg-white border border-[#DEE2E6] focus:border-[#D32F2F] rounded-lg px-3 py-2 text-xs text-[#212529] outline-none"
                      />
                      <input
                        type="text"
                        value={titleReplaceText}
                        onChange={(e) => setTitleReplaceText(e.target.value)}
                        placeholder="Yeni metin (boş bırakılabilir)..."
                        className="bg-white border border-[#DEE2E6] focus:border-[#D32F2F] rounded-lg px-3 py-2 text-xs text-[#212529] outline-none"
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={titleValue}
                      onChange={(e) => setTitleValue(e.target.value)}
                      placeholder={
                        titleMode === 'prefix'
                          ? 'Örn: [ACİL BAKIM]'
                          : titleMode === 'suffix'
                          ? 'Örn: - Kontrol Edildi'
                          : 'Tüm seçili noktalara verilecek ortak başlık...'
                      }
                      className="w-full bg-white border border-[#DEE2E6] focus:border-[#D32F2F] rounded-lg px-3 py-2 text-xs text-[#212529] outline-none"
                    />
                  )}

                  <div className="bg-white border border-[#DEE2E6] rounded-lg px-3 py-1.5 text-[11px] text-[#6C757D]">
                    <span className="font-bold text-[#212529]">Önizleme (İlk KM): </span>
                    <span className="font-roboto-mono text-[#D32F2F] font-semibold">{titlePreview}</span>
                  </div>
                </div>
              )}
            </div>

            {/* 5. AÇIKLAMA TOPLU İŞLEMİ */}
            <div
              className={`rounded-xl border p-3 transition-all ${
                enableDescOp
                  ? 'border-[#D32F2F] bg-rose-50/30 shadow-xs'
                  : 'border-[#DEE2E6] bg-[#F8F9FA]/60'
              }`}
            >
              <label className="flex items-center justify-between gap-2 cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={enableDescOp}
                    onChange={(e) => setEnableDescOp(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#D32F2F] cursor-pointer"
                  />
                  <FileText className="w-4 h-4 text-[#D32F2F]" />
                  <span className="text-xs sm:text-sm font-bold text-[#212529]">
                    Açıklama Alanını Toplu Güncelle
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-[#6C757D]">
                  {enableDescOp ? 'Uygulanacak' : 'Değiştirilmeyecek'}
                </span>
              </label>

              {enableDescOp && (
                <div className="mt-2.5 space-y-2">
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'append', label: 'Sonuna Ekle' },
                      { id: 'replace', label: 'Üzerine Yaz' },
                      { id: 'clear', label: 'Açıklamayı Temizle' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setDescMode(opt.id as any)}
                        className={`px-2 py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                          descMode === opt.id
                            ? 'bg-[#212529] text-white border-[#212529]'
                            : 'bg-white text-[#495057] border-[#DEE2E6] hover:bg-slate-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {descMode !== 'clear' && (
                    <textarea
                      rows={2}
                      value={descValue}
                      onChange={(e) => setDescValue(e.target.value)}
                      placeholder={
                        descMode === 'append'
                          ? 'Mevcut açıklamanın altına eklenecek metin...'
                          : 'Tüm seçili noktaların yeni ortak açıklaması...'
                      }
                      className="w-full bg-white border border-[#DEE2E6] focus:border-[#D32F2F] rounded-lg px-3 py-2 text-xs text-[#212529] outline-none resize-y"
                    />
                  )}
                </div>
              )}
            </div>

            {/* 6. TOPLU SAHA NOTU EKLE */}
            <div
              className={`rounded-xl border p-3 transition-all ${
                enableAddNote
                  ? 'border-[#D32F2F] bg-rose-50/30 shadow-xs'
                  : 'border-[#DEE2E6] bg-[#F8F9FA]/60'
              }`}
            >
              <label className="flex items-center justify-between gap-2 cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={enableAddNote}
                    onChange={(e) => setEnableAddNote(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#D32F2F] cursor-pointer"
                  />
                  <MessageSquare className="w-4 h-4 text-[#D32F2F]" />
                  <span className="text-xs sm:text-sm font-bold text-[#212529]">
                    Hepsine Aynı Saha Notunu Ekle
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-[#6C757D]">
                  {enableAddNote ? 'Eklenecek' : 'Eklenmeyecek'}
                </span>
              </label>

              {enableAddNote && (
                <div className="mt-2.5 space-y-2">
                  <textarea
                    rows={2}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Seçili tüm KM noktalarına eklenecek ortak saha notu..."
                    className="w-full bg-white border border-[#DEE2E6] focus:border-[#D32F2F] rounded-lg px-3 py-2 text-xs text-[#212529] outline-none resize-y"
                  />
                  <input
                    type="text"
                    value={noteAuthor}
                    onChange={(e) => setNoteAuthor(e.target.value)}
                    placeholder="Notu Ekleyen Personel / Şeflik"
                    className="w-full bg-white border border-[#DEE2E6] focus:border-[#D32F2F] rounded-lg px-3 py-1.5 text-xs text-[#212529] outline-none"
                  />
                </div>
              )}
            </div>

            {/* 7. TOPLU YAPILAN İŞ / BAKIM KAYDI EKLE */}
            <div
              className={`rounded-xl border p-3 transition-all ${
                enableAddWorkLog
                  ? 'border-[#D32F2F] bg-rose-50/30 shadow-xs'
                  : 'border-[#DEE2E6] bg-[#F8F9FA]/60'
              }`}
            >
              <label className="flex items-center justify-between gap-2 cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={enableAddWorkLog}
                    onChange={(e) => setEnableAddWorkLog(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#D32F2F] cursor-pointer"
                  />
                  <Wrench className="w-4 h-4 text-[#D32F2F]" />
                  <span className="text-xs sm:text-sm font-bold text-[#212529]">
                    Hepsine Yapılan İş / Bakım Kaydı Ekle
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-[#6C757D]">
                  {enableAddWorkLog ? 'Eklenecek' : 'Eklenmeyecek'}
                </span>
              </label>

              {enableAddWorkLog && (
                <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={workTitle}
                    onChange={(e) => setWorkTitle(e.target.value)}
                    placeholder="İş Başlığı (Örn: Ot Temizliği / Travers Kontrol)"
                    className="sm:col-span-2 bg-white border border-[#DEE2E6] focus:border-[#D32F2F] rounded-lg px-3 py-2 text-xs text-[#212529] outline-none"
                  />
                  <select
                    value={workType}
                    onChange={(e) => setWorkType(e.target.value as WorkLog['workType'])}
                    className="bg-white border border-[#DEE2E6] focus:border-[#D32F2F] rounded-lg px-3 py-2 text-xs text-[#212529] outline-none"
                  >
                    <option value="bakim">Periyodik Bakım</option>
                    <option value="onarim">Arıza Onarımı</option>
                    <option value="yenileme">Malzeme Yenileme</option>
                    <option value="muayene">Yol Muayene / Kontrol</option>
                    <option value="temizlik">Menfez / Ot Temizliği</option>
                    <option value="diger">Diğer İşlem</option>
                  </select>
                  <select
                    value={workStatus}
                    onChange={(e) => setWorkStatus(e.target.value as WorkLog['status'])}
                    className="bg-white border border-[#DEE2E6] focus:border-[#D32F2F] rounded-lg px-3 py-2 text-xs text-[#212529] outline-none"
                  >
                    <option value="tamamlandi">Tamamlandı</option>
                    <option value="devam_ediyor">Devam Ediyor</option>
                    <option value="planlandi">Planlandı</option>
                  </select>
                  <input
                    type="date"
                    value={workDate}
                    onChange={(e) => setWorkDate(e.target.value)}
                    className="bg-white border border-[#DEE2E6] focus:border-[#D32F2F] rounded-lg px-3 py-2 text-xs text-[#212529] outline-none"
                  />
                  <input
                    type="text"
                    value={workBy}
                    onChange={(e) => setWorkBy(e.target.value)}
                    placeholder="Yapan Ekip / Şeflik"
                    className="bg-white border border-[#DEE2E6] focus:border-[#D32F2F] rounded-lg px-3 py-2 text-xs text-[#212529] outline-none"
                  />
                  <input
                    type="text"
                    value={workMaterials}
                    onChange={(e) => setWorkMaterials(e.target.value)}
                    placeholder="Kullanılan Malzeme (Opsiyonel)"
                    className="sm:col-span-2 bg-white border border-[#DEE2E6] focus:border-[#D32F2F] rounded-lg px-3 py-2 text-xs text-[#212529] outline-none"
                  />
                  <textarea
                    rows={2}
                    value={workDesc}
                    onChange={(e) => setWorkDesc(e.target.value)}
                    placeholder="Yapılan iş açıklaması (Opsiyonel)..."
                    className="sm:col-span-2 bg-white border border-[#DEE2E6] focus:border-[#D32F2F] rounded-lg px-3 py-2 text-xs text-[#212529] outline-none resize-y"
                  />
                </div>
              )}
            </div>

            {/* 8A. HEMZEMİN GEÇİT ORTAK TEKNİK BİLGİLERİ */}
            {hasCrossing && (
              <div
                className={`rounded-xl border p-3 transition-all ${
                  enableCrossingPatch
                    ? 'border-amber-500 bg-amber-50/40 shadow-xs'
                    : 'border-[#DEE2E6] bg-[#F8F9FA]/60'
                }`}
              >
                <label className="flex items-center justify-between gap-2 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={enableCrossingPatch}
                      onChange={(e) => setEnableCrossingPatch(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#D32F2F] cursor-pointer"
                    />
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span className="text-xs sm:text-sm font-bold text-[#212529]">
                      Hemzemin Geçit Ortak Alanlarını Güncelle
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-[#6C757D]">
                    {enableCrossingPatch ? 'Uygulanacak' : 'Opsiyonel'}
                  </span>
                </label>

                {enableCrossingPatch && (
                  <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={crossingIl}
                      onChange={(e) => setCrossingIl(e.target.value)}
                      placeholder="Bulunduğu İl (Örn: Kütahya)"
                      className="bg-white border border-[#DEE2E6] focus:border-[#D32F2F] rounded-lg px-3 py-2 text-xs outline-none"
                    />
                    <input
                      type="text"
                      value={crossingSeflik}
                      onChange={(e) => setCrossingSeflik(e.target.value)}
                      placeholder="Şube Şefliği (Örn: 712 Kütahya)"
                      className="bg-white border border-[#DEE2E6] focus:border-[#D32F2F] rounded-lg px-3 py-2 text-xs outline-none"
                    />
                    <input
                      type="text"
                      value={crossingRoad}
                      onChange={(e) => setCrossingRoad(e.target.value)}
                      placeholder="Karayolu Kuruluşu (Örn: İl Özel İdaresi)"
                      className="bg-white border border-[#DEE2E6] focus:border-[#D32F2F] rounded-lg px-3 py-2 text-xs outline-none"
                    />
                    <input
                      type="text"
                      value={crossingSurface}
                      onChange={(e) => setCrossingSurface(e.target.value)}
                      placeholder="Kaplama Cinsi (Örn: Kauçuk)"
                      className="bg-white border border-[#DEE2E6] focus:border-[#D32F2F] rounded-lg px-3 py-2 text-xs outline-none"
                    />
                    <input
                      type="text"
                      value={crossingType}
                      onChange={(e) => setCrossingType(e.target.value)}
                      placeholder="Geçit Tipi (Örn: Flaşörlü+Çanlı Otomatik Bariyerli)"
                      className="sm:col-span-2 bg-white border border-[#DEE2E6] focus:border-[#D32F2F] rounded-lg px-3 py-2 text-xs outline-none"
                    />
                  </div>
                )}
              </div>
            )}

            {/* 8B. MENFEZ ORTAK TEKNİK BİLGİLERİ */}
            {hasCulvert && (
              <div
                className={`rounded-xl border p-3 transition-all ${
                  enableCulvertPatch
                    ? 'border-cyan-600 bg-cyan-50/40 shadow-xs'
                    : 'border-[#DEE2E6] bg-[#F8F9FA]/60'
                }`}
              >
                <label className="flex items-center justify-between gap-2 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={enableCulvertPatch}
                      onChange={(e) => setEnableCulvertPatch(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#D32F2F] cursor-pointer"
                    />
                    <Sliders className="w-4 h-4 text-cyan-600" />
                    <span className="text-xs sm:text-sm font-bold text-[#212529]">
                      Menfez Ortak Alanlarını Güncelle
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-[#6C757D]">
                    {enableCulvertPatch ? 'Uygulanacak' : 'Opsiyonel'}
                  </span>
                </label>

                {enableCulvertPatch && (
                  <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={culvertSeflik}
                      onChange={(e) => setCulvertSeflik(e.target.value)}
                      placeholder="Bakım Şefliği (Örn: 712 YOL BAKIM)"
                      className="bg-white border border-[#DEE2E6] focus:border-[#D32F2F] rounded-lg px-3 py-2 text-xs outline-none"
                    />
                    <input
                      type="text"
                      value={culvertHatti}
                      onChange={(e) => setCulvertHatti(e.target.value)}
                      placeholder="Hattı (Örn: Esk.-Konya)"
                      className="bg-white border border-[#DEE2E6] focus:border-[#D32F2F] rounded-lg px-3 py-2 text-xs outline-none"
                    />
                    <input
                      type="text"
                      value={culvertCinsi}
                      onChange={(e) => setCulvertCinsi(e.target.value)}
                      placeholder="Cinsi (Örn: Ferbeton / Taş Kemer)"
                      className="bg-white border border-[#DEE2E6] focus:border-[#D32F2F] rounded-lg px-3 py-2 text-xs outline-none"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Action Bar */}
          <div className="px-4 sm:px-5 py-3 border-t border-[#DEE2E6] bg-[#F8F9FA] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0 pb-safe">
            <div className="text-[11px] text-[#6C757D] font-medium">
              {activeOperationsCount > 0 ? (
                <span>
                  <strong className="text-[#D32F2F]">{activeOperationsCount} işlem</strong> seçili{' '}
                  <strong className="text-[#212529]">{selectedPoints.length} KM</strong> üzerine aynı anda uygulanacak.
                </span>
              ) : (
                <span>Yukarıdan uygulanacak düzenleme alanlarını işaretleyin.</span>
              )}
            </div>

            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl border border-[#DEE2E6] bg-white hover:bg-slate-100 text-xs font-bold text-[#495057] transition-colors cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                id="confirm-bulk-edit-btn"
                type="submit"
                disabled={isSaving || activeOperationsCount === 0}
                className="px-5 py-2 rounded-xl bg-[#D32F2F] hover:bg-[#B71C1C] disabled:opacity-50 text-white text-xs font-extrabold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>
                  {isSaving
                    ? 'Uygulanıyor...'
                    : `Seçilen ${selectedPoints.length} KM'ye Uygula`}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
