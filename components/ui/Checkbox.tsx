
import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, ...props }) => {
  return (
    <label className="relative flex items-center justify-center w-8 h-8 cursor-pointer">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={onChange}
        {...props}
      />
      <div
        className={`w-7 h-7 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
          checked
            ? 'bg-apple-blue border-apple-blue'
            : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
        }`}
      >
        {checked && <Check size={20} className="text-white" />}
      </div>
    </label>
  );
};

export default Checkbox;
