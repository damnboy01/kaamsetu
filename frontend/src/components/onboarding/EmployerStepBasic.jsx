import React from 'react';
import { Card } from '../UI';

const EMPLOYER_TYPES = ['Individual', 'Contractor', 'Builder', 'Business'];

export default function EmployerStepBasic({ formData, onChange }) {
  return (
    <Card className="p-5 space-y-4">
      <div>
        <label className="text-xs text-slate-500">Employer Name *</label>
        <input
          className="w-full border rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Amit Enterprises"
          value={formData.name}
          onChange={(e) => onChange('name', e.target.value)}
        />
      </div>

      <div>
        <label className="text-xs text-slate-500">Employer Type *</label>
        <select
          className="w-full border rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
          value={formData.employerType}
          onChange={(e) => onChange('employerType', e.target.value)}
        >
          <option value="">Select employer type</option>
          {EMPLOYER_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
    </Card>
  );
}
