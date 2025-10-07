import { type LabelHTMLAttributes, type ReactNode } from 'react';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
  required?: boolean;
  icon?: ReactNode;
}

export default function Label({ 
  children, 
  required = false, 
  icon,
  className = '',
  ...props 
}: LabelProps) {
  return (
    <label 
      className={`flex items-center text-sm font-medium text-gray-700 mb-1 ${className}`}
      {...props}
    >
      {icon && <span className="inline-flex items-center mr-1.5">{icon}</span>}
      <span className="inline-flex items-center">
        {children}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
    </label>
  );
}

