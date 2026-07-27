import { useState } from 'react';

/**
 * Controlled/uncontrolled selection, mirroring React input conventions:
 * pass `selectedIndex` (+ `onSelectionChange`) to control it, or omit it
 * and the chart manages selection internally.
 */
export function useSelection(
  controlled: number | null | undefined,
  onChange?: (index: number | null) => void
): [number | null, (index: number | null) => void] {
  const [internal, setInternal] = useState<number | null>(null);
  const value = controlled !== undefined ? controlled : internal;
  const set = (index: number | null) => {
    if (controlled === undefined) {
      setInternal(index);
    }
    onChange?.(index);
  };
  return [value, set];
}
