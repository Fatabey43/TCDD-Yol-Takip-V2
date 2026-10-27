import React, { useEffect, useState } from 'react';

interface TechnicalFooterProps {
  totalPoints: number;
  totalSwitches: number;
  totalParcels: number;
  totalTakyidat: number;
  isOnline: boolean;
  isLiveGpsActive: boolean;
  gpsAccuracy?: number;
  onFilterSwitches?: () => void;
  onOpenParcels?: () => void;
  onOpenTakyidat?: () => void;
}

export const TechnicalFooter: React.FC<TechnicalFooterProps> = ({
  totalPoints,
  totalSwitches,
  totalParcels,
  totalTakyidat,
  isOnline,
  isLiveGpsActive,
  gpsAccuracy,
  onFilterSwitches,
  onOpenParcels,
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
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getGpsLinkStatus = () => {
    if (!isLiveGpsActive) return 'STANDBY';
    if (!gpsAccuracy) return 'LOCKING';
    if (gpsAccuracy < 10) return 'EXCELLENT';
    if (gpsAccuracy < 25) return 'GOOD';
    return 'FAIR';
  };

  const getGpsColor = () => {
    if (!isLiveGpsActive) return 'text-[#e0e0e4]/50';
    if (!gpsAccuracy || gpsAccuracy < 10) return 'text-[#00ff88]';
    if (gpsAccuracy < 25) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <footer
      id="technical-status-footer"
      className="w-full bg-black border-t border-[#2d2d33] h-10 px-4 sm:px-6 flex items-center justify-between gap-4 text-[10px] sm:text-xs tracking-wider z-20 select-none overflow-x-auto no-scrollbar font-mono-tech text-[#e0e0e4]"
    >
      {/* Left Status Group */}
      <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
        {/* System Status */}
        <div className="status-pill flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isOnline ? 'bg-[#00ff88] status-dot-glow' : 'bg-amber-400'
            }`}
          />
          <span className="opacity-70">SYS_STATUS:</span>
          <span className="font-bold text-[#00ff88]">
            {isOnline ? 'OPERATIONAL' : 'LOCAL_CACHE'}
          </span>
        </div>

        {/* Total Records */}
        <div className="status-pill flex items-center gap-1.5">
          <span className="opacity-70">RECORDS:</span>
          <span className="font-bold text-[#00ff88]">{totalPoints}</span>
        </div>

        {/* Switches Count (Clickable filter) */}
        <button
          onClick={onFilterSwitches}
          className="status-pill flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
          title="Makasları filtrele (Toplam 32 makas)"
        >
          <span className="opacity-70">MAKAS:</span>
          <span className="font-bold text-[#ef4444]">{totalSwitches}</span>
        </button>

        {/* Parcels Count */}
        <button
          onClick={onOpenParcels}
          className="status-pill flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
          title="Kadastro parsellerini aç"
        >
          <span className="opacity-70">PARSEL:</span>
          <span className="font-bold text-purple-400">{totalParcels}</span>
        </button>

        {/* Takyidat Count */}
        {totalTakyidat > 0 && (
          <button
            onClick={onOpenTakyidat}
            className="status-pill flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
            title="Aktif takyidat uyarılarını aç"
          >
            <span className="opacity-70">TAKYİDAT:</span>
            <span className="font-bold text-amber-400">{totalTakyidat}</span>
          </button>
        )}

        {/* GPS Link Quality */}
        <div className="status-pill flex items-center gap-1.5">
          <span className="opacity-70">GPS_LINK:</span>
          <span className={`font-bold ${getGpsColor()}`}>
            {getGpsLinkStatus()}
            {isLiveGpsActive && gpsAccuracy ? ` (±${Math.round(gpsAccuracy)}m)` : ''}
          </span>
        </div>
      </div>

      {/* Right Sync & UTC Clock */}
      <div className="flex items-center gap-4 flex-shrink-0 ml-auto">
        <div className="status-pill flex items-center gap-1.5">
          <span className="opacity-70">SYNC:</span>
          <span className="font-bold text-[#00ff88]">
            {isOnline ? 'CLOUD_LIVE' : 'OFFLINE'}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[#e0e0e4]/50 border-l border-[#2d2d33] pl-4">
          <span className="font-mono">{timeStr}</span>
        </div>
      </div>
    </footer>
  );
};
