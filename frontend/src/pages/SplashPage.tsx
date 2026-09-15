import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SplashPage = () => {
  const navigate = useNavigate();
  
  const { t } = useTranslation();

  const handleGetStarted = () => {
    navigate('/language');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface text-on-surface mobile-shell-width px-6 relative overflow-hidden">
      {/* Background Decorative Elements using Brand Colors */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-primary-container opacity-20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-secondary-fixed opacity-40 rounded-full blur-3xl"></div>
      
      <div className="z-10 flex flex-col items-center justify-center text-center space-y-10 mt-[-10vh]">
        {/* Logo / App Name */}
        <div className="animate-fade-in">
          <h1 className="text-5xl font-bold text-primary tracking-tight mb-3">{t('app.name')}</h1>
          <div className="h-1.5 w-16 bg-primary mx-auto rounded-full"></div>
        </div>

        {/* Taglines in English and Tamil */}
        <div className="space-y-6 animate-slide-up" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
          <div>
            <h2 className="text-xl font-semibold text-on-surface mb-1">{t('app.welcome')}</h2>
            <p className="text-sm text-on-surface-variant font-medium">{t('app.tagline')}</p>
          </div>
          
          <div className="flex items-center justify-center gap-4 opacity-60">
            <div className="h-px w-12 bg-outline-variant"></div>
            <div className="w-2 h-2 rounded-full bg-primary opacity-50"></div>
            <div className="h-px w-12 bg-outline-variant"></div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-on-surface mb-1" style={{ fontFamily: 'system-ui' }}>ArtisanX-க்கு நல்வரவு</h2>
            <p className="text-sm text-on-surface-variant font-medium" style={{ fontFamily: 'system-ui' }}>கைவினைஞர்களை மேம்படுத்துதல், சந்தைகளை இணைத்தல்</p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="absolute bottom-12 left-0 right-0 px-8 animate-slide-up" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
        <button 
          onClick={handleGetStarted}
          className="w-full bg-primary hover:bg-primary-container text-on-primary font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-primary/30 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 flex flex-col items-center justify-center space-y-1"
        >
          <span className="text-base uppercase tracking-wider">{t('app.get_started')}</span>
          <span className="text-sm font-medium opacity-90" style={{ fontFamily: 'system-ui' }}>தொடங்குங்கள்</span>
        </button>
      </div>
    </div>
  );
};

export default SplashPage;
