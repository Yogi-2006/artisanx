import React from 'react';
import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
    const { i18n } = useTranslation();
    
    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        document.documentElement.dir = lng === 'ur' ? 'rtl' : 'ltr';
        document.documentElement.lang = lng;
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
        <select onChange={(e) => changeLanguage(e.target.value)} value={i18n.language} className="border rounded p-1 text-sm">
            {languages.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
    );
}
