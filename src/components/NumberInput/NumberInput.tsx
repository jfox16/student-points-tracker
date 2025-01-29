import { useCallback, useMemo } from "react";
import { HoverInput, HoverInputProps } from "../HoverInput/HoverInput"

interface NumberInputProps {
  className?: string;
  value?: number;
  onChange?: (value: number) => void;
  inputProps?: HoverInputProps["inputProps"];
}

export const NumberInput = (props: NumberInputProps) => {

  const {
    className,
    value = 0,
    onChange,
    inputProps, 
  } = props;

  const inputValue = useMemo(() => {
    return value.toString();
  }, [
    value
  ]);

  const handleInputChange = useCallback((text: string) => {
    const number = Number(text);
    if (typeof number === 'number' && number % 1 === 0 && number >= 0) {
      onChange?.(number);
    }
  }, [
    onChange,
  ])

  return (
    <HoverInput
      className={className}
      value={inputValue}
      onChange={handleInputChange}
      inputProps={inputProps}
    />
  )
}
