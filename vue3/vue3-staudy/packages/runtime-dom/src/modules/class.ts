export const patchClass = (el, value) => {
  //没有类型名 就移除
  if (value == null) {
    el.removeAttribute("class");
  } else {
    el.className = value;
  }
};
