import { useUIStore, Toast } from '../store/uiStore';

const useToast = () => {
  const { toasts, addToast, dismissToast } = useUIStore();

  return {
    toasts,
    toast: addToast,
    dismiss: dismissToast,
  };
};

// Imperative toast function
const toast = (props: Omit<Toast, 'id'>) => {
  useUIStore.getState().addToast(props);
};

export { useToast, toast };
