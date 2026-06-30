interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}

export default function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
}: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-[11px] font-medium tracking-[0.1em] uppercase text-charcoal mb-2"
      >
        {label}
        {required && <span className="text-gold-deep ml-0.5">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 bg-off-white border border-light-gray text-sm text-black placeholder:text-gray-light focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
      />
    </div>
  );
}
