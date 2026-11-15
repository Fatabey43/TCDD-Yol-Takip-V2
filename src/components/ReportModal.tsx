import React, { useState } from 'react';
import { FileText, Download, Printer, X, CheckSquare, Wrench, ShieldAlert, Layers } from 'lucide-react';
import { RailwayPoint } from '../types.ts';
import { exportRailwayReportToExcel, openPrintableRailwayReport, ReportFilterOptions } from '../utils/reportGenerator.ts';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  points: RailwayPoint[];
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, points }) => {
  const [reportType, setReportType] = useState<'culvert' | 'crossing' | 'workLog' | 'all'>('workLog');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  if (!isOpen) return null;

  const totalCulverts = points.filter(p => p.category === 'culvert' || p.culvert).length;
  const totalCrossings = points.filter(p => p.category === 'crossing' || p.levelCrossing).length;
  let totalWorkLogs = 0;
  points.forEach(p => {
    totalWorkLogs += (p.workLogs?.length || 0);
  });

  const handleExportExcel = () => {
    setIsExporting(true);
    try {
      exportRailwayReportToExcel(points, { reportType });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintPdf = () => {
    openPrintableRailwayReport(points, { reportType });
  };

  return (
    <div
      id="report-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 font-poppins"
      onClick={onClose}
    >
      <div
        className="bg-white border border-[#DEE2E6] w-full max-w-lg rounded-2xl shadow-2xl text-[#212529] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="gov-bar w-full h-[5px] shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#DEE2E6] bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D32F2F] flex items-center justify-center text-white shadow-xs shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#212529]">TCDD Resmi Saha Raporları</h3>
              <p className="text-xs text-[#6C757D]">712. Yol Bakım Şefliği Teftiş &amp; Faaliyet Çıktısı</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6C757D] hover:text-[#212529] rounded-lg hover:bg-[#F8F9FA] transition-colors cursor-pointer"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 flex-1 overflow-y-auto prominent-scrollbar min-h-0 touch-pan-y overscroll-contain">
          <p className="text-xs text-[#6C757D] leading-relaxed">
            Aşağıdan almak istediğiniz resmi rapor tipini seçin. Raporu doğrudan <strong className="text-[#212529]">Excel (XLSX)</strong> tablosu olarak indirebilir veya <strong className="text-[#212529]">Resmi Yazdır / PDF</strong> formatında görüntüleyebilirsiniz:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* 1. Yapılan İşler Raporu */}
            <button
              type="button"
              onClick={() => setReportType('workLog')}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                reportType === 'workLog'
                  ? 'bg-[#D32F2F]/5 border-[#D32F2F] ring-2 ring-[#D32F2F]/20 text-[#212529]'
                  : 'bg-[#F8F9FA] border-[#DEE2E6] hover:bg-white hover:border-[#D32F2F]/40 text-[#212529]'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                reportType === 'workLog' ? 'bg-[#D32F2F] text-white' : 'bg-amber-50 text-amber-600 border border-amber-200'
              }`}>
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-sm text-[#212529]">Yapılan Saha İşleri</div>
                <div className="text-[11px] text-[#6C757D] mt-0.5">Bakım, onarım ve malzeme kayıtları</div>
                <div className="text-[10px] text-[#D32F2F] font-bold font-roboto-mono mt-1">{totalWorkLogs} Kayıt</div>
              </div>
            </button>

            {/* 2. Menfez Raporu */}
            <button
              type="button"
              onClick={() => setReportType('culvert')}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                reportType === 'culvert'
                  ? 'bg-[#D32F2F]/5 border-[#D32F2F] ring-2 ring-[#D32F2F]/20 text-[#212529]'
                  : 'bg-[#F8F9FA] border-[#DEE2E6] hover:bg-white hover:border-[#D32F2F]/40 text-[#212529]'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                reportType === 'culvert' ? 'bg-[#D32F2F] text-white' : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
              }`}>
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-sm text-[#212529]">Menfez Envanteri</div>
                <div className="text-[11px] text-[#6C757D] mt-0.5">Açıklık, debuşe, yapım yılı ve cins</div>
                <div className="text-[10px] text-[#D32F2F] font-bold font-roboto-mono mt-1">{totalCulverts} Menfez</div>
              </div>
            </button>

            {/* 3. Hemzemin Geçit Raporu */}
            <button
              type="button"
              onClick={() => setReportType('crossing')}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                reportType === 'crossing'
                  ? 'bg-[#D32F2F]/5 border-[#D32F2F] ring-2 ring-[#D32F2F]/20 text-[#212529]'
                  : 'bg-[#F8F9FA] border-[#DEE2E6] hover:bg-white hover:border-[#D32F2F]/40 text-[#212529]'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                reportType === 'crossing' ? 'bg-[#D32F2F] text-white' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              }`}>
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-sm text-[#212529]">Hemzemin Geçitler</div>
                <div className="text-[11px] text-[#6C757D] mt-0.5">Tip, kaplama, trafik ve güvenlik föyü</div>
                <div className="text-[10px] text-[#D32F2F] font-bold font-roboto-mono mt-1">{totalCrossings} Geçit</div>
              </div>
            </button>

            {/* 4. Tüm Hat Envanteri */}
            <button
              type="button"
              onClick={() => setReportType('all')}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                reportType === 'all'
                  ? 'bg-[#D32F2F]/5 border-[#D32F2F] ring-2 ring-[#D32F2F]/20 text-[#212529]'
                  : 'bg-[#F8F9FA] border-[#DEE2E6] hover:bg-white hover:border-[#D32F2F]/40 text-[#212529]'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                reportType === 'all' ? 'bg-[#D32F2F] text-white' : 'bg-sky-50 text-sky-600 border border-sky-200'
              }`}>
                <CheckSquare className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-sm text-[#212529]">Genel Hat Raporu</div>
                <div className="text-[11px] text-[#6C757D] mt-0.5">Tüm kategori ve noktaların dökümü</div>
                <div className="text-[10px] text-[#D32F2F] font-bold font-roboto-mono mt-1">{points.length} Toplam Nokta</div>
              </div>
            </button>
          </div>

          <div className="bg-[#F8F9FA] p-3 rounded-xl border border-[#DEE2E6] text-[11px] text-[#6C757D] flex items-center justify-between">
            <span>Rapor Çıktı Standardı:</span>
            <span className="font-bold text-[#212529]">TCDD 712. Yol Bakım Şefliği</span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-[#DEE2E6] bg-[#F8F9FA] flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#6C757D] hover:text-[#212529] rounded-xl hover:bg-[#DEE2E6]/50 transition-colors cursor-pointer"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={handlePrintPdf}
            className="px-4 py-2 text-xs font-bold text-[#212529] bg-white hover:bg-slate-100 border border-[#DEE2E6] rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Printer className="w-4 h-4 text-[#D32F2F]" />
            Yazdır / PDF
          </button>
          <button
            type="button"
            disabled={isExporting}
            onClick={handleExportExcel}
            className="px-4 py-2 text-xs font-bold text-white bg-[#D32F2F] hover:bg-[#B71C1C] rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            Excel İndir (.xlsx)
          </button>
        </div>
      </div>
    </div>
  );
};
