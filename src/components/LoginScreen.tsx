import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { registerApi } from '../services/authApi.ts';
import {
  Lock,
  Mail,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Train,
  ArrowRight,
  LogIn,
  KeyRound,
  UserPlus,
  User,
  Building,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface LoginScreenProps {
  onSuccessToast?: (msg: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccessToast }) => {
  const { login } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state (Note: NO role choice, strictly name, email, pass, dept)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDepartment, setRegDepartment] = useState('Demiryolu Operasyonları & Saha Şefliği');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [registerSuccessMessage, setRegisterSuccessMessage] = useState<string | null>(null);

  // Shared UI states
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      setError({ message: 'Lütfen e-posta adresinizi ve şifrenizi giriniz.' });
      return;
    }

    setError(null);
    setRegisterSuccessMessage(null);
    setIsSubmitting(true);
    try {
      await login(loginEmail.trim(), loginPassword);
      onSuccessToast?.('Hoş geldiniz! Demiryolu KM Harita Sistemi yüklendi.');
    } catch (err: any) {
      setError({
        message: err.message || 'Giriş yapılamadı. Lütfen e-posta veya şifrenizi kontrol edin.',
        code: err.code,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setError({ message: 'Lütfen tüm zorunlu alanları doldurunuz.' });
      return;
    }

    if (regPassword.length < 4) {
      setError({ message: 'Şifreniz en az 4 karakter olmalıdır.' });
      return;
    }

    setError(null);
    setRegisterSuccessMessage(null);
    setIsSubmitting(true);

    const emailToUse = regEmail.trim();
    const passToUse = regPassword;

    try {
      await registerApi({
        name: regName.trim(),
        email: emailToUse,
        password: passToUse,
        department: regDepartment.trim(),
      });

      // Alpha update: Auto-login immediately upon registration for zero friction
      try {
        await login(emailToUse, passToUse);
        onSuccessToast?.('Hesabınız başarıyla oluşturuldu ve oturumunuz açıldı!');
        return;
      } catch {
        // If auto-login fails, fall back to login tab with prefilled credentials
        setLoginEmail(emailToUse);
        setLoginPassword(passToUse);
        setActiveTab('login');
        setRegisterSuccessMessage('Hesabınız başarıyla oluşturuldu! Lütfen giriş yapınız.');
        onSuccessToast?.('Hesabınız oluşturuldu.');
      }
    } catch (err: any) {
      setError({
        message: err.message || 'Kayıt oluşturulamadı.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F9FA] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden font-poppins select-none text-[#212529]">
      {/* Subtle institutional top ribbon */}
      <div className="gov-bar fixed top-0 inset-x-0 h-[5px] z-20" />

      {/* Main Container */}
      <div className="w-full max-w-md z-10 space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#D32F2F] shadow-md shadow-[#D32F2F]/25 border border-[#B71C1C] mb-0.5">
            <Train className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#212529] flex items-center justify-center gap-2">
              <span>TCDD KM TAKİP</span>
            </h1>
            <p className="text-xs font-bold text-[#D32F2F] tracking-wider uppercase mt-0.5">
              Demiryolu Kilometre ve Tesis Portalı
            </p>
          </div>
        </div>

        {/* Card Box */}
        <div className="bg-white border border-[#DEE2E6] rounded-2xl shadow-xl overflow-hidden">
          <div className="gov-bar w-full h-[5px]" />
          <div className="p-5 sm:p-6">
            {/* Dual Navigation Tabs: Giriş Yap & Yeni Hesap Aç */}
            <div className="grid grid-cols-2 p-1 bg-[#F8F9FA] border border-[#DEE2E6] rounded-xl mb-5">
              <button
                id="tab-login-btn"
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setError(null);
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-[#D32F2F] text-white shadow-xs'
                    : 'text-[#6C757D] hover:text-[#212529]'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Giriş Yap</span>
              </button>

              <button
                id="tab-register-btn"
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setError(null);
                  setRegisterSuccessMessage(null);
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-[#D32F2F] text-white shadow-xs'
                    : 'text-[#6C757D] hover:text-[#212529]'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Yeni Hesap Aç</span>
              </button>
            </div>

            {/* Pending Approval / Success Banner */}
            {registerSuccessMessage && (
              <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-emerald-900 text-xs animate-in fade-in duration-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-emerald-950 block">Hesap Başvurusu Kaydedildi!</span>
                  <p className="leading-relaxed text-[11px] text-emerald-800">
                    {registerSuccessMessage}
                  </p>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-800 text-xs animate-in fade-in duration-150">
                {error.code === 'ACCOUNT_PENDING_APPROVAL' ? (
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-[#D32F2F] shrink-0 mt-0.5" />
                )}
                <div className="flex-1 space-y-1">
                  <div className="leading-snug font-medium">{error.message}</div>
                  {error.code === 'ACCOUNT_PENDING_APPROVAL' && (
                    <p className="text-[11px] text-amber-800 font-semibold">
                      * Yöneticilerden biri yönetim panelinden "Onayla" butonuna bastığı an giriş yapabileceksiniz.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 1: LOGIN FORM */}
            {activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#212529] mb-1.5">
                    E-posta veya Kullanıcı Adı
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#6C757D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="login-email-input"
                      type="text"
                      required
                      autoFocus
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="E-posta veya kullanıcı adınızı giriniz"
                      className="w-full bg-[#F8F9FA] border border-[#DEE2E6] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#212529] placeholder-[#6C757D]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/15 focus:border-[#D32F2F] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[#212529]">
                      Şifre
                    </label>
                    <span className="text-[11px] text-[#6C757D] flex items-center gap-1">
                      <KeyRound className="w-3 h-3 text-[#6C757D]" />
                      <span>Şifreli Giriş</span>
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#6C757D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="login-password-input"
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#F8F9FA] border border-[#DEE2E6] rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#212529] placeholder-[#6C757D]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/15 focus:border-[#D32F2F] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6C757D] hover:text-[#212529] transition-colors p-1 cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  id="login-submit-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold text-sm py-2.5 px-4 rounded-xl shadow-md shadow-[#D32F2F]/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Haritaya Giriş Yap</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('register');
                      setError(null);
                      setRegisterSuccessMessage(null);
                    }}
                    className="text-xs text-[#6C757D] hover:text-[#D32F2F] transition-colors cursor-pointer"
                  >
                    Hesabınız yok mu? <span className="font-bold underline">Yeni Hesap Aç</span>
                  </button>
                </div>
              </form>
            ) : (
              /* TAB 2: REGISTER FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-[11px] text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Hesabınız oluşturulduğu an otomatik olarak aktif edilir, beklemeden başlayabilirsiniz.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#212529] mb-1">
                    Ad Soyad *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#6C757D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="register-name-input"
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Örn: Ahmet Yılmaz"
                      className="w-full bg-[#F8F9FA] border border-[#DEE2E6] rounded-xl pl-10 pr-3.5 py-2 text-sm text-[#212529] placeholder-[#6C757D]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/15 focus:border-[#D32F2F] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#212529] mb-1">
                    E-posta Adresi *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#6C757D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="register-email-input"
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="ornek@tcdd.gov.tr"
                      className="w-full bg-[#F8F9FA] border border-[#DEE2E6] rounded-xl pl-10 pr-3.5 py-2 text-sm text-[#212529] placeholder-[#6C757D]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/15 focus:border-[#D32F2F] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#212529] mb-1">
                    Şifre Belirleyin (En az 4 karakter) *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#6C757D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="register-password-input"
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#F8F9FA] border border-[#DEE2E6] rounded-xl pl-10 pr-10 py-2 text-sm text-[#212529] placeholder-[#6C757D]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/15 focus:border-[#D32F2F] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6C757D] hover:text-[#212529] transition-colors p-1 cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#212529] mb-1">
                    Birim / Şeflik / Görev
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-[#6C757D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="register-dept-input"
                      type="text"
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                      placeholder="Örn: 712 Yol Bakım Şefliği"
                      className="w-full bg-[#F8F9FA] border border-[#DEE2E6] rounded-xl pl-10 pr-3.5 py-2 text-sm text-[#212529] placeholder-[#6C757D]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/15 focus:border-[#D32F2F] transition-all"
                    />
                  </div>
                </div>

                <button
                  id="register-submit-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold text-sm py-2.5 px-4 rounded-xl shadow-md shadow-[#D32F2F]/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Hesap Başvurusunu Tamamla</span>
                    </>
                  )}
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setError(null);
                    }}
                    className="text-xs text-[#6C757D] hover:text-[#D32F2F] underline cursor-pointer"
                  >
                    Zaten bir hesabınız var mı? Giriş Yapın
                  </button>
                </div>
              </form>
            )}

            {/* Security Banner Note & Developer Signature */}
            <div className="mt-4 pt-3 border-t border-[#DEE2E6] flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[11px] text-[#6C757D]">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  TCDD Demiryolu hat koordinatları ve saha kayıtları güvenli şifreleme altındadır.
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#6C757D] pt-1.5 border-t border-[#DEE2E6]">
                <span className="font-semibold">Geliştirici: <strong className="text-[#D32F2F]">712 Şefliği</strong></span>
                <span className="text-emerald-700 font-bold">Alpha v1.0 Kurumsal Sürüm</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
