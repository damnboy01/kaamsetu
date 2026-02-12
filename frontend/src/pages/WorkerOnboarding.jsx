import React, { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { CheckCircle } from 'lucide-react';
import { Button, Card } from '../components/UI';
import { SKILL_CATEGORIES } from '../constants/data';

const stepList = ['Basic Details', 'Work Details', 'Profile'];

const StepBasicDetails = ({ formData, onChange }) => (
  <Card className="p-5 space-y-4">
    <div>
      <label className="text-xs text-slate-500">Full Name *</label>
      <input
        className="w-full border rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        placeholder="Ramesh Kumar"
        value={formData.name}
        onChange={(e) => onChange('name', e.target.value)}
      />
    </div>
    <div>
      <label className="text-xs text-slate-500">Phone Number</label>
      <input
        className="w-full border rounded-xl px-4 py-3 mt-1 bg-slate-50 text-slate-500"
        value={formData.phone}
        readOnly
      />
    </div>
    <div>
      <label className="text-xs text-slate-500">Location *</label>
      <input
        className="w-full border rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        placeholder="Saket, Delhi"
        value={formData.location}
        onChange={(e) => onChange('location', e.target.value)}
      />
    </div>
  </Card>
);

const StepWorkDetails = ({ formData, onChange }) => (
  <Card className="p-5 space-y-4">
    <div>
      <label className="text-xs text-slate-500">Primary Skill *</label>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {SKILL_CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onChange('skill', category.id)}
            className={`p-3 rounded-xl border text-sm font-semibold text-left transition-all ${
              formData.skill === category.id
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-slate-200 text-slate-700 hover:border-orange-300'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>

    <div>
      <label className="text-xs text-slate-500">Experience *</label>
      <div className="flex gap-2 mt-2">
        {['junior', 'mid', 'senior'].map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onChange('experience', level)}
            className={`flex-1 p-3 rounded-xl border text-sm font-semibold capitalize ${
              formData.experience === level
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-slate-200 text-slate-700 hover:border-orange-300'
            }`}
          >
            {level}
          </button>
        ))}
      </div>
    </div>

    <div>
      <label className="text-xs text-slate-500">Daily Rate (INR) *</label>
      <input
        type="number"
        min="100"
        className="w-full border rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        placeholder="700"
        value={formData.dailyRate}
        onChange={(e) => onChange('dailyRate', e.target.value)}
      />
    </div>
  </Card>
);

const StepProfile = ({ formData, onChange }) => (
  <Card className="p-5 space-y-4">
    <div>
      <label className="text-xs text-slate-500">Bio *</label>
      <textarea
        rows={4}
        className="w-full border rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
        placeholder="Tell employers about your work."
        value={formData.bio}
        onChange={(e) => onChange('bio', e.target.value)}
      />
    </div>
    <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
      <p className="text-xs text-slate-500 mb-1">Preview</p>
      <p className="font-semibold text-slate-900">{formData.name || '-'}</p>
      <p className="text-sm text-slate-600">{formData.location || '-'}</p>
      <p className="text-sm text-slate-600 mt-1">
        {formData.skill || '-'} • {formData.experience || '-'} • ₹{formData.dailyRate || '-'}
      </p>
    </div>
  </Card>
);

export default function WorkerOnboarding({ onSuccess }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const savedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('kaamsetu_user') || '{}');
    } catch {
      return {};
    }
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    phone: savedUser?.phone || '',
    location: '',
    skill: '',
    experience: '',
    dailyRate: '',
    bio: '',
  });

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const validateStep = (index) => {
    if (index === 0) {
      if (!formData.name.trim()) return 'Name is required';
      if (!formData.location.trim()) return 'Location is required';
    }
    if (index === 1) {
      if (!formData.skill) return 'Skill is required';
      if (!formData.experience) return 'Experience is required';
      if (!formData.dailyRate || Number(formData.dailyRate) <= 0) return 'Valid daily rate is required';
    }
    if (index === 2) {
      if (!formData.bio.trim()) return 'Bio is required';
    }
    return null;
  };

  const handleNext = () => {
    const error = validateStep(step);
    if (error) {
      toast.error(error);
      return;
    }
    setStep((prev) => Math.min(prev + 1, stepList.length - 1));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    const error = validateStep(step);
    if (error) {
      toast.error(error);
      return;
    }

    const token = localStorage.getItem('kaamsetu_token');
    if (!token) {
      toast.error('Session missing. Please login again.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/profiles/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: 'worker',
          name: formData.name.trim(),
          location: formData.location.trim(),
          workerDetails: {
            skill: formData.skill,
            experience: formData.experience,
            dailyRate: Number(formData.dailyRate),
            bio: formData.bio.trim(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      toast.success('Profile completed');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Onboarding update failed:', error);
      toast.error('Could not save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 p-4 pb-8">
      <div className="mb-4">
        <p className="text-xs text-slate-500">Step {step + 1} of {stepList.length}</p>
        <h1 className="text-2xl font-bold text-slate-900">Worker Onboarding</h1>
      </div>

      <div className="w-full bg-slate-200 h-2 rounded-full mb-5">
        <div
          className="bg-orange-600 h-2 rounded-full transition-all"
          style={{ width: `${((step + 1) / stepList.length) * 100}%` }}
        />
      </div>

      {step === 0 && <StepBasicDetails formData={formData} onChange={updateField} />}
      {step === 1 && <StepWorkDetails formData={formData} onChange={updateField} />}
      {step === 2 && <StepProfile formData={formData} onChange={updateField} />}

      <div className="flex gap-3 mt-5">
        <Button
          variant="ghost"
          fullWidth
          onClick={handleBack}
          disabled={step === 0 || loading}
        >
          Back
        </Button>
        {step < stepList.length - 1 ? (
          <Button fullWidth onClick={handleNext} disabled={loading}>
            Next
          </Button>
        ) : (
          <Button
            fullWidth
            onClick={handleSubmit}
            loading={loading}
            icon={CheckCircle}
          >
            Finish
          </Button>
        )}
      </div>
    </div>
  );
}
