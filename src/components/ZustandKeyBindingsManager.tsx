import { FC } from 'react';
import { useZustandKeyBindings } from '../hooks/useZustandKeyBindings';

/**
 * This component doesn't render anything - it just initializes
 * and manages the key bindings using Zustand.
 * It should be included once in your app.
 */
export const ZustandKeyBindingsManager: FC = () => {
  // Initialize key bindings
  useZustandKeyBindings();
  
  return null;
}; 