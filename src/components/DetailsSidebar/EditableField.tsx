import { useId } from "react";

interface EditableFieldProps {
  label: string;
  value: string | number;
  type?: "text" | "number";
  min?: number;
  step?: number;
  onChange: (value: string) => void;
}

export const EditableField = ({
  label,
  value,
  type = "text",
  min,
  step,
  onChange,
}: EditableFieldProps) => {
  const inputId = useId();

  return (
    <label className="EditableField" htmlFor={inputId}>
      <span className="EditableField__label">{label}</span>
      <input
        className="EditableField__input"
        id={inputId}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        step={step}
        type={type}
        value={value}
      />
    </label>
  );
};
