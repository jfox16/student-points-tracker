import React, { useEffect, useRef, useState } from 'react';
import { cnsMerge } from '../../utils/cnsMerge';

interface TooltipProps {
  children: React.ReactNode;
  text: string;
  className?: string;
  placement?: 'left' | 'right' | 'top' | 'bottom';
}

export const Tooltip: React.FC<TooltipProps> = ({ children, text, className, placement = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      let top = 0;
      let left = 0;
      
      switch (placement) {
        case 'top':
          top = triggerRect.top - tooltipRect.height - 8;
          left = triggerRect.left + (triggerRect.width / 2);
          break;
        case 'bottom':
          top = triggerRect.bottom + 8;
          left = triggerRect.left + (triggerRect.width / 2);
          break;
        case 'left':
          top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
          left = triggerRect.left - tooltipRect.width - 8;
          break;
        case 'right':
          top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
          left = triggerRect.right + 8;
          break;
      }
      
      setPosition({ top, left });
    }
  }, [isVisible, placement]);

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
            placement === 'top' || placement === 'bottom' ? "transform -translate-x-1/2" : "",
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
            className={cnsMerge(
              "absolute w-2 h-2 bg-gray-900 transform rotate-45",
              placement === 'top' && "bottom-[-4px] left-1/2 -translate-x-1/2",
              placement === 'bottom' && "top-[-4px] left-1/2 -translate-x-1/2",
              placement === 'left' && "right-[-4px] top-1/2 -translate-y-1/2",
              placement === 'right' && "left-[-4px] top-1/2 -translate-y-1/2"
            )}
          />
        </div>
      )}
    </div>
  );
}; 