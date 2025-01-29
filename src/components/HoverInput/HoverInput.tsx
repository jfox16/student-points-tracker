
import cns from 'classnames';
import React, { useCallback } from 'react';

import './HoverInput.css';


export interface HoverInputProps {
  className?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>; // Overrides other values
  onChange?: (text: string) => void;
  onFocus?: () => void;
  placeholder?: string;
  value?: number|string;
}

export const HoverInput = (props: HoverInputProps) => {

  const {
    className,
    inputProps = {},
    onChange,
    onFocus,
    placeholder,
    value,
  } = props;

  const handleFocus = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.select() // select all text on focus
    onFocus?.();
  }, [
    onFocus
  ]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  }, [
    onChange,
  ]);

  
  return (
    <input
      className={cns('HoverInput', props.className, className )}
      onChange={handleChange}
      onFocus={handleFocus}
      value={value}
      placeholder={placeholder}
      {...inputProps}
    />
  );
}
