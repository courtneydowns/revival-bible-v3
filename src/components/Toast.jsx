import { useEffect, useRef } from 'react';
import { useRevivalStore } from '../store.js';

export default function Toast() {
  const toastMessage = useRevivalStore((state) => state.toastMessage);
  const toastId = useRevivalStore((state) => state.toastId);
  const clearToast = useRevivalStore((state) => state.clearToast);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!toastMessage) return undefined;

    timerRef.current = window.setTimeout(() => {
      clearToast();
      timerRef.current = null;
    }, 3200);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [clearToast, toastId, toastMessage]);

  if (!toastMessage) return null;

  return (
    <div className="toast-layer" aria-live="polite">
      <div className="toast" key={toastId} role="status">{toastMessage}</div>
    </div>
  );
}
