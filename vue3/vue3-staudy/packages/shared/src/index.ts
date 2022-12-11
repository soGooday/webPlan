export function isObject(value) {
  return value !== null && typeof value === "object";
}

export function isFunticon(value) {
  return typeof value === "function";
}
