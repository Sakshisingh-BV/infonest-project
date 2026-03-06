import { useEffect, useRef } from 'react';

export function useOutsideClick(ref, callback) {
  useEffect(() => {
    const handler = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      callback(event);
    };

    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);

    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [ref, callback]);
}

export default useOutsideClick;

