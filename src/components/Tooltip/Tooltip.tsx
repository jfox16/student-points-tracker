import React, { useEffect, useRef, useState } from 'react';
import { cnsMerge } from '../../utils/cnsMerge';

interface TooltipProps {
  children: React.ReactNode;
  text: string;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ children, text, className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      setPosition({
        top: triggerRect.top - tooltipRect.height - 8,
        left: triggerRect.left + (triggerRect.width / 2)
      });
    }
  }, [isVisible]);

  return (
    <div
      ref={triggerRef}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      className="relative"
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={cnsMerge(
            "absolute px-2 py-1 text-sm text-white bg-gray-900 rounded shadow-lg",
            "whitespace-nowrap",
            "transform -translate-x-1/2",
            "z-50",
            className
          )}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          {text}
          <div
            className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -translate-x-1/2"
            style={{
              top: `${position.top - 4}px`,
              left: `${position.left}px`,
            }}
          />
        </div>
      )}
    </div>
  );
}; 