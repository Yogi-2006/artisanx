import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paintbrush, ShoppingBag, Headset } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const translations: Record<string, any> = {
  en: {
    artisan: "Artisan", artisanDesc: "Sell your handcrafted products",
    buyer: "Buyer", buyerDesc: "Discover and buy unique crafts",
    facilitator: "Facilitator", facilitatorDesc: "Help artisans onboard and manage"
  },
  ta: {
    artisan: "கைவினைஞர்", artisanDesc: "உங்கள் கைவினைப் பொருட்களை விற்கவும்",
    buyer: "வாங்குபவர்", buyerDesc: "தனித்துவமான பொருட்களை வாங்கவும்",
    facilitator: "ஒருங்கிணைப்பாளர்", facilitatorDesc: "கைவினைஞர்களுக்கு உதவவும்"
  },
  hi: {
    artisan: "कारीगर", artisanDesc: "अपने हस्तशिल्प उत्पाद बेचें",
    buyer: "खरीदार", buyerDesc: "अद्वितीय शिल्प खोजें और खरीदें",
    facilitator: "सुविधादाता", facilitatorDesc: "कारीगरों की मदद करें"
  },
  te: {
    artisan: "చేతివృత్తులవారు", artisanDesc: "మీ చేతిపనులను విక్రయించండి",
    buyer: "కొనుగోలుదారు", buyerDesc: "ప్రత్యేకమైన వస్తువులను కొనుగోలు చేయండి",
    facilitator: "సహాయకుడు", facilitatorDesc: "చేతివృత్తులవారికి సహాయం చేయండి"
  },
  kn: {
    artisan: "ಕುಶಲಕರ್ಮಿ", artisanDesc: "ನಿಮ್ಮ ಕರಕುಶಲ ಉತ್ಪನ್ನಗಳನ್ನು ಮಾರಿ",
    buyer: "ಖರೀದಿದಾರ", buyerDesc: "ವಿಶಿಷ್ಟ ಕರಕುಶಲ ವಸ್ತುಗಳನ್ನು ಖರೀದಿಸಿ",
    facilitator: "ಸಹಾಯಕಾರ", facilitatorDesc: "ಕುಶಲಕರ್ಮಿಗಳಿಗೆ ಸಹಾಯ ಮಾಡಿ"
  },
  ml: {
    artisan: "കരകൗശലവിദഗ്ദ്ധൻ", artisanDesc: "നിങ്ങളുടെ കരകൗശല ഉൽപ്പന്നങ്ങൾ വിൽക്കുക",
    buyer: "വാങ്ങുന്നയാൾ", buyerDesc: "അതുല്യമായ കരകൗശല വസ്തുക്കൾ വാങ്ങുക",
    facilitator: "സഹായി", facilitatorDesc: "കരകൗശലവിദഗ്ദ്ധരെ സഹായിക്കുക"
  },
  bn: {
    artisan: "কারিগর", artisanDesc: "আপনার হস্তশিল্প বিক্রি করুন",
    buyer: "ক্রেতা", buyerDesc: "অনন্য হস্তশিল্প কিনুন",
    facilitator: "সহায়তাকারী", facilitatorDesc: "কারিগরদের সাহায্য করুন"
  },
  mr: {
    artisan: "कारागीर", artisanDesc: "तुमची हस्तकला उत्पादने विका",
    buyer: "खरेदीदार", buyerDesc: "अद्वितीय हस्तकला खरेदी करा",
    facilitator: "सुविधा देणारा", facilitatorDesc: "कारागिरांना मदत करा"
  },
  ur: {
    artisan: "کاریگر", artisanDesc: "اپنی دستکاری کی مصنوعات بیچیں",
    buyer: "خریدار", buyerDesc: "منفرد دستکاری خریدیں",
    facilitator: "سہولت کار", facilitatorDesc: "کاریگروں کی مدد کریں"
  }
};

interface RoleSelectProps {
  lang: string;
}

const RoleSelect: React.FC<RoleSelectProps> = ({ lang }) => {
  const { setRole, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'artisan' | 'buyer' | 'facilitator' | null>(null);

  const t = translations[lang] || translations.en;

  const handleRoleSelect = async (role: 'artisan' | 'buyer' | 'facilitator') => {
    setSelectedRole(role);
    await setRole(role);
    navigate(`/${role}`);
  };

  return (
    <div className="w-full space-y-5">
      <h2 className="text-3xl font-extrabold text-center text-brand-dark mb-8 tracking-tight">Choose your role</h2>
      
      <button 
        onClick={() => handleRoleSelect('artisan')}
        disabled={isLoading}
        className={`w-full flex items-center p-5 rounded-[28px] border-2 transition-all duration-300 
          ${selectedRole === 'artisan' ? 'border-brand-neon bg-white shadow-[0_8px_30px_rgba(204,255,0,0.2)]' : 'border-transparent bg-white hover:border-stone-200 shadow-sm'}`}
      >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-5 transition-colors ${selectedRole === 'artisan' ? 'bg-brand-neon text-brand-dark' : 'bg-brand-bg text-stone-500'}`}>
          <Paintbrush size={28} />
        </div>
        <div className="text-left flex-1">
          <h3 className="font-bold text-xl text-brand-dark">{t.artisan}</h3>
          <p className="text-stone-500 text-sm mt-0.5">{t.artisanDesc}</p>
        </div>
      </button>

      <button 
        onClick={() => handleRoleSelect('buyer')}
        disabled={isLoading}
        className={`w-full flex items-center p-5 rounded-[28px] border-2 transition-all duration-300 
          ${selectedRole === 'buyer' ? 'border-brand-neon bg-white shadow-[0_8px_30px_rgba(204,255,0,0.2)]' : 'border-transparent bg-white hover:border-stone-200 shadow-sm'}`}
      >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-5 transition-colors ${selectedRole === 'buyer' ? 'bg-brand-neon text-brand-dark' : 'bg-brand-bg text-stone-500'}`}>
          <ShoppingBag size={28} />
        </div>
        <div className="text-left flex-1">
          <h3 className="font-bold text-xl text-brand-dark">{t.buyer}</h3>
          <p className="text-stone-500 text-sm mt-0.5">{t.buyerDesc}</p>
        </div>
      </button>

      <button 
        onClick={() => handleRoleSelect('facilitator')}
        disabled={isLoading}
        className={`w-full flex items-center p-5 rounded-[28px] border-2 transition-all duration-300 
          ${selectedRole === 'facilitator' ? 'border-brand-neon bg-white shadow-[0_8px_30px_rgba(204,255,0,0.2)]' : 'border-transparent bg-white hover:border-stone-200 shadow-sm'}`}
      >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-5 transition-colors ${selectedRole === 'facilitator' ? 'bg-brand-neon text-brand-dark' : 'bg-brand-bg text-stone-500'}`}>
          <Headset size={28} />
        </div>
        <div className="text-left flex-1">
          <h3 className="font-bold text-xl text-brand-dark">{t.facilitator}</h3>
          <p className="text-stone-500 text-sm mt-0.5">{t.facilitatorDesc}</p>
        </div>
      </button>
    </div>
  );
};

export default RoleSelect;
