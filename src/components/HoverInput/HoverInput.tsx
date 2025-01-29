
import cns from 'classnames';
import React from 'react';
import './HoverInput.css';


interface HoverInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  
}

export const HoverInput = (props: HoverInputProps) => {
  
  return (
    <input
      onFocus={(e) => e.target.select()}
      {...props}
      className={cns('HoverInput', props.className)}
    />
  );
}
