import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  HardDriveDownload,
  Wifi,
  WifiOff,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Play,
  Square,
  RefreshCw,
  Layers,
  MapPin,
  Sparkles,
  Info,
  Sliders,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { RailwayPoint } from '../types.ts';
import {
  OfflineCacheStats,
  TileDownloadProgress,
  getOfflineCacheStats,
  clearOfflineTileCache,
  isForceOfflineMode,
  setForceOfflineMode,
  calculateTilesAlongPath,
  calculateTilesInBounds,
  downloadAndCacheTiles,
} from '../utils/offlineMapStorage.ts';
import { DeleteConfirmModal } from './DeleteConfirmModal.tsx';

interface OfflineMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  points: RailwayPoint[];
  isOnline: boolean;
  currentMapBounds?: { minLat: number; maxLat: number; minLng: number; maxLng: number } | null;
  onToast: (msg: string) => void;
}

export const OfflineMapModal: React.FC<OfflineMapModalProps> = ({
  isOpen,
  onClose,
  points,
  isOnline,
  currentMapBounds,
  onToast,
}) => {
  const [stats, setStats] = useState<OfflineCacheStats>({
    tileCount: 0,
    estimatedSizeBytes: 0,
    formattedSize: '0 KB',
    lastUpdated: null,
  });
  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [forceOffline, setForceOffline] = useState<boolean>(isForceOfflineMode);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<TileDownloadProgress | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<'all' | 'esk-konya' | 'ala-bal' | 'viewport'>('all');
  const [isClearModalOpen, setIsClearModalOpen] = useState<boolean>(false);
  const [isClearing, setIsClearing] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Load stats whenever modal opens
  const refreshStats = async () => {
    setLoadingStats(true);
    try {
      const data = await getOfflineCacheStats();
      setStats(data);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshStats();
      setForceOffline(isForceOfflineMode());
    }
  }, [isOpen]);

  // Points grouped by line
  const eskKonyaPoints = useMemo(() => {
    return points.filter((p) => (p.lineName || '').toLowerCase().includes('eskişehir') || (p.lineName || '').toLowerCase().includes('enveriye') || (p.lineName || '').toLowerCase().includes('konya'));
  }, [points]);

  const alaBalPoints = useMemo(() => {
    return points.filter((p) => (p.lineName || '').toLowerCase().includes('alayunt') || (p.lineName || '').toLowerCase().includes('balıkesir') || (p.lineName || '').toLowerCase().includes('tavşanlı') || (p.lineName || '').toLowerCase().includes('kütahya'));
  }, [points]);

  // Toggle Force Offline Mode
  const handleToggleOfflineMode = () => {
    const nextVal = !forceOffline;
    setForceOffline(nextVal);
    setForceOfflineMode(nextVal);
    if (nextVal) {
      onToast('📶 Çevrimdışı Mod aktif edildi. Harita yalnızca yerel depolamadaki verileri ve hat çizgisini kullanacak.');
    } else {
      onToast('🌐 Çevrimiçi Mod aktif. Standart harita uydusu ve ağ bağlantısı kullanılacak.');
    }
  };

  // Start Downloading selected package
  const handleStartDownload = async () => {
    if (isDownloading) return;

    if (!isOnline && !forceOffline) {
      onToast('Harita parçalarını indirebilmek için internet bağlantısı gereklidir.');
      return;
    }

    let targetPoints: { lat: number; lng: number }[] = [];
    let tilesToDownload: { z: number; x: number; y: number; url: string }[] = [];

    if (selectedPackage === 'viewport' && currentMapBounds) {
      tilesToDownload = calculateTilesInBounds(currentMapBounds, [8, 9, 10, 11, 12]);
    } else if (selectedPackage === 'esk-konya') {
      targetPoints = eskKonyaPoints.map((p) => ({ lat: p.lat, lng: p.lng }));
      if (targetPoints.length === 0) {
        // Fallback default coordinate corridor if points array is empty
        targetPoints = [
          { lat: 39.77, lng: 30.52 }, // Eskişehir
          { lat: 39.42, lng: 30.01 }, // Kütahya
          { lat: 38.75, lng: 30.54 }, // Afyon
          { lat: 38.35, lng: 31.41 }, // Akşehir
          { lat: 37.87, lng: 32.48 }, // Konya
        ];
      }
      tilesToDownload = calculateTilesAlongPath(targetPoints, [8, 9, 10, 11, 12], 1);
    } else if (selectedPackage === 'ala-bal') {
      targetPoints = alaBalPoints.map((p) => ({ lat: p.lat, lng: p.lng }));
      if (targetPoints.length === 0) {
        targetPoints = [
          { lat: 39.42, lng: 30.01 }, // Kütahya/Alayunt
          { lat: 39.54, lng: 29.50 }, // Tavşanlı
          { lat: 39.58, lng: 28.62 }, // Dursunbey
          { lat: 39.64, lng: 27.88 }, // Balıkesir
        ];
      }
      tilesToDownload = calculateTilesAlongPath(targetPoints, [8, 9, 10, 11, 12], 1);
    } else {
      // ALL lines
      const allPts = points.length > 0 ? points.map((p) => ({ lat: p.lat, lng: p.lng })) : [
        { lat: 39.77, lng: 30.52 },
        { lat: 39.42, lng: 30.01 },
        { lat: 38.75, lng: 30.54 },
        { lat: 38.35, lng: 31.41 },
        { lat: 37.87, lng: 32.48 },
        { lat: 39.54, lng: 29.50 },
        { lat: 39.58, lng: 28.62 },
        { lat: 39.64, lng: 27.88 },
      ];
      tilesToDownload = calculateTilesAlongPath(allPts, [8, 9, 10, 11, 12], 1);
    }

    if (tilesToDownload.length === 0) {
      onToast('İndirilecek harita alanı belirlenemedi.');
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsDownloading(true);
    setDownloadProgress({
      current: 0,
      total: tilesToDownload.length,
      percentage: 0,
      statusText: `0 / ${tilesToDownload.length} karo indiriliyor...`,
      isCompleted: false,
    });

    try {
      const res = await downloadAndCacheTiles(
        tilesToDownload,
        (progress) => {
          setDownloadProgress(progress);
        },
        controller.signal
      );

      await refreshStats();
      onToast(`✅ Başarılı! ${res.downloaded} adet yeni harita parçası yerel depolamaya kaydedildi.`);
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message?.includes('iptal')) {
        onToast('İndirme işlemi durduruldu.');
      } else {
        console.error('Harita indirme hatası:', err);
        onToast('Harita parçaları indirilirken bir sorun oluştu.');
      }
    } finally {
      setIsDownloading(false);
      abortControllerRef.current = null;
    }
  };

  // Cancel ongoing download
  const handleCancelDownload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsDownloading(false);
      onToast('İndirme durduruldu.');
    }
  };

  // Clear cache handler
  const handleClearCacheConfirm = async () => {
    setIsClearing(true);
    try {
      await clearOfflineTileCache();
      await refreshStats();
      setIsClearModalOpen(false);
      onToast('Harita karoları önbelleği tamamen temizlendi.');
    } finally {
      setIsClearing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        id="offline-map-modal-backdrop"
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
        onClick={onClose}
      >
        <div
          id="offline-map-modal-content"
          className="bg-white rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-900 text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
                <HardDriveDownload className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white leading-tight">
                  Çevrimdışı Harita &amp; Önbellek
                </h2>
                <p className="text-xs text-slate-300">
                  İnternetsiz sahalar için yerel harita depolama yönetimi
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto prominent-scrollbar p-5 space-y-4 text-slate-800 text-xs">
            {/* Top Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Card 1: Connection Status */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ağ Bağlantısı</span>
                <div className="flex items-center gap-2 mt-1">
                  {isOnline ? (
                    <>
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="font-bold text-slate-900 text-sm">Çevrimiçi (Online)</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3.5 h-3.5 text-rose-600" />
                      <span className="font-bold text-rose-700 text-sm">Çevrimdışı (Offline)</span>
                    </>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1">
                  {isOnline ? 'Harita sunucularına erişilebilir' : 'Yalnızca cihazdaki önbellek aktif'}
                </span>
              </div>

              {/* Card 2: Offline Mode Switch */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Çevrimdışı Mod</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={forceOffline}
                      onChange={handleToggleOfflineMode}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
                <div className="mt-1 font-bold text-slate-900 text-sm">
                  {forceOffline ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Zorla Açık
                    </span>
                  ) : (
                    <span className="text-slate-600">Otomatik</span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1">
                  {forceOffline ? 'İnternet olsa dahi yerel hat haritası devrede' : 'İnternet kesildiğinde devreye girer'}
                </span>
              </div>

              {/* Card 3: Storage Stats */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Depolanan Parçalar</span>
                  <button
                    onClick={refreshStats}
                    disabled={loadingStats}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                    title="Yenile"
                  >
                    <RefreshCw className={`w-3 h-3 ${loadingStats ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <div className="mt-1 font-extrabold text-slate-900 text-sm">
                  {loadingStats ? 'Hesaplanıyor...' : `${stats.tileCount} Karo (${stats.formattedSize})`}
                </div>
                <span className="text-[10px] text-slate-400 mt-1">
                  {stats.lastUpdated ? `Son: ${new Date(stats.lastUpdated).toLocaleDateString('tr-TR')}` : 'Henüz indirilmedi'}
                </span>
              </div>
            </div>

            {/* Informative Banner about Vector Baseline Map */}
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-start gap-2.5 text-sky-900">
              <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <span className="font-bold">Temel Hat Haritası Garantisi: </span>
                İnternetsiz sahalarda hiçbir karo indirilmemiş olsa dahi, sisteminizdeki kayıtlı tüm noktalar (makaslar, menfezler, geçitler ve istasyonlar) ile demiryolu ray hattı vektörel şematik olarak haritada kesintisiz çizilir.
              </div>
            </div>

            {/* Download Packages Section */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">Hat Haritasını İndir &amp; Önbelleğe Al</h3>
                  <p className="text-[11px] text-slate-500">
                    Sahaya çıkmadan önce aşağıdaki hat koridorlarını cihazınıza indirin
                  </p>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                  Zoom 8–12
                </span>
              </div>

              {/* Package Radio Selection */}
              <div className="space-y-2">
                {/* Package 1: All Lines */}
                <label
                  onClick={() => setSelectedPackage('all')}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedPackage === 'all'
                      ? 'border-sky-500 bg-sky-50/50 ring-1 ring-sky-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="package"
                    checked={selectedPackage === 'all'}
                    onChange={() => setSelectedPackage('all')}
                    className="mt-0.5 text-sky-600 focus:ring-sky-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">
                        Tüm Hatlar (Eskişehir-Konya &amp; Alayunt-Balıkesir)
                      </span>
                      <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-1.5 py-0.2 rounded">
                        ~6 - 8 MB
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Her iki ana demiryolu hattının tüm güzergahını, ara istasyonlarını ve 10 km çevre tamponunu kapsar.
                    </p>
                  </div>
                </label>

                {/* Package 2: Eskişehir-Konya */}
                <label
                  onClick={() => setSelectedPackage('esk-konya')}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedPackage === 'esk-konya'
                      ? 'border-sky-500 bg-sky-50/50 ring-1 ring-sky-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="package"
                    checked={selectedPackage === 'esk-konya'}
                    onChange={() => setSelectedPackage('esk-konya')}
                    className="mt-0.5 text-sky-600 focus:ring-sky-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">
                        Eskişehir - Konya Hattı Koridoru
                      </span>
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                        ~4 MB
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Enveriye, Alayunt, Kütahya, Afyonkarahisar, Akşehir, Ilgın ve Konya hattı boyunca harita parçaları.
                    </p>
                  </div>
                </label>

                {/* Package 3: Alayunt-Balıkesir */}
                <label
                  onClick={() => setSelectedPackage('ala-bal')}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedPackage === 'ala-bal'
                      ? 'border-sky-500 bg-sky-50/50 ring-1 ring-sky-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="package"
                    checked={selectedPackage === 'ala-bal'}
                    onChange={() => setSelectedPackage('ala-bal')}
                    className="mt-0.5 text-sky-600 focus:ring-sky-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">
                        Alayunt - Balıkesir Hattı Koridoru
                      </span>
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                        ~3 MB
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Kütahya, Tavşanlı, Değirmenözü, Dursunbey ve Balıkesir güzergahı boyunca harita parçaları.
                    </p>
                  </div>
                </label>

                {/* Package 4: Viewport */}
                {currentMapBounds && (
                  <label
                    onClick={() => setSelectedPackage('viewport')}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedPackage === 'viewport'
                        ? 'border-sky-500 bg-sky-50/50 ring-1 ring-sky-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="package"
                      checked={selectedPackage === 'viewport'}
                      onChange={() => setSelectedPackage('viewport')}
                      className="mt-0.5 text-sky-600 focus:ring-sky-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">
                          Şu An Ekranda Görünen Alan
                        </span>
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                          Hızlı (~1-2 MB)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Haritanızda o an baktığınız kadrajın detaylı seviyelerini depolar.
                      </p>
                    </div>
                  </label>
                )}
              </div>

              {/* Action Button & Live Progress */}
              {isDownloading ? (
                <div className="p-3 bg-slate-900 text-white rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-sky-400 flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>İndiriliyor...</span>
                    </span>
                    <span className="font-mono font-bold text-slate-300">
                      %{downloadProgress?.percentage || 0}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-sky-500 h-full rounded-full transition-all duration-200"
                      style={{ width: `${downloadProgress?.percentage || 0}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{downloadProgress?.statusText || 'Başlatılıyor...'}</span>
                    <button
                      type="button"
                      onClick={handleCancelDownload}
                      className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Square className="w-3 h-3 fill-current" />
                      <span>İptal Et</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleStartDownload}
                  className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 active:scale-[0.99] text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <HardDriveDownload className="w-4 h-4" />
                  <span>Seçilen Hat Haritasını Cihaza İndir</span>
                </button>
              )}
            </div>

            {/* Auto Caching & Maintenance Notice */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900 text-xs block">Otomatik Arka Plan Önbellekleme</span>
                  <span className="text-[10px] text-slate-500">
                    Haritada gezinirken görüntülediğiniz tüm bölgeler kalıcı olarak cihazınızda saklanır.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsClearModalOpen(true)}
                disabled={stats.tileCount === 0}
                className="shrink-0 ml-3 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Önbelleği Boşalt
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs shrink-0">
            <span className="text-[11px] text-slate-500">
              TCDD 712 Yol Bakım Şefliği Çevrimdışı Altyapısı
            </span>
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Tamam
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal for Clearing Offline Cache */}
      <DeleteConfirmModal
        isOpen={isClearModalOpen}
        title="Harita Önbelleğini Boşalt"
        itemName={`${stats.tileCount} adet harita karosu (${stats.formattedSize})`}
        description="Cihazınızda depolanan çevrimdışı harita parçaları silinecektir. İnternetsiz sahalarda temel hat haritası görüntülenmeye devam eder."
        confirmText="Evet, Önbelleği Temizle"
        cancelText="Vazgeç"
        isDeleting={isClearing}
        onConfirm={handleClearCacheConfirm}
        onClose={() => setIsClearModalOpen(false)}
      />
    </>
  );
};
