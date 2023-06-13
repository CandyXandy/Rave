import omit from "./omit";

/**
 * Omit null keys from an object.
 *
 * @template {Record<string, unknown>} T
 * @param {T} obj The source object.
 * @returns {T} A new object, with null keys omitted.
 */
const omitNull = (obj) =>
  omit(obj, ...Object.keys(obj).filter((key) => obj[key] === null));

export default omitNull;
