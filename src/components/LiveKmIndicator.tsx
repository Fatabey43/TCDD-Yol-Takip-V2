import React, { useState } from 'react';
import {
  Navigation2,
  MapPin,
  AlertCircle,
  Compass,
  ListFilter,
  Plus,
  ChevronDown,
  ChevronUp,
  X,
  Gauge,
  Radio,
  Wrench,
} from 'lucide-react';
import { NearestKmResult } from '../utils/liveRailwayKm.ts';

interface LiveKmIndicatorProps {
  gpsLocation: {
    lat: number;
    lng: number;
    accuracy?: number;
    speed?: number | null;
  } | null;
  nearestKm: NearestKmResult | null;
  isLocating: boolean;
  isLiveActive?: boolean;
  onRefreshGps: () => void;
  onPanToMyLocation: () => void;
  onOpenSelectPoint?: () => void;
  onClose?: () => void;
  isManualPointMode?: boolean;
  selectedPointTitle?: string | null;
  onAddPointAtLiveKm?: () => void;
  onAddWorkAtLiveKm?: () => void;
  onOpenWorkList?: () => void;
  workListCount?: number;
}

export const LiveKmIndicator: React.FC<LiveKmIndicatorProps> = ({
  gpsLocation,
  nearestKm,
  isLocating,
  isLiveActive = false,
  onRefreshGps,
  onPanToMyLocation,
  onOpenSelectPoint,
  onClose,
  isManualPointMode = false,
  selectedPointTitle,
  onAddPointAtLiveKm,
  onAddWorkAtLiveKm,
  onOpenWorkList,
  workListCount,
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // If live mode is not active and no location is set, do not render
  if (!isLiveActive && !gpsLocation && !isLocating) {
    return null;
  }

  // Minimized Floating Pill View
  if (isMinimized) {
    return (
      <div
        id="live-km-indicator-minimized"
        className="absolute bottom-4 left-4 z-20 bg-slate-900/90 text-white backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl px-3.5 py-2 flex items-center gap-2.5 animate-in fade-in select-none"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-1.5 text-xs font-bold font-mono tracking-tight cursor-pointer hover:text-sky-300 transition-colors"
          title="Detayları Göster"
        >
          <span>{nearestKm ? `KM ${nearestKm.chainageKm}` : 'Konum Aranıyor...'}</span>
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        </button>
        <button
          onClick={onPanToMyLocation}
          className="p-1 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Haritada Bu Konuma Odaklan"
        >
          <MapPin className="w-3.5 h-3.5" />
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
            title="Canlı Konumu Kapat"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      id="live-km-indicator"
      className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-2xl p-3.5 text-slate-800 w-[310px] max-w-[calc(100vw-2rem)] animate-in fade-in slide-in-from-bottom-2 duration-150"
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-800 flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
              <span>{isManualPointMode ? 'Referans Noktası' : 'Canlı GPS Konumu'}</span>
            </span>
            {nearestKm?.lineName && (
              <span className="text-[10px] text-slate-500 font-semibold truncate max-w-[140px]">
                {nearestKm.lineName}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onOpenSelectPoint && (
            <button
              onClick={onOpenSelectPoint}
              className="px-1.5 py-1 text-slate-700 hover:text-sky-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold bg-slate-50 border border-slate-200 cursor-pointer shadow-2xs"
              title="Başka Noktayı Canlı Referans Seç"
            >
              <ListFilter className="w-3 h-3 text-sky-600" />
              <span>Nokta Seç</span>
            </button>
          )}

          <button
            onClick={onPanToMyLocation}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Haritada Bu Konuma Odaklan"
          >
            <MapPin className="w-3.5 h-3.5 text-sky-600" />
          </button>

          <button
            onClick={onRefreshGps}
            className={`p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer ${
              isLocating ? 'animate-spin text-sky-600' : ''
            }`}
            title="GPS Konumunu Şimdi Yenile"
          >
            <Navigation2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Küçült"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Canlı Konumu Kapat"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className="pt-2.5">
        {nearestKm ? (
          <div>
            {/* Chainage KM Display */}
            <div className="flex items-baseline justify-between gap-2 bg-sky-50/70 border border-sky-100 rounded-xl px-3 py-2">
              <span className="text-[11px] text-sky-900 font-bold">
                {isManualPointMode ? 'Referans KM:' : 'Demiryolu KM:'}
              </span>
              <span className="text-xl sm:text-2xl font-black text-sky-900 font-mono tracking-tight">
                KM {nearestKm.chainageKm}
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="mt-2.5 space-y-1 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-[11px]">Raya Dik Mesafe:</span>
                <span
                  className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${
                    nearestKm.distanceToRailMeters <= 15
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : nearestKm.distanceToRailMeters <= 60
                      ? 'bg-sky-50 text-sky-800 border border-sky-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {nearestKm.distanceToRailMeters} metre
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-500 truncate text-[11px]">
                <span>En Yakın Nokta:</span>
                <span className="font-semibold text-slate-800 truncate ml-2">
                  {nearestKm.nearestPointTitle} ({nearestKm.nearestPointDistance}m)
                </span>
              </div>

              {/* Speed & Accuracy if GPS available */}
              {gpsLocation && (
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <Gauge className="w-3 h-3 text-slate-400" />
                    <span>Hız: {gpsLocation.speed !== null && gpsLocation.speed !== undefined ? `${gpsLocation.speed} km/s` : 'Sabit'}</span>
                  </span>
                  <span>Hassasiyet: ±{gpsLocation.accuracy || 10}m</span>
                </div>
              )}

              {selectedPointTitle && (
                <div className="text-[10px] text-slate-500 truncate pt-1 border-t border-slate-100 mt-1">
                  Referans: {selectedPointTitle}
                </div>
              )}
            </div>

            {/* Action Buttons: Add Field Work at Live KM & Open Work List */}
            <div className="mt-2.5 flex flex-col gap-1.5">
              {onAddWorkAtLiveKm && (
                <button
                  type="button"
                  onClick={onAddWorkAtLiveKm}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-[0.99]"
                >
                  <Wrench className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Bu Konuma İş Ekle</span>
                </button>
              )}

              {onOpenWorkList && (
                <button
                  type="button"
                  onClick={onOpenWorkList}
                  className="w-full flex items-center justify-between px-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl text-[11px] font-semibold transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Wrench className="w-3 h-3 text-amber-600" />
                    <span>Saha İş Listesi</span>
                  </span>
                  {workListCount !== undefined && workListCount > 0 && (
                    <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                      {workListCount}
                    </span>
                  )}
                </button>
              )}
            </div>

            {nearestKm.isOffTrack && !isManualPointMode && (
              <div className="mt-2 text-[10px] bg-amber-50 border border-amber-200 text-amber-800 px-2 py-1.5 rounded-xl flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                <span>Demiryolu hattından 200m+ uzaktasınız.</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <Navigation2 className="w-7 h-7 text-sky-600 animate-spin mb-2" />
            <p className="text-xs font-bold text-slate-800">
              {isLocating ? 'GPS Uyduları Taranıyor...' : 'Demiryolu KM Hesaplanıyor...'}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Açık alanda olduğunuzdan emin olun.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};


