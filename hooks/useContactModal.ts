import { create } from 'zustand';

type ContactModalState = {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
};

export const useContactModal = create<ContactModalState>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));
