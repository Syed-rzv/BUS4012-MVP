/**
 * Simple class-name merging utility.
 * Filters out falsy values and joins the rest into a single string.
 *
 * @param  {...any} classes - Class values (strings, falsy values, arrays)
 * @returns {string} Merged class string
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
