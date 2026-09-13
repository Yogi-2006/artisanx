import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import RoleSelect from '../components/auth/RoleSelect';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'മലയാളം' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'mr', label: 'मराठी' },
  { code: 'ur', label: 'اردو' }
];

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading, error, clearError, sendOtp, verifyOtp, loginWithEmail, registerWithEmail } = useAuthStore();
  const navigate = useNavigate();
  const [lang, setLang] = useState(localStorage.getItem('app_lang') || 'en');
  const [tab, setTab] = useState<'phone' | 'email'>('phone');
  
  // Phone state
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(0);

  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [regSuccessMessage, setRegSuccessMessage] = useState('');

  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Navigate if already authenticated and has a role
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      navigate(`/${user.role}`);
    }
  }, [isAuthenticated, user, navigate]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!phone) return;
    const fullPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
    await sendOtp(fullPhone);
    setOtpSent(true);
    setTimer(60);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!otp || otp.length !== 6) return;
    const fullPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
    await verifyOtp(fullPhone, otp);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setRegSuccessMessage('');
    if (!email || !password) return;
    if (isRegistering) {
      await registerWithEmail(email, password);
      // Check if registration requires email confirmation
      const state = useAuthStore.getState();
      if (!state.error && !state.isAuthenticated && state.user) {
        setRegSuccessMessage('Registration successful! Please check your email to verify your account.');
      }
    } else {
      await loginWithEmail(email, password);
    }
  };

  if (isAuthenticated && !user?.role) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <RoleSelect lang={lang} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Header */}
      <header className="p-6 flex justify-between items-center w-full relative z-10 mt-4">
        <h1 className="text-3xl font-extrabold text-brand-dark tracking-tight">ArtisanX</h1>
        <select 
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="bg-white border-0 shadow-sm text-stone-700 text-sm rounded-xl focus:ring-brand-neon focus:border-brand-neon block p-2 font-medium"
        >
          {languages.map(l => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
      </header>

      {/* Main Form */}
      <main className="flex-1 flex flex-col justify-center items-center p-4 w-full">
        <div className="bg-white rounded-[32px] shadow-[0_8px_40px_rgba(0,0,0,0.04)] w-full overflow-hidden border border-stone-100/50 p-2">
          
          {/* Tabs */}
          <div className="flex w-full bg-brand-bg p-1 rounded-3xl mb-4">
            <button 
              className={`flex-1 py-3 text-sm font-bold rounded-2xl transition-all duration-300 ${tab === 'phone' ? 'bg-white text-brand-dark shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
              onClick={() => setTab('phone')}
            >
              Phone
            </button>
            <button 
              className={`flex-1 py-3 text-sm font-bold rounded-2xl transition-all duration-300 ${tab === 'email' ? 'bg-white text-brand-dark shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
              onClick={() => setTab('email')}
            >
              Email
            </button>
          </div>

          <div className="px-6 pb-6 pt-2">
            
            {/* Error & Success Messages */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-semibold">
                {error}
              </div>
            )}
            {regSuccessMessage && (
              <div className="mb-4 p-4 bg-green-50 border border-green-100 rounded-2xl text-green-700 text-sm font-semibold">
                {regSuccessMessage}
              </div>
            )}

            {tab === 'phone' && (
              <>
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-stone-800 mb-2">Phone Number</label>
                      <div className="flex rounded-2xl overflow-hidden border border-stone-200 focus-within:border-brand-dark focus-within:ring-1 focus-within:ring-brand-dark transition-colors">
                        <span className="inline-flex items-center px-4 bg-brand-bg text-stone-500 text-sm font-medium border-r border-stone-200">
                          +91
                        </span>
                        <input 
                          type="tel" 
                          value={phone.replace('+91', '')} 
                          onChange={(e) => setPhone(e.target.value)}
                          className="flex-1 block w-full min-w-0 sm:text-sm p-4 border-0 focus:ring-0"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      disabled={isLoading || !phone}
                      className="w-full bg-brand-dark text-white font-bold py-4 px-4 rounded-2xl hover:bg-black transition-colors disabled:opacity-50"
                    >
                      {isLoading ? 'Sending...' : t('auth.send_otp')}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-stone-800 mb-2">Enter 6-digit OTP</label>
                      <input 
                        type="text" 
                        maxLength={6}
                        value={otp} 
                        onChange={(e) => setOtp(e.target.value)}
                        className="block w-full rounded-2xl border-stone-200 p-4 border text-center text-2xl font-bold tracking-[0.5em] focus:ring-brand-dark focus:border-brand-dark transition-colors"
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={isLoading || otp.length !== 6}
                      className="w-full bg-brand-dark text-white font-bold py-4 px-4 rounded-2xl hover:bg-black transition-colors disabled:opacity-50"
                    >
                      {isLoading ? 'Verifying...' : 'Verify'}
                    </button>
                    <div className="text-center mt-6">
                      {timer > 0 ? (
                        <p className="text-sm font-medium text-stone-500">Resend OTP in {timer}s</p>
                      ) : (
                        <button type="button" onClick={handleSendOtp} className="text-sm text-brand-dark font-bold hover:underline">
                          Resend OTP
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </>
            )}

            {tab === 'email' && (
              <form onSubmit={handleEmailAuth} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-stone-800 mb-2">Email</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-2xl border-stone-200 p-4 border focus:ring-brand-dark focus:border-brand-dark transition-colors"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-800 mb-2">Password</label>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-2xl border-stone-200 p-4 border focus:ring-brand-dark focus:border-brand-dark transition-colors"
                    placeholder="Enter your password"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isLoading || !email || !password}
                  className="w-full bg-brand-dark text-white font-bold py-4 px-4 rounded-2xl hover:bg-black transition-colors disabled:opacity-50"
                >
                  {isLoading ? t('common.loading') : (isRegistering ? t('auth.register') : t('auth.login'))}
                </button>
                <div className="text-center mt-6">
                  <button 
                    type="button" 
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="text-sm text-brand-dark font-bold hover:underline"
                  >
                    {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
