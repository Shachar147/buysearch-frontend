/**
 * Utility to combine class names from string or array, filtering falsy values.
 *
 * @example
 *   <div className={getClasses(['my-component', isActive && 'active'])} />
 */
export default function getClasses(
  classes: string | (string | false | null | undefined)[]
): string {
  if (typeof classes === 'string') return classes;
  return classes.filter(Boolean).join(' ');
} 