import { useState } from "react";

export function useExample(initialValue = 0) {
  const [value, setValue] = useState(initialValue);

  const increment = () => setValue((current) => current + 1);

  return { value, increment };
}
