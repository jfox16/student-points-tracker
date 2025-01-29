
import { v4 as uuidv4 } from 'uuid';

export const generateUuid = (): string => {
  const id = uuidv4();
  return id;
}
