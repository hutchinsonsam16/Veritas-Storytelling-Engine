import { create } from 'zustand';

export type Toast = {
  id: string;
  title?: string;
  description?: string;
  variant: 'default' | 'destructive';
};

interface UIState {
  isLeftPanelCollapsed: boolean;
  isRightPanelCollapsed: boolean;
  isSettingsOpen: boolean;
  toasts: Toast[];

  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setIsSettingsOpen: (isOpen: boolean) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  isLeftPanelCollapsed: false,
  isRightPanelCollapsed: false,
  isSettingsOpen: false,
  toasts: [],

  toggleLeftPanel: () => set(state => ({ isLeftPanelCollapsed: !state.isLeftPanelCollapsed })),
  toggleRightPanel: () => set(state => ({ isRightPanelCollapsed: !state.isRightPanelCollapsed })),
  setIsSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
  
  addToast: (toast) => {
    const id = Date.now().toString();
    set(state => ({ toasts: [...state.toasts, { ...toast, id }] }));

    setTimeout(() => {
        get().dismissToast(id);
    }, 5000);
  },

  dismissToast: (id) => {
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  },
}));