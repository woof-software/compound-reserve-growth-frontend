/**
 * A utility type that constructs a new type by extracting only those properties of an object
 * whose keys are of type `string`. It omits any properties with keys that are not strings, such as symbols or numbers.
 *
 * @template T The object type from which string-keyed properties are extracted.
 */
export type OnlyStringKeys<T extends object> = {
  [K in Extract<keyof T, string>]: T[K];
};

/**
 * Represents a transformation function that converts an input of type T into an output of type R.
 *
 * The Transformer type is defined as a generic function type, where:
 * - T is the type of the input item passed to the function.
 * - R is the type of the result returned by the function after transformation.
 *
 * This utility type can be used to describe functions that map or transform data
 * from one type or structure to another.
 *
 * @template T The type of the input item to be transformed.
 * @template R The type of the result produced by the transformation.
 */
export type Transformer<T, R> = (item: T) => R;
