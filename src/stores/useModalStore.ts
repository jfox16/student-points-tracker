import { create } from 'zustand';
import { ReactNode } from 'react';

interface ModalState {
  // State
  isOpen: boolean;
  title: string;
  content: ReactNode | null;
  onConfirm: (() => void) | null;
  onCancel: (() => void) | null;
  confirmText: string;
  cancelText: string;
  hideCancel: boolean;

  // Actions
  openModal: (options: {
    title: string;
    content: ReactNode;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    hideCancel?: boolean;
  }) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  // Initial state
  isOpen: false,
  title: '',
  content: null,
  onConfirm: null,
  onCancel: null,
  confirmText: 'OK',
  cancelText: 'Cancel',
  hideCancel: false,

  // Actions
  openModal: ({ 
    title, 
    content, 
    onConfirm = null, 
    onCancel = null,
    confirmText = 'OK',
    cancelText = 'Cancel',
    hideCancel = false
  }) => set({
    isOpen: true,
    title,
    content,
    onConfirm,
    onCancel,
    confirmText,
    cancelText,
    hideCancel
  }),

  closeModal: () => set({
    isOpen: false,
    title: '',
    content: null,
    onConfirm: null,
    onCancel: null,
    confirmText: 'OK',
    cancelText: 'Cancel',
    hideCancel: false
  }),
})); 