"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

const ToastContext = createContext<(message: string) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setMessage(msg);
    setShow(true);
    timeoutRef.current = setTimeout(() => setShow(false), 1800);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div
        className={`fixed bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-ink px-[18px] py-2.5 font-mono text-xs font-semibold text-blueprint-deep transition-opacity duration-250 z-100 ${
          show ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {message}
      </div>
    </ToastContext.Provider>
  );
}
