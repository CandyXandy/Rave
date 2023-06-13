/**
 * Omit keys from an object.
 *
 * @template {Record<string, unknown>} T
 * @template {keyof T} K
 * @param {T} obj The source object.
 * @param {K[]} keys The keys to omit from the source object.
 * @returns {Omit<T, K>} A new object, with keys omitted.
 */
const omit = (obj, ...keys) =>
  Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keys.includes(key))
  );

export default omit;
