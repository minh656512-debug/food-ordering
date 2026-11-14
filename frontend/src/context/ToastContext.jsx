import React, { createContext, useCallback, useMemo, useRef, useState } from 'react';
import Toast from '../components/common/Toast';

export const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const close = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const show = useCallback((message, type = 'info') => {
    const id = nextId.current++;
    setToasts((list) => [...list, { id, message, type }]);
    setTimeout(() => close(id), 3500);
  }, [close]);

  const api = useMemo(() => ({
    success: (m) => show(m, 'success'),
    error: (m) => show(m, 'error'),
    info: (m) => show(m, 'info'),
  }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Toast toasts={toasts} onClose={close} />
    </ToastContext.Provider>
  );
}
