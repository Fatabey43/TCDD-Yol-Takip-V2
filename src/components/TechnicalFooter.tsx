import React, { useEffect, useState } from 'react';

interface TechnicalFooterProps {
  totalPoints: number;
  totalSwitches: number;
  totalTakyidat: number;
  isOnline: boolean;
  isLiveGpsActive: boolean;
  gpsAccuracy?: number;
  onFilterSwitches?: () => void;
  onOpenTakyidat?: () => void;
}

export const TechnicalFooter: React.FC<TechnicalFooterProps> = ({
  totalPoints,
  totalSwitches,
  totalTakyidat,
  isOnline,
  isLiveGpsActive,
  gpsAccuracy,
  onFilterSwitches,
  onOpenTakyidat,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('tr-TR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) + ' UTC+3'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getGpsLinkStatus = () => {
    if (!isLiveGpsActive) return 'BEKLEMEDE';
    if (!gpsAccuracy) return 'KİLİTLENİYOR';
    if (gpsAccuracy < 10) return 'MÜKEMMEL';
    if (gpsAccuracy < 25) return 'İYİ';
    return 'ORTA';
  };

  const getGpsColor = () => {
    if (!isLiveGpsActive) return 'text-[#ADB5BD]';
    if (!gpsAccuracy || gpsAccuracy < 10) return 'text-[#48BB78]';
    if (gpsAccuracy < 25) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <footer
      id="technical-status-footer"
      className="hidden sm:flex w-full bg-[#212529] text-[#ADB5BD] border-t border-[#343A40] h-9 px-4 sm:px-6 items-center justify-between gap-4 text-xs font-roboto-mono select-none overflow-x-auto no-scrollbar shrink-0 z-20"
    >
      {/* Left Status Group (Variation 6) */}
      <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
        {/* Server Status */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#6C757D]">SUNUCU DURUMU:</span>
          <span className={`font-bold ${isOnline ? 'text-[#48BB78]' : 'text-amber-400'}`}>
            {isOnline ? 'AKTİF' : 'YEREL ÖNBELLEK'}
          </span>
        </div>

        <span className="text-[#495057]">|</span>

        {/* Total Records */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#6C757D]">VERİ KAYDI:</span>
          <span className="font-bold text-white">{totalPoints} ADET</span>
        </div>

        <span className="text-[#495057]">|</span>

        {/* Switches Count (Clickable filter) */}
        <button
          onClick={onFilterSwitches}
          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
          title="Makasları filtrele"
        >
          <span className="text-[#6C757D]">MAKAS:</span>
          <span className="font-bold text-[#E53E3E]">{totalSwitches}</span>
        </button>


        {/* Takyidat Count */}
        {totalTakyidat > 0 && (
          <button
            onClick={onOpenTakyidat}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
            title="Aktif takyidat uyarılarını aç"
          >
            <span className="text-[#6C757D]">TAKYİDAT:</span>
            <span className="font-bold text-amber-400">{totalTakyidat}</span>
          </button>
        )}

        {/* GPS Link Quality */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#6C757D]">GPS:</span>
          <span className={`font-bold ${getGpsColor()}`}>
            {getGpsLinkStatus()}
            {isLiveGpsActive && gpsAccuracy ? ` (±${Math.round(gpsAccuracy)}m)` : ''}
          </span>
        </div>
      </div>

      {/* Right Sync & UTC Clock */}
      <div className="flex items-center gap-4 flex-shrink-0 ml-auto">
        <div className="flex items-center gap-1.5">
          <span className="text-[#6C757D]">SENKRON:</span>
          <span className={`font-bold ${isOnline ? 'text-[#48BB78]' : 'text-amber-400'}`}>
            {isOnline ? 'BULUT CANLI' : 'ÇEVRİMDIŞI'}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 border-l border-[#343A40] pl-4">
          <span className="text-[#6C757D]">SİSTEM ZAMANI:</span>
          <span className="text-[#D32F2F] font-bold">{timeStr}</span>
        </div>
      </div>
    </footer>
  );
};
