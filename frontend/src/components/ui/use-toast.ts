import { useState, useEffect } from 'react';

export type ToastProps = {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
};

type ToastOptions = Omit<ToastProps, 'id'>;

let listeners: ((toasts: ToastProps[]) => void)[] = [];
let memoryState: ToastProps[] = [];

function emitChange() {
  for (const listener of listeners) {
    listener(memoryState);
  }
}

export const toast = (options: ToastOptions) => {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast = { ...options, id };
  memoryState = [...memoryState, newToast];
  emitChange();

  setTimeout(() => {
    memoryState = memoryState.filter((t) => t.id !== id);
    emitChange();
  }, 3000);
};

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>(memoryState);

  useEffect(() => {
    listeners.push(setToasts);
    return () => {
      listeners = listeners.filter((l) => l !== setToasts);
    };
  }, []);

  return { toast, toasts };
}
