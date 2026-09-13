import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { useEffect } from 'react';

export function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const { language, setLanguage } = useAuthStore();
    
    useEffect(() => {
        if (i18n.language !== language) {
            i18n.changeLanguage(language);
            document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr';
            document.documentElement.lang = language;
        }
    }, [language, i18n]);

    const changeLanguage = (lng: string) => {
        setLanguage(lng);
    };

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

    return (
        <select 
            onChange={(e) => changeLanguage(e.target.value)} 
            value={language} 
            className="border border-gray-200 rounded-2xl p-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-brand-dark focus:border-transparent outline-none transition-all shadow-sm"
            aria-label="Select Language"
        >
            {languages.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
    );
}
