import React, { createContext, useCallback, useContext, useRef, useState } from "react";

import { Toast, ToastType } from "@/components/Toast";

interface ToastItem {
  id:      number;
  type:    ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items,   setItems]   = useState<ToastItem[]>([]);
  const counter               = useRef(0);
  const timers                = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    const t = timers.current.get(id);
    if (t) { clearTimeout(t); timers.current.delete(id); }
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = ++counter.current;
    setItems(prev => [...prev.slice(-2), { id, type, message }]);
    const timer = setTimeout(() => dismiss(id), 3500);
    timers.current.set(id, timer);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {items.map(item => (
        <Toast
          key={item.id}
          {...item}
          onDismiss={() => dismiss(item.id)}
        />
      ))}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}
