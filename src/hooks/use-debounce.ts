import { useState, useEffect } from "react"

/**
 * Debounces a value by the specified delay.
 * Returns the debounced value that only updates after the delay has passed
 * since the last change.
 *
 * Usage:
 *   const [search, setSearch] = useState("")
 *   const debouncedSearch = useDebounce(search, 300)
 *   // Use debouncedSearch in your useCallback dependencies
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
