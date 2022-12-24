export function isObject(value) {
  return value !== null && typeof value === "object";
}
export function isFunticon(value) {
  return typeof value === "function";
}
export function isString(value) {
  return typeof value === "string";
}
export const isArray = Array.isArray;

export * from "./shapeFlags";
