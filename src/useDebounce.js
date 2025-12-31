import React, { useState, useEffect } from "react";

export default function   useDebounce(initialValue, delay) {
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (debouncedValue !== value) {
        setDebouncedValue(value);
      }
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return [debouncedValue, value, setValue];
}
