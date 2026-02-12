import React from 'react';
import { Card } from '../UI';

export default function EmployerStepLocation({ formData, onChange }) {
  return (
    <Card className="p-5 space-y-4">
      <div>
        <label className="text-xs text-slate-500">Work Location *</label>
        <input
          className="w-full border rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Saket, Delhi"
          value={formData.location}
          onChange={(e) => onChange('location', e.target.value)}
        />
      </div>

      <div>
        <label className="text-xs text-slate-500">Description (Optional)</label>
        <textarea
          rows={4}
          className="w-full border rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
          placeholder="Share site details, shift timing, and worker requirements."
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
        />
      </div>
    </Card>
  );
}
