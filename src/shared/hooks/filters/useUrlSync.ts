import {  useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';


/**
 * Serializer interface defining methods for parsing and stringify data.
 *
 * T - The type of data the serializer handles.
 *
 * {(v: string) => T} parse - A method to parse a string into the specified type.
 * {(v: T) => string} stringify - A method to convert the specified type into a string.
 */
export type Serializer<T> = {
  parse: (v: string) => T;
  stringify: (v: T) => string;
}

/**
 * Synchronizes a value with the URL query parameters using a given key and serializer.
 * The returned value updates when the URL parameter changes, and setting the value updates the URL parameter.
 *
 * {string} key - The key used to identify the value in the URL query string.
 * {T} value - The initial default value to use if the URL parameter is not present.
 * {Serializer<T>} serializer - An object to handle stringification and parsing of the value for the URL.
 * {[T, (v: T) => void]} A tuple containing the current value and a setter function to update it.
 */
export function useUrlSync<T>(
  key: string,
  value: T,
  serializer: Serializer<T>
): [T, (v: T) => void] {
  const urlParams = useMemo(() => {
    const url = new URLSearchParams(window.location.search);
    url.set(key, serializer.stringify(value));
    return url;
  }, []);

  const [searchParams, setSearchParams] = useSearchParams(urlParams);

  const rawValue = searchParams.get(key);

  const currentValue = useMemo(() => {
    if (!rawValue) return value;
    return serializer.parse(rawValue);
  }, [rawValue]);

  const setSelectedValue = (newValue: T) => {
    const next = new URLSearchParams(searchParams);
    const rawValue = serializer.stringify(newValue);

    if (rawValue === '' || newValue === value) {
      next.delete(key);
    } else {
      next.set(key, rawValue);
    }

    setSearchParams(next, { replace: true });
  };

  return [currentValue, setSelectedValue];
}