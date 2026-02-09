import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Mic, CheckCircle, Sprout, Trees, ScanLine } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { TEXTS, SKILL_CATEGORIES } from '../constants/data';
import { Button } from '../components/UI';

const speak = (text, lang) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'en' ? 'en-IN' : 'hi-IN';
    window.speechSynthesis.speak(utterance);
  }
};

export default function Onboarding({ lang }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ name: '', skill: '', exp: 'junior', rate: 500, aadhaarImage: null });
  const [recording, setRecording] = useState(false);
  const t = TEXTS[lang];

  useEffect(() => {
    if (step === 4) speak(t.voice_bio, lang);
  }, [step, lang]);

  const handleFinish = () => {
    // Save profile data to local storage (or Firebase later)
    const currentUser = JSON.parse(localStorage.getItem('kaamsetu_user'));
    localStorage.setItem('kaamsetu_user', JSON.stringify({ ...currentUser, ...data, verified: true }));
    toast.success('Profile Created!');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col font-sans">
      <div className="w-full bg-slate-100 h-2 rounded-full mb-6">
        <div className="bg-orange-600 h-2 rounded-full transition-all duration-500" style={{ width: `${step * 25}%` }}></div>
      </div>

      {/* STEP 1: AADHAAR */}
      {step === 1 && (
        <div className="text-center flex-1 flex flex-col items-center justify-center animate-slide-up">
          <h2 className="text-xl font-bold mb-2">{t.step_aadhaar}</h2>
          <div className="w-64 h-40 border-4 border-dashed border-slate-300 rounded-xl bg-slate-50 flex items-center justify-center mb-6 relative overflow-hidden">
            {data.aadhaarImage ? <img src={data.aadhaarImage} className="w-full h-full object-cover" /> : <ScanLine size={48} className="text-slate-400 animate-pulse" />}
          </div>
          <div className="relative w-full">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="absolute inset-0 opacity-0 z-20 cursor-pointer"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setData({ ...data, aadhaarImage: URL.createObjectURL(file) });
                  toast.success('ID Verified!');
                  setTimeout(() => setStep(2), 1500);
                }
              }}
            />
            <Button icon={Camera} fullWidth>
              {data.aadhaarImage ? 'Retake' : 'Open Camera'}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: SKILLS */}
      {step === 2 && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-bold mb-6 text-center">{t.step_skills}</h2>
          <div className="grid grid-cols-2 gap-4">
            {SKILL_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                onClick={() => {
                  setData({ ...data, skill: cat.label });
                  setStep(3);
                }}
                className={`p-6 rounded-2xl flex flex-col items-center justify-center gap-3 border-2 cursor-pointer ${cat.color} border-transparent hover:border-orange-500`}
              >
                <cat.icon size={32} />
                <span className="font-bold text-sm text-center">{cat.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: EXPERIENCE */}
      {step === 3 && (
        <div className="animate-slide-up flex-1 flex flex-col justify-center">
          <h2 className="text-xl font-bold mb-6 text-center">{t.step_exp}</h2>
          <div className="flex gap-4 mb-8">
            <div
              onClick={() => setData({ ...data, exp: 'junior' })}
              className={`flex-1 p-4 border-2 rounded-xl cursor-pointer ${
                data.exp === 'junior' ? 'border-orange-500 bg-orange-50' : 'border-slate-200'
              }`}
            >
              <Sprout className="mx-auto mb-2 text-green-600" />
              <div className="text-center font-bold text-sm">Junior</div>
            </div>
            <div
              onClick={() => setData({ ...data, exp: 'senior' })}
              className={`flex-1 p-4 border-2 rounded-xl cursor-pointer ${
                data.exp === 'senior' ? 'border-orange-500 bg-orange-50' : 'border-slate-200'
              }`}
            >
              <Trees className="mx-auto mb-2 text-green-800" />
              <div className="text-center font-bold text-sm">Ustaad</div>
            </div>
          </div>
          <input
            type="range"
            min="300"
            max="2000"
            step="50"
            value={data.rate}
            onChange={(e) => setData({ ...data, rate: e.target.value })}
            className="w-full accent-orange-600"
          />
          <p className="text-center font-bold mt-2">₹{data.rate}/day</p>
          <Button className="mt-8" onClick={() => setStep(4)} fullWidth>
            Confirm
          </Button>
        </div>
      )}

      {/* STEP 4: VOICE */}
      {step === 4 && (
        <div className="text-center flex-1 flex flex-col items-center justify-center animate-slide-up">
          <h2 className="text-xl font-bold mb-2">{t.step_voice}</h2>
          <button
            onClick={() => {
              setRecording(true);
              setTimeout(() => setRecording(false), 3000);
            }}
            className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all ${
              recording ? 'bg-red-500 scale-110 animate-pulse' : 'bg-orange-600'
            }`}
          >
            <Mic size={48} className="text-white" />
          </button>
          {!recording && (
            <Button className="mt-12" fullWidth onClick={handleFinish} variant="whatsapp">
              {t.finish} <CheckCircle size={18} />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

