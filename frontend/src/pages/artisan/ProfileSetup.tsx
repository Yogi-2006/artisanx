import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import api from '../../lib/api';
import { useTranslation } from 'react-i18next';

const translations: Record<string, any> = {
  en: { step1: "Basic Info", step2: "Details", step3: "Photo", artisanName: "Artisan Name", businessName: "Business Name (Optional)", craftType: "Craft Type", craftCategory: "Craft Category", location: "Location", next: "Next", back: "Back", cooperativeName: "Cooperative Name (Optional)", yearsExp: "Years of Experience", prodCap: "Production Capacity (items/month)", craftStory: "Your Craft Story", complete: "Complete Profile" },
  ta: { step1: "அடிப்படை தகவல்", step2: "விவரங்கள்", step3: "புகைப்படம்", artisanName: "கைவினைஞர் பெயர்", businessName: "வணிகப் பெயர்", craftType: "கைவினை வகை", craftCategory: "கைவினைப் பிரிவு", location: "இடம்", next: "அடுத்து", back: "பின்னால்", cooperativeName: "கூட்டுறவு பெயர்", yearsExp: "அனுபவம் (ஆண்டுகள்)", prodCap: "உற்பத்தி திறன்", craftStory: "உங்கள் கதை", complete: "முடிக்கவும்" },
  hi: { step1: "मूल जानकारी", step2: "विवरण", step3: "तस्वीर", artisanName: "कारीगर का नाम", businessName: "व्यवसाय का नाम", craftType: "शिल्प प्रकार", craftCategory: "शिल्प श्रेणी", location: "स्थान", next: "अगला", back: "पीछे", cooperativeName: "सहकारी नाम", yearsExp: "अनुभव के वर्ष", prodCap: "उत्पादन क्षमता", craftStory: "आपकी कहानी", complete: "प्रोफ़ाइल पूरी करें" },
  te: { step1: "ప్రాథమిక సమాచారం", step2: "వివరాలు", step3: "ఫోటో", artisanName: "కళాకారుడి పేరు", businessName: "వ్యాపారం పేరు", craftType: "క్రాఫ్ట్ రకం", craftCategory: "క్రాఫ్ట్ వర్గం", location: "స్థానం", next: "తరువాత", back: "వెనుకకు", cooperativeName: "సహకార సంస్థ పేరు", yearsExp: "అనుభవం (సంవత్సరాలు)", prodCap: "ఉత్పత్తి సామర్థ్యం", craftStory: "మీ కథ", complete: "పూర్తి చేయండి" },
  kn: { step1: "ಮೂಲ ಮಾಹಿತಿ", step2: "ವಿವರಗಳು", step3: "ಫೋಟೋ", artisanName: "ಕುಶಲಕರ್ಮಿ ಹೆಸರು", businessName: "ವ್ಯಾಪಾರ ಹೆಸರು", craftType: "ಕರಕುಶಲ ಪ್ರಕಾರ", craftCategory: "ಕರಕುಶಲ ವರ್ಗ", location: "ಸ್ಥಳ", next: "ಮುಂದೆ", back: "ಹಿಂದೆ", cooperativeName: "ಸಹಕಾರಿ ಹೆಸರು", yearsExp: "ಅನುಭವದ ವರ್ಷಗಳು", prodCap: "ಉತ್ಪಾದನಾ ಸಾಮರ್ಥ್ಯ", craftStory: "ನಿಮ್ಮ ಕಥೆ", complete: "ಪೂರ್ಣಗೊಳಿಸಿ" },
  ml: { step1: "അടിസ്ഥാന വിവരങ്ങൾ", step2: "വിശദാംശങ്ങൾ", step3: "ഫോട്ടോ", artisanName: "കലാകാരന്റെ പേര്", businessName: "ബിസിനസ്സ് പേര്", craftType: "ക്രാഫ്റ്റ് തരം", craftCategory: "ക്രാഫ്റ്റ് വിഭാഗം", location: "സ്ഥലം", next: "അടുത്തത്", back: "പിന്നിലേക്ക്", cooperativeName: "സഹകരണ സംഘത്തിന്റെ പേര്", yearsExp: "പരിചയം (വർഷങ്ങൾ)", prodCap: "ഉൽപ്പാദന ശേഷി", craftStory: "നിങ്ങളുടെ കഥ", complete: "പൂർത്തിയാക്കുക" },
  bn: { step1: "প্রাথমিক তথ্য", step2: "বিবরণ", step3: "ছবি", artisanName: "কারিগর নাম", businessName: "ব্যবসার নাম", craftType: "শিল্পের ধরন", craftCategory: "শিল্পের বিভাগ", location: "অবস্থান", next: "পরবর্তী", back: "পিছনে", cooperativeName: "সমবায়ের নাম", yearsExp: "অভিজ্ঞতার বছর", prodCap: "উৎপাদন ক্ষমতা", craftStory: "আপনার গল্প", complete: "সম্পূর্ণ করুন" },
  mr: { step1: "मूलभूत माहिती", step2: "तपशील", step3: "फोटो", artisanName: "कारागिराचे नाव", businessName: "व्यवसायाचे नाव", craftType: "हस्तकला प्रकार", craftCategory: "हस्तकला श्रेणी", location: "ठिकाण", next: "पुढील", back: "मागे", cooperativeName: "सहकारी संस्थेचे नाव", yearsExp: "अनुभवाची वर्षे", prodCap: "उत्पादन क्षमता", craftStory: "तुमची कथा", complete: "पूर्ण करा" },
  ur: { step1: "بنیادی معلومات", step2: "تفصیلات", step3: "تصویر", artisanName: "کاریگر کا نام", businessName: "کاروبار کا نام", craftType: "دستکاری کی قسم", craftCategory: "دستکاری کا زمرہ", location: "مقام", next: "آگے", back: "پیچھے", cooperativeName: "تعاون کا نام", yearsExp: "تجربہ (سال)", prodCap: "پیداواری صلاحیت", craftStory: "آپ کی کہانی", complete: "مکمل کریں" }
};

