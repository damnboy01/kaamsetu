import { BrickWall, Hammer, Paintbrush, Lightbulb, Package } from 'lucide-react';

export const TEXTS = {
  en: {
    login_title: "KaamSetu",
    login_sub: "Find work or hire workers",
    worker: "Daily Worker",
    employer: "Employer",
    login_btn: "Login / Sign Up",
    voice_aadhaar: "Apna Aadhaar card camera ke samne rakhein",
    voice_bio: "Boliye aap kya kaam karte hain",
    step_aadhaar: "Scan Identity",
    step_skills: "Select Work",
    step_exp: "Experience & Pay",
    step_voice: "Voice Profile",
    finish: "Finish Profile",
    live_jobs: "Live Jobs Nearby",
    apply: "Apply on WhatsApp"
  },
  hi: {
    login_title: "कामसेतु",
    login_sub: "काम ढूँढें या मज़दूर रखें",
    worker: "मज़दूर (Worker)",
    employer: "मालिक (Employer)",
    login_btn: "लॉगिन करें",
    voice_aadhaar: "अपना आधार कार्ड कैमरा के सामने रखें",
    voice_bio: "बोलिये आप क्या काम करते हैं",
    step_aadhaar: "पहचान पत्र",
    step_skills: "काम चुनें",
    step_exp: "अनुभव और पैसा",
    step_voice: "आवाज़ रिकॉर्ड करें",
    finish: "प्रोफाइल बनाएं",
    live_jobs: "आस-पास का काम",
    apply: "WhatsApp पर बात करें"
  }
};

export const SKILL_CATEGORIES = [
  { id: 'mason', label: 'Mistri (Mason)', icon: BrickWall, color: 'bg-red-100 text-red-600' },
  { id: 'carpenter', label: 'Carpenter', icon: Hammer, color: 'bg-amber-100 text-amber-600' },
  { id: 'painter', label: 'Painter', icon: Paintbrush, color: 'bg-blue-100 text-blue-600' },
  { id: 'electrician', label: 'Electrician', icon: Lightbulb, color: 'bg-yellow-100 text-yellow-600' },
  { id: 'helper', label: 'Helper/Labor', icon: Package, color: 'bg-slate-100 text-slate-600' },
];