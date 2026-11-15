import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  X,
  Lock,
  Mail,
  Shield,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast?: (msg: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast,
}) => {
  const { login, user, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Lütfen e-posta ve şifrenizi giriniz.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      onSuccessToast?.('Başarıyla giriş yapıldı.');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="login-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 font-poppins"
      onClick={onClose}
    >
      <div
        id="login-modal-container"
        className="bg-white border border-[#DEE2E6] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[#212529]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="gov-bar w-full h-[5px] shrink-0" />

        {/* Header */}
        <div className="bg-white text-[#212529] px-5 py-4 flex items-center justify-between border-b border-[#DEE2E6]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D32F2F] flex items-center justify-center text-white shadow-xs">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#212529]">Demiryolu Giriş Portalı</h2>
              <p className="text-[11px] text-[#6C757D]">Yetkili personel oturum açma</p>
            </div>
          </div>
          <button
            id="close-login-modal-btn"
            onClick={onClose}
            className="text-[#6C757D] hover:text-[#212529] p-1 rounded-lg hover:bg-[#F8F9FA] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current User Status Banner (if logged in) */}
        {user && (
          <div className="bg-[#F8F9FA] border-b border-[#DEE2E6] px-5 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs text-[#6C757D]">
                Aktif Oturum: <strong className="text-[#212529]">{user.name}</strong> ({user.role.toUpperCase()})
              </span>
            </div>
            <button
              id="logout-btn"
              onClick={() => {
                logout();
                onSuccessToast?.('Oturum kapatıldı.');
                onClose();
              }}
              className="text-[11px] text-[#D32F2F] hover:underline font-bold cursor-pointer"
            >
              Çıkış Yap
            </button>
          </div>
        )}

        {/* Form Body */}
        <div className="p-5">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-[#D32F2F]">
              <AlertCircle className="w-4 h-4 text-[#D32F2F] shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#212529] mb-1">
                E-Posta Adresi
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#6C757D] absolute left-3 top-2.5" />
                <input
                  id="login-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@tcdd.gov.tr"
                  className="w-full text-xs pl-9 pr-3 py-2.5 bg-[#F8F9FA] border border-[#DEE2E6] rounded-xl text-[#212529] focus:outline-none focus:bg-white focus:border-[#D32F2F] focus:ring-2 focus:ring-[#D32F2F]/15"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#212529] mb-1">
                Şifre
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6C757D] absolute left-3 top-2.5" />
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-9 pr-9 py-2.5 bg-[#F8F9FA] border border-[#DEE2E6] rounded-xl text-[#212529] focus:outline-none focus:bg-white focus:border-[#D32F2F] focus:ring-2 focus:ring-[#D32F2F]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-2.5 text-[#6C757D] hover:text-[#212529] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="submit-login-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-[#D32F2F] hover:bg-[#B71C1C] text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? 'Giriş Yapılıyor...' : 'Oturum Aç'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