const CRAFT_TYPES = ['Weaving', 'Pottery', 'Woodwork', 'Metalwork', 'Textile', 'Jewelry', 'Leather', 'Bamboo', 'Other'];

export default function ProfileSetup() {
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language || 'en';
  const local_t = translations[lang] || translations.en;
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    artisan_name: '',
    business_name: '',
    craft_type: 'Weaving',
    craft_category: '',
    location: '',
    cooperative_name: '',
    years_experience: '',
    production_capacity: '',
    craft_story: ''
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [hasProfile, setHasProfile] = useState(false);

  React.useEffect(() => {
    api.get('/artisans/me').then(res => {
      if (res.data) {
        setHasProfile(true);
        setFormData({
          artisan_name: res.data.artisan_name || '',
          business_name: res.data.business_name || '',
          craft_type: res.data.craft_type || 'Weaving',
          craft_category: res.data.craft_category || '',
          location: res.data.location || '',
          cooperative_name: res.data.cooperative_name || '',
          years_experience: res.data.years_experience ? String(res.data.years_experience) : '',
          production_capacity: res.data.production_capacity || '',
          craft_story: res.data.craft_story || ''
        });
      }
    }).catch(() => {
       // Profile might not exist yet, ignore
    });
  }, []);

  const handleNext = () => setStep(s => Math.min(3, s + 1));
  const handleBack = () => setStep(s => Math.max(1, s - 1));

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = { ...formData, years_experience: formData.years_experience ? parseInt(formData.years_experience) : null };
      
      if (hasProfile) {
        await api.put('/artisans/me', payload);
      } else {
        await api.post('/artisans/me', payload);
      }

      if (photo) {
        const formDataObj = new FormData();
        formDataObj.append('file', photo);
        await api.post('/artisans/me/photo', formDataObj, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      navigate('/artisan/profile');
    } catch (error) {
      console.error(error);
      alert('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface p-4 pb-24 font-sans text-on-surface">
      <div className="w-full space-y-6 pt-6 max-w-lg mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center hover:bg-surface-container rounded-full transition-colors text-on-surface">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-on-surface">{t('profile.profile_setup')}</h1>
          </div>
          <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 bg-primary text-on-primary rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50">
            {loading ? 'Saving...' : 'Update'}
          </button>
        </div>

        <div className="bg-surface-container-lowest rounded-[24px] shadow-sm p-6 border border-outline-variant/30">
          
          {/* Progress Bar */}
          <div className="flex justify-between items-center mb-8 relative px-2">
             <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-1.5 bg-surface-container-highest -z-10 rounded-full">
               <div className="h-full bg-primary transition-all duration-300 rounded-full" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
             </div>
             {[1, 2, 3].map(i => (
                <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 shadow-sm border-2 ${step >= i ? 'bg-primary border-primary text-on-primary' : 'bg-surface-container-lowest border-outline-variant/50 text-on-surface-variant'}`}>
                 {i}
               </div>
             ))}
          </div>

          <h2 className="text-2xl font-extrabold text-on-surface mb-6 text-center tracking-tight">
            {step === 1 ? local_t.step1 : step === 2 ? local_t.step2 : local_t.step3}
          </h2>

          <div className="space-y-4">
            {step === 1 && (
              <div className="space-y-4">
                <div className="bg-surface p-4 rounded-2xl border border-outline-variant/50 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">{local_t.artisanName}</label>
                  <input type="text" value={formData.artisan_name} onChange={e => setFormData({...formData, artisan_name: e.target.value})} className="w-full bg-transparent border-0 p-0 text-on-surface font-bold focus:ring-0 placeholder:text-on-surface-variant/50" placeholder={t('profile.ph_name')} />
                </div>
                <div className="bg-surface p-4 rounded-2xl border border-outline-variant/50 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">{local_t.businessName}</label>
                  <input type="text" value={formData.business_name} onChange={e => setFormData({...formData, business_name: e.target.value})} className="w-full bg-transparent border-0 p-0 text-on-surface font-bold focus:ring-0 placeholder:text-on-surface-variant/50" placeholder={t('profile.ph_optional')} />
                </div>
                <div className="bg-surface p-4 rounded-2xl border border-outline-variant/50 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">{local_t.craftType}</label>
                  <select value={formData.craft_type} onChange={e => setFormData({...formData, craft_type: e.target.value})} className="w-full bg-transparent border-0 p-0 text-on-surface font-bold focus:ring-0 outline-none">
                    {CRAFT_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="bg-surface p-4 rounded-2xl border border-outline-variant/50 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">{local_t.craftCategory}</label>
                  <input type="text" value={formData.craft_category} onChange={e => setFormData({...formData, craft_category: e.target.value})} className="w-full bg-transparent border-0 p-0 text-on-surface font-bold focus:ring-0 placeholder:text-on-surface-variant/50" placeholder={t('profile.ph_craft')} />
                </div>
                <div className="bg-surface p-4 rounded-2xl border border-outline-variant/50 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">{local_t.location}</label>
                  <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-transparent border-0 p-0 text-on-surface font-bold focus:ring-0 placeholder:text-on-surface-variant/50" placeholder={t('profile.ph_location')} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="bg-surface p-4 rounded-2xl border border-outline-variant/50 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">{local_t.cooperativeName}</label>
                  <input type="text" value={formData.cooperative_name} onChange={e => setFormData({...formData, cooperative_name: e.target.value})} className="w-full bg-transparent border-0 p-0 text-on-surface font-bold focus:ring-0 placeholder:text-on-surface-variant/50" placeholder={t('profile.ph_optional')} />
                </div>
                <div className="bg-surface p-4 rounded-2xl border border-outline-variant/50 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">{local_t.yearsExp}</label>
                  <input type="number" value={formData.years_experience} onChange={e => setFormData({...formData, years_experience: e.target.value})} className="w-full bg-transparent border-0 p-0 text-on-surface font-bold focus:ring-0 placeholder:text-on-surface-variant/50" placeholder={t('profile.ph_years')} />
                </div>
                <div className="bg-surface p-4 rounded-2xl border border-outline-variant/50 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">{local_t.prodCap}</label>
                  <input type="text" value={formData.production_capacity} onChange={e => setFormData({...formData, production_capacity: e.target.value})} className="w-full bg-transparent border-0 p-0 text-on-surface font-bold focus:ring-0 placeholder:text-on-surface-variant/50" placeholder={t('profile.ph_capacity')} />
                </div>
                <div className="bg-surface p-4 rounded-2xl border border-outline-variant/50 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-colors">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">{local_t.craftStory}</label>
                  <textarea rows={4} value={formData.craft_story} onChange={e => setFormData({...formData, craft_story: e.target.value})} className="w-full bg-transparent border-0 p-0 text-on-surface font-bold focus:ring-0 resize-none outline-none placeholder:text-on-surface-variant/50" placeholder={t('profile.ph_story')} />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col items-center justify-center space-y-8 py-4">
                <div className="relative">
                  <div className="w-40 h-40 bg-surface-container-high rounded-full border-[4px] border-surface shadow-lg overflow-hidden flex items-center justify-center relative">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={48} className="text-on-surface-variant/50" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-primary/90 transition-colors border-2 border-surface">
                    <Upload size={20} />
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />
                  </label>
                </div>
                <p className="text-on-surface-variant text-sm font-semibold text-center px-4">
                  Add a professional photo so buyers can connect with the creator behind the craft.
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-10 pt-6 border-t border-outline-variant/20">
            {step > 1 ? (
              <button onClick={handleBack} className="px-6 py-4 text-on-surface-variant font-bold flex items-center hover:bg-surface-container rounded-2xl transition-colors">
                <ArrowLeft size={20} className="mr-2" /> {local_t.back}
              </button>
            ) : <div className="px-6 py-4"></div>}
            
            {step < 3 ? (
              <button onClick={handleNext} disabled={step === 1 && (!formData.artisan_name || !formData.craft_type || !formData.craft_category || !formData.location)} className="px-8 py-4 bg-primary text-on-primary font-bold flex items-center rounded-[20px] hover:bg-primary/90 transition-colors disabled:opacity-50">
                {local_t.next} <ArrowRight size={20} className="ml-2" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="px-8 py-4 bg-primary text-on-primary font-extrabold flex items-center rounded-[20px] hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-md">
                {loading ? 'Saving...' : <><Check size={20} className="mr-2" strokeWidth={3} /> {local_t.complete}</>}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
