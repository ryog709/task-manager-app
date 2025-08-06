import { useEffect, useRef } from 'react';

export const useKeyboard = (callbacks = {}) => {
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key, ctrlKey, metaKey, shiftKey, altKey } = event;
      const modifierKey = ctrlKey || metaKey;

      const keyCombo = [
        modifierKey && 'cmd',
        ctrlKey && 'ctrl',
        altKey && 'alt',
        shiftKey && 'shift',
        key.toLowerCase(),
      ]
        .filter(Boolean)
        .join('+');

      // Check for exact matches first
      if (callbacksRef.current[keyCombo]) {
        event.preventDefault();
        callbacksRef.current[keyCombo](event);
        return;
      }

      // Check for single key matches
      if (callbacksRef.current[key.toLowerCase()]) {
        callbacksRef.current[key.toLowerCase()](event);
      }

      // Check for key combinations
      if (callbacksRef.current.onKeyDown) {
        callbacksRef.current.onKeyDown(event);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
};

export const useEscapeKey = (callback) => {
  useKeyboard({
    escape: callback,
  });
};

export const useEnterKey = (callback) => {
  useKeyboard({
    enter: callback,
  });
};
