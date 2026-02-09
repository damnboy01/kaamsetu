// src/components/UI.jsx
import React from 'react';
import { Loader2, X } from 'lucide-react';

export const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  className = '',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon: Icon,
}) => {
  const baseStyle =
    'px-4 py-3 rounded-lg font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 text-sm';
  const variants = {
    primary: 'bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-200 disabled:bg-slate-300',
    secondary: 'bg-slate-900 text-white hover:bg-slate-950',
    outline: 'border-2 border-orange-600 text-orange-600 hover:bg-orange-50',
    whatsapp: 'bg-green-600 text-white hover:bg-green-700 shadow-green-200',
    danger: 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
    subtle: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading && <Loader2 className="animate-spin" size={18} />}
      {!loading && Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

export const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${className}`}>{children}</div>
);

export const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};