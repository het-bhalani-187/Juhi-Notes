import React from 'react';

// --- Avatar ---
export const Avatar = ({ url, name, size = 'md', className = '' }: { url: string; name: string; size?: 'sm' | 'md' | 'lg', className?: string }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  return (
    <img
      src={url}
      alt={name}
      title={name}
      className={`rounded-full object-cover border border-white shadow-sm ${sizeClasses[size]} ${className}`}
    />
  );
};

// --- Button ---
// Use ButtonHTMLAttributes to ensure all standard button props (onClick, className, children) are available.
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: React.ReactNode;
}

export const Button = ({ children, variant = 'primary', className = '', icon, ...props }: ButtonProps) => {
  const baseStyle = "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1";
  
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus:ring-slate-200 shadow-sm",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-200",
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </button>
  );
};

// --- Input ---
export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-slate-400"
    {...props}
  />
);

// --- Modal ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 18 18"/></svg>
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- Tooltip ---
export const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => (
  <div className="group relative flex">
    {children}
    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
      {text}
    </span>
  </div>
);