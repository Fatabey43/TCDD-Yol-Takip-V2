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
  Signal,
} from 'lucide-react';
import { NearestKmResult } from '../utils/liveRailwayKm.ts';

export interface GpsQualityInfo {
  level: 'good' | 'medium' | 'poor';
  text: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotColor: string;
  pingColor: string;
  accuracyMeters: number;
}

export const getGpsSignalQuality = (accuracy?: number): GpsQualityInfo => {
  const acc = Math.round(accuracy ?? 15);
  if (acc <= 8) {
    return {
      level: 'good',
      text: 'Güçlü',
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-700',
      badgeBorder: 'border-emerald-200',
      dotColor: 'bg-emerald-500',
      pingColor: 'bg-emerald-400',
      accuracyMeters: acc,
    };
  }
  if (acc <= 20) {
    return {
      level: 'medium',
      text: 'Orta',
      badgeBg: 'bg-amber-50',
      badgeText: 'text-amber-700',
      badgeBorder: 'border-amber-200',
      dotColor: 'bg-amber-500',
      pingColor: 'bg-amber-400',
      accuracyMeters: acc,
    };
  }
  return {
    level: 'poor',
    text: 'Zayıf',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200',
    dotColor: 'bg-rose-500',
    pingColor: 'bg-rose-400',
    accuracyMeters: acc,
  };
};

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
  const gpsQuality = getGpsSignalQuality(gpsLocation?.accuracy);

  // If live mode is not active, do not render
  if (!isLiveActive) {
    return null;
  }

  // Minimized Floating Pill View
  if (isMinimized) {
    return (
      <div
        id="live-km-indicator-minimized"
        className="absolute bottom-16 sm:bottom-4 left-2 sm:left-4 z-20 bg-white/95 text-[#212529] backdrop-blur-md border border-[#DEE2E6] rounded-2xl shadow-xl px-2.5 py-1.5 sm:px-3.5 sm:py-2 flex items-center gap-2 sm:gap-2.5 animate-in fade-in select-none text-xs font-poppins"
      >
        <span
          className="relative flex h-2.5 w-2.5"
          title={`GPS Sinyali: ${gpsQuality.text} (±${gpsQuality.accuracyMeters}m)`}
        >
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${gpsQuality.pingColor} opacity-75`}></span>
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${gpsQuality.dotColor}`}></span>
        </span>
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-1.5 text-xs font-bold font-roboto-mono tracking-tight cursor-pointer hover:text-[#D32F2F] transition-colors"
          title="Detayları Göster"
        >
          <span>{nearestKm ? `KM ${nearestKm.chainageKm}` : 'Konum Aranıyor...'}</span>
          <ChevronUp className="w-3.5 h-3.5 text-[#6C757D]" />
        </button>

        {gpsLocation && (
          <span
            title={`GPS Hassasiyeti: ±${gpsQuality.accuracyMeters}m (${gpsQuality.text})`}
            className={`text-[9px] font-bold font-roboto-mono px-1.5 py-0.5 rounded border flex items-center gap-1 ${gpsQuality.badgeBg} ${gpsQuality.badgeText} ${gpsQuality.badgeBorder}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${gpsQuality.dotColor}`}></span>
            <span>±{gpsQuality.accuracyMeters}m</span>
          </span>
        )}

        <button
          onClick={onPanToMyLocation}
          className="p-1 hover:bg-[#F8F9FA] rounded-lg text-[#6C757D] hover:text-[#D32F2F] transition-colors cursor-pointer"
          title="Haritada Bu Konuma Odaklan"
        >
          <MapPin className="w-3.5 h-3.5" />
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 text-[#6C757D] hover:text-[#D32F2F] rounded-lg transition-colors cursor-pointer"
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
      className="absolute bottom-16 sm:bottom-4 left-2 sm:left-4 z-20 bg-white/95 backdrop-blur-sm border border-[#DEE2E6] rounded-2xl shadow-xl p-2.5 sm:p-3.5 text-[#212529] w-[290px] sm:w-[310px] max-w-[calc(100vw-1rem)] animate-in fade-in slide-in-from-bottom-2 duration-150 font-poppins"
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#DEE2E6]">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${gpsQuality.pingColor} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${gpsQuality.dotColor}`}></span>
          </span>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#D32F2F] flex items-center gap-1">
                <Radio className={`w-3 h-3 ${gpsQuality.badgeText} animate-pulse`} />
                <span>{isManualPointMode ? 'Referans Noktası' : 'Canlı GPS Konumu'}</span>
              </span>
              {!isManualPointMode && gpsLocation && (
                <span
                  title={`GPS Sinyal Kalitesi: ${gpsQuality.text} (±${gpsQuality.accuracyMeters}m)`}
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md border flex items-center gap-1 ${gpsQuality.badgeBg} ${gpsQuality.badgeText} ${gpsQuality.badgeBorder}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${gpsQuality.dotColor}`} />
                  <span>{gpsQuality.text}</span>
                </span>
              )}
            </div>
            {nearestKm?.lineName && (
              <span className="text-[10px] text-[#6C757D] font-semibold truncate max-w-[140px]">
                {nearestKm.lineName}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onOpenSelectPoint && (
            <button
              onClick={onOpenSelectPoint}
              className="px-1.5 py-1 text-[#212529] hover:text-[#D32F2F] hover:bg-[#F8F9FA] rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold bg-[#F8F9FA] border border-[#DEE2E6] cursor-pointer shadow-2xs"
              title="Başka Noktayı Canlı Referans Seç"
            >
              <ListFilter className="w-3 h-3 text-[#D32F2F]" />
              <span>Nokta Seç</span>
            </button>
          )}

          <button
            onClick={onPanToMyLocation}
            className="p-1.5 text-[#6C757D] hover:text-[#D32F2F] hover:bg-[#F8F9FA] rounded-lg transition-colors cursor-pointer"
            title="Haritada Bu Konuma Odaklan"
          >
            <MapPin className="w-3.5 h-3.5 text-[#D32F2F]" />
          </button>

          <button
            onClick={onRefreshGps}
            className={`p-1.5 text-[#6C757D] hover:text-[#212529] hover:bg-[#F8F9FA] rounded-lg transition-colors cursor-pointer ${
              isLocating ? 'animate-spin text-[#D32F2F]' : ''
            }`}
            title="GPS Konumunu Şimdi Yenile"
          >
            <Navigation2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 text-[#6C757D] hover:text-[#212529] hover:bg-[#F8F9FA] rounded-lg transition-colors cursor-pointer"
            title="Küçült"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-[#6C757D] hover:text-[#D32F2F] hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
            <div className="flex items-baseline justify-between gap-2 bg-[#D32F2F]/5 border border-[#D32F2F]/20 rounded-xl px-3 py-2">
              <span className="text-[11px] text-[#212529] font-bold">
                {isManualPointMode ? 'Referans KM:' : 'Demiryolu KM:'}
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#D32F2F] font-roboto-mono tracking-tight">
                KM {nearestKm.chainageKm}
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="mt-2.5 space-y-1 text-xs">
              <div className="flex items-center justify-between text-[#6C757D]">
                <span className="text-[11px]">Raya Dik Mesafe:</span>
                <span
                  className={`font-roboto-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${
                    nearestKm.distanceToRailMeters <= 15
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : nearestKm.distanceToRailMeters <= 60
                      ? 'bg-[#F8F9FA] text-[#212529] border border-[#DEE2E6]'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {nearestKm.distanceToRailMeters} metre
                </span>
              </div>

              <div className="flex items-center justify-between text-[#6C757D] truncate text-[11px]">
                <span>En Yakın Nokta:</span>
                <span className="font-semibold text-[#212529] truncate ml-2">
                  {nearestKm.nearestPointTitle} ({nearestKm.nearestPointDistance}m)
                </span>
              </div>

              {/* Speed & Colored Signal Quality / Accuracy (Hassasiyet Metre Bazlı) */}
              {gpsLocation && (
                <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-[#DEE2E6]">
                  <span className="flex items-center gap-1 text-[#6C757D]">
                    <Gauge className="w-3 h-3 text-[#6C757D]" />
                    <span>Hız: {gpsLocation.speed !== null && gpsLocation.speed !== undefined ? `${gpsLocation.speed} km/s` : 'Sabit'}</span>
                  </span>

                  {/* Renkli Metre Bazlı Sinyal Göstergesi */}
                  <div
                    title={`GPS Hassasiyeti: ±${gpsQuality.accuracyMeters} metre (${gpsQuality.text} Sinyal)`}
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border font-semibold ${gpsQuality.badgeBg} ${gpsQuality.badgeText} ${gpsQuality.badgeBorder}`}
                  >
                    <span className="flex items-center gap-0.5">
                      <Signal className="w-3 h-3" />
                      <span className={`w-1.5 h-1.5 rounded-full ${gpsQuality.dotColor} ${gpsQuality.level === 'good' ? 'animate-pulse' : ''}`} />
                    </span>
                    <span className="font-roboto-mono font-bold">±{gpsQuality.accuracyMeters}m</span>
                    <span className="text-[9px] font-bold">({gpsQuality.text})</span>
                  </div>
                </div>
              )}

              {selectedPointTitle && (
                <div className="text-[10px] text-[#6C757D] truncate pt-1 border-t border-[#DEE2E6] mt-1">
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
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-[#D32F2F] hover:bg-[#B71C1C] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-[0.99]"
                >
                  <Wrench className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Bu Konuma İş Ekle</span>
                </button>
              )}

              {onOpenWorkList && (
                <button
                  type="button"
                  onClick={onOpenWorkList}
                  className="w-full flex items-center justify-between px-3 py-1 bg-[#F8F9FA] hover:bg-slate-100 border border-[#DEE2E6] text-[#212529] rounded-xl text-[11px] font-semibold transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Wrench className="w-3 h-3 text-[#D32F2F]" />
                    <span>Saha İş Listesi</span>
                  </span>
                  {workListCount !== undefined && workListCount > 0 && (
                    <span className="bg-[#D32F2F] text-white font-bold px-1.5 py-0.2 rounded-full text-[10px]">
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
            <Navigation2 className="w-7 h-7 text-[#D32F2F] animate-spin mb-2" />
            <p className="text-xs font-bold text-[#212529]">
              {isLocating ? 'GPS Uyduları Taranıyor...' : 'Demiryolu KM Hesaplanıyor...'}
            </p>
            <p className="text-[10px] text-[#6C757D] mt-0.5">
              Açık alanda olduğunuzdan emin olun.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};


