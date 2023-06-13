/**
 * Abbreviate a string.
 *
 * @param {string} string The string to abbreviate.
 * @returns {string} An abbreviated string.
 */
const abbreviate = (string) =>
  string.match(/(?<=^|\s)[^\d]|\d+/g)?.join("") ?? "";

export default abbreviate;
