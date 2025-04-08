import { create } from 'zustand';
import { ReactNode } from 'react';

interface ModalOptions {
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface ModalState {
  isOpen: boolean;
  content: ReactNode | null;
  options: ModalOptions;
  
  // Actions
  showModal: (content: ReactNode, options?: ModalOptions) => void;
  hideModal: () => void;
  confirmModal: () => void;
}

export const useModalStore = create<ModalState>((set, get) => ({
  isOpen: false,
  content: null,
  options: {},
  
  showModal: (content, options = {}) => 
    set({
      isOpen: true,
      content,
      options
    }),
  
  hideModal: () => 
    set({
      isOpen: false,
      content: null
    }),
  
  confirmModal: () => {
    const { options, hideModal } = get();
    if (options.onConfirm) {
      options.onConfirm();
    }
    hideModal();
  },
})); 