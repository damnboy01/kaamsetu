import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import { TEXTS } from '../data';
import { Button } from '../components/UI';

export default function Login({ lang, setLang }) {
  const navigate = useNavigate();
  const t = TEXTS[lang];

  const handleLogin = (e) => {
    e.preventDefault();
    const role = e.target.role.value;
    const phone = e.target.phone.value;

    // Save User & Redirect
    const userData = { phone, role };
    localStorage.setItem('kaamsetu_user', JSON.stringify(userData));

    // Logic: Workers go to Onboarding first, Employers go straight to Dashboard
    if (role === 'worker') {
      navigate('/onboarding');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative">
      <button
        onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
        className="absolute top-6 right-6 text-white text-xs border border-white/30 px-3 py-1 rounded-full"
      >
        {lang === 'en' ? 'हिंदी' : 'English'}
      </button>

      <div className="bg-white w-full max-w-sm rounded-3xl p-8 animate-slide-up">
        <h1 className="text-2xl font-bold text-center mb-6">{t.login_title}</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <label className="flex-1 cursor-pointer">
              <input type="radio" name="role" value="worker" defaultChecked className="hidden peer" />
              <span className="block text-center py-2 rounded-lg text-slate-500 font-bold peer-checked:bg-white peer-checked:text-orange-600 peer-checked:shadow-sm">
                {t.worker}
              </span>
            </label>
            <label className="flex-1 cursor-pointer">
              <input type="radio" name="role" value="employer" className="hidden peer" />
              <span className="block text-center py-2 rounded-lg text-slate-500 font-bold peer-checked:bg-white peer-checked:text-slate-900 peer-checked:shadow-sm">
                {t.employer}
              </span>
            </label>
          </div>
          <input name="phone" type="tel" placeholder="Phone Number" className="w-full p-3 border rounded-xl font-bold text-lg outline-none" required />
          <Button fullWidth>{t.login_btn}</Button>
        </form>
      </div>
    </div>
  );
}

