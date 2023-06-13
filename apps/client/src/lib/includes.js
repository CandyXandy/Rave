/**
 * A primitive type.
 *
 * @typedef {string | number | bigint | boolean | null | undefined | symbol} Primitive
 */

/**
 * Check whether an object contains another.
 *
 * @param {Record<string, Primitive | Primitive[]>} a The object to check in.
 * @param {Record<string, Primitive | Primitive[]>} b The object to check for.
 * @returns {boolean} Whether {@link a} contains {@link b}.
 */
const includes = (a, b) =>
  Object.keys(b).every((key) =>
    Array.isArray(b[key])
      ? Array.isArray(a[key]) &&
        b[key].length === a[key].length &&
        b[key].every((e, i) => e === a[key][i])
      : b[key] === a[key]
  );

export default includes;
