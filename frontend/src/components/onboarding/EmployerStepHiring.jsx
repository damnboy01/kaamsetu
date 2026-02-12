import React from 'react';
import { Card } from '../UI';

const HIRING_CATEGORIES = ['Mason', 'Painter', 'Electrician', 'Plumber', 'Helper'];
const HIRING_FREQUENCIES = ['One-time', 'Weekly', 'Monthly', 'Regular hiring'];

export default function EmployerStepHiring({ formData, onToggleCategory, onChange }) {
  return (
    <Card className="p-5 space-y-4">
      <div>
        <label className="text-xs text-slate-500">Hiring Categories *</label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {HIRING_CATEGORIES.map((category) => {
            const active = formData.hiringCategories.includes(category);
            return (
              <button
                key={category}
                type="button"
                onClick={() => onToggleCategory(category)}
                className={`p-3 rounded-xl border text-sm font-semibold text-left transition-all ${
                  active
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-slate-200 text-slate-700 hover:border-orange-300'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-xs text-slate-500">Job Frequency *</label>
        <select
          className="w-full border rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
          value={formData.hiringFrequency}
          onChange={(e) => onChange('hiringFrequency', e.target.value)}
        >
          <option value="">Select job frequency</option>
          {HIRING_FREQUENCIES.map((frequency) => (
            <option key={frequency} value={frequency}>
              {frequency}
            </option>
          ))}
        </select>
      </div>
    </Card>
  );
}
