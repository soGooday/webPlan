//元素增删改查 查找关系 文本增删改查
export const nodeOps = {
  createElement(tagName) {
    console.log("tagName:", tagName);
    return document.createElement(tagName);
  },
  //移动性的
  // a b c d => a c b d
  insert(child, parent, anchor) {
    parent.insertBefore(child, anchor || null); //默认是 parent.appendChild(child)
  },
  remove(child) {
    const parent = child.parentNode;
    if (parent as Document) {
      parent.removeChild(child);
    }
  },
  querySelector(selector) {
    return document.querySelector(selector);
  },
  //父节点
  parentNode(node) {
    return node.parentNode;
  },
  //兄弟节点
  nextSibling(node) {
    return node.nextSibling;
  },
  setElementText(el, text) {
    el.textContent = text;
  },
  createText(text) {
    return document.createTextNode(text);
  },
  setText(node, text) {
    node.nodeValue = text;
  },
};
