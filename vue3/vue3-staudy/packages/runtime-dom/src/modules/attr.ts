export const patchAttr = (el, key, value) => {
  //没有类型名 就移除
  if (value == null) {
    el.removeAttribute(key);
  } else {
    el.setAttribute(key, value);
  }
};
