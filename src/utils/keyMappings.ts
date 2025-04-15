export interface KeyMapping {
  code: string;
  key: string;
  displayKey: string;
}

// Mapping of common key codes to their display values
export const keyMappings: KeyMapping[] = [
  // Numbers
  { code: 'Digit1', key: '1', displayKey: '1' },
  { code: 'Digit2', key: '2', displayKey: '2' },
  { code: 'Digit3', key: '3', displayKey: '3' },
  { code: 'Digit4', key: '4', displayKey: '4' },
  { code: 'Digit5', key: '5', displayKey: '5' },
  { code: 'Digit6', key: '6', displayKey: '6' },
  { code: 'Digit7', key: '7', displayKey: '7' },
  { code: 'Digit8', key: '8', displayKey: '8' },
  { code: 'Digit9', key: '9', displayKey: '9' },
  { code: 'Digit0', key: '0', displayKey: '0' },

  // Letters
  { code: 'KeyQ', key: 'q', displayKey: 'Q' },
  { code: 'KeyW', key: 'w', displayKey: 'W' },
  { code: 'KeyE', key: 'e', displayKey: 'E' },
  { code: 'KeyR', key: 'r', displayKey: 'R' },
  { code: 'KeyT', key: 't', displayKey: 'T' },
  { code: 'KeyY', key: 'y', displayKey: 'Y' },
  { code: 'KeyU', key: 'u', displayKey: 'U' },
  { code: 'KeyI', key: 'i', displayKey: 'I' },
  { code: 'KeyO', key: 'o', displayKey: 'O' },
  { code: 'KeyP', key: 'p', displayKey: 'P' },
  { code: 'KeyA', key: 'a', displayKey: 'A' },
  { code: 'KeyS', key: 's', displayKey: 'S' },
  { code: 'KeyD', key: 'd', displayKey: 'D' },
  { code: 'KeyF', key: 'f', displayKey: 'F' },
  { code: 'KeyG', key: 'g', displayKey: 'G' },
  { code: 'KeyH', key: 'h', displayKey: 'H' },
  { code: 'KeyJ', key: 'j', displayKey: 'J' },
  { code: 'KeyK', key: 'k', displayKey: 'K' },
  { code: 'KeyL', key: 'l', displayKey: 'L' },
  { code: 'KeyZ', key: 'z', displayKey: 'Z' },
  { code: 'KeyX', key: 'x', displayKey: 'X' },
  { code: 'KeyC', key: 'c', displayKey: 'C' },
  { code: 'KeyV', key: 'v', displayKey: 'V' },
  { code: 'KeyB', key: 'b', displayKey: 'B' },
  { code: 'KeyN', key: 'n', displayKey: 'N' },
  { code: 'KeyM', key: 'm', displayKey: 'M' },

  // Special characters
  { code: 'Comma', key: ',', displayKey: ',' },
  { code: 'Period', key: '.', displayKey: '.' },
  { code: 'Slash', key: '/', displayKey: '/' },
  { code: 'Semicolon', key: ';', displayKey: ';' },
];

// Create optimized lookup maps
const keyMappingsByCode = new Map(keyMappings.map(mapping => [mapping.code, mapping]));
const keyMappingsByKey = new Map(keyMappings.map(mapping => [mapping.key, mapping]));

// Helper function to get key mapping by code
export const getKeyMappingByCode = (code: string): KeyMapping | undefined => {
  return keyMappingsByCode.get(code);
};

// Helper function to get key mapping by key
export const getKeyMappingByKey = (key: string): KeyMapping | undefined => {
  return keyMappingsByKey.get(key.toLowerCase());
};

// Helper function to get display key by code
export const getDisplayKeyByCode = (code: string): string | undefined => {
  return keyMappingsByCode.get(code)?.displayKey;
};

// Helper function to get code by key
export const getCodeByKey = (key: string): string | undefined => {
  return keyMappingsByKey.get(key.toLowerCase())?.code;
}; 