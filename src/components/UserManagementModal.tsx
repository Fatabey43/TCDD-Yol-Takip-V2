import React, { useState, useEffect } from 'react';
import { User, UserRole, AuditLog } from '../types.ts';
import {
  fetchAllUsers,
  updateUserRoleApi,
  deleteUserApi,
  resetUserPasswordApi,
  fetchAuditLogs,
  clearAuditLogs,
  registerApi,
  approveUserApi,
} from '../services/authApi.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { DeleteConfirmModal } from './DeleteConfirmModal.tsx';
import {
  X,
  Users,
  Shield,
  Trash2,
  RefreshCw,
  Building,
  Clock,
  CheckCircle2,
  UserPlus,
  Key,
  FileText,
  AlertTriangle,
  AlertCircle,
  Search,
  LogIn,
  ChevronDown,
  Info,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast?: (msg: string) => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast,
}) => {
  const { user: currentUser } = useAuth();

  // Active view tab: 'users' or 'logs'
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // New user form state
  const [showAddUser, setShowAddUser] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newDept, setNewDept] = useState('Demiryolu Operasyonları & Saha Şefliği');
  const [newRole, setNewRole] = useState<UserRole>('editor');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Password reset state
  const [resetTargetUser, setResetTargetUser] = useState<User | null>(null);
  const [targetNewPassword, setTargetNewPassword] = useState('');
  const [isResettingPass, setIsResettingPass] = useState(false);

  // Delete user state
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // Audit Logs state
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logFilter, setLogFilter] = useState<'all' | 'login' | 'role' | 'errors'>('all');
  const [showClearLogsModal, setShowClearLogsModal] = useState(false);
  const [isClearingLogs, setIsClearingLogs] = useState(false);

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const list = await fetchAllUsers();
      setUsers(list || []);
    } catch (err) {
      console.warn('Kullanıcılar yüklenemedi:', err);
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadLogs = async () => {
    setLogsLoading(true);
    try {
      const list = await fetchAuditLogs();
      setLogs(list);
    } catch (err) {
      console.warn('Loglar yüklenemedi:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      loadLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Role Change
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdatingId(userId);
    try {
      const ok = await updateUserRoleApi(userId, newRole);
      if (ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        onSuccessToast?.('Kullanıcı yetkisi başarıyla güncellendi.');
        loadLogs(); // Refresh audit logs
      } else {
        onSuccessToast?.('Yetki güncellenemedi.');
      }
    } finally {
      setUpdatingId(null);
    }
  };

  // Handle Add New User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newPassword) {
      return;
    }

    setIsCreatingUser(true);
    try {
      await registerApi({
        name: newName.trim(),
        email: newEmail.trim(),
        password: newPassword,
        department: newDept.trim(),
        role: newRole,
      });

      setShowAddUser(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      onSuccessToast?.(`Yeni kullanıcı ${newName} sisteme eklendi.`);
      loadUsers();
      loadLogs();
    } catch (err: any) {
      onSuccessToast?.(err.message || 'Kullanıcı eklenemedi.');
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Handle Password Reset
  const handleSaveResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser || !targetNewPassword || targetNewPassword.length < 4) {
      return;
    }

    setIsResettingPass(true);
    try {
      const ok = await resetUserPasswordApi(resetTargetUser.id, targetNewPassword);
      if (ok) {
        onSuccessToast?.(`${resetTargetUser.name} kullanıcısının şifresi güncellendi.`);
        setResetTargetUser(null);
        setTargetNewPassword('');
        loadLogs();
      } else {
        onSuccessToast?.('Şifre güncellenemedi.');
      }
    } finally {
      setIsResettingPass(false);
    }
  };

  // Handle Approve User (Admin accepts pending account and grants role)
  const handleApproveUser = async (userId: string, role: UserRole) => {
    setUpdatingId(userId);
    try {
      const ok = await approveUserApi(userId, role, 'active');
      if (ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: 'active', role } : u))
        );
        onSuccessToast?.('Kullanıcı hesabı onaylandı ve sisteme erişim yetkisi verildi.');
        loadLogs();
      } else {
        onSuccessToast?.('Kullanıcı onaylanamadı.');
      }
    } finally {
      setUpdatingId(null);
    }
  };

  // Handle Delete User
  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeletingUser(true);
    try {
      const ok = await deleteUserApi(userToDelete.id, userToDelete.email);
      if (ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
        onSuccessToast?.(`${userToDelete.name} kalıcı olarak silindi ve erişimi engellendi.`);
        loadLogs();
      } else {
        onSuccessToast?.('Kullanıcı silinemedi.');
      }
    } finally {
      setIsDeletingUser(false);
      setUserToDelete(null);
    }
  };

  // Handle Clear Logs
  const confirmClearLogs = async () => {
    setIsClearingLogs(true);
    try {
      const ok = await clearAuditLogs();
      if (ok) {
        setLogs([]);
        onSuccessToast?.('Güvenlik ve giriş logları temizlendi.');
      }
    } finally {
      setIsClearingLogs(false);
      setShowClearLogsModal(false);
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.department || '').toLowerCase().includes(q)
    );
  });

  // Filtered logs
  const filteredLogs = logs.filter((log) => {
    if (logFilter === 'all') return true;
    if (logFilter === 'login') return log.action.includes('GİRİŞ') || log.action.includes('LOGIN');
    if (logFilter === 'role') return log.action.includes('YETKİ') || log.action.includes('ROLE');
    if (logFilter === 'errors') return log.status === 'failed' || log.action.includes('HATA') || log.action.includes('BAŞARISIZ');
    return true;
  });

  const formatDate = (isoString?: string) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div
      id="user-mgmt-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 font-poppins"
    >
      <div
        id="user-mgmt-container"
        className="bg-white border border-[#DEE2E6] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[100dvh] sm:h-[88vh] max-h-[100dvh] sm:max-h-[88vh] min-h-0 text-[#212529]"
      >
        <div className="gov-bar w-full h-[5px] shrink-0" />
        {/* Header */}
        <div className="bg-white px-5 py-3.5 flex items-center justify-between border-b border-[#DEE2E6] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#D32F2F]/10 border border-[#D32F2F]/20 flex items-center justify-center text-[#D32F2F]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#212529]">Yetki &amp; Giriş Log Paneli</h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#D32F2F]/10 text-[#D32F2F] border border-[#D32F2F]/20">
                  Yönetici Konsolu
                </span>
              </div>
              <p className="text-[11px] text-[#6C757D]">
                Kayıtlı personeli yetkilendirin, şifreleri yönetin ve giriş hatalarını anlık denetleyin.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                loadUsers();
                loadLogs();
              }}
              title="Yenile"
              className="text-[#6C757D] hover:text-[#D32F2F] p-1.5 rounded-lg hover:bg-[#F8F9FA] transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${(usersLoading || logsLoading) ? 'animate-spin' : ''}`} />
            </button>
            <button
              id="close-user-mgmt-btn"
              onClick={onClose}
              title="Kapat"
              className="text-[#6C757D] hover:text-[#D32F2F] p-1.5 rounded-lg hover:bg-[#F8F9FA] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-1.5 sm:py-0 bg-[#F8F9FA] border-b border-[#DEE2E6] flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              id="mgmt-tab-users-btn"
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'border-[#D32F2F] text-[#D32F2F] bg-white'
                  : 'border-transparent text-[#6C757D] hover:text-[#212529]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Kayıtlı Kullanıcılar &amp; Yetkiler</span>
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-[#DEE2E6]/70 text-[#212529] font-roboto-mono">
                {users.length}
              </span>
              {users.some((u) => u.status === 'pending') && (
                <span className="px-1.5 py-0.5 text-[9px] font-black rounded-full bg-amber-500 text-slate-950 animate-pulse">
                  {users.filter((u) => u.status === 'pending').length} Onay Bekliyor
                </span>
              )}
            </button>

            <button
              id="mgmt-tab-logs-btn"
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'logs'
                  ? 'border-[#D32F2F] text-[#D32F2F] bg-white'
                  : 'border-transparent text-[#6C757D] hover:text-[#212529]'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Giriş &amp; Denetim Logları</span>
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-[#DEE2E6]/70 text-[#212529] font-roboto-mono">
                {logs.length}
              </span>
            </button>
          </div>

          {activeTab === 'users' && (
            <button
              id="open-add-user-btn"
              onClick={() => setShowAddUser((prev) => !prev)}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-[#D32F2F] hover:bg-[#B71C1C] text-white transition-all shadow-xs cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{showAddUser ? 'Formu Kapat' : 'Yeni Kullanıcı Ekle'}</span>
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto prominent-scrollbar p-4 sm:p-5 min-h-0 touch-pan-y overscroll-contain bg-[#F8F9FA]/40">
          {/* TAB 1: USERS LIST & MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* Expandable Add User Form */}
              {showAddUser && (
                <form
                  onSubmit={handleCreateUser}
                  className="bg-white border border-[#D32F2F]/30 rounded-2xl p-4 shadow-md space-y-3 animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#DEE2E6]">
                    <span className="text-xs font-bold text-[#D32F2F] flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4 text-[#D32F2F]" />
                      Yeni Personel / Kullanıcı Ekle
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddUser(false)}
                      className="text-[#6C757D] hover:text-[#212529] cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-[#212529] mb-1">Ad Soyad *</label>
                      <input
                        type="text"
                        required
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Örn: Hasan Yılmaz"
                        className="w-full bg-[#F8F9FA] border border-[#DEE2E6] rounded-xl px-3 py-2 text-[#212529] placeholder-[#6C757D]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/15 focus:border-[#D32F2F]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#212529] mb-1">E-posta Adresi *</label>
                      <input
                        type="email"
                        required
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="personel@tcdd.gov.tr"
                        className="w-full bg-[#F8F9FA] border border-[#DEE2E6] rounded-xl px-3 py-2 text-[#212529] placeholder-[#6C757D]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/15 focus:border-[#D32F2F]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#212529] mb-1">Şifre *</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="En az 4 karakter"
                          className="w-full bg-[#F8F9FA] border border-[#DEE2E6] rounded-xl pl-3 pr-8 py-2 text-[#212529] placeholder-[#6C757D]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/15 focus:border-[#D32F2F]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword((p) => !p)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6C757D] hover:text-[#212529] cursor-pointer"
                        >
                          {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#212529] mb-1">Görev / Birim</label>
                      <input
                        type="text"
                        value={newDept}
                        onChange={(e) => setNewDept(e.target.value)}
                        placeholder="Örn: Saha Bakım Şefliği"
                        className="w-full bg-[#F8F9FA] border border-[#DEE2E6] rounded-xl px-3 py-2 text-[#212529] placeholder-[#6C757D]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/15 focus:border-[#D32F2F]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-[#212529] mb-1">Yetki Rolü</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setNewRole('admin')}
                          className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                            newRole === 'admin'
                              ? 'bg-[#D32F2F]/10 border-[#D32F2F] text-[#D32F2F]'
                              : 'bg-[#F8F9FA] border-[#DEE2E6] text-[#6C757D]'
                          }`}
                        >
                          <div className="font-bold">👑 Yönetici</div>
                          <div className="text-[10px]">Tam yetki &amp; kullanıcı yönetimi</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewRole('editor')}
                          className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                            newRole === 'editor'
                              ? 'bg-[#D32F2F]/10 border-[#D32F2F] text-[#D32F2F]'
                              : 'bg-[#F8F9FA] border-[#DEE2E6] text-[#6C757D]'
                          }`}
                        >
                          <div className="font-bold">🛠️ Saha Personeli</div>
                          <div className="text-[10px]">Fotoğraf, not ve metraj</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewRole('viewer')}
                          className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                            newRole === 'viewer'
                              ? 'bg-[#212529]/5 border-[#212529] text-[#212529]'
                              : 'bg-[#F8F9FA] border-[#DEE2E6] text-[#6C757D]'
                          }`}
                        >
                          <div className="font-bold">👁️ Gözlemci</div>
                          <div className="text-[10px]">Yalnızca izleme</div>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddUser(false)}
                      className="px-3 py-1.5 rounded-xl border border-[#DEE2E6] text-[#6C757D] hover:bg-[#F8F9FA] text-xs cursor-pointer"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingUser}
                      className="px-4 py-1.5 rounded-xl bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold text-xs shadow-xs cursor-pointer disabled:opacity-60"
                    >
                      {isCreatingUser ? 'Ekleniyor...' : 'Kullanıcıyı Kaydet'}
                    </button>
                  </div>
                </form>
              )}

              {/* Yetkilendirme Sistemi İzinleri ve Açıklamaları Rehberi */}
              <div className="bg-white border border-[#DEE2E6] rounded-2xl p-4 space-y-3 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-bold text-[#212529]">
                  <Shield className="w-4 h-4 text-[#D32F2F]" />
                  <span>Yetkilendirme Sistemi Rolleri &amp; İzin Matrisi</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                  {/* Yönetici */}
                  <div className="bg-[#D32F2F]/5 border border-[#D32F2F]/20 rounded-xl p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#D32F2F] flex items-center gap-1.5">
                        <span>👑</span>
                        <span>Yönetici (Admin)</span>
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#D32F2F]/10 text-[#D32F2F] border border-[#D32F2F]/20">
                        Tam Yetki
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6C757D] leading-relaxed">
                      Sistemin tüm kontrolüne sahiptir. Yeni demiryolu noktası ekleyebilir, mevcut noktaları ve kilometre değerlerini düzenleyebilir veya silebilir.
                    </p>
                    <ul className="text-[10px] text-[#212529] space-y-1 pt-1 border-t border-[#D32F2F]/15 list-disc list-inside">
                      <li>Yeni nokta ekleme &amp; silme</li>
                      <li>Kullanıcı rolleri ve şifre yönetimi</li>
                      <li>Saha notu ve fotoğraf ekleme / silme</li>
                      <li>Tüm KML ve harita içe/dışa aktarımı</li>
                    </ul>
                  </div>

                  {/* Saha Personeli */}
                  <div className="bg-[#F8F9FA] border border-[#DEE2E6] rounded-xl p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#212529] flex items-center gap-1.5">
                        <span>🛠️</span>
                        <span>Saha Personeli (Editor)</span>
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
                        Saha &amp; Veri
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6C757D] leading-relaxed">
                      Hattaki mevcut noktaları inceleyebilir, bakım durumuyla ilgili canlı saha fotoğrafları yükleyebilir ve teknik inceleme notları ekleyebilir.
                    </p>
                    <ul className="text-[10px] text-[#212529] space-y-1 pt-1 border-t border-[#DEE2E6] list-disc list-inside">
                      <li>Saha fotoğrafı çekme ve yükleme</li>
                      <li>Tarihli inceleme &amp; bakım notu ekleme</li>
                      <li>Mesafe ve kot metre ölçümü yapma</li>
                      <li><strong className="text-amber-700">Kısıtlama:</strong> Nokta ekleyemez/silemez</li>
                    </ul>
                  </div>

                  {/* Gözlemci */}
                  <div className="bg-[#F8F9FA] border border-[#DEE2E6] rounded-xl p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#212529] flex items-center gap-1.5">
                        <span>👁️</span>
                        <span>Gözlemci (Viewer)</span>
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 border border-slate-300">
                        Salt Okunur
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6C757D] leading-relaxed">
                      Denetmen ve üst yönetim için tasarlanmıştır. Haritayı, hatları, kilometre zincirini ve yüklenmiş saha fotoğraflarını yalnızca inceler.
                    </p>
                    <ul className="text-[10px] text-[#6C757D] space-y-1 pt-1 border-t border-[#DEE2E6] list-disc list-inside">
                      <li>Harita ve uydu katmanlarını izleme</li>
                      <li>KM zinciri ve koordinatları görüntüleme</li>
                      <li>Fotoğraf ve geçmiş notları inceleme</li>
                      <li><strong className="text-[#D32F2F]">Kısıtlama:</strong> Hiçbir veriyi değiştiremez</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#6C757D] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Kullanıcı ara (Ad, e-posta veya şeflik)..."
                  className="w-full bg-white border border-[#DEE2E6] rounded-xl pl-10 pr-3.5 py-2 text-xs text-[#212529] placeholder-[#6C757D]/60 focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/15 focus:border-[#D32F2F]"
                />
              </div>

              {/* Users Cards */}
              <div className="space-y-2.5">
                {usersLoading ? (
                  <div className="p-8 text-center text-xs text-[#6C757D]">Kullanıcılar yükleniyor...</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#6C757D] bg-white rounded-xl border border-[#DEE2E6]">
                    Arama kriterine uygun kullanıcı bulunamadı.
                  </div>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelf = currentUser?.id === u.id;
                    const isUpdating = updatingId === u.id;

                    return (
                      <div
                        key={u.id}
                        id={`user-card-${u.id}`}
                        className="p-3.5 bg-white border border-[#DEE2E6] rounded-2xl hover:border-[#D32F2F]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                      >
                        {/* User Identity Info */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-xs ${
                              u.role === 'admin'
                                ? 'bg-[#D32F2F]'
                                : u.role === 'editor'
                                ? 'bg-[#212529]'
                                : 'bg-[#6C757D]'
                            }`}
                          >
                            {u.name.slice(0, 2).toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-[#212529] truncate">{u.name}</span>
                              {u.status === 'pending' && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>Onay Bekliyor</span>
                                </span>
                              )}
                              {isSelf && (
                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Siz
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-[#6C757D] truncate">{u.email}</div>
                            <div className="flex items-center gap-2 text-[11px] text-[#6C757D] mt-0.5">
                              <span className="truncate">{u.department || 'Demiryolu Operasyonları'}</span>
                              <span>•</span>
                              <span>Son Giriş: {formatDate(u.lastLoginAt)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions & Role Selector */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-center">
                          {u.status === 'pending' ? (
                            /* PENDING USER APPROVAL ACTIONS */
                            <div className="flex items-center gap-1.5 bg-amber-50 p-1.5 rounded-xl border border-amber-200">
                              <span className="text-[10px] font-bold text-amber-800 px-1.5 py-0.5 rounded bg-amber-100">
                                Onay Bekliyor
                              </span>
                              {/* Quick Role & Approve Buttons */}
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleApproveUser(u.id, 'editor')}
                                title="Saha Personeli Olarak Onayla"
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all active:scale-95 cursor-pointer shadow-xs flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Saha Olarak Onayla</span>
                              </button>
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleApproveUser(u.id, 'admin')}
                                title="Yönetici Olarak Onayla"
                                className="px-2 py-1 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold text-xs rounded-lg transition-all active:scale-95 cursor-pointer shadow-xs flex items-center gap-1"
                              >
                                <span>👑 Yönetici</span>
                              </button>
                            </div>
                          ) : (
                            /* ACTIVE USER ROLE SELECTOR */
                            <div className="relative">
                              <select
                                id={`role-select-${u.id}`}
                                disabled={isUpdating}
                                value={u.role}
                                onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                                className={`text-xs font-bold py-1.5 px-3 rounded-xl border appearance-none pr-8 cursor-pointer focus:outline-none transition-all ${
                                  u.role === 'admin'
                                    ? 'bg-[#D32F2F]/10 border-[#D32F2F]/30 text-[#D32F2F]'
                                    : u.role === 'editor'
                                    ? 'bg-[#F8F9FA] border-[#DEE2E6] text-[#212529]'
                                    : 'bg-slate-100 border-[#DEE2E6] text-[#6C757D]'
                                }`}
                              >
                                <option value="admin">👑 Yönetici</option>
                                <option value="editor">🛠️ Saha Personeli</option>
                                <option value="viewer">👁️ Gözlemci</option>
                              </select>
                              <ChevronDown className="w-3.5 h-3.5 text-[#6C757D] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          )}

                          {/* Reset Password Button */}
                          <button
                            id={`reset-pwd-btn-${u.id}`}
                            onClick={() => {
                              setResetTargetUser(u);
                              setTargetNewPassword('demiryolu123');
                            }}
                            title="Şifresini Sıfırla / Belirle"
                            className="p-1.5 rounded-xl border border-[#DEE2E6] text-[#6C757D] hover:text-amber-700 hover:border-amber-400 hover:bg-amber-50 transition-colors cursor-pointer"
                          >
                            <Key className="w-4 h-4" />
                          </button>

                          {/* Delete Button (Only for other users) */}
                          {!isSelf && (
                            <button
                              id={`delete-user-btn-${u.id}`}
                              onClick={() => setUserToDelete(u)}
                              title="Kullanıcıyı Sil (Kalıcı Engelle)"
                              className="p-1.5 rounded-xl border border-[#DEE2E6] text-[#6C757D] hover:text-[#D32F2F] hover:border-[#D32F2F]/40 hover:bg-[#D32F2F]/5 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: AUDIT & LOGIN LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-3.5">
              {/* Filter Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-white rounded-xl border border-[#DEE2E6]">
                <div className="flex items-center gap-1.5 text-xs flex-wrap">
                  <span className="text-[#6C757D] text-[11px] font-semibold mr-1">Filtre:</span>
                  <button
                    onClick={() => setLogFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                      logFilter === 'all' ? 'bg-[#D32F2F] text-white' : 'text-[#6C757D] hover:bg-[#F8F9FA]'
                    }`}
                  >
                    Tümü ({logs.length})
                  </button>
                  <button
                    onClick={() => setLogFilter('login')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                      logFilter === 'login' ? 'bg-[#D32F2F] text-white' : 'text-[#6C757D] hover:bg-[#F8F9FA]'
                    }`}
                  >
                    Giriş Denemeleri
                  </button>
                  <button
                    onClick={() => setLogFilter('errors')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                      logFilter === 'errors' ? 'bg-[#D32F2F] text-white' : 'text-[#6C757D] hover:bg-[#F8F9FA]'
                    }`}
                  >
                    Hatalı Girişler
                  </button>
                  <button
                    onClick={() => setLogFilter('role')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                      logFilter === 'role' ? 'bg-[#D32F2F] text-white' : 'text-[#6C757D] hover:bg-[#F8F9FA]'
                    }`}
                  >
                    Yetki Değişiklikleri
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={loadLogs}
                    className="flex items-center gap-1 text-[11px] text-[#212529] px-2.5 py-1 rounded-lg bg-[#F8F9FA] hover:bg-[#DEE2E6]/60 border border-[#DEE2E6] transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${logsLoading ? 'animate-spin' : ''}`} />
                    <span>Güncelle</span>
                  </button>
                  <button
                    onClick={() => setShowClearLogsModal(true)}
                    className="flex items-center gap-1 text-[11px] text-[#D32F2F] hover:text-[#B71C1C] px-2.5 py-1 rounded-lg bg-[#D32F2F]/5 hover:bg-[#D32F2F]/10 border border-[#D32F2F]/20 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Logları Temizle</span>
                  </button>
                </div>
              </div>

              {/* Logs Stream */}
              <div className="space-y-2">
                {logsLoading ? (
                  <div className="p-8 text-center text-xs text-[#6C757D]">Loglar alınıyor...</div>
                ) : filteredLogs.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#6C757D] bg-white rounded-xl border border-[#DEE2E6]">
                    Henüz kayıtlı bir denetim logu bulunmuyor.
                  </div>
                ) : (
                  filteredLogs.map((log) => {
                    const isError = log.status === 'failed' || log.action.includes('HATA') || log.action.includes('BAŞARISIZ');
                    const isSuccess = log.status === 'success' || log.action.includes('BAŞARILI');
                    const isWarning = log.status === 'warning' || log.action.includes('ŞİFRE');

                    return (
                      <div
                        key={log.id}
                        className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 transition-colors ${
                          isError
                            ? 'bg-red-50 border-red-200 text-red-900'
                            : isWarning
                            ? 'bg-amber-50 border-amber-200 text-amber-900'
                            : 'bg-white border-[#DEE2E6] text-[#212529]'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          {isError ? (
                            <AlertCircle className="w-4 h-4 text-[#D32F2F] shrink-0 mt-0.5" />
                          ) : isSuccess ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : isWarning ? (
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          ) : (
                            <Info className="w-4 h-4 text-[#D32F2F] shrink-0 mt-0.5" />
                          )}

                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-black uppercase px-1.5 py-0.2 rounded border ${
                                  isError
                                    ? 'bg-red-100 border-red-300 text-red-800'
                                    : isSuccess
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                    : 'bg-[#D32F2F]/10 border-[#D32F2F]/20 text-[#D32F2F]'
                                }`}
                              >
                                {log.action}
                              </span>
                              {log.email && (
                                <span className="font-bold text-[#212529] truncate">{log.email}</span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#6C757D] leading-snug break-words">
                              {log.details}
                            </p>
                          </div>
                        </div>

                        <div className="text-[10px] text-[#6C757D] shrink-0 text-right font-roboto-mono">
                          <div>{formatDate(log.timestamp)}</div>
                          {log.ip && <div className="text-[#6C757D]/70 truncate max-w-[120px]">{log.ip}</div>}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#F8F9FA] px-5 py-3 border-t border-[#DEE2E6] flex items-center justify-between text-xs text-[#6C757D]">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-[#D32F2F]" />
            <span>Tüm kullanıcı yetkileri ve sistem günlükleri anlık olarak korunmaktadır.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-semibold transition-colors cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>

      {/* Password Reset Modal */}
      {resetTargetUser && (
        <div
          id="reset-pass-overlay"
          className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-poppins"
          onClick={() => setResetTargetUser(null)}
        >
          <div
            id="reset-pass-modal"
            className="bg-white border border-[#DEE2E6] rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl text-[#212529]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="gov-bar w-full h-[5px]" />
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#D32F2F]/10 border border-[#D32F2F]/20 text-[#D32F2F] flex items-center justify-center shrink-0">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#212529]">Şifre Belirle / Sıfırla</h3>
                  <p className="text-[11px] text-[#6C757D]">{resetTargetUser.name} ({resetTargetUser.email})</p>
                </div>
              </div>

              <form onSubmit={handleSaveResetPassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#212529] mb-1">
                    Yeni Şifre Belirleyin
                  </label>
                  <input
                    type="text"
                    required
                    value={targetNewPassword}
                    onChange={(e) => setTargetNewPassword(e.target.value)}
                    placeholder="Yeni şifreyi giriniz"
                    className="w-full bg-[#F8F9FA] border border-[#DEE2E6] rounded-xl px-3 py-2 text-sm text-[#212529] placeholder-[#6C757D]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/15 focus:border-[#D32F2F]"
                  />
                  <p className="text-[10px] text-[#6C757D] mt-1">
                    Öneri: demiryolu123 veya saha123
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setResetTargetUser(null)}
                    className="px-3 py-1.5 rounded-xl border border-[#DEE2E6] text-[#6C757D] hover:bg-[#F8F9FA] text-xs cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={isResettingPass}
                    className="px-4 py-1.5 rounded-xl bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold text-xs shadow-sm cursor-pointer disabled:opacity-60"
                  >
                    {isResettingPass ? 'Kaydediliyor...' : 'Şifreyi Güncelle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal (rule 3: using DeleteConfirmModal) */}
      <DeleteConfirmModal
        isOpen={Boolean(userToDelete)}
        title="Kullanıcıyı Sil"
        itemName={userToDelete?.name}
        description={`"${userToDelete?.name}" (${userToDelete?.email}) kullanıcısı sistemden kalıcı olarak silinecektir. Devam etmek istiyor musunuz?`}
        confirmText="Evet, Kullanıcıyı Sil"
        cancelText="Vazgeç"
        isDeleting={isDeletingUser}
        onConfirm={confirmDeleteUser}
        onClose={() => setUserToDelete(null)}
      />

      {/* Clear Logs Modal (rule 3: using DeleteConfirmModal) */}
      <DeleteConfirmModal
        isOpen={showClearLogsModal}
        title="Logları Temizle"
        description="Tüm geçmiş oturum ve denetim log kayıtları silinecektir. Bu işlem geri alınamaz."
        confirmText="Evet, Logları Temizle"
        cancelText="Vazgeç"
        isDeleting={isClearingLogs}
        onConfirm={confirmClearLogs}
        onClose={() => setShowClearLogsModal(false)}
      />
    </div>
  );
};
