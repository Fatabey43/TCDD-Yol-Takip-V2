import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  Calendar,
  User,
  Wrench,
  FileSpreadsheet,
  Trash2,
  Edit2,
  Camera,
  ChevronRight,
  Navigation,
  Check,
  Layers,
  ArrowUpDown,
  Image as ImageIcon,
} from 'lucide-react';
import { FieldWorkItem } from '../types.ts';
import { compressImage } from '../utils/imageCompressor.ts';
import { DeleteConfirmModal } from './DeleteConfirmModal.tsx';

interface FieldWorkListModalProps {
  isOpen: boolean;
  onClose: () => void;
  worksList: FieldWorkItem[];
  onSaveWork: (work: Omit<FieldWorkItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<FieldWorkItem>;
  onUpdateWork: (work: FieldWorkItem) => Promise<FieldWorkItem>;
  onDeleteWork: (id: string) => Promise<boolean>;
  onGoToWorkLocation: (lat: number, lng: number, kmValue: string, title: string, lineName: string) => void;
  initialLiveLocation?: {
    lat: number;
    lng: number;
    kmValue?: string;
    lineName?: string;
  } | null;
  availableLines?: string[];
}

export const FieldWorkListModal: React.FC<FieldWorkListModalProps> = ({
  isOpen,
  onClose,
  worksList,
  onSaveWork,
  onUpdateWork,
  onDeleteWork,
  onGoToWorkLocation,
  initialLiveLocation,
  availableLines = ['Eskişehir-Konya', 'Alayunt-Balıkesir'],
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'bekliyor' | 'devam' | 'tamamlandi'>('all');
  const [selectedLineFilter, setSelectedLineFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form Mode: null (list view) | 'create' | 'edit'
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingWork, setEditingWork] = useState<FieldWorkItem | null>(null);

  // Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formKm, setFormKm] = useState('');
  const [formLine, setFormLine] = useState('Eskişehir-Konya');
  const [formLat, setFormLat] = useState<number>(0);
  const [formLng, setFormLng] = useState<number>(0);
  const [formWorkType, setFormWorkType] = useState<FieldWorkItem['workType']>('bakim');
  const [formStatus, setFormStatus] = useState<FieldWorkItem['status']>('bekliyor');
  const [formPriority, setFormPriority] = useState<FieldWorkItem['priority']>('normal');
  const [formAssignedTo, setFormAssignedTo] = useState('712 Yol Bakım Şefliği');
  const [formDescription, setFormDescription] = useState('');
  const [formMaterials, setFormMaterials] = useState('');
  const [formCrewCount, setFormCrewCount] = useState('');
  const [formPhotos, setFormPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  // Delete modal state
  const [workToDelete, setWorkToDelete] = useState<FieldWorkItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Expanded photo preview modal
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle open creation form
  const handleOpenCreate = () => {
    setEditingWork(null);
    setFormTitle('');
    setFormKm(initialLiveLocation?.kmValue || '');
    setFormLine(initialLiveLocation?.lineName || 'Eskişehir-Konya');
    setFormLat(initialLiveLocation?.lat || 0);
    setFormLng(initialLiveLocation?.lng || 0);
    setFormWorkType('bakim');
    setFormStatus('bekliyor');
    setFormPriority('normal');
    setFormAssignedTo('712 Yol Bakım Şefliği');
    setFormDescription('');
    setFormMaterials('');
    setFormCrewCount('');
    setFormPhotos([]);
    setFormMode('create');
  };

  // Handle open edit form
  const handleOpenEdit = (work: FieldWorkItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingWork(work);
    setFormTitle(work.title);
    setFormKm(work.kmValue);
    setFormLine(work.lineName);
    setFormLat(work.lat);
    setFormLng(work.lng);
    setFormWorkType(work.workType);
    setFormStatus(work.status);
    setFormPriority(work.priority || 'normal');
    setFormAssignedTo(work.assignedTo || '712 Yol Bakım Şefliği');
    setFormDescription(work.description || '');
    setFormMaterials(work.materialsUsed || '');
    setFormCrewCount(work.crewCount || '');
    setFormPhotos(work.photos || []);
    setFormMode('edit');
  };

  // Photo handling
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setPhotoUploading(true);
    try {
      const newPhotos: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const compressed = await compressImage(file, 1200, 1200, 0.75);
          newPhotos.push(compressed);
        }
      }
      setFormPhotos((prev) => [...prev, ...newPhotos]);
    } catch (err) {
      console.error('Fotoğraf yükleme hatası:', err);
    } finally {
      setPhotoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFormPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  // Submit form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    setIsSubmitting(true);
    try {
      if (formMode === 'edit' && editingWork) {
        await onUpdateWork({
          ...editingWork,
          title: formTitle.trim(),
          kmValue: formKm.trim(),
          lineName: formLine,
          lat: formLat,
          lng: formLng,
          workType: formWorkType,
          status: formStatus,
          priority: formPriority,
          assignedTo: formAssignedTo.trim(),
          description: formDescription.trim(),
          materialsUsed: formMaterials.trim(),
          crewCount: formCrewCount.trim(),
          photos: formPhotos,
        });
      } else {
        await onSaveWork({
          title: formTitle.trim(),
          kmValue: formKm.trim(),
          lineName: formLine,
          lat: formLat,
          lng: formLng,
          workType: formWorkType,
          status: formStatus,
          priority: formPriority,
          assignedTo: formAssignedTo.trim(),
          description: formDescription.trim(),
          materialsUsed: formMaterials.trim(),
          crewCount: formCrewCount.trim(),
          photos: formPhotos,
        });
      }
      setFormMode(null);
      setEditingWork(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick status toggle directly from list
  const handleQuickStatusChange = async (work: FieldWorkItem, newStatus: FieldWorkItem['status'], e: React.MouseEvent) => {
    e.stopPropagation();
    await onUpdateWork({
      ...work,
      status: newStatus,
    });
  };

  // Delete confirmed
  const handleConfirmDelete = async () => {
    if (!workToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteWork(workToDelete.id);
      setWorkToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered and sorted works
  const filteredWorks = useMemo(() => {
    return worksList.filter((item) => {
      // Tab status filter
      if (activeTab !== 'all' && item.status !== activeTab) return false;

      // Line filter
      if (selectedLineFilter !== 'all' && item.lineName !== selectedLineFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = (item.title || '').toLowerCase().includes(q);
        const matchKm = (item.kmValue || '').toLowerCase().includes(q);
        const matchAssigned = (item.assignedTo || '').toLowerCase().includes(q);
        const matchDesc = (item.description || '').toLowerCase().includes(q);
        const matchMat = (item.materialsUsed || '').toLowerCase().includes(q);
        if (!matchTitle && !matchKm && !matchAssigned && !matchDesc && !matchMat) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // Sort by creation desc
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [worksList, activeTab, selectedLineFilter, searchQuery]);

  // Status counts for tabs
  const counts = useMemo(() => {
    const res = { all: worksList.length, bekliyor: 0, devam: 0, tamamlandi: 0 };
    worksList.forEach((w) => {
      if (w.status === 'bekliyor') res.bekliyor++;
      else if (w.status === 'devam') res.devam++;
      else if (w.status === 'tamamlandi') res.tamamlandi++;
    });
    return res;
  }, [worksList]);

  // Export to simple CSV/Excel
  const handleExportCSV = () => {
    if (worksList.length === 0) return;
    const headers = ['İş Başlığı', 'KM', 'Demiryolu Hattı', 'Durum', 'İş Türü', 'Öncelik', 'Sorumlu Ekip', 'Tarih', 'Açıklama', 'Malzeme'];
    const rows = worksList.map((w) => [
      `"${(w.title || '').replace(/"/g, '""')}"`,
      `"${w.kmValue || ''}"`,
      `"${w.lineName || ''}"`,
      `"${w.status === 'tamamlandi' ? 'Tamamlandı' : w.status === 'devam' ? 'Devam Ediyor' : 'Bekliyor'}"`,
      `"${w.workType}"`,
      `"${w.priority || 'normal'}"`,
      `"${(w.assignedTo || '').replace(/"/g, '""')}"`,
      `"${new Date(w.createdAt).toLocaleDateString('tr-TR')}"`,
      `"${(w.description || '').replace(/"/g, '""')}"`,
      `"${(w.materialsUsed || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TCDD_Saha_Isleri_Listesi_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div
      id="field-work-list-modal"
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200 select-none"
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-800 dark:text-slate-100"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-xs">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-white">
                  TCDD Saha İş &amp; Görev Listesi
                </h2>
                <span className="text-[10px] bg-amber-500/25 border border-amber-400/30 text-amber-300 font-bold px-2 py-0.5 rounded-full">
                  {worksList.length} İş Kayıtlı
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Haritada kalabalık yapmayan bağımsız iş defteri • Tıklayarak o KM'ye gidin
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {formMode === null && (
              <>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  title="İş Listesini Excel / CSV olarak İndir"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Dışa Aktar</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Yeni İş Ekle</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4">
          {formMode !== null ? (
            /* CREATE / EDIT FORM */
            <form onSubmit={handleSubmitForm} className="space-y-4 max-w-2xl mx-auto w-full">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-500" />
                  {formMode === 'create' ? 'Yeni Saha İşi Ekle' : 'Saha İşini Düzenle'}
                </span>
                <button
                  type="button"
                  onClick={() => setFormMode(null)}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline cursor-pointer"
                >
                  Listeye Geri Dön
                </button>
              </div>

              {/* Title & Line */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    İş / Faaliyet Başlığı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Örn: 20 Adet Travers Değişimi"
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Demiryolu Hattı *
                  </label>
                  <select
                    value={formLine}
                    onChange={(e) => setFormLine(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {availableLines.map((line) => (
                      <option key={line} value={line}>
                        {line}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* KM & Coordinates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Demiryolu KM Değeri *
                  </label>
                  <input
                    type="text"
                    required
                    value={formKm}
                    onChange={(e) => setFormKm(e.target.value)}
                    placeholder="Örn: 66+850"
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Enlem (Lat)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formLat || ''}
                    onChange={(e) => setFormLat(parseFloat(e.target.value) || 0)}
                    placeholder="Örn: 39.776"
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Boylam (Lng)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formLng || ''}
                    onChange={(e) => setFormLng(parseFloat(e.target.value) || 0)}
                    placeholder="Örn: 30.518"
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Status, Type, Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    İş Türü
                  </label>
                  <select
                    value={formWorkType}
                    onChange={(e) => setFormWorkType(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="bakim">Bakım (Rutin)</option>
                    <option value="onarim">Onarım / Tamirat</option>
                    <option value="kontrol">Muayene &amp; Kontrol</option>
                    <option value="emniyet">Emniyet Tedbiri</option>
                    <option value="diger">Diğer Saha İşi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    İş Durumu
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="bekliyor">🟡 Bekliyor (Yapılacak)</option>
                    <option value="devam">🔵 Devam Ediyor</option>
                    <option value="tamamlandi">🟢 Tamamlandı</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Öncelik
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="normal">Normal Öncelik</option>
                    <option value="acil">🚨 Acil / Kritik</option>
                    <option value="dusuk">Düşük Öncelik</option>
                  </select>
                </div>
              </div>

              {/* Assigned To, Crew, Materials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Sorumlu Ekip / Personel
                  </label>
                  <input
                    type="text"
                    value={formAssignedTo}
                    onChange={(e) => setFormAssignedTo(e.target.value)}
                    placeholder="Örn: 712 Yol Bakım Ekibi"
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kullanılan Malzeme / Parça
                  </label>
                  <input
                    type="text"
                    value={formMaterials}
                    onChange={(e) => setFormMaterials(e.target.value)}
                    placeholder="Örn: B70 Beton Travers, Tirfon, Rondela"
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Yapılan / Yapılacak İş Açıklaması
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="İşin detayları, ray durumu, tespit edilen aksaklıklar ve yapılan işlemler..."
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Photo attachments */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-sky-500" />
                    <span>Saha Fotoğrafları ({formPhotos.length})</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={photoUploading}
                    className="text-xs text-sky-600 dark:text-sky-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Fotoğraf Ekle</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoSelect}
                  />
                </div>

                {formPhotos.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-2 bg-slate-100 dark:bg-slate-800/60 rounded-xl">
                    {formPhotos.map((photo, i) => (
                      <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700">
                        <img
                          src={photo}
                          alt="İş Fotoğrafı"
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => setPreviewPhoto(photo)}
                        />
                        <button
                          type="button"
                          onClick={(e) => handleRemovePhoto(i, e)}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-md opacity-90 hover:opacity-100 transition-opacity"
                          title="Fotoğrafı Kaldır"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center cursor-pointer hover:border-amber-500 transition-colors text-xs text-slate-500"
                  >
                    Fotoğraf eklemek için tıklayın (Kamera veya Galeri)
                  </div>
                )}
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setFormMode(null)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{formMode === 'create' ? 'İş Kaydını Oluştur' : 'Değişiklikleri Kaydet'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* WORK LIST VIEW */
            <>
              {/* Filter Row: Tabs & Line Selector & Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                {/* Tabs */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-semibold overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === 'all'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Tümü ({counts.all})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('bekliyor')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      activeTab === 'bekliyor'
                        ? 'bg-amber-500 text-slate-950 shadow-xs font-bold'
                        : 'text-amber-700 dark:text-amber-400 hover:bg-amber-500/10'
                    }`}
                  >
                    <span>Bekliyor</span>
                    <span className="text-[10px] bg-amber-600/30 px-1.5 py-0.2 rounded-full font-bold">
                      {counts.bekliyor}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('devam')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      activeTab === 'devam'
                        ? 'bg-sky-600 text-white shadow-xs font-bold'
                        : 'text-sky-700 dark:text-sky-400 hover:bg-sky-500/10'
                    }`}
                  >
                    <span>Devam Ediyor</span>
                    <span className="text-[10px] bg-sky-700/50 px-1.5 py-0.2 rounded-full font-bold">
                      {counts.devam}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('tamamlandi')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      activeTab === 'tamamlandi'
                        ? 'bg-emerald-600 text-white shadow-xs font-bold'
                        : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10'
                    }`}
                  >
                    <span>Tamamlandı</span>
                    <span className="text-[10px] bg-emerald-700/50 px-1.5 py-0.2 rounded-full font-bold">
                      {counts.tamamlandi}
                    </span>
                  </button>
                </div>

                {/* Line Selector & Search Input */}
                <div className="flex items-center gap-2">
                  <select
                    value={selectedLineFilter}
                    onChange={(e) => setSelectedLineFilter(e.target.value)}
                    className="text-xs p-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="all">Tüm Hatlar</option>
                    {availableLines.map((line) => (
                      <option key={line} value={line}>
                        {line}
                      </option>
                    ))}
                  </select>

                  <div className="relative flex-1 sm:w-56">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="İş veya KM ara..."
                      className="w-full text-xs pl-8 pr-3 py-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Work Cards List */}
              {filteredWorks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredWorks.map((work) => {
                    const hasCoords = Boolean(work.lat && work.lng);

                    return (
                      <div
                        key={work.id}
                        onClick={() => {
                          if (hasCoords) {
                            onGoToWorkLocation(work.lat, work.lng, work.kmValue, work.title, work.lineName);
                            onClose();
                          }
                        }}
                        className={`group relative p-3.5 bg-white dark:bg-slate-850 border rounded-2xl shadow-xs transition-all flex flex-col justify-between gap-3 text-left ${
                          hasCoords
                            ? 'hover:border-amber-400 hover:shadow-md cursor-pointer border-slate-200 dark:border-slate-750'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {/* Top Meta Line: KM Badge, Line, Status */}
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black font-mono px-2 py-0.5 rounded-lg bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                                KM {work.kmValue || 'Belirtilmedi'}
                              </span>
                              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                {work.lineName}
                              </span>
                            </div>

                            {/* Status Badge */}
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                work.status === 'tamamlandi'
                                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                  : work.status === 'devam'
                                  ? 'bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800'
                                  : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                              }`}
                            >
                              {work.status === 'tamamlandi' ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                  <span>Tamamlandı</span>
                                </>
                              ) : work.status === 'devam' ? (
                                <>
                                  <Clock className="w-3 h-3 text-sky-600 dark:text-sky-400 animate-spin" />
                                  <span>Devam Ediyor</span>
                                </>
                              ) : (
                                <>
                                  <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                  <span>Bekliyor</span>
                                </>
                              )}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                            {work.title}
                          </h3>

                          {/* Description if present */}
                          {work.description && (
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                              {work.description}
                            </p>
                          )}

                          {/* Materials & Assigned To */}
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                            {work.assignedTo && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3 text-slate-400" />
                                <span>{work.assignedTo}</span>
                              </span>
                            )}
                            {work.materialsUsed && (
                              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                                <Wrench className="w-3 h-3 text-amber-500" />
                                <span>{work.materialsUsed}</span>
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-[10px] text-slate-400 ml-auto">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(work.createdAt).toLocaleDateString('tr-TR')}</span>
                            </span>
                          </div>

                          {/* Photo thumbs */}
                          {work.photos && work.photos.length > 0 && (
                            <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1">
                              {work.photos.slice(0, 4).map((p, pIdx) => (
                                <img
                                  key={pIdx}
                                  src={p}
                                  alt="Önizleme"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewPhoto(p);
                                  }}
                                  className="w-10 h-10 object-cover rounded-md border border-slate-200 dark:border-slate-700 hover:scale-105 transition-transform"
                                />
                              ))}
                              {work.photos.length > 4 && (
                                <span className="text-[10px] text-slate-400 font-bold px-1.5 py-1 bg-slate-100 dark:bg-slate-800 rounded">
                                  +{work.photos.length - 4}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Bottom Actions Row */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                          {/* Navigation Indicator / Go to KM */}
                          {hasCoords ? (
                            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:text-amber-500 transition-colors">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>Haritada Bu KM'ye Git</span>
                              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400">Koordinat eklenmedi</span>
                          )}

                          {/* Quick Actions: Status & Edit & Delete */}
                          <div className="flex items-center gap-1">
                            {/* Quick Status Buttons */}
                            {work.status !== 'tamamlandi' ? (
                              <button
                                type="button"
                                onClick={(e) => handleQuickStatusChange(work, 'tamamlandi', e)}
                                title="İşi Tamamlandı Olarak İşaretle"
                                className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 text-emerald-600 rounded-md transition-colors cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => handleQuickStatusChange(work, 'bekliyor', e)}
                                title="İşi Yeniden Aç (Bekliyor Yap)"
                                className="p-1 hover:bg-amber-100 dark:hover:bg-amber-950/60 text-amber-600 rounded-md transition-colors cursor-pointer"
                              >
                                <Clock className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={(e) => handleOpenEdit(work, e)}
                              title="İş Bilgilerini Düzenle"
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-md transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setWorkToDelete(work);
                              }}
                              title="İş Kaydını Sil"
                              className="p-1 hover:bg-red-50 dark:hover:bg-red-950/60 text-slate-400 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                  <Wrench className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {searchQuery ? 'Aramanıza uygun iş kaydı bulunamadı' : 'Kayıtlı Saha İşi Bulunmuyor'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    Canlı GPS konumundayken "Bu Konuma İş Ekle" diyerek veya yukarıdaki "Yeni İş Ekle" butonuna basarak iş defterinize kayıt açabilirsiniz.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    + İlk İş Kaydını Oluştur
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(workToDelete)}
        title="Saha İş Kaydını Sil"
        itemName={workToDelete?.title}
        description={`"${workToDelete?.title}" (KM ${workToDelete?.kmValue}) iş kaydı sistemden kalıcı olarak silinecektir.`}
        confirmText="Evet, İşi Sil"
        cancelText="Vazgeç"
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setWorkToDelete(null)}
      />

      {/* Full Photo Preview Modal */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewPhoto(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img src={previewPhoto} alt="Büyük Görsel" className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl" />
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-2 right-2 p-2 bg-black/60 text-white rounded-full hover:bg-black/90"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
