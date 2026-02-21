import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { CheckCircle } from 'lucide-react';
import { Button } from '../../components/UI';
import EmployerStepBasic from '../../components/onboarding/EmployerStepBasic';
import EmployerStepHiring from '../../components/onboarding/EmployerStepHiring';
import EmployerStepLocation from '../../components/onboarding/EmployerStepLocation';
import { useApp } from '../../context/AppContext';

const stepList = ['Basic Details', 'Hiring Preferences', 'Location'];

export default function EmployerOnboarding() {
  const { finalizeAuthSession, user } = useApp();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    employerType: '',
    hiringCategories: [],
    hiringFrequency: '',
    location: '',
    description: '',
  });

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleCategory = (category) => {
    setFormData((prev) => {
      const exists = prev.hiringCategories.includes(category);
      return {
        ...prev,
        hiringCategories: exists
          ? prev.hiringCategories.filter((item) => item !== category)
          : [...prev.hiringCategories, category],
      };
    });
  };

  const validateStep = (index) => {
    if (index === 0) {
      if (!formData.name.trim()) return 'Employer name is required';
      if (!formData.employerType) return 'Employer type is required';
    }
    if (index === 1) {
      if (!formData.hiringCategories.length) return 'Select at least one hiring category';
      if (!formData.hiringFrequency) return 'Job frequency is required';
    }
    if (index === 2) {
      if (!formData.location.trim()) return 'Work location is required';
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

  const handleFinish = async () => {
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
      const response = await fetch('http://localhost:5050/profiles/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: 'employer',
          name: formData.name.trim(),
          location: formData.location.trim(),
          employerDetails: {
            employerType: formData.employerType,
            hiringCategories: formData.hiringCategories,
            hiringFrequency: formData.hiringFrequency,
            description: formData.description.trim(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update employer profile');
      }

      const nextUser = {
        ...(user || {}),
        role: 'employer',
        name: formData.name.trim(),
      };
      finalizeAuthSession(nextUser, '/dashboard');
      toast.success('Employer profile completed');
    } catch (error) {
      console.error('Employer onboarding failed:', error);
      toast.error('Could not save employer profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 p-4 pb-8">
      <div className="mb-4">
        <p className="text-xs text-slate-500">Step {step + 1} of {stepList.length}</p>
        <h1 className="text-2xl font-bold text-slate-900">Employer Onboarding</h1>
      </div>

      <div className="w-full bg-slate-200 h-2 rounded-full mb-5">
        <div
          className="bg-orange-600 h-2 rounded-full transition-all"
          style={{ width: `${((step + 1) / stepList.length) * 100}%` }}
        />
      </div>

      {step === 0 && <EmployerStepBasic formData={formData} onChange={updateField} />}
      {step === 1 && (
        <EmployerStepHiring
          formData={formData}
          onToggleCategory={toggleCategory}
          onChange={updateField}
        />
      )}
      {step === 2 && <EmployerStepLocation formData={formData} onChange={updateField} />}

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
          <Button fullWidth onClick={handleFinish} loading={loading} icon={CheckCircle}>
            Finish
          </Button>
        )}
      </div>
    </div>
  );
}
