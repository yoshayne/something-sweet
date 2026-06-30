interface FormTextareaProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}

export default function FormTextarea({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
  required,
}: FormTextareaProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-[11px] font-medium tracking-[0.1em] uppercase text-charcoal mb-2"
      >
        {label}
        {required && <span className="text-gold-deep ml-0.5">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className="w-full px-4 py-3 bg-off-white border border-light-gray text-sm text-black placeholder:text-gray-light focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors resize-none"
      />
    </div>
  );
}
