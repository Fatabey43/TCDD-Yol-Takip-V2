import React from 'react';
import { Crosshair, Edit3, Locate, X, Sparkles, MapPin } from 'lucide-react';

interface PointAddChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPickOnMap: () => void;
  onOpenManualForm: () => void;
  onUseGpsDirect: () => void;
}

export const PointAddChoiceModal: React.FC<PointAddChoiceModalProps> = ({
  isOpen,
  onClose,
  onPickOnMap,
  onOpenManualForm,
  onUseGpsDirect,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="point-add-choice-modal"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200 font-poppins"
      onClick={onClose}
    >
      <div
        className="bg-white border border-[#DEE2E6] w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl text-[#212529] overflow-hidden animate-in slide-in-from-bottom-8 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="gov-bar w-full h-[5px] shrink-0" />

        <div className="p-5">
          {/* Handle bar on mobile */}
          <div className="w-12 h-1.5 bg-[#DEE2E6] rounded-full mx-auto mb-4 sm:hidden" />

          <div className="flex items-center justify-between pb-3 border-b border-[#DEE2E6]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#D32F2F] flex items-center justify-center text-white shadow-xs">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#212529]">Nokta Ekleme Yöntemi</h3>
                <p className="text-[11px] text-[#6C757D]">Konum belirleme şeklini seçin</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[#6C757D] hover:text-[#212529] rounded-lg hover:bg-[#F8F9FA] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Options */}
          <div className="py-4 space-y-2.5">
            {/* OPTION 1: Haritadan Seç & Otomatik Konum Al (Recommended) */}
            <button
              id="choice-pick-on-map-btn"
              type="button"
              onClick={() => {
                onClose();
                onPickOnMap();
              }}
              className="w-full flex items-center gap-3.5 p-3.5 bg-[#D32F2F]/5 hover:bg-[#D32F2F]/10 active:scale-[0.98] border-2 border-[#D32F2F]/50 hover:border-[#D32F2F] rounded-2xl transition-all text-left cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-xl bg-[#D32F2F] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                <Crosshair className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-sm text-[#212529]">Haritadan Seç &amp; İşaretle</span>
                  <span className="text-[9px] font-bold bg-[#D32F2F] text-white px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" /> En Kolay
                  </span>
                </div>
                <p className="text-xs text-[#6C757D] leading-snug mt-0.5">
                  Haritada istediğiniz hatta dokunun, koordinatlar ve konum otomatik kaydedilsin.
                </p>
              </div>
            </button>

            {/* OPTION 2: Canlı GPS Konumumu Kullan */}
            <button
              id="choice-use-gps-btn"
              type="button"
              onClick={() => {
                onClose();
                onUseGpsDirect();
              }}
              className="w-full flex items-center gap-3.5 p-3.5 bg-[#F8F9FA] hover:bg-white active:scale-[0.98] border border-[#DEE2E6] hover:border-[#D32F2F]/50 rounded-2xl transition-all text-left cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <Locate className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-sm text-[#212529] block">Bulunduğum Canlı GPS Konumunu Al</span>
                <p className="text-xs text-[#6C757D] leading-snug mt-0.5">
                  Şu an sahada bulunduğunuz koordinatı cihazınızın GPS&apos;inden otomatik çeker.
                </p>
              </div>
            </button>

            {/* OPTION 3: Formu Açıp Manuel Koordinat Gir */}
            <button
              id="choice-manual-form-btn"
              type="button"
              onClick={() => {
                onClose();
                onOpenManualForm();
              }}
              className="w-full flex items-center gap-3.5 p-3 bg-[#F8F9FA] hover:bg-white active:scale-[0.98] border border-[#DEE2E6] hover:border-slate-300 rounded-2xl transition-all text-left cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-white text-[#6C757D] border border-[#DEE2E6] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <Edit3 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-xs text-[#212529] block">Formu Doğrudan Aç (Manuel Yaz)</span>
                <p className="text-[11px] text-[#6C757D] leading-snug mt-0.5">
                  Enlem ve boylamı klavyeden elle yazmak veya kopyalayıp yapıştırmak için.
                </p>
              </div>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-[#F8F9FA] hover:bg-[#DEE2E6]/60 text-[#212529] border border-[#DEE2E6] rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
