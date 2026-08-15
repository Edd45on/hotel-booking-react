import { useState, forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

type DatePickerInputProps = {
  label: string;
  selected: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  placeholder?: string;
};

// Custom trigger button to make it look like your standard form inputs
const CustomInput = forwardRef<HTMLButtonElement, { value?: string; onClick?: () => void }>(
  ({ value, onClick }, ref) => (
    <button
      onClick={onClick}
      ref={ref}
      className="w-full text-left p-3 border border-[#E2E8F0] rounded-xl bg-white text-[#0F172A] focus:outline-none focus:border-[#E11D48] focus:ring-2 focus:ring-[#E11D48]/20 transition"
    >
      {value || 'Select date'}
    </button>
  )
);
CustomInput.displayName = 'CustomInput';

export default function DatePickerInput({ 
  label, 
  selected, 
  onChange, 
  minDate, 
  placeholder 
}: DatePickerInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-[#64748B]">{label}</label>
      <DatePicker
        selected={selected}
        onChange={onChange}
        minDate={minDate}
        placeholderText={placeholder}
        customInput={<CustomInput />}
        dateFormat="MMMM d, yyyy"
        // 🟢 Styles to match your red theme
        popperClassName="!z-50"
        dayClassName={(date) => 
          date.getDay() === 0 || date.getDay() === 6 
            ? '!text-[#E11D48]' 
            : '!text-[#0F172A]'
        }
      />
    </div>
  );
}