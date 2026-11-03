import { useState } from 'react';
export function useSavedState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try { const stored = JSON.parse(localStorage.getItem(`os-study-v1:${key}`)); return stored ?? initialValue; }
    catch { return initialValue; }
  });
  function update(next) {
    setValue(current => {
      const result = typeof next === 'function' ? next(current) : next;
      try { localStorage.setItem(`os-study-v1:${key}`, JSON.stringify(result)); } catch { /* Reading remains usable when storage is disabled. */ }
      return result;
    });
  }
  return [value, update];
}
