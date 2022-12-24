export const patchStyle = (el, prev, next = null) => {
  if (!next) {
    //说明新的节点上没有样式
    return el.removeAttribute("style");
  }
  const style = el.style; //稍后更新style属性
  //新增的
  for (const key in next) {
    style[key] = next[key];
  }

  //老的有新的没有
  for (const key in prev) {
    //新的上面不存在
    if (next[key] == null) {
      style[key] == null;
    }
  }
};
