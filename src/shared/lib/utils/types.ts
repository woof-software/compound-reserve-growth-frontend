/**
 * A utility type that constructs a new type by extracting only those properties of an object
 * whose keys are of type `string`. It omits any properties with keys that are not strings, such as symbols or numbers.
 *
 * @template T The object type from which string-keyed properties are extracted.
 */
export type OnlyStringKeys<T extends object> = {
  [K in Extract<keyof T, string>]: T[K];
};
